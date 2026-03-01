/**
 * GET    /api/sprint/[id]  → get sprint details
 * PATCH  /api/sprint/[id]  → update sprint status (admin only)
 * DELETE /api/sprint/[id]  → delete sprint (admin only)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireAdmin, apiSuccess, apiError } from '@/lib/utils'
import { updateSprintStatusSchema } from '@/lib/validations'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const sprint = await prisma.sprintSession.findUnique({
    where:   { id: params.id },
    include: { _count: { select: { ideas: true } } },
  })

  if (!sprint) return apiError('Sprint not found', 404)
  return apiSuccess(sprint)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = updateSprintStatusSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const sprint = await prisma.sprintSession.update({
    where: { id: params.id },
    data:  { status: parsed.data.status },
  })

  return apiSuccess(sprint, `Sprint status updated to ${sprint.status}`)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  await prisma.sprintSession.delete({ where: { id: params.id } })
  return apiSuccess(null, 'Sprint deleted')
}
