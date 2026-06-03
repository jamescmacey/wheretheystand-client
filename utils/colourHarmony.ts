/**
 * Brand colour gradients via HSL hue rotation (same rules as color-harmony "neutral").
 * Implemented without onecolor/color-harmony so SSR works on Cloudflare Workers
 * (those libraries use `new Function()`, which Workers disallow).
 */

const DEFAULT_PAIR: [string, string] = ['#58787f', 'rgb(52, 148, 148)']

/** Degree offsets per scheme — from color-harmony / color-js. */
const SCHEME_DEGREES: Record<string, number[]> = {
  complementary: [0, 180],
  splitComplementary: [0, 150, 320],
  splitComplementaryCW: [0, 150, 300],
  splitComplementaryCCW: [0, 60, 210],
  triadic: [0, 120, 240],
  clash: [0, 90, 270],
  tetradic: [0, 90, 180, 270],
  fourToneCW: [0, 60, 180, 240],
  fourToneCCW: [0, 120, 180, 300],
  fiveToneA: [0, 115, 155, 205, 245],
  fiveToneB: [0, 40, 90, 130, 245],
  fiveToneC: [0, 50, 90, 205, 320],
  fiveToneD: [0, 40, 155, 270, 310],
  fiveToneE: [0, 115, 230, 270, 320],
  sixToneCW: [0, 30, 120, 150, 240, 270],
  sixToneCCW: [0, 90, 120, 210, 240, 330],
  neutral: [0, 15, 30, 45, 60, 75],
  analogous: [0, 30, 60, 90, 120, 150],
}

type Hsl = { h: number; s: number; l: number }

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) {
    return { h: 0, s: 0, l }
  }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / d + 2
      break
    default:
      h = (r - g) / d + 4
  }
  h /= 6
  return { h, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 1) + 1) % 1
  s = clamp01(s)
  l = clamp01(l)

  if (s === 0) {
    const v = Math.round(l * 255)
    const hex = v.toString(16).padStart(2, '0')
    return `#${hex}${hex}${hex}`
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)

  const toHex = (c: number) => Math.round(clamp01(c) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function parseColour(input: string): Hsl | null {
  const raw = input.trim()
  if (!raw) return null

  const hex = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    }
    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
    return rgbToHsl(r, g, b)
  }

  const rgb = raw.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i,
  )
  if (rgb) {
    const r = Number(rgb[1]) > 1 ? Number(rgb[1]) / 255 : Number(rgb[1])
    const g = Number(rgb[2]) > 1 ? Number(rgb[2]) / 255 : Number(rgb[2])
    const b = Number(rgb[3]) > 1 ? Number(rgb[3]) / 255 : Number(rgb[3])
    return rgbToHsl(clamp01(r), clamp01(g), clamp01(b))
  }

  const hsl = raw.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)$/i,
  )
  if (hsl) {
    return {
      h: (Number(hsl[1]) % 360) / 360,
      s: Number(hsl[2]) / 100,
      l: Number(hsl[3]) / 100,
    }
  }

  return null
}

function harmonizeHex(colour: string, scheme: string): string[] {
  const hsl = parseColour(colour) ?? { h: 0, s: 0, l: 0 }
  const degrees = SCHEME_DEGREES[scheme] ?? SCHEME_DEGREES.neutral
  return degrees.map((deg) => hslToHex(hsl.h + deg / 360, hsl.s, hsl.l))
}

/** Two-stop gradient colours for a primary (and optional secondary) brand colour. */
export function harmonizeColourPair(
  colour: string | null | undefined,
  secondaryColour?: string | null,
  scheme = 'neutral',
): [string, string] {
  if (!colour) {
    return DEFAULT_PAIR
  }
  if (secondaryColour) {
    return [colour, secondaryColour]
  }
  const pair = harmonizeHex(colour, scheme)
  return [pair[0], pair[1]]
}

export function colourGradientCss(colour: string, scheme = 'neutral'): string {
  const pair = harmonizeHex(colour, scheme)
  return `linear-gradient(230deg, ${pair[1]} 0%, ${pair[0]} 50%)`
}
