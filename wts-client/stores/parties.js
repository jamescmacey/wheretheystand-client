import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const usePartiesStore = defineStore('parties', {
    state () {
        return {
            items: [],
            data: {
                members: {},
                leaders: {},
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
        membersByIdentifier: (state) => (id) => { return state.data.members[id] },
        leadersByIdentifier: (state) => (id) => { return state.data.leaders[id] },
    },
    actions: {
        async fetch(id) {
            if (!this.byIdentifier(id)) {
                const item = await $fetch(API_BASE + 'parties/' + id + '/')
                this.items.push(item)
            }
        },
        async fetchMembers(id) {
            if (!this.membersByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'parties/' + id + '/members/')
                this.data.members[id] = item
            }
        },
        async fetchLeaders(id) {
            if (!this.leadersByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'parties/' + id + '/leaders/')
                this.data.leaders[id] = item
            }
        },
    }
})