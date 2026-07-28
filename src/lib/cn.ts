/**
 * Minimal class-name joiner. Kept dependency-free deliberately — the portal
 * has no need for the conditional-variant weight of clsx + tailwind-merge.
 */
export type ClassValue = string | number | null | false | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
