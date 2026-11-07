<template>
    <!-- No scroll container of its own: the panel body and the slideover body
         both already scroll, and nesting a second one inside either gives the
         list a scrollbar that stops short of the panel it sits in. -->
    <div>
        <div class="flex items-center justify-between gap-3 px-4 py-2 border-b border-default">
            <label for="feed-voting-places" class="text-xs text-muted">Show voting place updates</label>
            <USwitch id="feed-voting-places" size="sm" :model-value="showVotingPlaces"
                @update:model-value="setShow" />
        </div>

        <!-- Only while voting places are on, because it only narrows those. -->
        <div v-if="showVotingPlaces" class="px-4 py-2 border-b border-default">
            <div class="flex items-center gap-2">
                <USelectMenu v-model="selectedElectorates" multiple :items="electorateOptions" value-key="value"
                    :search-input="{ placeholder: 'Search electorates' }" size="sm" class="flex-1 min-w-0"
                    aria-label="Show updates from voting places located in these electorates">
                    <template #default>
                        <span class="text-muted truncate">{{ selectionLabel }}</span>
                    </template>
                </USelectMenu>
                <UButton v-if="selectedElectorates.length" label="Clear" color="neutral" variant="ghost"
                    size="sm" class="shrink-0" aria-label="Clear electorate filter"
                    @click="selectedElectorates = []" />
            </div>
            <p v-if="atLimit" class="mt-1 text-xs text-muted">
                You can choose up to {{ MAX_FEED_ELECTORATES }} electorates.
            </p>
        </div>

        <ul v-if="shown.length" class="divide-y divide-default">
            <ElectionsFeedEntry v-for="message in shown" :key="message.id" :election="election"
                :resultsVersion="resultsVersion" :message="message" />
        </ul>

        <div v-else class="flex flex-col items-center justify-center gap-2 p-6 min-h-40 text-center">
            <UIcon v-if="empty.icon" :name="empty.icon" class="size-5 text-muted" />
            <p class="text-sm text-muted text-balance">{{ empty.message }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ConnectionState, ElectionSummary, EntityNumber, FeedMessage, ResultsVersion } from '~/types/elections'
import { useFeedVotingPlaces } from '~/composables/useFeedPreferences'
import { useElectionDataStore } from '~/stores/electionData'
import { MAX_FEED_ELECTORATES } from '~/utils/elections/feedFilter'
import { pluralise } from '~/utils/elections/format'

/**
 * The feed's entries, newest first.
 *
 * Shared by the panel beside the dashboard and the drawer that replaces it on
 * a phone, so the two cannot drift apart. The list is ordered upstream and
 * rendered in the order it arrives.
 *
 * The voting places toggle and its electorates live here for the same reason:
 * both get them.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    messages: FeedMessage[]
    /** True while the count is live and the listener is attached. */
    live: boolean
    connection: ConnectionState
}>()

const { show: showVotingPlaces, setShow, electoratesFor, setElectorates, visible } = useFeedVotingPlaces()

const shown = computed(() => visible(props.messages))

const store = useElectionDataStore()

const selectedElectorates = computed<EntityNumber[]>({
    get: () => electoratesFor(props.resultsVersion.firebase_id),
    set: (electorates) => {
        const eventId = props.resultsVersion.firebase_id
        if (eventId) setElectorates(eventId, electorates)
    },
})

const atLimit = computed(() => selectedElectorates.value.length >= MAX_FEED_ELECTORATES)

// The filter goes by where a voting place sits, and voting places sit in general
// electorates, so a Māori electorate could never match anything. One with a
// cancelled candidate election stays: its voting places still report party votes.
const electorateOptions = computed(() =>
    (store.referenceData(props.election.slug, props.resultsVersion.slug)?.electorates ?? [])
        .filter(electorate => store.persistentElectorateFor(
            props.election.slug, props.resultsVersion.slug, electorate.number)?.electorate_type !== 'maori')
        .sort((a, b) => a.name.localeCompare(b.name, 'en-NZ'))
        .map(electorate => ({
            label: electorate.name,
            value: electorate.number,
            // At the limit, what is chosen can still be taken back out.
            disabled: atLimit.value && !selectedElectorates.value.includes(electorate.number),
        })))

const selectionLabel = computed(() => (selectedElectorates.value.length
    ? `${pluralise(selectedElectorates.value.length, 'electorate')} selected`
    : 'All electorates'))

/**
 * What to say when there is nothing to show.
 *
 * Four quite different situations read as an empty list, and saying the wrong
 * one is worse than saying nothing. The one that matters most is the feed
 * being unreadable: the query filters on one field and orders by another, so
 * it cannot run until the composite index is deployed, and reporting that as
 * "nothing to report yet" hides a broken feed behind a plausible sentence for
 * the whole of an evening.
 */
const empty = computed(() => {
    if (props.connection === 'offline' || props.connection === 'failed') {
        return {
            icon: 'i-lucide-triangle-alert',
            // No promise that it will fix itself: the listener retries a few
            // times, and after that a reload is the only thing left.
            message: 'Could not load updates.',
        }
    }
    if (!props.live) {
        return {
            icon: null,
            message: 'Updates are only published while a count is live.',
        }
    }
    if (props.connection === 'connecting') {
        return { icon: 'i-lucide-loader', message: 'Loading updates…' }
    }
    if (showVotingPlaces.value && selectedElectorates.value.length) {
        return { icon: null, message: 'Nothing to report yet for these electorates.' }
    }
    // Something has arrived, just nothing the reader has asked to see.
    if (props.messages.length) {
        return { icon: null, message: 'Nothing to report yet apart from voting places.' }
    }
    return { icon: null, message: 'Nothing to report yet.' }
})
</script>
