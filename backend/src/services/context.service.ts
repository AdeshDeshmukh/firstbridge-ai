import { prisma } from '../lib/prisma'
import logger from '../utils/logger'
import { AgentName } from '../lib/backboard'
import { findMatchingScholarships } from './scholarship.service'

const HISTORY_LIMIT = 20 // per-agent messages pulled into context


export async function getMemorySnapshot(userId: string): Promise<Record<string, unknown>> {
  const snapshot = await prisma.memorySnapshot.findUnique({
    where: { userId },
    select: { structuredFacts: true },
  })
  return (snapshot?.structuredFacts as Record<string, unknown>) ?? {}
}

export async function getRecentHistory(userId: string, limit = HISTORY_LIMIT) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      agentType: true,
      role: true,
      content: true,
      createdAt: true,
    },
  })
}

export async function buildContextForAgent(userId: string, agent: AgentName) {
  const [memory, history] = await Promise.all([
    getMemorySnapshot(userId),
    getRecentHistory(userId),
  ])

  const context: Record<string, unknown> = {
    memory,
    // Oldest-first is easier for an LLM to read as a timeline
    history: history.reverse(),
  }

  if (agent === 'grant') {
    try {
      context.matchingScholarships = await findMatchingScholarships(userId)
    } catch (err) {
      logger.warn('Failed to fetch matching scholarships for Grant context', {
        userId,
        message: (err as Error).message,
      })
      context.matchingScholarships = []
    }
  }

  return context
}


async function withOneRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    logger.warn(`${label} failed once, retrying`, { message: (err as Error).message })
    try {
      return await fn()
    } catch (err2) {
      logger.error(`${label} failed after retry — data may be lost`, {
        message: (err2 as Error).message,
      })
      return null
    }
  }
}

export async function saveMessage(params: {
  userId: string
  agentType: AgentName
  role: 'user' | 'assistant'
  content: string
  sessionId?: string
}): Promise<void> {
  await withOneRetry(
    () =>
      prisma.conversation.create({
        data: {
          userId: params.userId,
          agentType: params.agentType,
          role: params.role,
          content: params.content,
          sessionId: params.sessionId,
        },
      }),
    'saveMessage'
  )
}

export async function updateMemorySnapshot(
  userId: string,
  newFacts: Record<string, unknown>
): Promise<void> {
  await withOneRetry(async () => {
    const existing = await prisma.memorySnapshot.findUnique({ where: { userId } })
    const merged = { ...(existing?.structuredFacts as object ?? {}), ...newFacts }

    return prisma.memorySnapshot.upsert({
      where: { userId },
      create: {
        userId,
        structuredFacts: merged,
        version: 1,
      },
      update: {
        structuredFacts: merged,
        version: { increment: 1 },
        lastUpdated: new Date(),
      },
    })
  }, 'updateMemorySnapshot')
}