<script setup>
const { data: versions } = await useAsyncData('changelog', async () =>
    await queryCollection('changes').order('date', 'DESC').all()
)

usePageSeo({
    title: 'Changelog',
    description: 'When features are added, removed or changed, they are listed here.',
})
</script>

<template>
    <div class="flex flex-col xl:flex-row">
        <div class="w-full xl:w-1/2">
            <UPageSection
                title="Changelog"
                description="When features are added, removed or changed, they are listed here."
                orientation="vertical"
                :links="[
                    {
                        label: 'GitHub',
                        icon: 'i-simple-icons-github',
                        variant: 'ghost',
                        size: 'md',
                        to: 'https://github.com/jamescmacey/',
                        target: '_blank'
                    }
                ]"
                :ui="{
                    root: 'border-b border-default xl:border-b-0 xl:sticky xl:inset-y-0 xl:h-screen overflow-hidden',
                    container: 'h-full items-center justify-center',
                    wrapper: 'flex flex-col',
                    headline: 'mb-6',
                    title: 'text-left text-4xl',
                    description: 'text-left max-w-lg',
                    links: 'gap-1 justify-start -ms-2.5'
                }"
            >
                <template #top>
                    <div
                        class="absolute -right-1/2 z-[-1] rounded-full bg-primary blur-[300px] size-60 sm:size-100 transform -translate-y-1/2 top-1/2" />
                </template>

                <template #headline>
                    <AppLogo class="w-auto h-6 shrink-0 text-highlighted" />
                </template>

                <template #default />
            </UPageSection>
        </div>

        <div class="w-full xl:w-1/2">
            <section class="px-4 sm:px-6 xl:px-0 xl:-ms-30">
                <UChangelogVersions as="main" :indicator-motion="false" :ui="{
                    root: 'py-16 sm:py-24 lg:py-32',
                    indicator: 'inset-y-0'
                }">
                    <UChangelogVersion
                        v-for="version in versions"
                        :key="version.path"
                        :title="version.title"
                        :date="version.date"
                        :ui="{
                            root: 'flex items-start',
                            container: 'max-w-xl min-w-0',
                            header: 'border-b border-default pb-4',
                            title: 'text-3xl',
                            date: 'text-xs/9 text-highlighted font-mono',
                            indicator: 'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32'
                        }"
                    >
                        <template #body>
                            <ContentRenderer v-if="version.body" :value="version" />
                        </template>
                    </UChangelogVersion>
                </UChangelogVersions>
            </section>
        </div>
    </div>
</template>