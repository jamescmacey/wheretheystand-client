<template>
<a :href="link" target="_blank">
    <h6>
        <slot></slot>{{ text }}<font-awesome-icon class="ms-2" :icon="['fas', 'external-link-alt']"></font-awesome-icon>
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
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
