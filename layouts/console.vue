<script setup lang="ts">
const { session, pending, ready, error, ensureSession, logout, isAuthenticated } = useAdminSession()

onMounted(async () => {
  if (!ready.value) {
    await ensureSession()
  }
})

import type { NavigationMenuItem } from '@nuxt/ui'

const displayName = computed(() => {
  const u = session.value?.user
  if (!u) return ''
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email || u.username
})

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Import',
      icon: 'i-lucide-upload',
      children: [
        {
          label: 'Workbooks',
          icon: 'i-lucide-book-open',
          to: '/console/workbooks'
        },
        {
          label: 'System events',
          icon: 'i-lucide-radar',
          to: '/console/system-events'
        }
      ]
    },
    {
      label: 'Feedback',
      icon: 'i-lucide-message-circle',
      to: '/console/feedback'
    }
  ],
  [
    {
      label: session.value?.user?.email ?? 'Account',
      icon: 'i-lucide-user',
      children: [
        {
          label: 'Your account',
          icon: 'i-lucide-user-circle',
          to: '/console/me'
        },
        {
          label: 'Sign out',
          icon: 'i-lucide-log-out',
          onClick: () => logout()
        },
        {
          label: 'Django',
          icon: 'i-simple-icons-django',
          to: 'http://localhost:8000/admin',
          target: '_blank'
        }
      ]
    }
  ]
])

</script>

<template>
  <div class="min-h-screen bg-default">
    <div v-if="pending || !ready" class="flex min-h-screen flex-col items-center justify-center gap-3 p-8"
      aria-live="polite" aria-busy="true">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
      <p class="text-muted">
        Checking session…
      </p>
    </div>

    <div v-else-if="error" class="mx-auto max-w-lg p-8">
      <h1 class="text-xl font-semibold mb-2">
        Console unavailable
      </h1>
      <p class="text-error mb-4">
        Could not reach the API.
      </p>
      <UButton label="Retry" @click="ensureSession(true)" />
    </div>

    <template v-else-if="isAuthenticated && session?.user">
      <AppBanners />

      <AppHeader />
      <UHeader :ui="{
        root: 'h-12 sticky top-16 z-50',
      }" mode="drawer">

        <template #title>
          <NuxtLink to="/console" class="font-brand text-sm tracking-wide">
            <span class="text-muted font-brand"> Console</span>
          </NuxtLink>
        </template>

        <template #right>
          <NuxtLink
            to="/console/me"
            class="text-sm text-muted hover:text-default transition-colors"
          >
            {{ displayName }}
          </NuxtLink>
        </template>

    

        <template #body>
          <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
        </template>
      </UHeader>
      <UMain>
        <slot />
      </UMain>

      <AppFooter />
    </template>
  </div>
</template>
