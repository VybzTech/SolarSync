import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { useSubmitChangeRequest } from '@/hooks/usePortalData'
import type { ChangeRequestKind, NewChangeRequest, SeverityLevel } from '@/types/domain'

const TITLE_MIN = 3
const TITLE_MAX = 160
const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 4000

const KIND_OPTIONS: { value: ChangeRequestKind; label: string }[] = [
  { value: 'Feature', label: 'Feature request — new capability' },
  { value: 'Enhancement', label: 'Enhancement — improve existing behaviour' },
  { value: 'Bug', label: 'Bug report — something is broken' },
]

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 'Low', label: 'Low — minor or cosmetic' },
  { value: 'Medium', label: 'Medium — partial degradation' },
  { value: 'High', label: 'High — major feature unavailable' },
  { value: 'Critical', label: 'Critical — outage or security issue' },
]

interface FieldErrors {
  title?: string
  description?: string
}

export function RequestForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const submitRequest = useSubmitChangeRequest()
  const { notify } = useToast()

  const [form, setForm] = useState<NewChangeRequest>({
    title: '',
    description: '',
    kind: 'Feature',
    severity: 'Medium',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const next: FieldErrors = {}
    const title = form.title.trim()
    const description = form.description.trim()

    if (title.length < TITLE_MIN) {
      next.title = `Give your request a title of at least ${TITLE_MIN} characters.`
    } else if (title.length > TITLE_MAX) {
      next.title = `Titles are limited to ${TITLE_MAX} characters.`
    }

    if (description.length < DESCRIPTION_MIN) {
      next.description = `Add at least ${DESCRIPTION_MIN} characters so the team can scope this accurately.`
    } else if (description.length > DESCRIPTION_MAX) {
      next.description = `Descriptions are limited to ${DESCRIPTION_MAX} characters.`
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)
    try {
      const created = await submitRequest(form)
      notify(`Request ${created.reference} submitted. The team has been notified.`)
      setForm({ title: '', description: '', kind: 'Feature', severity: 'Medium' })
      setErrors({})
      onSubmitted?.()
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : 'Could not submit your request.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader
        eyebrow="New submission"
        title="Raise a change request"
        description="Requests are triaged against the executed SLA. Critical incidents are always prioritised ahead of feature work."
      />
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5" noValidate>
        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Add grid-import kWh to the monthly statement"
          maxLength={TITLE_MAX}
          error={errors.title}
          hint={`${form.title.length}/${TITLE_MAX}`}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Request type"
            value={form.kind}
            onChange={(e) =>
              setForm({ ...form, kind: e.target.value as ChangeRequestKind })
            }
            options={KIND_OPTIONS}
          />
          <SelectField
            label="Severity"
            value={form.severity}
            onChange={(e) =>
              setForm({ ...form, severity: e.target.value as SeverityLevel })
            }
            options={SEVERITY_OPTIONS}
          />
        </div>

        <TextAreaField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the change, where it appears, and the outcome you expect. Include screenshots or inverter IDs where relevant."
          rows={5}
          maxLength={DESCRIPTION_MAX}
          error={errors.description}
          hint={`${form.description.length}/${DESCRIPTION_MAX}`}
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-2xs text-ink-3">
            Counts toward your monthly SLA allowance.
          </p>
          <Button
            type="submit"
            loading={submitting}
            icon={<Send className="h-4 w-4" aria-hidden="true" />}
          >
            {submitting ? 'Submitting' : 'Submit request'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
