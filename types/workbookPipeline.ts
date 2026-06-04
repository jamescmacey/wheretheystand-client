import type { CopyrightMetadataDraft } from '~/types/copyrightMetadata'

export type StepStatus =
  | 'pending'
  | 'running'
  | 'draft'
  | 'awaiting_review'
  | 'committed'
  | 'failed'
  | 'rejected'
  | 'skipped'

export type WorkbookStepRecord = {
  id: string
  workbook: string
  workbook_file: string | null
  step_key: string
  sequence: number
  status: StepStatus
  payload: Record<string, unknown>
  error_message: string | null
  committed_at: string | null
  committed_by: string | null
  production_object_id: string | null
  production_object_type: string | null
  ui_schema: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type WorkbookProgress = {
  file_count: number
  total_steps: number
  by_status: Record<string, number>
  by_step_key: Record<string, Record<string, number>>
  awaiting_review: number
}

export type WorkbookStepsResponse = {
  progress: WorkbookProgress
  results: WorkbookStepRecord[]
}

export const RECIPE_OPTIONS = [
  { value: 'credit_card_reconciliation', label: 'Credit card reconciliation' },
  { value: 'ministerial_list', label: 'Ministerial list' },
  { value: 'user_profile_pictures', label: 'User profile pictures' },
  { value: 'gazette_notice', label: 'Gazette notice' },
] as const

export const PIPELINE_STEP_ORDER: Record<string, readonly string[]> = {
  credit_card_reconciliation: [
    'upload',
    'link_entities',
    'gemini_extract',
    'publish_reconciliation',
  ],
  ministerial_list: [
    'upload',
    'gemini_extract',
    'link_entities',
    'publish_ministerial_list',
  ],
  user_profile_pictures: ['upload', 'link_entities', 'publish_profile_picture'],
}

export type ProfilePictureLinkDraft = {
  person_id: string
  original_url: string
  attribution_text: string
  file_metadata: CopyrightMetadataDraft
}

export type MinisterialPositionLink = {
  raw: string
  title?: string | null
  conjunction?: string | null
  portfolio_name?: string | null
  portfolio_id: string
  category: 'p' | 'r'
  specialisation?: string | null
}

export const MINISTERIAL_CATEGORY_OPTIONS = [
  { value: 'p', label: 'Portfolio' },
  { value: 'r', label: 'Responsibility' },
] as const

export type MinisterialPersonLink = {
  extracted_name: string
  person_id: string
  positions: MinisterialPositionLink[]
}

export type MinisterialLinkDraft = {
  entries: MinisterialPersonLink[]
}

export type MinisterialPublishDraft = {
  effective_date: string
}
