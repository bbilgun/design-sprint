/**
 * src/lib/session.ts
 * Simple name-based session. No passwords, no JWT.
 * Reads ds_uid + ds_name cookies (server components only).
 */

import { cookies } from 'next/headers'
import type { SessionUser } from '@/types'

export function getSessionUser(): SessionUser | null {
  const uid  = cookies().get('ds_uid')?.value
  const name = cookies().get('ds_name')?.value
  const role = cookies().get('ds_role')?.value
  if (!uid || !name) return null
  return { id: uid, name, role: (role ?? 'MEMBER') as SessionUser['role'] }
}
