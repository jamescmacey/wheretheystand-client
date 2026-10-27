<template>
    <div class="flex flex-col h-full w-full bg-accented flex-grow items-center justify-center px-4 overflow-hidden">
        <div class="relative w-full max-w-lg">
            <div class="mx-0 lg:m-8 my-8 relative text-left">
                <UCard>
                    <!-- Something went wrong and will not fix itself. -->
                    <div v-if="phase === 'error'">
                        <h5 class="text-lg mb-1 font-brand font-bold text-error">Error loading results</h5>
                        <p class="text-md mt-2 text-muted">
                            An error occurred while loading the results. Please try again.
                        </p>
                        <UButton variant="subtle" color="neutral" class="mt-4" icon="i-lucide-refresh-cw" trailing
                            @click="emit('retry')">
                            Retry
                        </UButton>
                    </div>

                    <!-- Nothing to wait for: this count has no results and is not live. -->
                    <div v-else-if="phase === 'awaiting-results'">
                        <h5 class="text-lg mb-1 font-brand font-bold">No results available</h5>
                        <p class="text-md mt-2 text-muted">
                            Results for this count have not been published.
                        </p>
                    </div>

                    <div v-else>
                        <h5 class="text-lg mb-1 font-brand font-bold">Loading results…</h5>
                        <UProgress animation="swing" class="mt-4" />
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { DashboardPhase, SourceMode } from '~/types/elections'

/**
 * The archived-event waiting screen, and the error state for both modes.
 *
 * Presentational only. A live count waits behind the countdown instead, which
 * is the screen with something to say while results are on their way; there is
 * nothing to say about an archive that has not published any.
 */
withDefaults(defineProps<{
    phase: DashboardPhase
    mode?: SourceMode
}>(), { mode: 'archive' })

const emit = defineEmits<{ retry: [] }>()
</script>
