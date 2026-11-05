import type { ReferenceVotingPlace, VotingPlaceHit } from '~/types/elections'

/**
 * An Algolia voting place record, in the shape the store shares.
 *
 * Every page that resolves places through Algolia -- the directory, an
 * electorate's list, a single place -- writes what it got back through this, so
 * the next page to want the same place reads it from the store instead of
 * asking Algolia again.
 */
export function votingPlaceFromHit(hit: VotingPlaceHit): ReferenceVotingPlace {
  return {
    number: hit.number,
    physical_electorate: hit.electorate_number ?? null,
    address: hit.address,
    latitude: hit.latitude ?? hit._geoloc?.lat ?? null,
    longitude: hit.longitude ?? hit._geoloc?.lng ?? null,
    persistent_voting_place: hit.persistent_voting_place ?? null,
    id: hit.objectID,
  }
}
