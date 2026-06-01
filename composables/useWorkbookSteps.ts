import type { WorkbookStepRecord, WorkbookStepsResponse } from '~/types/workbookPipeline'

const POLL_INTERVAL_MS = 4000

export function useWorkbookSteps(workbookId: string) {
  const stepsData = ref<WorkbookStepsResponse | null>(null)
  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function hasRunningStep() {
    return (stepsData.value?.results ?? []).some((step) => step.status === 'running')
  }

  function syncPolling() {
    if (!hasRunningStep()) {
      stopPolling()
      return
    }
    if (pollTimer) return
    pollTimer = setInterval(() => {
      void fetchSteps({ silent: true })
    }, POLL_INTERVAL_MS)
  }

  function applyStepUpdate(updated: WorkbookStepRecord) {
    if (!stepsData.value) {
      stepsData.value = {
        progress: {
          file_count: 0,
          total_steps: 1,
          by_status: { [updated.status]: 1 },
          by_step_key: { [updated.step_key]: { [updated.status]: 1 } },
          awaiting_review: updated.status === 'awaiting_review' ? 1 : 0,
        },
        results: [updated],
      }
      return
    }

    const index = stepsData.value.results.findIndex((step) => step.id === updated.id)
    const results =
      index >= 0
        ? stepsData.value.results.map((step, i) =>
            i === index ? { ...step, ...updated } : step,
          )
        : [...stepsData.value.results, updated]

    stepsData.value = {
      ...stepsData.value,
      results: [...results],
    }
  }

  /** Always loads every step row for the workbook (client filters by file/step). */
  async function fetchSteps(options?: { silent?: boolean }) {
    if (!options?.silent) loading.value = true
    try {
      stepsData.value = await useAdminApi().get<WorkbookStepsResponse>(
        `v2/workbooks/${workbookId}/steps/`,
        { cache: 'no-store' },
      )
    } finally {
      if (!options?.silent) loading.value = false
      syncPolling()
    }
  }

  async function ensureSteps(recipeKey: string, workbookFileId?: string) {
    const body: Record<string, string> = { recipe_key: recipeKey }
    if (workbookFileId) body.workbook_file = workbookFileId
    await useAdminApi().post(`v2/workbooks/${workbookId}/ensure-steps/`, body)
    await fetchSteps()
  }

  async function saveDraft(
    stepKey: string,
    payload: Record<string, unknown>,
    workbookFileId?: string,
  ) {
    const query = workbookFileId ? `?workbook_file=${workbookFileId}` : ''
    const updated = await useAdminApi().patch<WorkbookStepRecord>(
      `v2/workbooks/${workbookId}/steps/${stepKey}/${query}`,
      { payload },
    )
    applyStepUpdate(updated)
    await fetchSteps()
    return updated
  }

  async function stepAction(
    stepKey: string,
    action: 'start' | 'commit' | 'reject',
    options?: { workbookFileId?: string; reason?: string },
  ) {
    const body: Record<string, string> = {}
    if (options?.workbookFileId) body.workbook_file = options.workbookFileId
    if (options?.reason) body.reason = options.reason
    const updated = await useAdminApi().post<WorkbookStepRecord>(
      `v2/workbooks/${workbookId}/steps/${stepKey}/${action}/`,
      body,
    )
    applyStepUpdate(updated)
    await fetchSteps()
    return updated
  }

  function stepsForFile(fileId: string): WorkbookStepRecord[] {
    return (stepsData.value?.results ?? [])
      .filter((s) => s.workbook_file === fileId)
      .sort((a, b) => a.sequence - b.sequence)
  }

  function stepsForStepKey(stepKey: string): WorkbookStepRecord[] {
    return (stepsData.value?.results ?? [])
      .filter((s) => s.step_key === stepKey)
      .sort((a, b) => a.sequence - b.sequence)
  }

  function stepForFileAndKey(fileId: string, stepKey: string): WorkbookStepRecord | undefined {
    return stepsForStepKey(stepKey).find((s) => s.workbook_file === fileId)
  }

  onScopeDispose(() => {
    stopPolling()
  })

  return {
    stepsData,
    loading,
    fetchSteps,
    ensureSteps,
    saveDraft,
    stepAction,
    stepsForFile,
    stepsForStepKey,
    stepForFileAndKey,
  }
}
