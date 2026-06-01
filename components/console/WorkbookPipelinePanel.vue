<script setup lang="ts">
import type {
  MinisterialLinkDraft,
  MinisterialPublishDraft,
  WorkbookStepRecord,
} from '~/types/workbookPipeline'
import { PIPELINE_STEP_ORDER, RECIPE_OPTIONS } from '~/types/workbookPipeline'
import type { WorkbookBatchDefaults } from '~/types/consoleIngestion'
import type { LinkDraft } from '~/components/console/WorkbookPipelineFileStepCard.vue'

type ViewMode = 'file' | 'step'

const props = defineProps<{
  workbookId: string
  recipeKey: string | null
  files: { id: string; file: string }[]
  isClaimed: boolean
  isClosed?: boolean
  batchDefaults: WorkbookBatchDefaults
}>()

const emit = defineEmits<{
  recipeSet: [recipeKey: string]
  batchDefaultsUpdated: [defaults: WorkbookBatchDefaults]
  pipelineComplete: []
}>()

const toast = useToast()
const viewMode = ref<ViewMode>('file')
const selectedFileId = ref<string | null>(null)
const selectedStepKey = ref<string>('upload')
const batchActionLoading = ref(false)

const {
  stepsData,
  loading,
  fetchSteps,
  ensureSteps,
  saveDraft,
  stepAction,
  stepsForFile,
  stepsForStepKey,
  stepForFileAndKey,
} = useWorkbookSteps(props.workbookId)

const {
  personItems,
  licenceItems,
  copyrightPartyItems,
  portfolioItems,
  loading: pickersLoading,
  loadPickers,
} = useConsoleIngestionPickers()

const linkDraftsByFile = reactive<Record<string, LinkDraft>>({})
const ministerialLinkDraftsByFile = reactive<Record<string, MinisterialLinkDraft>>({})
const ministerialPublishDraftsByFile = reactive<Record<string, MinisterialPublishDraft>>({})
const linkDraftDirtyFiles = ref(new Set<string>())
const ministerialDraftDirtyFiles = ref(new Set<string>())

const batchForm = ref<WorkbookBatchDefaults>({ ...props.batchDefaults })
const savingBatch = ref(false)
const applyingBatch = ref(false)

watch(
  () => props.batchDefaults,
  (value) => {
    batchForm.value = { ...value }
  },
  { deep: true },
)

watch(
  () => props.files,
  (files) => {
    if (files.length && !selectedFileId.value) {
      selectedFileId.value = files[0].id
    }
  },
  { immediate: true },
)

watch(viewMode, async (mode) => {
  stopDraftDirty()
  await fetchSteps()
  if (mode === 'step') {
    syncAllDrafts({ force: true })
  } else if (selectedFileId.value) {
    syncDraftsForFile(selectedFileId.value, { force: true })
  }
})

watch(selectedFileId, (id) => {
  if (viewMode.value === 'file' && id) {
    syncDraftsForFile(id)
  }
})

watch(
  () => props.recipeKey,
  (recipeKey) => {
    const order = recipeKey ? PIPELINE_STEP_ORDER[recipeKey] : undefined
    if (order?.length) {
      selectedStepKey.value = order[0]
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (props.isClaimed) {
    await loadPickers()
  }
  if (props.recipeKey && props.files.length) {
    await fetchSteps()
    syncAllDrafts({ force: true })
  }
})

function syncLinkDraftForFile(fileId: string, options?: { force?: boolean }) {
  if (!options?.force && linkDraftDirtyFiles.value.has(fileId)) {
    return
  }
  const step = stepForFileAndKey(fileId, 'link_entities')
  const payload = step?.payload ?? {}
  linkDraftsByFile[fileId] = {
    person_id: (payload.person_id as string) ?? '',
    start_date: (payload.start_date as string) ?? batchForm.value.start_date ?? '',
    end_date: (payload.end_date as string) ?? batchForm.value.end_date ?? '',
  }
}

function syncMinisterialLinkDraftForFile(fileId: string, options?: { force?: boolean }) {
  if (!options?.force && ministerialDraftDirtyFiles.value.has(fileId)) {
    return
  }
  const step = stepForFileAndKey(fileId, 'link_entities')
  const payload = step?.payload ?? {}
  ministerialLinkDraftsByFile[fileId] = {
    entries: (payload.entries as MinisterialLinkDraft['entries']) ?? [],
  }
}

function syncMinisterialPublishDraftForFile(fileId: string, options?: { force?: boolean }) {
  if (!options?.force && ministerialDraftDirtyFiles.value.has(fileId)) {
    return
  }
  const step = stepForFileAndKey(fileId, 'publish_ministerial_list')
  const payload = step?.payload ?? {}
  ministerialPublishDraftsByFile[fileId] = {
    effective_date: (payload.effective_date as string) ?? '',
  }
}

function syncDraftsForFile(fileId: string, options?: { force?: boolean }) {
  if (isCreditCard.value) {
    syncLinkDraftForFile(fileId, options)
  }
  if (isMinisterialList.value) {
    syncMinisterialLinkDraftForFile(fileId, options)
    syncMinisterialPublishDraftForFile(fileId, options)
  }
}

function syncAllDrafts(options?: { force?: boolean }) {
  for (const file of props.files) {
    syncDraftsForFile(file.id, options)
  }
}

function stopDraftDirty() {
  linkDraftDirtyFiles.value = new Set()
  ministerialDraftDirtyFiles.value = new Set()
}

function markLinkDraftDirty(fileId: string) {
  linkDraftDirtyFiles.value = new Set([...linkDraftDirtyFiles.value, fileId])
}

function markMinisterialDraftDirty(fileId: string) {
  ministerialDraftDirtyFiles.value = new Set([...ministerialDraftDirtyFiles.value, fileId])
}

function linkDraftFor(fileId: string): LinkDraft {
  if (!linkDraftsByFile[fileId]) {
    syncLinkDraftForFile(fileId)
  }
  return linkDraftsByFile[fileId]
}

function ministerialLinkDraftFor(fileId: string): MinisterialLinkDraft {
  if (!ministerialLinkDraftsByFile[fileId]) {
    syncMinisterialLinkDraftForFile(fileId)
  }
  return ministerialLinkDraftsByFile[fileId]
}

function ministerialPublishDraftFor(fileId: string): MinisterialPublishDraft {
  if (!ministerialPublishDraftsByFile[fileId]) {
    syncMinisterialPublishDraftForFile(fileId)
  }
  return ministerialPublishDraftsByFile[fileId]
}

async function setViewMode(mode: ViewMode) {
  viewMode.value = mode
}

async function setRecipe(recipeKey: string) {
  await ensureSteps(recipeKey)
  emit('recipeSet', recipeKey)
  await fetchSteps()
  stopDraftDirty()
  syncAllDrafts({ force: true })
  toast.add({ title: 'Pipeline initialized', color: 'success' })
}

async function initFileSteps() {
  if (!props.recipeKey || !selectedFileId.value) return
  await ensureSteps(props.recipeKey, selectedFileId.value)
}

async function initAllFileSteps() {
  if (!props.recipeKey) return
  batchActionLoading.value = true
  try {
    for (const file of props.files) {
      await useAdminApi().post(`v2/workbooks/${props.workbookId}/ensure-steps/`, {
        recipe_key: props.recipeKey,
        workbook_file: file.id,
      })
    }
    await fetchSteps()
    stopDraftDirty()
    syncAllDrafts({ force: true })
    toast.add({ title: 'Steps created for all files', color: 'success' })
  } finally {
    batchActionLoading.value = false
  }
}

const currentFileSteps = computed(() =>
  stepsForFile(selectedFileId.value ?? ''),
)

const pipelineStepKeys = computed(() => {
  const order = props.recipeKey ? PIPELINE_STEP_ORDER[props.recipeKey] : undefined
  if (!order) return []
  const present = new Set((stepsData.value?.results ?? []).map((s) => s.step_key))
  return order.filter((key) => present.has(key))
})

watch(pipelineStepKeys, (keys) => {
  if (keys.length && !keys.includes(selectedStepKey.value)) {
    selectedStepKey.value = keys[0]
  }
})

const stepSelectItems = computed(() =>
  pipelineStepKeys.value.map((key) => ({
    label: key.replace(/_/g, ' '),
    value: key,
  })),
)

const filesWithSelectedStep = computed(() => {
  const stepMap = new Map(
    stepsForStepKey(selectedStepKey.value).map((s) => [s.workbook_file, s]),
  )
  return props.files
    .map((file) => ({
      file,
      step: stepMap.get(file.id) ?? null,
    }))
    .filter((row) => row.step !== null) as { file: { id: string; file: string }; step: WorkbookStepRecord }[]
})

function isStepCommittable(step: WorkbookStepRecord, stepKey: string): boolean {
  const fileId = step.workbook_file
  if (!fileId) return false
  if (stepKey === 'link_entities') {
    return step.status !== 'committed'
  }
  if (stepKey === 'gemini_extract') {
    return step.status === 'awaiting_review'
  }
  if (stepKey === 'publish_reconciliation') {
    return (
      stepForFileAndKey(fileId, 'gemini_extract')?.status === 'committed' &&
      step.status !== 'committed'
    )
  }
  if (stepKey === 'publish_ministerial_list') {
    return (
      stepForFileAndKey(fileId, 'gemini_extract')?.status === 'committed' &&
      stepForFileAndKey(fileId, 'link_entities')?.status === 'committed' &&
      step.status !== 'committed'
    )
  }
  return false
}

const committableStepsForView = computed(() =>
  stepsForStepKey(selectedStepKey.value).filter((s) =>
    isStepCommittable(s, selectedStepKey.value),
  ),
)

async function commitStep(fileId: string, stepKey: string) {
  if (props.isClosed) return
  if (stepKey === 'publish_ministerial_list') {
    const publishDraft = ministerialPublishDraftFor(fileId)
    await saveDraft(
      'publish_ministerial_list',
      { ...publishDraft, workbook_file_id: fileId },
      fileId,
    )
    ministerialDraftDirtyFiles.value.delete(fileId)
  }
  await stepAction(stepKey, 'commit', { workbookFileId: fileId })
  if (stepKey === 'link_entities') {
    linkDraftDirtyFiles.value.delete(fileId)
    syncLinkDraftForFile(fileId, { force: true })
  }
  if (stepKey === 'link_entities' && isMinisterialList.value) {
    ministerialDraftDirtyFiles.value.delete(fileId)
    syncMinisterialLinkDraftForFile(fileId, { force: true })
  }
  toast.add({ title: 'Committed', color: 'success' })
  await fetchSteps()
  if (allStepsCommitted.value) {
    emit('pipelineComplete')
  }
}

const allStepsCommitted = computed(() => {
  const results = stepsData.value?.results ?? []
  if (!results.length) return false
  return results.every(
    (step) => step.status === 'committed' || step.status === 'skipped',
  )
})

async function rejectStep(fileId: string, stepKey: string) {
  await stepAction(stepKey, 'reject', { workbookFileId: fileId })
  toast.add({ title: 'Rejected', color: 'warning' })
}

async function startGeminiForFile(fileId: string) {
  await stepAction('gemini_extract', 'start', { workbookFileId: fileId })
  toast.add({ title: 'Sent to Gemini', color: 'info' })
}

async function saveLinkForFile(fileId: string) {
  const draft = linkDraftFor(fileId)
  await saveDraft(
    'link_entities',
    { ...draft, workbook_file_id: fileId },
    fileId,
  )
  linkDraftDirtyFiles.value.delete(fileId)
  syncLinkDraftForFile(fileId, { force: true })
  toast.add({ title: 'Link saved', color: 'success' })
}

async function saveMinisterialLinkForFile(fileId: string) {
  const draft = ministerialLinkDraftFor(fileId)
  await saveDraft(
    'link_entities',
    { ...draft, workbook_file_id: fileId },
    fileId,
  )
  ministerialDraftDirtyFiles.value.delete(fileId)
  syncMinisterialLinkDraftForFile(fileId, { force: true })
  toast.add({ title: 'Link saved', color: 'success' })
}

async function saveMinisterialPublishForFile(fileId: string) {
  const draft = ministerialPublishDraftFor(fileId)
  await saveDraft(
    'publish_ministerial_list',
    { ...draft, workbook_file_id: fileId },
    fileId,
  )
  ministerialDraftDirtyFiles.value.delete(fileId)
  syncMinisterialPublishDraftForFile(fileId, { force: true })
  toast.add({ title: 'Publish settings saved', color: 'success' })
}

async function commitAllForCurrentStep() {
  const stepKey = selectedStepKey.value
  const targets = committableStepsForView.value
  if (!targets.length) return

  batchActionLoading.value = true
  try {
    for (const step of targets) {
      const fileId = step.workbook_file!
      if (stepKey === 'link_entities' && isCreditCard.value) {
        const draft = linkDraftFor(fileId)
        await saveDraft(
          'link_entities',
          { ...draft, workbook_file_id: fileId },
          fileId,
        )
        linkDraftDirtyFiles.value.delete(fileId)
      }
      if (stepKey === 'link_entities' && isMinisterialList.value) {
        const draft = ministerialLinkDraftFor(fileId)
        await saveDraft(
          'link_entities',
          { ...draft, workbook_file_id: fileId },
          fileId,
        )
        ministerialDraftDirtyFiles.value.delete(fileId)
      }
      if (stepKey === 'publish_ministerial_list') {
        const draft = ministerialPublishDraftFor(fileId)
        await saveDraft(
          'publish_ministerial_list',
          { ...draft, workbook_file_id: fileId },
          fileId,
        )
        ministerialDraftDirtyFiles.value.delete(fileId)
      }
      await stepAction(stepKey, 'commit', { workbookFileId: fileId })
    }
    await fetchSteps()
    stopDraftDirty()
    syncAllDrafts({ force: true })
    if (allStepsCommitted.value) {
      emit('pipelineComplete')
    }
    toast.add({
      title: `Committed ${targets.length} file(s)`,
      color: 'success',
    })
  } catch {
    toast.add({ title: 'Some commits failed', color: 'error' })
    await fetchSteps()
  } finally {
    batchActionLoading.value = false
  }
}

async function startGeminiForAll() {
  const targets = stepsForStepKey('gemini_extract').filter((step) => {
    const fileId = step.workbook_file
    if (!fileId) return false
    if (isCreditCard.value) {
      if (stepForFileAndKey(fileId, 'link_entities')?.status !== 'committed') return false
    }
    if (isMinisterialList.value) {
      if (stepForFileAndKey(fileId, 'upload')?.status !== 'committed') return false
    }
    return !['running', 'committed', 'awaiting_review'].includes(step.status)
  })
  if (!targets.length) return

  batchActionLoading.value = true
  try {
    for (const step of targets) {
      await stepAction('gemini_extract', 'start', {
        workbookFileId: step.workbook_file!,
      })
    }
    await fetchSteps()
    toast.add({
      title: `Started Gemini for ${targets.length} file(s)`,
      color: 'info',
    })
  } finally {
    batchActionLoading.value = false
  }
}

async function saveBatchDefaults() {
  savingBatch.value = true
  try {
    const updated = await useAdminApi().patch<{ batch_defaults: WorkbookBatchDefaults }>(
      `v2/workbooks/${props.workbookId}/`,
      { batch_defaults: batchForm.value },
    )
    emit('batchDefaultsUpdated', updated.batch_defaults ?? batchForm.value)
    toast.add({ title: 'Batch settings saved', color: 'success' })
  } catch {
    toast.add({ title: 'Could not save batch settings', color: 'error' })
  } finally {
    savingBatch.value = false
  }
}

async function applyBatchToAllFiles() {
  applyingBatch.value = true
  try {
    const res = await useAdminApi().post<{
      batch_defaults: WorkbookBatchDefaults
      steps_updated: number
    }>(`v2/workbooks/${props.workbookId}/apply-batch-defaults/`, {
      batch_defaults: batchForm.value,
    })
    emit('batchDefaultsUpdated', res.batch_defaults ?? batchForm.value)
    await fetchSteps()
    stopDraftDirty()
    syncAllDrafts({ force: true })
    toast.add({
      title: 'Applied to all files',
      description: `${res.steps_updated} step row(s) updated.`,
      color: 'success',
    })
  } catch {
    toast.add({ title: 'Could not apply batch settings', color: 'error' })
  } finally {
    applyingBatch.value = false
  }
}

const progress = computed(() => stepsData.value?.progress)

const fileSelectItems = computed(() =>
  props.files.map((f) => ({
    label: formatWorkbookFileName(f.file, f.id),
    value: f.id,
  })),
)

const isCreditCard = computed(() => props.recipeKey === 'credit_card_reconciliation')
const isMinisterialList = computed(() => props.recipeKey === 'ministerial_list')

const showBatchDefaults = computed(
  () => isCreditCard.value || isMinisterialList.value,
)

const batchDefaultsDescription = computed(() => {
  if (isCreditCard.value) {
    return 'Set dates and copyright once. Files stay on private storage until you publish; copyright is applied when copying to the public bucket.'
  }
  return 'Set copyright once. It is applied when the ministerial list is promoted to public storage.'
})

const batchCommitStepKeys = computed(() => {
  if (isCreditCard.value) {
    return ['link_entities', 'gemini_extract', 'publish_reconciliation']
  }
  if (isMinisterialList.value) {
    return ['link_entities', 'gemini_extract', 'publish_ministerial_list']
  }
  return []
})

const showBatchCommit = computed(
  () =>
    viewMode.value === 'step' &&
    batchCommitStepKeys.value.includes(selectedStepKey.value),
)

const showBatchStartGemini = computed(
  () => viewMode.value === 'step' && selectedStepKey.value === 'gemini_extract',
)
</script>

<template>
  <div class="mt-6">
    <USeparator class="my-4" />
    <h4 class="text-muted text-sm uppercase mb-2">Ingestion pipeline</h4>

    <div v-if="!recipeKey && isClaimed && !isClosed" class="mb-4 flex flex-wrap gap-2 items-end">
      <UFormField label="Recipe" class="min-w-48">
        <USelect
          :items="RECIPE_OPTIONS"
          placeholder="Select recipe"
          @update:model-value="(v: string) => setRecipe(v)"
        />
      </UFormField>
    </div>

    <p v-if="isClosed" class="text-muted text-sm">
      This workbook is closed. Staged files have been removed from private storage.
    </p>

    <UCard
      v-if="recipeKey && showBatchDefaults && isClaimed && !isClosed"
      variant="soft"
      class="mb-4"
    >
      <h5 class="text-sm font-medium mb-3">Batch defaults</h5>
      <p class="text-muted text-xs mb-3">
        {{ batchDefaultsDescription }}
      </p>
      <div class="grid gap-3 sm:grid-cols-2 max-w-2xl">
        <template v-if="isCreditCard">
          <UFormField label="Start date">
            <UInput v-model="batchForm.start_date" type="date" />
          </UFormField>
          <UFormField label="End date">
            <UInput v-model="batchForm.end_date" type="date" />
          </UFormField>
        </template>
        <UFormField label="Licence" class="sm:col-span-2">
          <USelectMenu
            v-model="batchForm.licence_id"
            :items="licenceItems"
            value-key="id"
            label-key="label"
            placeholder="Select licence"
            :loading="pickersLoading"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Copyright owner">
          <USelectMenu
            v-model="batchForm.copyright_owner_id"
            :items="copyrightPartyItems"
            value-key="id"
            label-key="label"
            placeholder="Copyright owner"
            :loading="pickersLoading"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Licence grantor">
          <USelectMenu
            v-model="batchForm.licence_grantor_id"
            :items="copyrightPartyItems"
            value-key="id"
            label-key="label"
            placeholder="Licence grantor"
            :loading="pickersLoading"
            class="w-full"
          />
        </UFormField>
      </div>
      <div class="flex flex-wrap gap-2 mt-4">
        <UButton
          label="Save batch settings"
          size="sm"
          variant="outline"
          :loading="savingBatch"
          @click="saveBatchDefaults"
        />
        <UButton
          label="Apply to all files"
          size="sm"
          color="primary"
          :loading="applyingBatch"
          @click="applyBatchToAllFiles"
        />
      </div>
    </UCard>

    <template v-if="recipeKey && isClaimed && !isClosed">
      <div v-if="progress" class="mb-4 text-sm text-muted">
        {{ progress.awaiting_review }} awaiting review ·
        {{ progress.file_count }} file(s) ·
        {{ progress.total_steps }} step rows
      </div>

      <div class="flex flex-wrap items-end gap-3 mb-4">
        <UFormField label="View">
          <div class="flex gap-1">
            <UButton
              label="By file"
              size="sm"
              :variant="viewMode === 'file' ? 'solid' : 'outline'"
              @click="setViewMode('file')"
            />
            <UButton
              label="By step"
              size="sm"
              :variant="viewMode === 'step' ? 'solid' : 'outline'"
              @click="setViewMode('step')"
            />
          </div>
        </UFormField>

        <UFormField v-if="viewMode === 'file' && files.length > 1" label="File" class="min-w-48">
          <USelect
            v-model="selectedFileId"
            class="w-full max-w-md truncate"
            :items="fileSelectItems"
          />
        </UFormField>

        <UFormField v-if="viewMode === 'step'" label="Step" class="min-w-48">
          <USelect
            v-model="selectedStepKey"
            class="w-full max-w-md"
            :items="stepSelectItems"
          />
        </UFormField>
      </div>

      <!-- By file: all steps for one file -->
      <div v-if="viewMode === 'file' && selectedFileId" class="space-y-4">
        <UButton
          v-if="!currentFileSteps.length"
          label="Create steps for this file"
          size="sm"
          variant="outline"
          :loading="loading"
          @click="initFileSteps"
        />

        <ConsoleWorkbookPipelineFileStepCard
          v-for="step in currentFileSteps"
          :key="step.id"
          :workbook-id="workbookId"
          :recipe-key="recipeKey"
          :step="step"
          :file="files.find((f) => f.id === selectedFileId)!"
          :gemini-step="stepForFileAndKey(selectedFileId, 'gemini_extract')"
          :link-step="stepForFileAndKey(selectedFileId, 'link_entities')"
          :link-draft="isCreditCard ? linkDraftFor(selectedFileId) : undefined"
          :ministerial-link-draft="
            isMinisterialList ? ministerialLinkDraftFor(selectedFileId) : undefined
          "
          :ministerial-publish-draft="
            isMinisterialList ? ministerialPublishDraftFor(selectedFileId) : undefined
          "
          :person-items="personItems"
          :portfolio-items="portfolioItems"
          :pickers-loading="pickersLoading"
          @link-draft-edited="markLinkDraftDirty(selectedFileId!)"
          @ministerial-draft-edited="markMinisterialDraftDirty(selectedFileId!)"
          @save-link="saveLinkForFile(selectedFileId!)"
          @save-ministerial-link="saveMinisterialLinkForFile(selectedFileId!)"
          @save-ministerial-publish="saveMinisterialPublishForFile(selectedFileId!)"
          @commit="commitStep(selectedFileId!, step.step_key)"
          @reject="rejectStep(selectedFileId!, step.step_key)"
          @start-gemini="startGeminiForFile(selectedFileId!)"
        />
      </div>

      <!-- By step: same step across all files -->
      <div v-else-if="viewMode === 'step'" class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="!filesWithSelectedStep.length"
            label="Create steps for all files"
            size="sm"
            variant="outline"
            :loading="batchActionLoading || loading"
            @click="initAllFileSteps"
          />
          <UButton
            v-if="showBatchCommit && committableStepsForView.length"
            :label="`Commit all (${committableStepsForView.length})`"
            size="sm"
            color="primary"
            :loading="batchActionLoading"
            @click="commitAllForCurrentStep"
          />
          <UButton
            v-if="showBatchStartGemini"
            label="Start Gemini for all ready"
            size="sm"
            variant="outline"
            :loading="batchActionLoading"
            @click="startGeminiForAll"
          />
        </div>

        <p v-if="selectedStepKey === 'upload'" class="text-muted text-xs">
          Upload is automatic when files are added. Open each file to verify.
        </p>

        <div class="grid gap-4 lg:grid-cols-2">
          <ConsoleWorkbookPipelineFileStepCard
            v-for="{ file, step } in filesWithSelectedStep"
            :key="step.id"
            compact
            :workbook-id="workbookId"
            :recipe-key="recipeKey"
            :step="step"
            :file="file"
            :gemini-step="stepForFileAndKey(file.id, 'gemini_extract')"
            :link-step="stepForFileAndKey(file.id, 'link_entities')"
            :link-draft="isCreditCard ? linkDraftFor(file.id) : undefined"
            :ministerial-link-draft="
              isMinisterialList ? ministerialLinkDraftFor(file.id) : undefined
            "
            :ministerial-publish-draft="
              isMinisterialList ? ministerialPublishDraftFor(file.id) : undefined
            "
            :person-items="personItems"
            :portfolio-items="portfolioItems"
            :pickers-loading="pickersLoading"
            @link-draft-edited="markLinkDraftDirty(file.id)"
            @ministerial-draft-edited="markMinisterialDraftDirty(file.id)"
            @save-link="saveLinkForFile(file.id)"
            @save-ministerial-link="saveMinisterialLinkForFile(file.id)"
            @save-ministerial-publish="saveMinisterialPublishForFile(file.id)"
            @commit="commitStep(file.id, step.step_key)"
            @reject="rejectStep(file.id, step.step_key)"
            @start-gemini="startGeminiForFile(file.id)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
