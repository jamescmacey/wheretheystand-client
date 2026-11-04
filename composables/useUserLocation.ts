/**
 * The reader's own location, asked for once, on purpose.
 *
 * Deliberately not `useGeolocation` from VueUse: that starts a `watchPosition`
 * on mount, which prompts for permission as soon as the page loads and then
 * keeps tracking. Finding a voting place needs one fix, when the reader asks
 * for it.
 *
 * The coordinates stay in memory. They are never written to the URL or to
 * storage, so a shared link cannot carry where somebody was standing.
 */

export type LocationStatus =
  /** No geolocation API, or not a secure context. Do not offer the button. */
  | 'unsupported'
  | 'idle'
  | 'pending'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'

export interface UserLocation {
  status: Ref<LocationStatus>
  coords: Ref<{ lat: number, lng: number } | null>
  /** How far out the fix may be, as the browser reports it. */
  accuracyMetres: Ref<number | null>
  /** True once we know a request is pointless, so the UI can hide the button. */
  unsupported: ComputedRef<boolean>
  request: () => Promise<void>
  clear: () => void
}

export function useUserLocation(): UserLocation {
  const status = ref<LocationStatus>('idle')
  const coords = ref<{ lat: number, lng: number } | null>(null)
  const accuracyMetres = ref<number | null>(null)

  // Resolved on mount rather than at setup: `navigator` does not exist during
  // SSR, and `isSecureContext` cannot be known there either.
  onMounted(() => {
    const available = typeof navigator !== 'undefined'
      && 'geolocation' in navigator
      && window.isSecureContext

    if (!available) {
      status.value = 'unsupported'
    }
  })

  const unsupported = computed(() => status.value === 'unsupported')

  function request(): Promise<void> {
    if (status.value === 'unsupported') return Promise.resolve()

    status.value = 'pending'

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coords.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          accuracyMetres.value = Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null
          status.value = 'granted'
          resolve()
        },
        (error) => {
          coords.value = null
          accuracyMetres.value = null
          // Separated because they need different copy: a refusal is the
          // reader's decision and should not be argued with, where a timeout
          // is worth offering to retry.
          status.value = error.code === error.PERMISSION_DENIED
            ? 'denied'
            : error.code === error.TIMEOUT
              ? 'timeout'
              : 'unavailable'
          resolve()
        },
        {
          // A rooftop-accurate fix is not needed to pick the nearest hall out
          // of a few thousand, and asking for one costs seconds and battery.
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 300_000,
        },
      )
    })
  }

  function clear(): void {
    coords.value = null
    accuracyMetres.value = null
    if (status.value !== 'unsupported') {
      status.value = 'idle'
    }
  }

  return { status, coords, accuracyMetres, unsupported, request, clear }
}
