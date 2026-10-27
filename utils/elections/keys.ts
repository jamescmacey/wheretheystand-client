import type {
  EntityNumber,
  ResultsCategory,
  ResultsLevel,
  ResultsSet,
} from '~/types/elections'

/**
 * Identify a results set independently of where it came from.
 *
 * The same tally arrives from Firestore during an event and from a published
 * snapshot afterwards, carrying different record identifiers each time. Keying
 * on what the tally *is* lets an incoming update replace the right entry
 * whichever transport delivered it.
 *
 * Kept in step with ResultsSet.canonical_key in the Django models.
 */
export function resultsSetKey(parts: {
  results_level: ResultsLevel
  results_category: ResultsCategory
  electorate?: EntityNumber | null
  voting_place?: EntityNumber | null
  result_number?: number | null
}): string {
  return [
    parts.results_level,
    parts.results_category,
    parts.electorate ?? '-',
    parts.voting_place ?? '-',
    parts.result_number ?? '-',
  ].join(':')
}

/** Scope a cache to one results version: entity numbers mean nothing without one. */
export function electionKey(electionSlug: string, resultsVersionSlug: string): string {
  return `${electionSlug}::${resultsVersionSlug}`
}

/**
 * Whether an incoming results set should replace the one already held.
 *
 * Firestore snapshots can arrive out of order, and a slow snapshot fetch can
 * land after a live update, so the newer tally is not necessarily the one that
 * arrived last. Anything without a timestamp is accepted: refusing it would
 * mean never showing data the source could not date.
 */
export function isNewerResultsSet(incoming: ResultsSet, existing: ResultsSet | undefined): boolean {
  if (!existing) return true
  if (incoming.updated_timestamp === null || existing.updated_timestamp === null) return true
  return incoming.updated_timestamp >= existing.updated_timestamp
}

/** Index a list by a key, for O(1) lookup instead of repeated scans. */
export function indexBy<T, K>(items: T[], key: (item: T) => K): Map<K, T> {
  const index = new Map<K, T>()
  for (const item of items) index.set(key(item), item)
  return index
}
