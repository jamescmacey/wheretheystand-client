<template>
    <div class="nav-item" v-if="isAuthorized">
        <NuxtLink :class="[$route.fullPath.startsWith('/me/') ? 'active nav-link' : 'nav-link']" to="/me/"
            active-class="active">
            <FontAwesomeIcon class="me-1" :icon="['fas', 'user-circle']">
            </FontAwesomeIcon> {{ firstName }}
        </NuxtLink>

    </div>
</template>

<style scoped>
a {
    line-height: 27px;
    color: #ffffff8c;
}

a.active {
    color: inherit;
}

a:hover {
    text-decoration: none
}
</style>

<script>
import { useAuthStore } from '../stores/auth'

export default {
    name: 'AuthStatus',
    setup() {
        const authStore = useAuthStore();
        const { isLoading, isAuthorized, username, firstName, lastName } = useAuthStatus()

        return {
            isLoading,
            isAuthorized,
            username,
            firstName,
            lastName,
            authStore
        }
    },
    watch: {
        isAuthorized(newValue, oldValue) {
            this.authStore.isAuthenticated = newValue;
            if (newValue && !oldValue) {
                this.authStore.checkAuthentication();
            }
        }
    }
}
</script>