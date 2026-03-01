'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import type { MatrixIdea } from '@/types'
import { cn } from '@/lib/utils'

interface Quadrant {
  id:          string
  label:       string
  description: string
  impact:      number
  feasibility: number
  color:       string
  headerColor: string
}

const QUADRANTS: Quadrant[] = [
  {
    id:          'high-high',
    label:       'Хурдан ялалт',
    description: 'Өндөр нөлөө · Өндөр боломж',
    impact:      5,
    feasibility: 5,
    color:       'bg-emerald-50 border-emerald-400',
    headerColor: 'bg-emerald-500 text-white',
  },
  {
    id:          'high-low',
    label:       'Том хөрөнгө оруулалт',
    description: 'Өндөр нөлөө · Бага боломж',
    impact:      5,
    feasibility: 2,
    color:       'bg-blue-50 border-blue-400',
    headerColor: 'bg-blue-500 text-white',
  },
  {
    id:          'low-high',
    label:       'Дэмжлэгийн арга хэмжээ',
    description: 'Бага нөлөө · Өндөр боломж',
    impact:      2,
    feasibility: 5,
    color:       'bg-amber-50 border-amber-400',
    headerColor: 'bg-amber-500 text-white',
  },
  {
    id:          'low-low',
    label:       'Дахин авч үзэх',
    description: 'Бага нөлөө · Бага боломж',
    impact:      2,
    feasibility: 2,
    color:       'bg-slate-50 border-slate-300',
    headerColor: 'bg-slate-400 text-white',
  },
]

function IdeaChip({ idea }: { idea: MatrixIdea }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: idea.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs cursor-grab active:cursor-grabbing',
        'shadow-sm hover:shadow-md transition-shadow select-none',
        isDragging && 'opacity-30'
      )}
    >
      <p className="font-medium text-slate-800 line-clamp-2 leading-tight">{idea.title}</p>
      <div className="flex items-center gap-2 mt-1 text-slate-400">
        <span>{idea.category}</span>
        <span>·</span>
        <span>{idea.voteCount} санал</span>
      </div>
    </div>
  )
}

function QuadrantCell({ quadrant, ideas }: { quadrant: Quadrant; ideas: MatrixIdea[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border-2 overflow-hidden min-h-[240px]',
        quadrant.color,
        isOver && 'ring-2 ring-blue-400 ring-offset-1'
      )}
    >
      <div className={cn('px-3 py-2', quadrant.headerColor)}>
        <p className="text-sm font-semibold">{quadrant.label}</p>
        <p className="text-xs opacity-80">{quadrant.description}</p>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {ideas.length === 0 ? (
          <p className="text-xs text-center text-slate-400 mt-4">Санаагаа энд чирнэ үү</p>
        ) : (
          ideas.map((idea) => <IdeaChip key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  )
}

interface MatrixViewProps { sprintId: string }

function assignQuadrant(idea: MatrixIdea): string {
  const highImpact      = idea.impactScore >= 3
  const highFeasibility = idea.feasibilityScore >= 3
  if (highImpact && highFeasibility)  return 'high-high'
  if (highImpact && !highFeasibility) return 'high-low'
  if (!highImpact && highFeasibility) return 'low-high'
  return 'low-low'
}

export default function MatrixView({ sprintId }: MatrixViewProps) {
  const [ideas,      setIdeas]      = useState<MatrixIdea[]>([])
  const [loading,    setLoading]    = useState(true)
  const [activeIdea, setActiveIdea] = useState<MatrixIdea | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => { fetchIdeas() }, [sprintId])

  async function fetchIdeas() {
    const res = await fetch(`/api/ideas?sprintId=${sprintId}&sort=votes`)
    if (!res.ok) return
    const json = await res.json()
    setIdeas(
      (json.data as Array<{
        id: string; title: string; category: string
        impactScore: number; feasibilityScore: number; _count: { votes: number }
      }>).map((idea) => ({
        id: idea.id, title: idea.title, category: idea.category,
        impactScore: idea.impactScore, feasibilityScore: idea.feasibilityScore,
        voteCount: idea._count.votes,
      }))
    )
    setLoading(false)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveIdea(ideas.find((i) => i.id === event.active.id) ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveIdea(null)
    if (!over) return
    const quadrant = QUADRANTS.find((q) => q.id === over.id)
    if (!quadrant) return
    const idea = ideas.find((i) => i.id === active.id)
    if (!idea) return

    setIdeas((prev) =>
      prev.map((i) => i.id === idea.id
        ? { ...i, impactScore: quadrant.impact, feasibilityScore: quadrant.feasibility }
        : i)
    )

    const res = await fetch(`/api/ideas/${idea.id}/matrix`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ impactScore: quadrant.impact, feasibilityScore: quadrant.feasibility }),
    })

    if (!res.ok) {
      toast.error('Байршил хадгалахад алдаа гарлаа')
      setIdeas((prev) =>
        prev.map((i) => i.id === idea.id
          ? { ...i, impactScore: idea.impactScore, feasibilityScore: idea.feasibilityScore }
          : i)
      )
    } else {
      toast.success(`"${idea.title}" → ${quadrant.label}`)
    }
  }

  const ideasByQuadrant = QUADRANTS.reduce<Record<string, MatrixIdea[]>>(
    (acc, q) => { acc[q.id] = ideas.filter((idea) => assignQuadrant(idea) === q.id); return acc },
    {}
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-60 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Axis labels – top */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium text-slate-500">← Бага боломж</span>
        <span className="text-sm font-medium text-slate-500">Өндөр боломж →</span>
      </div>

      <div className="flex gap-4">
        {/* Y axis label */}
        <div className="flex items-center">
          <span
            className="text-sm font-medium text-slate-500 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            ↑ Өндөр нөлөө
          </span>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <QuadrantCell quadrant={QUADRANTS[0]} ideas={ideasByQuadrant['high-high']} />
            <QuadrantCell quadrant={QUADRANTS[1]} ideas={ideasByQuadrant['high-low']}  />
            <QuadrantCell quadrant={QUADRANTS[2]} ideas={ideasByQuadrant['low-high']}  />
            <QuadrantCell quadrant={QUADRANTS[3]} ideas={ideasByQuadrant['low-low']}   />
          </div>

          <DragOverlay>
            {activeIdea && (
              <div className="bg-white border-2 border-blue-500 rounded-lg px-3 py-2 text-xs shadow-lg cursor-grabbing">
                <p className="font-semibold text-slate-900">{activeIdea.title}</p>
                <p className="text-slate-500">{activeIdea.category}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Y axis label – bottom */}
        <div className="flex items-center">
          <span
            className="text-sm font-medium text-slate-500 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(0deg)' }}
          >
            Бага нөлөө ↓
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {QUADRANTS.map((q) => (
          <div key={q.id} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={cn('h-3 w-3 rounded-sm', q.headerColor)} />
            <span className="font-medium">{q.label}</span>
            <span className="text-slate-400">({ideasByQuadrant[q.id].length})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
