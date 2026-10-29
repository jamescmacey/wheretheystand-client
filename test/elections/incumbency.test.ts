import { describe, expect, it } from 'vitest'

import type { ElectorateIncumbency } from '~/types/elections'
import type { StandingCandidate } from '~/utils/elections/incumbency'
import {
  incumbencyStatus, memberNote, seatChange, seatChangeNote, seatOutcome,
} from '~/utils/elections/incumbency'

/**
 * The three cases a reader has to be able to tell apart on an electorate, and
 * the two where the honest answer is nothing at all.
 */

const NATIONAL = 'p-national'
const ACT = 'p-act'
const LABOUR = 'p-labour'
const SITTING = 'c-sitting'
const SOMEBODY_ELSE = 'c-else'

const held = (over: Partial<ElectorateIncumbency> = {}): ElectorateIncumbency => ({
  electorate: 'e-ilam',
  candidate: SITTING,
  party: NATIONAL,
  left_party: false,
  current_party: null,
  ...over,
})

const standing = (
  persistentCandidate: string | null, persistentParty: string | null,
): StandingCandidate => ({ persistentCandidate, persistentParty })

describe('incumbencyStatus', () => {
  it('reads the sitting member standing again for the same party', () => {
    expect(incumbencyStatus(held(), [standing(SITTING, NATIONAL)]))
      .toBe('standing_again')
  })

  it('reads the party standing somebody else as the cross', () => {
    expect(incumbencyStatus(held(), [standing(SOMEBODY_ELSE, NATIONAL)]))
      .toBe('party_other_candidate')
  })

  it('reads a member standing for another party as a defection', () => {
    // Won the seat for National, standing for ACT. The seat is National's for
    // the purpose of a flip, and its holder is not defending it.
    const defector = held({ left_party: true, current_party: ACT })
    expect(incumbencyStatus(defector, [standing(SITTING, ACT)]))
      .toBe('defector_standing')
  })

  it('reads a defection even where Django was never told about it', () => {
    // The candidate list is authoritative. A member standing for another party
    // has crossed the floor whether or not a curator ticked the box.
    expect(incumbencyStatus(held(), [standing(SITTING, ACT)]))
      .toBe('defector_standing')
  })

  it('does not call a defection "standing again" because they kept their new party', () => {
    // The regression this file exists for: measuring against the party the
    // member sits for *now* makes every defection look like continuity.
    const defector = held({ left_party: true, current_party: ACT })
    expect(incumbencyStatus(defector, [standing(SITTING, ACT)]))
      .not.toBe('standing_again')
  })

  it('reads a member who is not standing, with the party absent too', () => {
    expect(incumbencyStatus(held(), [standing(SOMEBODY_ELSE, LABOUR)]))
      .toBe('not_standing')
  })

  it('reads a seat nobody held as vacant', () => {
    expect(incumbencyStatus(held({ candidate: null }), [standing(SOMEBODY_ELSE, NATIONAL)]))
      .toBe('vacant')
  })

  it('says nothing where the seat is not curated', () => {
    expect(incumbencyStatus(null, [standing(SITTING, NATIONAL)])).toBe('unknown')
  })

  it('says nothing before the candidate list has loaded', () => {
    // Absence from an empty list is not evidence of not standing.
    expect(incumbencyStatus(held(), [])).toBe('unknown')
  })

  it('says nothing where the standing candidate has no party linked', () => {
    // An unlinked candidate and a genuine independent look identical, and a
    // wrong marker is worse than none.
    expect(incumbencyStatus(held(), [standing(SITTING, null)])).toBe('unknown')
  })

  it('says nothing where the incumbent has no party linked but is standing', () => {
    expect(incumbencyStatus(held({ party: null }), [standing(SITTING, NATIONAL)]))
      .toBe('unknown')
  })

  it('reads an unlinked incumbent who is not standing as not standing', () => {
    expect(incumbencyStatus(held({ party: null }), [standing(SOMEBODY_ELSE, NATIONAL)]))
      .toBe('not_standing')
  })

  it('finds the member among several candidates', () => {
    const candidates = [
      standing(SOMEBODY_ELSE, LABOUR),
      standing(SITTING, NATIONAL),
      standing('c-third', ACT),
    ]
    expect(incumbencyStatus(held(), candidates)).toBe('standing_again')
  })
})

describe('seatChange', () => {
  it('counts a gain and a loss', () => {
    expect(seatChange(52, 49)).toBe(3)
    expect(seatChange(0, 6)).toBe(-6)
  })

  it('distinguishes holding steady from having no baseline', () => {
    // Zero is "held the same number"; null is "was defending nothing", and the
    // two must not render as the same thing.
    expect(seatChange(11, 11)).toBe(0)
    expect(seatChange(11, undefined)).toBeNull()
  })
})

describe('seatOutcome', () => {
  it('writes a hold and a gain in the words election night uses', () => {
    expect(seatOutcome(false, 'Labour', 'Labour')).toBe('Labour holds the seat.')
    expect(seatOutcome(true, 'Labour', 'National'))
      .toBe('National gains the seat from Labour.')
  })

  it('says nothing while the seat is tied or uncounted', () => {
    expect(seatOutcome(null, 'Labour', 'National')).toBeNull()
  })

  it('says nothing rather than a sentence with a hole in it', () => {
    // A gain has to name the party it came from and the party taking it, or it
    // is not worth printing.
    expect(seatOutcome(true, 'Labour', null)).toBeNull()
    expect(seatOutcome(false, null, 'Labour')).toBeNull()
  })
})

describe('memberNote', () => {
  it('marks the party standing a new candidate with a cross', () => {
    const note = memberNote('party_other_candidate', 'National')
    expect(note?.icon).toBe('i-lucide-x')
    expect(note?.text).toBe('National is standing a new candidate.')
  })

  it('names the party a defector left', () => {
    expect(memberNote('defector_standing', 'National')?.text)
      .toBe('The sitting member has left National and is standing again.')
  })

  it('falls back to a nameless sentence where the party did not resolve', () => {
    // Still true, still worth saying: only the party's name is missing.
    expect(memberNote('party_other_candidate', null)?.text)
      .toBe('The party that won the seat is standing a new candidate.')
    expect(memberNote('defector_standing', null)?.text)
      .toBe('The sitting member has left the party that won the seat.')
  })

  it('draws nothing where nothing is known', () => {
    expect(memberNote('unknown', 'National')).toBeNull()
  })

  it('gives every other case an icon and a sentence', () => {
    for (const status of ['standing_again', 'not_standing', 'vacant'] as const) {
      const note = memberNote(status, 'National')
      expect(note?.icon).toMatch(/^i-lucide-/)
      expect(note?.text).toMatch(/\.$/)
    }
  })
})

describe('seatChangeNote', () => {
  it('writes a gain three ways, and names the baseline in the long one', () => {
    const note = seatChangeNote(3, 49)
    expect(note?.label).toBe('+3')
    expect(note?.phrase).toBe('3 more')
    expect(note?.description)
      .toBe('3 seats more than the 49 seats held going into the election.')
    expect(note?.icon).toBe('i-lucide-arrow-up')
  })

  it('writes a loss with a minus sign rather than a hyphen', () => {
    const note = seatChangeNote(-6, 6)
    // U+2212, so the figures line up in a tabular column and are read as a
    // negative number rather than a dash.
    expect(note?.label).toBe('−6')
    expect(note?.phrase).toBe('6 fewer')
    expect(note?.icon).toBe('i-lucide-arrow-down')
  })

  it('states no change in words, and without an arrow', () => {
    const note = seatChangeNote(0, 11)
    expect(note?.label).toBe('0')
    expect(note?.phrase).toBe('No change')
    expect(note?.icon).toBeNull()
    expect(note?.description).toBe('No change on the 11 seats held going into the election.')
  })

  it('counts a single seat in the singular', () => {
    expect(seatChangeNote(1, 1)?.description)
      .toBe('1 seat more than the 1 seat held going into the election.')
  })

  it('draws nothing for a party with no baseline', () => {
    expect(seatChangeNote(null, null)).toBeNull()
    expect(seatChangeNote(3, null)).toBeNull()
  })
})
