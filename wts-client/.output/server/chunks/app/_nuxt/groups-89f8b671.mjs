import { f as defineStore, u as useFetch, A as API_BASE } from '../server.mjs';

const useGroupsStore = defineStore("groups", {
  state() {
    return {
      items: []
    };
  },
  getters: {
    byName: (state) => (name, type) => {
      if (state.items.find((group) => group.name === name && group.type === type)) {
        return state.items.find((group) => group.name === name && group.type === type).items;
      }
    }
  },
  actions: {
    async fetchPeople(id) {
      if (!this.byName(id, "people")) {
        var state = this;
        await useFetch(API_BASE + "people/?group=" + id, {
          onResponse({ request, response, options }) {
            state.items.push({
              items: response._data,
              name: id,
              type: "people"
            });
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$WECztsiGWk");
      }
    },
    async fetchElectorates(id) {
      if (!this.byName(id, "electorates")) {
        var state = this;
        await useFetch(API_BASE + "electorates/?group=" + id, {
          onResponse({ request, response, options }) {
            state.items.push({
              items: response._data,
              name: id,
              type: "electorates"
            });
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$UVY6HA42YU");
      }
    },
    async fetchParties(id) {
      if (!this.byName(id, "parties")) {
        var state = this;
        await useFetch(API_BASE + "parties/?group=" + id, {
          onResponse({ request, response, options }) {
            state.items.push({
              items: response._data,
              name: id,
              type: "parties"
            });
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$qZbGGh9SII");
      }
    }
  }
});

export { useGroupsStore as u };
//# sourceMappingURL=groups-89f8b671.mjs.map
