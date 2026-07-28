import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const CONTROL_BASE =
  'w-full rounded-lg bg-canvas-deep px-3.5 py-2.5 text-sm text-slate-100 ' +
  'ring-1 ring-inset ring-hairline-strong placeholder:text-muted ' +
  'transition focus:ring-2 focus:ring-solar-500 disabled:opacity-60'

interface FieldWrapperProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string | null
  required?: boolean
  children: ReactNode
}

function FieldWrapper({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: FieldWrapperProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-300">
          {label}
          {required ? (
            <span className="ml-1 text-solar-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {hint ? <span className="text-2xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-rose-400" role="alert">
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
    <FieldWrapper
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={rest.required}
    >
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_BASE, error && 'ring-rose-500/60', className)}
      />
    </FieldWrapper>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: ReactNode
  error?: string | null
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  ...rest
}: TextAreaFieldProps) {
  const generatedId = useId()
  const id = rest.id ?? generatedId
  return (
    <FieldWrapper
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={rest.required}
    >
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL_BASE, 'resize-y', error && 'ring-rose-500/60', className)}
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
    <FieldWrapper
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={rest.required}
    >
      <select
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL_BASE, 'appearance-none pr-9', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-canvas-deep">
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}
