import type { EntityNumber } from '~/types/elections'

/**
 * Work out who sits in Parliament.
 *
 * Pure, and deliberately takes plain arrays rather than the store: this is the
 * one piece of the dashboard that makes a claim about an outcome rather than
 * reporting a tally, so it has to be testable on its own against the Electoral
 * Commission's own published allocation.
 *
 * The Electoral Act's method, in order:
 *
 *   1. A party qualifies on either limb -- 5 per cent of the party vote, or at
 *      least one electorate seat (the coattail rule).
 *   2. Electorate seats won by independents, and by candidates of parties that
 *      did not qualify, are seated regardless and come out of the 120 first.
 *   3. The rest are shared by Sainte-Lague: each party's votes divided by
 *      1, 3, 5, 7 ..., taking the highest quotients until the seats run out.
 *   4. A party's list seats are its entitlement less the electorates it won.
 *   5. Where a party won more electorates than its entitlement, it keeps them
 *      and the House grows. There is no reallocation: everyone else keeps the
 *      entitlement the original allocation gave them.
 *
 * Two things this will not do. It will not break a tie -- on the final quotient
 * or in an electorate -- because the law breaks those by lot and inventing one
 * would state an outcome that does not exist. And it will not quietly shrink
 * the House when a party's list is too short to fill its seats; it reports the
 * shortfall instead.
 */

export type MmpFormula = 'sainte-lague' | 'dhondt'

export interface MmpSettings {
  formula: MmpFormula
  /** A fraction, not a percentage: 0.05 is five per cent. */
  threshold: number
  baseSeats: number
  /** The electorate-seat limb of the threshold. */
  allowCoattailing: boolean
  /** False keeps the House at exactly `baseSeats`, which is not the real rule. */
  allowOverhang: boolean
}

/** What the Electoral Act actually says, and the defaults every page uses. */
export const OFFICIAL_MMP_SETTINGS: MmpSettings = {
  formula: 'sainte-lague',
  threshold: 0.05,
  baseSeats: 120,
  allowCoattailing: true,
  allowOverhang: true,
}

export interface PartyVoteInput {
  party: EntityNumber
  votes: number
}

export interface ElectorateWinInput {
  electorate: EntityNumber
  candidate: EntityNumber | null
  /** Null for an independent, or where the winning candidate has no party. */
  party: EntityNumber | null
  /** The leading candidates are level, so this seat is not yet won by anyone. */
  tie?: boolean
}

export interface ListCandidateInput {
  candidate: EntityNumber
  party: EntityNumber
  listPos: number
  isDead?: boolean
}

export interface AllocationInput {
  partyVotes: PartyVoteInput[]
  electorateWins: ElectorateWinInput[]
  listCandidates: ListCandidateInput[]
}

export type QualificationReason =
  | 'threshold'
  | 'electorate-seat'
  | 'below-threshold'
  | 'no-votes'

export interface PartyQualification {
  party: EntityNumber
  votes: number
  /** Percentage of the total party vote. */
  share: number
  electorateSeats: number
  qualified: boolean
  reason: QualificationReason
}

export interface Quotient {
  party: EntityNumber
  /** This would be the party's nth seat. */
  seat: number
  divisor: number
  value: number
  awarded: boolean
  /** Position among all quotients, best first. */
  rank: number
}

export type MemberOrigin = 'electorate' | 'list'

export interface ElectedMember {
  candidate: EntityNumber | null
  party: EntityNumber | null
  origin: MemberOrigin
  electorate: EntityNumber | null
  listPos: number | null
}

export interface SeatAllocation {
  settings: MmpSettings
  totalPartyVotes: number
  qualification: PartyQualification[]
  /** Seats from the proportional allocation, before overhang is applied. */
  entitlement: Map<EntityNumber, number>
  electorateSeats: Map<EntityNumber, number>
  listSeats: Map<EntityNumber, number>
  totalSeats: Map<EntityNumber, number>
  overhangByParty: Map<EntityNumber, number>
  overhang: number
  houseSize: number
  /** Every quotient considered, best first, for the workings table. */
  quotients: Quotient[]
  /** Quotients level with the last awarded one. Non-empty means undecided. */
  ties: Quotient[]
  /** Seats a party is entitled to but has no list candidate left to fill. */
  unfilled: number
  members: ElectedMember[]
  /** Electorate seats held outside any qualifying party. */
  outsideSeats: number
  /** Electorates whose winner is tied, and so not yet decided. */
  undecidedElectorates: EntityNumber[]
}

function divisorFor(formula: MmpFormula, seat: number): number {
  // Sainte-Lague uses the odd numbers, D'Hondt the whole ones.
  return formula === 'dhondt' ? seat : 2 * seat - 1
}

/**
 * Highest-quotient allocation over a fixed number of seats.
 *
 * Returns every quotient it considered, not just the winning ones, because the
 * workings table shows the near misses -- they are how a reader sees how close
 * the last seat was.
 */
function allocateByQuotient(
  parties: { party: EntityNumber, votes: number }[],
  seats: number,
  formula: MmpFormula,
): { entitlement: Map<EntityNumber, number>, quotients: Quotient[], ties: Quotient[] } {
  const entitlement = new Map<EntityNumber, number>()
  for (const party of parties) entitlement.set(party.party, 0)

  if (seats <= 0 || parties.length === 0) {
    return { entitlement, quotients: [], ties: [] }
  }

  const candidates: Omit<Quotient, 'awarded' | 'rank'>[] = []
  for (const party of parties) {
    // Never more quotients than there are seats to win with them.
    for (let seat = 1; seat <= seats; seat += 1) {
      const divisor = divisorFor(formula, seat)
      candidates.push({ party: party.party, seat, divisor, value: party.votes / divisor })
    }
  }

  // Ties are left in whatever order they arrive; nothing below relies on the
  // order within a tie, and imposing one would look like a decision.
  candidates.sort((a, b) => b.value - a.value)

  const quotients: Quotient[] = candidates.map((quotient, index) => ({
    ...quotient,
    rank: index + 1,
    awarded: index < seats,
  }))

  for (const quotient of quotients) {
    if (!quotient.awarded) continue
    entitlement.set(quotient.party, (entitlement.get(quotient.party) ?? 0) + 1)
  }

  // A tie *at the cut* is the only one that matters: quotients level with the
  // last awarded seat, where more are level than there are seats left.
  const lastAwarded = quotients[seats - 1]
  const ties = lastAwarded === undefined
    ? []
    : quotients.filter(quotient => quotient.value === lastAwarded.value)
  const contested = ties.length > 1 && ties.some(quotient => !quotient.awarded)

  return { entitlement, quotients, ties: contested ? ties : [] }
}

/**
 * Fill a party's list seats, in list order.
 *
 * Candidates already elected in an electorate are skipped -- they are in the
 * House either way -- as are those who have died. A list can run out, which is
 * reported rather than papered over.
 */
function fillList(
  party: EntityNumber,
  seats: number,
  listCandidates: ListCandidateInput[],
  electedCandidates: Set<EntityNumber>,
): { members: ElectedMember[], unfilled: number } {
  const members: ElectedMember[] = []
  if (seats <= 0) return { members, unfilled: 0 }

  const list = listCandidates
    .filter(candidate => candidate.party === party && !candidate.isDead)
    .sort((a, b) => a.listPos - b.listPos)

  for (const candidate of list) {
    if (members.length >= seats) break
    if (electedCandidates.has(candidate.candidate)) continue
    electedCandidates.add(candidate.candidate)
    members.push({
      candidate: candidate.candidate,
      party,
      origin: 'list',
      electorate: null,
      listPos: candidate.listPos,
    })
  }

  return { members, unfilled: seats - members.length }
}

export function allocateSeats(
  input: AllocationInput,
  settings: MmpSettings = OFFICIAL_MMP_SETTINGS,
): SeatAllocation {
  const { partyVotes, electorateWins, listCandidates } = input

  /* 1. Electorate seats -------------------------------------------------- */

  const electorateSeats = new Map<EntityNumber, number>()
  const undecidedElectorates: EntityNumber[] = []
  let outsideSeats = 0

  for (const win of electorateWins) {
    // A tied electorate has no winner yet, so it seats nobody and counts
    // towards no party's total.
    if (win.tie) {
      undecidedElectorates.push(win.electorate)
      continue
    }
    if (win.party === null) {
      outsideSeats += 1
      continue
    }
    electorateSeats.set(win.party, (electorateSeats.get(win.party) ?? 0) + 1)
  }

  /* 2. Qualification ----------------------------------------------------- */

  const totalPartyVotes = partyVotes.reduce((sum, party) => sum + (party.votes || 0), 0)

  const qualification: PartyQualification[] = partyVotes.map(({ party, votes }) => {
    const share = totalPartyVotes > 0 ? (votes / totalPartyVotes) * 100 : 0
    const seatsWon = electorateSeats.get(party) ?? 0
    const meetsThreshold = totalPartyVotes > 0 && votes / totalPartyVotes >= settings.threshold
    const coattails = settings.allowCoattailing && seatsWon > 0

    let reason: QualificationReason
    if (meetsThreshold) reason = 'threshold'
    else if (coattails) reason = 'electorate-seat'
    else if (votes <= 0) reason = 'no-votes'
    else reason = 'below-threshold'

    return {
      party,
      votes,
      share,
      electorateSeats: seatsWon,
      qualified: meetsThreshold || coattails,
      reason,
    }
  })

  const qualified = qualification.filter(party => party.qualified)
  const qualifiedParties = new Set(qualified.map(party => party.party))

  // Electorate seats won by a party that did not qualify are still seats. Their
  // holders sit, and the proportional pool shrinks by that many.
  for (const [party, seats] of electorateSeats) {
    if (!qualifiedParties.has(party)) outsideSeats += seats
  }

  /* 3. Proportional allocation, with overhang ---------------------------- */

  const pool = Math.max(0, settings.baseSeats - outsideSeats)
  const contenders = qualified.map(party => ({ party: party.party, votes: party.votes }))

  // Parties pinned at their electorate seats because those exceed what the
  // allocation would give them. Only used when overhang is disallowed, where
  // the excess has to come out of somebody else's share to hold the House at
  // baseSeats. With overhang allowed the House simply grows and one pass does.
  const pinned = new Map<EntityNumber, number>()
  let entitlement = new Map<EntityNumber, number>()
  let quotients: Quotient[] = []
  let ties: Quotient[] = []

  for (let pass = 0; pass <= contenders.length; pass += 1) {
    const open = contenders.filter(party => !pinned.has(party.party))
    const pinnedTotal = [...pinned.values()].reduce((sum, seats) => sum + seats, 0)
    const result = allocateByQuotient(open, Math.max(0, pool - pinnedTotal), settings.formula)

    entitlement = new Map(result.entitlement)
    for (const [party, seats] of pinned) entitlement.set(party, seats)
    quotients = result.quotients
    ties = result.ties

    if (settings.allowOverhang) break

    const nextPinned = open.find(party =>
      (electorateSeats.get(party.party) ?? 0) > (result.entitlement.get(party.party) ?? 0))
    if (!nextPinned) break
    pinned.set(nextPinned.party, electorateSeats.get(nextPinned.party) ?? 0)
  }

  /* 4. Totals, list seats and overhang ----------------------------------- */

  const totalSeats = new Map<EntityNumber, number>()
  const listSeats = new Map<EntityNumber, number>()
  const overhangByParty = new Map<EntityNumber, number>()

  for (const party of qualified) {
    const won = electorateSeats.get(party.party) ?? 0
    const due = entitlement.get(party.party) ?? 0
    // An electorate seat cannot be taken away, so a party never totals fewer
    // than the electorates it won -- that is what an overhang is.
    const total = Math.max(due, won)
    totalSeats.set(party.party, total)
    listSeats.set(party.party, total - won)
    if (total > due) overhangByParty.set(party.party, total - due)
  }

  // A non-qualifying party's electorate winners still sit, and are still that
  // party's members, even though it shares in no list seats.
  for (const [party, seats] of electorateSeats) {
    if (qualifiedParties.has(party)) continue
    totalSeats.set(party, seats)
    listSeats.set(party, 0)
  }

  const overhang = [...overhangByParty.values()].reduce((sum, seats) => sum + seats, 0)

  /* 5. The members themselves -------------------------------------------- */

  const members: ElectedMember[] = []
  const electedCandidates = new Set<EntityNumber>()

  for (const win of electorateWins) {
    if (win.tie) continue
    if (win.candidate !== null) electedCandidates.add(win.candidate)
    members.push({
      candidate: win.candidate,
      party: win.party,
      origin: 'electorate',
      electorate: win.electorate,
      listPos: null,
    })
  }

  let unfilled = 0
  for (const party of qualified) {
    const filled = fillList(
      party.party, listSeats.get(party.party) ?? 0, listCandidates, electedCandidates)
    members.push(...filled.members)
    unfilled += filled.unfilled
  }

  const houseSize = members.length + unfilled + undecidedElectorates.length

  return {
    settings,
    totalPartyVotes,
    qualification,
    entitlement,
    electorateSeats,
    listSeats,
    totalSeats,
    overhangByParty,
    overhang,
    houseSize,
    quotients,
    ties,
    unfilled,
    members,
    outsideSeats,
    undecidedElectorates,
  }
}
