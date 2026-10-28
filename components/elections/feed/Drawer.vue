<template>
    <USlideover v-model:open="open" side="right" title="Updates"
        :description="live ? 'The latest updates from the count.' : 'Updates from the count.'"
        :ui="{ body: 'p-0 sm:p-0' }">
        <UButton icon="i-lucide-rss" color="neutral" variant="solid" size="lg"
            :label="unread ? String(unread) : undefined" :aria-label="triggerLabel"
            class="lg:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-lg" />

        <template #body>
            <ElectionsFeedList :election="election" :resultsVersion="resultsVersion"
                :messages="messages" :live="live" :connection="connection" />
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import type { ElectionSummary, ResultsVersion } from '~/types/elections'
import { useInjectedElectionSource } from '~/composables/useElectionSource'

/**
 * The feed on a phone, where there is no room for a second panel.
 *
 * A button over the dashboard rather than one in the navbar: the navbar is
 * built per page, and the feed belongs to the count rather than to whichever
 * page is open. The same list renders inside, so the two cannot drift.
 *
 * The count on the button is entries that have arrived since the drawer was
 * last open, which is the only thing a reader who cannot see the panel is
 * missing. It is cleared by opening the drawer, not by a timer.
 */
defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

const source = useInjectedElectionSource()

const open = ref(false)

const messages = computed(() => source?.feed.value ?? [])
const live = computed(() => source?.mode.value === 'live')
const connection = computed(() => source?.feedConnection.value ?? 'archived')

// The newest entry the reader has actually seen. Null until the drawer has
// been opened once, which is why the first entries count as unread: somebody
// arriving mid-count has not seen any of them.
const seen = ref<string | null>(null)

const unread = computed(() => {
    if (open.value) return 0
    if (seen.value === null) return messages.value.length
    const index = messages.value.findIndex(message => message.id === seen.value)
    // Not found means every entry held has arrived since, which happens once
    // more than twenty land between openings.
    return index === -1 ? messages.value.length : index
})

const triggerLabel = computed(() => (unread.value
    ? `Updates, ${unread.value} new`
    : 'Updates'))

watch(open, isOpen => {
    if (isOpen) seen.value = messages.value[0]?.id ?? null
})

// An entry arriving while the drawer is open is seen as it lands, so closing
// it does not immediately show a count for something already read.
watch(messages, next => {
    if (open.value) seen.value = next[0]?.id ?? null
})
</script>
