
import * as Sentry from '@sentry/node'

// 1. Sentry MUST be initialized before anything else
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})

import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import logger from './utils/logger'
import { requestIdMiddleware } from './middleware/requestId.middleware'
import { errorBoundaryMiddleware } from './middleware/errorBoundary.middleware'
import { generalRateLimit } from './middleware/rateLimit.middleware'

// Route imports
import healthRouter from './routes/health.routes'
import authRouter from './routes/auth.routes'
import consentRouter from './routes/consent.routes'
import onboardingRouter from './routes/onboarding.routes'
import agentsRouter from './routes/agents.routes'
import scholarshipsRouter from './routes/scholarships.routes'

const app: Express = express()
const PORT = process.env.PORT || 3001

// 2. CORS — whitelist only
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: ${origin} not allowed`))
    }
  },
  credentials: true,
}))

// 3. Stripe webhook needs raw body — registered BEFORE express.json()


// 4. JSON body parsing — AFTER stripe webhook
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// 5. Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Required for MediaPipe WASM
}))

// 6. Request ID on every request
app.use(requestIdMiddleware)

// 7. Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    requestId: (req as unknown as { requestId?: string }).requestId,
  })
  next()
})

// 8. Global rate limit
app.use(generalRateLimit)

// 9. Routes
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/consent', consentRouter)
app.use('/onboarding', onboardingRouter)
app.use('/agents', agentsRouter)
app.use('/scholarships', scholarshipsRouter)

// 10. 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  })
})

// 11. Sentry error handler (must be before errorBoundary)

Sentry.setupExpressErrorHandler(app)

// 12. Error boundary — MUST BE LAST
app.use(errorBoundaryMiddleware)

// Start server
app.listen(PORT, () => {
  logger.info(`FirstBridge AI backend running`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    healthCheck: `http://localhost:${PORT}/health`,
  })
})

export default app