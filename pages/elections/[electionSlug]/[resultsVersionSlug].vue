<template>
    <div v-if="election && resultsVersion" class="w-full h-full min-h-0 flex flex-col">
        <!-- A live count waits behind the countdown for everything it needs:
             polls closed, persistent data, reference data, and a national
             tally. Anything less would render a dashboard that is wrong rather
             than merely incomplete.

             Client only, because it is the one part of the page whose content
             depends on the current time. Server rendering it means asserting a
             clock the reader may not share, and the mismatch lands on the
             largest element on screen. -->
        <ClientOnly v-if="showCountdown">
            <ElectionsLoadingCountdown :election="election" :phase="phase" />
            <template #fallback>
                <ElectionsLoadingLoader phase="loading" />
            </template>
        </ClientOnly>
        <ElectionsLoadingLoader v-else-if="showLoader" :phase="phase" :mode="source.mode.value"
            @retry="source.refresh()" />
        <!-- The feed sits beside the dashboard rather than inside any one page:
             it is about the count, not about whichever page is open, and the
             listener behind it is held at this level so that moving between
             pages does not re-subscribe. Only once the dashboard itself is
             ready -- the countdown and the loader are the whole screen. -->
        <template v-else>
            <div class="flex-1 min-h-0 flex">
                <NuxtPage :election="election" :resultsVersion="resultsVersion" />
                <ElectionsFeedPanel v-if="showFeed" :election="election"
                    :resultsVersion="resultsVersion" />
            </div>
            <ElectionsFeedDrawer v-if="showFeed" :election="election"
                :resultsVersion="resultsVersion" />
        </template>
    </div>
</template>

<script setup lang="ts">
import type { ElectionSummary } from '~/types/elections'
import { ELECTION_SOURCE_KEY, useElectionSource } from '~/composables/useElectionSource'
import { useElectionsDebugEnabled } from '~/composables/useElectionsDebug'

const props = defineProps<{ election: ElectionSummary }>()

const route = useRoute()
const resultsVersionSlug = computed(() => String(route.params.resultsVersionSlug))

const election = computed(() => props.election)
const resultsVersion = computed(() => {
    const versions = props.election.results_versions ?? []
    if (resultsVersionSlug.value === 'default') {
        return versions.find(version => version.is_primary) ?? versions[0] ?? null
    }
    return versions.find(version => version.slug === resultsVersionSlug.value) ?? null
})

watch(resultsVersion, found => {
    if (!found) {
        throw createError({ statusCode: 404, statusMessage: 'Results not found' })
    }
}, { immediate: true })

// Loaded once here and provided, rather than per page: switching between the
// overview, candidates and electorates must not refetch a payload that covers
// all three. Child pages read the store; they inject this only for status.
const source = await useElectionSource({ election, resultsVersion })
provide(ELECTION_SOURCE_KEY, source)

const phase = computed(() => source.phase.value)

// The debug page renders through the gate rather than behind it. Its whole
// subject is why the dashboard is in the state it is in, so holding it on the
// same spinner it exists to explain would make it useless exactly when it is
// wanted. Nothing on it reads a tally.
const debugRoute = computed(() =>
    useElectionsDebugEnabled() && route.path.replace(/\/$/, '').endsWith('/debug'))

// The countdown is the election night waiting experience: the clock before
// polls close, and every waiting state after them until the dashboard is ready.
// An error goes to the loader instead, because that is the branch with
// something to say and a retry.
const showCountdown = computed(() => {
    if (debugRoute.value) return false
    if (phase.value === 'ready' || phase.value === 'error') return false
    return phase.value === 'countdown' || source.mode.value === 'live'
})

const showLoader = computed(() => !debugRoute.value && phase.value !== 'ready')

/**
 * Whether to show the feed at all.
 *
 * Only for a count that is live, or one that was live during this visit and
 * has since been taken off -- the last entries are worth keeping on screen at
 * the moment a result is declared. An event that was already archived when the
 * page loaded has no feed: nothing publishes it to R2, so there is nothing to
 * read and an empty panel would only take width from the results.
 *
 * The debug page is its own subject and renders without the feed beside it.
 */
const showFeed = computed(() =>
    !debugRoute.value && (source.mode.value === 'live' || source.liveEnded.value))
</script>
