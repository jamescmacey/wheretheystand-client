/**
 * Match a result against the election it is compared with.
 *
 * The comparison file is keyed on persistent ids alone, so everything here is
 * a lookup by persistent party or candidate, and nothing needs the other
 * election's reference data. See `ComparisonData`.
 */

import type {
  ComparisonCandidateTally,
  ComparisonPartyTally,
  PersistentId,
} from '~/types/elections'

/**
 * Which earlier result a candidate's figure is.
 *
 * - `same`: the same candidate, standing for the same party (or as an
 *   independent both times).
 * - `candidate`: the same candidate, who stood for a different party then.
 * - `party`: whoever stood for this candidate's party then, who was somebody
 *   else.
 */
export type CandidateComparisonBasis = 'same' | 'candidate' | 'party'

export interface CandidateComparisonFigure {
  basis: CandidateComparisonBasis
  per_cent: number | null
}

/** A party's share last time, or null where it did not stand or cannot be matched. */
export function partyComparisonShare(
  tally: ComparisonPartyTally | null | undefined,
  party: PersistentId | null | undefined,
): number | null {
  if (!tally || !party) return null
  return tally.parties.find(entry => entry.party === party)?.per_cent ?? null
}

/**
 * What a candidate is measured against: one figure, two, or none.
 *
 * Two where the candidate has changed party and both their own result and
 * their new party's are on record -- a defection, typically. The candidate's
 * own comes first. Where they stood for the same party again there is only
 * the one figure, because the two are the same entry.
 */
export function candidateComparisonFigures(
  tally: ComparisonCandidateTally | null | undefined,
  candidate: PersistentId | null | undefined,
  party: PersistentId | null | undefined,
): CandidateComparisonFigure[] {
  if (!tally) return []

  const own = candidate
    ? tally.candidates.find(entry => entry.candidate === candidate)
    : undefined
  const partys = party
    ? tally.candidates.find(entry => entry.party === party)
    : undefined

  if (own) {
    // Null and null is an independent standing as one again.
    if ((own.party ?? null) === (party ?? null)) {
      return [{ basis: 'same', per_cent: own.per_cent }]
    }
    const figures: CandidateComparisonFigure[] = [{ basis: 'candidate', per_cent: own.per_cent }]
    if (partys) figures.push({ basis: 'party', per_cent: partys.per_cent })
    return figures
  }

  return partys ? [{ basis: 'party', per_cent: partys.per_cent }] : []
}

/**
 * The icon marking a figure that is not the candidate's own like-for-like
 * result. A figure on the `same` basis carries none.
 */
export const COMPARISON_ICONS = {
  candidate: 'i-heroicons-user',
  party: 'i-heroicons-user-group',
} as const satisfies Record<Exclude<CandidateComparisonBasis, 'same'>, string>

/** Short labels for screen readers, beside each icon. */
export const COMPARISON_ICON_LABELS = {
  candidate: 'This candidate, for another party',
  party: 'This party\'s candidate',
} as const satisfies Record<Exclude<CandidateComparisonBasis, 'same'>, string>
