<template>
    <span class="inline-entity">
      <span v-if="entity.colour" class="party-dot" :style="{ backgroundColor: entity.colour }"></span>
      {{ entity.display_name }}
    </span>
</template>

<script>
export default {
  name: 'InlinePersonText',
  props: ['entity']
}
</script>

<style scoped>
.inline-entity {
    background-color: rgba(161, 213, 237, 0.3);
    padding: 0px 3px;
    border-radius: 2px;
    display: inline-block;
    cursor: pointer;
}

span.party-dot {
    height: 0.8em;
    width: 0.8em;
    border-radius: 50%;
    display: inline-block;
    margin-right: 2px;
}

</style>
