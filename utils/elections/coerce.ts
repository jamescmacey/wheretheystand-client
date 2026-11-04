/**
 * Coercions for normalising election payloads.
 *
 * The Electoral Commission feed is not consistent about types, and neither is
 * what the worker writes to Firestore: the same field arrives as a string in
 * one document and a number in the next. These helpers push everything into the
 * shape the contract declares, rather than letting components deal with it.
 */

/** A number from whatever the source provided, or null if it is not one. */
export function toInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

export function toFloat(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toBool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}

export function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

/**
 * Repair the timezone offsets the results feed produces.
 *
 * Timestamps arrive as "2020-11-20T00:00:00+1300". The offset has no colon, so
 * it is not valid ISO 8601 and Date parsing of it is not portable. Firestore
 * may also hand back a Timestamp object or epoch seconds if the worker is ever
 * changed to write native types, so accept those too.
 */
export function toIsoString(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }

  // A Firestore Timestamp, without importing the SDK to recognise it.
  if (typeof value === 'object') {
    const candidate = value as { toDate?: () => Date, seconds?: number }
    if (typeof candidate.toDate === 'function') {
      return toIsoString(candidate.toDate())
    }
    if (typeof candidate.seconds === 'number') {
      return new Date(candidate.seconds * 1000).toISOString()
    }
    return null
  }

  if (typeof value === 'number') {
    // Epoch seconds, matching updated_timestamp.
    return new Date(value * 1000).toISOString()
  }

  const text = String(value).trim()
  const repaired = text.replace(/([+-])(\d{2})(\d{2})$/, '$1$2:$3')
  const parsed = new Date(repaired)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

/** Epoch seconds, preferring an explicit timestamp over a parsed date. */
export function toEpochSeconds(explicit: unknown, isoFallback: string | null): number | null {
  const direct = toFloat(explicit)
  if (direct !== null) return direct
  if (!isoFallback) return null
  const parsed = new Date(isoFallback)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime() / 1000
}
