import { _ as _export_sfc, u as useFetch, A as API_BASE, n as navigateTo, a as __nuxt_component_2$1, d as __nuxt_component_0$1, e as __nuxt_component_1$1, b as __nuxt_component_6$1 } from '../server.mjs';
import { useSSRContext, withAsyncContext, withCtx, createVNode, createTextVNode, unref, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, mergeProps } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { _ as __nuxt_component_3 } from './Spinner-368da257.mjs';
import { formatDistanceToNow, parse, format } from 'date-fns';
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

const _sfc_main$2 = {
  name: "SearchBar"
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-1" }, _attrs))} data-v-ef5cad82><form action="/search/" method="get" data-v-ef5cad82><div class="input-group" data-v-ef5cad82><input type="text" class="form-control" id="q" name="q" placeholder="MP, electorate or party name" data-v-ef5cad82><button class="btn btn-primary" type="submit" id="button-addon2" data-v-ef5cad82>Find</button></div></form><small class="text-muted" data-v-ef5cad82>Search provided by Algolia.</small></div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SearchBar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-ef5cad82"]]);
const _sfc_main$1 = {
  name: "RandomResource",
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async randomise() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      var url = API_BASE + "client/random/";
      var to = await $fetch(url);
      await navigateTo(to.to);
      return;
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_FontAwesomeIcon = __nuxt_component_1$1;
  const _component_Spinner = __nuxt_component_3;
  _push(`<a${ssrRenderAttrs(mergeProps({ href: "/api/client/random-redirect/" }, _attrs))} data-v-f9be4911> Or, go to a random page `);
  if (!$data.loading) {
    _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($data.loading) {
    _push(ssrRenderComponent(_component_Spinner, { class: "ms-1" }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</a>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RandomResource.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-f9be4911"]]);
const __default__ = {
  name: "Home",
  components: {},
  methods: {
    relativeDate(date) {
      return formatDistanceToNow(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date())) + " ago";
    },
    formattedDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d.M.yyyy");
    },
    formattedDateFull(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    }
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: homepageData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      API_BASE + "client/homepage/",
      "$PslAyef5YX"
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Card = __nuxt_component_2$1;
      const _component_SearchBar = __nuxt_component_1;
      const _component_RandomResource = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FontAwesomeIcon = __nuxt_component_1$1;
      const _component_ExternalLinkInline = __nuxt_component_6$1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-ebc11643><div id="cover-image" class="container-fluid text-start py-5" data-v-ebc11643><div class="container" data-v-ebc11643><div class="row" data-v-ebc11643><div class="col-12 col-xl-8 py-xl-5 py-2" data-v-ebc11643><h1 class="display-4" data-v-ebc11643>Wondering where they stand?</h1><hr data-v-ebc11643><h3 data-v-ebc11643> WhereTheyStand aggregates voting data, financial information, biographical information, and more. </h3></div><div id="onboarding" class="col-12 col-xl-4 py-xl-5 py-2" data-v-ebc11643>`);
      _push(ssrRenderComponent(_component_Card, { frosted: true }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h4 class="mt-2" data-v-ebc11643${_scopeId}>Find your MP, electorate or party</h4> All MPs who&#39;ve been in Parliament since 2014 have profiles. `);
            _push2(ssrRenderComponent(_component_SearchBar, { class: "mt-2" }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_RandomResource, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("h4", { class: "mt-2" }, "Find your MP, electorate or party"),
              createTextVNode(" All MPs who've been in Parliament since 2014 have profiles. "),
              createVNode(_component_SearchBar, { class: "mt-2" }),
              createVNode(_component_RandomResource)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div><div class="container mt-3" data-v-ebc11643><div class="row" data-v-ebc11643><div class="col-12 col-xl-4" data-v-ebc11643><h4 data-v-ebc11643>Recent votes</h4>`);
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(homepageData)) {
              _push2(`<div data-v-ebc11643${_scopeId}><ul class="homepage-resource-list" data-v-ebc11643${_scopeId}><!--[-->`);
              ssrRenderList(unref(homepageData).votes, (vote, i) => {
                _push2(`<li class="mb-3 vote-list" data-v-ebc11643${_scopeId}><h6 class="mb-0" data-v-ebc11643${_scopeId}>${ssrInterpolate(vote.name)}</h6><small class="me-1" data-v-ebc11643${_scopeId}>`);
                if (vote.type_desc) {
                  _push2(`<span class="badge bg-primary text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(vote.type_desc)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</small><small class="text-muted text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(_ctx.formattedDateFull(vote.date))}</small><br data-v-ebc11643${_scopeId}><div class="text-start" data-v-ebc11643${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/votes/" + vote.id,
                  class: "vote-link mt-1"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`View vote `);
                      _push3(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createTextVNode("View vote "),
                        createVNode(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] })
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div>`);
                if (i < 4) {
                  _push2(`<hr class="mt-1" data-v-ebc11643${_scopeId}>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(homepageData) ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode("ul", { class: "homepage-resource-list" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(homepageData).votes, (vote, i) => {
                    return openBlock(), createBlock("li", {
                      key: vote.id,
                      class: "mb-3 vote-list"
                    }, [
                      createVNode("h6", { class: "mb-0" }, toDisplayString(vote.name), 1),
                      createVNode("small", { class: "me-1" }, [
                        vote.type_desc ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "badge bg-primary text-uppercase"
                        }, toDisplayString(vote.type_desc), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("small", { class: "text-muted text-uppercase" }, toDisplayString(_ctx.formattedDateFull(vote.date)), 1),
                      createVNode("br"),
                      createVNode("div", { class: "text-start" }, [
                        createVNode(_component_NuxtLink, {
                          to: "/votes/" + vote.id,
                          class: "vote-link mt-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("View vote "),
                            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] })
                          ]),
                          _: 2
                        }, 1032, ["to"])
                      ]),
                      i < 4 ? (openBlock(), createBlock("hr", {
                        key: 0,
                        class: "mt-1"
                      })) : createCommentVNode("", true)
                    ]);
                  }), 128))
                ])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="col-12 col-xl-4" data-v-ebc11643><h4 data-v-ebc11643>Recently updated bills</h4>`);
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(homepageData)) {
              _push2(`<div data-v-ebc11643${_scopeId}><ul class="homepage-resource-list" data-v-ebc11643${_scopeId}><!--[-->`);
              ssrRenderList(unref(homepageData).bills, (bill, i) => {
                _push2(`<li class="mb-3 bill-list" data-v-ebc11643${_scopeId}><h6 class="mb-0" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.name)}</h6><small class="me-1" data-v-ebc11643${_scopeId}>`);
                if (bill.progress == "inp") {
                  _push2(`<span class="badge bg-primary text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "pas") {
                  _push2(`<span class="badge bg-success text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "ena") {
                  _push2(`<span class="badge bg-success text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "dis") {
                  _push2(`<span class="badge bg-warning text-dark text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "def") {
                  _push2(`<span class="badge bg-danger text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "lap") {
                  _push2(`<span class="badge bg-danger text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "unx") {
                  _push2(`<span class="badge bg-danger text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "div") {
                  _push2(`<span class="badge bg-info text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else if (bill.progress == "wit") {
                  _push2(`<span class="badge bg-warning text-dark text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                } else {
                  _push2(`<span class="badge bg-secondary text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.progress_desc)}</span>`);
                }
                _push2(`</small><small class="text-muted text-uppercase" data-v-ebc11643${_scopeId}>${ssrInterpolate(bill.type_desc)}</small><div class="text-start" data-v-ebc11643${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/bills/" + bill.id,
                  class: "bill-link mt-1"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`View bill `);
                      _push3(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createTextVNode("View bill "),
                        createVNode(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] })
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div>`);
                if (i < 4) {
                  _push2(`<hr class="mt-1" data-v-ebc11643${_scopeId}>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(homepageData) ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode("ul", { class: "homepage-resource-list" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(homepageData).bills, (bill, i) => {
                    return openBlock(), createBlock("li", {
                      key: bill.id,
                      class: "mb-3 bill-list"
                    }, [
                      createVNode("h6", { class: "mb-0" }, toDisplayString(bill.name), 1),
                      createVNode("small", { class: "me-1" }, [
                        bill.progress == "inp" ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "badge bg-primary text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "pas" ? (openBlock(), createBlock("span", {
                          key: 1,
                          class: "badge bg-success text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "ena" ? (openBlock(), createBlock("span", {
                          key: 2,
                          class: "badge bg-success text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "dis" ? (openBlock(), createBlock("span", {
                          key: 3,
                          class: "badge bg-warning text-dark text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "def" ? (openBlock(), createBlock("span", {
                          key: 4,
                          class: "badge bg-danger text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "lap" ? (openBlock(), createBlock("span", {
                          key: 5,
                          class: "badge bg-danger text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "unx" ? (openBlock(), createBlock("span", {
                          key: 6,
                          class: "badge bg-danger text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "div" ? (openBlock(), createBlock("span", {
                          key: 7,
                          class: "badge bg-info text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : bill.progress == "wit" ? (openBlock(), createBlock("span", {
                          key: 8,
                          class: "badge bg-warning text-dark text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1)) : (openBlock(), createBlock("span", {
                          key: 9,
                          class: "badge bg-secondary text-uppercase"
                        }, toDisplayString(bill.progress_desc), 1))
                      ]),
                      createVNode("small", { class: "text-muted text-uppercase" }, toDisplayString(bill.type_desc), 1),
                      createVNode("div", { class: "text-start" }, [
                        createVNode(_component_NuxtLink, {
                          to: "/bills/" + bill.id,
                          class: "bill-link mt-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("View bill "),
                            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] })
                          ]),
                          _: 2
                        }, 1032, ["to"])
                      ]),
                      i < 4 ? (openBlock(), createBlock("hr", {
                        key: 0,
                        class: "mt-1"
                      })) : createCommentVNode("", true)
                    ]);
                  }), 128))
                ])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="col-12 col-xl-4" data-v-ebc11643><h4 data-v-ebc11643>Elections</h4>`);
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="election" data-v-ebc11643${_scopeId}><h5 data-v-ebc11643${_scopeId}>2022 Hamilton West by-election</h5><span data-v-ebc11643${_scopeId}>10 December 2022</span><br data-v-ebc11643${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://election.wheretheystand.nz" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Interactive results`);
                } else {
                  return [
                    createTextVNode("Interactive results")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><hr data-v-ebc11643${_scopeId}><div class="election" data-v-ebc11643${_scopeId}><h5 data-v-ebc11643${_scopeId}>2022 Tauranga by-election</h5><span data-v-ebc11643${_scopeId}>18 June 2022</span><br data-v-ebc11643${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://tauranga.election.wheretheystand.nz" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Interactive results `);
                } else {
                  return [
                    createTextVNode("Interactive results ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "election" }, [
                createVNode("h5", null, "2022 Hamilton West by-election"),
                createVNode("span", null, "10 December 2022"),
                createVNode("br"),
                createVNode(_component_ExternalLinkInline, { link: "https://election.wheretheystand.nz" }, {
                  default: withCtx(() => [
                    createTextVNode("Interactive results")
                  ]),
                  _: 1
                })
              ]),
              createVNode("hr"),
              createVNode("div", { class: "election" }, [
                createVNode("h5", null, "2022 Tauranga by-election"),
                createVNode("span", null, "18 June 2022"),
                createVNode("br"),
                createVNode(_component_ExternalLinkInline, { link: "https://tauranga.election.wheretheystand.nz" }, {
                  default: withCtx(() => [
                    createTextVNode("Interactive results ")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ebc11643"]]);

export { index as default };
//# sourceMappingURL=index-1b5bcc24.mjs.map
