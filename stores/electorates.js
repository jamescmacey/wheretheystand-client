import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useElectoratesStore = defineStore('electorates', {
    state () {
        return {
            items: [],
            data: {
                histories: {},
                shapes: {}
            }
        }
    },
    getters: {
        byIdentifier: (state) => (id) => {
            if (state.items.find(item => item.slug === id)) {
                return state.items.find(item => item.slug === id)
            }
            return state.items.find(item => item.id === id)
        },
        historyByIdentifier: (state) => (id) => { return state.data.histories[id] },
        shapeByIdentifier: (state) => (id) => { return state.data.shapes[id] }
    },
    actions: {
        async fetch(id) {
            if (!this.byIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'electorates/' + id + '/', {
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
        },
        async fetchHistory(id) {
            if (!this.historyByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'electorates/' + id + '/history/', {
                    onResponse({ request, response, options }) {
                        state.data.histories[id] = response._data
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
        async fetchShape(id) {
            if (!this.shapeByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'electorates/' + id + '/shape/', {
                    onResponse({ request, response, options }) {
                        state.data.shapes[id] = response._data
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