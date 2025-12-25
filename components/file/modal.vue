<template>
    <UModal :ui="{ content: 'sm:max-w-3xl' }" :title="title">
        <UButton icon="i-lucide-file-text" color="neutral" variant="link" class="pl-0">{{ buttonText }}
        </UButton>
        <template #body>
            <h2 class="text-lg font-bold mb-2">{{ file.file_name }}</h2>
            <p v-if="file.file_description" class="mb-2">{{ file.file_description }}</p>
            <p v-if="file.published_date" class="text-muted text-sm">Published: {{ formatDate(file.published_date) }}</p>
            <p v-if="file.file_type" class="text-muted text-sm">Type: {{ file.file_type }}</p>
            <div class="space-y-4 mt-4">
            <div v-if="file.copyright_owner">
                <h3 class="font-bold mb-2">Copyright owner<span v-if="file.licence_grantor && file.licence_grantor.id === file.copyright_owner.id"> and licence grantor</span></h3>
                <FileCopyrightParty :copyrightParty="file.copyright_owner" />
            </div>
            <div v-if="file.licence_grantor && file.licence_grantor.id !== file.copyright_owner?.id">
                <h3 class="font-bold mb-2">Licence grantor</h3>
                <FileCopyrightParty :copyrightParty="file.licence_grantor" />
            </div>
            <div v-if="file.licence">
                <h3 class="font-bold mb-2">Licence</h3>
                <FileLicence :licence="file.licence" />
            </div>
            </div>

        </template>
        <template #footer>
            <div class="flex justify-end w-full">
                <UButton v-if="file.file" icon="i-lucide-download" variant="outline" color="primary" :to="file.file" target="_blank" title="Download file">Download file</UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup>

const config = useRuntimeConfig()

import { format } from 'date-fns'

const formatDate = (date) => {
    return format(new Date(date), 'd MMMM yyyy')
}


const props = defineProps({
    file: {
        type: Object,
        required: true
    },
    buttonText: {
        type: String,
        required: false,
        default: 'View file'
    },
    title: {
        type: String,
        required: false,
        default: 'View file'
    }
})

</script>