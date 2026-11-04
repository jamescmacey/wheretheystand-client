import type { BoundaryShape, ElectorateBoundary } from '~/types/elections'

export interface ChosenBoundary {
  boundary: ElectorateBoundary
  shape: BoundaryShape
  /** False where the only shape held came into force after polling day. */
  inForce: boolean
}

/** A set that can be drawn, preferring the file made for drawing. */
function drawable(boundary: ElectorateBoundary): BoundaryShape | null {
  // Simplified first, as the type says: every vertex of a coastline is a
  // download a reader pays for and a map they cannot see the difference in.
  return boundary.simplified_shape ?? boundary.shape
}

/**
 * Which of an electorate's boundary sets to draw, and which file within it.
 *
 * An electorate accumulates a shape per boundary review, so a results page has
 * to choose, and the lines in force on polling day are the only ones that
 * describe the electorate those votes were cast in. That set is preferred
 * above everything else, and where the election has no polling date -- a date
 * yet to be set, rather than one in the past -- the newest set stands, being
 * the lines an election now would be fought on.
 *
 * Where nothing in force is held, the earliest set that came into force since
 * is drawn instead and marked `inForce: false`, for the caller to say so. Only
 * the seven Māori electorates are in that position today: their 2025 boundaries
 * are the only ones uploaded, so the alternative to an approximate map is no
 * map at all on seven seats, which serves a reader less well than a drawing
 * that says what it is.
 *
 * `boundaries` arrives newest `valid_from` first and is read in that order. A
 * set holding no shape is passed over: it is a record of a review rather than
 * something that can be drawn.
 */
export function chooseElectorateBoundary(
  boundaries: ElectorateBoundary[],
  pollingDate: string | null,
): ChosenBoundary | null {
  let later: ChosenBoundary | null = null

  for (const boundary of boundaries) {
    const shape = drawable(boundary)
    if (!shape) continue

    if (pollingDate && (!boundary.valid_from || boundary.valid_from > pollingDate)) {
      // Newest first, so each later set replaces the one before it and the
      // closest review after the election is what is left.
      if (boundary.valid_from) later = { boundary, shape, inForce: false }
      continue
    }

    return { boundary, shape, inForce: true }
  }

  return later
}
