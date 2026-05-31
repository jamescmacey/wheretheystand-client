<template>
  <UContainer class="mt-8">
    <h1 class="text-2xl font-bold mb-4">System events</h1>
    <p class="text-muted text-sm mb-6">
      Automated detections from monitored sources. Failed events can be retried.
    </p>

    <div v-if="pending" class="my-8">
      <UProgress animation="swing" />
    </div>
    <UEmpty v-else-if="!events.length" title="No events" />
    <div v-else class="space-y-3">
      <UCard v-for="event in events" :key="event.id" variant="soft">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p class="font-medium">{{ event.source_slug }} · {{ event.external_id }}</p>
            <p class="text-sm text-muted">{{ event.status }}</p>
            <p v-if="event.error_message" class="text-error text-xs mt-1">{{ event.error_message }}</p>
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="event.workbook"
              label="Open workbook"
              size="sm"
              variant="outline"
              :to="`/console/workbooks/${event.workbook}`"
            />
            <UButton
              v-if="event.status === 'failed'"
              label="Retry"
              size="sm"
              :loading="retryingId === event.id"
              @click="retry(event.id)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
type SystemEventRow = {
  id: string
  source_slug: string
  external_id: string
  status: string
  workbook: string | null
  error_message: string | null
}

const retryingId = ref<string | null>(null)
const toast = useToast()

const { data, pending } = await useAsyncData('system-events', async () => {
  const res = await useAdminApi().get<{ results: SystemEventRow[] }>('v2/system-events/')
  return res.results ?? (res as unknown as SystemEventRow[])
})

const events = computed(() => {
  const raw = data.value
  if (Array.isArray(raw)) return raw
  return (raw as { results?: SystemEventRow[] })?.results ?? []
})

async function retry(id: string) {
  retryingId.value = id
  try {
    await useAdminApi().post(`v2/system-events/${id}/retry/`, {})
    toast.add({ title: 'Retry started', color: 'success' })
    await refreshNuxtData('system-events')
  } catch {
    toast.add({ title: 'Retry failed', color: 'error' })
  } finally {
    retryingId.value = null
  }
}
</script>
