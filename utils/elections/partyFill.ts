/**
 * Paint a party mark in its colour, or half in each of its two.
 *
 * A party whose colour is too close to another's carries an alternate, and is
 * drawn half in each so the two can still be told apart. Which half goes where
 * depends on the mark:
 *
 * - `horizontal` is for bars: the primary colour on the top half, the
 *   alternate on the bottom.
 * - `diagonal` is for dots and squares: split along the line from the bottom
 *   left corner to the top right, the primary colour above it.
 *
 * Returns a value for the CSS `background` shorthand, so a party with no
 * alternate is painted exactly as it was before: one flat colour.
 */

export type PartySplit = 'horizontal' | 'diagonal'

const DIRECTION: Record<PartySplit, string> = {
  horizontal: 'to bottom',
  // From the top left corner, so the hard stop at 50% runs between the other
  // two: bottom left to top right.
  diagonal: 'to bottom right',
}

export function partyFill(
  colour: string,
  alternate: string | null | undefined,
  split: PartySplit,
): string {
  if (!alternate || alternate === colour) return colour
  return `linear-gradient(${DIRECTION[split]}, ${colour} 50%, ${alternate} 50%)`
}
