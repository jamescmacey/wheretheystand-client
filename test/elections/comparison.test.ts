import { describe, expect, it } from 'vitest'

import {
  normaliseSnapshotComparison,
  normaliseSnapshotPersistentData,
  normaliseVersionPaths,
} from '~/utils/elections/normaliseSnapshot'
import { candidateComparisonFigures, partyComparisonShare } from '~/utils/elections/comparison'
import { partyFill } from '~/utils/elections/partyFill'

/**
 * The comparison file, which lets one election be measured against another
 * from a single fetch. Everything in it is keyed on persistent ids, so it has
 * to arrive intact without the other election's reference data.
 */

const published = {
  version: 1,
  election: { id: 'e-2023', slug: '2023-general-election', name: '2023 General Election', polling_date: '2023-10-14' },
  results_version: { id: 'v-2023', slug: 'official-count', name: 'Official count', is_final: true },
  national: {
    party_votes: {
      is_final: true,
      total_valid_votes: 400,
      parties: [
        { party: 'p-blue', count: 300, per_cent: 75, electorate_seats: 5, list_seats: 10, total_seats: 15 },
        { party: null, count: 100, per_cent: 25, electorate_seats: null, list_seats: null, total_seats: null },
      ],
    },
  },
  electorates: {
    'pe-ilam': {
      party_votes: null,
      candidate_votes: {
        is_final: false,
        total_valid_votes: 1000,
        candidates: [
          { candidate: 'pc-smith', party: 'p-blue', count: 750, per_cent: 75 },
          { candidate: null, party: null, count: 250, per_cent: 25 },
        ],
      },
    },
  },
}

describe('normaliseSnapshotComparison', () => {
  it('keeps national party shares and seats', () => {
    const comparison = normaliseSnapshotComparison(published)
    expect(comparison.election.slug).toBe('2023-general-election')
    expect(comparison.national.party_votes?.parties[0]).toEqual({
      party: 'p-blue', count: 300, per_cent: 75, electorate_seats: 5, list_seats: 10, total_seats: 15,
    })
  })

  it('keeps unlinked entries, whose share is still part of the valid vote', () => {
    const seat = normaliseSnapshotComparison(published).electorates['pe-ilam']!
    expect(seat.party_votes).toBeNull()
    expect(seat.candidate_votes?.candidates[1]).toEqual({
      candidate: null, party: null, count: 250, per_cent: 25,
    })
  })

  it('reads an empty payload as no results rather than failing', () => {
    const comparison = normaliseSnapshotComparison({})
    expect(comparison.national.party_votes).toBeNull()
    expect(comparison.electorates).toEqual({})
  })
})

describe('comparison and alternate colour in existing payloads', () => {
  it('reads the comparison path only where one is published', () => {
    const base = { persistent: 'p.json', reference: 'r.json', results: 's.json' }
    expect(normaliseVersionPaths(base).comparison).toBeUndefined()
    expect(normaliseVersionPaths({ ...base, comparison: 'c.json' }).comparison).toBe('c.json')
  })

  it('reads the alternate colour, defaulting to null', () => {
    const data = normaliseSnapshotPersistentData({
      persistent_parties: [
        { id: 'a', colour: '#0000ff', alternate_colour: '#00aaff' },
        { id: 'b', colour: '#ff0000' },
      ],
    })
    expect(data.persistent_parties.map(party => party.alternate_colour)).toEqual(['#00aaff', null])
  })
})

describe('candidateComparisonFigures', () => {
  const tally = {
    is_final: true,
    total_valid_votes: 1000,
    candidates: [
      { candidate: 'pc-defector', party: 'p-labour', count: 400, per_cent: 40 },
      { candidate: 'pc-old-green', party: 'p-green', count: 80, per_cent: 8 },
      { candidate: 'pc-returning', party: 'p-act', count: 50, per_cent: 5 },
      { candidate: 'pc-indy', party: null, count: 30, per_cent: 3 },
      { candidate: null, party: 'p-top', count: 20, per_cent: 2 },
    ],
  }

  it('shows a returning candidate for the same party plainly', () => {
    expect(candidateComparisonFigures(tally, 'pc-returning', 'p-act'))
      .toEqual([{ basis: 'same', per_cent: 5 }])
  })

  it('treats an independent standing as one again as the same', () => {
    expect(candidateComparisonFigures(tally, 'pc-indy', null))
      .toEqual([{ basis: 'same', per_cent: 3 }])
  })

  it('falls back to the party\'s candidate for somebody new', () => {
    expect(candidateComparisonFigures(tally, 'pc-new', 'p-labour'))
      .toEqual([{ basis: 'party', per_cent: 40 }])
  })

  it('matches a party whose last candidate has no persistent record', () => {
    expect(candidateComparisonFigures(tally, null, 'p-top'))
      .toEqual([{ basis: 'party', per_cent: 2 }])
  })

  it('shows both figures for a defection, the candidate\'s own first', () => {
    expect(candidateComparisonFigures(tally, 'pc-defector', 'p-green')).toEqual([
      { basis: 'candidate', per_cent: 40 },
      { basis: 'party', per_cent: 8 },
    ])
  })

  it('shows only the candidate where their new party did not stand', () => {
    expect(candidateComparisonFigures(tally, 'pc-defector', 'p-new'))
      .toEqual([{ basis: 'candidate', per_cent: 40 }])
  })

  it('shows nothing where neither stood', () => {
    expect(candidateComparisonFigures(tally, 'pc-new', 'p-new')).toEqual([])
    expect(candidateComparisonFigures(null, 'pc-returning', 'p-act')).toEqual([])
  })
})

describe('partyComparisonShare', () => {
  it('finds a party by persistent id, and nothing for an unlinked one', () => {
    const tally = normaliseSnapshotComparison(published).national.party_votes
    expect(partyComparisonShare(tally, 'p-blue')).toBe(75)
    expect(partyComparisonShare(tally, 'p-missing')).toBeNull()
    expect(partyComparisonShare(tally, null)).toBeNull()
  })
})

describe('partyFill', () => {
  it('paints a party with one colour flat', () => {
    expect(partyFill('#ff0000', null, 'horizontal')).toBe('#ff0000')
  })

  it('puts the primary colour on top for bars', () => {
    expect(partyFill('#ff0000', '#0000ff', 'horizontal'))
      .toBe('linear-gradient(to bottom, #ff0000 50%, #0000ff 50%)')
  })

  it('splits dots and squares from the bottom left to the top right', () => {
    expect(partyFill('#ff0000', '#0000ff', 'diagonal'))
      .toBe('linear-gradient(to bottom right, #ff0000 50%, #0000ff 50%)')
  })
})
