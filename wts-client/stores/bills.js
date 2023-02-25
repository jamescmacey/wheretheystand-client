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
                const bill = await $fetch(API_BASE + 'bills/' + id + '/')
                this.items.push(bill)
            }
        }
    }
})