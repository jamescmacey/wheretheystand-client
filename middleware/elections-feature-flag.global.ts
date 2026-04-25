export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const electionsEnabled = String(config.public.electionsEnabled).toLowerCase() === 'true'

  if (electionsEnabled) return

  const path = to.path
  const isElectionsSection = path.startsWith('/elections')
  const isPersonElectionHistory = /^\/people\/[^/]+\/elections(?:\/|$)/.test(path)
  const isPartyElectionHistory = /^\/parties\/[^/]+\/elections(?:\/|$)/.test(path)

  if (isElectionsSection || isPersonElectionHistory || isPartyElectionHistory) {
    return navigateTo('/', { redirectCode: 302 })
  }
})
