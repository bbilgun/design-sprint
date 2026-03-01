import { redirect } from 'next/navigation'

// Root redirects based on whether user has joined
export const dynamic = 'force-dynamic'

export default function RootPage() {
  redirect('/dashboard')
}
