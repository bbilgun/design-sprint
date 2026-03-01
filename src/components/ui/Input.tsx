/**
 * src/components/ui/Input.tsx
 * Reusable input, textarea, and select components.
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary-700">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded border px-3 py-2 text-sm text-primary-900',
            'placeholder:text-primary-400',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
            'disabled:bg-primary-50 disabled:text-primary-400 disabled:cursor-not-allowed',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-primary-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="text-xs text-primary-500">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?:  string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary-700">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded border px-3 py-2 text-sm text-primary-900',
            'placeholder:text-primary-400 resize-y min-h-[100px]',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
            'disabled:bg-primary-50 disabled:cursor-not-allowed',
            error ? 'border-danger-500' : 'border-primary-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="text-xs text-primary-500">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string
  error?:   string
  options:  { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary-700">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded border px-3 py-2 text-sm text-primary-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
            'disabled:bg-primary-50 disabled:cursor-not-allowed',
            error ? 'border-danger-500' : 'border-primary-300',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
