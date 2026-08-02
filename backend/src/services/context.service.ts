

import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import logger from '../utils/logger'
import { AgentName } from '../lib/backboard'
import { findMatchingScholarships } from './scholarship.service'

const HISTORY_LIMIT = 20 // per-agent messages pulled into context; keeps


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

//IN-MEMORY FACT CACHE

const factCache = new Map<string, Set<string>>()
const MAX_CACHED_FACTS = 50

export function addFactsToCache(userId: string, facts: string[]): string[] {
  const set = factCache.get(userId) ?? new Set<string>()
  for (const f of facts) {
    const clean = f.trim().toLowerCase()
    if (clean) set.add(clean)
  }
  // cap size so one chatty user can't grow this map forever
  const capped = Array.from(set).slice(-MAX_CACHED_FACTS)
  const cappedSet = new Set(capped)
  factCache.set(userId, cappedSet)
  return Array.from(cappedSet)
}

export function getCachedFacts(userId: string): string[] {
  return Array.from(factCache.get(userId) ?? [])
}



interface Bucket {
  tokens: number
  lastRefill: number
}
const buckets = new Map<string, Bucket>()
const BUCKET_CAPACITY = 20
const REFILL_PER_SEC = 1

export function tryConsumeToken(userId: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(userId) ?? { tokens: BUCKET_CAPACITY, lastRefill: now }

  const elapsedSec = (now - bucket.lastRefill) / 1000
  bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + elapsedSec * REFILL_PER_SEC)
  bucket.lastRefill = now

  if (bucket.tokens < 1) {
    buckets.set(userId, bucket)
    return false
  }
  bucket.tokens -= 1
  buckets.set(userId, bucket)
  return true
}

export function extractFactsFromReply(raw: unknown): Record<string, unknown> {
  if (
    raw &&
    typeof raw === 'object' &&
    'extractedFacts' in raw &&
    typeof (raw as { extractedFacts: unknown }).extractedFacts === 'object' &&
    (raw as { extractedFacts: unknown }).extractedFacts !== null
  ) {
    return (raw as { extractedFacts: Record<string, unknown> }).extractedFacts
  }
  return {}
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
        structuredFacts: merged as Prisma.InputJsonValue,
        version: 1,
      },
      update: {
        structuredFacts: merged as Prisma.InputJsonValue,
        version: { increment: 1 },
        lastUpdated: new Date(),
      },
    })
  }, 'updateMemorySnapshot')
}