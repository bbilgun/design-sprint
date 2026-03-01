import { getSessionUser } from '@/lib/session'
import Header from '@/components/layout/Header'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser()

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Header user={user} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
