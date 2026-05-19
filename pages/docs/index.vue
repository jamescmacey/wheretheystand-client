<template>
    <PageHeader pageTitle="Documentation" pageSubtitle="Internal documentation for WhereTheyStand" />
    <UContainer>
        <div>
            <UAlert color="info" variant="subtle" class="mt-8" icon="i-lucide-info"
                title="This documentation is unlikely to be relevant for general users of WhereTheyStand." />
        </div>
        <UContentSearch v-model:search-term="searchTerm" :files="files" :navigation="navigation" />
        <USeparator class="my-8" />
        <h2 class="text-2xl font-bold mb-4">All documentation</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UPageCard v-for="document in documents"
        :key="document.id" variant="soft" :title="document.title" :description="document.description" :to="document.path">
        </UPageCard>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
const searchTerm = ref('')

const { data: navigation } = await useAsyncData(
  'navigation',
  async () => await queryCollectionNavigation('docs')
)

const { data: files } = await useAsyncData(
  'search',
  async () => await queryCollectionSearchSections('docs')
)

const { data: documents } = await useAsyncData(
  'documents',
  async () => await queryCollection('docs').order('title', 'ASC').all()
)

const githubEditUrl = (document: any) => {
    return `https://github.com/jamescmacey/wheretheystand-django/edit/main/${document.path}.md`
}
</script>