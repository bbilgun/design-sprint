/**
 * GET  /api/sprint  → list all sprint sessions
 * POST /api/sprint  → create a new sprint session (admin only)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireAdmin, apiSuccess, apiError } from '@/lib/utils'
import { createSprintSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  // Any authenticated user can list sprints
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const sprints = await prisma.sprintSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ideas: true } } },
  })

  return apiSuccess(sprints)
}

export async function POST(req: NextRequest) {
  // Only admins can create sprint sessions
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = createSprintSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const sprint = await prisma.sprintSession.create({ data: parsed.data })
  return apiSuccess(sprint, 'Sprint session created', 201)
}
