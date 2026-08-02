

import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from './auth.middleware'

type ConsentField = 'conversationStorage' | 'videoProcessing' | 'photoStorage'


export function requireConsent(fields: ConsentField[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      const where: Record<string, boolean | null> = { withdrawnAt: null }
      for (const field of fields) where[field] = true

      const consent = await prisma.studentConsent.findFirst({
        where: { userId, ...where },
        select: {
          id: true,
          emailNotifications: true,
          photoStorage: true,
          anonymousAnalytics: true,
          grantedAt: true,
        },
      })

      if (!consent) {
        res.status(403).json({
          error: 'Consent required',
          code: 'CONSENT_REQUIRED',
          message: `This feature requires consent for: ${fields.join(', ')}`,
        })
        return
      }

      ;(req as AuthenticatedRequest & { consent: typeof consent }).consent = consent
      next()
    } catch (err) {
      res.status(500).json({ error: 'Failed to check consent status' })
    }
  }
}

export const consentMiddleware = requireConsent(['conversationStorage', 'videoProcessing'])