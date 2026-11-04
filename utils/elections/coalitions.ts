/**
 * Coalitions a reader might want to test against the seat count.
 *
 * A coalition is a set of parties. The parties are held as stable
 * keys rather than election party numbers: a persistent id where the party has
 * one, which is what the blocs are curated against and what survives from the
 * preliminary count to the official one, and `#<number>` where it does not.
 * So a coalition saved on election night still means the same parties when the
 * official result is published.
 */

import type { EntityNumber, PersistentId } from '~/types/elections'

export interface Coalition {
  id: string
  /** Stable party keys; see `partyKey`. */
  parties: string[]
}

/** The key a coalition holds a party by. */
export function partyKey(party: EntityNumber, persistent: PersistentId | null): string {
  return persistent ?? `#${party}`
}

/** Seats needed to govern alone in a House of this size. */
export function majorityFor(houseSize: number): number {
  return Math.floor(houseSize / 2) + 1
}

/**
 * Seats the parties in a coalition hold between them.
 *
 * `keyFor` maps an election party number to its stable key. A key that matches
 * no party in this result -- one that won no seats, or did not stand -- adds
 * nothing rather than failing.
 */
export function coalitionSeats(
  parties: string[],
  totalSeats: Map<EntityNumber, number>,
  keyFor: (party: EntityNumber) => string,
): number {
  const wanted = new Set(parties)
  let seats = 0
  for (const [party, count] of totalSeats) {
    if (wanted.has(keyFor(party))) seats += count
  }
  return seats
}

/**
 * Coalitions read back from storage, with anything malformed dropped.
 *
 * Storage is the reader's to edit, and a value from an older version of the
 * page or a hand-edited one should cost that one entry, not the whole list.
 */
export function sanitiseCoalitions(raw: unknown): Coalition[] {
  if (!Array.isArray(raw)) return []
  const clean: Coalition[] = []
  const seen = new Set<string>()

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const value = entry as Record<string, unknown>
    if (typeof value.id !== 'string' || !value.id || seen.has(value.id)) continue
    if (!Array.isArray(value.parties)) continue

    seen.add(value.id)
    clean.push({
      id: value.id,
      parties: [...new Set(value.parties.filter((party): party is string =>
        typeof party === 'string' && party.length > 0))],
    })
  }

  return clean
}
