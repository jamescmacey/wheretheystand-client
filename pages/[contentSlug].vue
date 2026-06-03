<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(
  'reference-page-' + route.params.contentSlug,
  async () => await queryCollection('reference').path('/reference/' + route.params.contentSlug as string).first(),
  { watch: [() => route.params.contentSlug] }
)

if (!page.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page not found: /' + route.params.contentSlug,
        fatal: true
    })
}

usePageSeo({
    title: () => page.value?.title,
    description: () => page.value?.description,
})
</script>

<template>

<PageHeader :pageTitle="page?.title ?? ''"></PageHeader>
    <UPage v-if="page" class="mb-16">
        <div class="w-full overflow-hidden">
            <ContentRenderer class="pl-2 sm:pl-4 md:pl-8 pr-4 sm:pr-8 lg:pr-48" v-if="page.body" :value="page" />
        </div>

    <template v-if="page?.body?.toc?.links?.length" #left>
      <UContentToc
        class="lg:mt-4 px-2 sm:px-4 md:px-8"
        :ui="{ root: '!mx-0 sm:!mx-0' }"
        :links="page.body.toc.links"
      />
    </template>
  </UPage>

</template>