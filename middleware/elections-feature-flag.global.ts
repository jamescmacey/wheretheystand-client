export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const isTrue = (value: unknown) => String(value).toLowerCase() === 'true'
  const electionsEnabled = isTrue(config.public.electionsEnabled)
  const showElectoralHistory = isTrue(config.public.showElectoralHistory)

  const path = to.path
  const isElectionsSection = path.startsWith('/elections')
  const isPersonElectionHistory = /^\/people\/[^/]+\/elections(?:\/|$)/.test(path)
  const isPartyElectionHistory = /^\/parties\/[^/]+\/elections(?:\/|$)/.test(path)

  if (isElectionsSection && !electionsEnabled) {
    return navigateTo('/', { redirectCode: 302 })
  }

  // Person and party electoral history have their own flag, separate from
  // the /elections section.
  if ((isPersonElectionHistory || isPartyElectionHistory) && !showElectoralHistory) {
    return navigateTo('/', { redirectCode: 302 })
  }
})
