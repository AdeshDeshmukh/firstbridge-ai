import { z } from 'zod'


export const signupSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
})

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})


export const consentGrantSchema = z.object({
  conversationStorage: z.literal(true, {
    errorMap: () => ({ message: 'Conversation storage consent is required' })
  }),
  videoProcessing: z.literal(true, {
    errorMap: () => ({ message: 'Video processing consent is required' })
  }),
  emailNotifications: z.boolean().default(false),
  photoStorage: z.boolean().default(false),
  anonymousAnalytics: z.boolean().default(false),
})


export const onboardingSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  university: z.string().trim().max(100).optional(),
  major: z.string().trim().max(100).optional(),
  year: z.number().int().min(1).max(6).optional(),
  isFirstGen: z.boolean().optional(),
  priority: z
    .enum(['scholarships', 'interviews', 'story', 'all'])
    .optional(),
})


export const agentMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long'),

  sessionId: z.string().uuid().optional(),
})

// PROFILE SCHEMAS

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  university: z.string().trim().max(100).optional(),
  major: z.string().trim().max(100).optional(),
  year: z.number().int().min(1).max(6).optional(),
})

// SCHOLARSHIP STATUS SCHEM

export const scholarshipStatusSchema = z.object({
  status: z.enum(['saved', 'applied', 'submitted']),
})


export const interviewUploadSchema = z.object({
  questionPrompt: z.string().trim().min(1).max(500),
  durationSeconds: z.number().int().positive().max(1800).optional(),
})

// PHOTO

export const photoEnhancementSchema = z.object({
  style: z.enum(['professional', 'casual', 'academic']).default('professional'),
})

// SCHOLARSHIP SEARCH

export const scholarshipSearchSchema = z.object({
  major: z.string().trim().max(100).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  activeOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['deadline', 'amount', 'newest']).default('deadline'),
  order: z.enum(['asc', 'desc']).default('asc'),
})


export const exportDataSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
})

export const deleteAccountSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm account deletion' }),
  }),
})



export const checkoutSchema = z.object({
  priceId: z.string().min(1),
  universityId: z.string().uuid().optional(),
})