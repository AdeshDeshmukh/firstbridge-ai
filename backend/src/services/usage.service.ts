
import { prisma } from '../lib/prisma'
import logger from '../utils/logger'
import { UsageEventType, AgentType, ChatCategory, ScholarshipAction, Prisma } from '@prisma/client'

async function resolveUniversityId(email: string): Promise<string | null> {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  try {
    const uni = await prisma.university.findUnique({ where: { domain }, select: { id: true } })
    return uni?.id ?? null
  } catch {
    return null
  }
}

interface LogUsageParams {
  userId: string
  email: string
  eventType: UsageEventType
  agent?: AgentType
  chatCategory?: ChatCategory
  sessionId?: string
  tokensUsed?: number
  responseTimeMs?: number
  scholarshipId?: string
  scholarshipAction?: ScholarshipAction
  relevanceScore?: number
  interviewId?: string
  interviewScore?: number
  metadata?: Record<string, unknown>
}

export async function logUsageEvent(params: LogUsageParams): Promise<void> {
  try {
    const universityId = await resolveUniversityId(params.email)
    await prisma.usageEvent.create({
      data: {
        userId: params.userId,
        universityId,
        eventType: params.eventType,
        agent: params.agent,
        chatCategory: params.chatCategory,
        sessionId: params.sessionId,
        tokensUsed: params.tokensUsed,
        responseTimeMs: params.responseTimeMs,
        scholarshipId: params.scholarshipId,
        scholarshipAction: params.scholarshipAction,
        relevanceScore: params.relevanceScore,
        interviewId: params.interviewId,
        interviewScore: params.interviewScore,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    })
  } catch (err) {
    logger.error('Failed to log usage event', { userId: params.userId, message: (err as Error).message })
  }
}

export function agentToEnum(agent: 'vera' | 'grant' | 'atlas'): AgentType {
  return agent.toUpperCase() as AgentType
}

const CATEGORY_BY_AGENT: Record<'vera' | 'grant' | 'atlas', ChatCategory> = {
  vera: 'CAREER',
  grant: 'SCHOLARSHIP',
  atlas: 'INTERVIEW',
}

export function defaultChatCategory(agent: 'vera' | 'grant' | 'atlas'): ChatCategory {
  return CATEGORY_BY_AGENT[agent]
}