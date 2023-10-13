import { _ as _export_sfc, H as Head, M as Meta, h as __nuxt_component_3 } from '../server.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { u as usePeopleStore } from './people-df592ada.mjs';
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
  name: "Person",
  setup() {
    const peopleStore = usePeopleStore();
    return { peopleStore };
  },
  created() {
    this.peopleStore.fetch(this.$route.params.id, true);
  },
  computed: {
    links() {
      return [
        {
          to: "/people/" + this.$route.params.id,
          name: "Overview"
        },
        {
          to: "/people/" + this.$route.params.id + "/details",
          name: "Details"
        },
        {
          to: "/people/" + this.$route.params.id + "/interests",
          name: "Interests"
        },
        {
          to: "/people/" + this.$route.params.id + "/expenses",
          name: "Expenses"
        }
      ];
    },
    person() {
      return this.peopleStore.byIdentifier(this.$route.params.id);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Meta = Meta;
  const _component_PageHeader = __nuxt_component_0;
  const _component_NuxtPage = __nuxt_component_3;
  if ($options.person) {
    _push(`<div${ssrRenderAttrs(mergeProps({ id: "person-view" }, _attrs))}>`);
    _push(ssrRenderComponent(_component_Head, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:card",
            content: "summary"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:image",
            content: $options.person.image
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:image:alt",
            content: $options.person.display_name
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:image:alt",
            content: $options.person.display_name
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:image",
            content: $options.person.image
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:card",
            content: "summary"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:site",
            content: "@wheretheystand_"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:title",
            content: $options.person.display_name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:description",
            content: $options.person.description
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:site_name",
            content: "WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:locale",
            content: "en_NZ"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:description",
            content: $options.person.description
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:title",
            content: $options.person.display_name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_Meta, {
              name: "twitter:card",
              content: "summary"
            }),
            createVNode(_component_Meta, {
              name: "twitter:image",
              content: $options.person.image
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "twitter:image:alt",
              content: $options.person.display_name
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:image:alt",
              content: $options.person.display_name
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:image",
              content: $options.person.image
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "twitter:card",
              content: "summary"
            }),
            createVNode(_component_Meta, {
              name: "twitter:site",
              content: "@wheretheystand_"
            }),
            createVNode(_component_Meta, {
              name: "twitter:title",
              content: $options.person.display_name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "twitter:description",
              content: $options.person.description
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:site_name",
              content: "WhereTheyStand"
            }),
            createVNode(_component_Meta, {
              property: "og:locale",
              content: "en_NZ"
            }),
            createVNode(_component_Meta, {
              property: "og:description",
              content: $options.person.description
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:title",
              content: $options.person.display_name + " - WhereTheyStand"
            }, null, 8, ["content"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_PageHeader, {
      pageTitle: $options.person.display_name,
      pageSubtitle: $options.person.description,
      image: $options.person.image,
      colour: $options.person.colour,
      pageLinks: $options.links
    }, null, _parent));
    _push(ssrRenderComponent(_component_NuxtPage, { person: $options.person }, null, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/people/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _id_ as default };
//# sourceMappingURL=_id_-fab0f123.mjs.map
