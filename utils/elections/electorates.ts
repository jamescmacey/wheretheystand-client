import type { PersistentElectorate } from '~/types/elections'

/**
 * "General electorate" or "Māori electorate", in one place.
 *
 * Null where the type is not known, which is a seat whose persistent record
 * has not been matched. Naming it "General electorate" by default would be a
 * claim about the seat rather than a formatting fallback, and the same
 * sentence written out in three components is how two of them would eventually
 * come to disagree.
 */
export function electorateTypeLabel(
  type: PersistentElectorate['electorate_type'] | null | undefined,
): string | null {
  switch (type) {
    case 'general': return 'General electorate'
    case 'maori': return 'Māori electorate'
    default: return null
  }
}
