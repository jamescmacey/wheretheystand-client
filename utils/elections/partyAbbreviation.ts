import type { PersistentParty, ReferenceParty } from '~/types/elections'

type Named = Pick<ReferenceParty, 'name' | 'short_name' | 'abbreviation'>

/**
 * A party's short form, for wherever its full name will not fit.
 *
 * The persistent party's abbreviation comes first: it is ours and the same
 * across elections, where the feed's reference data can carry its own
 * shorthand ("TPMAO", "NewZ"). The reference abbreviation is the fallback, and
 * initials built from the name the last resort.
 */
export function partyAbbreviation(
  reference: Named | null | undefined,
  persistent?: Pick<PersistentParty, 'abbreviation'> | null,
): string | null {
  if (persistent?.abbreviation) return persistent.abbreviation
  if (reference?.abbreviation) return reference.abbreviation
  if (!reference) return null
  const words = (reference.short_name ?? reference.name)
    .split(/\s+/)
    .filter(word => word && !/^(of|the|and|party|&)$/i.test(word))
  if (words.length === 0) return reference.name
  if (words.length === 1) return words[0]!
  return words.map(word => word[0]!.toUpperCase()).join('')
}
