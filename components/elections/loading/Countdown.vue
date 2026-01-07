<template>
    <div class="flex flex-col h-full w-full bg-accented flex-grow items-center justify-center px-4 overflow-hidden">
        <div class="relative w-full max-w-lg">
            <div class="absolute top-0 -left-4 w-72 h-72 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob"
                :class="blobClassBlue">
            </div>
            <div class="absolute -bottom-2 -left-15 w-32 h-32 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-3000"
                :class="blobClassPink">
            </div>
            <div class="absolute top-0 -right-4 w-72 h-72 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
                :class="blobClassRed">
            </div>
            <div class="absolute -bottom-8 left-20 w-72 h-72 rounded-full delay-1000 duration-1000 transition-colors light:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
                :class="blobClassGreen">
            </div>
            <div class="mx-0 lg:m-8 my-8 relative text-left">
                <div class="grid gap-8 items-start justify-center">
                    <div class="relative group">
                        <UCard class="transition-opacity duration-500 relative"
                            :class="{ 'opacity-0': (canShowColour && (stage == 'countdown')) }">
                            <div v-if="stage == 'countdown'">
                                <h1 class="text-2xl lg:text-4xl">{{ election.name }}</h1>
                                <p class="text-md mt-4 mb-2 text-left">Voting closes at {{
                                    formatDateTime(election.polls_close) }}. Results will then be made available here as they are
                                    released by
                                    the Electoral Commission.</p>
                                    <UCard variant="soft" class="mt-4">
                                        <h4
                                            class="text-lg lg:text-xl font-bold text-left">Voting closes in:</h4>
                                        <h1 class="text-3xl lg:text-4xl font-mono text-justify">{{ remainingTime }}</h1>
                                    </UCard>
                            </div>
                            <div v-if="stage == 'loading'">
                                <h5 class="text-lg mb-1 text-left font-brand font-bold">Awaiting data:</h5>
                                <h6 class="text-md mt-1 mb-1 text-left font-brand font-bold">{{ election.name }}</h6>
                            </div>
                        </UCard>
                    </div>
                </div>



            </div>
        </div>
    </div>
</template>

<script>
export default {
    setup() {
        var countdownInterval = ref(null)
        var remainingTime = ref("--h --m --s")
        var canShowColour = ref(false)
        var remainingSeconds = ref(100)
        var stage = ref('countdown')

        return { remainingTime, countdownInterval, canShowColour, remainingSeconds, stage };
    },
    emits: ['polls_closed'],
    props: {
        election: {
            type: Object,
            required: true
        }
    },
    computed: {
        blobClassBlue() {
            return {
                'bg-theme1': !this.canShowColour,
                'bg-blue-400': this.canShowColour
            }
        },
        blobClassRed() {
            return {
                'bg-theme1': !this.canShowColour,
                'bg-red-400': this.canShowColour
            }
        },
        blobClassPink() {
            return {
                'bg-theme1': !this.canShowColour,
                'bg-pink-400': this.canShowColour
            }
        },
        blobClassGreen() {
            return {
                'bg-theme1': !this.canShowColour,
                'bg-green-400': this.canShowColour
            }
        }
    },
    mounted() {
        var secs = Math.floor((new Date(this.election.polls_close) - new Date()) / 1000)
        this.remainingSeconds = secs
        if (secs > 0) {
            this.countdownInterval = setInterval(function () {
                var secs = Math.floor((new Date(this.election.polls_close) - new Date()) / 1000)
                this.remainingSeconds = secs
                if (secs >= 216000) {
                    this.remainingTime = Math.floor(secs / 86400) + 'd ' + Math.floor((secs % 86400) / 3600) + 'h ' + Math.floor((secs % 3600) / 60) + 'm ' + (secs % 60) + 's';
                } else if (secs >= 3600) {
                    this.remainingTime = Math.floor(secs / 3600) + 'h ' + Math.floor((secs % 3600) / 60) + 'm ' + (secs % 60) + 's';
                } else if (secs >= 60) {
                    this.remainingTime = Math.floor(secs / 60) + 'm ' + (secs % 60) + 's';
                } else {
                    this.remainingTime = secs + 's';
                }

                if (secs <= 0) {
                    this.remainingTime = "Polls closed."
                    this.canShowColour = true
                    if (secs <= -2) {
                        this.stage = 'loading'
                        clearInterval(this.countdownInterval);
                        this.$emit('polls_closed');
                    }
                }
            }.bind(this), 1000);
        } else {
            this.remainingTime = "Polls closed."
            this.stage = 'loading'
            this.canShowColour = true
            this.$emit('polls_closed');
        }
    },
    methods: {
        formatDateTime(date) {
            const d = new Date(date);
            // Get hours in 12-hour format and minutes with leading zero
            let hours = d.getHours();
            const minutes = d.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            // Format: 7.00 pm on 1 January 2025
            const day = d.getDate();
            const month = d.toLocaleString('en-NZ', { month: 'long' });
            const year = d.getFullYear();
            return `${hours}.${minutes} ${ampm} on ${day} ${month} ${year}`;
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