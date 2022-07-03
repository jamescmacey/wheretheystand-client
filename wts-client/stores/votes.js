import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useVotesStore = defineStore('votes', {
    state () {
        return {
            items: []
        }
    },
    getters: {
        byID: (state) => (id) => {
            return state.items.find(vote => vote.id.toString() === id)
        }
    },
    actions: {
        async fetch(id) {
            if (!this.byID(id)) {
                const vote = await $fetch(API_BASE + 'votes/' + id + '/')
                this.items.push(vote)
            }
        }
    }
})