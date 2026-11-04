<template>
    <li>
        <!-- A lead change: the electorate, then the two candidates with their
             tallies and the margin between them, as the electorates list
             shows them. The whole entry links to the electorate, so nothing
             inside it is a link of its own. -->
        <NuxtLink v-if="message.type === 'ELECTORATE_LEAD_CHANGE'" :to="leadChange!.to"
            class="flex gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors">
            <UIcon name="i-lucide-repeat" class="size-4 mt-0.5 shrink-0 text-warning" />
            <div class="min-w-0 flex-1 space-y-2">
                <div class="space-y-1.5">
                    <div class="flex items-baseline justify-between gap-2">
                        <p class="font-medium text-sm">{{ leadChange!.tied ? 'Level' : 'Lead change' }}</p>
                        <time v-if="at" :datetime="message.timestamp ?? undefined"
                            class="text-xs text-muted shrink-0 tabular-nums">{{ at }}</time>
                    </div>
                    <ElectionsEntityElectorateBadge v-if="leadChange!.electorate !== null"
                        class="max-w-full" :election="election" :resultsVersion="resultsVersion"
                        :electorate="leadChange!.electorate" :link="false" />
                </div>

                <div v-if="leadChange!.rows.length" class="flex flex-col gap-1">
                    <div v-for="(row, index) in leadChange!.rows" :key="row.candidate">
                        <div class="flex items-center justify-between gap-3 text-sm">
                            <ElectionsEntityCandidateLabel :election="election"
                                :resultsVersion="resultsVersion" :candidate="row.candidate" :link="false"
                                :class="index === 0 ? 'font-medium' : ''" />
                            <span v-if="row.count" class="tabular-nums font-medium shrink-0">
                                {{ row.count }}
                            </span>
                        </div>
                        <p v-if="index === 0 && leadChange!.margin" class="text-xs text-muted text-right">
                            {{ leadChange!.margin }}
                        </p>
                    </div>
                </div>
                <p v-else class="text-sm text-muted">{{ message.body }}</p>
            </div>
        </NuxtLink>

        <!-- Votes added at a voting place: the venue and how many it added,
             linking to the place with the electorate the votes counted for
             already chosen. -->
        <NuxtLink v-else-if="message.type === 'VOTING_PLACE_ADDED'" :to="votingPlace!.to"
            class="flex gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors">
            <UIcon name="i-lucide-map-pin" class="size-4 mt-0.5 shrink-0 text-muted" />
            <div class="min-w-0 flex-1 space-y-1.5">
                <div class="flex items-baseline justify-between gap-3">
                    <p class="font-medium text-sm truncate" :title="votingPlace!.address ?? undefined">
                        {{ votingPlace!.name }}
                    </p>
                    <span v-if="votingPlace!.added" class="tabular-nums font-semibold text-sm shrink-0">
                        {{ votingPlace!.added }}
                    </span>
                </div>
                <div class="flex items-center justify-between gap-2">
                    <ElectionsEntityElectorateBadge v-if="votingPlace!.electorate !== null" class="min-w-0"
                        :election="election" :resultsVersion="resultsVersion"
                        :electorate="votingPlace!.electorate" :link="false" />
                    <time v-if="at" :datetime="message.timestamp ?? undefined"
                        class="text-xs text-muted shrink-0 tabular-nums ml-auto">{{ at }}</time>
                </div>
            </div>
        </NuxtLink>

        <!-- The projected Parliament moved: each party that changed, in its
             own colour, with its seats before and after. -->
        <NuxtLink v-else-if="message.type === 'COMPOSITION_CHANGED'" :to="`${base}/parliament`"
            class="flex gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors">
            <UIcon name="i-lucide-landmark" class="size-4 mt-0.5 shrink-0 text-primary" />
            <div class="min-w-0 flex-1 space-y-2">
                <div class="flex items-baseline justify-between gap-2">
                    <p class="font-medium text-sm">{{ message.title }}</p>
                    <time v-if="at" :datetime="message.timestamp ?? undefined"
                        class="text-xs text-muted shrink-0 tabular-nums">{{ at }}</time>
                </div>
                <ul v-if="composition.length" class="space-y-1.5">
                    <li v-for="change in composition" :key="change.key" class="flex gap-2 min-w-0">
                        <ElectionsResultsPartySwatch :colour="change.colour" :alternate="change.alternate" />
                        <div class="min-w-0">
                            <p class="text-sm truncate">{{ change.name }}</p>
                            <p class="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                                {{ change.before }}
                                <UIcon name="i-lucide-arrow-right" class="size-3 shrink-0" />
                                <span class="font-medium text-default">{{ change.after }}</span>
                            </p>
                        </div>
                    </li>
                </ul>
                <p v-else-if="message.body" class="text-sm text-muted">{{ message.body }}</p>
            </div>
        </NuxtLink>

        <div v-else class="flex gap-3 px-4 py-3">
            <UIcon name="i-lucide-megaphone" class="size-4 mt-1 shrink-0 text-info" />

            <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-baseline justify-between gap-2">
                    <p class="font-medium text-sm">{{ message.title }}</p>
                    <time v-if="at" :datetime="message.timestamp ?? undefined"
                        class="text-xs text-muted shrink-0 tabular-nums">{{ at }}</time>
                </div>

                <p v-if="message.body" class="text-sm text-muted">{{ message.body }}</p>

                <a v-if="announcement" :href="announcement.href" :target="announcement.target"
                    :rel="announcement.rel" class="inline-block text-xs text-primary hover:underline pt-0.5">
                    {{ announcement.label }}
                </a>
            </div>
        </div>
    </li>
</template>

<script setup lang="ts">
import type { ElectionSummary, EntityNumber, FeedMessage, ResultsVersion } from '~/types/elections'
import { formatCount, formatTime, fromEpochSeconds, pluralise } from '~/utils/elections/format'
import { useElectionDataStore } from '~/stores/electionData'

/**
 * One entry in the feed.
 *
 * The worker writes a title and body for every entry, and names the entities
 * it is about in its metadata. Where those entities resolve here, the entry is
 * drawn from them -- the electorate badge, the candidates in their party
 * colours, the parties that moved -- so it reads like the rest of the
 * dashboard rather than a line of prose. The body is the fallback wherever the
 * metadata cannot be drawn: an entry from an older worker, or one naming
 * something the reference data does not hold.
 *
 * Figures come from the metadata, which records them as they stood when the
 * entry was written. Looking them up in the store would show today's tally
 * beside last hour's headline.
 */
const props = defineProps<{
    election: ElectionSummary
    resultsVersion: ResultsVersion
    message: FeedMessage
}>()

const store = useElectionDataStore()
const slugs = computed(() => ({ e: props.election.slug, v: props.resultsVersion.slug }))

const at = computed(() => formatTime(fromEpochSeconds(props.message.timestamp_seconds)))

const base = computed(() =>
    `/elections/${props.election.slug}/${props.resultsVersion.slug}`)

const leadChange = computed(() => {
    const message = props.message
    if (message.type !== 'ELECTORATE_LEAD_CHANGE') return null
    const { electorate, leader, runner_up, margin, leader_count, runner_up_count } = message.metadata

    const rows: { candidate: EntityNumber, count: string | null }[] = []
    if (leader !== null) rows.push({ candidate: leader, count: formatCount(leader_count) })
    if (runner_up !== null) rows.push({ candidate: runner_up, count: formatCount(runner_up_count) })

    const tied = margin === 0
    return {
        electorate,
        to: electorate === null ? `${base.value}/electorates` : `${base.value}/electorates/${electorate}`,
        rows,
        tied,
        margin: tied ? 'Tied' : margin === null ? null : `+${formatCount(margin)}`,
    }
})

/**
 * A voting place's name, which upstream is only ever the first part of its
 * address: "Cockle Bay School, 24 Sandspit Road" is Cockle Bay School.
 */
function venueName(address: string) {
    return address.split(',')[0]!.trim() || address
}

const votingPlace = computed(() => {
    const message = props.message
    if (message.type !== 'VOTING_PLACE_ADDED') return null
    const { voting_place, electorate, votes_added } = message.metadata

    const address = voting_place === null
        ? null
        : store.votingPlace(slugs.value.e, slugs.value.v, voting_place)?.address ?? null

    // An older worker recorded neither the count nor anything but the body,
    // which opens with the address and says how many were added.
    const fromBody = message.body.match(/^(.*?) added ([\d,]+) votes/)
    const added = votes_added ?? (fromBody ? Number(fromBody[2]!.replace(/,/g, '')) : null)
    const fullAddress = address ?? fromBody?.[1] ?? null

    const query = electorate === null ? '' : `?electorate=${electorate}`
    return {
        electorate,
        address: fullAddress,
        name: fullAddress
            ? venueName(fullAddress)
            : voting_place === null ? 'A voting place' : `Voting place ${voting_place}`,
        added: added === null ? null : `+${formatCount(added)}`,
        to: voting_place === null
            ? `${base.value}/voting-places`
            : `${base.value}/voting-places/${voting_place}${query}`,
    }
})

const composition = computed(() => {
    const message = props.message
    if (message.type !== 'COMPOSITION_CHANGED') return []

    return message.metadata.changes.map((change, index) => ({
        key: change.party ?? `unknown-${index}`,
        name: change.party === null
            ? 'Unknown party'
            : store.party(slugs.value.e, slugs.value.v, change.party)?.name ?? 'Unknown party',
        colour: change.party === null
            ? null
            : store.partyColour(slugs.value.e, slugs.value.v, change.party),
        alternate: change.party === null
            ? null
            : store.partyAlternateColour(slugs.value.e, slugs.value.v, change.party),
        before: pluralise(change.before, 'seat'),
        after: pluralise(change.after, 'seat'),
    }))
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
