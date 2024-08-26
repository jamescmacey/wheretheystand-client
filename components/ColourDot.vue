<template>
    <span class="party-dot me-2" :style="{ backgroundColor: sanitisedColour }"></span>
</template>

<script>
export default {
  name: 'ColourDot',
  props: ['colour'],
  computed: {
    sanitisedColour () {
      if (this.colour.startsWith('#')) {
        return this.colour
      } else {
        return '#' + this.colour
      }
    }
  }
}
</script>

<style scoped>
span.party-dot {
    height: 0.8em;
    width: 0.8em;
    border-radius: 50%;
    display: inline-block;
    margin-right: 2px;
}
</style>
