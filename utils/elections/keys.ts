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
 * The last component separates sets that are otherwise identical. A voting
 * place can report more than once for the same electorate and category -- the
 * Commission has published advance votes and polling-day votes separately
 * before -- and `result_number` is the field that would say which report this
 * is. Nothing populates it, because no field in the feed has been confirmed to
 * carry the ordinal, so `firestore_id` stands in: it is the one discriminator
 * both transports hold. Without it both reports land on one key, and the store
 * keeps whichever is newer; the place then reads low by the dropped set, with
 * nothing on screen to say so.
 *
 * The fallback applies at voting place level only. National and electorate
 * tallies are already unique per level, category and electorate, and a
 * published one may have no Firestore id at all -- keying on one would make a
 * snapshot tally and its live twin two entries instead of one replacing the
 * other.
 *
 * Kept in step with ResultsSet.canonical_key in the Django models.
 */
export function resultsSetKey(parts: {
  results_level: ResultsLevel
  results_category: ResultsCategory
  electorate?: EntityNumber | null
  voting_place?: EntityNumber | null
  result_number?: number | null
  firestore_id?: string | null
}): string {
  const discriminator = parts.result_number
    ?? (parts.results_level === 'voting_place' ? parts.firestore_id : null)

  return [
    parts.results_level,
    parts.results_category,
    parts.electorate ?? '-',
    parts.voting_place ?? '-',
    discriminator ?? '-',
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
