

import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import logger from '../utils/logger'
import { getMemorySnapshot } from './context.service'



export interface ScholarshipFilters {
  major?: string
  minAmount?: number
  maxAmount?: number
  activeOnly?: boolean
}

export interface ScholarshipMatch {
  id: string
  name: string
  organization: string
  amount: number
  deadline: Date
  url: string
}

export async function listScholarships(filters: ScholarshipFilters & { page?: number; limit?: number; sortBy?: string; order?: 'asc' | 'desc' }) {
  const where: Prisma.ScholarshipWhereInput = { isActive: filters.activeOnly ?? true }
  if (filters.major) where.majors = { has: filters.major }
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {
      ...(filters.minAmount !== undefined ? { gte: filters.minAmount } : {}),
      ...(filters.maxAmount !== undefined ? { lte: filters.maxAmount } : {}),
    }
  }

  const page = filters.page ?? 1
  const limit = Math.min(filters.limit ?? 20, 100)
  const sortField = filters.sortBy === 'amount' ? 'amount' : filters.sortBy === 'newest' ? 'createdAt' : 'deadline'
  const order = filters.order ?? 'asc'

  const [total, scholarships] = await Promise.all([
    prisma.scholarship.count({ where }),
    prisma.scholarship.findMany({
      where,
      orderBy: { [sortField]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: scholarships,
    pagination: { page, limit, total, hasNextPage: page * limit < total },
  }
}

export async function getScholarshipById(id: string) {
  return prisma.scholarship.findUnique({ where: { id } })
}

export async function getSavedScholarships(userId: string) {
  return prisma.savedScholarship.findMany({
    where: { userId },
    include: { scholarship: true },
    orderBy: { savedAt: 'desc' },
  })
}

export async function findMatchingScholarships(userId: string, limit = 5): Promise<ScholarshipMatch[]> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId }, select: { major: true } })
  const now = new Date()
  const where: Prisma.ScholarshipWhereInput = { isActive: true, deadline: { gt: now } }
  if (profile?.major) {
    where.OR = [{ majors: { has: profile.major } }, { majors: { isEmpty: true } }]
  }
  return prisma.scholarship.findMany({
    where,
    orderBy: { deadline: 'asc' },
    take: limit,
    select: { id: true, name: true, organization: true, amount: true, deadline: true, url: true },
  })
}

export async function saveScholarship(userId: string, scholarshipId: string) {
  try {
    const saved = await prisma.savedScholarship.create({ data: { userId, scholarshipId } })
    await invalidateRecommendationCache(userId)
    return saved
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
      return prisma.savedScholarship.findUnique({ where: { userId_scholarshipId: { userId, scholarshipId } } })
    }
    throw err
  }
}

export async function updateApplicationStatus(
  userId: string,
  scholarshipId: string,
  status: 'saved' | 'applied' | 'submitted'
) {
  const updated = await prisma.savedScholarship.update({
    where: { userId_scholarshipId: { userId, scholarshipId } },
    data: { applicationStatus: status },
  })
  await invalidateRecommendationCache(userId)
  return updated
}

// RECOMMENDATION ENGINE

export interface ScoredScholarship extends ScholarshipMatch {
  score: number
  reasons: string[]
}

const CACHE_TTL_SEC = 300 // 5 min — long enough to matter, short enough that saving/applying feels instant (cache is invalidated on those anyway)
const CACHE_KEY = (userId: string) => `scholarship:recs:${userId}`

async function invalidateRecommendationCache(userId: string): Promise<void> {
  await redis.del(CACHE_KEY(userId)).catch(() => {})
}


function readMemorySignals(memory: Record<string, unknown>) {
  const asString = (v: unknown) => (typeof v === 'string' ? v.toLowerCase() : '')
  return {
    financialNeed: Boolean(asString(memory.financialNeed)) || asString(memory.priority).includes('financ'),
    aiInterest: /ai|machine learning|ml\b/i.test(asString(memory.interests) || asString(memory.careerGoal)),
  }
}

function scoreScholarship(
  scholarship: { majors: string[]; amount: number; deadline: Date; eligibility: string | null; name: string; organization: string },
  profile: { major: string | null; year: number | null } | null,
  memorySignals: { financialNeed: boolean; aiInterest: boolean },
  applicationStatus: 'saved' | 'applied' | 'submitted' | undefined
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  if (profile?.major && (scholarship.majors.length === 0 || scholarship.majors.includes(profile.major))) {
    score += 40
    reasons.push(`you're a ${profile.major} student`)
  }
  if (memorySignals.financialNeed) {
    score += 25
    reasons.push('it matches your financial need')
  }
  if (memorySignals.aiInterest && /ai|machine learning|technology|stem/i.test(`${scholarship.name} ${scholarship.organization} ${scholarship.eligibility ?? ''}`)) {
    score += 20
    reasons.push('you showed interest in AI/ML')
  }
  if (profile?.year && profile.year >= 4) {
    score += 15
    reasons.push("you're in your final year")
  }
  const daysToDeadline = (scholarship.deadline.getTime() - Date.now()) / 86_400_000
  if (daysToDeadline <= 30) {
    score += 15
    reasons.push('the deadline is coming up soon')
  }
  if (applicationStatus === 'applied') score -= 30
  if (applicationStatus === 'submitted') score -= 100

  return { score, reasons }
}

export async function getRecommendations(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ data: ScoredScholarship[]; pagination: { page: number; limit: number; total: number; hasNextPage: boolean } }> {
  const cached = await redis.get(CACHE_KEY(userId)).catch(() => null)
  let scored: ScoredScholarship[]

  if (cached) {
    scored = JSON.parse(cached)
  } else {
    const [profile, memory, saved, candidates] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId }, select: { major: true, year: true } }),
      getMemorySnapshot(userId),
      prisma.savedScholarship.findMany({ where: { userId }, select: { scholarshipId: true, applicationStatus: true } }),
      prisma.scholarship.findMany({
        where: { isActive: true, deadline: { gt: new Date() } },
        take: 200, // score against a broad pool, not just first-page results
      }),
    ])

    const savedMap = new Map(saved.map((s) => [s.scholarshipId, s.applicationStatus as 'saved' | 'applied' | 'submitted']))
    const memorySignals = readMemorySignals(memory)

    scored = candidates
      // Fully submitted applications are done — don't recommend them at all
      .filter((c) => savedMap.get(c.id) !== 'submitted')
      .map((c) => {
        const { score, reasons } = scoreScholarship(c, profile, memorySignals, savedMap.get(c.id))
        return {
          id: c.id,
          name: c.name,
          organization: c.organization,
          amount: c.amount,
          deadline: c.deadline,
          url: c.url,
          score,
          reasons,
        }
      })
      .sort((a, b) => b.score - a.score)

    await redis.set(CACHE_KEY(userId), JSON.stringify(scored), 'EX', CACHE_TTL_SEC).catch(() => {})
  }

  const total = scored.length
  const start = (page - 1) * limit
  return {
    data: scored.slice(start, start + limit),
    pagination: { page, limit, total, hasNextPage: start + limit < total },
  }
}

export function buildReasonText(reasons: string[]): string {
  if (reasons.length === 0) return 'Recommended based on your profile.'
  return `Recommended because ${reasons.join(' and ')}.`
}

export async function getCachedScoreForScholarship(userId: string, scholarshipId: string): Promise<number | null> {
  const cached = await redis.get(CACHE_KEY(userId)).catch(() => null)
  if (!cached) return null
  try {
    const scored: ScoredScholarship[] = JSON.parse(cached)
    return scored.find((s) => s.id === scholarshipId)?.score ?? null
  } catch {
    return null
  }
}