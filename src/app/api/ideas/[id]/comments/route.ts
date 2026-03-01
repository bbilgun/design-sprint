/**
 * GET  /api/ideas/[id]/comments  → list comments for an idea
 * POST /api/ideas/[id]/comments  → add a comment
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, apiSuccess, apiError } from '@/lib/utils'
import { createCommentSchema } from '@/lib/validations'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({ where: { id: params.id } })
  if (!idea) return apiError('Idea not found', 404)

  const comments = await prisma.comment.findMany({
    where:   { ideaId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true } } },
  })

  return apiSuccess(comments)
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({ where: { id: params.id } })
  if (!idea) return apiError('Idea not found', 404)

  const body = await req.json()
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      userId:  auth.user.id,
      ideaId:  params.id,
    },
    include: { user: { select: { id: true, name: true } } },
  })

  return apiSuccess(comment, 'Comment added', 201)
}
