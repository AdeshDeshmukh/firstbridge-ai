
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import logger from '../utils/logger'
import { updateMemorySnapshot, addFactsToCache, getCachedFacts } from '../services/context.service'
import { MemoryJobData } from '../queues/memory.queue'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null })

export const memoryWorker = new Worker<MemoryJobData>(
  'memory-extraction',
  async (job) => {
    const { userId, facts, factStrings } = job.data
    logger.info('Processing memory job', { jobId: job.id, userId })

    if (Object.keys(facts).length > 0) {
      await updateMemorySnapshot(userId, facts)
    }

    // Skip re-adding facts already cached
    const existing = new Set(getCachedFacts(userId))
    const newOnes = factStrings.filter((f) => !existing.has(f.trim().toLowerCase()))
    if (newOnes.length > 0) {
      addFactsToCache(userId, newOnes)
    }

    logger.info('Memory job completed', { jobId: job.id, userId })
  },
  { connection, concurrency: 5 }
)

memoryWorker.on('completed', (job) => {
  logger.info('Memory job succeeded', { jobId: job.id })
})

memoryWorker.on('failed', (job, err) => {
  logger.error('Memory extraction job failed', { jobId: job?.id, message: err.message })
})

// Graceful shutdown

async function shutdown() {
  logger.info('Memory worker shutting down...')
  await memoryWorker.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)