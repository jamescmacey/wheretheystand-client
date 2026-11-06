import { describe, expect, it } from 'vitest'

import { comparisonGallagherIndex, gallagherIndex, nationalInformals, wastedVote } from '~/utils/elections/disproportionality'

describe('gallagherIndex', () => {
  it('is zero when seats match votes exactly', () => {
    expect(gallagherIndex([{ votes: 60, seats: 6 }, { votes: 40, seats: 4 }])).toBeCloseTo(0)
  })

  it('matches a hand-worked case', () => {
    // Differences of 10 and 10: √(½(100 + 100)) = 10.
    expect(gallagherIndex([{ votes: 60, seats: 50 }, { votes: 40, seats: 50 }])).toBeCloseTo(10)
  })

  it('counts a party with votes and no seats', () => {
    // Differences of 10, 0 and 10: √(½(100 + 0 + 100)) = 10.
    expect(gallagherIndex([
      { votes: 50, seats: 60 }, { votes: 40, seats: 40 }, { votes: 10, seats: 0 },
    ])).toBeCloseTo(10)
  })

  it('counts each independent seat as its own contestant', () => {
    // 100 votes against 98 seats of 100, and two seats on 1 per cent each:
    // √(½(4 + 1 + 1)) = √3.
    expect(gallagherIndex([{ votes: 100, seats: 98 }], 2)).toBeCloseTo(Math.sqrt(3))
  })

  it('has no answer without votes or seats', () => {
    expect(gallagherIndex([{ votes: 0, seats: 5 }])).toBeNull()
    expect(gallagherIndex([{ votes: 5, seats: 0 }])).toBeNull()
  })
})

describe('comparisonGallagherIndex', () => {
  it('matches the official 2023 count, worked by hand', () => {
    // Every row of the published 2023 comparison file. 122 seats, with Port
    // Waikato's election yet to be held.
    const index = comparisonGallagherIndex([
      { count: 1_085_851, total_seats: 48 },
      { count: 767_540, total_seats: 34 },
      { count: 330_907, total_seats: 15 },
      { count: 246_473, total_seats: 11 },
      { count: 173_553, total_seats: 8 },
      { count: 87_844, total_seats: 6 },
      { count: 63_344, total_seats: 0 },
      { count: 34_478, total_seats: 0 },
      { count: 16_126, total_seats: 0 },
      { count: 13_025, total_seats: 0 },
      { count: 9_586, total_seats: 0 },
      { count: 6_786, total_seats: 0 },
      { count: 5_018, total_seats: 0 },
      { count: 4_532, total_seats: 0 },
      { count: 2_513, total_seats: 0 },
      { count: 2_105, total_seats: 0 },
      { count: 1_530, total_seats: 0 },
    ])
    expect(index).toBeCloseTo(2.633, 3)
  })

  it('has no answer where the file holds no seats', () => {
    expect(comparisonGallagherIndex([{ count: 100, total_seats: null }])).toBeNull()
  })

  it('counts a party with no persistent record, which is still part of the vote', () => {
    expect(comparisonGallagherIndex([
      { count: 60, total_seats: 10 },
      { count: 40, total_seats: null },
    ])).toBeCloseTo(40)
  })
})

describe('wastedVote', () => {
  it('matches the official 2023 count, worked by hand', () => {
    // 2,851,211 valid and 16,267 informal. The six parties seated took
    // 2,692,168, which leaves 159,043 for those that did not qualify.
    const wasted = wastedVote({
      informals: 16_267,
      nonQualifyingVotes: 159_043,
      validVotes: 2_851_211,
    })
    expect(wasted?.total).toBe(175_310)
    expect(wasted?.votesCast).toBe(2_867_478)
    expect(wasted?.share).toBeCloseTo(6.114, 2)
  })

  it('has no answer before a vote is counted', () => {
    expect(wastedVote({ informals: 0, nonQualifyingVotes: 0, validVotes: 0 })).toBeNull()
  })
})

describe('nationalInformals', () => {
  const set = (overrides: { informals?: number | null, party?: number | null, cast?: number | null }) => ({
    informals: overrides.informals ?? null,
    results: [{ count: 100 }, { count: null }],
    statistics: {
      total_votes_cast: overrides.cast ?? null,
      total_party_informals: overrides.party ?? null,
    },
  })

  it('prefers what the tally reports', () => {
    expect(nationalInformals(set({ informals: 3, party: 4, cast: 200 }))).toBe(3)
    expect(nationalInformals(set({ party: 4, cast: 200 }))).toBe(4)
  })

  it('falls back to votes cast less valid votes', () => {
    expect(nationalInformals(set({ cast: 110 }))).toBe(10)
  })

  it('will not report a negative count', () => {
    expect(nationalInformals(set({ cast: 50 }))).toBeNull()
    expect(nationalInformals(set({}))).toBeNull()
  })
})
