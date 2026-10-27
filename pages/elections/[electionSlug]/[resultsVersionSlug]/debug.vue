<template>
    <ElectionsLayoutDashboardPage title="Debug" heading="Debug" :status="false"
        description="What this page is reading, where each payload came from, and the objects behind it.">
        <UAlert color="warning" variant="subtle" icon="i-lucide-bug" title="Developer diagnostics"
            description="This page exists because NUXT_PUBLIC_ELECTIONS_DEBUG is true. It renders no results and is not meant for readers. Turn the flag off in production." />

        <!-- State first: everything below is a detail of it, and it is also the
             one thing worth reading when the dashboard itself is stuck. -->
        <UPageCard variant="subtle" title="State" description="How this results version is being read right now.">
            <!-- Client only, and not for the usual reason: a live count's
                 connection state exists only where the Firestore SDK runs, so
                 rendering it on the server states something the client then
                 contradicts on the largest card here. -->
            <ClientOnly>
                <dl class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm w-full">
                    <div v-for="entry in state" :key="entry.label">
                        <dt class="text-muted text-xs uppercase tracking-wide">{{ entry.label }}</dt>
                        <dd class="font-mono break-all">{{ entry.value }}</dd>
                    </div>
                </dl>
                <template #fallback>
                    <p class="text-sm text-muted">Read on the client.</p>
                </template>
            </ClientOnly>
        </UPageCard>

        <UPageCard variant="subtle" title="Where the data came from"
            description="Recorded as each payload landed, not inferred afterwards.">
            <div class="w-full divide-y divide-default">
                <div v-for="row in payloads" :key="row.label"
                    class="py-3 first:pt-0 last:pb-0 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                    <div class="sm:w-40 shrink-0">
                        <p class="font-semibold">{{ row.label }}</p>
                        <p class="text-xs text-muted">{{ row.records }}</p>
                    </div>
                    <div class="min-w-0 space-y-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <UBadge :color="row.badge.color" :icon="row.badge.icon" variant="subtle" size="md">
                                {{ row.badge.label }}
                            </UBadge>
                            <span v-if="row.loadedAt" class="text-xs text-muted font-mono">{{ row.loadedAt }}</span>
                        </div>
                        <p class="text-sm text-muted break-all">{{ row.detail }}</p>
                        <p v-if="row.error" class="text-sm text-error break-all">{{ row.error }}</p>
                    </div>
                </div>
            </div>
        </UPageCard>

        <UPageCard variant="subtle" title="Configuration"
            description="The flags and endpoints this build was given.">
            <dl class="grid sm:grid-cols-2 gap-4 text-sm w-full">
                <div v-for="entry in configuration" :key="entry.label">
                    <dt class="text-muted text-xs uppercase tracking-wide">{{ entry.label }}</dt>
                    <dd class="font-mono break-all">{{ entry.value }}</dd>
                </div>
            </dl>
        </UPageCard>

        <UPageCard variant="subtle">
            <ElectionsDebugJsonBlock title="Event document" :subtitle="eventSubtitle" :value="source?.liveEvent.value"
                :empty-label="eventEmptyLabel" />
        </UPageCard>

        <UPageCard variant="subtle">
            <ElectionsDebugJsonBlock title="Election" subtitle="From manifest.json" :value="election" />
        </UPageCard>

        <UPageCard variant="subtle">
            <ElectionsDebugJsonBlock title="Results version" subtitle="From manifest.json" :value="resultsVersion" />
        </UPageCard>
    </ElectionsLayoutDashboardPage>
</template>

<script setup lang="ts">
import type { ElectionSummary, PayloadProvenance, ResultsVersion, SourceProvenance } from '~/types/elections'
import { useInjectedElectionSource } from '~/composables/useElectionSource'
import { useElectionSnapshotBase } from '~/composables/useElectionManifest'
import { useElectionsDebugEnabled } from '~/composables/useElectionsDebug'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * Why the dashboard is in the state it is in.
 *
 * Two questions this answers that nothing else can. The first is what the
 * manifest and the Firestore event document actually say, as opposed to what
 * the gate concluded from them. The second is where reference data came from:
 * it has two possible sources with a fallback between them, the choice is made
 * at runtime, nothing on screen reveals it, and the difference is the whole
 * Firestore bill.
 *
 * It renders in front of the loading gate rather than behind it -- see
 * `[resultsVersionSlug].vue` -- so it is readable while the dashboard is still
 * waiting, which is when it is wanted.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
}>()

// The sidebar link is already gated, but a route is reachable without it.
if (!useElectionsDebugEnabled()) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
}

const source = useInjectedElectionSource()
const store = useElectionDataStore()
const config = useRuntimeConfig()
const snapshotBase = useElectionSnapshotBase()

// Diagnostics, so not something to have indexed anywhere the flag is left on.
// The title comes from the election page above, as on every other tab here.
useSeoMeta({ robots: 'noindex, nofollow' })

/** Exact to the second, because the point of a timestamp here is ordering. */
const timestamp = (value: Date | null) => (value ? value.toISOString() : null)

const publicConfig = config.public as unknown as Record<string, unknown>

const flag = (name: string) => String(publicConfig[name] ?? '').toLowerCase() === 'true'

const state = computed(() => [
    { label: 'Phase', value: source?.phase.value ?? 'no source' },
    { label: 'Mode', value: source?.mode.value ?? '—' },
    { label: 'Connection', value: source?.connection.value ?? '—' },
    { label: 'Manifest is_live', value: String(props.resultsVersion.is_live) },
    { label: 'Live ended', value: String(source?.liveEnded.value ?? false) },
    { label: 'Tally is_final', value: String(source?.isFinal.value ?? false) },
    { label: 'Newest tally', value: timestamp(source?.lastUpdated.value ?? null) ?? 'none' },
    { label: 'Counted', value: source?.percentCounted.value === null || source === null
        ? 'unknown'
        : `${source.percentCounted.value}% · ${source.votingPlacesCounted.value ?? '?'} of ${source.votingPlacesTotal.value ?? '?'}` },
    { label: 'Extra subscription', value: JSON.stringify(source?.activeScope.value ?? null) },
])

const badges = {
    r2: { label: 'R2', icon: 'i-lucide-cloud', color: 'primary' as const },
    firestore: { label: 'Firebase', icon: 'i-lucide-flame', color: 'warning' as const },
    none: { label: 'Not loaded', icon: 'i-lucide-circle-dashed', color: 'neutral' as const },
}

const empty: PayloadProvenance = { origin: null, url: null, loadedAt: null, error: null }

// Only null where the page is somehow rendered outside the results version
// page that provides the source, which would itself be worth seeing here.
const provenance = computed<SourceProvenance>(() => source?.provenance.value ?? {
    persistent: empty, reference: empty, results: empty, summary: empty,
})

const eventDocument = computed(() => source?.liveEvent.value ?? null)

const count = (items: unknown[] | undefined | null) => items?.length ?? 0

/** How many electorates the applied summary could name a leader for. */
const summaryRows = computed(() => {
    const results = store.computedElectorateResults(props.election.slug, props.resultsVersion.slug)
    if (!results.size) return null
    let withLeader = 0
    for (const result of results.values()) {
        if (result.firstPlace?.length) withLeader += 1
    }
    return withLeader
})

const payloads = computed(() => {
    const held = provenance.value
    const persistentData = store.persistent
    const reference = store.referenceData(props.election.slug, props.resultsVersion.slug)
    const results = store.allResults(props.election.slug, props.resultsVersion.slug)

    const firebaseId = props.resultsVersion.firebase_id ?? 'unknown event'

    const detail = (payload: PayloadProvenance, firestore: string) => {
        if (payload.origin === 'r2') return payload.url ?? snapshotBase
        if (payload.origin === 'firestore') return firestore
        return 'Nothing has been read yet.'
    }

    return [
        {
            label: 'Persistent data',
            // Persistent data is published long before an event and never
            // changes during one, so it has exactly one source in both modes.
            // Loaded once per visit, which is why it can already be here with
            // nothing recorded against this version.
            records: persistentData
                ? `${count(persistentData.persistent_parties)} parties · ${count(persistentData.persistent_candidates)} candidates · ${count(persistentData.persistent_electorates)} electorates`
                : 'not loaded',
            badge: held.persistent.origin
                ? badges[held.persistent.origin]
                : (persistentData ? badges.r2 : badges.none),
            detail: held.persistent.origin
                ? detail(held.persistent, 'Firestore')
                : (persistentData
                    ? 'Loaded from R2 earlier in this visit; it is shared across results versions.'
                    : 'Nothing has been read yet.'),
            loadedAt: timestamp(held.persistent.loadedAt),
            error: held.persistent.error,
        },
        {
            label: 'Summary',
            records: summaryRows.value === null
                ? 'not loaded'
                : `${summaryRows.value} electorates with a leader`,
            badge: held.summary.origin ? badges[held.summary.origin] : badges.none,
            detail: held.summary.origin
                ? `results_summary/${firebaseId}, one document, maintained by election-summary-worker. It is what lets this page hold every margin without a document per electorate.`
                : 'Only written during a live count.',
            loadedAt: timestamp(held.summary.loadedAt),
            error: held.summary.error,
        },
        {
            label: 'Reference data',
            records: reference
                ? `${count(reference.electorates)} electorates · ${count(reference.parties)} parties · ${count(reference.candidates)} candidates · ${count(reference.voting_places)} voting places`
                : 'not loaded',
            badge: held.reference.origin ? badges[held.reference.origin] : badges.none,
            detail: detail(held.reference,
                `election_electorates, election_parties and election_candidates where event_id is ${firebaseId}. Around 700 documents per visitor, which is what the published paths on the event document exist to avoid.`),
            loadedAt: timestamp(held.reference.loadedAt),
            error: held.reference.error,
        },
        {
            label: 'Results',
            records: `${results.length} ${results.length === 1 ? 'set' : 'sets'}`,
            badge: held.results.origin ? badges[held.results.origin] : badges.none,
            detail: detail(held.results, `results collection for event ${firebaseId}, streamed.`),
            loadedAt: timestamp(held.results.loadedAt),
            error: held.results.error,
        },
    ]
})

const eventSubtitle = computed(() => {
    const document = eventDocument.value
    if (!document) return `events/${props.resultsVersion.firebase_id ?? '—'}`
    const published = document.paths?.reference
    if (published) return `paths.reference set, so reference data comes from R2`
    return props.resultsVersion.paths.reference
        ? 'No paths on the event document; reference data comes from the path the manifest names'
        : 'No published reference data in either place, so it comes from Firestore'
})

const eventEmptyLabel = computed(() => {
    if (!props.resultsVersion.firebase_id) {
        return 'This results version has no firebase_id, so there is no event document to read.'
    }
    if (source?.mode.value !== 'live' && !source?.liveEnded.value) {
        return 'Not watched: the manifest does not have this version live, so no Firestore connection is opened.'
    }
    return 'Watched, but nothing read yet -- either the first read is still in flight or no such document exists.'
})

const configuration = computed(() => [
    { label: 'Snapshot base (R2)', value: snapshotBase },
    { label: 'Firebase project', value: String((publicConfig.firebase as { projectId?: string })?.projectId ?? '—') },
    { label: 'Firestore emulator', value: String(publicConfig.firebaseEmulatorHost || 'not set') },
    { label: 'Elections enabled', value: String(flag('electionsEnabled')) },
    { label: 'Countdown bypassed', value: String(flag('electionsBypassCountdown')) },
    { label: 'Debug flag', value: String(flag('electionsDebug')) },
])
</script>
