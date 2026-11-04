import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore'

/**
 * Firestore, for live results only.
 *
 * Client-only by design. The SDK opens a long-lived streaming connection, which
 * a request-scoped Cloudflare Worker would kill mid-flight having already been
 * billed for the initial read -- on every request, and on every crawler hit.
 * Server rendering uses the published snapshots instead.
 *
 * Nothing here connects on load. The app is created lazily, the first time a
 * page actually enters live mode, so visitors to an archived event never open a
 * connection at all.
 */
let firestore: Firestore | null = null

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public

  function useFirestore(): Firestore {
    if (firestore) return firestore

    // getApps() guards against re-initialising across hot reloads.
    const app = getApps().length ? getApp() : initializeApp(config.firebase as object)

    // Memory only. Persistent local caching does not avoid being billed for a
    // listener's initial sync, and multi-tab coordination adds failure modes
    // for no benefit when the data is public and short-lived.
    firestore = initializeFirestore(app, { localCache: memoryLocalCache() })

    const emulator = config.firebaseEmulatorHost as string
    if (emulator) {
      const [host, port] = emulator.split(':')
      connectFirestoreEmulator(firestore, host || '127.0.0.1', Number(port) || 8080)
    }

    return firestore
  }

  return { provide: { firestore: useFirestore } }
})
