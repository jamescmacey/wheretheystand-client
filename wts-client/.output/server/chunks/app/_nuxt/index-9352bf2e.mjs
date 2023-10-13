import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as __nuxt_component_0$1 } from './ExternalLinkButton-63123942.mjs';
import { _ as _export_sfc, a as __nuxt_component_2$1 } from '../server.mjs';
import { useSSRContext, resolveComponent, mergeProps, withCtx, createVNode, toDisplayString } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useGroupsStore } from './groups-56457b1a.mjs';
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
import '@passageidentity/passage-elements/passage-user';
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

const _sfc_main$1 = {
  name: "ElectorateCard",
  components: {
    Card: __nuxt_component_2$1
  },
  props: {
    electorate: Object
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_Card = __nuxt_component_2$1;
  _push(ssrRenderComponent(_component_router_link, mergeProps({
    class: "router-link",
    to: "/electorates/" + $props.electorate.slug
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Card, null, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<h5 data-v-33c62da5${_scopeId2}><strong data-v-33c62da5${_scopeId2}>${ssrInterpolate($props.electorate.name)}</strong></h5><span class="text-muted text-uppercase" data-v-33c62da5${_scopeId2}>${ssrInterpolate($props.electorate.type)}</span>`);
            } else {
              return [
                createVNode("h5", null, [
                  createVNode("strong", null, toDisplayString($props.electorate.name), 1)
                ]),
                createVNode("span", { class: "text-muted text-uppercase" }, toDisplayString($props.electorate.type), 1)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_Card, null, {
            default: withCtx(() => [
              createVNode("h5", null, [
                createVNode("strong", null, toDisplayString($props.electorate.name), 1)
              ]),
              createVNode("span", { class: "text-muted text-uppercase" }, toDisplayString($props.electorate.type), 1)
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ElectorateCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-33c62da5"]]);
const _sfc_main = {
  name: "Electorates",
  setup() {
    const groupsStore = useGroupsStore();
    return { groupsStore };
  },
  created() {
    this.groupsStore.fetchElectorates("allCurrent");
    this.groupsStore.fetchElectorates("allHistoric");
  },
  computed: {
    electorates() {
      return (this.groupsStore.byName("allCurrent", "electorates") || []).sort((a, b) => {
        if (a.slug.toLowerCase() < b.slug.toLowerCase()) {
          return -1;
        }
        return 1;
      });
    },
    historicElectorates() {
      return (this.groupsStore.byName("allHistoric", "electorates") || []).sort((a, b) => {
        if (a.slug.toLowerCase() < b.slug.toLowerCase()) {
          return -1;
        }
        return 1;
      });
    }
  },
  components: { ElectorateCard: __nuxt_component_2 }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_ExternalLinkButton = __nuxt_component_0$1;
  const _component_ElectorateCard = __nuxt_component_2;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_PageHeader, { pageTitle: "Electorates" }, null, _parent));
  _push(`<div class="container"><div class="row mt-3"><div class="col-12"><h4>New Zealand has 72 electoral districts, commonly known as electorates.</h4><p>There are 65 general electorates and 7 M\u0101ori electorates. The number, sizes, shapes, and names of these electorates are determined by the Representation Commission after each Census in accordance with requirements set out in the Electoral Act 1993. Generally, this means that the electorate boundaries are reviewed every five years, or after every second general election.</p><p>At an election, voters cast a vote for a candidate who is contesting the electorate they live in. Whichever candidate receives the most votes (a plurality) becomes that electorate&#39;s Member of Parliament. In a general election, voters also cast a vote for their preferred political party; this vote determines how the remaining seats in Parliament (usually another 48 seats) are filled.</p>`);
  _push(ssrRenderComponent(_component_ExternalLinkButton, {
    link: "https://vote.nz/enrolling/get-ready-to-enrol/find-your-electorate-on-a-map/",
    text: "Find your electorate on a map"
  }, null, _parent));
  _push(ssrRenderComponent(_component_ExternalLinkButton, {
    link: "https://elections.nz/democracy-in-nz/historical-events/boundary-review-2019-2020/",
    text: "Learn about the 2019-2020 Electorate Boundary Review"
  }, null, _parent));
  _push(`<p>By-elections are special, one-off elections that take place in an electorate outside the normal election cycle. These happen when an electorate MP leaves Parliament early, usually by resigning, and a new electorate MP needs to be elected to replace them. In 2022, there were two by-elections: one in Tauranga, and one in Hamilton West.</p>`);
  _push(ssrRenderComponent(_component_ExternalLinkButton, {
    link: "https://tauranga.election.wheretheystand.nz/",
    text: "View Tauranga by-election results (June 2022)"
  }, null, _parent));
  _push(ssrRenderComponent(_component_ExternalLinkButton, {
    link: "https://hamilton-west.election.wheretheystand.nz/",
    text: "View Hamilton West by-election results (December 2022)"
  }, null, _parent));
  _push(`<h5 class="mt-3">Current electorates</h5><div class="row"><!--[-->`);
  ssrRenderList($options.electorates, (electorate, i) => {
    _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
    _push(ssrRenderComponent(_component_ElectorateCard, { electorate }, null, _parent));
    _push(`</div>`);
  });
  _push(`<!--]--></div><h5 class="mt-3">Former electorates</h5><p class="mt-0">Only electorates that have existed since 2014 have profiles on WhereTheyStand.</p><div class="row"><!--[-->`);
  ssrRenderList($options.historicElectorates, (electorate, i) => {
    _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
    _push(ssrRenderComponent(_component_ElectorateCard, { electorate }, null, _parent));
    _push(`</div>`);
  });
  _push(`<!--]--></div></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/electorates/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-9352bf2e.mjs.map
