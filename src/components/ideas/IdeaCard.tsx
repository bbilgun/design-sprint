'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { IdeaDTO } from '@/types'
import { cn, formatRelative } from '@/lib/utils'
import CommentSection from './CommentSection'

interface IdeaCardProps {
  idea:            IdeaDTO
  currentUserId:   string
  isAdmin:         boolean
  votingOpen:      boolean
  onVote:          (id: string, voted: boolean) => Promise<void>
  onDelete?:       (id: string) => void
  onEdit?:         (idea: IdeaDTO) => void
  onStatusChange?: (id: string, status: string) => void
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Workshop:    { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  Hackathon:   { bg: 'bg-violet-50', text: 'text-violet-700' },
  Social:      { bg: 'bg-green-50',  text: 'text-green-700'  },
  'Tech Talk': { bg: 'bg-orange-50', text: 'text-orange-700' },
  Panel:       { bg: 'bg-pink-50',   text: 'text-pink-700'   },
  Other:       { bg: 'bg-slate-100', text: 'text-slate-600'  },
}

const statusMn: Record<string, string> = {
  DRAFT: 'Ноорог', SHORTLISTED: 'Нэр дэвшсэн', SELECTED: 'Сонгогдсон',
}
const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-500',
  SHORTLISTED: 'bg-blue-50 text-blue-600',
  SELECTED: 'bg-emerald-50 text-emerald-700',
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="text-xs text-slate-400 w-36 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-700">{value}</span>
    </div>
  )
}

export default function IdeaCard({ idea, currentUserId, isAdmin, votingOpen, onVote, onDelete, onEdit, onStatusChange }: IdeaCardProps) {
  const [voting,         setVoting]         = useState(false)
  const [showDetails,    setShowDetails]    = useState(false)
  const [showComments,   setShowComments]   = useState(false)
  const [localVoted,     setLocalVoted]     = useState(idea.hasVoted ?? false)
  const [localVoteCount, setLocalVoteCount] = useState(idea._count.votes)
  const [commentCount,   setCommentCount]   = useState(idea._count.comments)

  const isOwner    = idea.author.id === currentUserId
  const catColor   = categoryColors[idea.category] ?? categoryColors['Other']
  const hasExtended = idea.targetAudience || idea.estimatedParticipants || idea.roughBudget ||
    idea.timeNeeded || idea.problemStatement || idea.valueProposition || idea.expectedOutcome || idea.keyRisks

  async function handleVote() {
    if (voting) return
    setVoting(true)
    try {
      await onVote(idea.id, localVoted)
      setLocalVoted(!localVoted)
      setLocalVoteCount((p) => localVoted ? p - 1 : p + 1)
    } catch { toast.error('Санал өгөхөд алдаа гарлаа') }
    finally  { setVoting(false) }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">

      {/* Top */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', catColor.bg, catColor.text)}>
              {idea.category}
            </span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[idea.status])}>
              {statusMn[idea.status] ?? idea.status}
            </span>
          </div>

          {/* Vote */}
          <button
            onClick={handleVote}
            disabled={!votingOpen || voting}
            className={cn(
              'flex flex-col items-center min-w-[40px] py-1.5 px-2 rounded-lg border text-xs font-bold transition-all',
              localVoted
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500',
              (!votingOpen || voting) && 'opacity-40 cursor-not-allowed'
            )}
            title={votingOpen ? (localVoted ? 'Санал буцаах' : 'Санал өгөх') : 'Санал хураалт хаалттай'}
          >
            <svg className="h-3.5 w-3.5" fill={localVoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {localVoteCount}
          </button>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-2">{idea.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{idea.description}</p>

        {/* Quick stats */}
        {(idea.roughBudget || idea.estimatedParticipants || idea.timeNeeded) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {idea.roughBudget && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                💰 {idea.roughBudget}
              </span>
            )}
            {idea.estimatedParticipants && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                👥 ~{idea.estimatedParticipants}
              </span>
            )}
            {idea.timeNeeded && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                ⏱ {idea.timeNeeded}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {showDetails && hasExtended && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 space-y-2 rounded-b-none">
          <Detail label="Зорилтот үзэгчид"     value={idea.targetAudience} />
          <Detail label="Шийдэх асуудал"        value={idea.problemStatement} />
          <Detail label="Үнэ цэнийн санал"      value={idea.valueProposition} />
          <Detail label="Хүлээгдэх үр дүн"      value={idea.expectedOutcome} />
          <Detail label="Гол эрсдэлүүд"         value={idea.keyRisks} />
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">
            <span className="font-medium text-slate-600">{idea.author.name}</span>
            {' · '}{formatRelative(idea.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasExtended && (
            <button onClick={() => setShowDetails((s) => !s)}
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              {showDetails ? '▲ Хураах' : '▼ Дэлгэрэнгүй'}
            </button>
          )}

          <button onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {commentCount} сэтгэгдэл
          </button>

          <div className="flex-1" />

          {(isOwner || isAdmin) && onEdit && (
            <button onClick={() => onEdit(idea)}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
              Засах
            </button>
          )}

          {isAdmin && onStatusChange && (
            <select value={idea.status} onChange={(e) => onStatusChange(idea.id, e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="DRAFT">Ноорог</option>
              <option value="SHORTLISTED">Нэр дэвшсэн</option>
              <option value="SELECTED">Сонгогдсон</option>
            </select>
          )}

          {isAdmin && onDelete && (
            <button onClick={() => { if (window.confirm('Санааг устгах уу?')) onDelete(idea.id) }}
              className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              Устгах
            </button>
          )}
        </div>

        {showComments && (
          <div className="mt-3">
            <CommentSection ideaId={idea.id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
          </div>
        )}
      </div>
    </div>
  )
}
