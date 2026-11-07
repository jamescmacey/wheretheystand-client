import { describe, expect, it } from 'vitest'
import { seatGridCell, seatGridShape } from '~/utils/elections/seatGrid'

function layout(total: number) {
  const shape = seatGridShape(total)
  const cells = Array.from({ length: total }, (_, index) => seatGridCell(index, shape))
  return { shape, cells }
}

/** Seats wholly either side of the centre line, and any sitting on it. */
function split(total: number) {
  const { shape, cells } = layout(total)
  const centre = (shape.columns - 1) / 2
  return {
    left: cells.filter(cell => cell.column < centre).length,
    on: cells.filter(cell => cell.column === centre).length,
    right: cells.filter(cell => cell.column > centre).length,
  }
}

describe('seatGridCell', () => {
  it('puts the odd seat of a 129-seat House on the left of the line', () => {
    // The 2026 preliminary count: 22 columns, so the line runs down a gap.
    expect(seatGridShape(129)).toEqual({ rows: 6, columns: 22, blank: 3 })
    expect(split(129)).toEqual({ left: 65, on: 0, right: 64 })
  })

  it('divides a full 120-seat House exactly in half', () => {
    expect(split(120)).toEqual({ left: 60, on: 0, right: 60 })
  })

  it('runs the line through the only seat that decides an odd House', () => {
    // 21 columns with one seat in the centre one.
    expect(seatGridShape(121)).toEqual({ rows: 6, columns: 21, blank: 5 })
    expect(split(121)).toEqual({ left: 60, on: 1, right: 60 })
  })

  it('keeps the centre line halfway through the seats at every size of House', () => {
    for (let total = 1; total <= 200; total += 1) {
      const { left, right } = split(total)
      expect(left - right, `${total} seats`).toBeGreaterThanOrEqual(0)
      expect(left - right, `${total} seats`).toBeLessThanOrEqual(1)
    }
  })

  it('gives every seat its own cell inside the grid', () => {
    for (let total = 1; total <= 200; total += 1) {
      const { shape, cells } = layout(total)
      expect(new Set(cells.map(cell => `${cell.column},${cell.row}`)).size).toBe(total)
      for (const cell of cells) {
        expect(cell.column).toBeLessThan(shape.columns)
        expect(cell.row).toBeLessThan(shape.rows)
      }
    }
  })
})
