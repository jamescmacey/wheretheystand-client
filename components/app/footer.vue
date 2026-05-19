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
  }]
}, {
  label: 'Support',
  children: [{
    label: 'Buy Me A Coffee',
    to: 'https://links.wheretheystand.nz/buy-me-a-coffee',
  }, {
    label: 'System status',
    to: 'https://status.wheretheystand.nz'
  }]
}]
</script>

<template>
  <USeparator
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns" />
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm font-brand">
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
      <UButton
        to="https://links.wheretheystand.nz/bluesky"
        target="_blank"
        icon="i-simple-icons-bluesky"
        aria-label="WhereTheyStand on Bluesky"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>