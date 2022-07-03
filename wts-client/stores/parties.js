import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const usePartiesStore = defineStore('parties', {
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
                const item = await $fetch(API_BASE + 'parties/' + id + '/')
                this.items.push(item)
            }
        }
    }
})