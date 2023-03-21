import { defineStore } from 'pinia'
import { API_BASE } from './config'
import { useNotificationsStore } from './notifications'

export const usePeopleStore = defineStore('people', {
    state() {
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
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/', {
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
        async fetchVotes(id) {
            if (!this.votesByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/votes/', {
                    onResponse({ request, response, options }) {
                        state.data.votes[id] = response._data
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
        async fetchBills(id) {
            if (!this.billsByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/bills/', {
                    onResponse({ request, response, options }) {
                        state.data.bills[id] = response._data
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
        async fetchInterests(id) {
            if (!this.interestsByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/interests/', {
                    onResponse({ request, response, options }) {
                        state.data.interests[id] = response._data
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
        async fetchMpExpenses(id) {
            if (!this.mpExpensesByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/mp-expenses/', {
                    onResponse({ request, response, options }) {
                        state.data.mpExpenses[id] = response._data
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
        async fetchExecExpenses(id) {
            if (!this.execExpensesByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/exec-expenses/', {
                    onResponse({ request, response, options }) {
                        state.data.execExpenses[id] = response._data
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
        async fetchReturns(id) {
            if (!this.returnsByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/returns/', {
                    onResponse({ request, response, options }) {
                        state.data.returns[id] = response._data
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
        async fetchVotingSimilarity(id) {
            if (!this.votingSimilarityByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/voting-similarity/', {
                    onResponse({ request, response, options }) {
                        state.data.votingSimilarity[id] = response._data
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
        async fetchDetails(id) {
            if (!this.detailsByIdentifier(id)) {
                var state = this
                await useFetch(API_BASE + 'people/' + id + '/details/', {
                    onResponse({ request, response, options }) {
                        state.data.details[id] = response._data
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