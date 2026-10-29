/**
 * Fold several results sets into one tally.
 *
 * A voting place page needs this and an electorate page does not, for two
 * independent reasons. A place issues ballots for several electorates, so its
 * party vote is spread across one set per electorate. And a place may report
 * more than once for the same electorate: the Electoral Commission has
 * published advance votes and polling-day votes as separate sets before, and
 * whether it does so again is not known in advance.
 *
 * Both are the same fold, so nothing here branches on which is in play, and a
 * place that reported once is simply the degenerate case.
 */

import type {
  EntityNumber,
  Result,
  ResultsCategory,
  ResultsSet,
} from '~/types/elections'

export interface AggregatedResults {
  /** Summed counts, ordered as they were first seen. Shares are recomputed. */
  results: Result[]
  informals: number | null
  /**
   * Every vote the rows and the informals line account for, and the
   * denominator of every share.
   */
  totalVotes: number
  /** True only where every contributing set is final. */
  isFinal: boolean
  /** The sets that actually contributed, after de-duplication. */
  sets: ResultsSet[]
  /** The electorates represented, ascending. */
  electorates: EntityNumber[]
  /** When the oldest contributing set was last updated at source. */
  oldestUpdated: number | null
}

/** Which tally two sets are reports of, ignoring which report they are. */
function reportGroup(set: ResultsSet): string {
  return [
    set.electorate ?? '-',
    set.results_category,
    set.result_number ?? '-',
  ].join(':')
}

/**
 * Drop a published set where its live twin is also held.
 *
 * The store keys sets so that a live update replaces the snapshot it
 * supersedes, which makes this a no-op in the normal case. It is here for the
 * case where the two disagree about the key -- a published set with no
 * Firestore id beside a live one that has one -- because that failure double
 * counts a place rather than showing an error, and a silently inflated total
 * is worse than a slightly stale one.
 *
 * Sets within one group that share a transport are all kept: two live reports
 * for the same electorate are the advance-and-polling-day case, which is real
 * data and must not be collapsed.
 */
export function dedupeResultsSets(sets: ResultsSet[]): ResultsSet[] {
  const groups = new Map<string, ResultsSet[]>()
  for (const set of sets) {
    const key = reportGroup(set)
    const held = groups.get(key)
    if (held) held.push(set)
    else groups.set(key, [set])
  }

  const kept: ResultsSet[] = []
  for (const group of groups.values()) {
    const live = group.filter(set => set.transport === 'firestore')
    kept.push(...(live.length && live.length < group.length ? live : group))
  }

  return kept
}

/** The entity a tally line is about, by category. */
function resultKey(result: Result, category: ResultsCategory): string {
  const number = category === 'candidate_votes' ? result.candidate : result.party
  return number === null ? 'unknown' : String(number)
}

/**
 * Sum every set into one tally.
 *
 * `category` is required rather than read from the sets: handing this mixed
 * categories would silently add candidate counts to party counts, and the
 * caller always knows which table it is building.
 */
export function aggregateResultsSets(
  incoming: ResultsSet[], category: ResultsCategory,
): AggregatedResults {
  const sets = dedupeResultsSets(incoming.filter(set => set.results_category === category))

  const summed = new Map<string, Result>()
  let informals: number | null = null
  let isFinal = sets.length > 0
  let oldestUpdated: number | null = null

  for (const set of sets) {
    for (const result of set.results) {
      const key = resultKey(result, category)
      const held = summed.get(key)
      if (held) {
        held.count = (held.count ?? 0) + (result.count ?? 0)
        continue
      }
      summed.set(key, {
        candidate: result.candidate,
        party: result.party,
        count: result.count ?? 0,
        // Recomputed downstream from the combined total. Added up, a share is
        // meaningless, and below national level the feed leaves it null anyway.
        per_cent: null,
        // Seat counts belong to the national tally and mean nothing summed
        // across voting places.
        list_seats: null,
        electorate_seats: null,
        total_seats: null,
      })
    }

    if (set.informals !== null) informals = (informals ?? 0) + set.informals
    if (!set.is_final) isFinal = false
    if (set.updated_timestamp !== null) {
      oldestUpdated = oldestUpdated === null
        ? set.updated_timestamp
        : Math.min(oldestUpdated, set.updated_timestamp)
    }
  }

  const results = [...summed.values()]

  /*
   * Counted from the rows rather than taken from `statistics.total_votes_cast`,
   * which the electorate card prefers.
   *
   * Voting place documents carry `total_votes_cast: 0` even where votes were
   * counted -- `migration/example_results.json` has one reporting zero beside
   * a `sample_size` of 115 -- and a zero denominator makes every share read
   * nought per cent. Summing the rows is always derivable, always agrees with
   * what is on screen, and on that same document agrees with `sample_size`.
   */
  const totalVotes = results.reduce((sum, result) => sum + (result.count ?? 0), 0)
    + (informals ?? 0)

  const electorates = [...new Set(
    sets.map(set => set.electorate).filter((value): value is EntityNumber => value !== null),
  )].sort((a, b) => a - b)

  return { results, informals, totalVotes, isFinal, sets, electorates, oldestUpdated }
}
