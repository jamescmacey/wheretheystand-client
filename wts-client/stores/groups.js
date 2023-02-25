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
                const group = await $fetch(API_BASE + 'people/', { params: { group: id }})
                this.items.push({
                    items: group,
                    name: id,
                    type: 'people'
                })
            }
        },
        async fetchElectorates(id) {
            if (!this.byName(id, 'electorates')) {
                const group = await $fetch(API_BASE + 'electorates/', { params: { group: id }})
                this.items.push({
                    items: group,
                    name: id,
                    type: 'electorates'
                })
            }
        },
        async fetchParties(id) {
            if (!this.byName(id, 'parties')) {
                const group = await $fetch(API_BASE + 'parties/', { params: { group: id }})
                this.items.push({
                    items: group,
                    name: id,
                    type: 'parties'
                })
            }
        }
    }
})