import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as __nuxt_component_0$1 } from './ExternalLinkButton-63123942.mjs';
import { _ as __nuxt_component_8 } from './PartyCard-dc3cce9c.mjs';
import { u as useGroupsStore } from './groups-89f8b671.mjs';
import { withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { _ as _export_sfc } from '../server.mjs';
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

const _sfc_main = {
  name: "Parties",
  setup() {
    const groupsStore = useGroupsStore();
    return { groupsStore };
  },
  created() {
    this.groupsStore.fetchParties("allInParliament");
  },
  computed: {
    parties() {
      return (this.groupsStore.byName("allInParliament", "parties") || []).sort((a, b) => {
        if (a.seats > b.seats) {
          return -1;
        }
        return 1;
      });
    },
    outsideParties() {
      return (this.groupsStore.byName("allOutOfParliament", "parties") || []).sort((a, b) => {
        if (a.slug.toLowerCase() < b.slug.toLowerCase()) {
          return -1;
        }
        return 1;
      });
    }
  },
  components: { PartyCard: __nuxt_component_8 }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_ExternalLinkButton = __nuxt_component_0$1;
  const _component_PartyCard = __nuxt_component_8;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_PageHeader, { pageTitle: "Parties" }, null, _parent));
  _push(`<div class="container"><div class="row mt-3"><div class="col-12"><h4>Most Members of Parliament belong to a political organisation, called a party.</h4><p>The number of seats a party has in Parliament is determined by the proportion of votes it receives under the party vote at each general election. If any electorate seats are won by a party&#39;s candidates, its seats first go to those candidates. Any leftover seats are then given to list candidates, who are elected according to a ranked list of candidates finalised before the election.</p><p>Political parties and their funding are regulated in New Zealand by the Electoral Commission in accordance with the Electoral Act 1993.</p>`);
  _push(ssrRenderComponent(_component_ExternalLinkButton, { link: "https://elections.nz/democracy-in-nz/political-parties-in-new-zealand/" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Learn more about the role of political parties in New Zealand&#39;s democracy`);
      } else {
        return [
          createTextVNode("Learn more about the role of political parties in New Zealand's democracy")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<p>Outside of elections, parties play an important role in Parliament and in government. Many votes cast in Parliament on proposed laws are cast as party votes, where a party casts a vote on behalf of all its member MPs. Party membership and size also determines the allocation of Parliamentary resources, like Oral Questions and Select Committee membership. It&#39;s also a major factor in deciding which party or parties form the Government, and who becomes the Prime Minister or a Minister.</p><h5 class="mt-3">Parties with seats in Parliament</h5><div class="row"><!--[-->`);
  ssrRenderList($options.parties, (party, i) => {
    _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
    _push(ssrRenderComponent(_component_PartyCard, { party }, null, _parent));
    _push(`</div>`);
  });
  _push(`<!--]--></div><p class="text-muted">For registered parties, their registered name is shown on this page. Some parties may have adopted different names in a Parliamentary context or for marketing purposes.</p></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/parties/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-ecd98b49.mjs.map
