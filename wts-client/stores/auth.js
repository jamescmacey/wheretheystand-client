import { defineStore } from 'pinia'
import { API_BASE } from './config'
import { PassageUser } from '@passageidentity/passage-elements/passage-user'

export const useAuthStore = defineStore('authentication', {
    state () {
        return {
            isAuthenticated: false,
            didCheckAuthentication: false,
            userType: "guest",
            requiresSession: false,
            sessionLink: null
        }
    },
    getters: {
    },
    actions: {
        async checkAuthentication() {
            if (!this.didCheckAuthentication) {
                const user = new PassageUser()
                const userAuthToken = await user.getAuthToken()
                var state = this
                await useFetch(API_BASE + 'auth/psg-auth/',
                {
                    headers: {
                        Authorization: `Bearer ${userAuthToken}`,
                    },
                    onResponse({ request, response, options }) {
                        state.userType = response._data.user_type
                        state.requiresSession = response._data.requires_session
                        state.didCheckAuthentication = true
                    },
                    onResponseError({ request, response, options }) {
                        const store = useNotificationsStore()
                        store.postResponseError(response)
                    },
                    onRequestError({ request, options, error }) {
                        const store = useNotificationsStore()
                        store.addToast('Error fetching resource (request)', error)
                    }
                })
            }
        },
        async getSessionLink() {
            const user = new PassageUser()
            const userAuthToken = await user.getAuthToken()
            const data = await $fetch(API_BASE + 'auth/session/',
            {
                headers: {
                    Authorization: `Bearer ${userAuthToken}`,
                }
            })
            return API_BASE + 'auth/initiate/' + data.id + '/' + data.token + '/'

        }
    }
})