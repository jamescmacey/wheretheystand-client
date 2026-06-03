<template>
    <div
        class="flex flex-col rounded-lg overflow-hidden transition-colors duration-150"
        :class="[
            fillHeight ? 'h-full' : 'h-auto w-full min-w-0',
            variant === 'soft' ? 'bg-elevated/50 hover:bg-elevated/100' : '',
            variant === 'outline' ? 'bg-default ring ring-default hover:bg-elevated/50' : '',
        ]"
    >
        <div
            v-if="item?.colour"
            class="h-1.5 w-full shrink-0"
            :style="{ backgroundImage: colourGradientCss(item.colour) }"
            aria-hidden="true"
        />
        <UPageCard
            v-bind="attrs"
            :class="[
                item?.colour ? 'rounded-none ring-0 shadow-none bg-transparent' : 'ring-0 shadow-none bg-transparent',
                fillHeight ? 'flex-1' : 'shrink-0',
            ]"
            :ui="pageCardUi"
        >
            <!--
              Only forward named slots when the parent actually uses them.
              Otherwise UPageCard still sees an empty #title slot and renders the
              title/description body shell, which stacks above the default slot and
              creates a large vertical gap (see stacked / default-only cards).
            -->
            <template v-if="$slots.title" #title>
                <slot name="title" />
            </template>
            <template v-if="$slots.description" #description>
                <slot name="description" />
            </template>
            <template v-if="$slots.header" #header>
                <slot name="header" />
            </template>
            <template v-if="$slots.footer" #footer>
                <slot name="footer" />
            </template>
            <slot v-if="$slots.default" />
        </UPageCard>
    </div>
</template>

<script setup lang="ts">
import { colourGradientCss } from '~/utils/colourHarmony'

type ItemWithOptionalColour = {
    colour?: string | null
}

const props = withDefaults(
    defineProps<{
        item: ItemWithOptionalColour
        /**
         * When true (default), the card stretches to fill the grid row — good for uniform tiles.
         * Set false so the card is only as tall as its content (e.g. vote breakdown cards).
         */
        fillHeight?: boolean
        /**
         * The variant of the card.
         */
        variant?: 'outline' | 'soft'
    }>(),
    { fillHeight: true, variant: 'soft' },
)


const attrs = useAttrs()

/**
 * UPageCard defaults: wrapper `items-start` + container `lg:grid` bunch narrow content in the
 * title slot. When the card should only be content-sized, stretch to the grid cell and keep a
 * single column at lg so the title slot uses full width.
 */
const pageCardUi = computed(() => {
    const base: Record<string, string> = {
        container: '!px-4 sm:!px-5',
    }
    if (props.item?.colour) {
        base.root = 'rounded-none'
    }
    if (!props.fillHeight) {
        base.wrapper = 'flex flex-col flex-1 w-full min-w-0 items-stretch'
        base.container = '!px-4 sm:!px-5 lg:grid-cols-1'
    }
    return base
})
</script>
