<template>
  <table class="table table-striped table-bordered table-responsive-sm">
    <thead>
      <tr>
        <th v-for="(column, i) in columns" :key="i" scope="col">{{ column }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows" :key="i">
        <td v-for="(data, j) in row" :key="j">{{ data }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'Grid',
  props: {
    columns: {
      type: Array
    },
    rows: {
      type: Array
    }
  }
}
</script>

<style scoped>
</style>
