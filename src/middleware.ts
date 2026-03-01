/**
 * src/middleware.ts
 * Simplified: only redirect to /join if the user has no name cookie yet.
 * All pages are otherwise public.
 */

import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/join', '/api/']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public paths and static assets
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // If no name cookie, redirect to join
  const uid = req.cookies.get('ds_uid')?.value
  if (!uid) {
    return NextResponse.redirect(new URL('/join', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
