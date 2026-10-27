import type { ElectionManifest, ElectionSummary, ResultsVersion } from '~/types/elections'
import { normaliseManifest } from '~/utils/elections/normaliseSnapshot'

/**
 * The manifest is the only election URL the client knows by heart.
 *
 * It resolves an election slug to its Firestore event id, to whether that event
 * is live, and to the paths of every published payload. Everything else is
 * discovered from it, which is what keeps the API out of the request path on
 * election night.
 *
 * It is served with a short cache lifetime on purpose: taking an event off live
 * has to reach people who already have the page open, and this is how that
 * reaches them.
 */
export function useElectionSnapshotBase(): string {
  const base = useRuntimeConfig().public.electionsSnapshotBase as string
  return base.endsWith('/') ? base : `${base}/`
}

/** Absolute URL for a path named in the manifest. */
export function snapshotUrl(path: string): string {
  return `${useElectionSnapshotBase()}${path.replace(/^\//, '')}`
}

/**
 * The manifest handle, without waiting for it.
 *
 * A composable that is not itself awaited needs this: a Nuxt composable called
 * after an `await` inside another composable has lost the Nuxt instance, so
 * anything that wants `useAsyncData` of its own has to get the manifest
 * synchronously and read `data` as it arrives. One key, one handler, so both
 * entry points share the same request.
 */
export function useElectionManifestData() {
  return useAsyncData<ElectionManifest>(
    'elections-manifest',
    async () => normaliseManifest(await $fetch(snapshotUrl('manifest.json'), apiFetchOptions())),
  )
}

export async function useElectionManifest() {
  const { data, status, error, refresh } = await useElectionManifestData()

  const elections = computed<ElectionSummary[]>(() => data.value?.elections ?? [])

  const findElection = (slug: string): ElectionSummary | null =>
    elections.value.find(election => election.slug === slug) ?? null

  /** Resolve a results version slug, treating "default" as the primary one. */
  const findResultsVersion = (
    electionSlug: string,
    versionSlug: string,
  ): ResultsVersion | null => {
    const election = findElection(electionSlug)
    if (!election) return null
    if (versionSlug === 'default') {
      return election.results_versions.find(version => version.is_primary)
        ?? election.results_versions[0]
        ?? null
    }
    return election.results_versions.find(version => version.slug === versionSlug) ?? null
  }

  return { manifest: data, elections, status, error, refresh, findElection, findResultsVersion }
}
