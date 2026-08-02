
import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
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
        metadata: metadata as Prisma.InputJsonValue,
      }
    })
  } catch (err) {
    logger.error('Failed to write audit log', {
      action,
      userId,
      error: (err as Error).message,
    })
  }
}

export function auditMiddleware(action: AuditAction) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user?.id || null
    const requestId = (req as AuthenticatedRequest & { requestId?: string }).requestId
    const ipAddress = req.ip || req.socket.remoteAddress
    auditLog(action, userId, requestId, ipAddress).catch(() => {})
    next()
  }
}