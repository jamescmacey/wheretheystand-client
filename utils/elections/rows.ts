/**
 * Turn a tally into the rows a results table renders.
 *
 * Extracted from the electorate results card so that the voting place card
 * cannot drift from it. The two show the same thing at different scopes, and
 * the parts worth keeping identical are the ones easiest to get subtly wrong:
 * which party colour a candidate inherits, what an independent's sublabel
 * says, and that informals appear as a muted line rather than a contestant.
 */

import type {
  ElectionSummary,
  Result,
  ResultsCategory,
  ResultsVersion,
} from '~/types/elections'
import type { ResultsColumn, ResultsRow } from '~/types/electionResults'
import { useElectionDataStore } from '~/stores/electionData'
import { formatCount, formatPercent } from './format'

type ElectionDataStore = ReturnType<typeof useElectionDataStore>

export interface ResultsRowsInput {
  store: ElectionDataStore
  election: ElectionSummary
  resultsVersion: ResultsVersion
  category: ResultsCategory
  results: Result[]
  /** The denominator for every share, and for the informals line. */
  totalVotes: number
  informals: number | null
}

/** A share of the total, guarding the zero denominator a count yet to start has. */
export function voteShare(count: number | null, totalVotes: number): number {
  if (!count || !totalVotes) return 0
  return (count / totalVotes) * 100
}

/**
 * Rows for one tally, ordered by count.
 *
 * The incoming array is copied before sorting: it belongs to the store.
 */
export function buildResultsRows(input: ResultsRowsInput): ResultsRow[] {
  const { store, election, resultsVersion, category, results, totalVotes } = input
  const slugs = { election: election.slug, version: resultsVersion.slug }
  const isCandidates = category === 'candidate_votes'

  const ordered = [...results].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

  const rows: ResultsRow[] = ordered.map((result) => {
    const share = voteShare(result.count, totalVotes)

    if (isCandidates) {
      const candidate = result.candidate === null
        ? null
        : store.candidate(slugs.election, slugs.version, result.candidate)
      const party = result.candidate === null
        ? null
        : store.persistentPartyForCandidate(slugs.election, slugs.version, result.candidate)
      const electionParty = candidate?.party === null || candidate?.party === undefined
        ? null
        : store.party(slugs.election, slugs.version, candidate.party)

      return {
        key: result.candidate ?? `unknown-${result.count}`,
        label: candidate?.name ?? 'Unknown candidate',
        sublabel: electionParty?.name ?? 'Independent',
        colour: party?.colour ?? null,
        cells: {
          count: formatCount(result.count),
          share: formatPercent(share),
        },
        bar: share,
      }
    }

    const party = result.party === null
      ? null
      : store.party(slugs.election, slugs.version, result.party)

    return {
      key: result.party ?? `unknown-${result.count}`,
      label: party?.name ?? 'Unknown party',
      colour: store.partyColour(slugs.election, slugs.version, result.party),
      cells: {
        count: formatCount(result.count),
        share: formatPercent(share),
      },
      bar: share,
    }
  })

  if (input.informals !== null) {
    const share = voteShare(input.informals, totalVotes)
    rows.push({
      key: 'informals',
      label: 'Informal votes',
      muted: true,
      bar: share,
      cells: {
        count: formatCount(input.informals),
        share: formatPercent(share),
      },
    })
  }

  return rows
}

/** The bar scale, so a table of small shares is still readable. */
export function barMaxForRows(rows: ResultsRow[]): number {
  return Math.max(10, ...rows.map(row => row.bar ?? 0))
}

/** The columns every results table shares. */
export const RESULTS_COLUMNS: ResultsColumn[] = [
  { key: 'count', label: 'Votes', width: '6rem' },
  { key: 'share', label: 'Share', width: '5rem' },
]
