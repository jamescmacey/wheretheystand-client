import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const usePeopleStore = defineStore('people', {
    state () {
        return {
            items: [],
            data: {
                votes: {},
                bills: {},
                interests: {},
                mpExpenses: {},
                execExpenses: {},
                returns: {},
                votingSimilarity: {},
                details: {}
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
        votesByIdentifier: (state) => (id) => { return state.data.votes[id] },
        billsByIdentifier: (state) => (id) => { return state.data.bills[id] },
        interestsByIdentifier: (state) => (id) => { return state.data.interests[id] },
        mpExpensesByIdentifier: (state) => (id) => { return state.data.mpExpenses[id] },
        execExpensesByIdentifier: (state) => (id) => { return state.data.execExpenses[id] },
        returnsByIdentifier: (state) => (id) => { return state.data.returns[id] },
        votingSimilarityByIdentifier: (state) => (id) => { return state.data.votingSimilarity[id] },
        detailsByIdentifier: (state) => (id) => { return state.data.details[id] },
    },
    actions: {
        async fetch(id) {
            if (!this.byIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/')
                this.items.push(item)
            }
        },
        async fetchVotes(id) {
            if (!this.votesByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/votes/')
                this.data.votes[id] = item
            }
        },
        async fetchBills(id) {
            if (!this.billsByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/bills/')
                this.data.bills[id] = item
            }
        },
        async fetchInterests(id) {
            if (!this.interestsByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/interests/')
                this.data.interests[id] = item
            }
        },
        async fetchMpExpenses(id) {
            if (!this.mpExpensesByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/mp-expenses/')
                this.data.mpExpenses[id] = item
            }
        },
        async fetchExecExpenses(id) {
            if (!this.execExpensesByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/exec-expenses/')
                this.data.execExpenses[id] = item
            }
        },
        async fetchReturns(id) {
            if (!this.returnsByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/returns/')
                this.data.returns[id] = item
            }
        },
        async fetchVotingSimilarity(id) {
            if (!this.votingSimilarityByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/voting-similarity/')
                this.data.votingSimilarity[id] = item
            }
        },
        async fetchDetails(id) {
            if (!this.detailsByIdentifier(id)) {
                const item = await $fetch(API_BASE + 'people/' + id + '/details/')
                this.data.details[id] = item
            }
        }
    }
})