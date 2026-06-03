<script setup lang="ts">
/**
 * Pagination control with a real href for crawlers (via UButton `to`).
 * Click is prevented so parent handlers keep SPA / query-sync behavior.
 */
const props = withDefaults(
    defineProps<{
        to?: string
        disabled?: boolean
        variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
        color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
        icon?: string
        trailing?: boolean
        ariaLabel?: string
        ariaCurrent?: string | boolean
        rel?: string
    }>(),
    {
        variant: 'outline',
        size: 'sm',
        disabled: false,
        trailing: false,
    },
)

const emit = defineEmits<{
    navigate: []
}>()

function onClick() {
    if (props.disabled) return
    emit('navigate')
}
</script>

<template>
    <UButton
        :to="disabled || !to ? undefined : to"
        :disabled="disabled"
        :variant="variant"
        :color="color"
        :size="size"
        :icon="icon"
        :trailing="trailing"
        :aria-label="ariaLabel"
        :aria-current="ariaCurrent"
        :rel="rel"
        @click.prevent="onClick"
    >
        <slot />
    </UButton>
</template>
