/**
 * The Algolia index name for a base name.
 *
 * Django builds its index names as `<PREFIX>_<Base>_<SUFFIX>` from
 * `ALGOLIA_INDEX_PREFIX` and `ALGOLIA_INDEX_SUFFIX` (see `wts/settings.py`),
 * and the indexes themselves are declared in `wts_app/index.py`. Mirroring the
 * scheme here rather than writing `wts_v2_SiteSearch_prod` into each page means
 * pointing the site at a staging application moves every index together, and
 * one of them cannot be left behind on production data.
 */

/** The base names Django registers. Keep in step with `wts_app/index.py`. */
export type AlgoliaIndexBase = 'SiteSearch' | 'ElectionVotingPlaces'

export function useAlgoliaIndexName(base: AlgoliaIndexBase): string {
  const { algoliaIndexPrefix, algoliaIndexSuffix } = useRuntimeConfig().public

  return [algoliaIndexPrefix, base, algoliaIndexSuffix]
    .filter(part => Boolean(part))
    .join('_')
}
