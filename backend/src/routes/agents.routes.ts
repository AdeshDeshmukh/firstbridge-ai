import { Router, Request, Response } from 'express'
import { validate } from '../middleware/validate.middleware'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { aiSecurityMiddleware } from '../middleware/aiSecurity.middleware'
import { consentMiddleware } from '../middleware/consent.middleware'
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
import { buildContextForAgent, saveMessage } from '../services/context.service'
import { AgentName } from '../lib/backboard'
import logger from '../utils/logger'

const router = Router()
const VALID_AGENTS: AgentName[] = ['vera', 'grant', 'atlas']

router.post(
  '/:agentType/message',
  authMiddleware,
  validate(agentMessageSchema),
  aiSecurityMiddleware,
  consentMiddleware,
  agentRateLimit,
  async (req: Request, res: Response) => {
    const { agentType } = req.params
    const { user, requestId } = req as AuthenticatedRequest & { requestId?: string }
    const { message } = req.body

    if (!VALID_AGENTS.includes(agentType as AgentName)) {
      res.status(404).json({ error: `Unknown agent '${agentType}'` })
      return
    }
    const agent = agentType as AgentName

    try {

      await saveMessage({ userId: user.id, agentType: agent, role: 'user', content: message })

      const context = await buildContextForAgent(user.id, agent)

      // 3. Call Backboard. Timeout + retry handled inside the service;
      const { reply } = await sendMessage({ agent, userId: user.id, message, context })

      // 4. Persist the assistant's reply so the next call (by this agen
      await saveMessage({ userId: user.id, agentType: agent, role: 'assistant', content: reply })

      auditLog('agent_call', user.id, requestId, req.ip, { agent }).catch(() => {})

      res.status(200).json({ reply })
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

export default router