

import { randomUUID } from 'crypto'
import { Router, Request, Response } from 'express'
import { validate } from '../middleware/validate.middleware'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { aiSecurityMiddleware } from '../middleware/aiSecurity.middleware'
import { requireConsent } from '../middleware/consent.middleware'
import { agentRateLimit } from '../middleware/rateLimit.middleware'
import { auditLog } from '../middleware/audit.middleware'
import { agentMessageSchema } from '../lib/schemas'
import {
  sendMessage,
  BackboardTimeoutError,
  BackboardRateLimitError,
  BackboardError,
  BackboardCircuitOpenError,
} from '../services/backboard.service'
import { buildContextForAgent, saveMessage, extractFactsFromReply, tryConsumeToken, getMemorySnapshot } from '../services/context.service'
import { enqueueMemoryUpdate } from '../queues/memory.queue'
import { checkDistress } from '../services/distress.service'
import { logUsageEvent, agentToEnum, defaultChatCategory } from '../services/usage.service'
import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { AgentName } from '../lib/backboard'
import logger from '../utils/logger'

const router: Router = Router()
const VALID_AGENTS: AgentName[] = ['vera', 'grant', 'atlas']
const IDEMPOTENCY_TTL_SEC = 60 // frontend retry window we protect against

const DAILY_QUOTA = 50
const quotaKey = (userId: string) => `quota:agent:${userId}:${new Date().toISOString().slice(0, 10)}`

async function checkDailyQuota(userId: string): Promise<{ allowed: boolean; used: number }> {
  const key = quotaKey(userId)
  const used = await redis.incr(key)
  if (used === 1) {
    await redis.expire(key, 86_400) // only set TTL on first hit of the day
  }
  return { allowed: used <= DAILY_QUOTA, used }
}

router.post(
  '/:agentType/message',
  authMiddleware,
  validate(agentMessageSchema),
  aiSecurityMiddleware,
  requireConsent(['conversationStorage']),
  agentRateLimit,
  async (req: Request, res: Response) => {
    const { agentType } = req.params
    const { user, requestId } = req as AuthenticatedRequest & { requestId?: string }
    const { message, sessionId: incomingSessionId } = req.body

    if (!VALID_AGENTS.includes(agentType as AgentName)) {
      res.status(404).json({ error: `Unknown agent '${agentType}'` })
      return
    }
    const agent = agentType as AgentName
    const sessionId: string = incomingSessionId ?? randomUUID()

    const idempotencyKey = req.header('Idempotency-Key')
    if (idempotencyKey) {
      const cached = await redis.get(`idempotency:${idempotencyKey}`)
      if (cached) {
        res.status(200).json(JSON.parse(cached))
        return
      }
    }

    const quota = await checkDailyQuota(user.id)
    if (!quota.allowed) {
      res.status(429).json({
        error: `Daily message limit reached (${DAILY_QUOTA}/day). Resets at midnight.`,
        used: quota.used,
        limit: DAILY_QUOTA,
      })
      return
    }

    try {
      const distress = await checkDistress(user.id, agent, message)
      await saveMessage({ userId: user.id, agentType: agent, role: 'user', content: message, sessionId })

      const context = await buildContextForAgent(user.id, agent)
      if (distress.category !== 'none') context.emotionalSignal = distress.category

      const startedAt = Date.now()
      const { reply, raw } = await sendMessage({ agent, userId: user.id, message, context })
      const responseTimeMs = Date.now() - startedAt

      await saveMessage({ userId: user.id, agentType: agent, role: 'assistant', content: reply, sessionId })

      auditLog('agent_call', user.id, requestId, req.ip, { agent }).catch(() => {})

      logUsageEvent({
        userId: user.id,
        email: user.email,
        eventType: 'AI_CHAT',
        agent: agentToEnum(agent),
        chatCategory: defaultChatCategory(agent),
        sessionId,
        tokensUsed: (raw as { tokensUsed?: number })?.tokensUsed,
        responseTimeMs,
      }).catch(() => {})

      const newFacts = extractFactsFromReply(raw)
      if (Object.keys(newFacts).length > 0 && tryConsumeToken(user.id)) {
        enqueueMemoryUpdate({
          userId: user.id,
          facts: newFacts,
          factStrings: Object.values(newFacts).map(String),
        }).catch(() => {})
      }

      const responseBody = {
        reply,
        sessionId,
        ...(distress.resource ? { crisisResource: distress.resource } : {}),
      }

      if (idempotencyKey) {
        await redis.set(`idempotency:${idempotencyKey}`, JSON.stringify(responseBody), 'EX', IDEMPOTENCY_TTL_SEC)
      }

      res.status(200).json(responseBody)
    } catch (err) {
      if (err instanceof BackboardCircuitOpenError) {
        const retryAfterSeconds = Math.ceil((err.retryAt.getTime() - Date.now()) / 1000)
        res.set('Retry-After', String(Math.max(retryAfterSeconds, 1)))
        res.status(503).json({ error: 'Advisor is temporarily unavailable. Please try again shortly.' })
        return
      }
      if (err instanceof BackboardTimeoutError) {
        res.status(504).json({ error: 'The advisor took too long to respond. Please try again.' })
        return
      }
      if (err instanceof BackboardRateLimitError) {
        res.status(503).json({ error: 'Advisor is temporarily busy. Please try again in a moment.' })
        return
      }
      if (err instanceof BackboardError) {
        logger.error('Backboard error', { agent, status: err.status, message: err.message })
        res.status(502).json({ error: 'Advisor is temporarily unavailable.' })
        return
      }
      throw err
    }
  }
)

router.get('/memory', authMiddleware, async (req: Request, res: Response) => {
  const { id: userId } = (req as AuthenticatedRequest).user
  try {
    const facts = await getMemorySnapshot(userId)
    res.status(200).json({ facts })
  } catch (err) {
    logger.error('Failed to get memory snapshot', { userId, message: (err as Error).message })
    res.status(550).json({ error: 'Failed to fetch memory snapshot' })
  }
})

router.get('/:agentType/history', authMiddleware, async (req: Request, res: Response) => {
  const { agentType } = req.params
  const { user } = req as AuthenticatedRequest

  if (!VALID_AGENTS.includes(agentType as AgentName)) {
    res.status(404).json({ error: `Unknown agent '${agentType}'` })
    return
  }

  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Number(req.query.limit) || 20, 100)

  try {
    const [total, messages] = await Promise.all([
      prisma.conversation.count({ where: { userId: user.id, agentType: agentType as string } }),
      prisma.conversation.findMany({
        where: { userId: user.id, agentType: agentType as string },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.status(200).json({
      data: messages.reverse(),
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    })
  } catch (err) {
    logger.error('Failed to load conversation history', { userId: user.id, agentType, message: (err as Error).message })
    res.status(500).json({ error: 'Failed to load history' })
  }
})

export default router