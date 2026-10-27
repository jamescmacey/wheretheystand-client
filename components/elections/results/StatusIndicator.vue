<template>
    <UBadge :color="badge.color" :icon="badge.icon" variant="outline" size="md">
        {{ badge.label }}
    </UBadge>
</template>

<script setup lang="ts">
import type { ConnectionState, SourceMode } from '~/types/elections'
import { formatTime } from '~/utils/elections/format'

/**
 * Says where the figures on screen came from and how current they are.
 *
 * This is the only place the transport is visible to a reader. It replaces a
 * placeholder badge that always claimed a live connection, which would have
 * been actively misleading once results mattered.
 */
const props = withDefaults(defineProps<{
    mode: SourceMode
    connection: ConnectionState
    lastUpdated?: Date | null
    isFinal?: boolean
    /** The count was live during this visit and has since been taken off. */
    liveEnded?: boolean
}>(), { lastUpdated: null, isFinal: false, liveEnded: false })

const updatedAt = computed(() => formatTime(props.lastUpdated))

const badge = computed(() => {
    if (props.isFinal) {
        return { label: 'Final results', icon: 'i-lucide-check-circle', color: 'success' as const }
    }
    // Someone watching when the count was taken off live is told so, rather
    // than the figures quietly ceasing to update behind an unchanged badge.
    if (props.liveEnded) {
        return {
            label: updatedAt.value ? `Live updates ended · ${updatedAt.value}` : 'Live updates ended',
            icon: 'i-lucide-pause-circle',
            color: 'warning' as const,
        }
    }
    if (props.mode !== 'live') {
        return { label: 'Archived results', icon: 'i-lucide-archive', color: 'neutral' as const }
    }
    if (props.connection === 'offline') {
        return { label: 'Reconnecting…', icon: 'i-lucide-wifi-off', color: 'warning' as const }
    }
    if (props.connection === 'connecting') {
        return { label: 'Connecting…', icon: 'i-lucide-loader', color: 'neutral' as const }
    }
    return {
        label: updatedAt.value ? `Live · updated ${updatedAt.value}` : 'Live results',
        icon: 'i-lucide-radio',
        color: 'primary' as const,
    }
})
</script>
