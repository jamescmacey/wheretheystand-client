<template>
<a :href="link" target="_blank">
    <h6>
        <slot></slot>{{ text }}<font-awesome-icon class="ml-2" :icon="['fas', 'external-link-alt']"></font-awesome-icon>
    </h6>
</a>
</template>

<script>
export default {
  name: 'ExternalLinkButton',
  props: {
    link: String,
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
</style>
