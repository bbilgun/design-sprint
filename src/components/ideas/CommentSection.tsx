'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { CommentDTO } from '@/types'
import { formatRelative } from '@/lib/utils'

interface CommentSectionProps {
  ideaId:          string
  onCommentAdded?: () => void
}

export default function CommentSection({ ideaId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [loading,  setLoading]  = useState(true)
  const [content,  setContent]  = useState('')
  const [posting,  setPosting]  = useState(false)

  useEffect(() => { fetchComments() }, [ideaId])

  async function fetchComments() {
    try {
      const res = await fetch(`/api/ideas/${ideaId}/comments`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setComments(json.data)
    } catch { toast.error('Сэтгэгдэл ачаалахад алдаа гарлаа') }
    finally  { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    setPosting(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const json = await res.json()
      setComments((prev) => [...prev, json.data])
      setContent('')
      onCommentAdded?.()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Сэтгэгдэл нийтлэхэд алдаа гарлаа')
    } finally { setPosting(false) }
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-xs text-slate-400">Ачаалж байна...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400">Сэтгэгдэл байхгүй байна. Эхлэгч болоорой!</p>
      ) : (
        <ul className="space-y-2 max-h-44 overflow-y-auto">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium flex-shrink-0 mt-0.5">
                {c.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-slate-700">{c.user.name}</span>
                  <span className="text-xs text-slate-400">{formatRelative(c.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Сэтгэгдэл бичих..."
          rows={2}
          className="flex-1 text-xs rounded-lg border border-slate-200 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
        />
        <button type="submit" disabled={posting || !content.trim()}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-3 py-2 rounded-lg transition-colors">
          {posting ? '...' : 'Нийтлэх'}
        </button>
      </form>
    </div>
  )
}
