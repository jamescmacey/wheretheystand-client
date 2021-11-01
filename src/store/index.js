import { createStore } from 'vuex'
const axios = require('axios').default
const server = 'http://localhost:8000'

export default createStore({
  state: {
    notifications: [],
    people: [],
    peopleData: {
      votes: {},
      bills: {},
      interests: {},
      mpExpenses: {},
      execExpenses: {},
      returns: {},
      votingSimilarity: {},
      details: {}
    },
    bills: [],
    votes: [],
    electorates: [],
    parties: [],
    parliaments: []
  },
  mutations: {
    ADD_PERSON (state, obj) {
      state.people.push(obj)
    },
    ADD_BILL (state, obj) {
      state.bills.push(obj)
    },
    ADD_VOTE (state, obj) {
      state.votes.push(obj)
    },
    ADD_ELECTORATE (state, obj) {
      state.electorates.push(obj)
    },
    ADD_PARTY (state, obj) {
      state.parties.push(obj)
    },
    ADD_PARLIAMENT (state, obj) {
      state.parliaments.push(obj)
    },
    SET_PERSON_VOTES (state, payload) {
      state.peopleData.votes[payload.identifier] = payload.data
    },
    SET_PERSON_BILLS (state, payload) {
      state.peopleData.bills[payload.identifier] = payload.data
    },
    SET_PERSON_INTERESTS (state, payload) {
      state.peopleData.interests[payload.identifier] = payload.data
    },
    SET_PERSON_MP_EXPENSES (state, payload) {
      state.peopleData.mpExpenses[payload.identifier] = payload.data
    },
    SET_PERSON_EXEC_EXPENSES (state, payload) {
      state.peopleData.execExpenses[payload.identifier] = payload.data
    },
    SET_PERSON_RETURNS (state, payload) {
      state.peopleData.returns[payload.identifier] = payload.data
    },
    SET_PERSON_VOTING_SIMILARITY (state, payload) {
      state.peopleData.votingSimilarity[payload.identifier] = payload.data
    },
    SET_PERSON_DETAILS (state, payload) {
      state.peopleData.details[payload.identifier] = payload.data
    }
  },
  actions: {
    fetchPerson ({ commit, getters }, payload) {
      if (!getters.personByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier)
          .then(function (response) {
            commit('ADD_PERSON', response.data)
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonVotes ({ commit, getters }, payload) {
      if (!getters.personVotesByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/votes')
          .then(function (response) {
            commit('SET_PERSON_VOTES', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonBills ({ commit, getters }, payload) {
      if (!getters.personBillsByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/bills')
          .then(function (response) {
            commit('SET_PERSON_BILLS', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonInterests ({ commit, getters }, payload) {
      if (!getters.personInterestsByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/interests')
          .then(function (response) {
            commit('SET_PERSON_INTERESTS', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonExecExpenses ({ commit, getters }, payload) {
      if (!getters.personExecExpensesByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/exec-expenses')
          .then(function (response) {
            commit('SET_PERSON_EXEC_EXPENSES', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonMpExpenses ({ commit, getters }, payload) {
      if (!getters.personMpExpensesByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/mp-expenses')
          .then(function (response) {
            commit('SET_PERSON_MP_EXPENSES', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonReturns ({ commit, getters }, payload) {
      if (!getters.personReturnsByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/returns')
          .then(function (response) {
            commit('SET_PERSON_RETURNS', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonDetails ({ commit, getters }, payload) {
      if (!getters.personDetailsByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/details')
          .then(function (response) {
            commit('SET_PERSON_DETAILS', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonVotingSimilarity ({ commit, getters }, payload) {
      if (!getters.personVotingSimilarityByIdentifier(payload.identifier)) {
        axios.get(server + '/api/people/' + payload.identifier + '/voting-similarity')
          .then(function (response) {
            commit('SET_PERSON_VOTING_SIMILARITY', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchBill ({ commit, getters }, payload) {
      if (!getters.billByID(payload.id)) {
        axios.get(server + '/api/bills/' + payload.id)
          .then(function (response) {
            commit('ADD_BILL', response.data)
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    }
  },
  modules: {
  },
  getters: {
    personByIdentifier: (state) => (id) => {
      console.log(state.people.find(person => person.slug === id))
      if (state.people.find(person => person.slug === id)) {
        return state.people.find(person => person.slug === id)
      }
      return state.people.find(person => person.id === id)
    },
    personVotesByIdentifier: (state) => (id) => {
      return state.peopleData.votes[id]
    },
    personDetailsByIdentifier: (state) => (id) => {
      return state.peopleData.details[id]
    },
    personBillsByIdentifier: (state) => (id) => {
      return state.peopleData.bills[id]
    },
    personInterestsByIdentifier: (state) => (id) => {
      return state.peopleData.interests[id]
    },
    personMpExpensesByIdentifier: (state) => (id) => {
      return state.peopleData.mpExpenses[id]
    },
    personExecExpensesByIdentifier: (state) => (id) => {
      return state.peopleData.execExpenses[id]
    },
    personReturnsByIdentifier: (state) => (id) => {
      return state.peopleData.returns[id]
    },
    personVotingSimilarityByIdentifier: (state) => (id) => {
      return state.peopleData.votingSimilarity[id]
    },
    billByID: (state) => (id) => {
      return state.bills.find(bill => bill.id === id)
    }
  }
})
