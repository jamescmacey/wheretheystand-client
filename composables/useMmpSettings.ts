import type { MmpSettings } from '~/utils/elections/mmp'
import { OFFICIAL_MMP_SETTINGS } from '~/utils/elections/mmp'

/**
 * The rules the dashboard applies when working out the Parliament.
 *
 * Kept on the device rather than in the URL: this is a preference about how a
 * reader wants every election presented to them, not a property of the page
 * they are looking at, and a shared link should show the official rules.
 *
 * Read from storage after mount rather than during render. Server and client
 * therefore agree on the first paint -- always the official rules -- and a
 * reader who has chosen otherwise sees their choice applied a moment later.
 * Reading storage during hydration would mean the markup no longer matched
 * what the server sent, on the largest numbers on the page.
 */

const STORAGE_KEY = 'wts.elections.mmp'

function sanitise(raw: unknown): Partial<MmpSettings> {
  if (!raw || typeof raw !== 'object') return {}
  const value = raw as Record<string, unknown>
  const clean: Partial<MmpSettings> = {}

  if (value.formula === 'sainte-lague' || value.formula === 'dhondt') {
    clean.formula = value.formula
  }
  // A threshold outside 0-1 would silently disqualify everyone or no one.
  if (typeof value.threshold === 'number'
    && Number.isFinite(value.threshold)
    && value.threshold >= 0
    && value.threshold <= 1) {
    clean.threshold = value.threshold
  }
  if (typeof value.baseSeats === 'number'
    && Number.isInteger(value.baseSeats)
    && value.baseSeats > 0
    && value.baseSeats <= 1000) {
    clean.baseSeats = value.baseSeats
  }
  if (typeof value.allowCoattailing === 'boolean') clean.allowCoattailing = value.allowCoattailing
  if (typeof value.allowOverhang === 'boolean') clean.allowOverhang = value.allowOverhang

  return clean
}

export function useMmpSettings() {
  const settings = useState<MmpSettings>('mmp-settings', () => ({ ...OFFICIAL_MMP_SETTINGS }))
  const hydrated = useState<boolean>('mmp-settings-hydrated', () => false)

  onMounted(() => {
    if (hydrated.value) return
    hydrated.value = true
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      settings.value = { ...OFFICIAL_MMP_SETTINGS, ...sanitise(JSON.parse(stored)) }
    }
    catch {
      // Private browsing, disabled storage, or a corrupted value. The official
      // rules are a perfectly good answer; nothing here is worth an error for.
    }
  })

  // Only after hydration, so the read above is never overwritten by the
  // defaults it is about to replace.
  watch(settings, value => {
    if (!import.meta.client || !hydrated.value) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    }
    catch { /* as above */ }
  }, { deep: true })

  const isOfficial = computed(() =>
    (Object.keys(OFFICIAL_MMP_SETTINGS) as (keyof MmpSettings)[])
      .every(key => settings.value[key] === OFFICIAL_MMP_SETTINGS[key]))

  function reset() {
    settings.value = { ...OFFICIAL_MMP_SETTINGS }
  }

  return { settings, isOfficial, reset }
}
