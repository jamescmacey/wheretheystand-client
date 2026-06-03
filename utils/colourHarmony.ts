import ColorHarmony from 'color-harmony'

type HarmonizerInstance = {
  harmonize: (color: string, scheme: string) => string[]
}

type ColorHarmonyModule = {
  Harmonizer: () => HarmonizerInstance
}

const DEFAULT_PAIR: [string, string] = ['#58787f', 'rgb(52, 148, 148)']

let harmonizer: HarmonizerInstance | null = null

function resolveColorHarmonyModule(): ColorHarmonyModule {
  const mod = ColorHarmony as ColorHarmonyModule & { default?: ColorHarmonyModule }
  if (typeof mod.Harmonizer === 'function') {
    return mod
  }
  if (mod.default && typeof mod.default.Harmonizer === 'function') {
    return mod.default
  }
  throw new Error('color-harmony: Harmonizer export not found')
}

function getHarmonizer(): HarmonizerInstance {
  if (!harmonizer) {
    harmonizer = resolveColorHarmonyModule().Harmonizer()
  }
  return harmonizer
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
  const pair = getHarmonizer().harmonize(colour, scheme)
  return [pair[0], pair[1]]
}

export function colourGradientCss(colour: string, scheme = 'neutral'): string {
  const pair = getHarmonizer().harmonize(colour, scheme)
  return `linear-gradient(230deg, ${pair[1]} 0%, ${pair[0]} 50%)`
}
