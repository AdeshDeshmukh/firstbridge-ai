

import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null })

export interface MemoryJobData {
  userId: string
  facts: Record<string, unknown>
  factStrings: string[]
}

export const memoryQueue = new Queue<MemoryJobData>('memory-extraction', { connection })

export async function enqueueMemoryUpdate(data: MemoryJobData): Promise<void> {
  await memoryQueue.add('extract', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 500 },
    // Same userId reuses the same jobId

    jobId: `memory-${data.userId}`,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }, // keep failures around longer for debugging
  })
}