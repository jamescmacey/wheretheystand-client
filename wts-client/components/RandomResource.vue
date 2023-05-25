<template>
    <a v-on:click="randomise()" href="#">
        Or, go to a random page <FontAwesomeIcon v-if="!loading" :icon="['fas','arrow-right']"></FontAwesomeIcon><Spinner class="ms-1" v-if="loading"></Spinner>
    </a>
</template>

<style scoped>
a {
    text-decoration: none;
    color: inherit;
}

a:hover {
    text-decoration: underline
}


</style>

<script>
import { API_BASE } from '~~/stores/config';


export default {
    name: 'RandomResource',
    data () {
        return {
            loading: false
        }
    },
    methods: {
        async randomise() {
            if (this.loading) {
                return
            }

            this.loading = true
            var url = API_BASE + "client/random/"
            var to = await $fetch(url)
            await navigateTo(to.to)

            return
        }
    }
}

</script>