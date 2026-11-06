/**
 * Who is standing, by party, from reference data alone.
 *
 * Pure, and with no results anywhere near it, so the Candidates page means the
 * same thing before polls close as it does after a final count.
 */

import type { EntityNumber, ReferenceCandidate } from '~/types/elections'

export interface CandidateGroup {
  /** Null is everyone standing without a party. */
  party: EntityNumber | null
  /** On the party list, by rank. Any electorate they also stand in is on the candidate. */
  list: ReferenceCandidate[]
  /** Standing in an electorate and not on the list, by electorate. */
  electorateOnly: ReferenceCandidate[]
}

/**
 * The feed's own files use 0 for "none" where the published snapshots use null,
 * and neither is a party, a rank or an electorate.
 */
const present = (value: number | null): value is number => Boolean(value)

/**
 * Candidates grouped by party: parties by name, independents last.
 *
 * Names come from the caller because the display name of a party or electorate
 * is held in the store. A party with no candidates has no group.
 */
export function groupCandidatesByParty(
  candidates: ReferenceCandidate[],
  partyName: (party: EntityNumber) => string,
  electorateName: (electorate: EntityNumber) => string,
): CandidateGroup[] {
  const groups = new Map<EntityNumber | null, CandidateGroup>()

  for (const candidate of candidates) {
    const party = present(candidate.party) ? candidate.party : null
    let group = groups.get(party)
    if (!group) {
      group = { party, list: [], electorateOnly: [] }
      groups.set(party, group)
    }
    if (present(candidate.list_pos)) group.list.push(candidate)
    else group.electorateOnly.push(candidate)
  }

  const inElectorate = (candidate: ReferenceCandidate) =>
    (present(candidate.electorate) ? electorateName(candidate.electorate) : '')

  for (const group of groups.values()) {
    group.list.sort((a, b) => (a.list_pos ?? 0) - (b.list_pos ?? 0))
    group.electorateOnly.sort((a, b) =>
      inElectorate(a).localeCompare(inElectorate(b)) || a.name.localeCompare(b.name))
  }

  return [...groups.values()].sort((a, b) => {
    if (a.party === null) return b.party === null ? 0 : 1
    if (b.party === null) return -1
    return partyName(a.party).localeCompare(partyName(b.party))
  })
}

export interface CandidateSections {
  /** Parties with a list, which is what puts a party on the party vote. */
  partyVote: CandidateGroup[]
  /** Parties with candidates in electorates and no list. */
  electoratesOnly: CandidateGroup[]
  /** Everyone standing without a party, who are not a party of either kind. */
  independent: CandidateGroup | null
}

/** Groups divided by what each is contesting, keeping the order they came in. */
export function sectionCandidateGroups(groups: CandidateGroup[]): CandidateSections {
  const parties = groups.filter(group => group.party !== null)
  return {
    partyVote: parties.filter(group => group.list.length > 0),
    electoratesOnly: parties.filter(group => group.list.length === 0),
    independent: groups.find(group => group.party === null) ?? null,
  }
}
