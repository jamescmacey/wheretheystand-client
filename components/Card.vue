<template>
  <div class="wts-card" :class="{'wts-card-missing': missing, 'wts-card-gradient': gradient, 'wts-card-frosted': frosted}">
    <div class="padding-div">
      <slot></slot>
    </div>
    <ColourStripe v-if="stripeColour" :colour="stripeColour">
    
    </ColourStripe>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    missing: {
      type: Boolean,
      default: false
    },
    gradient: {
      type: Boolean,
      default: false
    },
    frosted: {
      type: Boolean,
      default: false
    },
    stripeColour: String
  }
}
</script>

<style scoped>
.wts-card {
  margin: 10px 0px;
  background-color: var(--wts-card-bg);
  border-radius: var(--wts-card-border-radius);
  box-shadow: var(--wts-card-box-shadow);
}

.padding-div {
  padding: 15px 15px;
}

.wts-card.wts-card-missing {
  background-color: transparent;
  border-radius: var(--wts-card-border-radius);
  border-style: dashed;
  border-color: var(--wts-secondary);
  box-shadow: none;
}

.wts-card.wts-card-gradient {
  border-radius: var(--wts-card-border-radius);
  background-color: transparent;
  background-image: linear-gradient(90deg, #ffffff36, #ffffff36), linear-gradient(145deg, rgb(52, 148, 148), rgb(88, 120, 127) 100%);
  color: white;
}

.wts-card.wts-card-frosted {
  /*background-color: rgba(171, 171, 171, 0.15);  */
  background-image: linear-gradient(145deg, rgba(52, 148, 148, 0.35), rgba(88, 120, 127, 0.35) 100%);
  backdrop-filter: blur(5px);
}

.wts-card a.no-format {
  padding: 0;
}
</style>
