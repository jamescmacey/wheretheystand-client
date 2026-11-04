import type { ElectionSummary, ResultsVersion } from '~/types/elections'

/**
 * The versions a visitor may choose from, primary first.
 *
 * An unlisted version is in the manifest so it can be opened by URL and so a
 * published version can still compare against it, but it is left out of every
 * list: the elections index, an election's own page and the version switch.
 */
export function listedVersions(election: Pick<ElectionSummary, 'results_versions'>): ResultsVersion[] {
  return (election.results_versions ?? [])
    .filter(version => version.listed)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
}

/**
 * What the slug "default" resolves to.
 *
 * The primary listed version, then any listed one. Only where nothing is
 * listed does it fall back to an unlisted version, so a direct link to an
 * election whose versions are all unlisted still opens something.
 */
export function defaultVersion(versions: ResultsVersion[]): ResultsVersion | null {
  const listed = versions.filter(version => version.listed)
  const pool = listed.length ? listed : versions
  return pool.find(version => version.is_primary) ?? pool[0] ?? null
}
