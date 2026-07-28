// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import logger from '../utils/logger'

// Extends Express Request type to include our custom fields
export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
  }
  requestId?: string
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      res.status(401).json({ error: 'Token required' })
      return
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      // Log the fact that verification failed but NOT the token itself
      logger.warn('Auth token verification failed', {
        requestId: (req as AuthenticatedRequest).requestId,
        path: req.path,
      })
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    // Attach user to request for downstream handlers
    ;(req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email ?? '',
    }

    next()
  } catch (err) {
    logger.error('Auth middleware error', {
      message: (err as Error).message,
    })
    res.status(500).json({ error: 'Authentication error' })
  }
}