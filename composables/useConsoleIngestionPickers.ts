import type { ConsoleNamedPicker, ConsolePersonPicker } from '~/types/consoleIngestion'

export function useConsoleIngestionPickers() {
  const people = ref<ConsolePersonPicker[]>([])
  const licences = ref<ConsoleNamedPicker[]>([])
  const copyrightParties = ref<ConsoleNamedPicker[]>([])
  const portfolios = ref<ConsoleNamedPicker[]>([])
  const loading = ref(false)

  async function loadPickers() {
    if (loading.value) return
    loading.value = true
    try {
      const api = useAdminApi()
      const [peopleRes, licencesRes, partiesRes, portfoliosRes] = await Promise.all([
        api.get<ConsolePersonPicker[]>('v2/console/people/'),
        api.get<ConsoleNamedPicker[]>('v2/console/licences/'),
        api.get<ConsoleNamedPicker[]>('v2/console/copyright-parties/'),
        api.get<ConsoleNamedPicker[]>('v2/console/ministerial-portfolios/'),
      ])
      people.value = peopleRes
      licences.value = licencesRes
      copyrightParties.value = partiesRes
      portfolios.value = portfoliosRes
    } finally {
      loading.value = false
    }
  }

  const personItems = computed(() =>
    people.value.map((p) => ({
      id: p.id,
      label: p.display_name,
    })),
  )

  const licenceItems = computed(() =>
    licences.value.map((l) => ({
      id: l.id,
      label: l.name,
    })),
  )

  const copyrightPartyItems = computed(() =>
    copyrightParties.value.map((p) => ({
      id: p.id,
      label: p.name,
    })),
  )

  const portfolioItems = computed(() =>
    portfolios.value.map((p) => ({
      id: p.id,
      label: p.name,
    })),
  )

  return {
    people,
    licences,
    copyrightParties,
    portfolios,
    personItems,
    licenceItems,
    copyrightPartyItems,
    portfolioItems,
    loading,
    loadPickers,
  }
}
