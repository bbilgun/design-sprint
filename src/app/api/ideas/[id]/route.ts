/**
 * GET    /api/ideas/[id]  → get idea with comments
 * PATCH  /api/ideas/[id]  → update idea (owner or admin)
 * DELETE /api/ideas/[id]  → delete idea (admin only)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireAdmin, apiSuccess, apiError } from '@/lib/utils'
import { updateIdeaSchema } from '@/lib/validations'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({
    where:   { id: params.id },
    include: {
      author:   { select: { id: true, name: true } },
      sprint:   { select: { id: true, title: true, status: true } },
      _count:   { select: { votes: true, comments: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })

  if (!idea) return apiError('Idea not found', 404)

  // Check if the current user voted
  const vote = await prisma.vote.findUnique({
    where: { userId_ideaId: { userId: auth.user.id, ideaId: params.id } },
  })

  return apiSuccess({ ...idea, hasVoted: !!vote })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({ where: { id: params.id } })
  if (!idea) return apiError('Idea not found', 404)

  // Only the author or an admin can edit
  if (idea.authorId !== auth.user.id && auth.user.role !== 'ADMIN') {
    return apiError('You do not have permission to edit this idea', 403)
  }

  const body = await req.json()
  const parsed = updateIdeaSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  // Members cannot change idea status — that's admin-only
  if (auth.user.role === 'MEMBER' && parsed.data.status) {
    return apiError('Only admins can change idea status', 403)
  }

  const updated = await prisma.idea.update({
    where:   { id: params.id },
    data:    parsed.data,
    include: {
      author: { select: { id: true, name: true } },
      sprint: { select: { id: true, title: true, status: true } },
      _count: { select: { votes: true, comments: true } },
    },
  })

  return apiSuccess(updated, 'Idea updated')
}

export async function DELETE(req: NextRequest, { params }: Params) {
  // Only admins can delete ideas
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({ where: { id: params.id } })
  if (!idea) return apiError('Idea not found', 404)

  await prisma.idea.delete({ where: { id: params.id } })
  return apiSuccess(null, 'Idea deleted')
}
