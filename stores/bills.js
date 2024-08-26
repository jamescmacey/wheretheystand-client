import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useBillsStore = defineStore('bills', {
    state () {
        return {
            items: []
        }
    },
    getters: {
        byID: (state) => (id) => {
            return state.items.find(bill => bill.id == id)
        }
    },
    actions: {
        async fetch(id) {
            if (!this.byID(id)) {
                var state = this
                await useFetch(API_BASE + 'bills/' + id + '/', {
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