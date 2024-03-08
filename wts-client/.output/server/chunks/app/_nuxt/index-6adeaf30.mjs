import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as _export_sfc, u as useFetch, A as API_BASE, H as Head, L as Link, a as __nuxt_component_2, d as __nuxt_component_0$1, e as __nuxt_component_1$1 } from '../server.mjs';
import { _ as __nuxt_component_3 } from './Spinner-368da257.mjs';
import { useSSRContext, withCtx, openBlock, createBlock, createCommentVNode, createVNode, withModifiers, withDirectives, vModelText, vModelCheckbox, createTextVNode, vModelSelect, toDisplayString } from 'vue';
import { formatDistanceToNow, parse, format } from 'date-fns';
import { useRoute } from 'vue-router';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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

const _sfc_main$1 = {
  async setup() {
    const query = useRoute().query;
    var initialPage = 1;
    if (query.hasOwnProperty("page")) {
      initialPage = query.page;
    }
    const { data: prefetchData } = await useFetch(
      API_BASE + "bills/?page=" + initialPage + "&per_page=10",
      "$ceS4NSgd1z"
    );
    return { prefetchData };
  },
  name: "BillFilter",
  data() {
    return {
      page: 1,
      perPage: 10,
      hasLoadedData: false,
      next: false,
      bills: [],
      previous: false,
      count: 0,
      isLoading: false,
      showDescriptions: true,
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
          votingMethod: ""
        },
        format: {
          perPage: 10,
          orderBy: "date_modified_desc"
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
          votingMethod: ""
        },
        format: {
          perPage: 10,
          orderBy: "date_modified_desc"
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
    displayBills() {
      if (!this.hasLoadedData && this.prefetchData) {
        return this.prefetchData.results;
      } else {
        return this.bills;
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
      var url = API_BASE + "bills/?";
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
      this.bills = r.results;
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
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Link = Link;
  const _component_Card = __nuxt_component_2;
  const _component_Spinner = __nuxt_component_3;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_font_awesome_icon = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-4ef0ddcf><h4 data-v-4ef0ddcf>Filter bills</h4>`);
  if ($setup.prefetchData && $setup.prefetchData.count && $setup.prefetchData.count > 0) {
    _push(ssrRenderComponent(_component_Head, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          if ($setup.prefetchData.previous && $setup.prefetchData.page == 2) {
            _push2(ssrRenderComponent(_component_Link, {
              rel: "prev",
              href: "/bills"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($setup.prefetchData.previous && $setup.prefetchData.page != 2) {
            _push2(ssrRenderComponent(_component_Link, {
              rel: "prev",
              href: "/bills?page=" + ($setup.prefetchData.page - 1)
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($setup.prefetchData.next) {
            _push2(ssrRenderComponent(_component_Link, {
              rel: "next",
              href: "/bills?page=" + ($setup.prefetchData.page + 1)
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
        } else {
          return [
            $setup.prefetchData.previous && $setup.prefetchData.page == 2 ? (openBlock(), createBlock(_component_Link, {
              key: 0,
              rel: "prev",
              href: "/bills"
            })) : createCommentVNode("", true),
            $setup.prefetchData.previous && $setup.prefetchData.page != 2 ? (openBlock(), createBlock(_component_Link, {
              key: 1,
              rel: "prev",
              href: "/bills?page=" + ($setup.prefetchData.page - 1)
            }, null, 8, ["href"])) : createCommentVNode("", true),
            $setup.prefetchData.next ? (openBlock(), createBlock(_component_Link, {
              key: 2,
              rel: "next",
              href: "/bills?page=" + ($setup.prefetchData.page + 1)
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
        _push2(`<form data-v-4ef0ddcf${_scopeId}><div class="row mb-2" data-v-4ef0ddcf${_scopeId}><div class="col-12" data-v-4ef0ddcf${_scopeId}><h5 data-v-4ef0ddcf${_scopeId}>Refine by title</h5><label for="text_filter" data-v-4ef0ddcf${_scopeId}>Title must contain the following:</label><input${ssrRenderAttr("value", $data.filterSettings.titleContains)} class="form-control" type="input" id="text_filter" data-v-4ef0ddcf${_scopeId}><small class="text-muted" data-v-4ef0ddcf${_scopeId}>For less strict textual search, you may wish to use the site-wide search function.</small></div></div><hr data-v-4ef0ddcf${_scopeId}><div class="row" data-v-4ef0ddcf${_scopeId}><div class="col-12 col-xl-3" data-v-4ef0ddcf${_scopeId}><h5 data-v-4ef0ddcf${_scopeId}>Bill types</h5><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.billTypes.gov) ? ssrLooseContain($data.filterSettings.billTypes.gov, "") : $data.filterSettings.billTypes.gov) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_goverment" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_goverment" data-v-4ef0ddcf${_scopeId}> Government bills </label></div><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.billTypes.mem) ? ssrLooseContain($data.filterSettings.billTypes.mem, "") : $data.filterSettings.billTypes.mem) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_members" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_members" data-v-4ef0ddcf${_scopeId}> Members&#39; bills </label></div><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.billTypes.loc) ? ssrLooseContain($data.filterSettings.billTypes.loc, "") : $data.filterSettings.billTypes.loc) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_local" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_local" data-v-4ef0ddcf${_scopeId}> Local bills </label></div><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.billTypes.pri) ? ssrLooseContain($data.filterSettings.billTypes.pri, "") : $data.filterSettings.billTypes.pri) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_private" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_private" data-v-4ef0ddcf${_scopeId}> Private bills </label></div><small data-v-4ef0ddcf${_scopeId}><strong data-v-4ef0ddcf${_scopeId}>OR</strong>: Bills must be any of the selected type to be shown.</small></div><div class="col-12 col-xl-3" data-v-4ef0ddcf${_scopeId}><h5 data-v-4ef0ddcf${_scopeId}>Temporal characteristics</h5><label for="parliament_select" data-v-4ef0ddcf${_scopeId}>Parliamentary term of introduction</label><select class="form-select" id="parliament_select" aria-label="-" data-v-4ef0ddcf${_scopeId}><option value="" selected data-v-4ef0ddcf${_scopeId}>Any</option><option value="54" data-v-4ef0ddcf${_scopeId}>54th Parliament</option><option value="53" data-v-4ef0ddcf${_scopeId}>53rd Parliament</option><option value="52" data-v-4ef0ddcf${_scopeId}>52nd Parliament</option><option value="51" data-v-4ef0ddcf${_scopeId}>51st Parliament</option><option value="50" data-v-4ef0ddcf${_scopeId}>50th Parliament</option></select></div><div class="col-12 col-xl-3" data-v-4ef0ddcf${_scopeId}><h5 data-v-4ef0ddcf${_scopeId}>Procedural characteristics</h5><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.characteristics.urgencyUsed) ? ssrLooseContain($data.filterSettings.characteristics.urgencyUsed, "") : $data.filterSettings.characteristics.urgencyUsed) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_urgency" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_urgency" data-v-4ef0ddcf${_scopeId}> Urgency used </label></div><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.characteristics.extendedSittingsUsed) ? ssrLooseContain($data.filterSettings.characteristics.extendedSittingsUsed, "") : $data.filterSettings.characteristics.extendedSittingsUsed) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_extended" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_extended" data-v-4ef0ddcf${_scopeId}> Extended sittings used </label></div><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.filterSettings.characteristics.submissionsOpen) ? ssrLooseContain($data.filterSettings.characteristics.submissionsOpen, "") : $data.filterSettings.characteristics.submissionsOpen) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_submissions_open" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_submissions_open" data-v-4ef0ddcf${_scopeId}> Open for submissions </label></div><label for="voting_method_select" class="mt-2" data-v-4ef0ddcf${_scopeId}>Voting method</label><select class="form-select" id="voting_method_select" aria-label="Voting method" data-v-4ef0ddcf${_scopeId}><option value="" selected data-v-4ef0ddcf${_scopeId}>Any</option><option value="per" data-v-4ef0ddcf${_scopeId}>Personal voting used</option><option value="par" data-v-4ef0ddcf${_scopeId}>Party voting used</option></select><small data-v-4ef0ddcf${_scopeId}><strong data-v-4ef0ddcf${_scopeId}>AND</strong>: Bills must meet all of these criteria to be shown.</small></div></div><hr data-v-4ef0ddcf${_scopeId}><h5 data-v-4ef0ddcf${_scopeId}>Display options</h5><div class="row" data-v-4ef0ddcf${_scopeId}><div class="col-12 col-xl-3" data-v-4ef0ddcf${_scopeId}><label for="per_page_select" data-v-4ef0ddcf${_scopeId}>Results per page</label><select class="form-select" id="per_page_select" aria-label="Results per page" data-v-4ef0ddcf${_scopeId}><option value="10" selected data-v-4ef0ddcf${_scopeId}>10</option><option value="25" data-v-4ef0ddcf${_scopeId}>25</option><option value="50" data-v-4ef0ddcf${_scopeId}>50</option><option value="100" data-v-4ef0ddcf${_scopeId}>100</option></select><div class="form-check" data-v-4ef0ddcf${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray($data.showDescriptions) ? ssrLooseContain($data.showDescriptions, "") : $data.showDescriptions) ? " checked" : ""} class="form-check-input" type="checkbox" value="" id="check_show_descriptions" data-v-4ef0ddcf${_scopeId}><label class="form-check-label" for="check_show_descriptions" data-v-4ef0ddcf${_scopeId}> Show bill descriptions </label></div></div><div class="col-12 col-xl-3" data-v-4ef0ddcf${_scopeId}><label for="order_by_select" data-v-4ef0ddcf${_scopeId}>Order by</label><select class="form-select" id="order_by_select" aria-label="Order by" data-v-4ef0ddcf${_scopeId}><option value="date_modified_desc" selected data-v-4ef0ddcf${_scopeId}>Date modified (newest first)</option><option value="date_modified_asc" data-v-4ef0ddcf${_scopeId}>Date modified (oldest first)</option><option value="introduction_date_desc" data-v-4ef0ddcf${_scopeId}>Introduction date (newest first)</option><option value="introduction_date_asc" data-v-4ef0ddcf${_scopeId}>Introduction date (oldest first)</option><option value="progress_desc" data-v-4ef0ddcf${_scopeId}>Status (later stages first)</option><option value="progress_asc" data-v-4ef0ddcf${_scopeId}>Status (early stages first)</option></select></div></div><hr data-v-4ef0ddcf${_scopeId}><div class="row" data-v-4ef0ddcf${_scopeId}><div class="col-12" data-v-4ef0ddcf${_scopeId}>`);
        if ($options.activeString != $options.userString && !$data.isLoading) {
          _push2(`<button class="btn btn-primary" type="button" id="button-addon2" data-v-4ef0ddcf${_scopeId}>Refine selection</button>`);
        } else {
          _push2(`<button disabled class="btn btn-primary" type="button" id="button-addon2" data-v-4ef0ddcf${_scopeId}>Refine selection</button>`);
        }
        if ($data.isLoading) {
          _push2(ssrRenderComponent(_component_Spinner, { class: "ms-2" }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div></div></form>`);
      } else {
        return [
          createVNode("form", {
            onSubmit: withModifiers(($event) => $options.applyFilter(), ["prevent"])
          }, [
            createVNode("div", { class: "row mb-2" }, [
              createVNode("div", { class: "col-12" }, [
                createVNode("h5", null, "Refine by title"),
                createVNode("label", { for: "text_filter" }, "Title must contain the following:"),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => $data.filterSettings.titleContains = $event,
                  class: "form-control",
                  type: "input",
                  id: "text_filter"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, $data.filterSettings.titleContains]
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
                    "onUpdate:modelValue": ($event) => $data.filterSettings.billTypes.gov = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_goverment"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.billTypes.gov]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_goverment"
                  }, " Government bills ")
                ]),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.filterSettings.billTypes.mem = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_members"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.billTypes.mem]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_members"
                  }, " Members' bills ")
                ]),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.filterSettings.billTypes.loc = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_local"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.billTypes.loc]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_local"
                  }, " Local bills ")
                ]),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.filterSettings.billTypes.pri = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_private"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.billTypes.pri]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_private"
                  }, " Private bills ")
                ]),
                createVNode("small", null, [
                  createVNode("strong", null, "OR"),
                  createTextVNode(": Bills must be any of the selected type to be shown.")
                ])
              ]),
              createVNode("div", { class: "col-12 col-xl-3" }, [
                createVNode("h5", null, "Temporal characteristics"),
                createVNode("label", { for: "parliament_select" }, "Parliamentary term of introduction"),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => $data.filterSettings.parliamentaryTerm = $event,
                  class: "form-select",
                  id: "parliament_select",
                  "aria-label": "-"
                }, [
                  createVNode("option", {
                    value: "",
                    selected: ""
                  }, "Any"),
                  createVNode("option", { value: "54" }, "54th Parliament"),
                  createVNode("option", { value: "53" }, "53rd Parliament"),
                  createVNode("option", { value: "52" }, "52nd Parliament"),
                  createVNode("option", { value: "51" }, "51st Parliament"),
                  createVNode("option", { value: "50" }, "50th Parliament")
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, $data.filterSettings.parliamentaryTerm]
                ])
              ]),
              createVNode("div", { class: "col-12 col-xl-3" }, [
                createVNode("h5", null, "Procedural characteristics"),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.filterSettings.characteristics.urgencyUsed = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_urgency"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.characteristics.urgencyUsed]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_urgency"
                  }, " Urgency used ")
                ]),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.filterSettings.characteristics.extendedSittingsUsed = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_extended"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.characteristics.extendedSittingsUsed]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_extended"
                  }, " Extended sittings used ")
                ]),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.filterSettings.characteristics.submissionsOpen = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_submissions_open"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.filterSettings.characteristics.submissionsOpen]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_submissions_open"
                  }, " Open for submissions ")
                ]),
                createVNode("label", {
                  for: "voting_method_select",
                  class: "mt-2"
                }, "Voting method"),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => $data.filterSettings.characteristics.votingMethod = $event,
                  class: "form-select",
                  id: "voting_method_select",
                  "aria-label": "Voting method"
                }, [
                  createVNode("option", {
                    value: "",
                    selected: ""
                  }, "Any"),
                  createVNode("option", { value: "per" }, "Personal voting used"),
                  createVNode("option", { value: "par" }, "Party voting used")
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, $data.filterSettings.characteristics.votingMethod]
                ]),
                createVNode("small", null, [
                  createVNode("strong", null, "AND"),
                  createTextVNode(": Bills must meet all of these criteria to be shown.")
                ])
              ])
            ]),
            createVNode("hr"),
            createVNode("h5", null, "Display options"),
            createVNode("div", { class: "row" }, [
              createVNode("div", { class: "col-12 col-xl-3" }, [
                createVNode("label", { for: "per_page_select" }, "Results per page"),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => $data.filterSettings.format.perPage = $event,
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
                  [vModelSelect, $data.filterSettings.format.perPage]
                ]),
                createVNode("div", { class: "form-check" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.showDescriptions = $event,
                    class: "form-check-input",
                    type: "checkbox",
                    value: "",
                    id: "check_show_descriptions"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, $data.showDescriptions]
                  ]),
                  createVNode("label", {
                    class: "form-check-label",
                    for: "check_show_descriptions"
                  }, " Show bill descriptions ")
                ])
              ]),
              createVNode("div", { class: "col-12 col-xl-3" }, [
                createVNode("label", { for: "order_by_select" }, "Order by"),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => $data.filterSettings.format.orderBy = $event,
                  class: "form-select",
                  id: "order_by_select",
                  "aria-label": "Order by"
                }, [
                  createVNode("option", {
                    value: "date_modified_desc",
                    selected: ""
                  }, "Date modified (newest first)"),
                  createVNode("option", { value: "date_modified_asc" }, "Date modified (oldest first)"),
                  createVNode("option", { value: "introduction_date_desc" }, "Introduction date (newest first)"),
                  createVNode("option", { value: "introduction_date_asc" }, "Introduction date (oldest first)"),
                  createVNode("option", { value: "progress_desc" }, "Status (later stages first)"),
                  createVNode("option", { value: "progress_asc" }, "Status (early stages first)")
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, $data.filterSettings.format.orderBy]
                ])
              ])
            ]),
            createVNode("hr"),
            createVNode("div", { class: "row" }, [
              createVNode("div", { class: "col-12" }, [
                $options.activeString != $options.userString && !$data.isLoading ? (openBlock(), createBlock("button", {
                  key: 0,
                  onClick: ($event) => $options.applyFilter(),
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
                $data.isLoading ? (openBlock(), createBlock(_component_Spinner, {
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
  _push(`<span id="results-marker" data-v-4ef0ddcf></span>`);
  if ($data.page) {
    _push(`<div data-v-4ef0ddcf><h4 data-v-4ef0ddcf>Results</h4> ${ssrInterpolate($options.displayCount)} result`);
    if ($options.displayCount != 1) {
      _push(`<span data-v-4ef0ddcf>s</span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`. <!--[-->`);
    ssrRenderList($options.displayBills, (bill) => {
      _push(ssrRenderComponent(_component_NuxtLink, {
        title: bill.name,
        key: bill.id,
        to: "/bills/" + bill.id,
        class: "bill-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Card, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<h6 class="mb-0" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.name)}</h6><small class="me-1" data-v-4ef0ddcf${_scopeId2}>`);
                  if (bill.progress == "inp") {
                    _push3(`<span class="badge bg-primary text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "pas") {
                    _push3(`<span class="badge bg-success text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "ena") {
                    _push3(`<span class="badge bg-success text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "dis") {
                    _push3(`<span class="badge bg-warning text-dark text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "def") {
                    _push3(`<span class="badge bg-danger text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "lap") {
                    _push3(`<span class="badge bg-danger text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "unx") {
                    _push3(`<span class="badge bg-danger text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "div") {
                    _push3(`<span class="badge bg-info text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else if (bill.progress == "wit") {
                    _push3(`<span class="badge bg-warning text-dark text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  } else {
                    _push3(`<span class="badge bg-secondary text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.progress_desc)}</span>`);
                  }
                  _push3(`</small><small class="text-muted text-uppercase" data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.type_desc)}</small>`);
                  if (bill.description && $data.showDescriptions) {
                    _push3(`<p data-v-4ef0ddcf${_scopeId2}>${ssrInterpolate(bill.description)}</p>`);
                  } else if ($data.showDescriptions) {
                    _push3(`<p class="text-muted" data-v-4ef0ddcf${_scopeId2}> No description. </p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (!$data.showDescriptions) {
                    _push3(`<br data-v-4ef0ddcf${_scopeId2}>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<small data-v-4ef0ddcf${_scopeId2}>`);
                  if (bill.date_modified) {
                    _push3(`<span${ssrRenderAttr("title", $options.formattedDate(bill.date_modified))} class="text-muted" data-v-4ef0ddcf${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "history"] }, null, _parent3, _scopeId2));
                    _push3(` Last activity ${ssrInterpolate($options.relativeDate(bill.date_modified))}</span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</small>`);
                } else {
                  return [
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
                    bill.description && $data.showDescriptions ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(bill.description), 1)) : $data.showDescriptions ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-muted"
                    }, " No description. ")) : createCommentVNode("", true),
                    !$data.showDescriptions ? (openBlock(), createBlock("br", { key: 2 })) : createCommentVNode("", true),
                    createVNode("small", null, [
                      bill.date_modified ? (openBlock(), createBlock("span", {
                        key: 0,
                        title: $options.formattedDate(bill.date_modified),
                        class: "text-muted"
                      }, [
                        createVNode(_component_font_awesome_icon, { icon: ["fas", "history"] }),
                        createTextVNode(" Last activity " + toDisplayString($options.relativeDate(bill.date_modified)), 1)
                      ], 8, ["title"])) : createCommentVNode("", true)
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
                  bill.description && $data.showDescriptions ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(bill.description), 1)) : $data.showDescriptions ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "text-muted"
                  }, " No description. ")) : createCommentVNode("", true),
                  !$data.showDescriptions ? (openBlock(), createBlock("br", { key: 2 })) : createCommentVNode("", true),
                  createVNode("small", null, [
                    bill.date_modified ? (openBlock(), createBlock("span", {
                      key: 0,
                      title: $options.formattedDate(bill.date_modified),
                      class: "text-muted"
                    }, [
                      createVNode(_component_font_awesome_icon, { icon: ["fas", "history"] }),
                      createTextVNode(" Last activity " + toDisplayString($options.relativeDate(bill.date_modified)), 1)
                    ], 8, ["title"])) : createCommentVNode("", true)
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
    if (!$data.isLoading && !$data.hasLoadedData && $setup.prefetchData && $options.displayCount > 1) {
      _push(`<nav aria-label="bills_pagination" data-v-4ef0ddcf><ul class="pagination mb-1" data-v-4ef0ddcf><li class="${ssrRenderClass([{ disabled: !$options.displayPrevious }, "page-item"])}" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>Previous</a></li>`);
      if ($options.displayPrevious) {
        _push(`<li class="page-item" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>${ssrInterpolate($options.displayPage - 1)}</a></li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<li class="page-item active" aria-current="page" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>${ssrInterpolate($options.displayPage)}</a></li>`);
      if ($options.displayNext) {
        _push(`<li class="page-item" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>${ssrInterpolate($options.displayPage + 1)}</a></li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<li class="${ssrRenderClass([{ disabled: !$options.displayNext }, "page-item"])}" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>Next</a></li></ul>`);
      if ($options.displayPage != 1) {
        _push(`<a id="back-to-start" href="#results-marker" data-v-4ef0ddcf><small data-v-4ef0ddcf>Back to start</small></a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</nav>`);
    } else {
      _push(`<!---->`);
    }
    if (!$data.isLoading && $data.hasLoadedData && $options.displayCount > 1) {
      _push(`<nav aria-label="bills_pagination" data-v-4ef0ddcf><ul class="pagination mb-1" data-v-4ef0ddcf><li class="${ssrRenderClass([{ disabled: !$options.displayPrevious }, "page-item"])}" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>Previous</a></li>`);
      if ($options.displayPrevious) {
        _push(`<li class="page-item" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>${ssrInterpolate($options.displayPage - 1)}</a></li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<li class="page-item active" aria-current="page" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>${ssrInterpolate($options.displayPage)}</a></li>`);
      if ($options.displayNext) {
        _push(`<li class="page-item" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>${ssrInterpolate($options.displayPage + 1)}</a></li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<li class="${ssrRenderClass([{ disabled: !$options.displayNext }, "page-item"])}" data-v-4ef0ddcf><a class="page-link" href="#results-marker" data-v-4ef0ddcf>Next</a></li></ul>`);
      if ($options.displayPage != 1) {
        _push(`<a id="back-to-start" href="#results-marker" data-v-4ef0ddcf><small data-v-4ef0ddcf>Back to start</small></a>`);
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
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BillFilter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-4ef0ddcf"]]);
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_PageHeader = __nuxt_component_0;
  const _component_BillFilter = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_PageHeader, { pageTitle: "Bills" }, null, _parent));
  _push(`<div class="container"><div class="row mt-3"><div class="col-12"><h4>Bills are proposed changes to the law, and must each pass through several stages in Parliament before becoming law.</h4><p>Before any bill becomes law, there are three main votes it must pass: these are the first, second and third readings. For most bills, there is a chance for members of the public to make submissions at the select committee stage, which happens between the first and second readings.</p><p>After a bill passes its third reading vote, it is granted Royal Assent by the Governor-General and becomes law, subject to any commencement provisions contained within the bill.</p><p>WhereTheyStand contains all bills from the 51st Parliament and later (2014\u2014present). These are imported from Parliament&#39;s own website on a regular basis and are automatically linked with voting records and MPs&#39; profiles to make it easier for you to find what you are looking for.</p></div><div class="col-12">`);
  _push(ssrRenderComponent(_component_BillFilter, null, null, _parent));
  _push(`</div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bills/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-6adeaf30.mjs.map
