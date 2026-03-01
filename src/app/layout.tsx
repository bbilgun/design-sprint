/**
 * src/app/layout.tsx
 * Root layout. Applies font, global styles, and Toaster.
 */

import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title:       'Design Sprint | Tech Club',
  description: 'Collaborative event ideation platform for university tech club members.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontSize:    '0.875rem',
              borderRadius: '6px',
              border:      '1px solid #e2e8f0',
              boxShadow:   '0 4px 6px -1px rgb(0 0 0 / 0.07)',
            },
          }}
        />
      </body>
    </html>
  )
}
