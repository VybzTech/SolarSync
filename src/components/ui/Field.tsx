import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const CONTROL_BASE =
  'w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink ' +
  'shadow-inset placeholder:text-ink-3/70 transition ' +
  'hover:border-line-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 ' +
  'focus:outline-none disabled:opacity-60'

interface FieldWrapperProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string | null
  required?: boolean
  children: ReactNode
}

function FieldWrapper({ label, htmlFor, hint, error, required, children }: FieldWrapperProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-1 text-fg-warn" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {hint ? <span className="text-2xs text-ink-3">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-fg-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: string | null
}

export function TextField({ label, hint, error, className, ...rest }: TextFieldProps) {
  const generatedId = useId()
  const id = rest.id ?? generatedId
  return (
    <FieldWrapper label={label} htmlFor={id} hint={hint} error={error} required={rest.required}>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_BASE, error && 'border-fg-danger/60', className)}
      />
    </FieldWrapper>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: ReactNode
  error?: string | null
}

export function TextAreaField({ label, hint, error, className, ...rest }: TextAreaFieldProps) {
  const generatedId = useId()
  const id = rest.id ?? generatedId
  return (
    <FieldWrapper label={label} htmlFor={id} hint={hint} error={error} required={rest.required}>
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_BASE, 'resize-y', error && 'border-fg-danger/60', className)}
      />
    </FieldWrapper>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: ReactNode
  error?: string | null
  options: { value: string; label: string }[]
}

export function SelectField({
  label,
  hint,
  error,
  options,
  className,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId()
  const id = rest.id ?? generatedId
  return (
    <FieldWrapper label={label} htmlFor={id} hint={hint} error={error} required={rest.required}>
      <select
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL_BASE, 'appearance-none bg-none pr-9', className)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Chevron drawn separately so it inherits the theme text colour
          instead of being baked into a background-image data URI. */}
      <span className="pointer-events-none relative block">
        <svg
          className="absolute -top-[2.15rem] right-3 h-4 w-4 text-ink-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </FieldWrapper>
  )
}
