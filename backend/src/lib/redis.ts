import Redis from 'ioredis'
import logger from '../utils/logger'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      logger.error('Redis connection failed after 3 retries')
      return null 
    }
    return Math.min(times * 200, 1000) 
  },
  lazyConnect: true,
})

redis.on('connect', () => {
  logger.info('Redis connected')
})

redis.on('error', (err) => {
  logger.error('Redis error', { message: err.message })
})

export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}