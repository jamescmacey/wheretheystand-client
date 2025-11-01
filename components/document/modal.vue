<template>
    <UModal :ui="{ content: 'sm:max-w-3xl' }">
        <UButton :label="props.title ? props.title : document.title" icon="i-lucide-file-text" color="neutral"
            variant="link" class="pl-0" />
        <template #title>
            {{ document.title }}
        </template>
        <template #body>
            <UButton icon="i-lucide-download" color="neutral" variant="link" class="pl-0" label="PDF (123 KB)"
                target="_blank" to="https://www.google.com" />
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