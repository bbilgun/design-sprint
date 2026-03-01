import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import IdeaList from '@/components/ideas/IdeaList'

export const dynamic = 'force-dynamic'

const statusLabel: Record<string, { text: string; color: string; dot: string }> = {
  DRAFT:   { text: 'Ноорог',         color: 'bg-slate-100 text-slate-600 border-slate-200',   dot: 'bg-slate-400'  },
  ACTIVE:  { text: 'Санаа хүлээн авч байна', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  VOTING:  { text: 'Санал хураалт нээлттэй', color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500'   },
  CLOSED:  { text: 'Дууссан',        color: 'bg-slate-100 text-slate-500 border-slate-200',   dot: 'bg-slate-400'  },
}

export default async function DashboardPage() {
  const user = getSessionUser()
  if (!user) redirect('/join')

  const sprint = await prisma.sprintSession.findFirst({
    where:   { status: { in: ['ACTIVE', 'VOTING', 'CLOSED'] } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ideas: true } } },
  }) ?? await prisma.sprintSession.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ideas: true } } },
  })

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Спринт эхлээгүй байна</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          {user.name === 'Bilguun'
            ? 'Удирдлагын хэсгээс шинэ спринт үүсгэнэ үү.'
            : 'Удирдлага спринт эхлүүлэхийг хүлээнэ үү.'}
        </p>
      </div>
    )
  }

  const st = statusLabel[sprint.status] ?? statusLabel['DRAFT']

  return (
    <div className="space-y-6">
      {/* Sprint header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot} ${sprint.status !== 'CLOSED' ? 'animate-pulse' : ''}`} />
                {st.text}
              </span>
              <span className="text-xs text-slate-400">{sprint._count.ideas} санаа</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">{sprint.title}</h1>
            {sprint.description && <p className="text-sm text-slate-500 mt-0.5">{sprint.description}</p>}
          </div>
        </div>
      </div>

      <IdeaList sprintId={sprint.id} sprintStatus={sprint.status} user={user} />
    </div>
  )
}
