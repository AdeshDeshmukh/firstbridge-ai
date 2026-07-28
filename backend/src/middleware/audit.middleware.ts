// backend/src/middleware/audit.middleware.ts

import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from './auth.middleware'
import logger from '../utils/logger'

type AuditAction =
  | 'data_export'
  | 'account_delete'
  | 'consent_grant'
  | 'consent_withdraw'
  | 'agent_call'
  | 'interview_upload'

// Logs sensitive data access to the audit_logs table
// Called directly from route handlers (not as Express middleware)
// because we need full context of what happened

export async function auditLog(
  action: AuditAction,
  userId: string | null,
  requestId: string | undefined,
  ipAddress: string | undefined,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        requestId,
        ipAddress,
        metadata,
      }
    })
  } catch (err) {
    // Audit log failure should not break the request
    // But we do want to know about it
    logger.error('Failed to write audit log', {
      action,
      userId,
      error: (err as Error).message,
    })
  }
}

// Express middleware version — automatically audits the request
// Used as middleware on specific sensitive routes
export function auditMiddleware(action: AuditAction) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user?.id || null
    const requestId = (req as AuthenticatedRequest & { requestId?: string }).requestId
    const ipAddress = req.ip || req.socket.remoteAddress

    // Fire and forget — does not block the response
    auditLog(action, userId, requestId, ipAddress).catch(() => {
      // Already handled inside auditLog
    })

    next()
  }
}