<template>
    <UBanner
        class="light"
        :id="banner.id"
        v-if="banners && banners.length > 0"
        v-for="banner in banners"
        :icon="banner.url_tyle == 'external' ? 'i-lucide-external-link' : null"
        :key="banner.id"
        :close="banner.is_persistent ? false : true"
        :to="banner.url ? banner.url : null"
        :target="banner.url_behaviour == 'new' ? '_blank' : null"
    >
        <template #title>
            <span class="font-bold">{{ banner.title }}</span><span v-if="banner.message">: {{ banner.message }}</span>
        </template>
    </UBanner>
</template>

<script setup>
const config = useRuntimeConfig();
const { data: banners } = await useAsyncData('banners', () => $fetch(`${config.public.apiBase}banners/`))
</script>