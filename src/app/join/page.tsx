'use client'

import { useState } from 'react'

export default function JoinPage() {
  const [name,    setName]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Нэрээ оруулна уу'); return }
    if (trimmed.length < 2) { setError('Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'); return }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/join', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: trimmed }),
      })

      if (!res.ok) {
        let msg = 'Алдаа гарлаа'
        try { const json = await res.json(); msg = json.error ?? msg } catch {}
        setError(msg)
        setLoading(false)
        return
      }

      window.location.href = '/dashboard'
    } catch {
      setError('Сүлжээний алдаа гарлаа')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">ДС</div>
          <span className="text-white font-semibold text-sm">Дизайн Спринт</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Хамтдаа шилдэг<br />арга хэмжээгээ<br />
            <span className="text-blue-400">төлөвлөцгөөе.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Санаагаа илгээж, бусдын санааг дэмжиж,<br />
            клубийн ирэх улирлын хөтөлбөрийг хамтдаа бүтээцгээе.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { icon: '💡', text: 'Санаагаа илгээнэ үү' },
            { icon: '🗳️', text: 'Санал өгч шилдэг санааг дэмжинэ үү' },
            { icon: '🚀', text: 'Шилдэг 3–5 арга хэмжээг хамтдаа сонгоно' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="text-lg">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-slate-50">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs">ДС</div>
            <span className="font-semibold text-slate-800">Дизайн Спринт</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Нэгдэх</h2>
          <p className="text-slate-500 text-sm mb-8">Нэрээ оруулаад шууд эхэлнэ үү. Нууц үг шаардлагагүй.</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Таны нэр</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Жишээ: Болд"
                autoFocus
                maxLength={80}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? 'Нэгдэж байна...' : 'Нэгдэх →'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Техникийн клубийн гишүүдэд зориулсан платформ
          </p>
        </div>
      </div>
    </div>
  )
}
