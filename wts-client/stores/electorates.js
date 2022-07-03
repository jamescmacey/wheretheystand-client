import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useElectoratesStore = defineStore('electorates', {
    state () {
        return {
            items: [],
            data: {
                histories: {}
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
        historyByIdentifier: (state) => (id) => { return state.data.histories[id] }
    },
    actions: {
        async fetch(id) {
            if (!this.byIdentifier(id)) {
                const item = await $fetch(API_BASE + 'electorates/' + id + '/')
                this.items.push(item)
            }
        },
        async fetchHistory(id) {
            if (!this.historyByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'electorates/' + id + '/history/')
                this.data.histories[id] = item
            }
        }
    }
})