<template>
<a :href="link" target="_blank">
        <slot></slot>{{ text }}<font-awesome-icon class="ms-2" :icon="['fas', 'external-link-alt']"></font-awesome-icon>
</a>
</template>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

</style>


<script>
export default {
  name: 'ExternalLinkInline',
  props: {
    link: String,
    text: {
      type: String,
      default: ''
    }
  }
}
</script>
