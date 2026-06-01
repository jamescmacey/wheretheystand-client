<template>
    <UModal :ui="{ content: 'sm:max-w-3xl' }" :title="modalTitle">
        <UButton :icon="icon" color="neutral" variant="link" class="pl-0">
            {{ buttonText }}
        </UButton>
        <template #body>
            <p v-if="document.description" class="text-muted text-sm mb-4">
                {{ document.description }}
            </p>

            <div v-if="document.files?.length" class="space-y-0">
                <div
                    v-for="(file, index) in document.files"
                    :key="file.id"
                    class="py-3"
                >
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex min-w-0 items-start gap-3">
                            <UIcon
                                :name="fileIcon(file)"
                                class="size-6 shrink-0 text-muted"
                                :class="{ 'text-error': file.file_type?.includes('pdf') }"
                            />
                            <div class="min-w-0">
                                <p class="font-medium leading-snug">{{ file.file_name }}</p>
                                <p v-if="file.file_description" class="text-muted text-sm mt-0.5">
                                    {{ file.file_description }}
                                </p>
                                <p v-if="file.published_date" class="text-muted text-sm mt-0.5">
                                    Published {{ formatDate(file.published_date) }}
                                </p>
                            </div>
                        </div>
                        <div class="flex shrink-0 items-center gap-2 sm:pl-2">
                            <UButton
                                v-if="file.file"
                                icon="i-lucide-download"
                                variant="outline"
                                color="primary"
                                size="sm"
                                :to="file.file"
                                target="_blank"
                                title="Download file"
                            >
                                Download
                            </UButton>
                            <UButton
                                v-if="file.source_url"
                                icon="i-lucide-external-link"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                :to="file.source_url"
                                target="_blank"
                                title="View original source"
                            >
                                Source
                            </UButton>
                            <FileModal
                                v-if="hasFileDetails(file)"
                                :file="file"
                                button-text="Details"
                                title="File details"
                                icon="i-lucide-info"
                            />
                        </div>
                    </div>
                    <USeparator v-if="index < document.files.length - 1" class="mt-3" />
                </div>
            </div>
            <UEmpty
                v-else
                title="No files"
                description="No files are available for this document."
            />
        </template>
    </UModal>
</template>

<script setup>
import { format } from 'date-fns'

const props = defineProps({
    document: {
        type: Object,
        required: true,
    },
    buttonText: {
        type: String,
        default: 'View document',
    },
    title: {
        type: String,
        required: false,
    },
    icon: {
        type: String,
        default: 'i-lucide-file-text',
    },
})

const modalTitle = computed(() => props.title ?? props.document.name)

const formatDate = (date) => format(new Date(date), 'd MMMM yyyy')

const fileIcon = (file) =>
    file.file_type?.includes('pdf') ? 'i-lucide-file-pdf' : 'i-lucide-file-text'

const hasFileDetails = (file) =>
    file.copyright_owner || file.licence_grantor || file.licence
</script>
