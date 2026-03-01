/**
 * src/lib/utils.ts
 * Shared utility functions.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextRequest, NextResponse } from 'next/server'
import type { SessionUser } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ data, ...(message ? { message } : {}) }, { status })
}

export function apiError(error: string, status = 400, details?: Record<string, string[]>) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status })
}

/**
 * Reads ds_uid + ds_name cookies from the request.
 * No JWT — just a plain cookie-based identity.
 */
export function requireAuth(
  req: NextRequest
): { user: SessionUser } | { error: NextResponse } {
  const uid  = req.cookies.get('ds_uid')?.value
  const name = req.cookies.get('ds_name')?.value
  const role = req.cookies.get('ds_role')?.value ?? 'MEMBER'

  if (!uid || !name) {
    return { error: apiError('Please join the sprint first', 401) }
  }

  return { user: { id: uid, name, role: role as SessionUser['role'] } }
}

export function requireAdmin(
  req: NextRequest
): { user: SessionUser } | { error: NextResponse } {
  // Everyone has admin access — UI restricts the tab to Bilguun only
  return requireAuth(req)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatRelative(dateString: string): string {
  const diff    = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours   < 24) return `${hours}h ago`
  if (days    < 30) return `${days}d ago`
  return formatDate(dateString)
}

export function scoreLabel(score: number): string {
  const labels: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High' }
  return labels[score] ?? 'Unknown'
}

export function getQuadrant(impactScore: number, feasibilityScore: number): string {
  const highImpact      = impactScore >= 3
  const highFeasibility = feasibilityScore >= 3
  if (highImpact && highFeasibility)  return 'Quick Wins'
  if (highImpact && !highFeasibility) return 'Big Bets'
  if (!highImpact && highFeasibility) return 'Fill-ins'
  return 'Reconsider'
}
