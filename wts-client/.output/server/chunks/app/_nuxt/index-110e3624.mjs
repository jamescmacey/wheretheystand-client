import { g as defineStore, u as useFetch, A as API_BASE, _ as _export_sfc, H as Head, M as Meta, a as __nuxt_component_2, e as __nuxt_component_1$1, b as __nuxt_component_6$1, d as __nuxt_component_0$1 } from '../server.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as __nuxt_component_7, a as __nuxt_component_3 } from './VoteSummary-73d34890.mjs';
import { _ as __nuxt_component_9 } from './PersonCard-61386b6b.mjs';
import { format, parse, parseISO, compareAsc, formatDistanceToNow } from 'date-fns';
import { useSSRContext, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './ColourDot-2c5d3e0d.mjs';

const _sfc_main$1 = {
  props: ["reading", "date", "passed"],
  methods: {
    formatDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    }
  },
  computed: {
    readingOrdinal() {
      return this.reading + { 1: "st reading", 2: "nd reading", 3: "rd reading" }[this.reading];
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2;
  _push(ssrRenderComponent(_component_Card, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h6 class="text-uppercase"${_scopeId}><strong${_scopeId}>${ssrInterpolate($options.readingOrdinal)}</strong></h6><h5 class="text-uppercase"${_scopeId}>`);
        if ($props.passed === true) {
          _push2(`<span${_scopeId}><span class="dot-yes"${_scopeId}></span> <strong${_scopeId}>Passed</strong></span>`);
        } else if ($props.passed === false) {
          _push2(`<span${_scopeId}><span class="dot-no"${_scopeId}></span> <strong${_scopeId}>Defeated</strong></span>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</h5><h6 class="text-muted"${_scopeId}>${ssrInterpolate($options.formatDate($props.date))}</h6><hr${_scopeId}><h6 class="text-muted text-center"${_scopeId}> WhereTheyStand has no totals for this vote. It might have been a voice vote, or there might have been an import error. </h6>`);
      } else {
        return [
          createVNode("h6", { class: "text-uppercase" }, [
            createVNode("strong", null, toDisplayString($options.readingOrdinal), 1)
          ]),
          createVNode("h5", { class: "text-uppercase" }, [
            $props.passed === true ? (openBlock(), createBlock("span", { key: 0 }, [
              createVNode("span", { class: "dot-yes" }),
              createTextVNode(),
              createVNode("strong", null, "Passed")
            ])) : $props.passed === false ? (openBlock(), createBlock("span", { key: 1 }, [
              createVNode("span", { class: "dot-no" }),
              createTextVNode(),
              createVNode("strong", null, "Defeated")
            ])) : createCommentVNode("", true)
          ]),
          createVNode("h6", { class: "text-muted" }, toDisplayString($options.formatDate($props.date)), 1),
          createVNode("hr"),
          createVNode("h6", { class: "text-muted text-center" }, " WhereTheyStand has no totals for this vote. It might have been a voice vote, or there might have been an import error. ")
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VoteSummaryBare.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_10 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);
const useBillsStore = defineStore("bills", {
  state() {
    return {
      items: []
    };
  },
  getters: {
    byID: (state) => (id) => {
      return state.items.find((bill) => bill.id == id);
    }
  },
  actions: {
    async fetch(id) {
      if (!this.byID(id)) {
        var state = this;
        await useFetch(API_BASE + "bills/" + id + "/", {
          onResponse({ request, response, options }) {
            state.items.push(response._data);
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$a9h0pBoHpw");
      }
    }
  }
});
const _sfc_main = {
  name: "Bill",
  setup() {
    const billsStore = useBillsStore();
    return { billsStore };
  },
  created() {
    this.billsStore.fetch(this.$route.params.id);
  },
  methods: {
    formatDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    },
    formatDateTime(datetime) {
      return format(parseISO(datetime), "d MMMM yyyy 'at' HH:mm OOOO");
    }
  },
  computed: {
    bill() {
      return this.billsStore.byID(this.$route.params.id);
    },
    progressExplanation() {
      if (!this.bill) {
        return "";
      } else if (this.bill.progress === "inp") {
        if (this.bill.dates.whole_house_date) {
          return "The Committee of the whole House concluded its consideration of this Bill on " + this.formatDate(this.bill.dates.whole_house_date) + " and the Bill is awaiting its third reading.";
        } else if (this.bill.dates.second_reading_date) {
          return "This Bill passed its second reading on " + this.formatDate(this.bill.dates.second_reading_date) + " and is awaiting the Commitee of the whole House stage.";
        } else if (this.bill.dates.first_reading_date) {
          var msg = "This Bill passed its first reading on " + this.formatDate(this.bill.dates.first_reading_date) + ". ";
          if (this.bill.dates.report_back_date) {
            if (compareAsc(parseISO(this.bill.dates.report_back_date), /* @__PURE__ */ new Date()) > 0) {
              msg = msg + "The Select Committee is due to report back on " + this.formatDate(this.bill.dates.report_back_date) + ". Following this, the Bill will be ready for its second reading. ";
            } else {
              msg = msg + "The Select Committee report was due back on " + this.formatDate(this.bill.dates.report_back_date) + " and the Bill is awaiting its second reading. ";
            }
          }
          if (this.bill.dates.submissions_due_date) {
            if (compareAsc(parseISO(this.bill.dates.submissions_due_date), /* @__PURE__ */ new Date()) > 0) {
              msg = msg + "Public submissions are due on " + this.formatDate(this.bill.dates.submissions_due_date) + ". ";
            } else {
              msg = msg + "Public submissions were due on " + this.formatDate(this.bill.dates.submissions_due_date) + ". ";
            }
          }
          return msg;
        } else if (this.bill.dates.introduction_date) {
          return "This Bill was introduced on " + this.formatDate(this.bill.dates.introduction_date) + " and is awaiting its first reading.";
        }
      }
      const EXPLANATIONS = {
        ena: "This Bill has been passed by Parliament, and signed into law by the Governor-General in a step called Royal Assent. This doesn't mean that everything the Act implements has come into force yet, but it does mean that the Act is on the statute books.",
        pas: "This Bill has been passed by Parliament, but hasn't been given Royal Assent by the Governor-General. Once this happens, the Bill will become law.",
        def: "This Bill has been defeated in a vote of MPs, which means that it will not be progressing and will not become law.",
        wit: "This Bill has been withdrawn, which means that it will not be progressing and will not become law.",
        lap: "This Bill has lapsed. At the end of each Parliamentary term, bills which are still in progress lapse unless they are reinstated in the next term.",
        unx: "This Bill is classed as 'not current' on Parliament's website, which means it is likely that the Bill was either defeated or withdrawn. Unfortunately, WhereTheyStand has not been able to ascertain this information based on the Bill's page on the Parliament website.",
        div: "This Bill has been divided into multiple bills.",
        unk: "WhereTheyStand isn't sure what's happening with this Bill.",
        dis: "This Bill has been discharged by Parliament, which means that it will not be progressing and will not become law."
      };
      return EXPLANATIONS[this.bill.progress];
    },
    firstReading() {
      return this.bill.votes.find((vote) => vote.reading === 1);
    },
    secondReading() {
      return this.bill.votes.find((vote) => vote.reading === 2);
    },
    thirdReading() {
      return this.bill.votes.find((vote) => vote.reading === 3);
    },
    actUrl() {
      if (!this.bill.enactment.act_number || !this.bill.enactment.act_year) {
        return null;
      } else {
        return "https://legislation.govt.nz/act/results.aspx?search=ad_act___" + this.bill.enactment.act_year + "_" + this.bill.enactment.act_number + "__25_ac@bn@rn@dn@apub@aloc@apri@apro@aimp@bgov@bloc@bpri@bmem@rpub@rimp_ac@ainf@anif@aaif@aase@arep@bcur@rinf@rnif_a_aw_se_&p=1";
      }
    },
    relativeDate() {
      return formatDistanceToNow(parseISO(this.bill.last_retrieved)) + " ago";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Meta = Meta;
  const _component_PageHeader = __nuxt_component_0;
  const _component_Card = __nuxt_component_2;
  const _component_FontAwesomeIcon = __nuxt_component_1$1;
  const _component_ExternalLinkInline = __nuxt_component_6$1;
  const _component_DownloadLink = __nuxt_component_7;
  const _component_PersonCard = __nuxt_component_9;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_VoteSummary = __nuxt_component_3;
  const _component_VoteSummaryBare = __nuxt_component_10;
  if ($options.bill) {
    _push(`<div${ssrRenderAttrs(mergeProps({ id: "bill-view" }, _attrs))} data-v-8bba0e83>`);
    _push(ssrRenderComponent(_component_Head, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:title",
            content: $options.bill.name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:description",
            content: $options.bill.description
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "description",
            content: $options.bill.description
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:title",
            content: $options.bill.name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:description",
            content: $options.bill.description
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_Meta, {
              name: "twitter:title",
              content: $options.bill.name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "twitter:description",
              content: $options.bill.description
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "description",
              content: $options.bill.description
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:title",
              content: $options.bill.name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:description",
              content: $options.bill.description
            }, null, 8, ["content"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_PageHeader, {
      pageTitle: $options.bill.name,
      pageSubtitle: $options.bill.type_desc
    }, null, _parent));
    _push(`<div class="container mt-3" data-v-8bba0e83><div class="row" data-v-8bba0e83><div class="col-12 col-lg-8" data-v-8bba0e83><h4 data-v-8bba0e83>About this bill</h4>`);
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate($options.bill.description)} `);
          if ($options.bill.voting_method != "unk") {
            _push2(`<h5 class="mt-3" data-v-8bba0e83${_scopeId}>Voting method</h5>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.voting_method == "per") {
            _push2(`<span data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "person"] }, null, _parent2, _scopeId));
            _push2(` <strong data-v-8bba0e83${_scopeId}>Personal voting: </strong> MPs voted individually on this bill. </span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.voting_method == "par") {
            _push2(`<span data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }, null, _parent2, _scopeId));
            _push2(` <strong data-v-8bba0e83${_scopeId}>Party voting: </strong> Parties decided whether or not to support this bill and cast votes on behalf of all their MPs. </span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.voting_method == "mix") {
            _push2(`<span data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }, null, _parent2, _scopeId));
            _push2(` / `);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "person"] }, null, _parent2, _scopeId));
            _push2(` <strong data-v-8bba0e83${_scopeId}>Mixed voting: </strong> Both personal and party voting were used at different stages of this bill&#39;s progression. </span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.urgency_used || $options.bill.extended_sittings_used) {
            _push2(`<h5 class="mt-3" data-v-8bba0e83${_scopeId}>Procedural notes</h5>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<ul class="procedural-list pb-0 ps-0" data-v-8bba0e83${_scopeId}>`);
          if ($options.bill.urgency_used) {
            _push2(`<li class="procedural-list" data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, {
              class: "me-2",
              icon: ["fas", "forward-fast"]
            }, null, _parent2, _scopeId));
            _push2(`<strong data-v-8bba0e83${_scopeId}>Urgency used: </strong> This bill was progressed through one or more stages using urgency. Urgency allows the Government to fast-track the legislative process by extending the sitting hours of the House of Representatives and skipping the select committee stage of a bill, and allows bills to pass through more than one stage per sitting day. <br data-v-8bba0e83${_scopeId}><small data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://www.parliament.nz/en/visit-and-learn/how-parliament-works/fact-sheets/what-is-urgency/" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Learn more about urgency`);
                } else {
                  return [
                    createTextVNode(" Learn more about urgency")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</small></li>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.extended_sittings_used) {
            _push2(`<li class="procedural-list" data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, {
              class: "me-2",
              icon: ["fa", "calendar"]
            }, null, _parent2, _scopeId));
            _push2(`<strong data-v-8bba0e83${_scopeId}>Extended sittings used: </strong> This bill was progressed during one or more extended sittings of the House of Representatives. This enables MPs to meet for longer than normal to consider legislation. It does not alter the stages that a bill must pass through to become law. <br data-v-8bba0e83${_scopeId}><small data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: "https://www.parliament.nz/en/visit-and-learn/how-parliament-works/fact-sheets/a-closer-look-at-extended-hours/" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Learn more about extended sittings`);
                } else {
                  return [
                    createTextVNode(" Learn more about extended sittings")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</small></li>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</ul>`);
          if ($options.bill.pco_url || $options.actUrl) {
            _push2(`<h5 class="mt-3" data-v-8bba0e83${_scopeId}>Read the bill</h5>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.pco_url) {
            _push2(`<span data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, {
              class: "me-2",
              icon: ["fas", "file-lines"]
            }, null, _parent2, _scopeId));
            _push2(`Bill text: `);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, {
              link: $options.bill.pco_url
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate($options.bill.name)} (legislation.govt.nz)`);
                } else {
                  return [
                    createTextVNode(toDisplayString($options.bill.name) + " (legislation.govt.nz)", 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.bill.pco_url && $options.actUrl) {
            _push2(`<br data-v-8bba0e83${_scopeId}>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.actUrl) {
            _push2(`<span data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, {
              class: "me-2",
              icon: ["fas", "book"]
            }, null, _parent2, _scopeId));
            _push2(`Act text: `);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, { link: $options.actUrl }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate($options.bill.enactment.act)} (legislation.govt.nz)`);
                } else {
                  return [
                    createTextVNode(toDisplayString($options.bill.enactment.act) + " (legislation.govt.nz)", 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<hr data-v-8bba0e83${_scopeId}><div class="row" data-v-8bba0e83${_scopeId}>`);
          if (!$options.bill.parliament_api_id) {
            _push2(`<div class="col-12 col-xl-6" data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, {
              link: "https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/document/" + $options.bill.legacy_document_id
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View on Parliament website (legacy)`);
                } else {
                  return [
                    createTextVNode(" View on Parliament website (legacy)")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            _push2(`<div class="col-12 col-xl-6" data-v-8bba0e83${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ExternalLinkInline, {
              link: "https://bills.parliament.nz/v/6/" + $options.bill.parliament_api_id
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View on Parliament website`);
                } else {
                  return [
                    createTextVNode(" View on Parliament website")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          }
          _push2(`<div class="col-12 col-xl-6 text-xl-end" data-v-8bba0e83${_scopeId}>`);
          _push2(ssrRenderComponent(_component_DownloadLink, {
            class: "ms-xl-2 me-xl-0",
            resourceType: "bill",
            fileType: "json",
            friendlyName: $options.bill.name,
            resourceId: $options.bill.id
          }, null, _parent2, _scopeId));
          _push2(`</div></div>`);
        } else {
          return [
            createTextVNode(toDisplayString($options.bill.description) + " ", 1),
            $options.bill.voting_method != "unk" ? (openBlock(), createBlock("h5", {
              key: 0,
              class: "mt-3"
            }, "Voting method")) : createCommentVNode("", true),
            $options.bill.voting_method == "per" ? (openBlock(), createBlock("span", { key: 1 }, [
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "person"] }),
              createTextVNode(),
              createVNode("strong", null, "Personal voting: "),
              createTextVNode(" MPs voted individually on this bill. ")
            ])) : createCommentVNode("", true),
            $options.bill.voting_method == "par" ? (openBlock(), createBlock("span", { key: 2 }, [
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }),
              createTextVNode(),
              createVNode("strong", null, "Party voting: "),
              createTextVNode(" Parties decided whether or not to support this bill and cast votes on behalf of all their MPs. ")
            ])) : createCommentVNode("", true),
            $options.bill.voting_method == "mix" ? (openBlock(), createBlock("span", { key: 3 }, [
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }),
              createTextVNode(" / "),
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "person"] }),
              createTextVNode(),
              createVNode("strong", null, "Mixed voting: "),
              createTextVNode(" Both personal and party voting were used at different stages of this bill's progression. ")
            ])) : createCommentVNode("", true),
            $options.bill.urgency_used || $options.bill.extended_sittings_used ? (openBlock(), createBlock("h5", {
              key: 4,
              class: "mt-3"
            }, "Procedural notes")) : createCommentVNode("", true),
            createVNode("ul", { class: "procedural-list pb-0 ps-0" }, [
              $options.bill.urgency_used ? (openBlock(), createBlock("li", {
                key: 0,
                class: "procedural-list"
              }, [
                createVNode(_component_FontAwesomeIcon, {
                  class: "me-2",
                  icon: ["fas", "forward-fast"]
                }),
                createVNode("strong", null, "Urgency used: "),
                createTextVNode(" This bill was progressed through one or more stages using urgency. Urgency allows the Government to fast-track the legislative process by extending the sitting hours of the House of Representatives and skipping the select committee stage of a bill, and allows bills to pass through more than one stage per sitting day. "),
                createVNode("br"),
                createVNode("small", null, [
                  createVNode(_component_ExternalLinkInline, { link: "https://www.parliament.nz/en/visit-and-learn/how-parliament-works/fact-sheets/what-is-urgency/" }, {
                    default: withCtx(() => [
                      createTextVNode(" Learn more about urgency")
                    ]),
                    _: 1
                  })
                ])
              ])) : createCommentVNode("", true),
              $options.bill.extended_sittings_used ? (openBlock(), createBlock("li", {
                key: 1,
                class: "procedural-list"
              }, [
                createVNode(_component_FontAwesomeIcon, {
                  class: "me-2",
                  icon: ["fa", "calendar"]
                }),
                createVNode("strong", null, "Extended sittings used: "),
                createTextVNode(" This bill was progressed during one or more extended sittings of the House of Representatives. This enables MPs to meet for longer than normal to consider legislation. It does not alter the stages that a bill must pass through to become law. "),
                createVNode("br"),
                createVNode("small", null, [
                  createVNode(_component_ExternalLinkInline, { link: "https://www.parliament.nz/en/visit-and-learn/how-parliament-works/fact-sheets/a-closer-look-at-extended-hours/" }, {
                    default: withCtx(() => [
                      createTextVNode(" Learn more about extended sittings")
                    ]),
                    _: 1
                  })
                ])
              ])) : createCommentVNode("", true)
            ]),
            $options.bill.pco_url || $options.actUrl ? (openBlock(), createBlock("h5", {
              key: 5,
              class: "mt-3"
            }, "Read the bill")) : createCommentVNode("", true),
            $options.bill.pco_url ? (openBlock(), createBlock("span", { key: 6 }, [
              createVNode(_component_FontAwesomeIcon, {
                class: "me-2",
                icon: ["fas", "file-lines"]
              }),
              createTextVNode("Bill text: "),
              createVNode(_component_ExternalLinkInline, {
                link: $options.bill.pco_url
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString($options.bill.name) + " (legislation.govt.nz)", 1)
                ]),
                _: 1
              }, 8, ["link"])
            ])) : createCommentVNode("", true),
            $options.bill.pco_url && $options.actUrl ? (openBlock(), createBlock("br", { key: 7 })) : createCommentVNode("", true),
            $options.actUrl ? (openBlock(), createBlock("span", { key: 8 }, [
              createVNode(_component_FontAwesomeIcon, {
                class: "me-2",
                icon: ["fas", "book"]
              }),
              createTextVNode("Act text: "),
              createVNode(_component_ExternalLinkInline, { link: $options.actUrl }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString($options.bill.enactment.act) + " (legislation.govt.nz)", 1)
                ]),
                _: 1
              }, 8, ["link"])
            ])) : createCommentVNode("", true),
            createVNode("hr"),
            createVNode("div", { class: "row" }, [
              !$options.bill.parliament_api_id ? (openBlock(), createBlock("div", {
                key: 0,
                class: "col-12 col-xl-6"
              }, [
                createVNode(_component_ExternalLinkInline, {
                  link: "https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/document/" + $options.bill.legacy_document_id
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View on Parliament website (legacy)")
                  ]),
                  _: 1
                }, 8, ["link"])
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "col-12 col-xl-6"
              }, [
                createVNode(_component_ExternalLinkInline, {
                  link: "https://bills.parliament.nz/v/6/" + $options.bill.parliament_api_id
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View on Parliament website")
                  ]),
                  _: 1
                }, 8, ["link"])
              ])),
              createVNode("div", { class: "col-12 col-xl-6 text-xl-end" }, [
                createVNode(_component_DownloadLink, {
                  class: "ms-xl-2 me-xl-0",
                  resourceType: "bill",
                  fileType: "json",
                  friendlyName: $options.bill.name,
                  resourceId: $options.bill.id
                }, null, 8, ["friendlyName", "resourceId"])
              ])
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
    if ($options.bill.people_responsible.length > 0) {
      _push(`<h4 data-v-8bba0e83>Member`);
      if ($options.bill.people_responsible.length > 1) {
        _push(`<span data-v-8bba0e83>s</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` responsible</h4>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="row" data-v-8bba0e83><!--[-->`);
    ssrRenderList($options.bill.people_responsible, (person) => {
      _push(`<div class="col-12 col-lg-6" data-v-8bba0e83>`);
      _push(ssrRenderComponent(_component_PersonCard, { person }, null, _parent));
      _push(`</div>`);
    });
    _push(`<!--]--></div></div><div class="col-12 col-lg-4" data-v-8bba0e83><h4 data-v-8bba0e83>Progress</h4>`);
    _push(ssrRenderComponent(_component_Card, { gradient: true }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h3 data-v-8bba0e83${_scopeId}>${ssrInterpolate($options.bill.progress_desc)}</h3><p data-v-8bba0e83${_scopeId}>${ssrInterpolate($options.progressExplanation)}</p>`);
        } else {
          return [
            createVNode("h3", null, toDisplayString($options.bill.progress_desc), 1),
            createVNode("p", null, toDisplayString($options.progressExplanation), 1)
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div></div><h3 data-v-8bba0e83>Votes</h3><div class="row" data-v-8bba0e83><div class="col-12 col-lg-4" data-v-8bba0e83>`);
    if ($options.firstReading) {
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "vote-link",
        to: "/votes/" + $options.firstReading.id
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_VoteSummary, { vote: $options.firstReading }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_VoteSummary, { vote: $options.firstReading }, null, 8, ["vote"])
            ];
          }
        }),
        _: 1
      }, _parent));
    } else if ($options.bill.dates.first_reading_date) {
      _push(ssrRenderComponent(_component_VoteSummaryBare, {
        reading: 1,
        passed: true,
        date: $options.bill.dates.first_reading_date
      }, null, _parent));
    } else if ($options.bill.dates.defeated_date && $options.bill.defeated_at_reading === 1) {
      _push(ssrRenderComponent(_component_VoteSummaryBare, {
        passed: false,
        reading: 1,
        date: $options.bill.dates.defeated_date
      }, null, _parent));
    } else if (!$options.bill.defeated_at_reading || $options.bill.defeated_at_reading >= 1) {
      _push(ssrRenderComponent(_component_Card, { missing: true }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h6 class="text-uppercase text-muted" data-v-8bba0e83${_scopeId}><strong data-v-8bba0e83${_scopeId}>1st reading</strong></h6><h6 class="text-muted" data-v-8bba0e83${_scopeId}>This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>`);
          } else {
            return [
              createVNode("h6", { class: "text-uppercase text-muted" }, [
                createVNode("strong", null, "1st reading")
              ]),
              createVNode("h6", { class: "text-muted" }, "This vote has not yet occurred, or is not yet recorded on WhereTheyStand.")
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="col-12 col-lg-4" data-v-8bba0e83>`);
    if ($options.secondReading) {
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "vote-link",
        to: "/votes/" + $options.secondReading.id
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_VoteSummary, { vote: $options.secondReading }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_VoteSummary, { vote: $options.secondReading }, null, 8, ["vote"])
            ];
          }
        }),
        _: 1
      }, _parent));
    } else if ($options.bill.dates.second_reading_date) {
      _push(ssrRenderComponent(_component_VoteSummaryBare, {
        reading: 2,
        passed: true,
        date: $options.bill.dates.second_reading_date
      }, null, _parent));
    } else if ($options.bill.dates.defeated_date && $options.bill.defeated_at_reading === 2) {
      _push(ssrRenderComponent(_component_VoteSummaryBare, {
        passed: false,
        reading: 2,
        date: $options.bill.dates.defeated_date
      }, null, _parent));
    } else if (!$options.bill.defeated_at_reading || $options.bill.defeated_at_reading >= 2) {
      _push(ssrRenderComponent(_component_Card, { missing: true }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h6 class="text-uppercase text-muted" data-v-8bba0e83${_scopeId}><strong data-v-8bba0e83${_scopeId}>2nd reading</strong></h6><h6 class="text-muted" data-v-8bba0e83${_scopeId}>This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>`);
          } else {
            return [
              createVNode("h6", { class: "text-uppercase text-muted" }, [
                createVNode("strong", null, "2nd reading")
              ]),
              createVNode("h6", { class: "text-muted" }, "This vote has not yet occurred, or is not yet recorded on WhereTheyStand.")
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="col-12 col-lg-4" data-v-8bba0e83>`);
    if ($options.thirdReading) {
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "vote-link",
        to: "/votes/" + $options.thirdReading.id
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_VoteSummary, { vote: $options.thirdReading }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_VoteSummary, { vote: $options.thirdReading }, null, 8, ["vote"])
            ];
          }
        }),
        _: 1
      }, _parent));
    } else if ($options.bill.dates.third_reading_date) {
      _push(ssrRenderComponent(_component_VoteSummaryBare, {
        reading: 3,
        passed: true,
        date: $options.bill.dates.third_reading_date
      }, null, _parent));
    } else if ($options.bill.dates.defeated_date && $options.bill.defeated_at_reading === 3) {
      _push(ssrRenderComponent(_component_VoteSummaryBare, {
        passed: false,
        reading: 3,
        date: $options.bill.dates.defeated_date
      }, null, _parent));
    } else if (!$options.bill.defeated_at_reading || $options.bill.defeated_at_reading >= 3) {
      _push(ssrRenderComponent(_component_Card, { missing: true }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h6 class="text-uppercase text-muted" data-v-8bba0e83${_scopeId}><strong data-v-8bba0e83${_scopeId}>3rd reading</strong></h6><h6 class="text-muted" data-v-8bba0e83${_scopeId}>This vote has not yet occurred, or is not yet recorded on WhereTheyStand.</h6>`);
          } else {
            return [
              createVNode("h6", { class: "text-uppercase text-muted" }, [
                createVNode("strong", null, "3rd reading")
              ]),
              createVNode("h6", { class: "text-muted" }, "This vote has not yet occurred, or is not yet recorded on WhereTheyStand.")
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div><p class="text-muted" data-v-8bba0e83>Only reading votes are shown here; these votes determine whether the Bill progresses through Parliament. Other votes, such as votes on whether to amend parts of the Bill, can be seen in Hansard.</p><p class="text-muted" data-v-8bba0e83>Bill details last synced with the Parliament website ${ssrInterpolate($options.relativeDate)}. <br data-v-8bba0e83><small data-v-8bba0e83>(${ssrInterpolate($options.formatDateTime($options.bill.last_retrieved))})</small></p></div></div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bills/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-8bba0e83"]]);

export { index as default };
//# sourceMappingURL=index-110e3624.mjs.map
