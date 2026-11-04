<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-baseline gap-2 min-w-0">
                <h3 class="font-semibold truncate">{{ title }}</h3>
                <span v-if="subtitle" class="text-xs text-muted truncate">{{ subtitle }}</span>
            </div>
            <UButton size="xs" variant="subtle" color="neutral" icon="i-lucide-copy" :disabled="text === null"
                @click="copy">
                Copy
            </UButton>
        </div>

        <p v-if="text === null" class="text-sm text-muted">{{ emptyLabel }}</p>
        <!-- Deliberately a raw dump rather than a rendered tree: the point of
             this page is to show the object exactly as the client holds it,
             including the fields nobody thought to render. -->
        <pre v-else
            class="text-xs font-mono whitespace-pre-wrap break-all bg-elevated/50 ring ring-default rounded-md p-3 max-h-96 overflow-auto">{{ text }}</pre>
    </div>
</template>

<script setup lang="ts">
/**
 * One object, as JSON, with a copy button.
 *
 * Several of these sit on the debug page, and what each is worth is the raw
 * payload, so there is nothing per-object to lay out -- only the heading, the
 * dump and a way to get it into a bug report.
 */
const props = withDefaults(defineProps<{
    title: string
    subtitle?: string
    value: unknown
    /** Shown instead of the dump when there is nothing to show. */
    emptyLabel?: string
}>(), { emptyLabel: 'Nothing loaded.' })

const toast = useToast()

const text = computed(() => {
    if (props.value === null || props.value === undefined) return null
    try {
        return JSON.stringify(props.value, null, 2)
    } catch (caught) {
        // A cyclic or otherwise unserialisable object is itself worth knowing
        // about here, so it is reported rather than blanking the block.
        return `Could not serialise: ${caught instanceof Error ? caught.message : String(caught)}`
    }
})

async function copy() {
    if (text.value === null) return
    try {
        await navigator.clipboard.writeText(text.value)
        toast.add({ title: `${props.title} copied`, icon: 'i-lucide-check', color: 'success' })
    } catch {
        toast.add({
            title: 'Could not copy',
            description: 'Your browser would not give the page clipboard access.',
            icon: 'i-lucide-triangle-alert',
            color: 'error',
        })
    }
}
</script>
