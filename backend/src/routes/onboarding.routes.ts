// backend/src/routes/onboarding.routes.ts

import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { consentMiddleware } from '../middleware/consent.middleware'
import { validate } from '../middleware/validate.middleware'
import { onboardingSchema } from '../lib/schemas'
import logger from '../utils/logger'

const router: Router = Router()

// ─── POST /onboarding/complete ───────────────────────────────────────────────
router.post(
  '/complete',
  authMiddleware,
  consentMiddleware,
  validate(onboardingSchema),
  async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user
    const {
      firstName,
      lastName,
      university,
      major,
      year,
      isFirstGen,
      priority,
    } = req.body

    try {
      // Calculate profile completion percentage
      const fields = [firstName, lastName, university, major, year, isFirstGen]
      const filledFields = fields.filter((f) => f !== undefined && f !== null && f !== '').length
      const profileComplete = Math.round((filledFields / fields.length) * 100)

      // Update student profile
      const profile = await prisma.studentProfile.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          university,
          major,
          year,
          isFirstGen: isFirstGen ?? true,
          priority: priority ?? 'all',
          onboardingDone: true,
          profileComplete,
        }
      })

      // Seed initial memory snapshot with onboarding data
      // This is what makes Vera, Grant, and Atlas aware of the student
      // before the first conversation even starts
      const initialFacts = {
        name: firstName ? `${firstName} ${lastName || ''}`.trim() : null,
        major: major || null,
        year: year || null,
        university: university || null,
        isFirstGen: isFirstGen ?? true,
        goals: [],
        concerns: [],
        strengths: [],
        financialSituation: null,
        targetRoles: [],
        keyExperiences: [],
      }

      await prisma.memorySnapshot.upsert({
        where: { userId },
        update: {
          structuredFacts: initialFacts,
          lastUpdated: new Date(),
          version: { increment: 1 },
        },
        create: {
          userId,
          structuredFacts: initialFacts,
        }
      })

      logger.info('Onboarding completed', {
        userId,
        profileComplete,
      })

      res.status(200).json({
        message: 'Onboarding complete',
        profile: {
          firstName: profile.firstName,
          university: profile.university,
          major: profile.major,
          profileComplete,
          onboardingDone: true,
        }
      })

    } catch (err) {
      logger.error('Onboarding error', {
        userId,
        message: (err as Error).message,
      })
      res.status(500).json({ error: 'Failed to complete onboarding' })
    }
  }
)

export default router