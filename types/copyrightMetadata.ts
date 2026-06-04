/** Inline create payload stored on workbook step file_metadata. */
export type CopyrightInlineDraft = {
  name: string
  url: string
}

export type CopyrightEntityMode = 'existing' | 'create'

export type CopyrightMetadataDraft = {
  licence_id?: string | null
  licence_mode: CopyrightEntityMode
  licence_create: CopyrightInlineDraft
  copyright_owner_id?: string | null
  copyright_owner_mode: CopyrightEntityMode
  copyright_owner_create: CopyrightInlineDraft
  licence_grantor_id?: string | null
  licence_grantor_mode: CopyrightEntityMode
  licence_grantor_create: CopyrightInlineDraft
}

export function emptyCopyrightMetadataDraft(): CopyrightMetadataDraft {
  return {
    licence_id: null,
    licence_mode: 'existing',
    licence_create: { name: '', url: '' },
    copyright_owner_id: null,
    copyright_owner_mode: 'existing',
    copyright_owner_create: { name: '', url: '' },
    licence_grantor_id: null,
    licence_grantor_mode: 'existing',
    licence_grantor_create: { name: '', url: '' },
  }
}

export function copyrightMetadataFromPayload(
  raw: Record<string, unknown> | undefined,
): CopyrightMetadataDraft {
  const draft = emptyCopyrightMetadataDraft()
  if (!raw) return draft

  if (raw.licence_id) {
    draft.licence_id = String(raw.licence_id)
    draft.licence_mode = 'existing'
  } else if (raw.licence_create && typeof raw.licence_create === 'object') {
    const inline = raw.licence_create as Record<string, unknown>
    draft.licence_mode = 'create'
    draft.licence_create = {
      name: String(inline.name ?? ''),
      url: String(inline.licence_url ?? inline.url ?? ''),
    }
  }

  if (raw.copyright_owner_id) {
    draft.copyright_owner_id = String(raw.copyright_owner_id)
    draft.copyright_owner_mode = 'existing'
  } else if (raw.copyright_owner_create && typeof raw.copyright_owner_create === 'object') {
    const inline = raw.copyright_owner_create as Record<string, unknown>
    draft.copyright_owner_mode = 'create'
    draft.copyright_owner_create = {
      name: String(inline.name ?? ''),
      url: String(inline.website ?? inline.url ?? ''),
    }
  }

  if (raw.licence_grantor_id) {
    draft.licence_grantor_id = String(raw.licence_grantor_id)
    draft.licence_grantor_mode = 'existing'
  } else if (raw.licence_grantor_create && typeof raw.licence_grantor_create === 'object') {
    const inline = raw.licence_grantor_create as Record<string, unknown>
    draft.licence_grantor_mode = 'create'
    draft.licence_grantor_create = {
      name: String(inline.name ?? ''),
      url: String(inline.website ?? inline.url ?? ''),
    }
  }

  return draft
}

export function copyrightMetadataToPayload(draft: CopyrightMetadataDraft): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (draft.licence_mode === 'existing' && draft.licence_id) {
    payload.licence_id = draft.licence_id
  } else if (draft.licence_mode === 'create' && draft.licence_create.name.trim()) {
    payload.licence_create = {
      name: draft.licence_create.name.trim(),
      licence_url: draft.licence_create.url.trim() || undefined,
    }
  }

  if (draft.copyright_owner_mode === 'existing' && draft.copyright_owner_id) {
    payload.copyright_owner_id = draft.copyright_owner_id
  } else if (
    draft.copyright_owner_mode === 'create' &&
    draft.copyright_owner_create.name.trim()
  ) {
    payload.copyright_owner_create = {
      name: draft.copyright_owner_create.name.trim(),
      website: draft.copyright_owner_create.url.trim() || undefined,
    }
  }

  if (draft.licence_grantor_mode === 'existing' && draft.licence_grantor_id) {
    payload.licence_grantor_id = draft.licence_grantor_id
  } else if (
    draft.licence_grantor_mode === 'create' &&
    draft.licence_grantor_create.name.trim()
  ) {
    payload.licence_grantor_create = {
      name: draft.licence_grantor_create.name.trim(),
      website: draft.licence_grantor_create.url.trim() || undefined,
    }
  }

  return payload
}
