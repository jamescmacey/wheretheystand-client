/**
 * `vue-instantsearch` ships no types for its Vue 3 entry point.
 *
 * `pages/search.vue` never noticed because it is plain JavaScript. Importing
 * the same widgets from a TypeScript component fails the build instead, so the
 * module is declared here rather than each page suppressing it.
 *
 * Deliberately loose: these are slot-driven widget components whose real prop
 * and slot types live in `instantsearch.js`'s connectors, and writing them out
 * by hand would be a second contract to keep in step with the first. Slot
 * payloads are typed where they are consumed.
 */
declare module 'vue-instantsearch/vue3/es' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>>

  export const AisInstantSearch: typeof component
  export const AisInstantSearchSsr: typeof component
  export const AisConfigure: typeof component
  export const AisSearchBox: typeof component
  export const AisHits: typeof component
  export const AisStats: typeof component
  export const AisStateResults: typeof component
  export const AisRefinementList: typeof component
  export const AisMenu: typeof component
  export const AisPagination: typeof component
  export const AisIndex: typeof component
}
