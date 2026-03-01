/**
 * GET /api/admin/export
 * Exports all ideas as a CSV file. Admin only.
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) return auth.error

  const { searchParams } = req.nextUrl
  const sprintId = searchParams.get('sprintId') ?? undefined

  const ideas = await prisma.idea.findMany({
    where:   sprintId ? { sprintId } : {},
    orderBy: { votes: { _count: 'desc' } },
    include: {
      author:  { select: { name: true, email: true } },
      sprint:  { select: { title: true } },
      _count:  { select: { votes: true, comments: true } },
    },
  })

  if (ideas.length === 0) {
    return apiError('No ideas to export', 404)
  }

  // Build CSV rows
  const rows = ideas.map((idea) => ({
    ID:           idea.id,
    Title:        idea.title,
    Category:     idea.category,
    Status:       idea.status,
    Author:       idea.author.name,
    'Author Email': idea.author.email,
    Sprint:       idea.sprint.title,
    Votes:        idea._count.votes,
    Comments:     idea._count.comments,
    'Impact Score':      idea.impactScore,
    'Feasibility Score': idea.feasibilityScore,
    'Created At': idea.createdAt.toISOString(),
    Description:  idea.description.replace(/\n/g, ' '),
  }))

  const headers = Object.keys(rows[0])
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => JSON.stringify(String(row[h as keyof typeof row] ?? '')))
        .join(',')
    ),
  ]
  const csv = csvLines.join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sprint-ideas-${Date.now()}.csv"`,
    },
  })
}
