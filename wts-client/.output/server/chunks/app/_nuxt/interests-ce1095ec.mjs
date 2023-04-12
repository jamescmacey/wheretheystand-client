import { _ as __nuxt_component_0 } from './ExternalLinkButton-63123942.mjs';
import { _ as _export_sfc, a as __nuxt_component_2, b as __nuxt_component_6$1 } from '../server.mjs';
import { format, parse } from 'date-fns';
import { u as usePeopleStore } from './people-1a5851d6.mjs';
import { mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
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

const _sfc_main = {
  name: "PersonInterests",
  setup() {
    const peopleStore = usePeopleStore();
    return { peopleStore };
  },
  methods: {
    interestsForType(type) {
      return this.interests.interests.filter((element) => {
        return element.type === type.toString();
      });
    },
    interestTypeDescription(type) {
      return {
        1: "Company directorships and controlling interests",
        2: "Other companies and business entities",
        3: "Employment",
        4: "Beneficial interests in, and trusteeships of, trusts",
        5: "Organisations and trusts seeking Government funding",
        6: "Real property",
        7: "Retirement (superannuation) schemes",
        8: "Investment schemes",
        9: "Debtors (those who owe " + this.person.display_name + " money)",
        10: "Creditors (those who " + this.person.display_name + " owes money to)",
        11: "Overseas travel costs",
        12: "Gifts",
        13: "Discharged debts",
        14: "Payments for activities"
      }[type];
    }
  },
  created() {
    this.peopleStore.fetchInterests(this.$route.params.id);
  },
  computed: {
    person() {
      return this.peopleStore.byIdentifier(this.$route.params.id);
    },
    interests() {
      return this.peopleStore.interestsByIdentifier(this.$route.params.id);
    },
    formattedReportDate() {
      return format(parse(this.interests.filing_date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    },
    hasChangedDebt() {
      if (this.interests) {
        return this.interests.interests.filter((element) => {
          return element.description.endsWith("*");
        });
      } else {
        return false;
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ExternalLinkButton = __nuxt_component_0;
  const _component_Card = __nuxt_component_2;
  const _component_ExternalLinkInline = __nuxt_component_6$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))}><div class="row mt-3"><div class="col-12"><h4>Financial interests</h4><p>Each year, Members of Parliament are required to declare their financial interests, along with other specified interests.</p><p>This page shows all the interests that ${ssrInterpolate($options.person.display_name)} declared when the register was last compiled. From time to time, amendments are also made and are incorporated into the list you see here.</p>`);
  _push(ssrRenderComponent(_component_ExternalLinkButton, {
    link: "https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/",
    text: "Learn more on the Parliament website"
  }, null, _parent));
  if ($options.interests && $options.interests != {}) {
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h5${_scopeId}>Interests for ${ssrInterpolate($options.person.display_name)} as at ${ssrInterpolate($options.formattedReportDate)}</h5><!--[-->`);
          ssrRenderList(12, (i) => {
            _push2(`<div${_scopeId}>`);
            if ($options.interestsForType(i).length) {
              _push2(`<div${_scopeId}><h6${_scopeId}><span class="text-muted"${_scopeId}>${ssrInterpolate(i)}</span> ${ssrInterpolate($options.interestTypeDescription(i))}</h6><ul${_scopeId}><!--[-->`);
              ssrRenderList($options.interestsForType(i), (interest, j) => {
                _push2(`<li${_scopeId}>${ssrInterpolate(interest.description)} `);
                if (interest.nzbn_match.nzbn) {
                  _push2(`<span${_scopeId}>`);
                  if (interest.nzbn_match.entity_classifications_descs) {
                    _push2(`<br${_scopeId}>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (interest.nzbn_match.entity_classifications_descs) {
                    _push2(`<!--[-->`);
                    ssrRenderList(interest.nzbn_match.entity_classifications_descs, (classification, k) => {
                      _push2(`<span class="text-muted"${_scopeId}>${ssrInterpolate(classification)}</span>`);
                    });
                    _push2(`<!--]-->`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<br${_scopeId}><small${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_ExternalLinkInline, {
                    link: "https://www.nzbn.govt.nz/mynzbn/nzbndetails/" + interest.nzbn_match.nzbn
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`View on NZBN Registry`);
                      } else {
                        return [
                          createTextVNode("View on NZBN Registry")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  _push2(`</small></span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          });
          _push2(`<!--]-->`);
        } else {
          return [
            createVNode("h5", null, "Interests for " + toDisplayString($options.person.display_name) + " as at " + toDisplayString($options.formattedReportDate), 1),
            (openBlock(), createBlock(Fragment, null, renderList(12, (i) => {
              return createVNode("div", { key: i }, [
                $options.interestsForType(i).length ? (openBlock(), createBlock("div", { key: 0 }, [
                  createVNode("h6", null, [
                    createVNode("span", { class: "text-muted" }, toDisplayString(i), 1),
                    createTextVNode(" " + toDisplayString($options.interestTypeDescription(i)), 1)
                  ]),
                  createVNode("ul", null, [
                    (openBlock(true), createBlock(Fragment, null, renderList($options.interestsForType(i), (interest, j) => {
                      return openBlock(), createBlock("li", { key: j }, [
                        createTextVNode(toDisplayString(interest.description) + " ", 1),
                        interest.nzbn_match.nzbn ? (openBlock(), createBlock("span", { key: 0 }, [
                          interest.nzbn_match.entity_classifications_descs ? (openBlock(), createBlock("br", { key: 0 })) : createCommentVNode("", true),
                          interest.nzbn_match.entity_classifications_descs ? (openBlock(true), createBlock(Fragment, { key: 1 }, renderList(interest.nzbn_match.entity_classifications_descs, (classification, k) => {
                            return openBlock(), createBlock("span", {
                              class: "text-muted",
                              key: k
                            }, toDisplayString(classification), 1);
                          }), 128)) : createCommentVNode("", true),
                          createVNode("br"),
                          createVNode("small", null, [
                            createVNode(_component_ExternalLinkInline, {
                              link: "https://www.nzbn.govt.nz/mynzbn/nzbndetails/" + interest.nzbn_match.nzbn
                            }, {
                              default: withCtx(() => [
                                createTextVNode("View on NZBN Registry")
                              ]),
                              _: 2
                            }, 1032, ["link"])
                          ])
                        ])) : createCommentVNode("", true)
                      ]);
                    }), 128))
                  ])
                ])) : createCommentVNode("", true)
              ]);
            }), 64))
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(ssrRenderComponent(_component_Card, {
      missing: true,
      class: "text-center"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<p${_scopeId}><strong${_scopeId}>No interests were found for ${ssrInterpolate($options.person.display_name)}</strong></p><p${_scopeId}>WhereTheyStand doesn&#39;t have interests for recently elected MPs or MPs who left Parliament before the 52nd Parliament opened.</p>`);
          _push2(ssrRenderComponent(_component_ExternalLinkButton, {
            link: "https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/",
            text: "View historic or new registers of financial interests on the Parliament website"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode("p", null, [
              createVNode("strong", null, "No interests were found for " + toDisplayString($options.person.display_name), 1)
            ]),
            createVNode("p", null, "WhereTheyStand doesn't have interests for recently elected MPs or MPs who left Parliament before the 52nd Parliament opened."),
            createVNode(_component_ExternalLinkButton, {
              link: "https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/",
              text: "View historic or new registers of financial interests on the Parliament website"
            })
          ];
        }
      }),
      _: 1
    }, _parent));
  }
  if ($options.hasChangedDebt) {
    _push(`<p class="text-muted">An asterisk (*) denotes that the interest rate payable in relation to the debt is less than the normal market interest rate that applied at the time the debt was incurred, or, if the terms of the debt have been amended, at the time of that amendment.</p>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.interests && $options.interests != {}) {
    _push(`<p class="text-muted">Due to the original formatting of this material, some interests might exist on the same line.</p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/people/[id]/interests.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const interests = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { interests as default };
//# sourceMappingURL=interests-ce1095ec.mjs.map
