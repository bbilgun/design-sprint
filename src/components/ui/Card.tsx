/**
 * src/components/ui/Card.tsx
 * Simple card container with optional header and footer.
 */

import { cn } from '@/lib/utils'

interface CardProps {
  children:   React.ReactNode
  className?: string
  padding?:   'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-primary-200 shadow-card',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 pb-4 border-b border-primary-100', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-base font-semibold text-primary-900', className)}>
      {children}
    </h2>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-primary-100', className)}>
      {children}
    </div>
  )
}
