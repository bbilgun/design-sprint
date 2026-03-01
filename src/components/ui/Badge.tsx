/**
 * src/components/ui/Badge.tsx
 * Small label component for statuses and categories.
 */

import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  children:  React.ReactNode
  variant?:  Variant
  className?: string
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-accent-100 text-accent-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger:  'bg-danger-50 text-danger-700',
  info:    'bg-accent-50 text-accent-700',
  neutral: 'bg-primary-100 text-primary-600',
}

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Status → variant mapping helpers ────────────────────────────────────────

export function sprintStatusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    DRAFT:   'neutral',
    ACTIVE:  'success',
    VOTING:  'warning',
    CLOSED:  'danger',
  }
  return map[status] ?? 'neutral'
}

export function ideaStatusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    DRAFT:       'neutral',
    SHORTLISTED: 'info',
    SELECTED:    'success',
  }
  return map[status] ?? 'neutral'
}
