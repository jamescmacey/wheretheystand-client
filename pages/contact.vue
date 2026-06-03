<template>
  <div>
    <PageHeader pageTitle="Contact"></PageHeader>
    <UContainer class="mt-8">

      <h2 class="text-2xl font-bold mb-2">Get in touch</h2>
          <p class="text-muted mb-2">
            Please use this form for feedback, corrections, or questions.
          </p>
          <span class="text-sm">
            WhereTheyStand’s <ULink to="/terms#privacy" target="_blank">privacy terms</ULink> apply to submissions.
          </span>
          
      <UPageCard class="!p-0 mt-4" variant="soft" :ui="{ body: { padding: 'p-0 sm:p-0' }, header: { padding: 'p-6 pb-0' } }">

        <div class="p-6 pt-0">
          <form class="flex flex-col gap-6" novalidate @submit.prevent="onSubmit">
            <UFormField
              label="Type"
              :error="fieldError('category')"
            >
              <URadioGroup
                v-model="form.category"
                :items="types"
                class="grid grid-cols-1 sm:grid-cols-3 gap-2"
                variant="card"
              />
            </UFormField>
            <UFormField
              label="Name"
              :error="fieldError('name')"
            >
              <UInput
                v-model="form.name"
                placeholder="Your name"
                icon="i-heroicons-user"
                size="lg"
                class="w-full"
                autocomplete="name"
              />
            </UFormField>
            <UFormField
              label="Email"
              :error="fieldError('email')"
            >
              <UInput
                v-model="form.email"
                placeholder="you@email.com"
                icon="i-heroicons-envelope"
                size="lg"
                type="email"
                class="w-full"
                autocomplete="email"
              />
            </UFormField>
            <UFormField
              label="Message"
              :error="fieldError('message')"
            >
              <UTextarea
                v-model="form.message"
                placeholder="Type your message here..."
                autoresize
                size="lg"
                class="w-full min-h-[100px]"
                :maxrows="8"
              />
            </UFormField>
            <UFormField
              label="Prove you're not a robot"
              :error="fieldError('turnstile')"
            >
              <NuxtTurnstile ref="turnstileRef" v-model="token" />
            </UFormField>
            <div class="flex items-center justify-end pt-2">
              <UButton
                :loading="loading"
                type="submit"
                icon="i-heroicons-paper-airplane"
                label="Send message"
                size="lg"
                trailing
                color="primary"
                class="w-full sm:w-auto"
              />
            </div>
            
            <div v-if="successMsg" class="text-green-600 text-sm mt-2">{{ successMsg }}</div>
            <div v-if="errorMsg" class="text-red-600 text-sm mt-2">{{ errorMsg }}</div>
          </form>
        </div>
      </UPageCard>
    </UContainer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const types = [
  { label: "General enquiry", value: "general" },
  { label: "Feedback", value: "feedback" },
  { label: "Correction", value: "correction" },
]

const form = reactive({
  category: 'feedback',
  name: '',
  email: '',
  message: ''
})

const token = ref('')
const turnstileRef = ref(null)
const loading = ref(false)
const errors = reactive({
  category: '',
  name: '',
  email: '',
  message: '',
  turnstile: '',
})

const successMsg = ref('')
const errorMsg = ref('')

function fieldError(key) {
  const message = errors[key]
  return message || undefined
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function clearErrors() {
  errors.category = ''
  errors.name = ''
  errors.email = ''
  errors.message = ''
  errors.turnstile = ''
}

function validateForm() {
  clearErrors()
  let valid = true
  if (!form.category) {
    errors.category = 'Please select a feedback type.'
    valid = false
  }
  if (!form.name.trim()) {
    errors.name = 'Name is required.'
    valid = false
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!validateEmail(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }
  if (!form.message.trim()) {
    errors.message = 'Message is required.'
    valid = false
  }
  return valid
}

const config = useRuntimeConfig()
const feedbackUrl = `${config.public.apiBase}feedback/`

function resetTurnstile() {
  token.value = ''
  turnstileRef.value?.reset?.()
}

function applyServerErrors(data) {
  clearErrors()
  if (!data || typeof data !== 'object') {
    errorMsg.value = 'Failed to send your feedback. Try again later.'
    return
  }
  if (typeof data.detail === 'string') {
    errorMsg.value = data.detail
    return
  }
  if (Array.isArray(data.detail)) {
    errorMsg.value = data.detail.map((d) => (typeof d === 'string' ? d : d?.message || JSON.stringify(d))).join(' ')
    return
  }
  const fieldKeys = ['category', 'name', 'email', 'message', 'turnstile']
  let any = false
  for (const key of fieldKeys) {
    if (data[key] != null && data[key] !== '') {
      errors[key] = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key])
      any = true
    }
  }
  if (!any) {
    errorMsg.value = 'Failed to send your feedback. Try again later.'
  }
}

async function onSubmit() {
  successMsg.value = ''
  errorMsg.value = ''
  clearErrors()
  if (!validateForm()) {
    return
  }
  if (!token.value) {
    errors.turnstile = 'Complete the security check before submitting.'
    return
  }

  loading.value = true
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)
  try {
    const response = await fetch(feedbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        category: form.category,
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        turnstile: token.value,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      applyServerErrors(data)
      if (data.turnstile) {
        resetTurnstile()
      }
      return
    }

    successMsg.value = 'Thank you for your message! We appreciate your feedback.'
    form.category = 'feedback'
    form.name = ''
    form.email = ''
    form.message = ''
    resetTurnstile()
  } catch (err) {
    if (err?.name === 'AbortError') {
      errorMsg.value = 'The request timed out. Please try again in a moment.'
    } else {
      errorMsg.value = 'A network error occurred. Please try again later.'
    }
  } finally {
    clearTimeout(timeoutId)
    loading.value = false
  }
}
</script>
