'use client'

import { useEffect, useState } from 'react'
import type { AnalyticsData } from '@/types'

interface Props { sprintId?: string }

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  )
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-32 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
    </div>
  )
}

const CAT_COLORS: Record<string, string> = {
  Workshop: 'bg-blue-500', Hackathon: 'bg-violet-500', Social: 'bg-emerald-500',
  'Tech Talk': 'bg-orange-500', Panel: 'bg-pink-500', Other: 'bg-slate-400',
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-400', SHORTLISTED: 'bg-blue-500', SELECTED: 'bg-emerald-500',
}
const STATUS_MN: Record<string, string> = {
  DRAFT: 'Ноорог', SHORTLISTED: 'Нэр дэвшсэн', SELECTED: 'Сонгогдсон',
}

export default function AnalyticsDashboard({ sprintId }: Props) {
  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(sprintId ? `/api/analytics?sprintId=${sprintId}` : '/api/analytics')
      .then((r) => r.json())
      .then((j) => { setData(j.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sprintId])

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  )
  if (!data) return <p className="text-sm text-slate-500">Статистик ачаалахад алдаа гарлаа.</p>

  const maxCat    = Math.max(...data.ideasByCategory.map((c) => c.count), 1)
  const maxStatus = Math.max(...data.ideasByStatus.map((s) => s.count), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Нийт санаа"     value={data.totalIdeas}    icon="💡" />
        <StatCard label="Нийт санал"     value={data.totalVotes}    icon="🗳️" />
        <StatCard label="Нийт сэтгэгдэл" value={data.totalComments} icon="💬" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Top ideas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Хамгийн их санал авсан</h3>
          <ul className="space-y-3">
            {data.topIdeas.map((idea, i) => (
              <li key={idea.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-300 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{idea.title}</p>
                  <p className="text-xs text-slate-400">{idea.category}</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {idea.votes}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* By category */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Ангиллаар</h3>
          <div className="space-y-3">
            {data.ideasByCategory.map((c) => (
              <Bar key={c.category} label={c.category} value={c.count} max={maxCat} color={CAT_COLORS[c.category] ?? 'bg-slate-400'} />
            ))}
          </div>
        </div>

        {/* By status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Төлөвөөр</h3>
          <div className="space-y-3">
            {data.ideasByStatus.map((s) => (
              <Bar key={s.status} label={STATUS_MN[s.status] ?? s.status} value={s.count} max={maxStatus} color={STATUS_COLORS[s.status] ?? 'bg-slate-400'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
