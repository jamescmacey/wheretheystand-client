import type {
  ElectionSummary, ElectorateIncumbency, EntityNumber, PersistentId, ResultsVersion,
} from '~/types/elections'
import type { IncumbencyStatus, StandingCandidate } from '~/utils/elections/incumbency'
import {
  incumbencyStatus, memberNote, seatChange, seatChangeBadge, seatChangeNote, seatOutcome,
} from '~/utils/elections/incumbency'
import { useElectionDataStore } from '~/stores/electionData'

export type { IncumbencyStatus } from '~/utils/elections/incumbency'

/**
 * How a seat stood going into the election, bound to one results version.
 *
 * The decision itself lives in `utils/elections/incumbency`, which is pure and
 * tested on its own; this resolves the store lookups it needs -- the persistent
 * electorate behind an election electorate, and the persistent party behind
 * each candidate's party, the same hop `store.partyColour` makes.
 */
export function useIncumbency(
  election: MaybeRefOrGetter<ElectionSummary>,
  resultsVersion: MaybeRefOrGetter<ResultsVersion>,
) {
  const store = useElectionDataStore()

  const slugs = computed(() => ({
    election: toValue(election).slug,
    version: toValue(resultsVersion).slug,
  }))

  const incumbency = computed(() => toValue(resultsVersion).incumbency)

  /** Curated for this version at all. False for every archived election. */
  const curated = computed(() => Boolean(incumbency.value))

  const byPersistentElectorate = computed(() => {
    const index = new Map<PersistentId, ElectorateIncumbency>()
    for (const row of incumbency.value?.electorates ?? []) {
      index.set(row.electorate, row)
    }
    return index
  })

  const seatsByPersistentParty = computed(() => {
    const index = new Map<PersistentId, number>()
    for (const row of incumbency.value?.parties ?? []) {
      index.set(row.party, row.electorate_seats + row.list_seats)
    }
    return index
  })

  /**
   * The incumbency row for one electorate of this election.
   *
   * Reached through the persistent electorate, because the Electoral
   * Commission's numbers are reused between elections and incumbency spans
   * them.
   */
  const incumbentFor = (electorate: EntityNumber): ElectorateIncumbency | null => {
    const persistent = store.persistentElectorateFor(
      slugs.value.election, slugs.value.version, electorate)
    if (!persistent) return null
    return byPersistentElectorate.value.get(persistent.id) ?? null
  }

  /** Candidates standing in one electorate, as persistent ids where linked. */
  const candidatesIn = (electorate: EntityNumber): StandingCandidate[] => {
    const reference = store.referenceData(slugs.value.election, slugs.value.version)
    return (reference?.candidates ?? [])
      .filter(candidate => candidate.electorate === electorate)
      .map(candidate => ({
        persistentCandidate: candidate.persistent_candidate,
        persistentParty: candidate.party === null
          ? null
          : store.persistentPartyForParty(
            slugs.value.election, slugs.value.version, candidate.party)?.id ?? null,
      }))
  }

  const statusFor = (electorate: EntityNumber): IncumbencyStatus =>
    incumbencyStatus(incumbentFor(electorate), candidatesIn(electorate))

  /**
   * Whether the leading party is not the one that held the seat.
   *
   * Null until there is a sole leader, because a tie states no outcome, and
   * null where either side is unknown -- "not a flip" and "cannot tell" are
   * different answers and must not render the same.
   */
  const flippedFor = (electorate: EntityNumber): boolean | null => {
    const incumbent = incumbentFor(electorate)
    if (!incumbent?.party) return null

    const result = store.computedElectorateResult(
      slugs.value.election, slugs.value.version, electorate)
    const leaders = result?.firstPlace
    if (!leaders || leaders.length !== 1) return null

    const leading = store.persistentPartyForCandidate(
      slugs.value.election, slugs.value.version, leaders[0]!)
    if (!leading) return null
    return leading.id !== incumbent.party
  }

  /**
   * Seats won less seats held, or null where the party was not defending any.
   *
   * Zero and null are different: zero is a party that held seats and holds the
   * same number, null is one with no baseline to compare against.
   */
  const seatChangeFor = (party: EntityNumber, totalSeats: number): number | null => {
    const persistent = store.persistentPartyForParty(
      slugs.value.election, slugs.value.version, party)
    if (!persistent) return null
    return seatChange(totalSeats, seatsByPersistentParty.value.get(persistent.id))
  }

  /** Seats a party is defending, by its party number at this election. */
  const seatsHeldFor = (party: EntityNumber): number | null => {
    const persistent = store.persistentPartyForParty(
      slugs.value.election, slugs.value.version, party)
    if (!persistent) return null
    return seatsByPersistentParty.value.get(persistent.id) ?? null
  }

  /** The seat change, written for a column, for a tile and for a reader. */
  const seatChangeNoteFor = (party: EntityNumber, totalSeats: number) =>
    seatChangeNote(seatChangeFor(party, totalSeats), seatsHeldFor(party))

  const partyName = (id: PersistentId | null): string | null => {
    if (!id) return null
    const party = store.persistentParty(id)
    return party?.display_name || party?.short_name || null
  }

  /** The party leading the count, or null while the seat is tied or uncounted. */
  const leadingParty = (electorate: EntityNumber) => {
    const result = store.computedElectorateResult(
      slugs.value.election, slugs.value.version, electorate)
    const leaders = result?.firstPlace
    if (!leaders || leaders.length !== 1) return null
    return store.persistentPartyForCandidate(
      slugs.value.election, slugs.value.version, leaders[0]!)
  }

  /**
   * The seat's result as a change, for a badge: "NAT hold", "LAB gain".
   *
   * The same judgement as `noteFor`'s outcome sentence, in the shorthand a
   * results card has room for, and null in exactly the same cases.
   */
  const seatChangeBadgeFor = (electorate: EntityNumber) => {
    const party = leadingParty(electorate)
    const abbreviation = party?.abbreviation || party?.short_name || party?.display_name
    return seatChangeBadge(
      flippedFor(electorate),
      party && abbreviation
        ? { abbreviation, name: partyName(party.id) ?? abbreviation }
        : null,
    )
  }

  /**
   * How one seat reads against the way it was held, as two sentences at most.
   *
   * `outcome` is the hold or the gain; `member` is what became of the person
   * who held it. They are separate because they can disagree -- a party can
   * hold a seat with somebody new, and lose one its own member is standing
   * against it -- and a reader needs both facts to make sense of either.
   */
  const noteFor = (electorate: EntityNumber) => {
    const incumbent = incumbentFor(electorate)
    const heldBy = partyName(incumbent?.party ?? null)
    return {
      outcome: seatOutcome(
        flippedFor(electorate),
        heldBy,
        partyName(leadingParty(electorate)?.id ?? null)),
      member: memberNote(statusFor(electorate), heldBy),
    }
  }

  /**
   * The allocation's parties, plus any that held seats and won none.
   *
   * A party wiped out of Parliament does not appear in a seat allocation at
   * all, so the single most consequential comparison on the page -- six seats
   * down to none -- would be the one silently left out. Added with a count of
   * zero so that every list of parties still orders and renders the same way.
   *
   * A party that held seats and did not contest the election at all has no
   * party number here to add, and so cannot be shown. That is a party which
   * dissolved mid-term, and it has never happened in an MMP Parliament.
   */
  const withDefendingParties = (
    entries: [EntityNumber, number][],
  ): [EntityNumber, number][] => {
    if (!seatsByPersistentParty.value.size) return entries

    const present = new Set(entries.map(([party]) => party))
    const extra: [EntityNumber, number][] = []
    const reference = store.referenceData(slugs.value.election, slugs.value.version)

    for (const party of reference?.parties ?? []) {
      if (present.has(party.number) || !party.persistent_party) continue
      if (!seatsByPersistentParty.value.has(party.persistent_party)) continue
      extra.push([party.number, 0])
    }

    return extra.length ? [...entries, ...extra] : entries
  }

  return {
    incumbency,
    curated,
    incumbentFor,
    statusFor,
    flippedFor,
    seatChangeFor,
    seatsHeldFor,
    seatChangeNoteFor,
    seatChangeBadgeFor,
    noteFor,
    withDefendingParties,
  }
}
