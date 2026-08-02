// backend/src/routes/consent.routes.ts

import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { auditLog } from '../middleware/audit.middleware'
import { consentGrantSchema } from '../lib/schemas'
import logger from '../utils/logger'

const router: Router = Router()

// ─── POST /consent/grant ─────────────────────────────────────────────────────
router.post(
  '/grant',
  authMiddleware,
  validate(consentGrantSchema),
  async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user
    const {
      conversationStorage,
      videoProcessing,
      emailNotifications,
      photoStorage,
      anonymousAnalytics,
    } = req.body

    try {
      // Check if active consent already exists
      const existing = await prisma.studentConsent.findFirst({
        where: { userId, withdrawnAt: null }
      })

      if (existing) {
        res.status(409).json({
          error: 'Active consent already exists',
          code: 'CONSENT_EXISTS'
        })
        return
      }

      // Create consent record
      const consent = await prisma.studentConsent.create({
        data: {
          userId,
          consentVersion: '1.0',
          conversationStorage,
          videoProcessing,
          emailNotifications,
          photoStorage,
          anonymousAnalytics,
          ipAddress: req.ip || req.socket.remoteAddress,
        },
        select: {
          id: true,
          grantedAt: true,
          conversationStorage: true,
          videoProcessing: true,
          emailNotifications: true,
          photoStorage: true,
          anonymousAnalytics: true,
        }
      })

      // Write audit log — FERPA compliance
      const requestId = (req as Request & { requestId?: string }).requestId
      await auditLog('consent_grant', userId, requestId, req.ip)

      logger.info('Consent granted', { userId })

      res.status(201).json({
        message: 'Consent recorded',
        consent,
      })

    } catch (err) {
      logger.error('Consent grant error', {
        userId,
        message: (err as Error).message,
      })
      res.status(500).json({ error: 'Failed to record consent' })
    }
  }
)

// ─── GET /consent/status ─────────────────────────────────────────────────────
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  const { id: userId } = (req as AuthenticatedRequest).user

  try {
    const consent = await prisma.studentConsent.findFirst({
      where: {
        userId,
        withdrawnAt: null,
      },
      select: {
        id: true,
        grantedAt: true,
        consentVersion: true,
        conversationStorage: true,
        videoProcessing: true,
        emailNotifications: true,
        photoStorage: true,
        anonymousAnalytics: true,
      }
    })

    res.status(200).json({
      hasConsent: !!consent,
      consent: consent ?? null,
    })

  } catch (err) {
    res.status(500).json({ error: 'Failed to check consent status' })
  }
})

// ─── POST /consent/withdraw ──────────────────────────────────────────────────
router.post('/withdraw', authMiddleware, async (req: Request, res: Response) => {
  const { id: userId } = (req as AuthenticatedRequest).user

  try {
    // Find active consent
    const consent = await prisma.studentConsent.findFirst({
      where: { userId, withdrawnAt: null }
    })

    if (!consent) {
      res.status(404).json({ error: 'No active consent found' })
      return
    }

    // Mark as withdrawn (do NOT delete — audit record)
    await prisma.studentConsent.update({
      where: { id: consent.id },
      data: { withdrawnAt: new Date() }
    })

    // Cascade delete all student data (FERPA right)
    // This is done in a transaction to ensure consistency
    await prisma.$transaction([
      prisma.conversation.deleteMany({ where: { userId } }),
      prisma.memorySnapshot.deleteMany({ where: { userId } }),
      prisma.interviewSession.deleteMany({ where: { userId } }),
      prisma.savedScholarship.deleteMany({ where: { userId } }),
      prisma.photoEnhancement.deleteMany({ where: { userId } }),
      prisma.distressSignal.deleteMany({ where: { userId } }),
      prisma.nudge.deleteMany({ where: { userId } }),
      prisma.studentProfile.deleteMany({ where: { userId } }),
    ])

    // Write audit log
    const requestId = (req as Request & { requestId?: string }).requestId
    await auditLog('consent_withdraw', userId, requestId, req.ip, {
      reason: 'User withdrew consent via settings'
    })

    logger.info('Consent withdrawn and data deleted', { userId })

    res.status(200).json({
      message: 'Consent withdrawn and all personal data deleted'
    })

  } catch (err) {
    logger.error('Consent withdraw error', {
      userId,
      message: (err as Error).message,
    })
    res.status(500).json({ error: 'Failed to withdraw consent' })
  }
})

export default router