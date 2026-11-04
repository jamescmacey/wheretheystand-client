/**
 * How distances are written, matching `utils/elections/format.ts`.
 *
 * New Zealand English, and null stays null so a caller can choose its own em
 * dash rather than being handed "0 m" for a distance nobody measured.
 */

const LOCALE = 'en-NZ'

/**
 * A distance, from metres.
 *
 * Under a kilometre reads in metres, rounded to 10 m: these come from Algolia's
 * own `geoDistance` against a browser location that is itself accurate to tens
 * of metres, so "347 m" claims a precision nobody has. Over a kilometre reads
 * in kilometres, with one decimal place only while that decimal still means
 * something.
 */
export function formatDistance(metres: number | null | undefined): string | null {
  if (metres === null || metres === undefined || !Number.isFinite(metres)) return null
  if (metres < 0) return null

  if (metres < 1000) {
    return `${Math.round(metres / 10) * 10} m`
  }

  const km = metres / 1000
  const digits = km < 10 ? 1 : 0
  return `${km.toLocaleString(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} km`
}
