import { describe, expect, it } from 'vitest'

import type { AllocationInput, MmpSettings } from '~/utils/elections/mmp'
import { OFFICIAL_MMP_SETTINGS, allocateSeats } from '~/utils/elections/mmp'

import ge2023 from './fixtures/ge2023-final.json'
import ge2020 from './fixtures/ge2020-final.json'

/**
 * The two real elections are the point of this file.
 *
 * Every other case here is constructed to isolate one rule, which means it
 * proves only that the code does what I thought it should. The fixtures prove
 * something stronger: that under the official settings the engine reproduces
 * the allocation the Electoral Commission actually declared, seat for seat.
 *
 * They are derived from the published snapshots, reduced to what the engine
 * consumes. `official` is the Commission's own per-party seat counts, carried
 * on the national party-vote results and untouched by anything here.
 */

interface Fixture {
  label: string
  partyVotes: { party: number, votes: number }[]
  electorateWins: { electorate: number, candidate: number | null, party: number | null, tie?: boolean }[]
  listCandidates: { candidate: number, party: number, listPos: number, isDead?: boolean }[]
  official: { party: number, name: string, electorate_seats: number, list_seats: number, total_seats: number }[]
}

const fixtures: Fixture[] = [ge2023 as Fixture, ge2020 as Fixture]

describe.each(fixtures)('$label', (fixture) => {
  const allocation = allocateSeats(fixture as AllocationInput, OFFICIAL_MMP_SETTINGS)

  it.each(fixture.official)(
    'seats $name as declared: $electorate_seats electorate, $list_seats list',
    (party) => {
      expect(allocation.electorateSeats.get(party.party) ?? 0).toBe(party.electorate_seats)
      expect(allocation.listSeats.get(party.party) ?? 0).toBe(party.list_seats)
      expect(allocation.totalSeats.get(party.party) ?? 0).toBe(party.total_seats)
    })

  it('seats nobody the Commission did not', () => {
    const declared = new Set(fixture.official.map(party => party.party))
    const seated = [...allocation.totalSeats.entries()]
      .filter(([, seats]) => seats > 0)
      .map(([party]) => party)
    expect(seated.filter(party => !declared.has(party))).toEqual([])
  })

  it('produces a House the size the Commission did', () => {
    const declared = fixture.official.reduce((sum, party) => sum + party.total_seats, 0)
    expect(allocation.houseSize).toBe(declared)
    // Every seat is a real person, not an arithmetic remainder.
    expect(allocation.members).toHaveLength(declared)
    expect(allocation.underhang).toBe(0)
    expect(allocation.ties).toEqual([])
  })

  it('elects each member exactly once', () => {
    const elected = allocation.members.map(member => member.candidate)
    expect(new Set(elected).size).toBe(elected.length)
  })

  it('never gives a list seat to someone who won an electorate', () => {
    const byElectorate = new Set(allocation.members
      .filter(member => member.origin === 'electorate')
      .map(member => member.candidate))
    const clash = allocation.members
      .filter(member => member.origin === 'list' && byElectorate.has(member.candidate))
    expect(clash).toEqual([])
  })
})

/* ---------------------------------------------------------------------------
 * Isolated rules
 * ------------------------------------------------------------------------ */

const settings = (overrides: Partial<MmpSettings> = {}): MmpSettings =>
  ({ ...OFFICIAL_MMP_SETTINGS, ...overrides })

/** A party with `seats` electorate wins and a list long enough to fill any total. */
function party(number: number, votes: number, electorateWins: number, listSize = 200) {
  const wins = Array.from({ length: electorateWins }, (_, index) => ({
    electorate: number * 1000 + index,
    candidate: number * 10000 + index,
    party: number,
  }))
  const list = Array.from({ length: listSize }, (_, index) => ({
    candidate: number * 10000 + index,
    party: number,
    listPos: index + 1,
  }))
  return { vote: { party: number, votes }, wins, list }
}

function build(...parties: ReturnType<typeof party>[]): AllocationInput {
  return {
    partyVotes: parties.map(p => p.vote),
    electorateWins: parties.flatMap(p => p.wins),
    listCandidates: parties.flatMap(p => p.list),
  }
}

describe('the threshold', () => {
  const big = party(1, 600_000, 0)
  const small = party(2, 20_000, 0)      // 3.2 per cent, no electorate
  const coattail = party(3, 20_000, 1)   // 3.2 per cent, one electorate
  const input = build(big, small, coattail)

  it('excludes a party below it with no electorate seat', () => {
    const result = allocateSeats(input, settings())
    expect(result.totalSeats.get(2) ?? 0).toBe(0)
    expect(result.qualification.find(p => p.party === 2)?.reason).toBe('below-threshold')
  })

  it('admits a party below it that won an electorate', () => {
    const result = allocateSeats(input, settings())
    const admitted = result.qualification.find(p => p.party === 3)
    expect(admitted?.qualified).toBe(true)
    expect(admitted?.reason).toBe('electorate-seat')
    expect(result.totalSeats.get(3) ?? 0).toBeGreaterThan(1)
  })

  it('reduces that party to its electorate seat when coattailing is off', () => {
    const result = allocateSeats(input, settings({ allowCoattailing: false }))
    expect(result.qualification.find(p => p.party === 3)?.qualified).toBe(false)
    // The member still sits -- an electorate seat cannot be taken away.
    expect(result.totalSeats.get(3) ?? 0).toBe(1)
    expect(result.outsideSeats).toBe(1)
    // And the seat comes out of the pool the rest share.
    expect(result.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats)
  })
})

describe('an independent', () => {
  const input = build(party(1, 600_000, 2), party(2, 400_000, 1))
  input.electorateWins.push({ electorate: 99, candidate: 90_000, party: null })

  it('holds a seat in no party total, so the two together make the House', () => {
    const result = allocateSeats(input, settings())
    const partySeats = [...result.totalSeats.values()].reduce((sum, seats) => sum + seats, 0)

    expect(result.independentSeats).toBe(1)
    expect(result.houseSize).toBe(120)
    expect(partySeats + result.independentSeats).toBe(result.houseSize)
  })

  it('is not counted while the seat is tied', () => {
    const tied = build(party(1, 600_000, 0), party(2, 400_000, 0))
    tied.electorateWins.push({ electorate: 99, candidate: null, party: null, tie: true })
    expect(allocateSeats(tied, settings()).independentSeats).toBe(0)
  })

  it('is not confused with the winner of a party that did not qualify', () => {
    const result = allocateSeats(
      build(party(1, 600_000, 0), party(3, 20_000, 1)), settings({ allowCoattailing: false }))
    expect(result.outsideSeats).toBe(1)
    expect(result.independentSeats).toBe(0)
  })
})

describe('overhang', () => {
  // Two electorate seats on a vote share worth about one.
  const giant = party(1, 900_000, 0)
  const local = party(2, 10_000, 2)
  const input = build(giant, local)

  it('grows the House rather than unseating an electorate member', () => {
    const result = allocateSeats(input, settings())
    const entitled = result.entitlement.get(2) ?? 0
    expect(entitled).toBeLessThan(2)
    expect(result.totalSeats.get(2)).toBe(2)
    expect(result.overhang).toBe(2 - entitled)
    expect(result.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats + result.overhang)
    // Everyone else keeps exactly what the original allocation gave them.
    expect(result.totalSeats.get(1)).toBe(result.entitlement.get(1))
  })

  it('holds the House at the base size when overhang is disallowed', () => {
    const result = allocateSeats(input, settings({ allowOverhang: false }))
    expect(result.totalSeats.get(2)).toBe(2)
    expect(result.overhang).toBe(0)
    expect(result.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats)
  })
})

describe('overhang from two parties at once', () => {
  // The 2023 party vote, unchanged, with The Opportunities Party (24) given
  // Dunedin, Ilam, Ōhāriu and Waikato. Te Pāti Māori (14) already overhangs by
  // two; TOP now qualifies on an electorate and overhangs by one. Worked by
  // hand to the same cut: NZ First's 15th divisor takes the 120th seat at
  // 11,570, Labour's 67th misses at 11,456.
  const TOP = 24
  const taken: Record<number, number> = { 8: 172, 15: 176, 33: 173, 56: 165 }
  const input: AllocationInput = {
    ...(ge2023 as Fixture),
    electorateWins: (ge2023 as Fixture).electorateWins.map(win =>
      taken[win.electorate] === undefined
        ? win
        : { electorate: win.electorate, candidate: taken[win.electorate]!, party: TOP }),
  }
  const result = allocateSeats(input, settings())

  it('keeps every electorate seat and grows the House by both overhangs', () => {
    expect(Object.fromEntries(result.totalSeats)).toEqual({
      16: 47, 13: 33, 10: 14, 5: 11, 17: 8, 14: 6, [TOP]: 4,
    })
    expect(Object.fromEntries(result.overhangByParty)).toEqual({ 14: 2, [TOP]: 1 })
    expect(result.overhang).toBe(3)
    expect(result.houseSize).toBe(123)
    expect(result.members).toHaveLength(123)
  })

  it('takes nothing from anyone else to make room', () => {
    for (const [party, seats] of result.entitlement) {
      if (party === 14 || party === TOP) continue
      expect(result.totalSeats.get(party)).toBe(seats)
    }
  })
})

describe('an exhausted list', () => {
  // Entitled to far more seats than it has candidates to fill them with.
  const short = party(1, 900_000, 0, 3)
  const other = party(2, 100_000, 0)
  const result = allocateSeats(build(short, other), settings())
  const entitled = result.entitlement.get(1)!

  it('leaves the seats it cannot fill vacant, and the House smaller', () => {
    expect(result.underhangByParty.get(1)).toBe(entitled - 3)
    expect(result.underhang).toBe(entitled - 3)
    expect(result.totalSeats.get(1)).toBe(3)
    expect(result.listSeats.get(1)).toBe(3)
    expect(result.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats - result.underhang)
    expect(result.members).toHaveLength(result.houseSize)
  })

  it('gives the vacant seats to nobody else', () => {
    expect(result.totalSeats.get(2)).toBe(result.entitlement.get(2))
  })
})

describe('an overhang and an underhang together', () => {
  // Party 3 wins two electorates on a vote worth one seat; party 1 is
  // entitled to more seats than its list holds. The House can come back to
  // exactly 120, but both are still reported, each against its own party.
  const big = party(1, 600_000, 0, 50)
  const mid = party(2, 400_000, 0)
  const local = party(3, 6_000, 2)
  const result = allocateSeats(build(big, mid, local), settings())

  it('reports each one separately rather than netting them off', () => {
    const over = result.overhangByParty.get(3)!
    const under = result.underhangByParty.get(1)!
    expect(over).toBeGreaterThan(0)
    expect(under).toBeGreaterThan(0)
    expect(result.overhang).toBe(over)
    expect(result.underhang).toBe(under)
    expect(result.overhangByParty.has(1)).toBe(false)
    expect(result.underhangByParty.has(3)).toBe(false)
    expect(result.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats + over - under)
  })

  it('reports both even when they cancel out', () => {
    // A list one name short of party 1's entitlement, against an overhang of one.
    const entitled = result.entitlement.get(1)!
    const exact = allocateSeats(
      build(party(1, 600_000, 0, entitled - 1), mid, party(3, 6_000, 1 + result.entitlement.get(3)!)),
      settings())
    expect(exact.overhang).toBe(1)
    expect(exact.underhang).toBe(1)
    expect(exact.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats)
  })
})

describe('a dead candidate', () => {
  it('is skipped, and the next on the list takes the seat', () => {
    const input = build(party(1, 900_000, 0), party(2, 100_000, 0))
    input.listCandidates = input.listCandidates.map(candidate =>
      (candidate.party === 1 && candidate.listPos === 1
        ? { ...candidate, isDead: true }
        : candidate))

    const result = allocateSeats(input, settings())
    const seated = result.members.filter(m => m.party === 1).map(m => m.listPos)
    expect(seated).not.toContain(1)
    expect(seated).toContain(2)
    expect(result.underhang).toBe(0)
  })
})

describe('a tied electorate', () => {
  /** A tie in electorate 99 between the given parties' candidates. */
  const tie = (...parties: (number | null)[]) => ({
    electorate: 99,
    candidate: null,
    party: null,
    tie: true,
    contenders: parties.map((p, index) => ({ candidate: 90_000 + index, party: p })),
  })

  it('seats nobody and is reported as undecided', () => {
    const input = build(party(1, 600_000, 0), party(2, 400_000, 0))
    input.electorateWins.push(tie(1, 2))

    const result = allocateSeats(input, settings())
    expect(result.undecidedElectorates).toEqual([99])
    expect(result.members.some(m => m.electorate === 99)).toBe(false)
  })

  it('is not counted as a seat on top of the proportional share', () => {
    // Either party holds it in place of a list seat, so the House is 120
    // whichever way it goes, and no party's total depends on it.
    const input = build(party(1, 600_000, 0), party(2, 400_000, 0))
    input.electorateWins.push(tie(1, 2))

    const result = allocateSeats(input, settings())
    expect(result.houseSize).toBe(120)
    expect(result.members).toHaveLength(120)
    expect(result.tieOutcomes).toEqual({ houseSizes: [120], totalsVary: false })
  })

  it('reports that the House depends on it when one side would overhang', () => {
    // Party 2 already holds the one seat its vote is worth. A second
    // electorate would be an overhang; the seat going to party 1 would not.
    const input = build(party(1, 900_000, 0), party(2, 10_000, 1))
    input.electorateWins.push(tie(1, 2))

    const result = allocateSeats(input, settings())
    expect(result.entitlement.get(2)).toBe(1)
    expect(result.houseSize).toBe(120)
    expect(result.tieOutcomes).toEqual({ houseSizes: [120, 121], totalsVary: true })
  })

  it('reports that party totals depend on it when an independent is level', () => {
    // An independent winning takes the seat out of the proportional pool.
    const input = build(party(1, 600_000, 0), party(2, 400_000, 0))
    input.electorateWins.push(tie(1, null))

    const result = allocateSeats(input, settings())
    expect(result.tieOutcomes).toEqual({ houseSizes: [120], totalsVary: true })
  })

  it('says nothing about outcomes it was not told the contenders for', () => {
    const input = build(party(1, 600_000, 0), party(2, 400_000, 0))
    input.electorateWins.push({ electorate: 99, candidate: null, party: null, tie: true })
    expect(allocateSeats(input, settings()).tieOutcomes).toBeNull()
  })
})

describe('a tie on the final quotient', () => {
  it('is reported rather than broken', () => {
    // Two parties with identical votes cannot both take an odd last seat.
    const result = allocateSeats(
      build(party(1, 100_000, 0), party(2, 100_000, 0)),
      settings({ baseSeats: 3 }))

    expect(result.ties).toHaveLength(2)
    expect(result.ties.every(quotient => !quotient.awarded)).toBe(true)
    expect(result.undecidedSeats).toBe(1)
    // Each party keeps only the seat it wins outright; the third is nobody's.
    expect(Object.fromEntries(result.totalSeats)).toEqual({ 1: 1, 2: 1 })
    expect(result.members).toHaveLength(2)
    expect(result.houseSize).toBe(3)
  })

  it('does not depend on the order the parties arrive in', () => {
    const forwards = allocateSeats(
      build(party(1, 100_000, 0), party(2, 100_000, 0)), settings({ baseSeats: 3 }))
    const backwards = allocateSeats(
      build(party(2, 100_000, 0), party(1, 100_000, 0)), settings({ baseSeats: 3 }))
    expect(Object.fromEntries(backwards.totalSeats)).toEqual(Object.fromEntries(forwards.totalSeats))
  })

  it('leaves every contested seat empty when more are level than are left', () => {
    // Three parties level for two seats: every first quotient sits on the cut,
    // so neither seat can be given without choosing between them.
    const result = allocateSeats(
      build(party(1, 100_000, 0), party(2, 100_000, 0), party(3, 100_000, 0)),
      settings({ baseSeats: 2, threshold: 0 }))
    expect(result.ties).toHaveLength(3)
    expect(result.undecidedSeats).toBe(2)
    expect(result.members).toHaveLength(0)
    expect(result.houseSize).toBe(2)
  })

  it('reports none when the seats divide cleanly', () => {
    const result = allocateSeats(
      build(party(1, 100_000, 0), party(2, 100_000, 0)),
      settings({ baseSeats: 2 }))
    expect(result.ties).toEqual([])
    expect(result.undecidedSeats).toBe(0)
  })
})

describe('D\'Hondt', () => {
  it('favours the largest party more than Sainte-Lague does', () => {
    const input = build(party(1, 500_000, 0), party(2, 300_000, 0), party(3, 200_000, 0))
    const sainteLague = allocateSeats(input, settings())
    const dhondt = allocateSeats(input, settings({ formula: 'dhondt' }))

    expect(dhondt.totalSeats.get(1)!).toBeGreaterThanOrEqual(sainteLague.totalSeats.get(1)!)
    expect(dhondt.houseSize).toBe(OFFICIAL_MMP_SETTINGS.baseSeats)
  })
})

describe('a by-election', () => {
  it('allocates nothing when there is no party vote', () => {
    const result = allocateSeats({
      partyVotes: [],
      electorateWins: [{ electorate: 39, candidate: 1, party: 16 }],
      listCandidates: [],
    }, settings())

    expect(result.totalPartyVotes).toBe(0)
    expect(result.qualification).toEqual([])
    // The winner is still a member; there is simply no allocation around them.
    expect(result.members).toHaveLength(1)
    expect(result.members[0]!.origin).toBe('electorate')
  })
})
