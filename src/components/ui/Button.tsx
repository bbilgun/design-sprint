/**
 * src/components/ui/Button.tsx
 * Reusable button component with multiple variants and sizes.
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500',
  secondary: 'bg-primary-100 text-primary-800 hover:bg-primary-200 focus-visible:ring-primary-400',
  ghost:     'bg-transparent text-primary-700 hover:bg-primary-100 focus-visible:ring-primary-400',
  danger:    'bg-danger-500 text-white hover:bg-danger-700 focus-visible:ring-danger-500',
  outline:   'border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-400',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
