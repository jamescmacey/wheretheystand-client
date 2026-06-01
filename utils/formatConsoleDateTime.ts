import { format } from 'date-fns'

/** e.g. 12 December 2026 at 12.34 pm */
export function formatConsoleDateTime(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso
  return format(date, "d MMMM yyyy 'at' h.mm a").replace(
    /\s[AP]M$/i,
    (m) => m.toLowerCase(),
  )
}
