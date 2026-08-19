import { Router, Response } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireConsent } from '../middleware/consent.middleware'
import { prisma } from '../lib/prisma'
import { storageService } from '../services/storage.service'
import { enqueueInterviewAnalysis } from '../queues/interview.queue'
import logger from '../utils/logger'

const router: Router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
})

/**
 * POST /interview/upload
 * Handles uploading the recorded video and MediaPipe frame data to trigger analysis.
 */
router.post(
  '/upload',
  authMiddleware,
  requireConsent,
  upload.single('video'),
  (async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    logger.info(`Received interview video upload request for user ${req.user.id}`)

    try {
      if (!req.file) {
        res.status(400).json({ error: 'No video file uploaded' })
        return
      }

      const { questionPrompt, gazeFrames } = req.body
      if (!questionPrompt) {
        res.status(400).json({ error: 'Missing questionPrompt' })
        return
      }

      let parsedGazeFrames = []
      if (gazeFrames) {
        try {
          parsedGazeFrames = JSON.parse(gazeFrames)
        } catch (err) {
          res.status(400).json({ error: 'Invalid gazeFrames JSON format' })
          return
        }
      }

      // 1. Upload video file to R2
      const videoKey = `interviews/${req.user.id}/${randomUUID()}.mp4`
      await storageService.uploadVideo(req.file.buffer, videoKey, req.file.mimetype)

      // 2. Create InterviewSession in db
      const session = await prisma.interviewSession.create({
        data: {
          userId: req.user.id,
          status: 'processing',
          questionPrompt,
          storageKey: videoKey,
        },
      })

      // 3. Enqueue job for background processing
      await enqueueInterviewAnalysis({
        sessionId: session.id,
        userId: req.user.id,
        videoKey,
        gazeFrames: parsedGazeFrames,
      })

      logger.info(`Successfully created interview session ${session.id} and enqueued analysis job`)
      res.status(201).json({
        success: true,
        sessionId: session.id,
        status: 'processing',
      })
    } catch (error) {
      logger.error('Failed uploading and enqueuing interview session:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }) as any
)

/**
 * GET /interview/history
 * Returns the history of mock interviews completed by the user.
 */
router.get(
  '/history',
  authMiddleware,
  requireConsent,
  (async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessions = await prisma.interviewSession.findMany({
        where: { userId: req.user.id },
        include: {
          scores: {
            select: {
              eyeContactScore: true,
              engagementScore: true,
              confidenceLevel: true,
              fillerWordCount: true,
              wordsPerMinute: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.status(200).json({ success: true, sessions })
    } catch (error) {
      logger.error(`Failed fetching interview history for user ${req.user.id}:`, error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }) as any
)

/**
 * GET /interview/:id/status
 * Returns processing status for a specific interview session.
 */
router.get(
  '/:id/status',
  authMiddleware,
  requireConsent,
  (async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await prisma.interviewSession.findUnique({
        where: { id: req.params.id as string },
      })

      if (!session) {
        res.status(404).json({ error: 'Interview session not found' })
        return
      }

      if (session.userId !== req.user.id) {
        res.status(403).json({ error: 'Unauthorized access to this session' })
        return
      }

      res.status(200).json({
        success: true,
        id: session.id,
        status: session.status,
      })
    } catch (error) {
      logger.error(`Failed fetching status for session ${req.params.id}:`, error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }) as any
)

/**
 * GET /interview/:id/results
 * Returns scoring results, breakdowns, and Atlas feedback for a completed session.
 */
router.get(
  '/:id/results',
  authMiddleware,
  requireConsent,
  (async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await prisma.interviewSession.findUnique({
        where: { id: req.params.id as string },
        include: {
          scores: true,
          breakdowns: true,
        },
      })

      if (!session) {
        res.status(404).json({ error: 'Interview session not found' })
        return
      }

      if (session.userId !== req.user.id) {
        res.status(403).json({ error: 'Unauthorized access to this session' })
        return
      }

      if (session.status !== 'completed') {
        res.status(400).json({ error: 'Session analysis has not completed successfully' })
        return
      }

      res.status(200).json({
        success: true,
        session,
      })
    } catch (error) {
      logger.error(`Failed fetching results for session ${req.params.id}:`, error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }) as any
)

export default router
