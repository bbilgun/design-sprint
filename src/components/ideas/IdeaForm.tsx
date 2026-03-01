'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { IdeaDTO } from '@/types'
import { CATEGORIES } from '@/lib/validations'

interface IdeaFormProps {
  sprintId:  string
  idea?:     IdeaDTO
  onSuccess: (idea: IdeaDTO) => void
  onCancel:  () => void
}

const BUDGET_OPTIONS = ['Үнэгүй', '~$100', '~$300', '~$500', '~$1000', '$1000+', 'Тодорхойгүй']
const TIME_OPTIONS   = ['1–2 цаг', 'Хагас өдөр', 'Бүтэн өдөр', 'Амралтын өдрүүд', 'Хэд хэдэн долоо хоног']

const SECTION = 'text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 mt-6 flex items-center gap-2 after:flex-1 after:h-px after:bg-slate-100'

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

export default function IdeaForm({ sprintId, idea, onSuccess, onCancel }: IdeaFormProps) {
  const isEdit = !!idea

  const [form, setForm] = useState({
    title:                 idea?.title                         ?? '',
    description:           idea?.description                   ?? '',
    category:              idea?.category                      ?? '',
    targetAudience:        idea?.targetAudience                ?? '',
    estimatedParticipants: idea?.estimatedParticipants?.toString() ?? '',
    roughBudget:           idea?.roughBudget                   ?? '',
    timeNeeded:            idea?.timeNeeded                    ?? '',
    problemStatement:      idea?.problemStatement              ?? '',
    valueProposition:      idea?.valueProposition              ?? '',
    expectedOutcome:       idea?.expectedOutcome               ?? '',
    keyRisks:              idea?.keyRisks                      ?? '',
  })
  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function validate() {
    const errs: Record<string, string> = {}
    if (form.title.trim().length < 5)       errs.title       = 'Гарчиг хамгийн багадаа 5 тэмдэгт байх ёстой'
    if (form.description.trim().length < 20) errs.description = 'Тайлбар хамгийн багадаа 20 тэмдэгт байх ёстой'
    if (!form.category)                      errs.category    = 'Ангилал сонгоно уу'
    if (form.estimatedParticipants && isNaN(Number(form.estimatedParticipants)))
      errs.estimatedParticipants = 'Тоо оруулна уу'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      const res = await fetch(isEdit ? `/api/ideas/${idea!.id}` : '/api/ideas', {
        method:  isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:                 form.title.trim(),
          description:           form.description.trim(),
          category:              form.category,
          targetAudience:        form.targetAudience.trim()        || undefined,
          estimatedParticipants: form.estimatedParticipants ? Number(form.estimatedParticipants) : undefined,
          roughBudget:           form.roughBudget                  || undefined,
          timeNeeded:            form.timeNeeded                   || undefined,
          problemStatement:      form.problemStatement.trim()      || undefined,
          valueProposition:      form.valueProposition.trim()      || undefined,
          expectedOutcome:       form.expectedOutcome.trim()       || undefined,
          keyRisks:              form.keyRisks.trim()              || undefined,
          ...(!isEdit && { sprintId }),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.details) {
          const errs: Record<string, string> = {}
          for (const [f, msgs] of Object.entries(json.details as Record<string, string[]>))
            errs[f] = msgs[0] ?? 'Алдаа'
          setErrors(errs)
        } else { toast.error(json.error ?? 'Алдаа гарлаа') }
        return
      }
      toast.success(isEdit ? 'Санаа шинэчлэгдлээ!' : 'Санаа илгээгдлээ!')
      onSuccess(json.data)
    } catch { toast.error('Сүлжээний алдаа гарлаа') }
    finally  { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">

      <p className={SECTION}>Санааны мэдээлэл</p>
      <div className="space-y-4">
        <Field label="Гарчиг" required error={errors.title}>
          <input className={inputCls} value={form.title} onChange={set('title')}
            placeholder="Товч, ойлгомжтой гарчиг бичнэ үү" maxLength={120} />
        </Field>
        <Field label="Тайлбар" required error={errors.description}>
          <textarea className={inputCls + ' resize-y min-h-[80px]'} value={form.description}
            onChange={set('description')} rows={3}
            placeholder="Арга хэмжээний агуулга, явц, гишүүд юу хийх вэ гэдгийг тайлбарлана уу" />
        </Field>
        <Field label="Ангилал" required error={errors.category}>
          <select className={inputCls} value={form.category} onChange={set('category')}>
            <option value="">Ангилал сонгох...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <p className={SECTION}>Зорилтот үзэгчид ба логистик</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Зорилтот үзэгчид">
          <input className={inputCls} value={form.targetAudience} onChange={set('targetAudience')}
            placeholder="Бүх гишүүд, Анхлан суралцагчид..." />
        </Field>
        <Field label="Оролцогчдын тоо" error={errors.estimatedParticipants}>
          <input className={inputCls} type="number" min={1} value={form.estimatedParticipants}
            onChange={set('estimatedParticipants')} placeholder="Жишээ: 30" />
        </Field>
        <Field label="Ойролцоо төсөв">
          <select className={inputCls} value={form.roughBudget} onChange={set('roughBudget')}>
            <option value="">Сонгох...</option>
            {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Шаардлагатай хугацаа">
          <select className={inputCls} value={form.timeNeeded} onChange={set('timeNeeded')}>
            <option value="">Сонгох...</option>
            {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <p className={SECTION}>Үнэ цэн ба асуудал</p>
      <div className="space-y-4">
        <Field label="Шийдэх асуудал">
          <textarea className={inputCls + ' resize-y'} value={form.problemStatement}
            onChange={set('problemStatement')} rows={2}
            placeholder="Гишүүдийн ямар хэрэгцээ, дутагдлыг хангах вэ?" />
        </Field>
        <Field label="Үнэ цэнийн санал">
          <textarea className={inputCls + ' resize-y'} value={form.valueProposition}
            onChange={set('valueProposition')} rows={2}
            placeholder="Яагаад энэ арга хэмжээ зохион байгуулах нь зүйтэй вэ?" />
        </Field>
      </div>

      <p className={SECTION}>Үр дүн ба эрсдэл</p>
      <div className="space-y-4">
        <Field label="Хүлээгдэх үр дүн">
          <textarea className={inputCls + ' resize-y'} value={form.expectedOutcome}
            onChange={set('expectedOutcome')} rows={2}
            placeholder="Амжилттай болсон гэж юугаар үнэлэх вэ? Гишүүд юу авч явах вэ?" />
        </Field>
        <Field label="Гол эрсдэлүүд">
          <textarea className={inputCls + ' resize-y'} value={form.keyRisks}
            onChange={set('keyRisks')} rows={2}
            placeholder="Төсөв хэтрэх, цөөн хүн ирэх, заал олдохгүй байх гэх мэт..." />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          Болих
        </button>
        <button type="submit" disabled={submitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors">
          {submitting ? 'Илгээж байна...' : isEdit ? 'Хадгалах' : 'Санаа илгээх'}
        </button>
      </div>
    </form>
  )
}
