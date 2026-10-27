/**
 * Whether the dashboard's debug page is available.
 *
 * Read in three places that have to agree -- the sidebar link, the page itself
 * and the loading gate it is allowed through -- so the flag is parsed once here
 * rather than three times with three chances to differ.
 */
export function useElectionsDebugEnabled(): boolean {
  return String(useRuntimeConfig().public.electionsDebug).toLowerCase() === 'true'
}
