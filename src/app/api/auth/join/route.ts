/**
 * POST /api/auth/join
 * Finds or creates a user by name, sets plain cookies, no password required.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { apiError } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80).trim(),
})

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const { name } = parsed.data

  // Find existing user by name, or create a new one
  let user = await prisma.user.findFirst({ where: { name: { equals: name } } })

  const ADMIN_NAMES = ['Bilguun']

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email:        `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@sprint.local`,
        passwordHash: 'none',
        role:         ADMIN_NAMES.includes(name) ? 'ADMIN' : 'MEMBER',
      },
    })
  }

  const response = NextResponse.json({ data: { id: user.id, name: user.name, role: user.role } })

  const cookieOpts = {
    httpOnly: false,   // allow JS to read for client-side use
    sameSite: 'lax' as const,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30, // 30 days
  }

  response.cookies.set('ds_uid',  user.id,   cookieOpts)
  response.cookies.set('ds_name', user.name, cookieOpts)
  response.cookies.set('ds_role', user.role, cookieOpts)

  return response
}
