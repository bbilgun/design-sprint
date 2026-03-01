/**
 * PATCH /api/admin/mark-final
 * Changes an idea's status (SHORTLISTED / SELECTED / DRAFT).
 * Admin only.
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, apiSuccess, apiError } from '@/lib/utils'
import { markFinalSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = markFinalSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const idea = await prisma.idea.findUnique({ where: { id: parsed.data.ideaId } })
  if (!idea) return apiError('Idea not found', 404)

  const updated = await prisma.idea.update({
    where: { id: parsed.data.ideaId },
    data:  { status: parsed.data.status },
    include: {
      _count:  { select: { votes: true } },
      author:  { select: { id: true, name: true } },
    },
  })

  return apiSuccess(updated, `Idea marked as ${updated.status}`)
}
