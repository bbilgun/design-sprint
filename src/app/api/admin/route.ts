/**
 * GET /api/admin
 * Returns admin dashboard summary (most voted, total counts).
 * Admin only.
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, apiSuccess } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  const [totalIdeas, totalVotes, totalComments, topIdeas] = await Promise.all([
    prisma.idea.count(),
    prisma.vote.count(),
    prisma.comment.count(),
    prisma.idea.findMany({
      orderBy: { votes: { _count: 'desc' } },
      take:    10,
      include: {
        _count:  { select: { votes: true } },
        author:  { select: { id: true, name: true } },
        sprint:  { select: { id: true, title: true } },
      },
    }),
  ])

  return apiSuccess({ totalIdeas, totalVotes, totalComments, topIdeas })
}
