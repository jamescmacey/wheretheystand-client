/**
 * The Algolia client `@nuxtjs/algolia` injects.
 *
 * The module provides `$algolia` but does not type it, so every call site sees
 * `unknown`. Worth writing down rather than casting at each one, because
 * *which* client this is matters: it is **algoliasearch v4**, nested inside
 * `@nuxtjs/algolia`, while the hoisted `node_modules/algoliasearch` is v5 with
 * an incompatible API (`searchSingleIndex({ indexName, searchParams })` rather
 * than `initIndex(name).search(query, params)`).
 *
 * Importing `algoliasearch` directly therefore gets the wrong client with no
 * type error at the boundary. Always go through `useNuxtApp().$algolia`.
 */

export interface AlgoliaSearchResponse<THit = Record<string, unknown>> {
  hits: THit[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  query: string
  /** Present only when the request asked for `facets`. */
  facets?: Record<string, Record<string, number>>
}

export interface AlgoliaIndex {
  search: <THit = Record<string, unknown>>(
    query: string,
    params?: Record<string, unknown>,
  ) => Promise<AlgoliaSearchResponse<THit>>
}

export interface AlgoliaSearchClient {
  initIndex: (indexName: string) => AlgoliaIndex
  clearCache: () => Promise<void>
}

declare module '#app' {
  interface NuxtApp {
    $algolia: AlgoliaSearchClient
  }
}

export {}
