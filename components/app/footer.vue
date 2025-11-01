<script setup lang="ts">
const columns = [{
  label: 'About',
  children: [{
    label: 'About WhereTheyStand',
    to: '/about'
  }, {
    label: 'Contact, feedback or corrections',
    to: '/contact'
  }, {
    label: 'Copyright and privacy',
    to: '/terms'
  }, {
    label: 'System status',
    to: 'https://status.wheretheystand.nz'
  }]
}, {
  label: 'Support',
  children: [{
    label: 'Buy Me A Coffee',
    to: 'https://links.wheretheystand.nz/buy-me-a-coffee'
  }]
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: 'Subscribed!',
    description: 'You\'ve been subscribed to our newsletter.'
  })
}
</script>

<template>
  <USeparator
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Subscribe to our newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Subscribe"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm">
        wheretheystand.nz
      </p>
    </template>

    <template #right>

      <UColorModeButton />
      <UButton
        to="https://links.wheretheystand.nz/x"
        target="_blank"
        icon="i-simple-icons-x"
        aria-label="WhereTheyStand on X"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>