/**
 * Turn a tally into the rows a results table renders.
 *
 * Extracted from the electorate results card so that the voting place card
 * cannot drift from it. The two show the same thing at different scopes, and
 * the parts worth keeping identical are the ones easiest to get subtly wrong:
 * which party colour a candidate inherits, what an independent's sublabel
 * says, and that informals sit apart from the contestants and outside the
 * total.
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
  const { store, election, resultsVersion, category, results } = input
  const slugs = { election: election.slug, version: resultsVersion.slug }
  const isCandidates = category === 'candidate_votes'

  const ordered = [...results].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

  // A contestant's share is of the valid votes, as the Electoral Commission
  // reports it. Informals are a vote for nobody, and counting them in the
  // denominator would understate every candidate by the informal rate.
  const validVotes = ordered.reduce((sum, result) => sum + (result.count ?? 0), 0)

  return ordered.map((result) => {
    const share = voteShare(result.count, validVotes)

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
        alternateColour: party?.colour ? party.alternate_colour : null,
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
      alternateColour: store.partyAlternateColour(slugs.election, slugs.version, result.party),
      cells: {
        count: formatCount(result.count),
        share: formatPercent(share),
      },
      bar: share,
    }
  })
}

/** A results table's footer line, as ResultsTable takes it. */
export interface ResultsFooterLine {
  label: string
  note?: string | null
  cells: Record<string, string | number | null>
}

/**
 * The totals line and, where the feed reports them, the informals above it.
 *
 * The total is of valid votes only, so that it is the sum of the rows it sits
 * under. Informals are stated beside it rather than folded in: a total that
 * silently includes them never adds up, and one that silently omits them hides
 * how many there were.
 */
export function buildResultsFooter(input: {
  results: Result[]
  informals: number | null
  /** Overrides the summed rows, for a tally that reports its own valid total. */
  validVotes?: number | null
}): { informals: ResultsFooterLine | null, totals: ResultsFooterLine } {
  const validVotes = input.validVotes
    ?? input.results.reduce((sum, result) => sum + (result.count ?? 0), 0)

  return {
    informals: input.informals === null
      ? null
      : {
          label: 'Informal votes',
          cells: { count: formatCount(input.informals) },
        },
    totals: {
      label: 'Total valid votes',
      note: null,
      cells: { count: formatCount(validVotes), share: null },
    },
  }
}

/** The columns every results table shares. */
export const RESULTS_COLUMNS: ResultsColumn[] = [
  { key: 'count', label: 'Votes', width: '6rem' },
  { key: 'share', label: 'Share', width: '5rem', emphasis: true },
]
