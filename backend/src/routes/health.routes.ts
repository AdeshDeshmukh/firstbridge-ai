// backend/src/routes/health.routes.ts

import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { checkRedisHealth } from '../lib/redis'

const router = Router()

// GET /health
// No authentication required
// Used by: Railway health checks, judge verification, monitoring

router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now()

  // Check database
  let dbStatus: 'connected' | 'error' = 'error'
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch {
    dbStatus = 'error'
  }

  // Check Redis
  const redisConnected = await checkRedisHealth()

  const responseTime = Date.now() - startTime

  // If core services are down, return 503
  if (dbStatus === 'error') {
    res.status(503).json({
      status: 'degraded',
      db: dbStatus,
      redis: redisConnected ? 'connected' : 'error',
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
    })
    return
  }

  res.status(200).json({
    status: 'ok',
    db: dbStatus,
    redis: redisConnected ? 'connected' : 'error',
    responseTimeMs: responseTime,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

export default router