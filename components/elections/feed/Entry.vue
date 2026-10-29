<template>
    <li class="flex gap-3 px-4 py-3">
        <UIcon :name="badge.icon" class="size-4 mt-1 shrink-0" :class="badge.tone" />

        <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-baseline justify-between gap-2">
                <p class="font-medium text-sm">{{ message.title }}</p>
                <time v-if="at" :datetime="message.timestamp ?? undefined"
                    class="text-xs text-muted shrink-0 tabular-nums">{{ at }}</time>
            </div>

            <p v-if="message.body" class="text-sm text-muted">{{ message.body }}</p>

            <!-- Links to whatever the entry is about. The worker already named
                 those entities in the body, so these carry no text of their
                 own beyond the destination. -->
            <div v-if="links.length || announcement" class="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
                    class="text-xs text-primary hover:underline">{{ link.label }}</NuxtLink>
                <a v-if="announcement" :href="announcement.href" :target="announcement.target"
                    :rel="announcement.rel" class="text-xs text-primary hover:underline">
                    {{ announcement.label }}
                </a>
            </div>
        </div>
    </li>
</template>

<script setup lang="ts">
import type { ElectionSummary, FeedMessage, ResultsVersion } from '~/types/elections'
import { formatTime, fromEpochSeconds } from '~/utils/elections/format'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * One entry in the feed.
 *
 * The title and body are written upstream and rendered as they arrive. The
 * worker holds the reference data that named the electorate or the candidate
 * at the moment the entry was written, so its wording is the authority: an
 * entry still reads correctly where a lookup here would not resolve, which is
 * the ordinary case for a candidate who has not been matched to a person.
 *
 * What this component adds is the parts that cannot be written in advance --
 * an icon, a local time, and links into the dashboard for the entities the
 * metadata names.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    message: FeedMessage
}>()

const store = useElectionDataStore()

const at = computed(() => formatTime(fromEpochSeconds(props.message.timestamp_seconds)))

const badge = computed(() => {
    switch (props.message.type) {
        case 'ELECTORATE_LEAD_CHANGE':
            return { icon: 'i-lucide-repeat', tone: 'text-warning' }
        case 'VOTING_PLACE_ADDED':
            return { icon: 'i-lucide-map-pin', tone: 'text-muted' }
        case 'COMPOSITION_CHANGED':
            return { icon: 'i-lucide-landmark', tone: 'text-primary' }
        case 'SERVICE_ANNOUNCEMENT':
            return { icon: 'i-lucide-megaphone', tone: 'text-info' }
    }
})

const base = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}`)

/** The electorate this entry is about, where it names one that is known here. */
function electorateLink(number: number | null) {
    if (number === null) return null
    const electorate = store.electorate(
        props.election.slug, props.resultsVersion.slug, number)
    return {
        to: `${base.value}/electorates/${number}`,
        label: electorate?.name ?? `Electorate ${number}`,
    }
}

const links = computed(() => {
    const message = props.message
    const found: { to: string, label: string }[] = []

    if (message.type === 'ELECTORATE_LEAD_CHANGE') {
        const electorate = electorateLink(message.metadata.electorate)
        if (electorate) found.push(electorate)
    }

    if (message.type === 'VOTING_PLACE_ADDED') {
        // The electorate the votes were counted for, which is the one whose
        // result moved. Where the place physically sits is in the body.
        const electorate = electorateLink(message.metadata.electorate)
        if (electorate) found.push(electorate)
        found.push({ to: `${base.value}/voting-places`, label: 'Voting places' })
    }

    if (message.type === 'COMPOSITION_CHANGED') {
        found.push({ to: `${base.value}/parliament`, label: 'Parliament' })
    }

    return found
})

/**
 * A service announcement's own link.
 *
 * Rendered as a plain anchor rather than a NuxtLink, because an announcement
 * is typed into the Firebase console and its URL cannot be assumed to be a
 * route this app has. `external` is written alongside it rather than guessed,
 * so an absolute URL on this site still navigates internally when it should.
 */
const announcement = computed(() => {
    const message = props.message
    if (message.type !== 'SERVICE_ANNOUNCEMENT' || !message.metadata.url) return null

    return {
        href: message.metadata.url,
        label: message.metadata.external ? 'Read more' : 'Open',
        target: message.metadata.external ? '_blank' : undefined,
        rel: message.metadata.external ? 'noopener noreferrer' : undefined,
    }
})
</script>
