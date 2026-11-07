import { describe, expect, it } from 'vitest'
import type { FeedMessage } from '~/types/elections'
import {
  MAX_FEED_ELECTORATES,
  isVisibleFeedMessage,
  normaliseFeedElectorates,
} from '~/utils/elections/feedFilter'

const base = { id: 'a', event_id: 'ge', title: 't', body: '', timestamp: null, timestamp_seconds: null }

function votingPlace(physicalElectorate: number | null, electorate = 99): FeedMessage {
  return {
    ...base,
    type: 'VOTING_PLACE_ADDED',
    metadata: {
      voting_place: 1,
      physical_electorate: physicalElectorate,
      electorate,
      votes_added: 1,
      total_votes: 1,
    },
  }
}

const composition: FeedMessage = {
  ...base,
  type: 'COMPOSITION_CHANGED',
  metadata: { house_size: 120, changes: [] },
}

describe('isVisibleFeedMessage', () => {
  it('hides every voting place when they are turned off', () => {
    expect(isVisibleFeedMessage(votingPlace(5), false, [])).toBe(false)
    expect(isVisibleFeedMessage(votingPlace(5), false, [5])).toBe(false)
  })

  it('shows every voting place when no electorate is chosen', () => {
    expect(isVisibleFeedMessage(votingPlace(5), true, [])).toBe(true)
    expect(isVisibleFeedMessage(votingPlace(null), true, [])).toBe(true)
  })

  it('matches where the place sits, not the electorate the votes count towards', () => {
    expect(isVisibleFeedMessage(votingPlace(5, 9), true, [5])).toBe(true)
    expect(isVisibleFeedMessage(votingPlace(5, 9), true, [9])).toBe(false)
  })

  it('narrows voting places to the chosen electorates', () => {
    expect(isVisibleFeedMessage(votingPlace(5), true, [5, 9])).toBe(true)
    expect(isVisibleFeedMessage(votingPlace(6), true, [5, 9])).toBe(false)
    expect(isVisibleFeedMessage(votingPlace(null), true, [5])).toBe(false)
  })

  it('leaves other entries alone whatever is chosen', () => {
    expect(isVisibleFeedMessage(composition, false, [])).toBe(true)
    expect(isVisibleFeedMessage(composition, true, [5])).toBe(true)
  })
})

describe('normaliseFeedElectorates', () => {
  it('sorts and removes repeats and anything that is not a whole number', () => {
    expect(normaliseFeedElectorates([9, 5, 9, '3', 1.5, null])).toEqual([5, 9])
  })

  it('treats anything but a list as no selection', () => {
    expect(normaliseFeedElectorates('5')).toEqual([])
    expect(normaliseFeedElectorates(null)).toEqual([])
  })

  it('holds to the limit', () => {
    const many = Array.from({ length: 40 }, (_, index) => index)
    expect(normaliseFeedElectorates(many)).toHaveLength(MAX_FEED_ELECTORATES)
  })
})
