import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import MatrixView from '@/components/matrix/MatrixView'

export const dynamic = 'force-dynamic'

const STATUS_MN: Record<string, string> = {
  DRAFT: 'Ноорог', ACTIVE: 'Санаа хүлээн авч байна',
  VOTING: 'Санал хураалт', CLOSED: 'Дууссан',
}
const STATUS_COLOR: Record<string, string> = {
  DRAFT:  'bg-slate-100 text-slate-600', ACTIVE: 'bg-emerald-50 text-emerald-700',
  VOTING: 'bg-amber-50 text-amber-700',  CLOSED: 'bg-slate-100 text-slate-500',
}

export default async function MatrixPage() {
  const user = getSessionUser()
  if (!user) redirect('/join')

  const sprint = await prisma.sprintSession.findFirst({
    where:   { status: { in: ['ACTIVE', 'VOTING', 'CLOSED'] } },
    orderBy: { createdAt: 'desc' },
  }) ?? await prisma.sprintSession.findFirst({ orderBy: { createdAt: 'desc' } })

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-sm text-slate-500">Спринт олдсонгүй.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-slate-900">Нөлөө × Боломж Матриц</h1>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLOR[sprint.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {STATUS_MN[sprint.status] ?? sprint.status}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Санааг квадрант руу чирж оруулснаар нөлөө болон боломжийн оноог шинэчилнэ. Өөрчлөлт автоматаар хадгалагдана.
        </p>
      </div>

      <MatrixView sprintId={sprint.id} />
    </div>
  )
}
