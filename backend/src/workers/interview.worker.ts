import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import path from 'path'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import logger from '../utils/logger'
import { prisma } from '../lib/prisma'
import { storageService } from '../services/storage.service'
import { assemblyAiService } from '../services/assemblyai.service'
import { scoringService } from '../services/scoring.service'
import { InterviewJobData } from '../queues/interview.queue'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null })

export const interviewWorker = new Worker<InterviewJobData>(
  'interview-analysis',
  async (job) => {
    const { sessionId, userId, videoKey, gazeFrames } = job.data
    logger.info(`Processing interview analysis job ${job.id} for session ${sessionId}`)

    // 1. Update session status in db to processing
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'processing' },
    })

    const tempAudioPath = path.join('/tmp', `${sessionId}.mp3`)

    try {
      // 2. Fetch presigned URL from R2
      const presignedUrl = await storageService.getPresignedUrl(videoKey)
      logger.info(`Generated presigned URL for R2 video: ${videoKey}`)

      // 3. Extract audio from video using fluent-ffmpeg
      logger.info('Extracting audio track from video...')
      await new Promise<void>((resolve, reject) => {
        ffmpeg(presignedUrl)
          .toFormat('mp3')
          .audioBitrate('128k')
          .on('start', (cmd) => logger.info(`Ffmpeg command: ${cmd}`))
          .on('end', () => {
            logger.info('Ffmpeg finished audio extraction successfully')
            resolve()
          })
          .on('error', (err) => {
            logger.error('Ffmpeg failed audio extraction:', err)
            reject(err)
          })
          .save(tempAudioPath)
      })

      // 4. Upload the extracted audio to AssemblyAI
      const uploadUrl = await assemblyAiService.uploadLocalFile(tempAudioPath)

      // 5. Submit job to AssemblyAI
      const assemblyJobId = await assemblyAiService.submitTranscription(uploadUrl)

      // 6. Poll for transcription completion
      const transcription = await assemblyAiService.pollTranscription(assemblyJobId)
      const transcriptText = transcription.text || ''
      const words = transcription.words || []

      // 7. Calculate scores and fetch Atlas feedback
      const scores = await scoringService.scoreSession(userId, gazeFrames, transcriptText, words)

      // 8. Determine engagement score (average of eye contact and head stability)
      const engagementScore = Math.round((scores.eyeContactScore + scores.headStabilityScore) / 2)

      // Determine confidence level mapping based on overall score
      let confidenceLevel = 'Medium'
      if (scores.overallScore >= 80) confidenceLevel = 'High'
      else if (scores.overallScore < 50) confidenceLevel = 'Low'

      // 9. Save scores and breakdowns to Database in transaction
      await prisma.$transaction([
        // Save overall scores
        prisma.interviewScore.upsert({
          where: { sessionId },
          update: {
            eyeContactScore: scores.eyeContactScore,
            engagementScore,
            confidenceLevel,
            fillerWordCount: scores.fillerWordCount,
            wordsPerMinute: scores.wpm,
            transcriptText,
            atlasFeedback: scores.coachingReview,
          },
          create: {
            sessionId,
            userId,
            eyeContactScore: scores.eyeContactScore,
            engagementScore,
            confidenceLevel,
            fillerWordCount: scores.fillerWordCount,
            wordsPerMinute: scores.wpm,
            transcriptText,
            atlasFeedback: scores.coachingReview,
          },
        }),

        // Save breakdowns
        prisma.scoreBreakdown.createMany({
          data: [
            {
              sessionId,
              metric: 'eye_contact',
              rawValue: scores.eyeContactScore,
              normalizedScore: scores.eyeContactScore,
              methodologyNote: 'Percentage of time student sustained eye contact within camera parameters.',
            },
            {
              sessionId,
              metric: 'head_stability',
              rawValue: scores.headStabilityScore,
              normalizedScore: scores.headStabilityScore,
              methodologyNote: 'Measures stability of head posture; scores drop if excessive motion detected.',
            },
            {
              sessionId,
              metric: 'pacing',
              rawValue: scores.wpm,
              normalizedScore: scores.pacingScore,
              methodologyNote: `Speech rate in words per minute. Current WPM: ${scores.wpm} (ideal range: 120-160 WPM).`,
            },
            {
              sessionId,
              metric: 'filler_words',
              rawValue: scores.fillerWordCount,
              normalizedScore: scores.fillerWordsScore,
              methodologyNote: `Number of filler words used. Total count: ${scores.fillerWordCount} filler words.`,
            },
          ],
        }),

        // Mark session completed
        prisma.interviewSession.update({
          where: { id: sessionId },
          data: {
            status: 'completed',
            durationSeconds: Math.round(scores.durationSeconds),
            perFrameScores: JSON.stringify(gazeFrames),
            completedAt: new Date(),
          },
        }),
      ])

      logger.info(`Successfully stored interview session scores in db for session ${sessionId}`)
    } catch (error) {
      logger.error(`Error processing interview job ${job.id} for session ${sessionId}:`, error)

      // Update status in db to failed
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: 'failed' },
      }).catch((e) => logger.error(`Failed updating session ${sessionId} status to failed:`, e))

      throw error
    } finally {
      // 10. Cleanup: Delete local audio file from disk
      if (fs.existsSync(tempAudioPath)) {
        try {
          fs.unlinkSync(tempAudioPath)
          logger.info(`Cleaned up local temporary audio file: ${tempAudioPath}`)
        } catch (e) {
          logger.error(`Failed deleting local temp audio file ${tempAudioPath}:`, e)
        }
      }

      // 11. Cleanup: Delete video from R2 to save storage costs
      try {
        await storageService.deleteFile(videoKey)
      } catch (e) {
        logger.error(`Failed deleting R2 video for key ${videoKey}:`, e)
      }
    }
  },
  { connection, concurrency: 2 }
)

interviewWorker.on('completed', (job) => {
  logger.info(`Interview job ${job.id} completed successfully`)
})

interviewWorker.on('failed', (job, err) => {
  logger.error(`Interview job ${job?.id} failed:`, err)
})
