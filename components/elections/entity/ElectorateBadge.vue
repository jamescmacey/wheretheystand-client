<template>
    <component :is="to ? linkComponent : 'span'" :to="to ?? undefined"
        class="inline-flex items-center rounded-md overflow-hidden font-medium ring-1"
        :class="[sizing.text, theme.ring, to ? 'hover:opacity-90 transition-opacity' : '']"
        :aria-label="ariaLabel">
        <!-- The number is what a results sheet carries, so it is the half that
             stays put while the name truncates. -->
        <span class="tabular-nums font-semibold" :class="[sizing.cell, theme.lead]">
            {{ electorate }}
        </span>
        <span class="truncate" :class="[sizing.cell, theme.tail]">{{ name }}</span>
    </component>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, ResultsVersion } from '~/types/elections'
import { useElectionDataStore } from '~/stores/electionData'
import { electorateTypeLabel } from '~/utils/elections/electorates'

/**
 * An electorate as a two-part badge: its number, then its name.
 *
 * Orange for a general electorate and grey for a Māori one, which is the only
 * place in the dashboard those two are distinguished by anything other than a
 * line of text. Neither colour is a registered Nuxt UI alias -- the app
 * registers theme1, theme2 and neutral -- so the tints are written out, with
 * dark mode given explicitly rather than left to a default that would put dark
 * text on a dark fill.
 */
const props = withDefaults(defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    electorate: EntityNumber
    link?: boolean
    /** `lg` stands in for a page heading; `sm` sits in a line of text. */
    size?: 'sm' | 'lg'
}>(), { link: true, size: 'sm' })

const store = useElectionDataStore()

// Resolved in setup rather than in the template expression: resolving it inline
// leaves the component unresolved, and Vue then renders a literal <nuxtlink>
// element -- styled correctly, carrying its aria-label, and not a link.
const linkComponent = resolveComponent('NuxtLink')

const slugs = computed(() => ({
    election: props.election.slug,
    version: props.resultsVersion.slug,
}))

const reference = computed(() =>
    store.electorate(slugs.value.election, slugs.value.version, props.electorate))

const persistent = computed(() =>
    store.persistentElectorateFor(slugs.value.election, slugs.value.version, props.electorate))

const name = computed(() => reference.value?.name ?? 'Unknown electorate')

/**
 * Unknown stays neutral rather than falling back to general.
 *
 * An electorate's type is only known through its persistent record, and an
 * unmatched one has none. Colouring it orange would be a claim about the seat
 * rather than a formatting default -- the same reason ElectorateLabel refuses
 * to name a type it has not been told.
 */
const theme = computed(() => {
    switch (persistent.value?.electorate_type) {
        case 'general':
            return {
                lead: 'bg-orange-600 text-white dark:bg-orange-500 dark:text-orange-950',
                tail: 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100',
                ring: 'ring-orange-600/30 dark:ring-orange-400/30',
            }
        case 'maori':
            return {
                lead: 'bg-zinc-600 text-white dark:bg-zinc-400 dark:text-zinc-950',
                tail: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
                ring: 'ring-zinc-600/30 dark:ring-zinc-400/30',
            }
        default:
            return {
                lead: 'bg-elevated text-highlighted',
                tail: 'bg-muted text-default',
                ring: 'ring-default',
            }
    }
})

// The large badge grows with the viewport rather than sitting at heading size on
// a phone, where the longest electorate names would then wrap inside the fill.
const sizing = computed(() => (props.size === 'lg'
    ? { text: 'text-lg sm:text-xl', cell: 'px-3 py-1' }
    : { text: 'text-sm', cell: 'px-2 py-0.5' }))

const typeLabel = computed(() =>
    electorateTypeLabel(persistent.value?.electorate_type) ?? 'electorate')

// The badge reads as two separate text nodes, so the whole of it is spelled out
// for a screen reader rather than left as "59 Wellington North".
const ariaLabel = computed(() => `${typeLabel.value} ${props.electorate}, ${name.value}`)

const to = computed(() => (props.link
    ? `/elections/${slugs.value.election}/${slugs.value.version}/electorates/${props.electorate}`
    : null))
</script>
