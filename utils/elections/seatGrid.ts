/**
 * The layout of the chamber: which cell of a rectangle each seat sits in.
 *
 * Kept apart from the drawing because the drawing makes one claim that has to
 * hold for every size of House: the middle of the block is the middle of the
 * seats, so a line drawn down the centre really is halfway. Overhang changes
 * the size of the House from one tally to the next, so this cannot be checked
 * by looking at a 120-seat House alone.
 */

/**
 * How wide the block is against its height.
 *
 * A 120-seat House comes out six rows by twenty columns, which is close enough
 * to the proportions of a page that the dots stay a readable size on a phone
 * without the block becoming a thin strip on a desktop.
 */
const ASPECT = 3.3

export interface SeatGridShape {
  rows: number
  columns: number
  /** Cells left empty, because a House rarely divides evenly into rows. */
  blank: number
}

export interface SeatGridCell {
  column: number
  row: number
}

export function seatGridShape(total: number): SeatGridShape {
  if (total <= 0) return { rows: 0, columns: 0, blank: 0 }

  const rows = Math.max(2, Math.min(10, Math.round(Math.sqrt(total / ASPECT))))
  const columns = Math.ceil(total / rows)
  return { rows, columns, blank: columns * rows - total }
}

/**
 * Which cell the nth seat sits in, filling column by column.
 *
 * Row by row would scatter a party across the whole block, which is the one
 * arrangement that makes the drawing harder to read than the tiles above it.
 *
 * The left bloc fills from the left edge and the right bloc ends at the right
 * edge. The empty cells go in the middle, centred between the rows so the gap
 * reads as an aisle: a short column at the edge would read as a party sitting
 * on its own, when it is only the arithmetic of the grid.
 *
 * "The middle" has to be the exact centre, or the halfway line is wrong. An odd
 * number of columns has a centre column to hold them. An even number has only
 * a gap, so the two columns either side of it share them, the odd seat going
 * left. A short column to one side of the gap would put a whole column's
 * difference on one side of the line.
 */
export function seatGridCell(index: number, shape: SeatGridShape): SeatGridCell {
  const { rows, columns, blank } = shape
  if (!blank) return { column: Math.floor(index / rows), row: index % rows }

  const shortColumns = columns % 2 === 0 ? 2 : 1
  const fullColumnsEachSide = (columns - shortColumns) / 2

  const before = fullColumnsEachSide * rows
  if (index < before) return { column: Math.floor(index / rows), row: index % rows }

  const inShort = shortColumns * rows - blank
  const inFirstShort = Math.ceil(inShort / shortColumns)

  const intoShort = index - before
  if (intoShort < inFirstShort) {
    return {
      column: fullColumnsEachSide,
      row: Math.floor((rows - inFirstShort) / 2) + intoShort,
    }
  }
  if (intoShort < inShort) {
    const inSecondShort = inShort - inFirstShort
    return {
      column: fullColumnsEachSide + 1,
      row: Math.floor((rows - inSecondShort) / 2) + intoShort - inFirstShort,
    }
  }

  const after = intoShort - inShort
  return {
    column: fullColumnsEachSide + shortColumns + Math.floor(after / rows),
    row: after % rows,
  }
}
