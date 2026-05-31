<script setup lang="ts">
import {
  claimWorkbook,
  useWorkbookListSection,
} from '~/composables/useWorkbookListSection'
import type { WorkbookSummary } from '~/types/workbook'

const props = defineProps<{
  title: string
  description?: string
  queryPrefix: string
  scope: 'mine' | 'system'
  emptyTitle?: string
}>()

const {
  nameFilter,
  paginated,
  status,
  refresh,
  page,
  totalPages,
  hasSearch,
  goPage,
} = useWorkbookListSection({
  queryPrefix: props.queryPrefix,
  scope: props.scope,
})

const { session } = useAdminSession()
const toast = useToast()
const claimingId = ref<string | null>(null)

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
  <section class="mb-10">
    <div class="mb-4">
      <h2 class="text-xl font-semibold">
        {{ title }}
      </h2>
      <p v-if="description" class="text-sm text-muted mt-1">
        {{ description }}
      </p>
    </div>

    <UCard variant="soft">
      <UFormField
        label="Name contains"
        description="Case-insensitive match on the workbook name."
      >
        <UInput
          v-model="nameFilter"
          placeholder="Search workbooks…"
          icon="i-lucide-search"
          size="sm"
          class="w-full max-w-md"
          variant="subtle"
        />
      </UFormField>

      <USeparator class="my-4" />

      <div
        v-if="status === 'pending'"
        class="py-12 flex flex-col items-center justify-center text-center"
      >
        <h4 class="mb-2 text-muted">
          Loading workbooks…
        </h4>
        <UProgress animation="swing" class="w-48" />
      </div>

      <UEmpty
        v-else-if="status === 'error'"
        title="Error loading workbooks"
        description="An error occurred while loading workbooks. Please try again."
      >
        <template #actions>
          <UButton
            variant="subtle"
            color="neutral"
            class="mt-4"
            icon="i-lucide-refresh-cw"
            trailing
            @click="refresh()"
          >
            Refresh
          </UButton>
        </template>
      </UEmpty>

      <template v-else-if="paginated">
        <p class="text-muted text-sm mb-4">
          {{ paginated.count }} workbook<span v-if="paginated.count !== 1">s</span>.
        </p>

        <UEmpty
          v-if="paginated.results.length === 0"
          class="text-muted py-8"
          variant="naked"
          :title="emptyTitle ?? (hasSearch ? 'No workbooks match your search' : 'No workbooks yet')"
          icon="i-lucide-search"
        />

        <div v-else class="space-y-3">
          <UPageCard
            v-for="workbook in paginated.results"
            :key="workbook.id"
            variant="outline"
            :to="`/console/workbooks/${workbook.id}`"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-semibold">
                    {{ workbook.name }}
                  </h4>
                  <UBadge
                    v-if="workbook.status === 'closed'"
                    label="Closed"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  />
                  <UBadge
                    v-if="workbook.source === 'system_event'"
                    label="Auto"
                    color="info"
                    variant="subtle"
                    size="xs"
                  />
                </div>
                <p class="text-muted text-sm mt-1">
                  Updated {{ formatConsoleDateTime(workbook.updated_at) }}
                </p>
              </div>
              <UButton
                v-if="scope === 'system'"
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

        <div
          v-if="totalPages > 1"
          class="mt-6 flex justify-center items-center gap-2"
        >
          <UButton
            :disabled="page <= 1"
            variant="outline"
            size="sm"
            icon="i-lucide-chevron-left"
            aria-label="Previous page"
            @click="goPage(page - 1)"
          />
          <span class="text-sm text-muted px-2">Page {{ page }} of {{ totalPages }}</span>
          <UButton
            :disabled="page >= totalPages"
            variant="outline"
            size="sm"
            icon="i-lucide-chevron-right"
            aria-label="Next page"
            @click="goPage(page + 1)"
          />
        </div>
      </template>
    </UCard>
  </section>
</template>
