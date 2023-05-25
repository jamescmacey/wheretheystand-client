<template>
    <div v-for="banner in notificationsStore.banners" :key="banner.id">
        <div class="jumbotron jumbotron-fluid py-3">
            <div class="container text-center">
                <div class="row">
                    <div v-if="banner.link_behaviour === 'new'">
                        <a :href="banner.link" target="_blank">
                            <strong v-if="banner.title">{{ banner.title }}: </strong>{{ banner.message }}
                            <font-awesome-icon class="ms-2" :icon="['fas', 'external-link-alt']"></font-awesome-icon>
                        </a>
                        <button type="button" v-if="!banner.is_persistent" @click="closeBanner(banner.id)" class="btn ms-4 btn-sm btn-outline-light text-uppercase">Dismiss</button>
                    </div>
                    <div class="basic-banner" v-else-if="banner.link_behaviour === 'none'">
                            <strong v-if="banner.title">{{ banner.title }}: </strong>{{ banner.message }}
                        <button type="button" v-if="!banner.is_persistent" @click="closeBanner(banner.id)" class="btn ms-2 btn-sm btn-outline-light text-uppercase">Dismiss</button>
                    </div>
                    <div v-else-if="banner.link_behaviour === 'same'">
                        <a :href="banner.link" v-if="banner.link_type === 'external'">
                            <strong v-if="banner.title">{{ banner.title }}: </strong>{{ banner.message }}
                            <font-awesome-icon class="ms-2" :icon="['fas', 'external-link-alt']"></font-awesome-icon>
                        </a>
                        <NuxtLink :to="banner.link" v-else-if="banner.link_type === 'internal'">
                            <strong v-if="banner.title">{{ banner.title }}: </strong>{{ banner.message }}
                        </NuxtLink>
                        <button type="button" v-if="!banner.is_persistent" @click="closeBanner(banner.id)" class="btn ms-4 btn-sm btn-outline-light text-uppercase">Dismiss</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.jumbotron {
    background-color: rgb(52, 148, 148);
    background-size: cover;
    margin-bottom: 0px;
}

button {
    border-radius: 0px;
}

a {
    color: white;
    text-decoration: none;
}

.basic-banner {
    color: white;
}
</style>

<script>
import { useNotificationsStore } from '../stores/notifications'


export default {
    name: 'Banners',
    setup() {
        const notificationsStore = useNotificationsStore()
        return { notificationsStore }
    },
    methods: {
        closeBanner(id) {
            this.notificationsStore.closeBanner(id)
        }
    },
    created () {
        this.notificationsStore.fetchNotifications()
    },
}

</script>