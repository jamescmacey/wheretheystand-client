<template>
    <div>
        <PageHeader pageTitle="Contact"></PageHeader>
        <UContainer class="mt-8">
            <h2 class="text-xl font-bold mb-4">How to get in touch</h2>
            <p>If you have feedback, a corrrection or want to ask a question, please use the form below. WhereTheyStand's <ULink to="/terms">privacy terms</ULink> set out the bases on which the information you provide will be used.</p>
            <UCard class="mt-4" variant="subtle">
                <UForm :state="form" @submit="onSubmit" class="space-y-4">
                    <UFormField name="type" label="Type" required>
                        <URadioGroup v-model="form.type" :items="types" />
                    </UFormField>
                    <UFormField name="name" label="Name" required>
                        <UInput v-model="form.name" />
                    </UFormField>
                    <UFormField name="email" label="Email" required>
                        <UInput v-model="form.email" />
                    </UFormField>
                    <UFormField name="message" label="Message" required>
                        <UInput v-model="form.message" />
                    </UFormField>
                    <UButton type="submit" label="Submit" />
                </UForm>
            </UCard>
        </UContainer>
    </div>
</template>

<script setup>

const types = ["General enquiry", "Feedback", "Correction"]

const form = ref({
    type: 'feedback',
    name: '',
    email: '',
    message: ''
})

function onSubmit() {
    console.log(form.value)
}
</script>