/**
 * Whether the What if? page is available.
 *
 * Read by the sidebar link and by the page itself, which have to agree, so the
 * flag is parsed once here. On unless it is set to something other than "true".
 */
export function useElectionsWhatIfEnabled(): boolean {
  return String(useRuntimeConfig().public.electionsWhatifEnabled).toLowerCase() === 'true'
}
