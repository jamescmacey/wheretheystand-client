/**
 * Ordering parties by political bloc rather than by size.
 *
 * Who could govern with whom is the question a chamber answers and a bar chart
 * does not, and it is only legible if the parties likely to work together are
 * drawn together. Size ordering puts the two largest parties side by side in
 * the middle, which is the one arrangement that says nothing.
 *
 * The blocs are curated per results version in Django, as two ordered lists of
 * persistent party ids, and one rule decides the whole seating plan:
 *
 *     [...left, ...crossbench, ...right]
 *
 * reads from the far left of the chamber to the far right. So the left list is
 * curated far-left first, the right list centre first, and a party in neither
 * is cross-bench and sits in the middle, ordered by size.
 *
 * Where no blocs are curated -- every archived election -- `orderByBloc` falls
 * back to size, so nothing that used to render one way starts rendering
 * another.
 */

import type { EntityNumber, PartyBlocs, PersistentId } from '~/types/elections'

export type Bloc = 'left' | 'crossbench' | 'right'

/** Resolves an election party number to its persistent id, or null. */
export type ResolvePersistentParty = (party: EntityNumber) => PersistentId | null

/** Whether either bloc has been curated for this version. */
export function hasBlocs(blocs: PartyBlocs | null | undefined): boolean {
  return Boolean(blocs && (blocs.left.length || blocs.right.length))
}

/**
 * Which bloc a persistent party sits in.
 *
 * Cross-bench is the answer for a party in neither list, including one with no
 * persistent record at all: an unrecognised party has no alignment to claim.
 */
export function blocFor(
  blocs: PartyBlocs | null | undefined,
  persistentParty: PersistentId | null,
): Bloc {
  if (!blocs || !persistentParty) return 'crossbench'
  if (blocs.left.includes(persistentParty)) return 'left'
  if (blocs.right.includes(persistentParty)) return 'right'
  return 'crossbench'
}

/**
 * Entries ordered from the far left of the chamber to the far right.
 *
 * `entries` are `[party number, seats]` pairs, which is the shape every seat
 * map in the dashboard already holds. Returned in bloc order, each bloc in the
 * order it was curated, with the cross-bench between them ordered by size.
 *
 * Unordered within a bloc means curated order, deliberately: a bloc's internal
 * seating is a judgement about where a party sits politically, and size is a
 * poor proxy for it.
 */
export function orderByBloc(
  entries: [EntityNumber, number][],
  blocs: PartyBlocs | null | undefined,
  resolve: ResolvePersistentParty,
): [EntityNumber, number][] {
  const bySize = [...entries].sort((a, b) => b[1] - a[1])
  if (!hasBlocs(blocs)) return bySize

  const left: [EntityNumber, number][] = []
  const crossbench: [EntityNumber, number][] = []
  const right: [EntityNumber, number][] = []

  // Walked in size order so that the cross-bench comes out largest first
  // without a second sort.
  for (const entry of bySize) {
    const bloc = blocFor(blocs, resolve(entry[0]))
    if (bloc === 'left') left.push(entry)
    else if (bloc === 'right') right.push(entry)
    else crossbench.push(entry)
  }

  return [
    ...sortByCuratedOrder(left, blocs!.left, resolve),
    ...crossbench,
    ...sortByCuratedOrder(right, blocs!.right, resolve),
  ]
}

/** One bloc, in the order it was curated. */
function sortByCuratedOrder(
  entries: [EntityNumber, number][],
  order: PersistentId[],
  resolve: ResolvePersistentParty,
): [EntityNumber, number][] {
  const position = new Map(order.map((id, index) => [id, index]))
  return [...entries].sort((a, b) => {
    const left = position.get(resolve(a[0]) ?? '') ?? Number.MAX_SAFE_INTEGER
    const right = position.get(resolve(b[0]) ?? '') ?? Number.MAX_SAFE_INTEGER
    // Equal only where neither was curated, in which case size decides.
    return left - right || b[1] - a[1]
  })
}

/**
 * Where seats belonging to nobody should sit.
 *
 * An unfilled or undecided seat has no bloc, so it goes to the middle with the
 * cross-bench rather than on one end. Appending it would pad whichever bloc
 * sits on that edge and make it read as larger than the count supports.
 *
 * Returns the index to splice them in at: after the left bloc and the
 * cross-bench, before the right bloc.
 */
export function unalignedSeatIndex(
  ordered: [EntityNumber, number][],
  blocs: PartyBlocs | null | undefined,
  resolve: ResolvePersistentParty,
): number {
  if (!hasBlocs(blocs)) return ordered.length

  const firstRight = ordered.findIndex(
    entry => blocFor(blocs, resolve(entry[0])) === 'right')
  return firstRight === -1 ? ordered.length : firstRight
}
