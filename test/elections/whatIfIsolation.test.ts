import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A reader's What if? scenario must never reach the rest of the site.
 *
 * Seats on every other page state what actually happened. The scenario is kept
 * apart by construction: its state lives in its own composable, its allocation
 * is passed by prop to components on one page, and nothing is written to the
 * store. This reads the source to hold that in place, so a change that connects
 * What if? to anything else fails here even if every page still looks right.
 *
 * Government arrangements are the one deliberate exception. `useCoalitions` is
 * shared with the Parliament page because an arrangement is only a list of
 * parties: it holds no seats and no results, and each page totals it from its
 * own allocation.
 */

const root = join(import.meta.dirname, '..', '..')
const SOURCE_DIRECTORIES = ['components', 'composables', 'layouts', 'middleware', 'pages', 'plugins', 'stores', 'utils']
const PAGE = 'pages/elections/[electionSlug]/[resultsVersionSlug]/what-if.vue'

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const files = new Map(SOURCE_DIRECTORIES
  .flatMap(directory => walk(join(root, directory)))
  .filter(path => /\.(vue|ts)$/.test(path))
  .map(path => [relative(root, path), readFileSync(path, 'utf8')]))

const isWhatIfFile = (path: string) =>
  path === PAGE
  || path === 'composables/useWhatIf.ts'
  || path === 'utils/elections/whatIf.ts'
  || path.startsWith('components/elections/what-if/')

const whatIfFiles = [...files].filter(([path]) => isWhatIfFile(path))
const otherFiles = [...files].filter(([path]) => !isWhatIfFile(path))

/** The flag says whether the page exists, and is all the sidebar may know of it. */
const withoutFlag = (source: string) =>
  source.replace(/useElectionsWhatIf(Enabled)?|whatIfEnabled/g, '')

describe('the rest of the site', () => {
  it('finds the files it is meant to be guarding', () => {
    expect(whatIfFiles.map(([path]) => path)).toEqual(expect.arrayContaining([
      PAGE,
      'composables/useWhatIf.ts',
      'utils/elections/whatIf.ts',
      'components/elections/what-if/PinElectorates.vue',
      'components/elections/what-if/SpecialVotes.vue',
      'components/elections/what-if/ElectoralLaw.vue',
    ]))
    expect(otherFiles.length).toBeGreaterThan(50)
  })

  it.each([
    ['the scenario composables', /useWhatIf(Scenario|Allocation)?\b/],
    ['the scenario helpers', /utils\/elections\/whatIf|applyScenario|sanitiseScenario|WhatIfScenario/],
    ['the What if? components', /ElectionsWhatIf|elections\/what-if/],
    ['the scenario\'s storage and state key', /wts\.elections\.whatif/i],
    ['a read of what-if keys in storage', /whatif/i],
  ])('does not reach %s', (_, pattern) => {
    const offenders = otherFiles
      // The flag has its own composable and config key, and holds no scenario.
      .filter(([path]) => path !== 'composables/useElectionsWhatIf.ts')
      .filter(([, source]) => pattern.test(withoutFlag(source)))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('links to the page only from the sidebar', () => {
    const offenders = otherFiles
      .filter(([, source]) => /['"`/]what-if\b/.test(source))
      .map(([path]) => path)
    expect(offenders).toEqual(['layouts/elections.vue'])
  })
})

describe('the What if? page', () => {
  const storeSource = files.get('stores/electionData.ts')!
  const actions = [...storeSource.slice(storeSource.indexOf('actions: {'))
    .matchAll(/^ {4}(\w+)\(.*\{$/gm)].map(match => match[1]!)

  it('knows what the store actions are', () => {
    expect(actions).toEqual(expect.arrayContaining(['applyResults', 'applySummary', 'clearAll']))
  })

  it.each(whatIfFiles)('%s writes nothing to the store', (_, source) => {
    for (const action of actions) expect(source).not.toMatch(new RegExp(`\\.${action}\\(`))
    expect(source).not.toMatch(/\$patch|\$state|\$reset/)
    expect(source).not.toMatch(/\bstore\.[\w.[\]]+\s*=[^=]/)
  })

  it.each(whatIfFiles)('%s does not touch the reader\'s dashboard-wide rules', (_, source) => {
    expect(source).not.toMatch(/useMmpSettings|wts\.elections\.mmp/)
  })

  it('reads the real input from useSeatAllocation, never its allocation', () => {
    const source = files.get('composables/useWhatIf.ts')!
    expect(source).toMatch(/const \{ input \} = useSeatAllocation\(/)
  })

  it('uses storage only through the scenario composable, under its own key', () => {
    const offenders = whatIfFiles
      .filter(([path]) => path !== 'composables/useWhatIf.ts')
      .filter(([, source]) => /localStorage|sessionStorage|useState|useCookie/.test(source))
      .map(([path]) => path)
    expect(offenders).toEqual([])

    const source = files.get('composables/useWhatIf.ts')!
    const keys = [...source.matchAll(/localStorage\.\w+\(([^,)]+)/g)].map(match => match[1])
    expect(keys).toEqual(['key.value', 'key.value'])
    expect(source).toMatch(/`wts\.elections\.whatif\.\$\{toValue\(electionSlug\)\}`/)
  })

  it('puts nothing in the URL or on the network', () => {
    for (const [path, source] of whatIfFiles) {
      expect(source, path).not.toMatch(/\$fetch|useFetch|apiFetch|navigateTo|router\.(push|replace)|route\.query|useRouter/)
    }
  })

  it('shares only government arrangements with other pages', () => {
    // The arrangements arrive through CoalitionOptions, not any What if? file.
    for (const [path, source] of whatIfFiles) {
      expect(source, path).not.toMatch(/useCoalitions/)
    }
    const page = files.get(PAGE)!
    expect(page).toMatch(/<ElectionsParliamentCoalitionOptions[\s\S]*?:allocation="allocation"/)
  })
})
