/**
 * How the dashboard writes numbers.
 *
 * These were defined again in each component that needed them, which is fine
 * until two of them disagree -- one showing 38.1 per cent and another 38%, of
 * the same tally, on the same screen.
 *
 * New Zealand English throughout: thousands separated, and times written the
 * way the rest of the site writes them.
 */

const LOCALE = 'en-NZ'

/** A vote count. Null stays null so a caller can choose its own em dash. */
export function formatCount(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return value.toLocaleString(LOCALE)
}

/** A share, already expressed as a percentage rather than a fraction. */
export function formatPercent(
  value: number | null | undefined,
  digits = 1,
): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return `${value.toFixed(digits)}%`
}

/**
 * A margin, in points.
 *
 * Spelled out rather than given as a percentage, because a margin in points is
 * a different thing from a share and writing both with a per cent sign invites
 * them to be read as the same.
 *
 * Precision grows for the tightest races. Mt Albert in 2023 was won by 18 votes,
 * which at one decimal place reads "0.0 percentage points" -- indistinguishable
 * from a dead heat, on exactly the seats where the difference matters most.
 */
export function formatPoints(
  value: number | null | undefined,
  digits?: number,
): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  const places = digits ?? (Math.abs(value) < 0.1 && value !== 0 ? 2 : 1)
  return `${value.toFixed(places)} percentage points`
}

/**
 * A clock time, as New Zealand writes it: "9.35 pm".
 *
 * `toLocaleTimeString` gives "9:35 pm" or "9:35 p.m." depending on the browser's
 * ICU data, so both are normalised here rather than trusting either.
 */
export function formatTime(value: Date | null | undefined): string | null {
  if (!value || Number.isNaN(value.getTime())) return null
  return value
    .toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?([ap])\.?m\.?/i, (_, meridiem: string) => ` ${meridiem.toLowerCase()}m`)
    .replace(':', '.')
}

/** Epoch seconds, as carried on a results set, to a Date. */
export function fromEpochSeconds(value: number | null | undefined): Date | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return new Date(value * 1000)
}

/** "1 seat" / "2 seats", and so on for anything else that needs counting. */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatCount(count) ?? count} ${count === 1 ? singular : plural}`
}
