import { describe, expect, it } from 'vitest'

import type { ReferenceCandidate } from '~/types/elections'
import { groupCandidatesByParty, sectionCandidateGroups } from '~/utils/elections/candidates'

const candidate = (
  number: number,
  party: number | null,
  list_pos: number | null,
  electorate: number | null,
): ReferenceCandidate => ({
  number,
  name: `Candidate ${number}`,
  party,
  list_pos,
  electorate,
  is_dead: false,
  persistent_candidate: null,
})

const parties: Record<number, string> = { 1: 'Zebra Party', 2: 'Aardvark Party' }
const electorates: Record<number, string> = { 10: 'Wellington', 20: 'Auckland' }

const group = (candidates: ReferenceCandidate[]) => groupCandidatesByParty(
  candidates,
  party => parties[party] ?? '',
  electorate => electorates[electorate] ?? '',
)

describe('groupCandidatesByParty', () => {
  it('orders parties by name, with independents last', () => {
    const groups = group([
      candidate(1, null, null, 10),
      candidate(2, 1, 1, null),
      candidate(3, 2, 1, null),
    ])
    expect(groups.map(item => item.party)).toEqual([2, 1, null])
  })

  it('orders a list by rank, not by the order the file gives', () => {
    const [only] = group([candidate(1, 1, 12, 10), candidate(2, 1, 2, null), candidate(3, 1, 7, 20)])
    expect(only?.list.map(item => item.list_pos)).toEqual([2, 7, 12])
    expect(only?.electorateOnly).toEqual([])
  })

  it('keeps a list candidate on the list even when they stand in an electorate', () => {
    const [only] = group([candidate(1, 1, 3, 10)])
    expect(only?.list.map(item => item.number)).toEqual([1])
    expect(only?.list[0]?.electorate).toBe(10)
    expect(only?.electorateOnly).toEqual([])
  })

  it('orders those standing only in electorates by electorate', () => {
    const [only] = group([candidate(1, 1, null, 10), candidate(2, 1, null, 20)])
    expect(only?.list).toEqual([])
    expect(only?.electorateOnly.map(item => item.number)).toEqual([2, 1])
  })

  it('reads 0 as none, as the feed\'s own files write it', () => {
    const [only] = group([candidate(1, 0, 0, 10)])
    expect(only?.party).toBeNull()
    expect(only?.list).toEqual([])
    expect(only?.electorateOnly.map(item => item.number)).toEqual([1])
  })

  it('has no groups without candidates', () => {
    expect(group([])).toEqual([])
  })
})

describe('sectionCandidateGroups', () => {
  it('divides parties by whether they have a list, and keeps independents apart', () => {
    const sections = sectionCandidateGroups(group([
      candidate(1, 1, null, 10),
      candidate(2, 2, 1, 20),
      candidate(3, null, null, 10),
    ]))
    expect(sections.partyVote.map(item => item.party)).toEqual([2])
    expect(sections.electoratesOnly.map(item => item.party)).toEqual([1])
    expect(sections.independent?.party).toBeNull()
  })

  it('counts a party with one list candidate as contesting the party vote', () => {
    const sections = sectionCandidateGroups(group([candidate(1, 1, null, 10), candidate(2, 1, 1, null)]))
    expect(sections.partyVote.map(item => item.party)).toEqual([1])
    expect(sections.electoratesOnly).toEqual([])
  })

  it('has no independent group where nobody stands as one', () => {
    expect(sectionCandidateGroups(group([candidate(1, 1, 1, null)])).independent).toBeNull()
  })
})
