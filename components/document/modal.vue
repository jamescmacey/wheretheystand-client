<template>
    <UModal :ui="{ content: 'sm:max-w-3xl' }">
        <UButton :label="props.title ? props.title : document.title" icon="i-lucide-file-text" color="neutral"
            variant="link" class="pl-0">View document
            </UButton>
        <template #title>
            {{ document.name }}
        </template>
        <template #body>
        <div class="space-y-4">
            <!-- Description, if present -->
            <div v-if="document.description" class="text-muted text-sm">
                {{ document.description }}
            </div>

            <div v-if="document.files && document.files.length > 0">
                <h4 class="font-semibold text-base mt-2 mb-1">Files:</h4>
                <div class="grid grid-cols-1 gap-4">
                    <UCard
                        v-for="file in document.files"
                        :key="file.id"
                        variant="subtle"
                        class="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 md:p-4 rounded-xl"
                    >
                        <div class="flex items-center space-x-3 flex-1 w-full">
                            <UIcon 
                                :name="file.file_type && file.file_type.includes('pdf') ? 'i-lucide-file-pdf' : 'i-lucide-file-text'"
                                class="text-red-500 text-2xl mr-2"
                            />
                            <div>
                                <div class="font-semibold text-base">{{ file.file_name }}</div>
                                <div class="text-xs text-muted" v-if="file.file_description">
                                    {{ file.file_description }}
                                </div>
                                <div class="text-xs text-muted" v-if="file.published_date">
                                    Published: {{ file.published_date }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 mt-2 md:mt-0">
                            <UButton 
                                v-if="file.file"
                                icon="i-lucide-download"
                                variant="outline"
                                color="primary"
                                size="sm"
                                :to="file.file"
                                target="_blank"
                                title="Download file"
                                class="min-w-[40px]"
                            />
                            <UButton 
                                v-if="file.source_url"
                                icon="i-lucide-link"
                                variant="link"
                                color="primary"
                                size="sm"
                                :to="file.source_url"
                                target="_blank"
                                title="View original source"
                                class="min-w-[40px]"
                            />
                        </div>
                    </UCard>
                </div>
            </div>
            <div v-else class="text-muted text-sm italic">
                No files available for this document.
            </div>
        </div>
        </template>
    </UModal>
</template>

<script setup>

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

//const { data, status, errror, refresh, clear } = await useAsyncData('document-${props.document.id}', () => {$fetch(apiBase + 'documents/${props.document.id}/')})
// temp info
const data = ref({
    id: '123',
    title: 'Example Document',
    content: 'This is an example document content.',
})

const status = ref('success')
const error = ref(null)
const refresh = () => {
    status.value = 'success'
    error.value = null
}


const props = defineProps({
    document: {
        type: Object,
        required: true
    },
    title: {
        type: String,
        required: false
    }
})

</script>