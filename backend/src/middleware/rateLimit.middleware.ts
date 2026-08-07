import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import type { RedisReply } from 'rate-limit-redis'
import { redis } from '../lib/redis'

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Key by user ID if authenticated, fall back to IP
    const userId = (req as { user?: { id: string } }).user?.id
    return userId || req.ip || 'unknown'
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args as [string, ...string[]]) as Promise<RedisReply>,
  }),
  message: {
    error: 'Too many requests',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 2. Agent routes — 10 requests per minute per user

export const agentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const userId = (req as { user?: { id: string } }).user?.id
    return `agent:${userId || req.ip}`
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args as [string, ...string[]]) as Promise<RedisReply>,
  }),
  message: {
    error: 'Agent rate limit exceeded. Please wait before sending another message.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => {
    const userId = (req as { user?: { id: string } }).user?.id
    return `upload:${userId || req.ip}`
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args as [string, ...string[]]) as Promise<RedisReply>,
  }),
  message: {
    error: 'Upload limit reached. Maximum 5 uploads per hour.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
})