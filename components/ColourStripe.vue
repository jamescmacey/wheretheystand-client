<template>
    <div id="stripe" :style="{ backgroundImage: gradient }">
    </div>
</template>

<script>
import { Harmonizer } from 'color-harmony'

export default {

  name: 'ColourStripe',
  props: {
    colour: String,
    secondaryColour: String
  },
  computed: {
    harmony: function () {
      var harmonizer = new Harmonizer()

      if (!this.colour) {
        return ['#58787f', 'rgb(52, 148, 148)']
      }

      if (this.secondaryColour) {
        return [this.colour, this.secondaryColour]
      }

      return harmonizer.harmonize(this.colour, 'neutral')
    },
    gradient: function () {
      return `linear-gradient(230deg, ${this.harmony[1]} 0%, ${this.harmony[0]} 50%)`
    }
  }
}
</script>

<style scoped>

#stripe:empty {
  height: 1.25em;
  line-height: 1.25;
}
</style>
