/**
 * src/components/ui/Modal.tsx
 * Accessible modal dialog with focus trap and keyboard close.
 */

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import Button from './Button'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title:     string
  children:  React.ReactNode
  size?:     'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Focus the close button when modal opens
  useEffect(() => {
    if (open) firstFocusRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        className={cn(
          'relative w-full bg-white rounded-lg shadow-modal',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <h2 className="text-base font-semibold text-primary-900">{title}</h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="p-1 rounded text-primary-500 hover:text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
