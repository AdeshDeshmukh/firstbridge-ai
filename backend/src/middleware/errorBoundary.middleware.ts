import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export function errorBoundaryMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = (req as Request & { requestId?: string }).requestId || 'unknown'

  // Log full error internally
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    requestId,
    method: req.method,
    path: req.path,
  })

  // Never expose internal details to client in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      requestId,
    })
    return
  }

  // In development, show more detail to help debugging
  res.status(500).json({
    error: err.message,
    requestId,
    stack: err.stack?.split('\n').slice(0, 5),
  })
}