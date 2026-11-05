<template>
    <div class="flex flex-col gap-1">
        <span class="text-xs text-muted">Data</span>
        <UBadge :color="badge.color" :icon="badge.icon" variant="outline" size="md"
            :ui="{ leadingIcon: badge.animation }">
            {{ badge.label }}
        </UBadge>
    </div>
</template>

<script setup lang="ts">
import { useNow } from '@vueuse/core'
import type { ConnectionState, SourceMode } from '~/types/elections'
import { formatRecentTime } from '~/utils/elections/format'

/**
 * Says where the figures on screen came from and how current they are.
 *
 * This is the only place the transport is visible to a reader. It replaces a
 * placeholder badge that always claimed a live connection, which would have
 * been actively misleading once results mattered.
 *
 * It says nothing about whether a count is final. The feed marks a results set
 * final once it stops being updated, which for preliminary results is not the
 * same thing as the final result of the election, and a badge reading "Final"
 * on the night would be read as the latter.
 */
const props = withDefaults(defineProps<{
    mode: SourceMode
    connection: ConnectionState
    lastUpdated?: Date | null
    /** The count was live during this visit and has since been taken off. */
    liveEnded?: boolean
}>(), { lastUpdated: null, liveEnded: false })

// Ticks so that "9.35 pm" gains its date once it is a day old, rather than
// only on the next update -- which on an archived page never comes.
const now = useNow({ interval: 60_000 })

const updatedAt = computed(() => formatRecentTime(props.lastUpdated, now.value))

const badge = computed(() => {
    // Someone watching when the count was taken off live is told so, rather
    // than the figures quietly ceasing to update behind an unchanged badge.
    if (props.liveEnded) {
        return {
            label: updatedAt.value ? `Live updates ended · ${updatedAt.value}` : 'Live updates ended',
            icon: 'i-lucide-pause-circle',
            color: 'warning' as const,
            animation: '',
        }
    }
    if (props.mode !== 'live') {
        return { label: 'Archived results', icon: 'i-lucide-archive', color: 'neutral' as const, animation: '' }
    }
    // Given up: nothing will update until the reader retries or reloads, and
    // saying "Reconnecting" here would be a promise nothing is keeping.
    if (props.connection === 'failed') {
        return {
            label: updatedAt.value ? `Not updating · ${updatedAt.value}` : 'Not updating',
            icon: 'i-lucide-wifi-off',
            color: 'error' as const,
            animation: '',
        }
    }
    if (props.connection === 'offline') {
        return { label: 'Reconnecting…', icon: 'i-lucide-wifi-off', color: 'warning' as const, animation: '' }
    }
    if (props.connection === 'connecting') {
        return { label: 'Connecting…', icon: 'i-lucide-loader', color: 'neutral' as const, animation: 'animate-[spin_3s_linear_infinite]' }
    }
    return {
        label: updatedAt.value ? `Live · updated ${updatedAt.value}` : 'Live results',
        icon: 'i-lucide-radio',
        color: 'primary' as const,
        animation: 'animate-pulse',
    }
})
</script>
