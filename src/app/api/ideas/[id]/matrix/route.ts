/**
 * PATCH /api/ideas/[id]/matrix
 * Updates impactScore and feasibilityScore for matrix drag-and-drop.
 * Any authenticated user can move cards (admin can restrict via sprint status).
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, apiSuccess, apiError } from '@/lib/utils'
import { matrixUpdateSchema } from '@/lib/validations'

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({
    where:   { id: params.id },
    include: { sprint: true },
  })
  if (!idea) return apiError('Idea not found', 404)

  // Only allow matrix edits when sprint is active, voting, or by admin
  if (auth.user.role === 'MEMBER' && idea.sprint.status === 'CLOSED') {
    return apiError('Sprint is closed', 403)
  }

  const body = await req.json()
  const parsed = matrixUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const updated = await prisma.idea.update({
    where: { id: params.id },
    data:  {
      impactScore:      parsed.data.impactScore,
      feasibilityScore: parsed.data.feasibilityScore,
    },
    select: { id: true, impactScore: true, feasibilityScore: true },
  })

  return apiSuccess(updated, 'Matrix scores updated')
}
