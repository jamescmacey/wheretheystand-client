import { _ as _export_sfc, a as __nuxt_component_2, f as __nuxt_component_1 } from '../server.mjs';
import { withCtx, createVNode, useSSRContext } from 'vue';
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

const _sfc_main = {
  name: "Auth"
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2;
  const _component_ClientOnly = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(_attrs)}><div class="container"><div class="row mt-3"><div class="d-flex justify-content-center"><div class="col-xl-4 col-lg-5 col-12">`);
  _push(ssrRenderComponent(_component_Card, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_ClientOnly, null, {}, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_ClientOnly, null, {
            default: withCtx(() => [
              createVNode("div", { class: "authContainer" }, [
                createVNode("passage-auth", { "app-id": "nNhe5mvU7MJOerfpIj77EVb5" })
              ])
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<p class="mt-0"><span class="text-muted">There are currently no public features that require signing in. Inclusion of an authentication platform exists, at this stage, for administrative purposes only.</span></p></div></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auth = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { auth as default };
//# sourceMappingURL=auth-6e4a990b.mjs.map
