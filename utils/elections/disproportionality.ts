/**
 * How far a Parliament is from the party vote, and how many votes it left out.
 *
 * Pure, and kept apart from the components so each figure can be checked by hand
 * against a published result.
 */

/** Informals in a national tally, from that tally alone. */
export function nationalInformals(set: {
  informals: number | null
  results: { count: number | null }[]
  statistics: { total_votes_cast: number | null, total_party_informals: number | null }
}): number | null {
  // The feed can leave both informal fields null -- the 2023 final results do --
  // so this falls back to votes cast less the valid votes in the rows.
  const reported = set.informals ?? set.statistics.total_party_informals
  if (reported !== null) return reported

  const cast = set.statistics.total_votes_cast
  if (cast === null) return null
  const derived = cast - set.results.reduce((sum, result) => sum + (result.count ?? 0), 0)
  return derived >= 0 ? derived : null
}

export interface WastedVote {
  /** Rejected as informal. */
  informals: number
  /** For parties that did not qualify for seats. */
  partyVotes: number
  total: number
  /** Every vote cast, informals included. */
  votesCast: number
  /** The total as a percentage of votes cast. */
  share: number
}

/**
 * The votes that had no effect on the shape of Parliament.
 *
 * A party under the threshold that won an electorate qualified, so its votes
 * are not wasted: the caller passes only parties that did not qualify.
 */
export function wastedVote(input: {
  informals: number
  nonQualifyingVotes: number
  validVotes: number
}): WastedVote | null {
  const votesCast = input.validVotes + input.informals
  if (votesCast <= 0) return null
  const total = input.informals + input.nonQualifyingVotes
  return {
    informals: input.informals,
    partyVotes: input.nonQualifyingVotes,
    total,
    votesCast,
    share: (total / votesCast) * 100,
  }
}

/**
 * The Gallagher least squares index: √(½ Σ(Vᵢ − Sᵢ)²), in percentage points.
 *
 * Votes are shares of the valid party vote, and seats shares of those filled.
 * Parties with no seats still count, because their votes are the disproportion.
 * Each seat held outside any party on the ballot is its own contestant with no
 * party votes. Null until there are both votes and seats.
 */
export function gallagherIndex(
  parties: { votes: number, seats: number }[],
  independentSeats = 0,
): number | null {
  const votes = parties.reduce((sum, party) => sum + party.votes, 0)
  const seats = parties.reduce((sum, party) => sum + party.seats, independentSeats)
  if (votes <= 0 || seats <= 0) return null

  const independentShare = (1 / seats) * 100
  const squares = parties.reduce((sum, party) =>
    sum + ((party.votes / votes) * 100 - (party.seats / seats) * 100) ** 2,
  independentSeats * independentShare ** 2)

  return Math.sqrt(squares / 2)
}

/**
 * The same index for an election in a comparison file, from the seats it returned.
 *
 * Every party's votes are there, matched or not, so nothing is missing from the
 * shares. Seats won outside any party are not in the file, so an election where
 * an independent won a seat reads slightly low.
 */
export function comparisonGallagherIndex(
  parties: { count: number | null, total_seats: number | null }[],
): number | null {
  return gallagherIndex(parties.map(party => ({
    votes: party.count ?? 0,
    seats: party.total_seats ?? 0,
  })))
}
