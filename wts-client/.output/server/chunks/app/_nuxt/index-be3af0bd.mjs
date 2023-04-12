import { _ as __nuxt_component_0 } from './PageHeader-03254b16.mjs';
import { _ as _export_sfc, a as __nuxt_component_2 } from '../server.mjs';
import { _ as __nuxt_component_10 } from './PersonList-acac1d7d.mjs';
import { u as useGroupsStore } from './groups-89f8b671.mjs';
import { mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import 'color-harmony';
import 'date-fns';
import 'ofetch';
import 'hookable';
import 'unctx';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';
import 'h3';
import 'ufo';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/free-brands-svg-icons';
import '@fortawesome/vue-fontawesome';
import 'humps';
import 'ohash';
import 'defu';
import '../../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'node:http';
import 'node:https';
import 'destr';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'unstorage';
import 'radix3';
import 'node:fs';
import 'node:url';
import 'pathe';
import './ColourDot-2c5d3e0d.mjs';

const _sfc_main = {
  name: "People",
  setup() {
    const groupsStore = useGroupsStore();
    return { groupsStore };
  },
  data() {
    return {
      filterName: "incumbent"
    };
  },
  created() {
    this.groupsStore.fetchPeople("allLive");
  },
  computed: {
    filter() {
      switch (this.filterName) {
        case "all":
          return ["current", "provisional", "former", "generic"];
        case "incumbent":
          return ["current", "provisional"];
        case "former":
          return ["former"];
        default:
          return [];
      }
    },
    people() {
      return (this.groupsStore.byName("allLive", "people") || []).sort((a, b) => {
        if (a.last_name.toLowerCase() < b.last_name.toLowerCase()) {
          return -1;
        }
        return 1;
      }).filter((person) => {
        if (this.filter.indexOf(person.membership_status) >= 0) {
          return true;
        }
      });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_Card = __nuxt_component_2;
  const _component_PersonList = __nuxt_component_10;
  _push(`<div${ssrRenderAttrs(mergeProps({ id: "people" }, _attrs))} data-v-15be0d24>`);
  _push(ssrRenderComponent(_component_PageHeader, {
    pageTitle: "People",
    class: "mb-3",
    pageSubtitle: "Current and Former Members of Parliament"
  }, null, _parent));
  _push(`<div class="container" data-v-15be0d24><div class="row" data-v-15be0d24><select class="form-select col-12 mb-3" aria-label="Filter list of people" data-v-15be0d24><option selected value="incumbent" data-v-15be0d24>Current MPs</option><option value="all" data-v-15be0d24>All people</option><option value="former" data-v-15be0d24>Former MPs</option></select></div><div class="row" data-v-15be0d24><h4 class="col-12" data-v-15be0d24>All MPs</h4><div class="col-12" data-v-15be0d24>`);
  _push(ssrRenderComponent(_component_Card, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PersonList, { people: $options.people }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PersonList, { people: $options.people }, null, 8, ["people"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/people/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-15be0d24"]]);

export { index as default };
//# sourceMappingURL=index-be3af0bd.mjs.map
