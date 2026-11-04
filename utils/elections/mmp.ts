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
 *   6. Where a party's list runs out before its list seats do, the seats it
 *      cannot fill stay vacant until the next election and the House shrinks
 *      -- an underhang. Nobody else is given them.
 *
 * Overhang and underhang are kept apart rather than netted off. One party can
 * cause each, and a House of exactly 120 made that way is still two things a
 * reader needs to be told.
 *
 * One thing this will not do is break a tie -- on the final quotient or in an
 * electorate -- because the law breaks those by lot and inventing one would
 * state an outcome that does not exist.
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
  /** In a tie, the level candidates, any of whom the lot could seat. */
  contenders?: { candidate: EntityNumber, party: EntityNumber | null }[]
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
  /** List seats a party actually fills, so never more than its list allows. */
  listSeats: Map<EntityNumber, number>
  /** Seats a party holds: its electorates and the list seats it can fill. */
  totalSeats: Map<EntityNumber, number>
  /** Electorates won beyond the entitlement, which grow the House. */
  overhangByParty: Map<EntityNumber, number>
  overhang: number
  /** List seats a party is entitled to but has nobody left to fill. */
  underhangByParty: Map<EntityNumber, number>
  /** Those seats in all. They stay vacant, so the House shrinks by this many. */
  underhang: number
  houseSize: number
  /** Every quotient considered, best first, for the workings table. */
  quotients: Quotient[]
  /** Quotients level at the cut, none of them awarded. Non-empty means undecided. */
  ties: Quotient[]
  /** Seats the tied quotients are contesting, which no party is given. */
  undecidedSeats: number
  members: ElectedMember[]
  /** Electorate seats held outside any qualifying party. */
  outsideSeats: number
  /** Electorates whose winner is tied, and so not yet decided. */
  undecidedElectorates: EntityNumber[]
  /**
   * What the tied electorates could still change, once each is decided.
   * Null when there are none, or too many to work through.
   */
  tieOutcomes: TieOutcomes | null
}

export interface TieOutcomes {
  /** Every House size the possible results produce, smallest first. */
  houseSizes: number[]
  /** Whether any possible result gives a party a different total from this one. */
  totalsVary: boolean
}

/** More combinations than this and the outcomes are not worked through. */
const MAX_TIE_OUTCOMES = 256

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
): {
  entitlement: Map<EntityNumber, number>
  quotients: Quotient[]
  ties: Quotient[]
  undecidedSeats: number
} {
  const entitlement = new Map<EntityNumber, number>()
  for (const party of parties) entitlement.set(party.party, 0)

  if (seats <= 0 || parties.length === 0) {
    return { entitlement, quotients: [], ties: [], undecidedSeats: 0 }
  }

  const candidates: Omit<Quotient, 'awarded' | 'rank'>[] = []
  for (const party of parties) {
    // Never more quotients than there are seats to win with them.
    for (let seat = 1; seat <= seats; seat += 1) {
      const divisor = divisorFor(formula, seat)
      candidates.push({ party: party.party, seat, divisor, value: party.votes / divisor })
    }
  }

  // Ties are left in whatever order they arrive. Nothing below relies on the
  // order within a tie, because a tie at the cut is awarded to none of them.
  candidates.sort((a, b) => b.value - a.value)

  // A tie *at the cut* is the only one that matters: more quotients level with
  // the last seat than there are seats left for them. Awarding the first of
  // them would let the order the feed sent the parties in decide a seat the
  // law decides by lot, so none of them is awarded and those seats stay empty.
  const cut = candidates[seats - 1]!.value
  const above = candidates.filter(quotient => quotient.value > cut).length
  const level = candidates.filter(quotient => quotient.value === cut).length
  const contested = above + level > seats

  const quotients: Quotient[] = candidates.map((quotient, index) => ({
    ...quotient,
    rank: index + 1,
    awarded: contested ? quotient.value > cut : index < seats,
  }))

  for (const quotient of quotients) {
    if (!quotient.awarded) continue
    entitlement.set(quotient.party, (entitlement.get(quotient.party) ?? 0) + 1)
  }

  return {
    entitlement,
    quotients,
    ties: contested ? quotients.filter(quotient => quotient.value === cut) : [],
    undecidedSeats: contested ? seats - above : 0,
  }
}

/**
 * Fill a party's list seats, in list order.
 *
 * Candidates already elected in an electorate are skipped -- they are in the
 * House either way -- as are those who have died. A list can run out, and the
 * seats left over are the party's underhang.
 */
function fillList(
  party: EntityNumber,
  seats: number,
  listCandidates: ListCandidateInput[],
  electedCandidates: Set<EntityNumber>,
): { members: ElectedMember[], vacant: number } {
  const members: ElectedMember[] = []
  if (seats <= 0) return { members, vacant: 0 }

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

  return { members, vacant: seats - members.length }
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
  let undecidedSeats = 0

  for (let pass = 0; pass <= contenders.length; pass += 1) {
    const open = contenders.filter(party => !pinned.has(party.party))
    const pinnedTotal = [...pinned.values()].reduce((sum, seats) => sum + seats, 0)
    const result = allocateByQuotient(open, Math.max(0, pool - pinnedTotal), settings.formula)

    entitlement = new Map(result.entitlement)
    for (const [party, seats] of pinned) entitlement.set(party, seats)
    quotients = result.quotients
    ties = result.ties
    undecidedSeats = result.undecidedSeats

    if (settings.allowOverhang) break

    const nextPinned = open.find(party =>
      (electorateSeats.get(party.party) ?? 0) > (result.entitlement.get(party.party) ?? 0))
    if (!nextPinned) break
    pinned.set(nextPinned.party, electorateSeats.get(nextPinned.party) ?? 0)
  }

  /* 4. Totals, list seats and overhang, before any list runs out --------- */

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

  // A list that runs out leaves its remaining seats vacant. They come off the
  // party's list and total seats, since nobody holds them, and are counted
  // apart from any overhang so the two never cancel out unseen.
  const underhangByParty = new Map<EntityNumber, number>()
  for (const party of qualified) {
    const filled = fillList(
      party.party, listSeats.get(party.party) ?? 0, listCandidates, electedCandidates)
    members.push(...filled.members)
    if (filled.vacant === 0) continue
    underhangByParty.set(party.party, filled.vacant)
    listSeats.set(party.party, (listSeats.get(party.party) ?? 0) - filled.vacant)
    totalSeats.set(party.party, (totalSeats.get(party.party) ?? 0) - filled.vacant)
  }

  const underhang = [...underhangByParty.values()].reduce((sum, seats) => sum + seats, 0)

  // A tied electorate is not an extra seat. The proportional share already
  // covers it: whichever qualifying party wins it holds it in place of a list
  // seat. It only changes the House when the lot falls to a party already over
  // its entitlement, or to someone outside the qualifying parties -- which is
  // what `tieOutcomes` works out. A vacant seat from an underhang is not a seat
  // at all until the next election, so it is not counted either.
  const houseSize = members.length + undecidedSeats

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
    underhangByParty,
    underhang,
    houseSize,
    quotients,
    ties,
    undecidedSeats,
    members,
    outsideSeats,
    undecidedElectorates,
    tieOutcomes: undecidedElectorates.length
      ? tieOutcomesFor(input, settings, totalSeats)
      : null,
  }
}

/**
 * Run the allocation once for every way the tied electorates could be decided.
 *
 * The law decides an electorate tie by lot, so no single answer is right; what
 * a reader can be told is whether the answer matters. Each tie is resolved to
 * each of its contenders in turn and the House and party totals compared.
 */
function tieOutcomesFor(
  input: AllocationInput,
  settings: MmpSettings,
  totals: Map<EntityNumber, number>,
): TieOutcomes | null {
  const tied = input.electorateWins.filter(win => win.tie)
  if (tied.some(win => !win.contenders?.length)) return null

  const combinations = tied.reduce((product, win) => product * win.contenders!.length, 1)
  if (combinations > MAX_TIE_OUTCOMES) return null

  const settled = input.electorateWins.filter(win => !win.tie)
  const houseSizes = new Set<number>()
  let totalsVary = false

  for (let index = 0; index < combinations; index += 1) {
    // Read `index` as a mixed-radix number, one digit per tied electorate.
    let rest = index
    const decided: ElectorateWinInput[] = tied.map(win => {
      const contenders = win.contenders!
      const contender = contenders[rest % contenders.length]!
      rest = Math.floor(rest / contenders.length)
      return { electorate: win.electorate, candidate: contender.candidate, party: contender.party }
    })

    const outcome = allocateSeats({ ...input, electorateWins: [...settled, ...decided] }, settings)
    houseSizes.add(outcome.houseSize)

    const parties = new Set([...totals.keys(), ...outcome.totalSeats.keys()])
    for (const party of parties) {
      if ((totals.get(party) ?? 0) !== (outcome.totalSeats.get(party) ?? 0)) totalsVary = true
    }
  }

  return { houseSizes: [...houseSizes].sort((a, b) => a - b), totalsVary }
}
