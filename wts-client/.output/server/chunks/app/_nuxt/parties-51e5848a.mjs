import { f as defineStore, u as useFetch, A as API_BASE } from '../server.mjs';

const usePartiesStore = defineStore("parties", {
  state() {
    return {
      items: [],
      data: {
        members: {},
        leaders: {}
      }
    };
  },
  getters: {
    byIdentifier: (state) => (id) => {
      if (state.items.find((item) => item.slug === id)) {
        return state.items.find((item) => item.slug === id);
      }
      return state.items.find((item) => item.id === id);
    },
    membersByIdentifier: (state) => (id) => {
      return state.data.members[id];
    },
    leadersByIdentifier: (state) => (id) => {
      return state.data.leaders[id];
    }
  },
  actions: {
    async fetch(id) {
      if (!this.byIdentifier(id)) {
        var state = this;
        await useFetch(API_BASE + "parties/" + id + "/", {
          onResponse({ request, response, options }) {
            state.items.push(response._data);
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$BZVuVggn7e");
      }
    },
    async fetchMembers(id) {
      if (!this.membersByIdentifier(id)) {
        var state = this;
        await useFetch(API_BASE + "parties/" + id + "/members/", {
          onResponse({ request, response, options }) {
            state.data.members[id] = response._data;
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$iMHkjkG8RJ");
      }
    },
    async fetchLeaders(id) {
      if (!this.leadersByIdentifier(id)) {
        var state = this;
        await useFetch(API_BASE + "parties/" + id + "/leaders/", {
          onResponse({ request, response, options }) {
            state.data.leaders[id] = response._data;
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$dksX6JlmUT");
      }
    }
  }
});

export { usePartiesStore as u };
//# sourceMappingURL=parties-51e5848a.mjs.map
