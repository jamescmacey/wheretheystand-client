/** Shared shapes for the results table components. */

export interface ResultsColumn {
  /** Matches a key in ResultsRow.cells. */
  key: string
  label: string
  /** Any CSS grid track size, eg '4rem'. */
  width?: string
  emphasis?: boolean
  /**
   * Dropped on narrow screens. A results row carries more columns than a phone
   * can show, so the secondary ones fold into the row's sublabel instead.
   */
  secondary?: boolean
}

export interface ResultsRow {
  key: string | number
  label: string
  sublabel?: string | null
  colour?: string | null
  to?: string | null
  /** Bar value, in the same units as the table's barMax. */
  bar?: number | null
  cells: Record<string, string | number | null>
  /** Rendered muted, for informals and similar non-contesting lines. */
  muted?: boolean
}
