/**
 * GET  /api/ideas  → list ideas with filters & sorting
 * POST /api/ideas  → create a new idea
 *
 * Query params (GET):
 *   sprintId   – filter by sprint
 *   category   – filter by category
 *   status     – filter by idea status
 *   sort       – "votes" | "newest" | "impact" | "feasibility"
 *   search     – full-text search on title/description
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, apiSuccess, apiError } from '@/lib/utils'
import { createIdeaSchema } from '@/lib/validations'
export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  const { searchParams } = req.nextUrl
  const sprintId  = searchParams.get('sprintId')  ?? undefined
  const category  = searchParams.get('category')  ?? undefined
  const status    = searchParams.get('status')    ?? undefined
  const sort      = searchParams.get('sort')      ?? 'votes'
  const search    = searchParams.get('search')    ?? undefined

  // Build dynamic where clause (SQLite: no insensitive mode, use contains only)
  const where = {
    ...(sprintId ? { sprintId } : {}),
    ...(category ? { category } : {}),
    ...(status   ? { status }   : {}),
    ...(search
      ? {
          OR: [
            { title:       { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  }

  // Build order by
  const orderBy =
    sort === 'newest'        ? { createdAt: 'desc' as const }
    : sort === 'impact'      ? { impactScore: 'desc' as const }
    : sort === 'feasibility' ? { feasibilityScore: 'desc' as const }
    : { votes: { _count: 'desc' as const } }

  const ideas = await prisma.idea.findMany({
    where,
    orderBy,
    include: {
      author:  { select: { id: true, name: true } },
      sprint:  { select: { id: true, title: true, status: true } },
      _count:  { select: { votes: true, comments: true } },
    },
  })

  // Annotate each idea with whether the current user has voted
  const userVotes = await prisma.vote.findMany({
    where: {
      userId: auth.user.id,
      ideaId: { in: ideas.map((i) => i.id) },
    },
    select: { ideaId: true },
  })
  const votedSet = new Set(userVotes.map((v) => v.ideaId))

  const result = ideas.map((idea) => ({
    ...idea,
    hasVoted: votedSet.has(idea.id),
  }))

  return apiSuccess(result)
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) return auth.error

  // Sprint must be ACTIVE or DRAFT (only admins can submit to DRAFT/VOTING)
  const body = await req.json()
  const parsed = createIdeaSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  // Check sprint status — members can only submit during ACTIVE
  const sprint = await prisma.sprintSession.findUnique({ where: { id: parsed.data.sprintId } })
  if (!sprint) return apiError('Sprint not found', 404)

  if (auth.user.role === 'MEMBER' && sprint.status !== 'ACTIVE') {
    return apiError('Idea submission is not open for this sprint', 403)
  }

  const idea = await prisma.idea.create({
    data: {
      ...parsed.data,
      authorId: auth.user.id,
    },
    include: {
      author: { select: { id: true, name: true } },
      sprint: { select: { id: true, title: true, status: true } },
      _count: { select: { votes: true, comments: true } },
    },
  })

  return apiSuccess(idea, 'Idea created successfully', 201)
}
