<template>
  <Card :gradient="true">
    <h5>{{ person.display_name }} votes most similarly to:</h5>
    <span v-for="entity in similarityReport.people" :key="entity.slug">
      <inline-person-text  :entity="entity" class="mr-2 mb-2"></inline-person-text>
    </span>
    <p>Voting similarity is based on the proportion of common voting positions in personal reading votes, with a minimum sample size of four votes.</p>
  </Card>
</template>

<script>
import Card from './Card.vue'
import InlinePersonText from './InlinePersonText.vue'
export default {
  name: 'VotingSimilarityDisplay',
  components: {
    Card,
    InlinePersonText
  },
  props: {
    person: Object,
    similarityReport: Object
  }
}
</script>

<style scoped>
</style>
