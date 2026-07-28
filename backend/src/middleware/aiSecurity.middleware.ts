// backend/src/middleware/aiSecurity.middleware.ts

import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'
import * as Sentry from '@sentry/node'

// Blocks common prompt injection patterns before messages reach Backboard
// Applied to all agent routes

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+prior/i,
  /disregard\s+previous/i,
  /forget\s+your\s+instructions/i,
  /you\s+are\s+now\s+a\s+different/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if\s+you\s+are/i,
  /system\s*:/i,
  /\[system\]/i,
  /\<system\>/i,
  /jailbreak/i,
]

const MAX_MESSAGE_LENGTH = 2000

export function aiSecurityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { message } = req.body

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' })
    return
  }

  // Enforce length limit
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({
      error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`
    })
    return
  }

  // Check for injection patterns
  const injectionDetected = INJECTION_PATTERNS.some((pattern) =>
    pattern.test(message)
  )

  if (injectionDetected) {
    // Log attempt to Sentry for monitoring
    Sentry.captureMessage('Prompt injection attempt blocked', {
      level: 'warning',
      extra: {
        messageLength: message.length,
        path: req.path,
        // Do NOT log the actual message — it may contain sensitive text
      }
    })

    logger.warn('Prompt injection attempt blocked', {
      path: req.path,
      messageLength: message.length,
    })

    res.status(400).json({ error: 'Invalid message format' })
    return
  }

  // Strip HTML tags from message
  req.body.message = message
    .replace(/<[^>]*>/g, '')
    .trim()

  next()
}