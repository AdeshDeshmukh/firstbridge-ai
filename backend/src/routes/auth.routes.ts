// backend/src/routes/auth.routes.ts

import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { prisma } from '../lib/prisma'
import { validate } from '../middleware/validate.middleware'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { signupSchema, loginSchema } from '../lib/schemas'
import logger from '../utils/logger'

const router = Router()

// ─── POST /auth/signup ───────────────────────────────────────────────────────
router.post('/signup', validate(signupSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification for hackathon
    })

    if (error || !data.user) {
      // Check for duplicate email
      if (error?.message?.includes('already registered') ||
          error?.message?.includes('already exists')) {
        res.status(409).json({ error: 'An account with this email already exists' })
        return
      }
      logger.error('Supabase signup error', { message: error?.message })
      res.status(400).json({ error: 'Failed to create account. Please try again.' })
      return
    }

    // 2. Create student profile row in our DB
    await prisma.studentProfile.create({
      data: {
        userId: data.user.id,
      }
    })

    logger.info('User registered', { userId: data.user.id })

    res.status(201).json({
      message: 'Account created successfully',
      userId: data.user.id,
    })

  } catch (err) {
    logger.error('Signup error', { message: (err as Error).message })
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// ─── POST /auth/login ────────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      // Return generic message — do not reveal if email exists or not
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    res.status(200).json({
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    })

  } catch (err) {
    logger.error('Login error', { message: (err as Error).message })
    res.status(500).json({ error: 'Failed to sign in' })
  }
})

// ─── POST /auth/logout ───────────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '') || ''

    await supabase.auth.admin.signOut(token)

    res.status(200).json({ message: 'Signed out successfully' })

  } catch (err) {
    // Even if signout fails on Supabase side, tell client it succeeded
    // Client will clear local session regardless
    res.status(200).json({ message: 'Signed out' })
  }
})

// ─── GET /auth/me ────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const { id, email } = (req as AuthenticatedRequest).user

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: id },
      select: {
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        year: true,
        isFirstGen: true,
        priority: true,
        onboardingDone: true,
        profileComplete: true,
      }
    })

    const consent = await prisma.studentConsent.findFirst({
      where: {
        userId: id,
        withdrawnAt: null,
      },
      select: {
        grantedAt: true,
        emailNotifications: true,
        photoStorage: true,
        anonymousAnalytics: true,
      }
    })

    res.status(200).json({
      user: { id, email },
      profile,
      hasConsent: !!consent,
      consent,
    })

  } catch (err) {
    logger.error('Get current user error', { userId: id })
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

export default router