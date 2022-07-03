<template>
    <Card>
        <h6 class="text-uppercase"><strong>{{ readingOrdinal }}</strong></h6>
        <h5 class="text-uppercase">
            <span v-if="passed === true">
                <span class="dot-yes"></span> <strong>Passed</strong>
            </span>
            <span v-else-if="passed === false">
                <span class="dot-no"></span> <strong>Defeated</strong>
            </span>
        </h5>
        <h6 class="text-muted">{{ formatDate(date) }}</h6>
        <hr />
        <h6 class="text-muted text-center">
            WhereTheyStand has no totals for this vote. <a href="#">Learn more.</a>
        </h6>
    </Card>
</template>

<style scoped>
</style>

<script>
import { format, parse } from 'date-fns'

export default {
    props: ['reading', 'date', 'passed'],
    methods: {
        formatDate(date) {
            return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
        }
    },
    computed: {
        readingOrdinal() {
            return this.reading + { 1: "st reading", 2: "nd reading", 3: "rd reading" }[this.reading]
        }
    }
}
</script>