import { _ as _export_sfc, H as Head, M as Meta, h as __nuxt_component_3 } from '../server.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { u as usePartiesStore } from './parties-2e2715f5.mjs';
import { mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
import 'date-fns';

const _sfc_main = {
  name: "Party",
  setup() {
    const partiesStore = usePartiesStore();
    return { partiesStore };
  },
  created() {
    this.partiesStore.fetch(this.$route.params.id);
  },
  computed: {
    links() {
      return [
        {
          to: "/parties/" + this.$route.params.id,
          name: "Overview"
        }
      ];
    },
    party() {
      return this.partiesStore.byIdentifier(this.$route.params.id);
    },
    pageSubtitle() {
      if (this.party.display_name != this.party.legal_name) {
        return this.party.legal_name;
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Meta = Meta;
  const _component_PageHeader = __nuxt_component_0;
  const _component_NuxtPage = __nuxt_component_3;
  if ($options.party) {
    _push(`<div${ssrRenderAttrs(mergeProps({ id: "party-view" }, _attrs))}>`);
    _push(ssrRenderComponent(_component_Head, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:title",
            content: $options.party.display_name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:description",
            content: $options.pageSubtitle
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "description",
            content: $options.pageSubtitle
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:title",
            content: $options.party.display_name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:description",
            content: $options.pageSubtitle
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_Meta, {
              name: "twitter:title",
              content: $options.party.display_name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "twitter:description",
              content: $options.pageSubtitle
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "description",
              content: $options.pageSubtitle
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:title",
              content: $options.party.display_name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:description",
              content: $options.pageSubtitle
            }, null, 8, ["content"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_PageHeader, {
      pageTitle: $options.party.display_name,
      pageSubtitle: $options.pageSubtitle,
      colour: $options.party.colour,
      pageLinks: $options.links
    }, null, _parent));
    _push(ssrRenderComponent(_component_NuxtPage, { party: $options.party }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/parties/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _id_ as default };
//# sourceMappingURL=_id_-eaf179e2.mjs.map
