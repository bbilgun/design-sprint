/**
 * src/lib/validations.ts
 * Zod schemas for all request bodies. Used in both API routes and client forms.
 */

import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(80),
  email:    z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number'),
})

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ─── Sprint ───────────────────────────────────────────────────────────────────

export const createSprintSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().max(500).optional(),
})

export const updateSprintStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'VOTING', 'CLOSED']),
})

// ─── Idea ─────────────────────────────────────────────────────────────────────

export const CATEGORIES = ['Workshop', 'Hackathon', 'Social', 'Tech Talk', 'Panel', 'Other'] as const
export type Category = (typeof CATEGORIES)[number]

const extendedIdeaFields = {
  targetAudience:        z.string().max(200).optional(),
  estimatedParticipants: z.number().int().min(1).max(10000).optional(),
  roughBudget:           z.string().max(100).optional(),
  timeNeeded:            z.string().max(100).optional(),
  problemStatement:      z.string().max(1000).optional(),
  valueProposition:      z.string().max(1000).optional(),
  expectedOutcome:       z.string().max(1000).optional(),
  keyRisks:              z.string().max(1000).optional(),
}

export const createIdeaSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  category:    z.enum(CATEGORIES),
  sprintId:    z.string().cuid('Invalid sprint ID'),
  ...extendedIdeaFields,
})

export const updateIdeaSchema = z.object({
  title:            z.string().min(5).max(120).optional(),
  description:      z.string().min(20).max(2000).optional(),
  category:         z.enum(CATEGORIES).optional(),
  impactScore:      z.number().int().min(1).max(5).optional(),
  feasibilityScore: z.number().int().min(1).max(5).optional(),
  status:           z.enum(['DRAFT', 'SHORTLISTED', 'SELECTED']).optional(),
  ...extendedIdeaFields,
})

// ─── Comment ──────────────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
})

// ─── Matrix update ────────────────────────────────────────────────────────────

export const matrixUpdateSchema = z.object({
  impactScore:      z.number().int().min(1).max(5),
  feasibilityScore: z.number().int().min(1).max(5),
})

// ─── Admin mark final ─────────────────────────────────────────────────────────

export const markFinalSchema = z.object({
  ideaId: z.string().cuid(),
  status: z.enum(['SHORTLISTED', 'SELECTED', 'DRAFT']),
})

// ─── Types inferred from schemas ──────────────────────────────────────────────

export type RegisterInput        = z.infer<typeof registerSchema>
export type LoginInput           = z.infer<typeof loginSchema>
export type CreateSprintInput    = z.infer<typeof createSprintSchema>
export type CreateIdeaInput      = z.infer<typeof createIdeaSchema>
export type UpdateIdeaInput      = z.infer<typeof updateIdeaSchema>
export type CreateCommentInput   = z.infer<typeof createCommentSchema>
export type MatrixUpdateInput    = z.infer<typeof matrixUpdateSchema>
