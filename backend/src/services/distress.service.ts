// backend/src/services/distress.service.ts
// A safety/emotion scanner on the user's raw message. Crisis language still
// gets logged + a hotline resource. Everything else just tags a category so
// the agent can reply more empathetically — no logging, no DB write, just
// a hint passed into context.

import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import logger from '../utils/logger'
import { AgentName } from '../lib/backboard'

export type EmotionalCategory =
  | 'crisis'
  | 'placement_stress'
  | 'interview_anxiety'
  | 'demotivation'
  | 'scholarship_stress'
  | 'career_confusion'
  | 'encouragement_needed'
  | 'none'

export type DistressSeverity = 'none' | 'low' | 'high'

export interface DistressCheckResult {
  category: EmotionalCategory
  severity: DistressSeverity
  resource: CrisisResource | null
}

export interface CrisisResource {
  name: string
  contact: string
  description: string
}

// Crisis patterns — highest priority, always checked first
const HIGH_SEVERITY_PATTERNS = [
  /\b(kill|hurt)\s+myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bend\s+(my|it all)\b/i,
]
const LOW_SEVERITY_PATTERNS = [
  /\bcan'?t\s+(take|handle|cope)\s+(it|this)\s+anymore\b/i,
  /\bfeel(ing)?\s+hopeless\b/i,
  /\bgiving\s+up\s+on\s+everything\b/i,
]

// Everyday student stress — not crisis, just tone hints for the agent
const CATEGORY_PATTERNS: Record<Exclude<EmotionalCategory, 'crisis' | 'none'>, RegExp[]> = {
  placement_stress: [/\bplacement/i, /\bno\s+offers?\b/i, /\brejected\s+again\b/i],
  interview_anxiety: [/\binterview.*(nervous|scared|anxious)/i, /\bnervous.*interview/i],
  demotivation: [/\bnot\s+motivated\b/i, /\bfeel(ing)?\s+stuck\b/i, /\bwhat'?s\s+the\s+point\b/i],
  scholarship_stress: [/\bdeadline.*scholarship/i, /\bscholarship.*deadline/i, /\bcan'?t\s+afford\b/i],
  career_confusion: [/\bdon'?t\s+know\s+what\s+to\s+do\b/i, /\bconfused\s+about\s+my\s+career\b/i, /\bwhich\s+path\b/i],
  encouragement_needed: [/\bi\s+feel\s+like\s+a\s+failure\b/i, /\bnot\s+good\s+enough\b/i],
}

const CRISIS_RESOURCE: CrisisResource = {
  name: '988 Suicide & Crisis Lifeline',
  contact: 'Call or text 988',
  description: 'Free, confidential support available 24/7 in the US.',
}

function hashMessage(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex')
}

function detect(message: string): { category: EmotionalCategory; severity: DistressSeverity } {
  if (HIGH_SEVERITY_PATTERNS.some((p) => p.test(message))) {
    return { category: 'crisis', severity: 'high' }
  }
  if (LOW_SEVERITY_PATTERNS.some((p) => p.test(message))) {
    return { category: 'crisis', severity: 'low' }
  }
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some((p) => p.test(message))) {
      return { category: category as EmotionalCategory, severity: 'none' }
    }
  }
  return { category: 'none', severity: 'none' }
}

export async function checkDistress(
  userId: string,
  agentType: AgentName,
  message: string
): Promise<DistressCheckResult> {
  const { category, severity } = detect(message)

  // Only crisis-tier gets logged to DistressSignal + a hotline resource.
  // Everyday stress categories are just a tone hint, no DB write needed.
  if (severity === 'none') {
    return { category, severity, resource: null }
  }

  try {
    await prisma.distressSignal.create({
      data: { userId, messageHash: hashMessage(message), severity, agentType, resourceShown: true },
    })
  } catch (err) {
    logger.error('Failed to log distress signal — continuing anyway', {
      userId,
      message: (err as Error).message,
    })
  }

  logger.warn('Crisis pattern detected', { userId, agentType, severity })
  return { category, severity, resource: CRISIS_RESOURCE }
}