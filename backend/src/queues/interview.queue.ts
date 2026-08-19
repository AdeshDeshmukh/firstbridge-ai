import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import { LandmarkFrame } from '../utils/scoring.util'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null })

export interface InterviewJobData {
  sessionId: string
  userId: string
  videoKey: string
  gazeFrames: LandmarkFrame[]
}

export const interviewQueue = new Queue<InterviewJobData>('interview-analysis', { connection })

export async function enqueueInterviewAnalysis(data: InterviewJobData): Promise<void> {
  await interviewQueue.add('analyze', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  })
}
