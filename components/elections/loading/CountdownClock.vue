<template>
    <span>{{ remainingTime }}</span>
</template>

<script>
export default {
    setup() {
        const dayjs = useDayjs()
        var countdownInterval = ref(null)
        var remainingTime = ref("--h --m --s")
        var remainingSeconds = ref(100)

        //var goLive = dayjs(event.embargo_end ?? "2023-10-06T01:30:00+13:00")
        var goLive = dayjs("2025-08-06T01:30:00+12:00")

        return { dayjs, goLive, remainingTime, countdownInterval, remainingSeconds };
    },
    props: {
        datetime: {
            type: String,
            required: true
        }
    },
    mounted() {
        //var secs = this.dayjs(this.event.embargo_end).diff(this.dayjs(), 'second')
        this.goLive = this.dayjs(this.datetime)
        var secs = this.goLive.diff(this.dayjs(), 'second')
        this.remainingSeconds = secs
        if (secs > 0) {
            this.countdownInterval = setInterval(function () {
                //var secs = this.dayjs(this.event.embargo_end).diff(this.dayjs(), 'second')
                var secs = this.goLive.diff(this.dayjs(), 'second')
                this.remainingSeconds = secs
                if (secs >= 216000) {
                    this.remainingTime = this.dayjs.duration(secs, 'seconds').format('DD[d] HH[h] mm[m] ss[s]');
                } else if (secs >= 3600) {
                    this.remainingTime = this.dayjs.duration(secs, 'seconds').format('HH[h] mm[m] ss[s]');
                } else if (secs >= 60) {
                    this.remainingTime = this.dayjs.duration(secs, 'seconds').format('mm[m] ss[s]');
                } else {
                    this.remainingTime = this.dayjs.duration(secs, 'seconds').format('ss[s]');
                }

                if (secs <= 0) {
                    this.remainingTime = "Polls closed."
                    if (secs <= -2) {
                        clearInterval(this.countdownInterval);
                    }
                }
            }.bind(this), 1000);
        } else {
            this.remainingTime = "Polls closed."
        }
    },
    beforeUnmount() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }
        this.countdownInterval = null
    }
}
</script>