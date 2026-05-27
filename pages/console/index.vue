<script setup lang="ts">
import { claimWorkbook, fetchRecentWorkbooks } from '~/composables/useWorkbookListSection'
import type { PaginatedWorkbooks, WorkbookSummary } from '~/types/workbook'

const { session } = useAdminSession()
const toast = useToast()
const claimingId = ref<string | null>(null)

const { data: recent, status, refresh } = await useAsyncData<PaginatedWorkbooks>(
  'console-recent-workbooks',
  () => fetchRecentWorkbooks(5),
  { server: false },
)

async function onClaim(workbook: WorkbookSummary, event: Event) {
  event.preventDefault()
  event.stopPropagation()

  const userId = session.value?.user?.id
  if (!userId) return

  claimingId.value = workbook.id
  try {
    await claimWorkbook(workbook.id, userId)
    toast.add({ title: 'Workbook claimed', color: 'success' })
    await refresh()
  } catch {
    toast.add({
      title: 'Could not claim workbook',
      description: 'Please try again.',
      color: 'error',
    })
  } finally {
    claimingId.value = null
  }
}
</script>

<template>
  <UContainer class="py-8">
    <section class="mb-10">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 class="text-xl font-semibold">
          Recent workbooks
        </h2>
        <div class="flex flex-wrap gap-2">
          <UButton
            to="/console/workbooks"
            variant="outline"
            color="neutral"
            size="sm"
            label="View all"
          />
          <UButton
            to="/console/workbooks/new"
            icon="i-lucide-plus"
            size="sm"
            label="New workbook"
          />
        </div>
      </div>

      <div
        v-if="status === 'pending'"
        class="py-8 flex flex-col items-center justify-center text-center"
      >
        <p class="text-muted mb-2">
          Loading workbooks…
        </p>
        <UProgress animation="swing" class="w-48" />
      </div>

      <UEmpty
        v-else-if="status === 'error'"
        title="Could not load workbooks"
        description="An error occurred while loading recent workbooks."
      >
        <template #actions>
          <UButton
            variant="subtle"
            color="neutral"
            class="mt-4"
            icon="i-lucide-refresh-cw"
            @click="refresh()"
          >
            Refresh
          </UButton>
        </template>
      </UEmpty>

      <template v-else-if="recent">
        <UEmpty
          v-if="recent.results.length === 0"
          variant="naked"
          title="No workbooks yet"
          description="Create a workbook to start uploading files."
          icon="i-lucide-book-open"
        >
          <template #actions>
            <UButton
              to="/console/workbooks/new"
              class="mt-4"
              icon="i-lucide-plus"
              label="New workbook"
            />
          </template>
        </UEmpty>

        <div v-else class="space-y-3">
          <UPageCard
            v-for="workbook in recent.results"
            :key="workbook.id"
            variant="outline"
            :to="`/console/workbooks/${workbook.id}`"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="font-semibold">
                  {{ workbook.name }}
                </h4>
                <p class="text-muted text-sm mt-1">
                  <span v-if="workbook.user">Your workbook</span>
                  <span v-else>System workbook</span>
                  · Updated {{ formatConsoleDateTime(workbook.updated_at) }}
                </p>
              </div>
              <UButton
                v-if="!workbook.user"
                label="Claim"
                size="sm"
                variant="outline"
                class="shrink-0"
                :loading="claimingId === workbook.id"
                :disabled="claimingId !== null"
                @click="onClaim(workbook, $event)"
              />
            </div>
          </UPageCard>
        </div>
      </template>
    </section>
  </UContainer>
</template>
