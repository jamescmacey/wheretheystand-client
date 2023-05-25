import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as _export_sfc, a as __nuxt_component_2, b as __nuxt_component_6$1 } from '../server.mjs';
import { _ as __nuxt_component_0$1 } from './ExternalLinkButton-63123942.mjs';
import { withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
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
  name: "About",
  components: ["ExternalLinkInline", "ExternalLinkButton"]
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_Card = __nuxt_component_2;
  const _component_ExternalLinkButton = __nuxt_component_0$1;
  const _component_ExternalLinkInline = __nuxt_component_6$1;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_PageHeader, { pageTitle: "About WhereTheyStand" }, null, _parent));
  _push(`<div class="container"><div class="row mt-3"><div class="col-12">`);
  _push(ssrRenderComponent(_component_Card, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h4${_scopeId}>WhereTheyStand aims to aggregate key data about New Zealand&#39;s politicians, Parliament, and political parties.</h4><h5${_scopeId}>Historical reach</h5><p${_scopeId}>Information on WhereTheyStand goes back as far as the 51st Parliament (2014-2017). Members of Parliament who were members of that or any subsequent parliamentary terms have profiles on WhereTheyStand.</p><h5${_scopeId}>Site development</h5><p${_scopeId}>WhereTheyStand is a personal side-project by me, James Macey. I am a fourth-year law and commerce student at Victoria University of Wellington, and I work on this site when I have free time. I aim to keep WhereTheyStand completly apolitical; editorial annotations to substantive content will be made rarely and with substantial disclosure.</p><p${_scopeId}>Most of the funding for running WhereTheyStand comes from me. Of course, I&#39;ve taken steps to keep costs down, including by utilising student discounts I have access to, and reserving cloud capacity ahead of time. </p>`);
        _push2(ssrRenderComponent(_component_ExternalLinkButton, { link: "https://www.buymeacoffee.com/jamescmacey" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`If you really like this site, please consider buying me a hot choccy!`);
            } else {
              return [
                createTextVNode("If you really like this site, please consider buying me a hot choccy!")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`<h5${_scopeId}>Acknowledgements and inspiration</h5><p${_scopeId}>First, great Parliamentary monitoring sites overseas have given me a lot of ideas and inspiration for WhereTheyStand. `);
        _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://www.theyworkforyou.com/" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`TheyWorkForYou `);
            } else {
              return [
                createTextVNode("TheyWorkForYou ")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(` is a great site built by the mySociety charity in the UK. It sets a gold standard for sites like these and I can only hope to get there with WhereTheyStand one day.</p><p${_scopeId}>Secondly, the data and information that is presented on WhereTheyStand comes from a wide range of organisations. They are not affiliated with WhereTheyStand, but public information they provide is used on WhereTheyStand: <ul${_scopeId}><li${_scopeId}><strong${_scopeId}>Office of the Clerk of the House of Representatives</strong>: Bill data, Hansard (Parliamentary debates and votes), Register of Members&#39; Pecuinary and Other Interests, MPs&#39; expenses, MPs&#39; email addresses</li><li${_scopeId}><strong${_scopeId}>Parliamentary Counsel Office</strong>: Substantive bill content</li><li${_scopeId}><strong${_scopeId}>Department of Internal Affairs</strong>: Ministers&#39; expenses</li><li${_scopeId}><strong${_scopeId}>Ministry of Business, Innovation and Employment</strong>: Companies Register information</li><li${_scopeId}><strong${_scopeId}>Electoral Commission</strong>: Party name and registration information</li><li${_scopeId}><strong${_scopeId}>Stats NZ, the Representation Commission and the Electoral Commission</strong>: Electorate boundaries and geographic statistics</li><li${_scopeId}><strong${_scopeId}>Twitter</strong>: MP and Party Twitter account statistics</li></ul></p>`);
      } else {
        return [
          createVNode("h4", null, "WhereTheyStand aims to aggregate key data about New Zealand's politicians, Parliament, and political parties."),
          createVNode("h5", null, "Historical reach"),
          createVNode("p", null, "Information on WhereTheyStand goes back as far as the 51st Parliament (2014-2017). Members of Parliament who were members of that or any subsequent parliamentary terms have profiles on WhereTheyStand."),
          createVNode("h5", null, "Site development"),
          createVNode("p", null, "WhereTheyStand is a personal side-project by me, James Macey. I am a fourth-year law and commerce student at Victoria University of Wellington, and I work on this site when I have free time. I aim to keep WhereTheyStand completly apolitical; editorial annotations to substantive content will be made rarely and with substantial disclosure."),
          createVNode("p", null, "Most of the funding for running WhereTheyStand comes from me. Of course, I've taken steps to keep costs down, including by utilising student discounts I have access to, and reserving cloud capacity ahead of time. "),
          createVNode(_component_ExternalLinkButton, { link: "https://www.buymeacoffee.com/jamescmacey" }, {
            default: withCtx(() => [
              createTextVNode("If you really like this site, please consider buying me a hot choccy!")
            ]),
            _: 1
          }),
          createVNode("h5", null, "Acknowledgements and inspiration"),
          createVNode("p", null, [
            createTextVNode("First, great Parliamentary monitoring sites overseas have given me a lot of ideas and inspiration for WhereTheyStand. "),
            createVNode(_component_ExternalLinkInline, { link: "https://www.theyworkforyou.com/" }, {
              default: withCtx(() => [
                createTextVNode("TheyWorkForYou ")
              ]),
              _: 1
            }),
            createTextVNode(" is a great site built by the mySociety charity in the UK. It sets a gold standard for sites like these and I can only hope to get there with WhereTheyStand one day.")
          ]),
          createVNode("p", null, [
            createTextVNode("Secondly, the data and information that is presented on WhereTheyStand comes from a wide range of organisations. They are not affiliated with WhereTheyStand, but public information they provide is used on WhereTheyStand: "),
            createVNode("ul", null, [
              createVNode("li", null, [
                createVNode("strong", null, "Office of the Clerk of the House of Representatives"),
                createTextVNode(": Bill data, Hansard (Parliamentary debates and votes), Register of Members' Pecuinary and Other Interests, MPs' expenses, MPs' email addresses")
              ]),
              createVNode("li", null, [
                createVNode("strong", null, "Parliamentary Counsel Office"),
                createTextVNode(": Substantive bill content")
              ]),
              createVNode("li", null, [
                createVNode("strong", null, "Department of Internal Affairs"),
                createTextVNode(": Ministers' expenses")
              ]),
              createVNode("li", null, [
                createVNode("strong", null, "Ministry of Business, Innovation and Employment"),
                createTextVNode(": Companies Register information")
              ]),
              createVNode("li", null, [
                createVNode("strong", null, "Electoral Commission"),
                createTextVNode(": Party name and registration information")
              ]),
              createVNode("li", null, [
                createVNode("strong", null, "Stats NZ, the Representation Commission and the Electoral Commission"),
                createTextVNode(": Electorate boundaries and geographic statistics")
              ]),
              createVNode("li", null, [
                createVNode("strong", null, "Twitter"),
                createTextVNode(": MP and Party Twitter account statistics")
              ])
            ])
          ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const about = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { about as default };
//# sourceMappingURL=about-bddef441.mjs.map
