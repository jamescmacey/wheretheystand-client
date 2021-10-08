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
      interests: {}
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
    personBillsByIdentifier: (state) => (id) => {
      return state.peopleData.bills[id]
    },
    personInterestsByIdentifier: (state) => (id) => {
      return state.peopleData.interests[id]
    },
    billByID: (state) => (id) => {
      return state.bills.find(bill => bill.id === id)
    }
  }
})
