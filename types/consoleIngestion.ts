export type ConsolePersonPicker = {
  id: string
  display_name: string
}

export type ConsoleNamedPicker = {
  id: string
  name: string
}

export type WorkbookBatchDefaults = {
  start_date?: string
  end_date?: string
  licence_id?: string | null
  copyright_owner_id?: string | null
  licence_grantor_id?: string | null
}
