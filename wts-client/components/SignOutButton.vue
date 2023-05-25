<template>
    <div  v-if="isAuthorized" class="container-fluid" style="background-color: rgb(52, 148, 148)">
        <div class="container py-2">
                <a class="back-link" href="#" @click="signOut()">
                    <FontAwesomeIcon :icon="['fas', 'arrow-left']"></FontAwesomeIcon> Sign out
                </a>
        </div>
    </div>
</template>

<style scoped>
.back-link {
    color: white
}
</style>

<script>
import { PassageUser } from '@passageidentity/passage-elements/passage-user'

export default {
    name: 'SignOutButton',
    setup() {
        const { isLoading, isAuthorized, username, firstName, lastName } = useAuthStatus()
        return {
            isLoading,
            isAuthorized,
            username,
            firstName,
            lastName,
        }
    },
    methods: {
        async signOut() {
            const user = new PassageUser()
            const signedOut = await user.signOut()
            if (signedOut) {
                navigateTo("/")
            }

        }
    }
}
</script>