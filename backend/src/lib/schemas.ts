// backend/src/lib/schemas.ts
// All Zod validation schemas in one place
// Import from here in all route files

import { z } from 'zod'

// ─── AUTH SCHEMAS ────────────────────────────────────────────────────────────

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

// ─── CONSENT SCHEMAS ─────────────────────────────────────────────────────────

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

// ─── ONBOARDING SCHEMAS ──────────────────────────────────────────────────────

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

// ─── AGENT SCHEMAS ───────────────────────────────────────────────────────────

export const agentMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long'),
})

// ─── PROFILE SCHEMAS ─────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  university: z.string().trim().max(100).optional(),
  major: z.string().trim().max(100).optional(),
  year: z.number().int().min(1).max(6).optional(),
})

// ─── SCHOLARSHIP STATUS SCHEMA ───────────────────────────────────────────────

export const scholarshipStatusSchema = z.object({
  status: z.enum(['saved', 'applied', 'submitted']),
})