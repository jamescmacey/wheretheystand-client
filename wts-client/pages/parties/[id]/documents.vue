<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <h4>Documents</h4>
      </div>
    </div>
  </div>
</template>

<script>
import { usePartiesStore } from '../../../stores/parties'

export default {
  name: 'PartyDocuments',
  setup() {
    const partiesStore = usePartiesStore()

    return { partiesStore }
  },
  created () {
  },
  methods: {
    formatCurrency (amount) {
      var formatter = new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD'
      })
      if (amount != null) {
        return formatter.format(amount)
      } else {
        return '-'
      }
    }
  },
  computed: {
    party () {
      return this.partiesStore.byIdentifier(this.$route.params.id)
    },
  }
}
</script>

<style scoped>

</style>
