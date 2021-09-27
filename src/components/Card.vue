<template>
  <div class="wts-card" :class="{'wts-card-missing': missing}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    missing: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.wts-card {
  margin: 10px 0px;
  padding: 15px 15px;
  background-color: var(--wts-card-bg);
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
}

.wts-card.wts-card-missing {
  background-color: transparent;
  border-radius: var(--wts-card-border-radius);
  border-style: dashed;
  border-color: var(--wts-secondary);
  box-shadow: none;
}

.wts-card a.no-format {
  padding: 0;
}
</style>
