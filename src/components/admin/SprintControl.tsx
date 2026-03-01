'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { SprintSessionDTO } from '@/types'

interface SprintControlProps {
  sprint:   SprintSessionDTO
  onUpdate: (updated: SprintSessionDTO) => void
}

const STATUS_MN: Record<string, string> = {
  DRAFT:  'Ноорог',               ACTIVE: 'Санаа хүлээн авч байна',
  VOTING: 'Санал хураалт нээлттэй', CLOSED: 'Дууссан',
}
const STATUS_COLOR: Record<string, string> = {
  DRAFT:  'bg-slate-100 text-slate-600',   ACTIVE: 'bg-emerald-50 text-emerald-700',
  VOTING: 'bg-amber-50 text-amber-700',    CLOSED: 'bg-slate-100 text-slate-500',
}
const STATUS_FLOW: Record<string, { label: string; next: string }> = {
  DRAFT:  { label: 'Санаа хүлээн авч эхлэх', next: 'ACTIVE'  },
  ACTIVE: { label: 'Санал хураалт эхлүүлэх', next: 'VOTING'  },
  VOTING: { label: 'Спринт дуусгах',          next: 'CLOSED'  },
  CLOSED: { label: 'Дууссан',                 next: 'CLOSED'  },
}

export default function SprintControl({ sprint, onUpdate }: SprintControlProps) {
  const [loading, setLoading] = useState(false)
  const flow = STATUS_FLOW[sprint.status]

  async function handleStatusChange() {
    if (sprint.status === 'CLOSED') return
    setLoading(true)
    try {
      const res = await fetch(`/api/sprint/${sprint.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: flow.next }),
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      toast.success(`Спринт "${STATUS_MN[flow.next] ?? flow.next}" төлөвт шилжлээ`)
      onUpdate(json.data)
    } catch {
      toast.error('Спринтийн төлөв өөрчлөхөд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    const res = await fetch(`/api/admin/export?sprintId=${sprint.id}`)
    if (!res.ok) { toast.error('Экспортлох өгөгдөл байхгүй байна'); return }
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `sprint-${sprint.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">Спринт удирдлага</h2>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLOR[sprint.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {STATUS_MN[sprint.status] ?? sprint.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-slate-600 mb-5">
        <p><span className="font-medium text-slate-800">Гарчиг:</span> {sprint.title}</p>
        {sprint.description && <p className="text-xs text-slate-400">{sprint.description}</p>}
        <p><span className="font-medium text-slate-800">Санааны тоо:</span> {sprint._count?.ideas ?? 0}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {sprint.status !== 'CLOSED' && (
          <button
            onClick={handleStatusChange}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {flow.label}
          </button>
        )}
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          CSV экспорт
        </button>
      </div>
    </div>
  )
}
