import { describe, expect, it } from 'vitest'

import type { EntityNumber, PersistentId } from '~/types/elections'
import {
  coalitionSeats,
  majorityFor,
  partyKey,
  sanitiseCoalitions,
} from '~/utils/elections/coalitions'

const ids: Record<EntityNumber, PersistentId> = {
  1: 'p-labour',
  2: 'p-national',
  3: 'p-green',
}

const keyFor = (party: EntityNumber) => partyKey(party, ids[party] ?? null)

const totalSeats = new Map<EntityNumber, number>([
  [1, 34],
  [2, 49],
  [3, 15],
  [7, 2],
])

describe('partyKey', () => {
  it('prefers the persistent id', () => {
    expect(partyKey(1, 'p-labour')).toBe('p-labour')
  })

  it('falls back to the party number', () => {
    expect(partyKey(7, null)).toBe('#7')
  })
})

describe('majorityFor', () => {
  it('is one more than half, rounded down', () => {
    expect(majorityFor(120)).toBe(61)
    expect(majorityFor(123)).toBe(62)
  })
})

describe('coalitionSeats', () => {
  it('sums the seats of the parties in the coalition', () => {
    expect(coalitionSeats(['p-labour', 'p-green'], totalSeats, keyFor)).toBe(49)
  })

  it('matches parties with no persistent id by number', () => {
    expect(coalitionSeats(['p-national', '#7'], totalSeats, keyFor)).toBe(51)
  })

  it('ignores parties that are not in this result', () => {
    expect(coalitionSeats(['p-nobody'], totalSeats, keyFor)).toBe(0)
  })
})

describe('sanitiseCoalitions', () => {
  it('keeps well-formed entries', () => {
    const value = [{ id: 'a', parties: ['p-labour', 'p-green'] }]
    expect(sanitiseCoalitions(value)).toEqual(value)
  })

  it('drops the names earlier versions stored', () => {
    expect(sanitiseCoalitions([{ id: 'a', name: 'Left', parties: ['p'] }]))
      .toEqual([{ id: 'a', parties: ['p'] }])
  })

  it('drops malformed entries and duplicate ids', () => {
    expect(sanitiseCoalitions([
      null,
      { id: 'a', parties: [] },
      { id: 'a', parties: ['duplicate'] },
      { id: 3, parties: [] },
      { id: 'c' },
    ])).toEqual([{ id: 'a', parties: [] }])
  })

  it('drops non-string and repeated parties', () => {
    expect(sanitiseCoalitions([{ id: 'a', parties: ['p', 'p', 4, ''] }]))
      .toEqual([{ id: 'a', parties: ['p'] }])
  })

  it('returns nothing for anything other than an array', () => {
    expect(sanitiseCoalitions({ id: 'a' })).toEqual([])
    expect(sanitiseCoalitions(null)).toEqual([])
  })
})
