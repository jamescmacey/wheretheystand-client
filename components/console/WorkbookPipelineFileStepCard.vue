<script setup lang="ts">
import type {
  MinisterialLinkDraft,
  MinisterialPublishDraft,
  ProfilePictureLinkDraft,
  WorkbookStepRecord,
} from '~/types/workbookPipeline'
import { MINISTERIAL_CATEGORY_OPTIONS } from '~/types/workbookPipeline'

export type LinkDraft = {
  person_id: string
  start_date: string
  end_date: string
}

export type GeminiExpense = {
  date?: string
  merchant_name?: string
  description?: string | null
  amount_nzd?: number | string | null
  original_currency_code?: string | null
  original_amount?: number | string | null
}

const props = defineProps<{
  workbookId: string
  recipeKey: string | null
  step: WorkbookStepRecord
  file: { id: string; file: string }
  geminiStep?: WorkbookStepRecord | null
  linkStep?: WorkbookStepRecord | null
  linkDraft?: LinkDraft
  ministerialLinkDraft?: MinisterialLinkDraft
  ministerialPublishDraft?: MinisterialPublishDraft
  profilePictureLinkDraft?: ProfilePictureLinkDraft
  personItems: { id: string; label: string }[]
  portfolioItems: { id: string; label: string }[]
  licenceItems: { id: string; label: string }[]
  copyrightPartyItems: { id: string; label: string }[]
  pickersLoading: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  saveLink: []
  saveMinisterialLink: []
  saveMinisterialPublish: []
  saveProfilePictureLink: []
  commit: []
  reject: []
  startGemini: []
  linkDraftEdited: []
  ministerialDraftEdited: []
  profilePictureDraftEdited: []
}>()

const isMinisterialList = computed(() => props.recipeKey === 'ministerial_list')
const isCreditCard = computed(() => props.recipeKey === 'credit_card_reconciliation')
const isProfilePictures = computed(() => props.recipeKey === 'user_profile_pictures')

const { apiOrigin } = useAdminApi()

function workbookFileViewUrl(fileId: string) {
  return `${apiOrigin()}/v2/workbooks/${props.workbookId}/files/${fileId}/download/`
}

const geminiProposal = computed(() => {
  const payload = props.step.payload as Record<string, unknown> | undefined
  if (!payload?.proposal) return null
  return payload.proposal as {
    concerns?: string | null
    expenses?: GeminiExpense[]
    people?: MinisterialLinkDraft['entries']
  }
})

const expenseRows = computed(() => {
  const expenses = geminiProposal.value?.expenses ?? []
  return expenses.map((e) => ({
    date: e.date ?? '',
    merchant_name: e.merchant_name ?? '',
    description: (e.description ?? '') as string,
    amount_nzd:
      e.amount_nzd === null || e.amount_nzd === undefined ? '' : String(e.amount_nzd),
    original_currency_code: e.original_currency_code ?? '',
    original_amount:
      e.original_amount === null || e.original_amount === undefined
        ? ''
        : String(e.original_amount),
  }))
})

const categoryItems = MINISTERIAL_CATEGORY_OPTIONS.map((o) => ({
  id: o.value,
  label: o.label,
}))

const ministerialPeopleRows = computed(() => {
  const people = geminiProposal.value?.people ?? []
  return people.map((p) => ({
    name: p.extracted_name,
    positions: (p.positions ?? [])
      .map((pos) => {
        const label = pos.category === 'r' ? 'Responsibility' : 'Portfolio'
        return `${pos.raw} (${label})`
      })
      .join('; '),
  }))
})

const expenseColumns = [
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'merchant_name', header: 'Merchant' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'amount_nzd', header: 'Amount (NZD)' },
  { accessorKey: 'original_currency_code', header: 'Currency' },
  { accessorKey: 'original_amount', header: 'Original' },
]

const ministerialGeminiColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'positions', header: 'Positions' },
]

const canPublishCreditCard = computed(
  () =>
    props.geminiStep?.status === 'committed' && props.step.status !== 'committed',
)

const canPublishMinisterial = computed(() => {
  if (props.step.step_key !== 'publish_ministerial_list') return false
  return (
    props.geminiStep?.status === 'committed' &&
    props.linkStep?.status === 'committed' &&
    props.step.status !== 'committed' &&
    Boolean(props.ministerialPublishDraft?.effective_date)
  )
})

const canPublishProfilePicture = computed(
  () =>
    props.linkStep?.status === 'committed' &&
    props.step.step_key === 'publish_profile_picture' &&
    props.step.status !== 'committed',
)

function addPosition(entryIndex: number) {
  if (!props.ministerialLinkDraft) return
  props.ministerialLinkDraft.entries[entryIndex].positions.push({
    raw: '',
    title: '',
    conjunction: '',
    portfolio_name: '',
    portfolio_id: '',
    category: 'p',
  })
  emit('ministerialDraftEdited')
}
</script>

<template>
  <UCard variant="soft">
    <div class="flex justify-between items-center gap-2 mb-2">
      <ULink
        v-if="compact"
        :href="workbookFileViewUrl(file.id)"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm font-medium truncate inline-flex items-center gap-1 min-w-0"
      >
        <UIcon name="i-lucide-external-link" class="size-4 shrink-0" />
        {{ formatWorkbookFileName(file.file, file.id) }}
      </ULink>
      <span v-else class="font-medium capitalize">{{ step.step_key.replace(/_/g, ' ') }}</span>
      <UBadge :label="step.status" variant="subtle" class="shrink-0" />
    </div>

    <div v-if="step.step_key === 'upload'" class="flex flex-col gap-2">
      <ULink
        :href="workbookFileViewUrl(file.id)"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm font-medium truncate inline-flex items-center gap-1"
      >
        <UIcon name="i-lucide-external-link" class="size-4 shrink-0" />
        {{ formatWorkbookFileName(file.file, file.id) }}
      </ULink>
    </div>

    <div
      v-else-if="step.step_key === 'link_entities' && isCreditCard && linkDraft"
      class="space-y-2"
    >
      <UFormField label="Person">
        <USelectMenu
          v-model="linkDraft.person_id"
          :items="personItems"
          value-key="id"
          label-key="label"
          placeholder="Search for a person"
          :loading="pickersLoading"
          class="w-full"
          @update:model-value="emit('linkDraftEdited')"
        />
      </UFormField>
      <div class="flex gap-2">
        <UFormField label="Start" class="flex-1">
          <UInput
            v-model="linkDraft.start_date"
            type="date"
            @update:model-value="emit('linkDraftEdited')"
          />
        </UFormField>
        <UFormField label="End" class="flex-1">
          <UInput
            v-model="linkDraft.end_date"
            type="date"
            @update:model-value="emit('linkDraftEdited')"
          />
        </UFormField>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton label="Save draft" size="sm" @click="emit('saveLink')" />
        <UButton
          label="Commit"
          size="sm"
          color="primary"
          :disabled="step.status === 'committed'"
          @click="emit('commit')"
        />
      </div>
    </div>

    <div
      v-else-if="step.step_key === 'link_entities' && isProfilePictures && profilePictureLinkDraft"
      class="space-y-4"
    >
      <UFormField label="Person">
        <USelectMenu
          v-model="profilePictureLinkDraft.person_id"
          :items="personItems"
          value-key="id"
          label-key="label"
          placeholder="Select person for this photo"
          :loading="pickersLoading"
          class="w-full"
          @update:model-value="emit('profilePictureDraftEdited')"
        />
      </UFormField>
      <UFormField label="Original URL">
        <UInput
          v-model="profilePictureLinkDraft.original_url"
          type="url"
          placeholder="https://…"
          @update:model-value="emit('profilePictureDraftEdited')"
        />
      </UFormField>
      <UFormField label="Attribution text (optional)">
        <UTextarea
          v-model="profilePictureLinkDraft.attribution_text"
          :rows="2"
          placeholder="Credit line shown with the file"
          @update:model-value="emit('profilePictureDraftEdited')"
        />
      </UFormField>
      <ConsoleCopyrightMetadataForm
        v-model="profilePictureLinkDraft.file_metadata"
        :licence-items="licenceItems"
        :copyright-party-items="copyrightPartyItems"
        :pickers-loading="pickersLoading"
        @update:model-value="emit('profilePictureDraftEdited')"
      />
      <div class="flex flex-wrap gap-2">
        <UButton label="Save draft" size="sm" @click="emit('saveProfilePictureLink')" />
        <UButton
          label="Commit"
          size="sm"
          color="primary"
          :disabled="step.status === 'committed'"
          @click="emit('commit')"
        />
      </div>
    </div>

    <div
      v-else-if="step.step_key === 'link_entities' && isMinisterialList && ministerialLinkDraft"
      class="space-y-4"
    >
      <div
        v-for="(entry, entryIndex) in ministerialLinkDraft.entries"
        :key="`${entry.extracted_name}-${entryIndex}`"
        class="rounded-md border border-default p-3 space-y-3"
      >
        <p class="text-sm font-medium">
          {{ entry.extracted_name || 'Unnamed person' }}
        </p>
        <UFormField label="Person">
          <USelectMenu
            v-model="entry.person_id"
            :items="personItems"
            value-key="id"
            label-key="label"
            placeholder="Link to person"
            :loading="pickersLoading"
            class="w-full"
            @update:model-value="emit('ministerialDraftEdited')"
          />
        </UFormField>

        <div
          v-for="(position, positionIndex) in entry.positions"
          :key="`${entryIndex}-${positionIndex}`"
          class="grid gap-2 sm:grid-cols-2 border-t border-default pt-3"
        >
          <p class="sm:col-span-2 text-xs text-muted">
            {{ position.raw || 'Position' }}
          </p>
          <UFormField label="Title">
            <UInput
              v-model="position.title"
              placeholder="e.g. Minister"
              @update:model-value="emit('ministerialDraftEdited')"
            />
          </UFormField>
          <UFormField label="Conjunction">
            <UInput
              v-model="position.conjunction"
              placeholder="of / for"
              @update:model-value="emit('ministerialDraftEdited')"
            />
          </UFormField>
          <UFormField label="Category">
            <USelectMenu
              v-model="position.category"
              :items="categoryItems"
              value-key="id"
              label-key="label"
              placeholder="Portfolio or responsibility"
              class="w-full"
              @update:model-value="emit('ministerialDraftEdited')"
            />
          </UFormField>
          <UFormField label="Portfolio" class="sm:col-span-2">
            <USelectMenu
              v-model="position.portfolio_id"
              :items="portfolioItems"
              value-key="id"
              label-key="label"
              placeholder="Select portfolio"
              :loading="pickersLoading"
              class="w-full"
              @update:model-value="emit('ministerialDraftEdited')"
            />
          </UFormField>
        </div>

        <UButton
          label="Add position"
          size="xs"
          variant="ghost"
          @click="addPosition(entryIndex)"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton label="Save draft" size="sm" @click="emit('saveMinisterialLink')" />
        <UButton
          label="Commit"
          size="sm"
          color="primary"
          :disabled="step.status === 'committed'"
          @click="emit('commit')"
        />
      </div>
    </div>

    <div v-else-if="step.step_key === 'gemini_extract'" class="flex flex-col gap-2">
      <UButton
        label="Start Gemini"
        size="sm"
        :disabled="
          step.status === 'running' || step.status === 'committed' || step.status === 'awaiting_review'
        "
        @click="emit('startGemini')"
      />
      <template v-if="geminiProposal">
        <template v-if="isCreditCard">
          <p class="text-muted text-xs">
            Concerns:
            <span class="font-medium">{{ geminiProposal.concerns ?? 'none' }}</span>
          </p>
          <UTable v-if="expenseRows.length" :data="expenseRows" :columns="expenseColumns" />
          <p v-else class="text-muted text-xs">No extracted expenses.</p>
        </template>
        <template v-else-if="isMinisterialList">
          <UTable
            v-if="ministerialPeopleRows.length"
            :data="ministerialPeopleRows"
            :columns="ministerialGeminiColumns"
          />
          <p v-else class="text-muted text-xs">No people extracted.</p>
        </template>
      </template>
      <div v-if="step.status === 'awaiting_review'" class="flex flex-wrap gap-2">
        <UButton label="Accept" size="sm" color="primary" @click="emit('commit')" />
        <UButton label="Reject" size="sm" variant="outline" color="error" @click="emit('reject')" />
      </div>
    </div>

    <div v-else-if="step.step_key === 'publish_reconciliation'" class="flex flex-col gap-2">
      <UButton
        label="Publish"
        size="sm"
        color="primary"
        :disabled="!canPublishCreditCard"
        @click="emit('commit')"
      />
    </div>

    <div v-else-if="step.step_key === 'publish_profile_picture'" class="flex flex-col gap-2">
      <p class="text-muted text-xs">
        Copies the image to public storage and sets it as the person's profile photo.
      </p>
      <UButton
        label="Publish"
        size="sm"
        color="primary"
        :disabled="!canPublishProfilePicture"
        @click="emit('commit')"
      />
    </div>

    <div
      v-else-if="step.step_key === 'publish_ministerial_list' && ministerialPublishDraft"
      class="flex flex-col gap-3"
    >
      <UFormField label="Appointment date">
        <UInput
          v-model="ministerialPublishDraft.effective_date"
          type="date"
          @update:model-value="emit('ministerialDraftEdited')"
        />
      </UFormField>
      <p class="text-muted text-xs">
        Affiliations for other holders of the same portfolio end the day before this date.
        Rows where the person is already incumbent are left unchanged.
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton label="Save draft" size="sm" @click="emit('saveMinisterialPublish')" />
        <UButton
          label="Publish"
          size="sm"
          color="primary"
          :disabled="!canPublishMinisterial"
          @click="emit('commit')"
        />
      </div>
    </div>

    <p v-if="step.error_message" class="text-error text-xs mt-2">{{ step.error_message }}</p>
  </UCard>
</template>
