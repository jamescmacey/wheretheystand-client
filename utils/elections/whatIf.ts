import type { EntityNumber } from '~/types/elections'
import type { AllocationInput, ElectorateWinInput, MmpFormula, MmpSettings } from '~/utils/elections/mmp'
import { OFFICIAL_MMP_SETTINGS } from '~/utils/elections/mmp'

/**
 * A reader's own version of an election, for the What if? page.
 *
 * Pure, and it only ever builds new values: the real results and rules go in,
 * and a separate allocation input comes out. Nothing here is allowed to reach
 * the rest of the dashboard, which is why it takes plain arrays rather than the
 * store. See test/elections/whatIfIsolation.test.ts.
 *
 * Entities are held by stable key -- a persistent id where there is one, as a
 * coalition holds its parties -- so a scenario saved on election night still
 * means the same electorates, candidates and parties at the official count.
 */

export interface WhatIfPin {
  /** Stable key of the electorate. */
  electorate: string
  /** Stable key of the candidate, or null until the reader has chosen one. */
  candidate: string | null
}

export interface WhatIfSpecials {
  /** Votes to add to the party vote. */
  count: number
  /**
   * Percentages the reader has set, by stable party key. A party without one
   * takes its share of the real party vote.
   */
  shares: Record<string, number>
}

/** The parts of the electoral law a reader can change here. */
export interface WhatIfLaw {
  formula: MmpFormula
  /** A fraction, not a percentage: 0.05 is five per cent. */
  threshold: number
  baseSeats: number
  allowCoattailing: boolean
}

export interface WhatIfScenario {
  pins: WhatIfPin[]
  specials: WhatIfSpecials
  law: WhatIfLaw
}

/** How the scenario's stable keys map on to this results version. */
export interface WhatIfLookup {
  partyKeys: Map<EntityNumber, string>
  /** Electorates that can be pinned, which excludes any cancelled election. */
  electorates: Map<string, EntityNumber>
  /** Candidates that can be pinned, each with the electorate they stand in. */
  candidates: Map<string, { candidate: EntityNumber, party: EntityNumber | null, electorate: EntityNumber }>
}

export interface ResolvedSpecials {
  /** Whole votes added to each party, adding up to exactly the count. */
  votes: Map<EntityNumber, number>
  /** What the percentages add up to before any scaling. */
  totalPercent: number
  /** Whether the percentages had to be scaled to reach 100. */
  scaled: boolean
}

export interface AppliedScenario {
  input: AllocationInput
  specials: ResolvedSpecials
  /** Pins with a candidate that this results version cannot match. Not applied. */
  ignoredPins: WhatIfPin[]
}

/** More than the country has voters, so a typo cannot freeze the page. */
export const MAX_SPECIAL_VOTES = 10_000_000
export const MAX_BASE_SEATS = 1000

/** Percentages this close to 100 are rounding, not something to report. */
const PERCENT_TOLERANCE = 0.05

export function defaultLaw(): WhatIfLaw {
  const { formula, threshold, baseSeats, allowCoattailing } = OFFICIAL_MMP_SETTINGS
  return { formula, threshold, baseSeats, allowCoattailing }
}

export function defaultSpecials(): WhatIfSpecials {
  return { count: 0, shares: {} }
}

export function defaultScenario(): WhatIfScenario {
  return { pins: [], specials: defaultSpecials(), law: defaultLaw() }
}

/**
 * The rules to allocate under.
 *
 * Always built on the official settings rather than the reader's choices on the
 * Settings page, so the two pages cannot affect each other. Overhang is not
 * something this page offers to change.
 */
export function rulesFor(law: WhatIfLaw): MmpSettings {
  return { ...OFFICIAL_MMP_SETTINGS, ...law }
}

export function isLawOfficial(law: WhatIfLaw): boolean {
  const official = defaultLaw()
  return (Object.keys(official) as (keyof WhatIfLaw)[])
    .every(key => law[key] === official[key])
}

/** Whether the scenario changes anything, so the page can say it does not. */
export function isScenarioEmpty(scenario: WhatIfScenario): boolean {
  return scenario.specials.count === 0
    && !scenario.pins.some(pin => pin.candidate !== null)
    && isLawOfficial(scenario.law)
}

/**
 * Share out the special votes between the parties.
 *
 * Percentages that do not add up to 100 are scaled until they do, and the caller
 * says so on the page: leaving the votes out until the reader had balanced every
 * row would make the seats jump with each edit.
 *
 * Largest remainder, so the whole votes add up to exactly what was asked for.
 */
export function resolveSpecials(
  specials: WhatIfSpecials,
  partyVotes: AllocationInput['partyVotes'],
  partyKeys: Map<EntityNumber, string>,
): ResolvedSpecials {
  const realTotal = partyVotes.reduce((sum, party) => sum + (party.votes || 0), 0)

  const rows = partyVotes.map(({ party, votes }) => {
    const set = specials.shares[partyKeys.get(party) ?? '']
    return { party, percent: set ?? (realTotal > 0 ? (votes / realTotal) * 100 : 0) }
  })

  const totalPercent = rows.reduce((sum, row) => sum + row.percent, 0)
  const scaled = Math.abs(totalPercent - 100) > PERCENT_TOLERANCE
  const votes = new Map<EntityNumber, number>()

  if (specials.count <= 0 || totalPercent <= 0) {
    return { votes, totalPercent, scaled }
  }

  const quotas = rows.map(row => {
    const exact = (specials.count * row.percent) / totalPercent
    return { ...row, whole: Math.floor(exact), remainder: exact - Math.floor(exact) }
  })

  const left = specials.count - quotas.reduce((sum, quota) => sum + quota.whole, 0)
  // The party number settles a dead heat, so the same scenario always gives the
  // same result whatever order the parties arrived in.
  const next = [...quotas].sort((a, b) =>
    b.remainder - a.remainder || b.percent - a.percent || a.party - b.party)
  const extra = new Set(next.slice(0, left).map(quota => quota.party))

  for (const quota of quotas) {
    const total = quota.whole + (extra.has(quota.party) ? 1 : 0)
    if (total > 0) votes.set(quota.party, total)
  }

  return { votes, totalPercent, scaled }
}

/**
 * The allocation input this scenario produces from the real one.
 *
 * Unpinned electorates keep whatever the real count says, including a tie or no
 * result yet. Special votes only change the party vote: they are not attached to
 * any electorate, so they cannot change who won one.
 */
export function applyScenario(
  real: AllocationInput,
  scenario: WhatIfScenario,
  lookup: WhatIfLookup,
): AppliedScenario {
  const ignoredPins: WhatIfPin[] = []
  const pinned = new Map<EntityNumber, ElectorateWinInput>()

  for (const pin of scenario.pins) {
    if (pin.candidate === null) continue
    const electorate = lookup.electorates.get(pin.electorate)
    const candidate = lookup.candidates.get(pin.candidate)
    if (electorate === undefined || !candidate || candidate.electorate !== electorate) {
      ignoredPins.push(pin)
      continue
    }
    pinned.set(electorate, {
      electorate,
      candidate: candidate.candidate,
      party: candidate.party,
    })
  }

  const electorateWins = real.electorateWins
    .filter(win => !pinned.has(win.electorate))
    .concat([...pinned.values()])

  const specials = resolveSpecials(scenario.specials, real.partyVotes, lookup.partyKeys)
  const partyVotes = real.partyVotes.map(({ party, votes }) => ({
    party,
    votes: votes + (specials.votes.get(party) ?? 0),
  }))

  return {
    input: { partyVotes, electorateWins, listCandidates: real.listCandidates },
    specials,
    ignoredPins,
  }
}

/**
 * A scenario read back from storage, with anything malformed dropped.
 *
 * As with coalitions, storage is the reader's to edit: a value from an older
 * version of the page should cost that one setting, not the whole scenario.
 */
export function sanitiseScenario(raw: unknown): WhatIfScenario {
  const scenario = defaultScenario()
  if (!raw || typeof raw !== 'object') return scenario
  const value = raw as Record<string, unknown>

  if (Array.isArray(value.pins)) {
    const seen = new Set<string>()
    for (const entry of value.pins) {
      if (!entry || typeof entry !== 'object') continue
      const { electorate, candidate } = entry as Record<string, unknown>
      if (typeof electorate !== 'string' || !electorate || seen.has(electorate)) continue
      seen.add(electorate)
      scenario.pins.push({
        electorate,
        candidate: typeof candidate === 'string' && candidate ? candidate : null,
      })
    }
  }

  if (value.specials && typeof value.specials === 'object') {
    const { count, shares } = value.specials as Record<string, unknown>
    if (typeof count === 'number' && Number.isInteger(count)
      && count >= 0 && count <= MAX_SPECIAL_VOTES) {
      scenario.specials.count = count
    }
    if (shares && typeof shares === 'object' && !Array.isArray(shares)) {
      for (const [party, share] of Object.entries(shares)) {
        if (party && typeof share === 'number' && Number.isFinite(share)
          && share >= 0 && share <= 100) {
          scenario.specials.shares[party] = share
        }
      }
    }
  }

  if (value.law && typeof value.law === 'object') {
    const { formula, threshold, baseSeats, allowCoattailing } = value.law as Record<string, unknown>
    if (formula === 'sainte-lague' || formula === 'dhondt') scenario.law.formula = formula
    if (typeof threshold === 'number' && Number.isFinite(threshold)
      && threshold >= 0 && threshold <= 1) {
      scenario.law.threshold = threshold
    }
    if (typeof baseSeats === 'number' && Number.isInteger(baseSeats)
      && baseSeats >= 1 && baseSeats <= MAX_BASE_SEATS) {
      scenario.law.baseSeats = baseSeats
    }
    if (typeof allowCoattailing === 'boolean') scenario.law.allowCoattailing = allowCoattailing
  }

  return scenario
}
