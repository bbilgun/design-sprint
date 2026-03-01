'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { IdeaDTO, SessionUser } from '@/types'
import { CATEGORIES } from '@/lib/validations'
import Modal from '@/components/ui/Modal'
import IdeaCard from './IdeaCard'
import IdeaForm from './IdeaForm'

interface IdeaListProps {
  sprintId:     string
  sprintStatus: string
  user:         SessionUser
}

type SortOption = 'votes' | 'newest' | 'impact' | 'feasibility'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'votes',       label: 'Санал ихтэй' },
  { value: 'newest',      label: 'Шинэ'        },
  { value: 'impact',      label: 'Нөлөө өндөр' },
  { value: 'feasibility', label: 'Боломжтой'   },
]

export default function IdeaList({ sprintId, sprintStatus, user }: IdeaListProps) {
  const [ideas,       setIdeas]       = useState<IdeaDTO[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('')
  const [sort,        setSort]        = useState<SortOption>('votes')
  const [editingIdea, setEditingIdea] = useState<IdeaDTO | null>(null)
  const [showForm,    setShowForm]    = useState(false)

  const votingOpen      = sprintStatus === 'VOTING'
  const submissionOpen  = sprintStatus === 'ACTIVE'

  const fetchIdeas = useCallback(async () => {
    const params = new URLSearchParams({ sprintId, sort })
    if (category) params.set('category', category)
    if (search)   params.set('search', search)
    const res = await fetch(`/api/ideas?${params}`)
    if (!res.ok) return
    const json = await res.json()
    setIdeas(json.data)
    setLoading(false)
  }, [sprintId, sort, category, search])

  useEffect(() => {
    fetchIdeas()
    const interval = setInterval(fetchIdeas, 30_000)
    return () => clearInterval(interval)
  }, [fetchIdeas])

  async function handleVote(ideaId: string, hasVoted: boolean) {
    const res = await fetch(`/api/ideas/${ideaId}/vote`, { method: hasVoted ? 'DELETE' : 'POST' })
    if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
    await fetchIdeas()
  }

  async function handleDelete(ideaId: string) {
    const res = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Устгахад алдаа гарлаа'); return }
    toast.success('Санаа устгагдлаа')
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId))
  }

  async function handleStatusChange(ideaId: string, status: string) {
    const res = await fetch('/api/admin/mark-final', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId, status }),
    })
    if (!res.ok) { toast.error('Төлөв өөрчлөхөд алдаа гарлаа'); return }
    toast.success('Төлөв шинэчлэгдлээ')
    await fetchIdeas()
  }

  function handleIdeaSuccess(updated: IdeaDTO) {
    setIdeas((prev) => {
      const idx = prev.findIndex((i) => i.id === updated.id)
      if (idx !== -1) { const next = [...prev]; next[idx] = updated; return next }
      return [updated, ...prev]
    })
    setShowForm(false)
    setEditingIdea(null)
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Хайх..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Бүх ангилал</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="flex-1 hidden sm:block" />

        {(submissionOpen || user.name === 'Bilguun') && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Санаа нэмэх
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-52 animate-pulse" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">💡</div>
          <p className="text-slate-500 text-sm">Санаа олдсонгүй.</p>
          {submissionOpen && <p className="text-slate-400 text-xs mt-1">Эхний санаагаа илгээгч болоорой!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              currentUserId={user.id}
              isAdmin={user.name === 'Bilguun'}
              votingOpen={votingOpen}
              onVote={handleVote}
              onDelete={handleDelete}
              onEdit={setEditingIdea}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Шинэ санаа нэмэх" size="lg">
        <IdeaForm sprintId={sprintId} onSuccess={handleIdeaSuccess} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={!!editingIdea} onClose={() => setEditingIdea(null)} title="Санаа засах" size="lg">
        {editingIdea && (
          <IdeaForm sprintId={sprintId} idea={editingIdea} onSuccess={handleIdeaSuccess} onCancel={() => setEditingIdea(null)} />
        )}
      </Modal>
    </div>
  )
}
