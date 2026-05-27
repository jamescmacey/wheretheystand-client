<template>
    <UContainer>
        <div v-if="status === 'error'" class="mt-8">
            <UEmpty
                title="Could not create workbook"
                description="An error occurred while creating the workbook. Please try again."
            />
        </div>
        <div v-else class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
            <h3 class="mb-2 text-muted">Creating workbook...</h3>
            <UProgress animation="swing" />
        </div>
    </UContainer>
</template>

<script setup>

const toast = useToast()

const { status } = await useAsyncData(
    'workbook-create',
    async () => {
        const workbook = await useAdminApi().post('v2/workbooks/', { name: 'My new workbook' })
        await navigateTo(`/console/workbooks/${workbook.id}`, { replace: true })
        return workbook
    },
    { server: false },
)

watch(status, (value) => {
    if (value === 'error') {
        toast.add({
            title: 'Could not create workbook',
            description: 'Please try again.',
            color: 'error',
        })
    }
})

</script>
