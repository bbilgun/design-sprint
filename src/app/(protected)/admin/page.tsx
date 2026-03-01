'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { SprintSessionDTO } from '@/types'
import SprintControl from '@/components/admin/SprintControl'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import Modal from '@/components/ui/Modal'

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

export default function AdminPage() {
  const [sprints,      setSprints]      = useState<SprintSessionDTO[]>([])
  const [activeSprint, setActiveSprint] = useState<SprintSessionDTO | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [showCreate,   setShowCreate]   = useState(false)
  const [creating,     setCreating]     = useState(false)
  const [newTitle,     setNewTitle]     = useState('')
  const [newDesc,      setNewDesc]      = useState('')
  const [formError,    setFormError]    = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/sprint')
      if (res.ok) {
        const json = await res.json()
        const list = json.data as SprintSessionDTO[]
        setSprints(list)
        const active = list.find((s) => ['ACTIVE', 'VOTING'].includes(s.status)) ?? list[0] ?? null
        setActiveSprint(active)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateSprint(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!newTitle.trim()) { setFormError('Гарчиг оруулна уу'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/sprint', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) { setFormError(json.error ?? 'Спринт үүсгэхэд алдаа гарлаа'); return }
      toast.success('Спринт үүслээ!')
      setShowCreate(false)
      setNewTitle('')
      setNewDesc('')
      await fetchData()
    } catch {
      setFormError('Сүлжээний алдаа гарлаа')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-100 rounded w-48 animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Удирдлагын самбар</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + Шинэ спринт
        </button>
      </div>

      {/* Sprint selector */}
      {sprints.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Спринт сонгох</h2>
          <div className="flex flex-wrap gap-2">
            {sprints.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSprint(s)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  activeSprint?.id === s.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sprint control */}
      {activeSprint ? (
        <SprintControl
          sprint={activeSprint}
          onUpdate={(updated) => {
            setActiveSprint(updated)
            setSprints((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-sm text-slate-400">Спринт байхгүй байна. Дээрх товчоор шинэ спринт үүсгэнэ үү.</p>
        </div>
      )}

      {/* Analytics */}
      {activeSprint && (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-lg">📈</span> Спринтийн статистик
          </h2>
          <AnalyticsDashboard sprintId={activeSprint.id} />
        </section>
      )}

      {/* Create sprint modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Шинэ спринт үүсгэх">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Гарчиг <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls}
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="2024 оны хаврын спринт"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Тайлбар</label>
            <textarea
              className={inputCls + ' resize-y min-h-[80px]'}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Спринтийн зорилго, товч тайлбар..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              {creating && (
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {creating ? 'Үүсгэж байна...' : 'Спринт үүсгэх'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
