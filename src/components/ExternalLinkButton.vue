<template>
<a :href="link" target="_blank">
    <h6>
        {{ text }}<font-awesome-icon class="ml-2" :icon="['fas', 'external-link-alt']"></font-awesome-icon>
    </h6>
</a>
</template>

<script>
export default {
  name: 'ExternalLinkButton',
  props: {
    link: String,
    text: String
  }
}
</script>

<style scoped>
</style>
