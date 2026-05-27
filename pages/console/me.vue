<script setup lang="ts">
const { session, logout } = useAdminSession()
const toast = useToast()

const user = computed(() => session.value?.user)

const displayName = computed(() => {
  const u = user.value
  if (!u) return ''
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || u.email || u.username
})

const githubUrl = computed(() => {
  const gh = user.value?.github_username?.trim()
  return gh ? `https://github.com/${gh}` : null
})

const profileFields = computed(() => {
  const u = user.value
  if (!u) return []
  return [
    { label: 'Email', value: u.email, icon: 'i-lucide-mail' },
    { label: 'Username', value: u.username, icon: 'i-lucide-at-sign' },
    {
      label: 'GitHub',
      value: u.github_username,
      icon: 'i-simple-icons-github',
      href: githubUrl.value,
    },
    { label: 'User ID', value: u.id, icon: 'i-lucide-fingerprint', mono: true, copyable: true },
  ]
})

async function copyUserId() {
  const id = user.value?.id
  if (!id) return
  try {
    await navigator.clipboard.writeText(id)
    toast.add({ title: 'User ID copied', color: 'success' })
  } catch {
    toast.add({
      title: 'Could not copy',
      description: 'Your browser blocked clipboard access.',
      color: 'error',
    })
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <template v-if="user">
      <h1 class="text-2xl font-bold mb-6">
        Your account
      </h1>

      <UCard variant="soft">
        <UUser
          :name="displayName"
          :description="user.email"
          size="xl"
          :avatar="{
            src: user.avatar ?? undefined,
            alt: displayName,
          }"
        />

        <div class="flex flex-wrap gap-2 mt-4">
          <UBadge v-if="user.is_staff" color="primary" variant="soft">
            Staff
          </UBadge>
          <UBadge v-if="user.is_superuser" color="warning" variant="soft">
            Superuser
          </UBadge>
        </div>

        <USeparator class="my-6" />

        <dl class="space-y-4">
          <div
            v-for="field in profileFields"
            :key="field.label"
            class="flex gap-3"
          >
            <UIcon :name="field.icon" class="size-5 shrink-0 text-muted mt-0.5" />
            <div class="min-w-0 flex-1">
              <dt class="text-xs uppercase tracking-wide text-muted">
                {{ field.label }}
              </dt>
              <dd class="mt-0.5 text-sm">
                <ULink
                  v-if="field.href && field.value"
                  :href="field.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium"
                >
                  {{ field.value }}
                </ULink>
                <div
                  v-else-if="field.value"
                  class="flex items-center gap-1"
                >
                  <span :class="{ 'font-mono text-xs': field.mono }">{{ field.value }}</span>
                  <UButton
                    v-if="field.copyable"
                    icon="i-lucide-copy"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    aria-label="Copy user ID"
                    @click="copyUserId"
                  />
                </div>
                <span v-else class="text-muted">Not set</span>
              </dd>
            </div>
          </div>
        </dl>

        <template v-if="user.bio">
          <USeparator class="my-6" />
          <div>
            <h3 class="text-xs uppercase tracking-wide text-muted mb-2">
              Bio
            </h3>
            <p class="text-sm whitespace-pre-wrap">
              {{ user.bio }}
            </p>
          </div>
        </template>
      </UCard>

      <div class="mt-4 flex justify-end">
        <UButton
          label="Sign out"
          icon="i-lucide-log-out"
          variant="outline"
          color="neutral"
          @click="logout"
        />
      </div>
    </template>
  </UContainer>
</template>
