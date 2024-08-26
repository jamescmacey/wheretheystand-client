<template>
    <Card v-if="vote">
        <div v-if="!countsOnly">
            <h6 class="text-uppercase"><strong>{{ readingOrdinal }}</strong></h6>
        <h5 class="text-uppercase">
            <span v-if="vote.motion_successful === true">
                <span class="dot-yes"></span> <strong>Passed</strong>
            </span>
            <span v-else-if="vote.motion_successful === false">
                <span class="dot-no"></span> <strong>Defeated</strong>
            </span>
        </h5>
        <h6 class="text-muted">{{ formatDate(vote.vote_date) }}</h6>
        <hr />
        </div>
        <div class="row">
            <div class="col-3 text-center">
                <h3>{{ vote.totals.ayes }}</h3>
                <h6 class="text-muted text-uppercase"><span class="dot-yes"></span> Ayes</h6>
            </div>
            <div class="col-3 text-center">
                <h3>{{ vote.totals.noes }}</h3>
                <h6 class="text-muted text-uppercase"><span class="dot-no"></span> Noes</h6>
            </div>
            <div class="col-3 text-center">
                <h3>{{ vote.totals.abstentions }}</h3>
                <h6 class="text-muted text-uppercase"><span class="dot-abstain"></span> Abst.</h6>
            </div>
            <div class="col-3 text-center">
                <h3>{{ vote.totals.absent }}</h3>
                <h6 class="text-muted text-uppercase"><span class="dot-absent"></span> Abse.</h6>
            </div>
        </div>
    </Card>
</template>

<style scoped>

</style>

<script>
import { format, parse } from 'date-fns'

export default {
    props: {
        vote: {
            type: Object
        },
        countsOnly: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        formatDate(date) {
            return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
        }
    },
    computed: {
        readingOrdinal() {
            return this.vote.reading + {1: "st reading", 2: "nd reading", 3: "rd reading"}[this.vote.reading]
        }
    }
}
</script>