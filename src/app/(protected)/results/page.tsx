import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

const statusMn: Record<string, string> = {
  DRAFT: 'Ноорог', SHORTLISTED: 'Нэр дэвшсэн', SELECTED: 'Сонгогдсон',
}

export default async function ResultsPage() {
  const user = getSessionUser()
  if (!user) redirect('/join')

  const sprint = await prisma.sprintSession.findFirst({
    where: { status: { in: ['VOTING', 'CLOSED'] } },
    orderBy: { createdAt: 'desc' },
  }) ?? await prisma.sprintSession.findFirst({ orderBy: { createdAt: 'desc' } })

  const selectedIdeas = sprint ? await prisma.idea.findMany({
    where:   { sprintId: sprint.id, status: 'SELECTED' },
    include: { author: { select: { name: true } }, _count: { select: { votes: true } } },
    orderBy: { votes: { _count: 'desc' } },
  }) : []

  const topIdeas = sprint ? await prisma.idea.findMany({
    where:   { sprintId: sprint.id },
    include: { author: { select: { name: true } }, _count: { select: { votes: true } } },
    orderBy: { votes: { _count: 'desc' } },
    take:    10,
  }) : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Үр дүн</h1>
        {sprint && <p className="text-sm text-slate-500 mt-0.5">{sprint.title}</p>}
      </div>

      {/* Selected */}
      {selectedIdeas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-lg">🏆</span> Сонгогдсон арга хэмжээнүүд
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedIdeas.map((idea, i) => (
              <div key={idea.id} className="bg-white rounded-xl border-2 border-emerald-400 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-black text-emerald-400">#{i + 1}</span>
                  <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Сонгогдсон</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{idea.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{idea.category} · {idea.author.name}</p>
                <p className="text-sm text-slate-600 line-clamp-3">{idea.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                  <span>{idea._count.votes} санал</span>
                  <span>Нөлөө {idea.impactScore}/5 · Боломж {idea.feasibilityScore}/5</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top voted table */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> Санал ихтэй санаанууд
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Санаа', 'Ангилал', 'Зохиогч', 'Санал', 'Төлөв'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topIdeas.map((idea, i) => (
                <tr key={idea.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-300">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">{idea.title}</td>
                  <td className="px-4 py-3 text-slate-500">{idea.category}</td>
                  <td className="px-4 py-3 text-slate-500">{idea.author.name}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{idea._count.votes}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {statusMn[idea.status] ?? idea.status}
                    </span>
                  </td>
                </tr>
              ))}
              {topIdeas.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">Санаа байхгүй байна.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="text-lg">📈</span> Статистик
        </h2>
        <AnalyticsDashboard sprintId={sprint?.id} />
      </section>
    </div>
  )
}
