

import { Router, Request, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { scholarshipStatusSchema, scholarshipSearchSchema } from '../lib/schemas'
import {
  listScholarships,
  getScholarshipById,
  getSavedScholarships,
  saveScholarship,
  updateApplicationStatus,
  getRecommendations,
  buildReasonText,
  getCachedScoreForScholarship,
} from '../services/scholarship.service'
import { logUsageEvent } from '../services/usage.service'
import logger from '../utils/logger'

const router: Router = Router()
router.use(authMiddleware)

// GET /scholarships — browse, paginated + sortable + filterable
router.get('/', async (req: Request, res: Response) => {
  const parsed = scholarshipSearchSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid search params', errors: parsed.error.errors })
    return
  }
  const { major, minAmount, maxAmount, activeOnly, page, limit, sortBy, order } = parsed.data

  try {
    const result = await listScholarships({ major, minAmount, maxAmount, activeOnly: activeOnly ?? true, page, limit, sortBy, order })
    res.status(200).json({
      data: result.data,
      pagination: result.pagination,
      filters: { major, sortBy, order },
    })
  } catch (err) {
    logger.error('Failed to list scholarships', { message: (err as Error).message })
    res.status(500).json({ error: 'Failed to load scholarships' })
  }
})

// GET /scholarships/recommendations — AI-scored, personalized

router.get('/recommendations', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const page = Number(req.query.page) || 1
  const limit = Math.min(Number(req.query.limit) || 20, 100)

  try {
    const result = await getRecommendations(user.id, page, limit)
    res.status(200).json({
      data: result.data.map((s) => ({ ...s, reasonText: buildReasonText(s.reasons) })),
      pagination: result.pagination,
    })
  } catch (err) {
    logger.error('Failed to build recommendations', { userId: user.id, message: (err as Error).message })
    res.status(500).json({ error: 'Failed to load recommendations' })
  }
})

router.get('/saved', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  try {
    const saved = await getSavedScholarships(user.id)
    res.status(200).json({ saved })
  } catch (err) {
    logger.error('Failed to load saved scholarships', { message: (err as Error).message })
    res.status(500).json({ error: 'Failed to load saved scholarships' })
  }
})
router.get('/:id', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  try {
    const scholarship = await getScholarshipById((req.params.id as string))
    if (!scholarship) {
      res.status(404).json({ error: 'Scholarship not found' })
      return
    }
    logUsageEvent({
      userId: user.id,
      email: user.email,
      eventType: 'SCHOLARSHIP',
      scholarshipId: (req.params.id as string),
      scholarshipAction: 'VIEWED',
      relevanceScore: (await getCachedScoreForScholarship(user.id, (req.params.id as string))) ?? undefined,
    }).catch(() => {})
    res.status(200).json({ scholarship })
  } catch (err) {
    logger.error('Failed to load scholarship', { id: (req.params.id as string), message: (err as Error).message })
    res.status(500).json({ error: 'Failed to load scholarship' })
  }
})
router.post('/:id/save', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  try {
    const saved = await saveScholarship(user.id, (req.params.id as string))
    logUsageEvent({
      userId: user.id,
      email: user.email,
      eventType: 'SCHOLARSHIP',
      scholarshipId: (req.params.id as string),
      scholarshipAction: 'SAVED',
      relevanceScore: (await getCachedScoreForScholarship(user.id, (req.params.id as string))) ?? undefined,
    }).catch(() => {})
    res.status(201).json({ saved })
  } catch (err) {
    logger.error('Failed to save scholarship', { userId: user.id, scholarshipId: (req.params.id as string), message: (err as Error).message })
    res.status(500).json({ error: 'Failed to save scholarship' })
  }
})

router.patch('/:id/status', validate(scholarshipStatusSchema), async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest
  const { status } = req.body

  try {
    const updated = await updateApplicationStatus(user.id, (req.params.id as string), status)
    if (status === 'applied' || status === 'submitted') {
      logUsageEvent({
        userId: user.id,
        email: user.email,
        eventType: 'SCHOLARSHIP',
        scholarshipId: (req.params.id as string),
        scholarshipAction: 'APPLIED',
        relevanceScore: (await getCachedScoreForScholarship(user.id, (req.params.id as string))) ?? undefined,
      }).catch(() => {})
    }
    res.status(200).json({ updated })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'You have not saved this scholarship yet' })
      return
    }
    logger.error('Failed to update scholarship status', { userId: user.id, scholarshipId: (req.params.id as string), message: (err as Error).message })
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router