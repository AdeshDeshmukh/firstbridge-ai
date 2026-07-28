import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from './auth.middleware'

export async function consentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user?.id

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const consent = await prisma.studentConsent.findFirst({
      where: {
        userId,
        withdrawnAt: null,        
        conversationStorage: true,   
        videoProcessing: true,       
      },
      select: {
        id: true,
        emailNotifications: true,
        photoStorage: true,
        anonymousAnalytics: true,
        grantedAt: true,
      }
    })

    if (!consent) {
      res.status(403).json({
        error: 'Consent required',
        code: 'CONSENT_REQUIRED',
        message: 'Please complete the consent flow to access this feature'
      })
      return
    }

    ;(req as AuthenticatedRequest & { consent: typeof consent }).consent = consent

    next()
  } catch (err) {
    res.status(500).json({ error: 'Failed to check consent status' })
  }
}