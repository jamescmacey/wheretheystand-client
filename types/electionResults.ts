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
  /** Shown on hover over the heading, where the label is a shorthand. */
  title?: string
  /** Figures for context rather than the result, eg the last election's. */
  muted?: boolean
}

export interface ResultsRow {
  key: string | number
  label: string
  /**
   * Shown in place of the label on narrow screens, eg a party's initials. A
   * full name wrapped into a phone's label track can run to five lines.
   */
  shortLabel?: string | null
  sublabel?: string | null
  colour?: string | null
  /** A second colour, for a party drawn half in each. See utils/elections/partyFill. */
  alternateColour?: string | null
  to?: string | null
  /** Bar value, as a percentage: the bar is drawn against a full track of 100. */
  bar?: number | null
  cells: Record<string, string | number | null>
  /** Rendered muted, for informals and similar non-contesting lines. */
  muted?: boolean
}
