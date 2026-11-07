import { describe, expect, it } from 'vitest'

import type { EntityNumber } from '~/types/elections'
import type { AllocationInput } from '~/utils/elections/mmp'
import { OFFICIAL_MMP_SETTINGS, allocateSeats } from '~/utils/elections/mmp'
import type { WhatIfLookup, WhatIfScenario } from '~/utils/elections/whatIf'
import {
  applyScenario,
  defaultLaw,
  defaultScenario,
  isScenarioEmpty,
  resolveSpecials,
  rulesFor,
  sanitiseScenario,
} from '~/utils/elections/whatIf'

import ge2023 from './fixtures/ge2023-final.json'

const fixture = ge2023 as AllocationInput & {
  official: { party: number, total_seats: number }[]
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

/** Every party, electorate and winning candidate of the fixture, keyed simply. */
function lookupFor(input: AllocationInput): WhatIfLookup {
  const lookup: WhatIfLookup = { partyKeys: new Map(), electorates: new Map(), candidates: new Map() }
  for (const { party } of input.partyVotes) lookup.partyKeys.set(party, `p${party}`)
  for (const win of input.electorateWins) {
    lookup.electorates.set(`e${win.electorate}`, win.electorate)
    if (win.candidate !== null) {
      lookup.candidates.set(`c${win.candidate}`, {
        candidate: win.candidate,
        party: win.party,
        electorate: win.electorate,
      })
    }
  }
  return lookup
}

function scenario(changes: Partial<WhatIfScenario> = {}): WhatIfScenario {
  return { ...defaultScenario(), ...changes }
}

const simple: AllocationInput = {
  partyVotes: [{ party: 1, votes: 600 }, { party: 2, votes: 400 }],
  electorateWins: [
    { electorate: 10, candidate: 100, party: 1 },
    { electorate: 11, candidate: null, party: null, tie: true, contenders: [
      { candidate: 110, party: 1 },
      { candidate: 111, party: 2 },
    ] },
  ],
  listCandidates: [],
}

const simpleLookup: WhatIfLookup = {
  partyKeys: new Map<EntityNumber, string>([[1, 'one'], [2, 'two']]),
  electorates: new Map([['ten', 10], ['eleven', 11], ['twelve', 12]]),
  candidates: new Map([
    ['ann', { candidate: 100, party: 1, electorate: 10 }],
    ['bob', { candidate: 101, party: 2, electorate: 10 }],
    ['ind', { candidate: 102, party: null, electorate: 10 }],
    ['cat', { candidate: 111, party: 2, electorate: 11 }],
    ['dee', { candidate: 120, party: 2, electorate: 12 }],
  ]),
}

describe('an empty scenario', () => {
  it('is reported as empty', () => {
    expect(isScenarioEmpty(defaultScenario())).toBe(true)
  })

  it('reproduces the declared allocation for a real election', () => {
    const { input } = applyScenario(fixture, defaultScenario(), lookupFor(fixture))
    const allocation = allocateSeats(input, rulesFor(defaultLaw()))
    for (const party of fixture.official) {
      expect(allocation.totalSeats.get(party.party) ?? 0).toBe(party.total_seats)
    }
  })

  it('uses the official rules', () => {
    expect(rulesFor(defaultLaw())).toEqual(OFFICIAL_MMP_SETTINGS)
  })

  it('does not count a pin without a candidate as a change', () => {
    expect(isScenarioEmpty(scenario({ pins: [{ electorate: 'ten', candidate: null }] }))).toBe(true)
  })
})

describe('pinning an electorate', () => {
  const pin = (electorate: string, candidate: string | null) =>
    applyScenario(simple, scenario({ pins: [{ electorate, candidate }] }), simpleLookup)

  it('replaces the real winner', () => {
    const wins = pin('ten', 'bob').input.electorateWins
    expect(wins.filter(win => win.electorate === 10))
      .toEqual([{ electorate: 10, candidate: 101, party: 2 }])
  })

  it('leaves unpinned electorates as the count has them', () => {
    const tied = pin('ten', 'bob').input.electorateWins.find(win => win.electorate === 11)
    expect(tied?.tie).toBe(true)
  })

  it('settles a tie', () => {
    const allocation = allocateSeats(pin('eleven', 'cat').input, OFFICIAL_MMP_SETTINGS)
    expect(allocation.undecidedElectorates).toEqual([])
    expect(allocation.electorateSeats.get(2)).toBe(1)
  })

  it('adds a winner in an electorate with no result yet', () => {
    const wins = pin('twelve', 'dee').input.electorateWins
    expect(wins.find(win => win.electorate === 12)?.candidate).toBe(120)
  })

  it('seats an independent outside the parties', () => {
    const allocation = allocateSeats(pin('ten', 'ind').input, OFFICIAL_MMP_SETTINGS)
    expect(allocation.outsideSeats).toBe(1)
  })

  it('lets a coattail party in, and only while coattailing is allowed', () => {
    const input: AllocationInput = {
      partyVotes: [{ party: 1, votes: 980 }, { party: 2, votes: 20 }],
      electorateWins: [{ electorate: 10, candidate: 100, party: 1 }],
      listCandidates: [],
    }
    const { input: pinned } = applyScenario(
      input, scenario({ pins: [{ electorate: 'ten', candidate: 'bob' }] }), simpleLookup)

    expect(allocateSeats(pinned, rulesFor(defaultLaw())).qualification
      .find(party => party.party === 2)?.reason).toBe('electorate-seat')
    expect(allocateSeats(pinned, rulesFor({ ...defaultLaw(), allowCoattailing: false })).qualification
      .find(party => party.party === 2)?.qualified).toBe(false)
  })

  it('can still seat an unseated winner from their party list', () => {
    const input: AllocationInput = {
      partyVotes: [{ party: 1, votes: 500 }, { party: 2, votes: 500 }],
      electorateWins: [{ electorate: 10, candidate: 100, party: 1 }],
      listCandidates: [{ candidate: 100, party: 1, listPos: 1 }],
    }
    const { input: pinned } = applyScenario(
      input, scenario({ pins: [{ electorate: 'ten', candidate: 'bob' }] }), simpleLookup)
    const member = allocateSeats(pinned, { ...OFFICIAL_MMP_SETTINGS, baseSeats: 4 }).members
      .find(entry => entry.candidate === 100)
    expect(member?.origin).toBe('list')
  })

  it('has no effect until a candidate is chosen', () => {
    const applied = pin('ten', null)
    expect(applied.input.electorateWins).toEqual(simple.electorateWins)
    expect(applied.ignoredPins).toEqual([])
  })

  it('ignores and reports what this version cannot match', () => {
    expect(pin('gone', 'bob').ignoredPins).toHaveLength(1)
    expect(pin('ten', 'gone').ignoredPins).toHaveLength(1)
    // A real candidate, but standing somewhere else.
    expect(pin('ten', 'cat').ignoredPins).toHaveLength(1)
    expect(pin('ten', 'gone').input.electorateWins).toEqual(simple.electorateWins)
  })
})

describe('special votes', () => {
  const resolve = (count: number, shares: Record<string, number> = {}) =>
    resolveSpecials({ count, shares }, simple.partyVotes, simpleLookup.partyKeys)

  it('follows the real party vote by default', () => {
    const { votes, scaled } = resolve(1000)
    expect(votes.get(1)).toBe(600)
    expect(votes.get(2)).toBe(400)
    expect(scaled).toBe(false)
  })

  it('uses the percentages set, with the rest on their real share', () => {
    const { votes, totalPercent } = resolve(1000, { one: 60, two: 40 })
    expect(votes.get(2)).toBe(400)
    expect(totalPercent).toBe(100)
  })

  it('scales percentages that do not add up to 100, and says so', () => {
    const { votes, totalPercent, scaled } = resolve(1000, { one: 30, two: 20 })
    expect(totalPercent).toBe(50)
    expect(scaled).toBe(true)
    expect(votes.get(1)).toBe(600)
    expect(votes.get(2)).toBe(400)
  })

  it.each([1, 7, 999, 123457])('adds up to exactly %i whole votes', (count) => {
    const { votes } = resolveSpecials({ count, shares: {} }, fixture.partyVotes, lookupFor(fixture).partyKeys)
    const values = [...votes.values()]
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(count)
    expect(values.every(Number.isInteger)).toBe(true)
  })

  it('does not depend on the order the parties arrive in', () => {
    const parties = [{ party: 1, votes: 500 }, { party: 2, votes: 500 }]
    const forwards = resolveSpecials({ count: 1, shares: {} }, parties, simpleLookup.partyKeys)
    const backwards = resolveSpecials({ count: 1, shares: {} }, [...parties].reverse(), simpleLookup.partyKeys)
    expect([...forwards.votes]).toEqual([...backwards.votes])
  })

  it('adds nothing when every percentage is zero', () => {
    expect(resolve(1000, { one: 0, two: 0 }).votes.size).toBe(0)
  })

  it('reaches the party vote but not the electorates', () => {
    const { input } = applyScenario(simple,
      scenario({ specials: { count: 1000, shares: {} } }), simpleLookup)
    expect(input.partyVotes).toEqual([{ party: 1, votes: 1200 }, { party: 2, votes: 800 }])
    expect(input.electorateWins).toEqual(simple.electorateWins)
  })
})

describe('electoral law', () => {
  it('applies each rule to the allocation', () => {
    const rules = rulesFor({ formula: 'dhondt', threshold: 0, baseSeats: 300, allowCoattailing: false })
    expect(rules).toEqual({ ...OFFICIAL_MMP_SETTINGS, formula: 'dhondt', threshold: 0, baseSeats: 300, allowCoattailing: false })
    expect(allocateSeats(fixture, rules).settings.baseSeats).toBe(300)
  })

  it('does not offer overhang, whatever is stored', () => {
    const stored = sanitiseScenario({ law: { allowOverhang: false } })
    expect(rulesFor(stored.law).allowOverhang).toBe(true)
  })

  it.each([
    ['threshold', { threshold: 0.03 }],
    ['base seats', { baseSeats: 100 }],
    ['formula', { formula: 'dhondt' as const }],
    ['coattailing', { allowCoattailing: false }],
  ])('counts a change of %s as a change', (_, change) => {
    expect(isScenarioEmpty(scenario({ law: { ...defaultLaw(), ...change } }))).toBe(false)
  })
})

describe('nothing real is changed', () => {
  it('works from frozen inputs and hands back separate ones', () => {
    const frozenInput = deepFreeze(structuredClone({
      partyVotes: fixture.partyVotes,
      electorateWins: fixture.electorateWins,
      listCandidates: fixture.listCandidates,
    }))
    const lookup = lookupFor(frozenInput)
    const first = frozenInput.electorateWins[0]!
    const extreme = deepFreeze(scenario({
      pins: [{ electorate: `e${first.electorate}`, candidate: `c${frozenInput.electorateWins[1]!.candidate}` },
        { electorate: `e${first.electorate}`, candidate: `c${first.candidate}` }],
      specials: { count: 500000, shares: { [`p${frozenInput.partyVotes[0]!.party}`]: 90 } },
      law: { formula: 'dhondt', threshold: 0, baseSeats: 300, allowCoattailing: false },
    }))

    const before = JSON.stringify(frozenInput)
    const applied = applyScenario(frozenInput, extreme, lookup)
    allocateSeats(applied.input, rulesFor(extreme.law))

    expect(JSON.stringify(frozenInput)).toBe(before)
    expect(applied.input.partyVotes).not.toBe(frozenInput.partyVotes)
    expect(applied.input.electorateWins).not.toBe(frozenInput.electorateWins)
  })

  it('leaves the official rules alone when a scenario is edited', () => {
    const before = { ...OFFICIAL_MMP_SETTINGS }
    const edited = defaultScenario()
    edited.law.threshold = 0
    edited.law.baseSeats = 300
    edited.law.formula = 'dhondt'
    edited.law.allowCoattailing = false
    const rules = rulesFor(edited.law)
    rules.threshold = 0.5

    expect(OFFICIAL_MMP_SETTINGS).toEqual(before)
    expect(defaultLaw()).toEqual({
      formula: before.formula,
      threshold: before.threshold,
      baseSeats: before.baseSeats,
      allowCoattailing: before.allowCoattailing,
    })
  })

  it('gives each default scenario its own objects', () => {
    const first = defaultScenario()
    first.specials.shares.one = 50
    first.pins.push({ electorate: 'ten', candidate: null })
    expect(defaultScenario().specials.shares).toEqual({})
    expect(defaultScenario().pins).toEqual([])
  })
})

describe('reading a scenario back from storage', () => {
  it.each([[null], ['nope'], [7], [[]], [{}]])('falls back to the defaults for %j', (raw) => {
    expect(sanitiseScenario(raw)).toEqual(defaultScenario())
  })

  it('keeps a valid scenario intact', () => {
    const valid: WhatIfScenario = {
      pins: [{ electorate: 'ten', candidate: 'bob' }, { electorate: 'eleven', candidate: null }],
      specials: { count: 1000, shares: { one: 12.5 } },
      law: { formula: 'dhondt', threshold: 0.03, baseSeats: 150, allowCoattailing: false },
    }
    expect(sanitiseScenario(JSON.parse(JSON.stringify(valid)))).toEqual(valid)
  })

  it('drops malformed and duplicate pins', () => {
    const { pins } = sanitiseScenario({ pins: [
      { electorate: 'ten', candidate: 'bob' },
      { electorate: 'ten', candidate: 'ann' },
      { electorate: '', candidate: 'ann' },
      { electorate: 5 },
      null,
      { electorate: 'eleven', candidate: 9 },
    ] })
    expect(pins).toEqual([
      { electorate: 'ten', candidate: 'bob' },
      { electorate: 'eleven', candidate: null },
    ])
  })

  it.each([[-1], [1.5], [Number.NaN], ['1000'], [99_000_000]])('rejects %j special votes', (count) => {
    expect(sanitiseScenario({ specials: { count } }).specials.count).toBe(0)
  })

  it('rejects percentages outside 0 to 100', () => {
    const { shares } = sanitiseScenario({ specials: { shares: { a: -1, b: 101, c: 'x', d: 50 } } }).specials
    expect(shares).toEqual({ d: 50 })
  })

  it.each([[0], [1.5], [-20], [1001], ['120'], [null]])('rejects a Parliament of %j seats', (baseSeats) => {
    expect(sanitiseScenario({ law: { baseSeats } }).law.baseSeats).toBe(120)
  })

  it.each([[-0.1], [1.1], ['0.05'], [null]])('rejects a threshold of %j', (threshold) => {
    expect(sanitiseScenario({ law: { threshold } }).law.threshold).toBe(0.05)
  })

  it('rejects an unknown formula', () => {
    expect(sanitiseScenario({ law: { formula: 'fptp' } }).law.formula).toBe('sainte-lague')
  })
})
