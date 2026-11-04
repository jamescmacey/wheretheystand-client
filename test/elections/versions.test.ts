import { describe, expect, it } from 'vitest'

import { normaliseManifest } from '~/utils/elections/normaliseSnapshot'
import { defaultVersion, listedVersions } from '~/utils/elections/versions'

/**
 * Unlisted versions are in the manifest, so they open by URL and can be
 * compared against, but are left out of every list a visitor chooses from.
 */

const manifest = normaliseManifest({
  version: 1,
  snapshot_base: 'https://example.test/',
  elections: [{
    id: 'e-2026', slug: '2026-general-election', name: '2026 General Election',
    results_versions: [
      { id: 'a', slug: 'preliminary', name: 'Preliminary', listed: true },
      { id: 'b', slug: 'hidden-primary', name: 'Hidden', is_primary: true, listed: false },
      { id: 'c', slug: 'official', name: 'Official', is_primary: true },
    ],
  }],
})
const election = manifest.elections[0]!

describe('results version listing', () => {
  it('treats a manifest without the field as listed', () => {
    expect(election.results_versions.map(v => v.listed)).toEqual([true, false, true])
  })

  it('lists only listed versions, primary first', () => {
    expect(listedVersions(election).map(v => v.slug)).toEqual(['official', 'preliminary'])
  })

  it('resolves "default" to a listed version over an unlisted primary', () => {
    expect(defaultVersion(election.results_versions)?.slug).toBe('official')
  })

  it('falls back to an unlisted version where nothing is listed', () => {
    const versions = election.results_versions.filter(v => !v.listed)
    expect(defaultVersion(versions)?.slug).toBe('hidden-primary')
  })
})
