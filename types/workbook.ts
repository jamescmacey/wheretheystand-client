export type WorkbookUser = {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar: string | null
}

export type WorkbookSummary = {
  id: string
  name: string
  user: WorkbookUser | null
  created_at: string
  updated_at: string
}

export type PaginatedWorkbooks = {
  count: number
  next: string | null
  previous: string | null
  results: WorkbookSummary[]
}
