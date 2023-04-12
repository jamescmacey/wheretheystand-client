import { _ as __nuxt_component_0 } from './PageHeader-03254b16.mjs';
import { _ as _export_sfc, u as useFetch, A as API_BASE, H as Head, L as Link, a as __nuxt_component_2$1, d as __nuxt_component_0$1, e as __nuxt_component_1 } from '../server.mjs';
import { _ as __nuxt_component_3 } from './Spinner-368da257.mjs';
import { useSSRContext, withAsyncContext, unref, withCtx, openBlock, createBlock, createCommentVNode, createVNode, withModifiers, withDirectives, vModelText, vModelCheckbox, createTextVNode, vModelSelect, toDisplayString } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { formatDistanceToNow, parse, format } from 'date-fns';
import 'color-harmony';
import 'ofetch';
import 'hookable';
import 'unctx';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
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

const __default__ = {
  name: "VoteFilter",
  data() {
    return {
      votes: [],
      count: 0,
      page: 1,
      previous: false,
      next: false,
      hasLoadedData: false,
      isLoading: false,
      filterSettings: {
        titleContains: "",
        billTypes: {
          mem: true,
          gov: true,
          pri: true,
          loc: true
        },
        parliamentaryTerm: "",
        characteristics: {
          urgencyUsed: false,
          extendedSittingsUsed: false,
          submissionsOpen: false,
          votingMethod: "",
          type: ""
        },
        format: {
          perPage: 10,
          orderBy: "date_desc"
        }
      },
      activeFilter: {
        titleContains: "",
        billTypes: {
          mem: true,
          gov: true,
          pri: true,
          loc: true
        },
        parliamentaryTerm: "",
        characteristics: {
          urgencyUsed: false,
          extendedSittingsUsed: false,
          submissionsOpen: false,
          votingMethod: "",
          type: ""
        },
        format: {
          perPage: 10,
          orderBy: "date_desc"
        }
      }
    };
  },
  computed: {
    activeString() {
      return JSON.stringify(this.activeFilter);
    },
    userString() {
      return JSON.stringify(this.filterSettings);
    },
    displayVotes() {
      if (!this.hasLoadedData && this.prefetchData) {
        return this.prefetchData.results;
      } else {
        return this.votes;
      }
    },
    displayCount() {
      if (!this.hasLoadedData && this.prefetchData) {
        return this.prefetchData.count;
      } else {
        return this.count;
      }
    },
    displayPage() {
      if (!this.hasLoadedData && this.prefetchData) {
        return this.prefetchData.page;
      } else {
        return this.page;
      }
    },
    displayNext() {
      if (!this.hasLoadedData && this.prefetchData) {
        return this.prefetchData.next;
      } else {
        return this.next;
      }
    },
    displayPrevious() {
      if (!this.hasLoadedData && this.prefetchData) {
        return this.prefetchData.previous;
      } else {
        return this.previous;
      }
    }
  },
  methods: {
    async getPage(page) {
      this.isLoading = true;
      var url = API_BASE + "votes/?";
      var r = await $fetch(url + new URLSearchParams({
        page,
        per_page: this.activeFilter.format.perPage
      }), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          page,
          filter: this.activeFilter
        })
      });
      this.isLoading = false;
      this.hasLoadedData = true;
      this.votes = r.results;
      this.count = r.count;
      if (r.previous) {
        this.previous = true;
      } else {
        this.previous = false;
      }
      if (r.next) {
        this.next = true;
      } else {
        this.next = false;
      }
      this.page = page;
    },
    applyFilter() {
      if (this.activeString != this.userString && !this.isLoading) {
        this.activeFilter = JSON.parse(JSON.stringify(this.filterSettings));
        this.getPage(1);
      }
    },
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
const _sfc_main$1 = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const query = useRoute().query;
    var initialPage = 1;
    if (query.hasOwnProperty("page")) {
      initialPage = query.page;
    }
    const { data: prefetchData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      API_BASE + "votes/?page=" + initialPage + "&per_page=10",
      "$ato1r1QKMH"
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Head = Head;
      const _component_Link = Link;
      const _component_Card = __nuxt_component_2$1;
      const _component_Spinner = __nuxt_component_3;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-65def93c><h4 data-v-65def93c>Filter votes</h4>`);
      if (unref(prefetchData) && unref(prefetchData).count && unref(prefetchData).count > 0) {
        _push(ssrRenderComponent(_component_Head, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(prefetchData).previous && unref(prefetchData).page == 2) {
                _push2(ssrRenderComponent(_component_Link, {
                  rel: "prev",
                  href: "/votes"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(prefetchData).previous && unref(prefetchData).page != 2) {
                _push2(ssrRenderComponent(_component_Link, {
                  rel: "prev",
                  href: "/votes?page=" + (unref(prefetchData).page - 1)
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(prefetchData).next) {
                _push2(ssrRenderComponent(_component_Link, {
                  rel: "next",
                  href: "/votes?page=" + (unref(prefetchData).page + 1)
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(prefetchData).previous && unref(prefetchData).page == 2 ? (openBlock(), createBlock(_component_Link, {
                  key: 0,
                  rel: "prev",
                  href: "/votes"
                })) : createCommentVNode("", true),
                unref(prefetchData).previous && unref(prefetchData).page != 2 ? (openBlock(), createBlock(_component_Link, {
                  key: 1,
                  rel: "prev",
                  href: "/votes?page=" + (unref(prefetchData).page - 1)
                }, null, 8, ["href"])) : createCommentVNode("", true),
                unref(prefetchData).next ? (openBlock(), createBlock(_component_Link, {
                  key: 2,
                  rel: "next",
                  href: "/votes?page=" + (unref(prefetchData).page + 1)
                }, null, 8, ["href"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form data-v-65def93c${_scopeId}><div class="row mb-2" data-v-65def93c${_scopeId}><div class="col-12" data-v-65def93c${_scopeId}><h5 data-v-65def93c${_scopeId}>Refine by bill title</h5><label for="text_filter" data-v-65def93c${_scopeId}>Bill title must contain the following:</label><input${ssrRenderAttr("value", _ctx.filterSettings.titleContains)} class="form-control" type="input" id="text_filter" data-v-65def93c${_scopeId}><small class="text-muted" data-v-65def93c${_scopeId}>For less strict textual search, you may wish to use the site-wide search function.</small></div></div><hr data-v-65def93c${_scopeId}><div class="row" data-v-65def93c${_scopeId}><div class="col-12 col-xl-3" data-v-65def93c${_scopeId}><h5 data-v-65def93c${_scopeId}>Bill types</h5><div class="form-check" data-v-65def93c${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(_ctx.filterSettings.billTypes.gov) ? ssrLooseContain(_ctx.filterSettings.billTypes.gov, "") : _ctx.filterSettings.billTypes.gov) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_goverment" data-v-65def93c${_scopeId}><label class="form-check-label" for="check_goverment" data-v-65def93c${_scopeId}> Government bills </label></div><div class="form-check" data-v-65def93c${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(_ctx.filterSettings.billTypes.mem) ? ssrLooseContain(_ctx.filterSettings.billTypes.mem, "") : _ctx.filterSettings.billTypes.mem) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_members" data-v-65def93c${_scopeId}><label class="form-check-label" for="check_members" data-v-65def93c${_scopeId}> Members&#39; bills </label></div><div class="form-check" data-v-65def93c${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(_ctx.filterSettings.billTypes.loc) ? ssrLooseContain(_ctx.filterSettings.billTypes.loc, "") : _ctx.filterSettings.billTypes.loc) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_local" data-v-65def93c${_scopeId}><label class="form-check-label" for="check_local" data-v-65def93c${_scopeId}> Local bills </label></div><div class="form-check" data-v-65def93c${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(_ctx.filterSettings.billTypes.pri) ? ssrLooseContain(_ctx.filterSettings.billTypes.pri, "") : _ctx.filterSettings.billTypes.pri) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_private" data-v-65def93c${_scopeId}><label class="form-check-label" for="check_private" data-v-65def93c${_scopeId}> Private bills </label></div><small data-v-65def93c${_scopeId}><strong data-v-65def93c${_scopeId}>OR</strong>: Votes must be for a bill of one of the selected types to be shown.</small></div><div class="col-12 col-xl-3" data-v-65def93c${_scopeId}><h5 data-v-65def93c${_scopeId}>Vote options</h5><label for="parliament_select" data-v-65def93c${_scopeId}>Parliamentary term</label><select class="form-select" id="parliament_select" aria-label="-" data-v-65def93c${_scopeId}><option value="" selected data-v-65def93c${_scopeId}>Any</option><option value="53" data-v-65def93c${_scopeId}>53rd Parliament</option><option value="52" data-v-65def93c${_scopeId}>52nd Parliament</option><option value="51" data-v-65def93c${_scopeId}>51st Parliament</option><option value="50" data-v-65def93c${_scopeId}>50th Parliament</option></select><label for="vote_type_select" class="mt-2" data-v-65def93c${_scopeId}>Vote type</label><select class="form-select" id="vote_type_select" aria-label="Vote type" data-v-65def93c${_scopeId}><option value="" selected data-v-65def93c${_scopeId}>Any</option><option value="personal" data-v-65def93c${_scopeId}>Personal vote</option><option value="party" data-v-65def93c${_scopeId}>Party vote</option></select><small data-v-65def93c${_scopeId}><strong data-v-65def93c${_scopeId}>AND</strong>: Votes must meet both of these criteria to be shown.</small></div><div class="col-12 col-xl-3" data-v-65def93c${_scopeId}><h5 data-v-65def93c${_scopeId}>Display options</h5><label for="per_page_select" data-v-65def93c${_scopeId}>Results per page</label><select class="form-select" id="per_page_select" aria-label="Results per page" data-v-65def93c${_scopeId}><option value="10" selected data-v-65def93c${_scopeId}>10</option><option value="25" data-v-65def93c${_scopeId}>25</option><option value="50" data-v-65def93c${_scopeId}>50</option><option value="100" data-v-65def93c${_scopeId}>100</option></select><label for="order_by_select" class="mt-2" data-v-65def93c${_scopeId}>Order by</label><select class="form-select" id="order_by_select" aria-label="Order by" data-v-65def93c${_scopeId}><option value="date_desc" selected data-v-65def93c${_scopeId}>Date (newest first)</option><option value="date_asc" data-v-65def93c${_scopeId}>Date (oldest first)</option><option value="reading_desc" data-v-65def93c${_scopeId}>Reading (latest first)</option><option value="reading_asc" data-v-65def93c${_scopeId}>Reading (earliest first)</option></select></div></div><hr data-v-65def93c${_scopeId}><div class="row" data-v-65def93c${_scopeId}><div class="col-12" data-v-65def93c${_scopeId}>`);
            if (_ctx.activeString != _ctx.userString && !_ctx.isLoading) {
              _push2(`<button class="btn btn-primary" type="button" id="button-addon2" data-v-65def93c${_scopeId}>Refine selection</button>`);
            } else {
              _push2(`<button disabled class="btn btn-primary" type="button" id="button-addon2" data-v-65def93c${_scopeId}>Refine selection</button>`);
            }
            if (_ctx.isLoading) {
              _push2(ssrRenderComponent(_component_Spinner, { class: "ms-2" }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div></form>`);
          } else {
            return [
              createVNode("form", {
                onSubmit: withModifiers(($event) => _ctx.applyFilter(), ["prevent"])
              }, [
                createVNode("div", { class: "row mb-2" }, [
                  createVNode("div", { class: "col-12" }, [
                    createVNode("h5", null, "Refine by bill title"),
                    createVNode("label", { for: "text_filter" }, "Bill title must contain the following:"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => _ctx.filterSettings.titleContains = $event,
                      class: "form-control",
                      type: "input",
                      id: "text_filter"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, _ctx.filterSettings.titleContains]
                    ]),
                    createVNode("small", { class: "text-muted" }, "For less strict textual search, you may wish to use the site-wide search function.")
                  ])
                ]),
                createVNode("hr"),
                createVNode("div", { class: "row" }, [
                  createVNode("div", { class: "col-12 col-xl-3" }, [
                    createVNode("h5", null, "Bill types"),
                    createVNode("div", { class: "form-check" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => _ctx.filterSettings.billTypes.gov = $event,
                        class: "form-check-input",
                        type: "checkbox",
                        value: "",
                        id: "check_goverment"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, _ctx.filterSettings.billTypes.gov]
                      ]),
                      createVNode("label", {
                        class: "form-check-label",
                        for: "check_goverment"
                      }, " Government bills ")
                    ]),
                    createVNode("div", { class: "form-check" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => _ctx.filterSettings.billTypes.mem = $event,
                        class: "form-check-input",
                        type: "checkbox",
                        value: "",
                        id: "check_members"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, _ctx.filterSettings.billTypes.mem]
                      ]),
                      createVNode("label", {
                        class: "form-check-label",
                        for: "check_members"
                      }, " Members' bills ")
                    ]),
                    createVNode("div", { class: "form-check" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => _ctx.filterSettings.billTypes.loc = $event,
                        class: "form-check-input",
                        type: "checkbox",
                        value: "",
                        id: "check_local"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, _ctx.filterSettings.billTypes.loc]
                      ]),
                      createVNode("label", {
                        class: "form-check-label",
                        for: "check_local"
                      }, " Local bills ")
                    ]),
                    createVNode("div", { class: "form-check" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => _ctx.filterSettings.billTypes.pri = $event,
                        class: "form-check-input",
                        type: "checkbox",
                        value: "",
                        id: "check_private"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, _ctx.filterSettings.billTypes.pri]
                      ]),
                      createVNode("label", {
                        class: "form-check-label",
                        for: "check_private"
                      }, " Private bills ")
                    ]),
                    createVNode("small", null, [
                      createVNode("strong", null, "OR"),
                      createTextVNode(": Votes must be for a bill of one of the selected types to be shown.")
                    ])
                  ]),
                  createVNode("div", { class: "col-12 col-xl-3" }, [
                    createVNode("h5", null, "Vote options"),
                    createVNode("label", { for: "parliament_select" }, "Parliamentary term"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => _ctx.filterSettings.parliamentaryTerm = $event,
                      class: "form-select",
                      id: "parliament_select",
                      "aria-label": "-"
                    }, [
                      createVNode("option", {
                        value: "",
                        selected: ""
                      }, "Any"),
                      createVNode("option", { value: "53" }, "53rd Parliament"),
                      createVNode("option", { value: "52" }, "52nd Parliament"),
                      createVNode("option", { value: "51" }, "51st Parliament"),
                      createVNode("option", { value: "50" }, "50th Parliament")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, _ctx.filterSettings.parliamentaryTerm]
                    ]),
                    createVNode("label", {
                      for: "vote_type_select",
                      class: "mt-2"
                    }, "Vote type"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => _ctx.filterSettings.characteristics.type = $event,
                      class: "form-select",
                      id: "vote_type_select",
                      "aria-label": "Vote type"
                    }, [
                      createVNode("option", {
                        value: "",
                        selected: ""
                      }, "Any"),
                      createVNode("option", { value: "personal" }, "Personal vote"),
                      createVNode("option", { value: "party" }, "Party vote")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, _ctx.filterSettings.characteristics.type]
                    ]),
                    createVNode("small", null, [
                      createVNode("strong", null, "AND"),
                      createTextVNode(": Votes must meet both of these criteria to be shown.")
                    ])
                  ]),
                  createVNode("div", { class: "col-12 col-xl-3" }, [
                    createVNode("h5", null, "Display options"),
                    createVNode("label", { for: "per_page_select" }, "Results per page"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => _ctx.filterSettings.format.perPage = $event,
                      class: "form-select",
                      id: "per_page_select",
                      "aria-label": "Results per page"
                    }, [
                      createVNode("option", {
                        value: "10",
                        selected: ""
                      }, "10"),
                      createVNode("option", { value: "25" }, "25"),
                      createVNode("option", { value: "50" }, "50"),
                      createVNode("option", { value: "100" }, "100")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, _ctx.filterSettings.format.perPage]
                    ]),
                    createVNode("label", {
                      for: "order_by_select",
                      class: "mt-2"
                    }, "Order by"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => _ctx.filterSettings.format.orderBy = $event,
                      class: "form-select",
                      id: "order_by_select",
                      "aria-label": "Order by"
                    }, [
                      createVNode("option", {
                        value: "date_desc",
                        selected: ""
                      }, "Date (newest first)"),
                      createVNode("option", { value: "date_asc" }, "Date (oldest first)"),
                      createVNode("option", { value: "reading_desc" }, "Reading (latest first)"),
                      createVNode("option", { value: "reading_asc" }, "Reading (earliest first)")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, _ctx.filterSettings.format.orderBy]
                    ])
                  ])
                ]),
                createVNode("hr"),
                createVNode("div", { class: "row" }, [
                  createVNode("div", { class: "col-12" }, [
                    _ctx.activeString != _ctx.userString && !_ctx.isLoading ? (openBlock(), createBlock("button", {
                      key: 0,
                      onClick: ($event) => _ctx.applyFilter(),
                      class: "btn btn-primary",
                      type: "button",
                      id: "button-addon2"
                    }, "Refine selection", 8, ["onClick"])) : (openBlock(), createBlock("button", {
                      key: 1,
                      disabled: "",
                      class: "btn btn-primary",
                      type: "button",
                      id: "button-addon2"
                    }, "Refine selection")),
                    _ctx.isLoading ? (openBlock(), createBlock(_component_Spinner, {
                      key: 2,
                      class: "ms-2"
                    })) : createCommentVNode("", true)
                  ])
                ])
              ], 40, ["onSubmit"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span id="results-marker" data-v-65def93c></span>`);
      if (_ctx.page) {
        _push(`<div data-v-65def93c><h4 data-v-65def93c>Results</h4> ${ssrInterpolate(_ctx.displayCount)} result`);
        if (_ctx.displayCount != 1) {
          _push(`<span data-v-65def93c>s</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`. <!--[-->`);
        ssrRenderList(_ctx.displayVotes, (vote) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            title: vote.name,
            key: vote.id,
            to: "/votes/" + vote.id,
            class: "vote-link"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_Card, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<div class="row" data-v-65def93c${_scopeId2}><div class="col-12 col-xl-5" data-v-65def93c${_scopeId2}><h6 class="mb-0" data-v-65def93c${_scopeId2}>${ssrInterpolate(vote.name)}</h6><small class="me-1" data-v-65def93c${_scopeId2}>`);
                      if (vote.type_desc) {
                        _push3(`<span class="badge bg-primary text-uppercase" data-v-65def93c${_scopeId2}>${ssrInterpolate(vote.type_desc)}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</small><small class="text-muted text-uppercase" data-v-65def93c${_scopeId2}>${ssrInterpolate(_ctx.formattedDateFull(vote.date))}</small><hr class="col-12 d-xl-none mt-2" data-v-65def93c${_scopeId2}></div><div class="col-12 col-xl-7" data-v-65def93c${_scopeId2}><div class="row" data-v-65def93c${_scopeId2}><div class="col-3 text-center" data-v-65def93c${_scopeId2}><h3 data-v-65def93c${_scopeId2}>${ssrInterpolate(vote.ayes)}</h3><h6 class="text-muted text-uppercase" data-v-65def93c${_scopeId2}><span class="dot-yes" data-v-65def93c${_scopeId2}></span> Ayes</h6></div><div class="col-3 text-center" data-v-65def93c${_scopeId2}><h3 data-v-65def93c${_scopeId2}>${ssrInterpolate(vote.noes)}</h3><h6 class="text-muted text-uppercase" data-v-65def93c${_scopeId2}><span class="dot-no" data-v-65def93c${_scopeId2}></span> Noes</h6></div><div class="col-3 text-center" data-v-65def93c${_scopeId2}><h3 data-v-65def93c${_scopeId2}>${ssrInterpolate(vote.abstentions)}</h3><h6 class="text-muted text-uppercase" data-v-65def93c${_scopeId2}><span class="dot-abstain" data-v-65def93c${_scopeId2}></span> Abstentions</h6></div><div class="col-3 text-center" data-v-65def93c${_scopeId2}><h3 data-v-65def93c${_scopeId2}>${ssrInterpolate(vote.absent)}</h3><h6 class="text-muted text-uppercase" data-v-65def93c${_scopeId2}><span class="dot-absent" data-v-65def93c${_scopeId2}></span> Absent</h6></div></div></div></div>`);
                    } else {
                      return [
                        createVNode("div", { class: "row" }, [
                          createVNode("div", { class: "col-12 col-xl-5" }, [
                            createVNode("h6", { class: "mb-0" }, toDisplayString(vote.name), 1),
                            createVNode("small", { class: "me-1" }, [
                              vote.type_desc ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "badge bg-primary text-uppercase"
                              }, toDisplayString(vote.type_desc), 1)) : createCommentVNode("", true)
                            ]),
                            createVNode("small", { class: "text-muted text-uppercase" }, toDisplayString(_ctx.formattedDateFull(vote.date)), 1),
                            createVNode("hr", { class: "col-12 d-xl-none mt-2" })
                          ]),
                          createVNode("div", { class: "col-12 col-xl-7" }, [
                            createVNode("div", { class: "row" }, [
                              createVNode("div", { class: "col-3 text-center" }, [
                                createVNode("h3", null, toDisplayString(vote.ayes), 1),
                                createVNode("h6", { class: "text-muted text-uppercase" }, [
                                  createVNode("span", { class: "dot-yes" }),
                                  createTextVNode(" Ayes")
                                ])
                              ]),
                              createVNode("div", { class: "col-3 text-center" }, [
                                createVNode("h3", null, toDisplayString(vote.noes), 1),
                                createVNode("h6", { class: "text-muted text-uppercase" }, [
                                  createVNode("span", { class: "dot-no" }),
                                  createTextVNode(" Noes")
                                ])
                              ]),
                              createVNode("div", { class: "col-3 text-center" }, [
                                createVNode("h3", null, toDisplayString(vote.abstentions), 1),
                                createVNode("h6", { class: "text-muted text-uppercase" }, [
                                  createVNode("span", { class: "dot-abstain" }),
                                  createTextVNode(" Abstentions")
                                ])
                              ]),
                              createVNode("div", { class: "col-3 text-center" }, [
                                createVNode("h3", null, toDisplayString(vote.absent), 1),
                                createVNode("h6", { class: "text-muted text-uppercase" }, [
                                  createVNode("span", { class: "dot-absent" }),
                                  createTextVNode(" Absent")
                                ])
                              ])
                            ])
                          ])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_Card, null, {
                    default: withCtx(() => [
                      createVNode("div", { class: "row" }, [
                        createVNode("div", { class: "col-12 col-xl-5" }, [
                          createVNode("h6", { class: "mb-0" }, toDisplayString(vote.name), 1),
                          createVNode("small", { class: "me-1" }, [
                            vote.type_desc ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "badge bg-primary text-uppercase"
                            }, toDisplayString(vote.type_desc), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("small", { class: "text-muted text-uppercase" }, toDisplayString(_ctx.formattedDateFull(vote.date)), 1),
                          createVNode("hr", { class: "col-12 d-xl-none mt-2" })
                        ]),
                        createVNode("div", { class: "col-12 col-xl-7" }, [
                          createVNode("div", { class: "row" }, [
                            createVNode("div", { class: "col-3 text-center" }, [
                              createVNode("h3", null, toDisplayString(vote.ayes), 1),
                              createVNode("h6", { class: "text-muted text-uppercase" }, [
                                createVNode("span", { class: "dot-yes" }),
                                createTextVNode(" Ayes")
                              ])
                            ]),
                            createVNode("div", { class: "col-3 text-center" }, [
                              createVNode("h3", null, toDisplayString(vote.noes), 1),
                              createVNode("h6", { class: "text-muted text-uppercase" }, [
                                createVNode("span", { class: "dot-no" }),
                                createTextVNode(" Noes")
                              ])
                            ]),
                            createVNode("div", { class: "col-3 text-center" }, [
                              createVNode("h3", null, toDisplayString(vote.abstentions), 1),
                              createVNode("h6", { class: "text-muted text-uppercase" }, [
                                createVNode("span", { class: "dot-abstain" }),
                                createTextVNode(" Abstentions")
                              ])
                            ]),
                            createVNode("div", { class: "col-3 text-center" }, [
                              createVNode("h3", null, toDisplayString(vote.absent), 1),
                              createVNode("h6", { class: "text-muted text-uppercase" }, [
                                createVNode("span", { class: "dot-absent" }),
                                createTextVNode(" Absent")
                              ])
                            ])
                          ])
                        ])
                      ])
                    ]),
                    _: 2
                  }, 1024)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        if (!_ctx.isLoading && !_ctx.hasLoadedData && unref(prefetchData) && _ctx.displayCount > 1) {
          _push(`<nav aria-label="votes_pagination" data-v-65def93c><ul class="pagination mb-1" data-v-65def93c><li class="${ssrRenderClass([{ disabled: !_ctx.displayPrevious }, "page-item"])}" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>Previous</a></li>`);
          if (_ctx.displayPrevious) {
            _push(`<li class="page-item" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>${ssrInterpolate(_ctx.displayPage - 1)}</a></li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<li class="page-item active" aria-current="page" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>${ssrInterpolate(_ctx.displayPage)}</a></li>`);
          if (_ctx.displayNext) {
            _push(`<li class="page-item" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>${ssrInterpolate(_ctx.displayPage + 1)}</a></li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<li class="${ssrRenderClass([{ disabled: !_ctx.displayNext }, "page-item"])}" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>Next</a></li></ul>`);
          if (_ctx.displayPage != 1) {
            _push(`<a id="back-to-start" href="#results-marker" data-v-65def93c><small data-v-65def93c>Back to start</small></a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</nav>`);
        } else {
          _push(`<!---->`);
        }
        if (!_ctx.isLoading && _ctx.hasLoadedData && _ctx.displayCount > 1) {
          _push(`<nav aria-label="votes_pagination" data-v-65def93c><ul class="pagination mb-1" data-v-65def93c><li class="${ssrRenderClass([{ disabled: !_ctx.displayPrevious }, "page-item"])}" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>Previous</a></li>`);
          if (_ctx.displayPrevious) {
            _push(`<li class="page-item" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>${ssrInterpolate(_ctx.displayPage - 1)}</a></li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<li class="page-item active" aria-current="page" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>${ssrInterpolate(_ctx.displayPage)}</a></li>`);
          if (_ctx.displayNext) {
            _push(`<li class="page-item" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>${ssrInterpolate(_ctx.displayPage + 1)}</a></li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<li class="${ssrRenderClass([{ disabled: !_ctx.displayNext }, "page-item"])}" data-v-65def93c><a class="page-link" href="#results-marker" data-v-65def93c>Next</a></li></ul>`);
          if (_ctx.displayPage != 1) {
            _push(`<a id="back-to-start" href="#results-marker" data-v-65def93c><small data-v-65def93c>Back to start</small></a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</nav>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VoteFilter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-65def93c"]]);
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_FontAwesomeIcon = __nuxt_component_1;
  const _component_VoteFilter = __nuxt_component_2;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-835e00a6>`);
  _push(ssrRenderComponent(_component_PageHeader, { pageTitle: "Votes" }, null, _parent));
  _push(`<div class="container" data-v-835e00a6><div class="row mt-3" data-v-835e00a6><div class="col-12" data-v-835e00a6><h4 data-v-835e00a6>Parliament votes on bills and amendments many times before they become law.</h4><p data-v-835e00a6>There are four types of votes that can happen: <ul id="vote-types-list" data-v-835e00a6><li data-v-835e00a6>`);
  _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "person"] }, null, _parent));
  _push(` <strong data-v-835e00a6>Personal votes: </strong> MPs&#39; votes were cast and recorded individually. </li><li data-v-835e00a6>`);
  _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }, null, _parent));
  _push(` <strong data-v-835e00a6>Split-party votes: </strong> Votes which are conducted as a party vote, but one or more parties opts to split their vote across multiple positions. The position of each MP within those parties is recorded individually. </li><li data-v-835e00a6>`);
  _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }, null, _parent));
  _push(` <strong data-v-835e00a6>Party votes: </strong> Parties cast one vote on behalf of all their MPs. </li><li data-v-835e00a6>`);
  _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "microphone-lines"] }, null, _parent));
  _push(` <strong data-v-835e00a6>Voice votes: </strong> MPs shout &quot;aye&quot; or &quot;no&quot;, and the Speaker or Chairperson determines the result based on what they hear. The positions of individual MPs or parties aren&#39;t recorded. Any MP can ask for a party or personal vote to be conducted after a voice vote. Voice votes aren&#39;t shown on WhereTheyStand </li></ul></p><p data-v-835e00a6>Currently, WhereTheyStand only contains records of &quot;reading votes&quot; (votes for a bill&#39;s first, second or third reading). Over time, this will be expanded to include other votes, like those during the Committee of the whole House stage.</p></div><div class="col-12" data-v-835e00a6>`);
  _push(ssrRenderComponent(_component_VoteFilter, null, null, _parent));
  _push(`</div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/votes/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-835e00a6"]]);

export { index as default };
//# sourceMappingURL=index-098bf1e6.mjs.map
