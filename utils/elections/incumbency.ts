/**
 * Reading a seat's result as a change rather than only as a result.
 *
 * Django curates two facts per seat -- who held it, and for which party -- and
 * one more only where a member has left the party the seat was won for. Which
 * of the standing cases applies is decided here instead, from the version's own
 * candidate list.
 *
 * Deriving it is what keeps it honest. The candidate list is the same data the
 * page prints names from, so a marker on a seat cannot contradict the names
 * beside it; a curated status could, and would, the moment a late withdrawal
 * was recorded in one place and not the other.
 *
 * Nothing here guesses. Where the persistent links are incomplete the answer is
 * `unknown`, and the caller shows no marker at all -- a missing marker is a
 * blank, but a wrong one is a false statement about a candidate.
 */

import type { ElectorateIncumbency, PersistentId } from '~/types/elections'
import { formatCount, pluralise } from './format'

export type IncumbencyStatus =
  /** The sitting member is standing again for the party that won the seat. */
  | 'standing_again'
  /** The party that won the seat is standing somebody else -- the cross. */
  | 'party_other_candidate'
  /** The sitting member is standing here for another party, or as an independent. */
  | 'defector_standing'
  /** The sitting member is not standing in this electorate. */
  | 'not_standing'
  /** Nobody held the seat going in. */
  | 'vacant'
  /** Not enough is linked to say. */
  | 'unknown'

/** One candidate standing in the electorate, reduced to its persistent links. */
export interface StandingCandidate {
  persistentCandidate: PersistentId | null
  persistentParty: PersistentId | null
}

export function incumbencyStatus(
  incumbent: ElectorateIncumbency | null,
  candidates: StandingCandidate[],
): IncumbencyStatus {
  if (!incumbent) return 'unknown'
  if (!incumbent.candidate) return 'vacant'
  // No candidate list loaded yet, so nothing follows from the member's absence.
  if (!candidates.length) return 'unknown'

  const standing = candidates.find(
    candidate => candidate.persistentCandidate === incumbent.candidate)

  if (standing) {
    // Measured against the party that *won* the seat, not the one the member
    // sits for now. The marker is a statement about the seat: a member who won
    // it for one party and is standing for another has left it undefended by
    // its holder, which is the thing worth showing, and that stays true whether
    // or not the defection was also curated in Django.
    //
    // Null on either side is not evidence of agreement -- an unlinked candidate
    // and a genuine independent look identical -- so neither gets a marker.
    if (!incumbent.party || !standing.persistentParty) return 'unknown'
    return standing.persistentParty === incumbent.party
      ? 'standing_again'
      : 'defector_standing'
  }

  // The member is not standing here. Whether that reads as the party running
  // somebody else depends on the party fielding anybody at all.
  if (!incumbent.party) return 'not_standing'
  const partyStanding = candidates.some(
    candidate => candidate.persistentParty === incumbent.party)
  return partyStanding ? 'party_other_candidate' : 'not_standing'
}

/**
 * Seats won less seats held, or null where the party was defending none.
 *
 * Zero and null are different answers and must not render the same: zero is a
 * party that held seats and holds the same number, null is one with no
 * baseline to compare against.
 */
export function seatChange(
  totalSeats: number,
  seatsHeld: number | undefined,
): number | null {
  if (seatsHeld === undefined) return null
  return totalSeats - seatsHeld
}

/**
 * How a seat's outcome reads against the party that held it.
 *
 * Election night has its own vocabulary for this and it is worth borrowing: a
 * seat is held or it is gained, and a gain names the party it came from. The
 * alternative -- "flipped: yes" -- makes the reader do the work of recalling
 * who lost it.
 *
 * Null until there is something true to say. A tie states no outcome, and a
 * party whose name has not resolved gets no sentence rather than one with a
 * hole in it.
 */
export function seatOutcome(
  flipped: boolean | null,
  heldBy: string | null,
  leadingParty: string | null,
): string | null {
  if (flipped === null || !heldBy) return null
  if (!flipped) return `${heldBy} holds the seat.`
  if (!leadingParty) return null
  return `${leadingParty} gains the seat from ${heldBy}.`
}

/** An icon and a sentence, or null where the status says nothing worth drawing. */
export interface MemberNote {
  icon: string
  text: string
}

/**
 * What became of the member who held the seat.
 *
 * A statement about the seat, never about whoever happens to be leading it:
 * the party that won a seat can be standing a new candidate while a different
 * party leads the count, and a marker attached to the leader's name would say
 * something false about that candidate. Hence a line of its own.
 *
 * The cross on `party_other_candidate` is the marker this was asked for: the
 * party may hold or lose the seat, but the person is not the same.
 */
export function memberNote(
  status: IncumbencyStatus,
  partyName: string | null,
): MemberNote | null {
  switch (status) {
    case 'standing_again':
      return {
        icon: 'i-lucide-user-check',
        text: 'The sitting member is standing again.',
      }
    case 'party_other_candidate':
      return {
        icon: 'i-lucide-x',
        text: partyName
          ? `${partyName} is standing a new candidate.`
          : 'The party that won the seat is standing a new candidate.',
      }
    case 'defector_standing':
      return {
        icon: 'i-lucide-arrow-left-right',
        text: partyName
          ? `The sitting member has left ${partyName} and is standing again.`
          : 'The sitting member has left the party that won the seat.',
      }
    case 'not_standing':
      return {
        icon: 'i-lucide-user-x',
        text: 'The sitting member is not standing.',
      }
    case 'vacant':
      return {
        icon: 'i-lucide-info',
        text: 'The seat was vacant going into the election.',
      }
    case 'unknown':
    default:
      return null
  }
}

/**
 * A seat change, written three ways because three places need it.
 *
 * `label` goes in a numeric column, where everything is right aligned and a
 * word would not fit. `phrase` goes beside a seat count, where "3 more" reads
 * and "+3" has to be decoded. `description` is the whole statement, for a
 * title and for anybody reading with assistive technology, and it names the
 * baseline -- without it the figure is a number with no stated origin.
 */
export interface SeatChangeNote {
  label: string
  phrase: string
  description: string
  icon: string | null
}

export function seatChangeNote(
  change: number | null,
  seatsHeld: number | null,
): SeatChangeNote | null {
  if (change === null || seatsHeld === null) return null

  const baseline = `the ${pluralise(seatsHeld, 'seat')} held going into the election`

  if (change === 0) {
    return {
      label: '0',
      phrase: 'No change',
      description: `No change on ${baseline}.`,
      icon: null,
    }
  }

  const size = Math.abs(change)
  const gained = change > 0
  return {
    // A true minus sign rather than a hyphen, so the figures line up in a
    // tabular column and a screen reader says "minus" rather than "dash".
    label: gained ? `+${size}` : `−${size}`,
    phrase: `${formatCount(size)} ${gained ? 'more' : 'fewer'}`,
    description: `${pluralise(size, 'seat')} ${gained ? 'more' : 'fewer'} than ${baseline}.`,
    icon: gained ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down',
  }
}
