import { _ as _export_sfc, a as __nuxt_component_2$1, e as __nuxt_component_1$1, d as __nuxt_component_0$1 } from '../server.mjs';
import { _ as __nuxt_component_3 } from './Spinner-368da257.mjs';
import { format, parse, formatDistanceToNow } from 'date-fns';
import { useSSRContext, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, resolveComponent } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { _ as __nuxt_component_3$1 } from './DisplayControlButton-5bb5bd6c.mjs';
import { u as usePeopleStore } from './people-1a5851d6.mjs';
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

const _sfc_main$4 = {
  name: "PersonPersonalVote",
  components: {
    Card: __nuxt_component_2$1
  },
  props: {
    record: Object
  },
  methods: {
    dateFormat(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d.M.yyyy");
    },
    readingName(reading) {
      return {
        1: "1st reading",
        2: "2nd reading",
        3: "3rd reading"
      }[reading];
    }
  }
};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2$1;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_FontAwesomeIcon = __nuxt_component_1$1;
  _push(ssrRenderComponent(_component_Card, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtLink, {
          class: "router-link",
          to: "/bills/" + $props.record.bill.id
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<h5 data-v-fe8657e6${_scopeId2}>${ssrInterpolate($props.record.bill.name)}</h5><div class="row" data-v-fe8657e6${_scopeId2}><!--[-->`);
              ssrRenderList($props.record.votes, (vote, reading) => {
                _push3(`<div class="col-4 text-center" data-v-fe8657e6${_scopeId2}>`);
                if (vote.position) {
                  _push3(`<div data-v-fe8657e6${_scopeId2}><span class="vote-info" data-v-fe8657e6${_scopeId2}>${ssrInterpolate($options.readingName(reading))}</span><br data-v-fe8657e6${_scopeId2}>`);
                  if (vote.position === "y") {
                    _push3(ssrRenderComponent(_component_FontAwesomeIcon, {
                      title: "Supported",
                      class: "position-icon yes",
                      icon: ["fas", "check"]
                    }, null, _parent3, _scopeId2));
                  } else if (vote.position === "n") {
                    _push3(ssrRenderComponent(_component_FontAwesomeIcon, {
                      title: "Opposed",
                      class: "position-icon no",
                      icon: ["fas", "times"]
                    }, null, _parent3, _scopeId2));
                  } else if (vote.position === "a") {
                    _push3(ssrRenderComponent(_component_FontAwesomeIcon, {
                      title: "Abstained",
                      class: "position-icon abstain",
                      icon: ["fas", "map-signs"]
                    }, null, _parent3, _scopeId2));
                  } else if (vote.position === "x") {
                    _push3(ssrRenderComponent(_component_FontAwesomeIcon, {
                      title: "Absent",
                      class: "position-icon absent",
                      icon: ["fas", "question"]
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<br data-v-fe8657e6${_scopeId2}><span class="vote-info text-muted" data-v-fe8657e6${_scopeId2}>${ssrInterpolate($options.dateFormat(vote.date))}</span></div>`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</div>`);
              });
              _push3(`<!--]--></div>`);
            } else {
              return [
                createVNode("h5", null, toDisplayString($props.record.bill.name), 1),
                createVNode("div", { class: "row" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList($props.record.votes, (vote, reading) => {
                    return openBlock(), createBlock("div", {
                      class: "col-4 text-center",
                      key: reading
                    }, [
                      vote.position ? (openBlock(), createBlock("div", { key: 0 }, [
                        createVNode("span", { class: "vote-info" }, toDisplayString($options.readingName(reading)), 1),
                        createVNode("br"),
                        vote.position === "y" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                          key: 0,
                          title: "Supported",
                          class: "position-icon yes",
                          icon: ["fas", "check"]
                        })) : vote.position === "n" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                          key: 1,
                          title: "Opposed",
                          class: "position-icon no",
                          icon: ["fas", "times"]
                        })) : vote.position === "a" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                          key: 2,
                          title: "Abstained",
                          class: "position-icon abstain",
                          icon: ["fas", "map-signs"]
                        })) : vote.position === "x" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                          key: 3,
                          title: "Absent",
                          class: "position-icon absent",
                          icon: ["fas", "question"]
                        })) : createCommentVNode("", true),
                        createVNode("br"),
                        createVNode("span", { class: "vote-info text-muted" }, toDisplayString($options.dateFormat(vote.date)), 1)
                      ])) : createCommentVNode("", true)
                    ]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtLink, {
            class: "router-link",
            to: "/bills/" + $props.record.bill.id
          }, {
            default: withCtx(() => [
              createVNode("h5", null, toDisplayString($props.record.bill.name), 1),
              createVNode("div", { class: "row" }, [
                (openBlock(true), createBlock(Fragment, null, renderList($props.record.votes, (vote, reading) => {
                  return openBlock(), createBlock("div", {
                    class: "col-4 text-center",
                    key: reading
                  }, [
                    vote.position ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("span", { class: "vote-info" }, toDisplayString($options.readingName(reading)), 1),
                      createVNode("br"),
                      vote.position === "y" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                        key: 0,
                        title: "Supported",
                        class: "position-icon yes",
                        icon: ["fas", "check"]
                      })) : vote.position === "n" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                        key: 1,
                        title: "Opposed",
                        class: "position-icon no",
                        icon: ["fas", "times"]
                      })) : vote.position === "a" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                        key: 2,
                        title: "Abstained",
                        class: "position-icon abstain",
                        icon: ["fas", "map-signs"]
                      })) : vote.position === "x" ? (openBlock(), createBlock(_component_FontAwesomeIcon, {
                        key: 3,
                        title: "Absent",
                        class: "position-icon absent",
                        icon: ["fas", "question"]
                      })) : createCommentVNode("", true),
                      createVNode("br"),
                      createVNode("span", { class: "vote-info text-muted" }, toDisplayString($options.dateFormat(vote.date)), 1)
                    ])) : createCommentVNode("", true)
                  ]);
                }), 128))
              ])
            ]),
            _: 1
          }, 8, ["to"])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PersonPersonalVote.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$4], ["__scopeId", "data-v-fe8657e6"]]);
const _sfc_main$3 = {
  name: "InlinePersonText",
  props: ["entity"]
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  _push(ssrRenderComponent(_component_router_link, mergeProps({
    class: "link",
    to: "/people/" + $props.entity.slug
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<span class="inline-entity" data-v-a6e173f6${_scopeId}>`);
        if ($props.entity.colour) {
          _push2(`<span class="party-dot" style="${ssrRenderStyle({ backgroundColor: $props.entity.colour })}" data-v-a6e173f6${_scopeId}></span>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(` ${ssrInterpolate($props.entity.display_name)}</span>`);
      } else {
        return [
          createVNode("span", { class: "inline-entity" }, [
            $props.entity.colour ? (openBlock(), createBlock("span", {
              key: 0,
              class: "party-dot",
              style: { backgroundColor: $props.entity.colour }
            }, null, 4)) : createCommentVNode("", true),
            createTextVNode(" " + toDisplayString($props.entity.display_name), 1)
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InlinePersonText.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-a6e173f6"]]);
const _sfc_main$2 = {
  name: "VotingSimilarityDisplay",
  components: {
    Card: __nuxt_component_2$1,
    InlinePersonText: __nuxt_component_1
  },
  props: {
    person: Object,
    similarityReport: Object
  }
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2$1;
  const _component_inline_person_text = __nuxt_component_1;
  _push(ssrRenderComponent(_component_Card, mergeProps({ gradient: true }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h5${_scopeId}>${ssrInterpolate($props.person.display_name)} votes most similarly to:</h5><!--[-->`);
        ssrRenderList($props.similarityReport.people, (entity) => {
          _push2(`<span${_scopeId}>`);
          _push2(ssrRenderComponent(_component_inline_person_text, {
            entity,
            class: "mr-2 mb-2"
          }, null, _parent2, _scopeId));
          _push2(`</span>`);
        });
        _push2(`<!--]--><p${_scopeId}>Voting similarity is based on the proportion of common voting positions in personal reading votes, with a minimum sample size of four votes.</p>`);
      } else {
        return [
          createVNode("h5", null, toDisplayString($props.person.display_name) + " votes most similarly to:", 1),
          (openBlock(true), createBlock(Fragment, null, renderList($props.similarityReport.people, (entity) => {
            return openBlock(), createBlock("span", {
              key: entity.slug
            }, [
              createVNode(_component_inline_person_text, {
                entity,
                class: "mr-2 mb-2"
              }, null, 8, ["entity"])
            ]);
          }), 128)),
          createVNode("p", null, "Voting similarity is based on the proportion of common voting positions in personal reading votes, with a minimum sample size of four votes.")
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VotingSimilarityDisplay.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2]]);
const _sfc_main$1 = {
  name: "SmallBill",
  components: {
    Card: __nuxt_component_2$1
  },
  props: {
    bill: Object
  },
  computed: {
    relativeDate() {
      return formatDistanceToNow(parse(this.bill.date_modified, "yyyy-MM-dd", /* @__PURE__ */ new Date())) + " ago";
    },
    formattedDate() {
      return format(parse(this.bill.date_modified, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d.M.yyyy");
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_Card = __nuxt_component_2$1;
  const _component_font_awesome_icon = __nuxt_component_1$1;
  _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
    class: "router-link",
    to: "/bills/" + $props.bill.id
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Card, null, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<h5 data-v-20770dfa${_scopeId2}>${ssrInterpolate($props.bill.name)}</h5><p data-v-20770dfa${_scopeId2}>${ssrInterpolate($props.bill.description)}</p>`);
              if ($props.bill.date_modified) {
                _push3(`<span${ssrRenderAttr("title", $options.formattedDate)} class="text-muted" data-v-20770dfa${_scopeId2}>`);
                _push3(ssrRenderComponent(_component_font_awesome_icon, { icon: ["fas", "history"] }, null, _parent3, _scopeId2));
                _push3(` Last activity ${ssrInterpolate($options.relativeDate)}</span>`);
              } else {
                _push3(`<!---->`);
              }
            } else {
              return [
                createVNode("h5", null, toDisplayString($props.bill.name), 1),
                createVNode("p", null, toDisplayString($props.bill.description), 1),
                $props.bill.date_modified ? (openBlock(), createBlock("span", {
                  key: 0,
                  title: $options.formattedDate,
                  class: "text-muted"
                }, [
                  createVNode(_component_font_awesome_icon, { icon: ["fas", "history"] }),
                  createTextVNode(" Last activity " + toDisplayString($options.relativeDate), 1)
                ], 8, ["title"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_Card, null, {
            default: withCtx(() => [
              createVNode("h5", null, toDisplayString($props.bill.name), 1),
              createVNode("p", null, toDisplayString($props.bill.description), 1),
              $props.bill.date_modified ? (openBlock(), createBlock("span", {
                key: 0,
                title: $options.formattedDate,
                class: "text-muted"
              }, [
                createVNode(_component_font_awesome_icon, { icon: ["fas", "history"] }),
                createTextVNode(" Last activity " + toDisplayString($options.relativeDate), 1)
              ], 8, ["title"])) : createCommentVNode("", true)
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SmallBill.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-20770dfa"]]);
const _sfc_main = {
  name: "PersonHome",
  setup() {
    const peopleStore = usePeopleStore();
    return { peopleStore };
  },
  data() {
    return {
      voteCount: 4,
      billCount: 4
    };
  },
  created() {
    this.peopleStore.fetchVotes(this.$route.params.id);
    this.peopleStore.fetchBills(this.$route.params.id);
    this.peopleStore.fetchVotingSimilarity(this.$route.params.id);
  },
  computed: {
    votes() {
      return this.peopleStore.votesByIdentifier(this.$route.params.id);
    },
    bills() {
      return this.peopleStore.billsByIdentifier(this.$route.params.id);
    },
    person() {
      return this.peopleStore.byIdentifier(this.$route.params.id);
    },
    votingSimilarity() {
      return this.peopleStore.votingSimilarityByIdentifier(this.$route.params.id);
    },
    votesByBill() {
      var votes = {};
      if (!this.votes || this.votes.length === 0) {
        return [];
      }
      this.votes.forEach((vote) => {
        if (!(vote.vote.bill.id in votes)) {
          votes[vote.vote.bill.id] = {
            bill: vote.vote.bill,
            votes: {
              1: {},
              2: {},
              3: {}
            }
          };
        }
        votes[vote.vote.bill.id].votes[vote.vote.reading] = {
          position: vote.position,
          date: vote.date
        };
      });
      return Object.values(votes);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_FontAwesomeIcon = __nuxt_component_1$1;
  const _component_Spinner = __nuxt_component_3;
  const _component_PersonPersonalVote = __nuxt_component_2;
  const _component_DisplayControlButton = __nuxt_component_3$1;
  const _component_VotingSimilarityDisplay = __nuxt_component_4;
  const _component_Card = __nuxt_component_2$1;
  const _component_SmallBill = __nuxt_component_6;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))}><div class="row mt-3"><div class="col-12 col-lg-8"><h4>Personal voting history</h4>`);
  if ($options.votes && $options.votes.length === 0) {
    _push(`<p>`);
    _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "info-circle"] }, null, _parent));
    _push(` WhereTheyStand doesn&#39;t have any votes to show you.</p>`);
  } else if (!$options.votes) {
    _push(`<p>`);
    _push(ssrRenderComponent(_component_Spinner, null, null, _parent));
    _push(` Loading...</p>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.votes) {
    _push(`<div class="row"><!--[-->`);
    ssrRenderList($options.votesByBill.slice(0, $data.voteCount), (value, key) => {
      _push(`<div class="col-12 col-lg-6">`);
      _push(ssrRenderComponent(_component_PersonPersonalVote, { record: value }, null, _parent));
      _push(`</div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.votesByBill.length > $data.voteCount) {
    _push(`<div>`);
    _push(ssrRenderComponent(_component_DisplayControlButton, {
      onClick: ($event) => $data.voteCount = $options.votesByBill.length
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "chevron-down"] }, null, _parent2, _scopeId));
          _push2(` Show all votes `);
        } else {
          return [
            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "chevron-down"] }),
            createTextVNode(" Show all votes ")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div>`);
  } else if ($data.voteCount === $options.votesByBill.length && $data.voteCount > 4) {
    _push(`<div>`);
    _push(ssrRenderComponent(_component_DisplayControlButton, {
      onClick: ($event) => $data.voteCount = 4
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "chevron-up"] }, null, _parent2, _scopeId));
          _push2(` Show fewer votes `);
        } else {
          return [
            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "chevron-up"] }),
            createTextVNode(" Show fewer votes ")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($options.votingSimilarity && $options.votingSimilarity != {}) {
    _push(`<div class="col-12 col-lg-4"><h4>Voting similarity</h4><div class="row"><div class="col-12">`);
    if ($options.votingSimilarity.status == "complete") {
      _push(ssrRenderComponent(_component_VotingSimilarityDisplay, {
        person: $options.person,
        similarityReport: $options.votingSimilarity
      }, null, _parent));
    } else if ($options.votingSimilarity.status == "insufficient") {
      _push(ssrRenderComponent(_component_Card, { gradient: true }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}><strong${_scopeId}>There isn&#39;t enough data to show who ${ssrInterpolate($options.person.display_name)} votes similarly to.</strong></p><p${_scopeId}>Once ${ssrInterpolate($options.person.display_name)} has participated in enough personal votes, you will be able to see a list of MPs who tend to vote the same way. Personal votes don&#39;t happen often in New Zealand, so it may be some time.</p>`);
          } else {
            return [
              createVNode("p", null, [
                createVNode("strong", null, "There isn't enough data to show who " + toDisplayString($options.person.display_name) + " votes similarly to.", 1)
              ]),
              createVNode("p", null, "Once " + toDisplayString($options.person.display_name) + " has participated in enough personal votes, you will be able to see a list of MPs who tend to vote the same way. Personal votes don't happen often in New Zealand, so it may be some time.", 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    } else {
      _push(ssrRenderComponent(_component_Card, { gradient: true }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}><strong${_scopeId}>WhereTheyStand hasn&#39;t checked who ${ssrInterpolate($options.person.display_name)} votes similarly to.</strong></p><p${_scopeId}>This feature is coming soon, so please check back at a later date.</p><p${_scopeId}>In the meantime, click on any voting record to see more information about that bill and its votes.</p>`);
          } else {
            return [
              createVNode("p", null, [
                createVNode("strong", null, "WhereTheyStand hasn't checked who " + toDisplayString($options.person.display_name) + " votes similarly to.", 1)
              ]),
              createVNode("p", null, "This feature is coming soon, so please check back at a later date."),
              createVNode("p", null, "In the meantime, click on any voting record to see more information about that bill and its votes.")
            ];
          }
        }),
        _: 1
      }, _parent));
    }
    _push(`</div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="row"><div class="col-12"><h4>Bills responsible for</h4>`);
  if ($options.bills && $options.bills.length === 0) {
    _push(`<p class="col-12 col-lg-8">`);
    _push(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "info-circle"] }, null, _parent));
    _push(` ${ssrInterpolate($options.person.display_name)} hasn&#39;t sponsored any bills. This doesn&#39;t include any member&#39;s bills that they might have sitting in the &#39;biscut tin&#39; which haven&#39;t been drawn yet.</p>`);
  } else if (!$options.bills) {
    _push(`<p>`);
    _push(ssrRenderComponent(_component_Spinner, null, null, _parent));
    _push(` Loading...</p>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.bills) {
    _push(`<div class="row"><!--[-->`);
    ssrRenderList($options.bills.slice(0, $data.billCount), (bill) => {
      _push(`<div class="col-12 col-md-6">`);
      _push(ssrRenderComponent(_component_SmallBill, { bill }, null, _parent));
      _push(`</div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.bills && $options.bills.length > $data.billCount) {
    _push(`<div>`);
    _push(ssrRenderComponent(_component_DisplayControlButton, {
      onClick: ($event) => $data.billCount = $options.bills.length
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "chevron-down"] }, null, _parent2, _scopeId));
          _push2(` Show all bills `);
        } else {
          return [
            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "chevron-down"] }),
            createTextVNode(" Show all bills ")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div>`);
  } else if ($options.bills && $data.billCount === $options.bills.length && $data.billCount > 4) {
    _push(`<div>`);
    _push(ssrRenderComponent(_component_DisplayControlButton, {
      onClick: ($event) => $data.billCount = 4
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "chevron-up"] }, null, _parent2, _scopeId));
          _push2(` Show fewer bills `);
        } else {
          return [
            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "chevron-up"] }),
            createTextVNode(" Show fewer bills ")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/people/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-f3ca7a4d.mjs.map
