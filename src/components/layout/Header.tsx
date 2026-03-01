'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SessionUser } from '@/types'
import { cn } from '@/lib/utils'

interface HeaderProps { user: SessionUser | null }

const NAV_LINKS = [
  { href: '/dashboard', label: 'Санаанууд' },
  { href: '/matrix',    label: 'Матриц'    },
  { href: '/results',   label: 'Үр дүн'    },
]

const ADMIN_NAME = 'Bilguun'

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  function handleLeave() {
    document.cookie = 'ds_uid=; max-age=0; path=/'
    document.cookie = 'ds_name=; max-age=0; path=/'
    document.cookie = 'ds_role=; max-age=0; path=/'
    window.location.href = '/join'
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">ДС</div>
            <span className="hidden sm:block text-sm font-semibold text-slate-800">Дизайн Спринт</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user?.name === ADMIN_NAME && (
              <Link
                href="/admin"
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                Удирдлага
              </Link>
            )}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLeave}
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                >
                  Гарах
                </button>
              </>
            ) : (
              <Link href="/join" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700">
                Нэгдэх
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
