<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(
    'docs-page-' + route.params.contentSlug,
    async () => await queryCollection('docs').path('/docs/' + route.params.contentSlug as string).first(),
    { watch: [() => route.params.contentSlug] }
)

if (!page.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page not found: /docs/' + route.params.contentSlug,
        fatal: true
    })
}

useSeoMeta({
    title: page.value?.title,
    description: page.value?.description,
    robots: 'noindex, nofollow'
})

// GitHub edit link (docs are in wheretheystand-django/docs/ by convention)
const githubEditUrl = computed(() => {
    const slug = route.params.contentSlug as string
    return `https://github.com/jamescmacey/wheretheystand-django/edit/main/docs/${slug}.md`
})

import type { ContentNavigationLink} from '@nuxt/ui'
const navigation = ref<ContentNavigationLink[]>([])

useAsyncData('navigation', async () => await queryCollectionNavigation('docs'))
    .then(({ data }) => {
        navigation.value = data.value ?? []
    })

</script>

<template>

    <PageHeader :pageTitle="page?.title ?? ''"></PageHeader>
    <UPage v-if="page" class="mb-16">
        <div class="w-full overflow-hidden">
            <div class="px-4 lg:px-2">
                <UAlert color="info" variant="subtle" class="mt-8" icon="i-lucide-info"
                    title="This documentation is for internal use."
                    description="Because WhereTheyStand's source code is public, so is this documentation.  However, there is generally no need to use it." />
            </div>

            <ContentRenderer class="px-4 lg:px-2" v-if="page.body" :value="page" />
            <USeparator class="my-8" />
            <div class="px-4 lg:px-2 flex justify-end">
                
                <UButton :href="githubEditUrl" target="_blank" rel="noopener noreferrer" icon="i-lucide-edit"
                variant="ghost" color="neutral">Edit on GitHub</UButton>
            </div>
            
        </div>

        <template v-if="navigation" #left>
            <UPageAside> 
                <UContentNavigation :navigation="navigation" highlight class="pl-2 md:pl-4" :collapsible="false"/>
            </UPageAside>
        </template>

        <template v-if="page?.body?.toc?.links?.length" #right>

            <div class="lg:mt-4">

                <UContentToc class="px-2 sm:px-4 md:px-8" :ui="{ root: '!mx-0 sm:!mx-0' }"
                    :links="page.body.toc.links" />
            </div>

        </template>
    </UPage>

</template>