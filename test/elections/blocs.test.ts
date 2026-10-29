import { describe, expect, it } from 'vitest'

import type { EntityNumber, PartyBlocs, PersistentId } from '~/types/elections'
import { blocFor, hasBlocs, orderByBloc, unalignedSeatIndex } from '~/utils/elections/blocs'

/**
 * Seating order, which is the whole reason to draw a chamber rather than a bar
 * chart: who could govern with whom is a question about which parties sit next
 * to each other.
 *
 * The rule under test is that `[...left, ...crossbench, ...right]` reads from
 * the far left of the chamber to the far right -- so the left list is curated
 * far-left first and the right list centre first.
 */

const ids: Record<EntityNumber, PersistentId> = {
  1: 'p-labour',
  2: 'p-national',
  3: 'p-green',
  4: 'p-act',
  5: 'p-tpm',
  6: 'p-unlinked',
}

const resolve = (party: EntityNumber) => ids[party] ?? null

/** Greens then Labour on the left; National then ACT on the right. */
const blocs: PartyBlocs = {
  left: ['p-green', 'p-labour'],
  right: ['p-national', 'p-act'],
}

/** Labour 34, National 49, Greens 15, ACT 11, Te Pati Maori 6, unlinked 2. */
const seats: [EntityNumber, number][] = [[1, 34], [2, 49], [3, 15], [4, 11], [5, 6], [6, 2]]

const numbers = (entries: [EntityNumber, number][]) => entries.map(([party]) => party)

describe('hasBlocs', () => {
  it('is false where nothing has been curated', () => {
    expect(hasBlocs(null)).toBe(false)
    expect(hasBlocs({ left: [], right: [] })).toBe(false)
  })

  it('is true where only one side has been curated', () => {
    expect(hasBlocs({ left: ['p-green'], right: [] })).toBe(true)
  })
})

describe('blocFor', () => {
  it('reads a party out of whichever list holds it', () => {
    expect(blocFor(blocs, 'p-green')).toBe('left')
    expect(blocFor(blocs, 'p-act')).toBe('right')
  })

  it('puts a party in neither list on the cross-bench', () => {
    expect(blocFor(blocs, 'p-tpm')).toBe('crossbench')
  })

  it('puts a party with no persistent record on the cross-bench', () => {
    // An unrecognised party has no alignment to claim.
    expect(blocFor(blocs, null)).toBe('crossbench')
  })

  it('puts everything on the cross-bench where nothing is curated', () => {
    expect(blocFor(null, 'p-green')).toBe('crossbench')
  })
})

describe('orderByBloc', () => {
  it('reads left bloc, cross-bench, then right bloc', () => {
    // Greens (curated first) then Labour; Te Pati Maori and the unlinked party
    // in the middle; National (curated first, so nearest the centre) then ACT.
    expect(numbers(orderByBloc(seats, blocs, resolve))).toEqual([3, 1, 5, 6, 2, 4])
  })

  it('keeps each bloc in its curated order, not in size order', () => {
    // The Greens have 15 seats to Labour's 34 and still sit further left.
    const ordered = orderByBloc(seats, blocs, resolve)
    expect(ordered[0]).toEqual([3, 15])
    expect(ordered[1]).toEqual([1, 34])
  })

  it('orders the cross-bench by size', () => {
    const ordered = numbers(orderByBloc(seats, blocs, resolve))
    expect(ordered.slice(2, 4)).toEqual([5, 6])
  })

  it('falls back to size where no blocs are curated', () => {
    // Every archived election. Nothing that rendered one way starts rendering
    // another.
    expect(numbers(orderByBloc(seats, null, resolve))).toEqual([2, 1, 3, 4, 5, 6])
  })

  it('puts a party curated in no bloc on the cross-bench, by size', () => {
    const partial: PartyBlocs = { left: ['p-labour'], right: ['p-national'] }
    expect(numbers(orderByBloc(seats, partial, resolve))).toEqual([1, 3, 4, 5, 6, 2])
  })

  it('does not mutate what it is given', () => {
    const input: [EntityNumber, number][] = [...seats]
    orderByBloc(input, blocs, resolve)
    expect(input).toEqual(seats)
  })

  it('handles an empty House', () => {
    expect(orderByBloc([], blocs, resolve)).toEqual([])
  })
})

describe('unalignedSeatIndex', () => {
  it('points at the start of the right bloc, so hollow seats land in the middle', () => {
    const ordered = orderByBloc(seats, blocs, resolve)
    // After the Greens, Labour, and the two cross-bench parties.
    expect(unalignedSeatIndex(ordered, blocs, resolve)).toBe(4)
  })

  it('points at the end where no blocs are curated', () => {
    // Which is where unfilled seats were drawn before blocs existed.
    expect(unalignedSeatIndex(seats, null, resolve)).toBe(seats.length)
  })

  it('points at the end where the right bloc holds no seats', () => {
    const leftOnly: [EntityNumber, number][] = [[3, 15], [1, 34]]
    const ordered = orderByBloc(leftOnly, blocs, resolve)
    expect(unalignedSeatIndex(ordered, blocs, resolve)).toBe(2)
  })
})
