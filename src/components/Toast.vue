<template>

  <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <p>toast</p>
    <div class="toast-header">
      <strong class="mr-auto">{{ toast.title }}</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close" v-on:click="deleteToast">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  props: ['toast'],
  methods: {
    deleteToast () {
      this.$store.dispatch('deleteToast', { toast: this.toast })
    }
  }
}
</script>

<style scoped>
.toast {
  z-index: -1
}
</style>
