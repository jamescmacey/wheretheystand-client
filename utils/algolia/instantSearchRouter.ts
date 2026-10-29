/**
 * URL syncing for InstantSearch, through Vue Router.
 *
 * InstantSearch ships a history router that talks to `window.history`
 * directly, which fights Vue Router: a refinement would push an entry Nuxt
 * never sees, and a `navigateTo` would leave the widgets holding stale state.
 * This reads and writes the same query string through the router Nuxt already
 * owns, so back and forward behave and a pasted URL restores the search.
 *
 * Written for `pages/search.vue` and lifted here when the voting places page
 * needed the same thing. Index name is a parameter because `stateMapping`
 * keys the route state by it.
 */

import { singleIndex } from 'instantsearch.js/es/lib/stateMappings'
import type { Router } from 'vue-router'

type RouteState = Record<string, unknown> & {
  query?: string
  refinementList?: Record<string, string[]>
}

type RouterQuery = Record<string, unknown>

/** Vue Router query to InstantSearch route state, in Algolia bracket notation. */
export function queryToRouteState(query: RouterQuery): RouteState {
  const routeState: RouteState = {}

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue
    }

    const first = Array.isArray(rawValue) ? rawValue[0] : rawValue

    if (key === 'query') {
      routeState.query = String(first)
      continue
    }

    const indexed = /^refinementList\[([^\]]+)\]\[(\d+)\]$/.exec(key)
    if (indexed) {
      const [, attribute, index] = indexed
      routeState.refinementList ??= {}
      routeState.refinementList[attribute!] ??= []
      routeState.refinementList[attribute!]![Number(index)] = String(first)
      continue
    }

    if (key === 'refinementList' && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      routeState.refinementList = rawValue as Record<string, string[]>
      continue
    }

    routeState[key] = rawValue
  }

  // Bracket indices arrive sparse when a middle refinement is removed, and a
  // sparse array would hand InstantSearch an `undefined` facet value.
  if (routeState.refinementList) {
    for (const attribute of Object.keys(routeState.refinementList)) {
      routeState.refinementList[attribute] = routeState.refinementList[attribute]!.filter(Boolean)
    }
  }

  return routeState
}

/** InstantSearch route state to Vue Router query, in Algolia bracket notation. */
export function routeStateToQuery(routeState: RouteState): RouterQuery {
  const query: RouterQuery = {}

  if (routeState.query) {
    query.query = String(routeState.query)
  }

  if (routeState.refinementList) {
    for (const [attribute, values] of Object.entries(routeState.refinementList)) {
      const list = Array.isArray(values) ? values : [values]
      list.forEach((value, index) => {
        query[`refinementList[${attribute}][${index}]`] = String(value)
      })
    }
  }

  for (const [key, value] of Object.entries(routeState)) {
    if (key === 'query' || key === 'refinementList') continue
    query[key] = value
  }

  return query
}

/**
 * The router object InstantSearch's `routing.router` expects.
 *
 * `write` compares resolved URLs before pushing: InstantSearch writes on every
 * state change, including the one it makes while reading the initial URL, and
 * pushing an identical entry would fill the back button with duplicates.
 */
export function createInstantSearchRouter(vueRouter: Router) {
  let removeAfterEach: (() => void) | undefined
  let onPopState: (() => void) | undefined

  const router = {
    read(): RouteState {
      return queryToRouteState(vueRouter.currentRoute.value.query as RouterQuery)
    },
    write(routeState: RouteState): void {
      if (router.createURL(routeState) === router.createURL(router.read())) {
        return
      }
      vueRouter.push({ query: routeStateToQuery(routeState) as never })
    },
    createURL(routeState: RouteState): string {
      return vueRouter.resolve({ query: routeStateToQuery(routeState) as never }).href
    },
    onUpdate(callback: (state: RouteState) => void): void {
      if (import.meta.server) return

      removeAfterEach = vueRouter.afterEach(() => {
        callback(router.read())
      })

      onPopState = () => callback(router.read())
      window.addEventListener('popstate', onPopState)
    },
    dispose(): void {
      if (import.meta.server) return
      if (onPopState) window.removeEventListener('popstate', onPopState)
      if (removeAfterEach) removeAfterEach()
    },
  }

  return router
}

/** The whole `routing` prop for `<ais-instant-search>`, ready to pass. */
export function createInstantSearchRouting(indexName: string, vueRouter: Router) {
  return {
    router: createInstantSearchRouter(vueRouter),
    stateMapping: singleIndex(indexName),
  }
}
