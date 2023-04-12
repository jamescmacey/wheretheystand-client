import { _ as _export_sfc, a as __nuxt_component_2 } from '../server.mjs';
import { _ as __nuxt_component_10 } from './PersonList-acac1d7d.mjs';
import { u as usePartiesStore } from './parties-51e5848a.mjs';
import { mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
import 'color-harmony';
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
  name: "PersonHome",
  setup() {
    const partiesStore = usePartiesStore();
    return { partiesStore };
  },
  created() {
    this.partiesStore.fetchMembers(this.$route.params.id);
    this.partiesStore.fetchLeaders(this.$route.params.id);
  },
  computed: {
    members() {
      var members = this.partiesStore.membersByIdentifier(this.$route.params.id);
      if (members === void 0) {
        members = [];
      }
      return members.filter((member) => {
        if (this.leaders.find((leader) => leader.id == member.id) === void 0) {
          return true;
        } else {
          return false;
        }
      }).sort((a, b) => {
        if (a.last_name.toLowerCase() < b.last_name.toLowerCase()) {
          return -1;
        }
        return 1;
      });
    },
    leaders() {
      return this.partiesStore.leadersByIdentifier(this.$route.params.id);
    },
    party() {
      return this.partiesStore.byIdentifier(this.$route.params.id);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2;
  const _component_PersonList = __nuxt_component_10;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))}><div class="row mt-3"><div class="col-12">`);
  if ($options.leaders && $options.leaders.length == 1) {
    _push(`<h4>${ssrInterpolate($options.party.party_leader_role)}</h4>`);
  } else if ($options.leaders && $options.leaders.length > 1) {
    _push(`<h4>${ssrInterpolate($options.party.party_leader_role_plural)}</h4>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.leaders && $options.leaders.length >= 1) {
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PersonList, { people: $options.leaders }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PersonList, { people: $options.leaders }, null, 8, ["people"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($options.members && $options.members.length == 1) {
    _push(`<h4>Member</h4>`);
  } else if ($options.members && $options.members.length > 1) {
    _push(`<h4>Members</h4>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.members && $options.members.length >= 1) {
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PersonList, { people: $options.members }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PersonList, { people: $options.members }, null, 8, ["people"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/parties/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-8fa4de45.mjs.map
