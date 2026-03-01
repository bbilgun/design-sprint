/**
 * src/types/index.ts
 * Shared TypeScript types used across the application.
 * Enums are replaced by string literals since we use SQLite (no native enum support).
 */

// ─── Enums as string literals ─────────────────────────────────────────────────

export type Role         = 'ADMIN' | 'MEMBER'
export type SprintStatus = 'DRAFT' | 'ACTIVE' | 'VOTING' | 'CLOSED'
export type IdeaStatus   = 'DRAFT' | 'SHORTLISTED' | 'SELECTED'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id:   string
  name: string
  role: Role
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: Record<string, string[]>
}

// ─── Domain types (safe, no password hash) ───────────────────────────────────

export interface SafeUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface SprintSessionDTO {
  id: string
  title: string
  description: string | null
  status: SprintStatus
  createdAt: string
  _count?: { ideas: number }
}

export interface CommentDTO {
  id: string
  content: string
  createdAt: string
  user: Pick<SafeUser, 'id' | 'name'>
}

export interface IdeaDTO {
  id: string
  title: string
  description: string
  category: string
  impactScore: number
  feasibilityScore: number
  status: IdeaStatus
  createdAt: string
  // Extended fields
  targetAudience?:        string | null
  estimatedParticipants?: number | null
  roughBudget?:           string | null
  timeNeeded?:            string | null
  problemStatement?:      string | null
  valueProposition?:      string | null
  expectedOutcome?:       string | null
  keyRisks?:              string | null
  author: Pick<SafeUser, 'id' | 'name'>
  sprint: Pick<SprintSessionDTO, 'id' | 'title' | 'status'>
  _count: { votes: number; comments: number }
  hasVoted?: boolean
  comments?: CommentDTO[]
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  totalIdeas: number
  totalVotes: number
  totalComments: number
  ideasByCategory: { category: string; count: number }[]
  topIdeas: { id: string; title: string; votes: number; category: string }[]
  ideasByStatus: { status: string; count: number }[]
}

// ─── Matrix ───────────────────────────────────────────────────────────────────

export type MatrixQuadrant = 'high-high' | 'high-low' | 'low-high' | 'low-low'

export interface MatrixIdea {
  id: string
  title: string
  category: string
  impactScore: number
  feasibilityScore: number
  voteCount: number
}
