import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useElectionsStore = defineStore('elections', {
    state () {
        return {
            items: []
        }
    },
    getters: {
        byIdentifier: (state) => (id) => {
            if (state.items.find(item => item.slug === id)) {
                return state.items.find(item => item.slug === id)
            }
            return state.items.find(item => item.id === id)
        }
    },
    actions: {
        async fetch(id) {
            if (!this.byIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'elections/' + id + '/', {
                    onResponse({ request, response, options }) {
                        state.items.push(response._data)
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
        }
    }
})