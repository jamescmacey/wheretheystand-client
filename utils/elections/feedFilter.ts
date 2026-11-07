import type { EntityNumber, FeedMessage } from '~/types/elections'

/**
 * How many electorates a reader can narrow voting place updates to.
 *
 * Firestore allows thirty disjunctions in a query once it is expanded. The
 * filtered feed query expands to one for each of the three other message types
 * and one per electorate, which leaves twenty-seven.
 */
export const MAX_FEED_ELECTORATES = 27

/**
 * A selection in the one form the query and the list both use: whole numbers,
 * no repeats, ascending, within the limit.
 *
 * Sorted so that picking the same electorates in another order is the same
 * selection, and does not pay for a new listener. Also what stands between
 * local storage, which a reader can edit, and the query.
 */
export function normaliseFeedElectorates(value: unknown): EntityNumber[] {
  if (!Array.isArray(value)) return []
  const numbers = value.filter((item): item is number => Number.isInteger(item))
  return [...new Set(numbers)].sort((a, b) => a - b).slice(0, MAX_FEED_ELECTORATES)
}

/**
 * Whether an entry is one the reader has asked to see.
 *
 * The electorates narrow voting places only. Lead changes and the rest stay,
 * so narrowing to a few electorates does not hide the shape of the night. An
 * empty selection means every electorate.
 *
 * Matched on where the place physically sits, not on the electorate the entry
 * is titled with. The worker writes one entry per place, naming only the
 * electorate with the largest total, so the place's location is the one thing
 * that reliably says which electorate's filter it belongs under. A place with
 * no recorded location cannot be said to be in the selection, so a selection
 * hides it, which is also what the query does.
 */
export function isVisibleFeedMessage(
  message: FeedMessage,
  showVotingPlaces: boolean,
  electorates: EntityNumber[],
): boolean {
  if (message.type !== 'VOTING_PLACE_ADDED') return true
  if (!showVotingPlaces) return false
  if (!electorates.length) return true
  return message.metadata.physical_electorate !== null
    && electorates.includes(message.metadata.physical_electorate)
}
