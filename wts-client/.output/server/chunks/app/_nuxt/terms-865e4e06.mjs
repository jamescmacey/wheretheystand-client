import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as _export_sfc, a as __nuxt_component_2, b as __nuxt_component_6$1 } from '../server.mjs';
import { _ as __nuxt_component_3 } from './Grid-e4643e38.mjs';
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
  name: "Terms"
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_Card = __nuxt_component_2;
  const _component_ExternalLinkInline = __nuxt_component_6$1;
  const _component_Grid = __nuxt_component_3;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_PageHeader, { pageTitle: "Copyright and Privacy" }, null, _parent));
  _push(`<div class="container"><div class="row mt-3"><div class="col-12"><h4>Copyright</h4>`);
  _push(ssrRenderComponent(_component_Card, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h5${_scopeId}>Original content</h5><p${_scopeId}>Original content on WhereTheyStand is licensed under a `);
        _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://creativecommons.org/licenses/by/4.0/" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`Creative Commons Attribution 4.0 International Licence.`);
            } else {
              return [
                createTextVNode("Creative Commons Attribution 4.0 International Licence.")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`</p><p${_scopeId}>This excludes the interactive election results available at `);
        _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://election.wheretheystand.nz" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`election.wheretheystand.nz`);
            } else {
              return [
                createTextVNode("election.wheretheystand.nz")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(` and at `);
        _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://tauranga.election.wheretheystand.nz" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`tauranga.election.wheretheystand.nz`);
            } else {
              return [
                createTextVNode("tauranga.election.wheretheystand.nz")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`. While the election results themselves are not subject to copyright, and the mapping contained in the interactive maps belongs to another copyright holder, copyright is retained in the election results interface.</p><h5${_scopeId}>Third-party content</h5><p${_scopeId}>Much of the content on WhereTheyStand is not original. As a rule, you should assume that full copyright is retained in all non-original content (either by me or the original copyright holder) and ask before reuse.</p><p${_scopeId}>Note that some official information (such as Hansard) does not attract any copyright. This means that the work is not even licensed under the Creative Commons licence; it is free to use without any attribution. You should check this before reusing information.</p>`);
      } else {
        return [
          createVNode("h5", null, "Original content"),
          createVNode("p", null, [
            createTextVNode("Original content on WhereTheyStand is licensed under a "),
            createVNode(_component_ExternalLinkInline, { link: "https://creativecommons.org/licenses/by/4.0/" }, {
              default: withCtx(() => [
                createTextVNode("Creative Commons Attribution 4.0 International Licence.")
              ]),
              _: 1
            })
          ]),
          createVNode("p", null, [
            createTextVNode("This excludes the interactive election results available at "),
            createVNode(_component_ExternalLinkInline, { link: "https://election.wheretheystand.nz" }, {
              default: withCtx(() => [
                createTextVNode("election.wheretheystand.nz")
              ]),
              _: 1
            }),
            createTextVNode(" and at "),
            createVNode(_component_ExternalLinkInline, { link: "https://tauranga.election.wheretheystand.nz" }, {
              default: withCtx(() => [
                createTextVNode("tauranga.election.wheretheystand.nz")
              ]),
              _: 1
            }),
            createTextVNode(". While the election results themselves are not subject to copyright, and the mapping contained in the interactive maps belongs to another copyright holder, copyright is retained in the election results interface.")
          ]),
          createVNode("h5", null, "Third-party content"),
          createVNode("p", null, "Much of the content on WhereTheyStand is not original. As a rule, you should assume that full copyright is retained in all non-original content (either by me or the original copyright holder) and ask before reuse."),
          createVNode("p", null, "Note that some official information (such as Hansard) does not attract any copyright. This means that the work is not even licensed under the Creative Commons licence; it is free to use without any attribution. You should check this before reusing information.")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<h4>Privacy</h4>`);
  _push(ssrRenderComponent(_component_Card, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h5${_scopeId}>Privacy for the public</h5><p${_scopeId}> When you use WhereTheyStand, some personal information about you is collected. `);
        _push2(ssrRenderComponent(_component_Grid, {
          class: "mt-2",
          columns: ["Information", "When you...", "So that..."],
          rows: [
            [
              "Your name and contact information",
              "provide it when you complete a feedback or correction form",
              "you can be contacted regarding your query."
            ],
            [
              "Basic details about your browser and network",
              "access any resource on WhereTheyStand",
              "limited system resources can be protected from abuse and misuse, and to produce aggregated insights into how users access WhereTheyStand."
            ],
            [
              "Your activity on WhereTheyStand",
              "interact with WhereTheyStand",
              "the user experience can be understood and improved"
            ],
            [
              "Your searches on WhereTheyStand",
              "search for something",
              "search trends can be understood, and to optimise search functionality"
            ],
            [
              "Your Hansard reader (coming soon) settings",
              "change the default settings in the Hansard reader",
              "they can be automatically set each time you browse Hansard"
            ]
          ]
        }, null, _parent2, _scopeId));
        _push2(` You have the right to correct and access any personal information held about you. However, in the vast majority of cases, identifying you from this information will not be possible; as a result, you won&#39;t be able to access or correct this information. </p><p${_scopeId}>Google Analytics and Google Recaptcha are in use on WhereTheyStand. You may wish to familiarise yourself with Google&#39;s privacy policies.</p><p${_scopeId}>Hosting providers for WhereTheyStand hold your information on behalf of WhereTheyStand. Most information is held by Microsoft in Australia.</p><p${_scopeId}>Occasionally, personal information about you may be contained in Hansard, the written record of Parliamentary debates. This is then republished on WhereTheyStand. Even if this information is wrong, it cannot and will not be corrected. Republished Hansard is a true copy of a document published under the authority of the House and cannot be the subject of a defamation proceeding.</p><h5${_scopeId}>Privacy for Members of Parliament</h5><p${_scopeId}>Information about Members of Parliament is collected from a wide variety of sources</p><h6${_scopeId}>Companies Register matching</h6><p${_scopeId}>WhereTheyStand also accesses the NZBN API to match your pecuniary and other interests in companies to those companies&#39; Companies Register records. To ensure accuracy, the company name must match the listing on the Register of Members&#39; Pecuniary and Other Specified Interests exactly. </p><h6${_scopeId}>Individual (personal or split-party) vote records</h6><p${_scopeId}> When WhereTheyStand updates vote records, it interprets the vote record listed in Hansard on the Parliament website. Hansard only records your surname (and first initial, if necessary) against a voting position. WhereTheyStand must then match this to your profile on WhereTheyStand. </p><p${_scopeId}> Numerous safeguards are in place to ensure the accuracy of this matching. First, names are only matched against a pool of MPs who were Members of Parliament and who had voting rights on the day of the vote (i.e. had been sworn in). Secondly, a vote cannot match to an MP if another vote has already done so for that vote. Finally, after all the individual votes are matched, the totals for each position (ayes, noes, abstentions) are checked against the totals reported by Hansard. These must match for the vote to appear on WhereTheyStand. </p><p${_scopeId}> If you find that you are listed as voting in a way contrary to the way you actually voted, first check that the original Hansard accurately records your position. If it does, and it is still wrong on WhereTheyStand, please get in touch to correct this. </p>`);
      } else {
        return [
          createVNode("h5", null, "Privacy for the public"),
          createVNode("p", null, [
            createTextVNode(" When you use WhereTheyStand, some personal information about you is collected. "),
            createVNode(_component_Grid, {
              class: "mt-2",
              columns: ["Information", "When you...", "So that..."],
              rows: [
                [
                  "Your name and contact information",
                  "provide it when you complete a feedback or correction form",
                  "you can be contacted regarding your query."
                ],
                [
                  "Basic details about your browser and network",
                  "access any resource on WhereTheyStand",
                  "limited system resources can be protected from abuse and misuse, and to produce aggregated insights into how users access WhereTheyStand."
                ],
                [
                  "Your activity on WhereTheyStand",
                  "interact with WhereTheyStand",
                  "the user experience can be understood and improved"
                ],
                [
                  "Your searches on WhereTheyStand",
                  "search for something",
                  "search trends can be understood, and to optimise search functionality"
                ],
                [
                  "Your Hansard reader (coming soon) settings",
                  "change the default settings in the Hansard reader",
                  "they can be automatically set each time you browse Hansard"
                ]
              ]
            }, null, 8, ["columns", "rows"]),
            createTextVNode(" You have the right to correct and access any personal information held about you. However, in the vast majority of cases, identifying you from this information will not be possible; as a result, you won't be able to access or correct this information. ")
          ]),
          createVNode("p", null, "Google Analytics and Google Recaptcha are in use on WhereTheyStand. You may wish to familiarise yourself with Google's privacy policies."),
          createVNode("p", null, "Hosting providers for WhereTheyStand hold your information on behalf of WhereTheyStand. Most information is held by Microsoft in Australia."),
          createVNode("p", null, "Occasionally, personal information about you may be contained in Hansard, the written record of Parliamentary debates. This is then republished on WhereTheyStand. Even if this information is wrong, it cannot and will not be corrected. Republished Hansard is a true copy of a document published under the authority of the House and cannot be the subject of a defamation proceeding."),
          createVNode("h5", null, "Privacy for Members of Parliament"),
          createVNode("p", null, "Information about Members of Parliament is collected from a wide variety of sources"),
          createVNode("h6", null, "Companies Register matching"),
          createVNode("p", null, "WhereTheyStand also accesses the NZBN API to match your pecuniary and other interests in companies to those companies' Companies Register records. To ensure accuracy, the company name must match the listing on the Register of Members' Pecuniary and Other Specified Interests exactly. "),
          createVNode("h6", null, "Individual (personal or split-party) vote records"),
          createVNode("p", null, " When WhereTheyStand updates vote records, it interprets the vote record listed in Hansard on the Parliament website. Hansard only records your surname (and first initial, if necessary) against a voting position. WhereTheyStand must then match this to your profile on WhereTheyStand. "),
          createVNode("p", null, " Numerous safeguards are in place to ensure the accuracy of this matching. First, names are only matched against a pool of MPs who were Members of Parliament and who had voting rights on the day of the vote (i.e. had been sworn in). Secondly, a vote cannot match to an MP if another vote has already done so for that vote. Finally, after all the individual votes are matched, the totals for each position (ayes, noes, abstentions) are checked against the totals reported by Hansard. These must match for the vote to appear on WhereTheyStand. "),
          createVNode("p", null, " If you find that you are listed as voting in a way contrary to the way you actually voted, first check that the original Hansard accurately records your position. If it does, and it is still wrong on WhereTheyStand, please get in touch to correct this. ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terms.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const terms = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { terms as default };
//# sourceMappingURL=terms-865e4e06.mjs.map
