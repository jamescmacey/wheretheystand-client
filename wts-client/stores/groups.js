import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useGroupsStore = defineStore('groups', {
    state () {
        return {
            items: []
        }
    },
    getters: {
        byName: (state) => (name, type) => {
            if (state.items.find(group => (group.name === name && group.type === type))) {
              return state.items.find(group => (group.name === name && group.type === type)).items
            }
        },
    },
    actions: {
        async fetchPeople(id) {
            if (!this.byName(id, 'people')) {
                /*const group = await $fetch(API_BASE + 'people/', { params: { group: id }})
                this.items.push({
                    items: group,
                    name: id,
                    type: 'people'
                })*/

                var state = this
                await useFetch(API_BASE + 'people/?group=' + id, {
                    onResponse({ request, response, options }) {
                        state.items.push({
                            items: response._data,
                            name: id,
                            type: 'people'
                        })
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
        async fetchElectorates(id) {
            if (!this.byName(id, 'electorates')) {
                /*const group = await $fetch(API_BASE + 'electorates/', { params: { group: id }})
                this.items.push({
                    items: group,
                    name: id,
                    type: 'electorates'
                })*/

                var state = this
                await useFetch(API_BASE + 'electorates/?group=' + id, {
                    onResponse({ request, response, options }) {
                        state.items.push({
                            items: response._data,
                            name: id,
                            type: 'electorates'
                        })
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
        async fetchParties(id) {
            if (!this.byName(id, 'parties')) {
                /*const group = await $fetch(API_BASE + 'parties/', { params: { group: id }})
                this.items.push({
                    items: group,
                    name: id,
                    type: 'parties'
                })*/

                var state = this
                await useFetch(API_BASE + 'parties/?group=' + id, {
                    onResponse({ request, response, options }) {
                        state.items.push({
                            items: response._data,
                            name: id,
                            type: 'parties'
                        })
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