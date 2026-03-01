/**
 * POST   /api/ideas/[id]/vote  → cast a vote
 * DELETE /api/ideas/[id]/vote  → remove a vote
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, apiSuccess, apiError } from '@/lib/utils'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({
    where:   { id: params.id },
    include: { sprint: true },
  })

  if (!idea) return apiError('Idea not found', 404)

  // Voting only allowed when sprint is in VOTING status
  if (idea.sprint.status !== 'VOTING') {
    return apiError('Voting is not open for this sprint', 403)
  }

  // Prevent duplicate votes (also enforced by DB unique constraint)
  const existing = await prisma.vote.findUnique({
    where: { userId_ideaId: { userId: auth.user.id, ideaId: params.id } },
  })
  if (existing) return apiError('You have already voted for this idea', 409)

  const vote = await prisma.vote.create({
    data: { userId: auth.user.id, ideaId: params.id },
  })

  const voteCount = await prisma.vote.count({ where: { ideaId: params.id } })
  return apiSuccess({ vote, voteCount }, 'Vote cast', 201)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const idea = await prisma.idea.findUnique({
    where:   { id: params.id },
    include: { sprint: true },
  })
  if (!idea) return apiError('Idea not found', 404)

  if (idea.sprint.status !== 'VOTING') {
    return apiError('Voting is not open for this sprint', 403)
  }

  // Remove vote (ignore if not found)
  await prisma.vote.deleteMany({
    where: { userId: auth.user.id, ideaId: params.id },
  })

  const voteCount = await prisma.vote.count({ where: { ideaId: params.id } })
  return apiSuccess({ voteCount }, 'Vote removed')
}
