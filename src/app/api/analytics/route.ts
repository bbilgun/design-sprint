/**
 * GET /api/analytics
 * Returns aggregated analytics data. Authenticated users can view.
 *
 * Query params:
 *   sprintId – filter by sprint (optional)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, apiSuccess } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const sprintId = req.nextUrl.searchParams.get('sprintId') ?? undefined
  const where    = sprintId ? { sprintId } : {}

  const [
    totalIdeas,
    totalVotes,
    totalComments,
    categoryCounts,
    statusCounts,
    topIdeas,
  ] = await Promise.all([
    // Total ideas
    prisma.idea.count({ where }),

    // Total votes across ideas in this sprint
    prisma.vote.count({
      where: sprintId ? { idea: { sprintId } } : {},
    }),

    // Total comments
    prisma.comment.count({
      where: sprintId ? { idea: { sprintId } } : {},
    }),

    // Ideas grouped by category
    prisma.idea.groupBy({
      by:      ['category'],
      where,
      _count:  { _all: true },
      orderBy: { _count: { category: 'desc' } },
    }),

    // Ideas grouped by status
    prisma.idea.groupBy({
      by:     ['status'],
      where,
      _count: { _all: true },
    }),

    // Top 5 most voted ideas
    prisma.idea.findMany({
      where,
      orderBy: { votes: { _count: 'desc' } },
      take:    5,
      include: { _count: { select: { votes: true } } },
    }),
  ])

  return apiSuccess({
    totalIdeas,
    totalVotes,
    totalComments,
    ideasByCategory: categoryCounts.map((c) => ({
      category: c.category,
      count:    c._count._all,
    })),
    ideasByStatus: statusCounts.map((s) => ({
      status: s.status,
      count:  s._count._all,
    })),
    topIdeas: topIdeas.map((idea) => ({
      id:       idea.id,
      title:    idea.title,
      category: idea.category,
      votes:    idea._count.votes,
    })),
  })
}
