import { createStore } from 'vuex'
const axios = require('axios').default

export default createStore({
  state: {
    notifications: [],
    people: [],
    peopleData: {
      votes: {},
      bills: {}
    }
  },
  mutations: {
    ADD_PERSON (state, person) {
      state.people.push(person)
    },
    SET_PERSON_VOTES (state, payload) {
      state.peopleData.votes[payload.identifier] = payload.data
    },
    SET_PERSON_BILLS (state, payload) {
      state.peopleData.bills[payload.identifier] = payload.data
    }
  },
  actions: {
    fetchPerson ({ commit, getters }, payload) {
      if (!getters.personByIdentifier(payload.identifier)) {
        axios.get('http://0.0.0.0:8000/api/people/' + payload.identifier)
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
        axios.get('http://0.0.0.0:8000/api/people/' + payload.identifier + '/votes')
          .then(function (response) {
            commit('SET_PERSON_VOTES', { identifier: payload.identifier, data: response.data })
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    fetchPersonBills ({ commit, getters }, payload) {
      if (!getters.personVotesByIdentifier(payload.identifier)) {
        axios.get('http://0.0.0.0:8000/api/people/' + payload.identifier + '/bills')
          .then(function (response) {
            commit('SET_PERSON_BILLS', { identifier: payload.identifier, data: response.data })
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
    }
  }
})
