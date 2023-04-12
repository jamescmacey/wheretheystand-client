import { f as defineStore, u as useFetch, A as API_BASE, _ as _export_sfc, H as Head, M as Meta, a as __nuxt_component_2, e as __nuxt_component_1, b as __nuxt_component_6$1 } from '../server.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-03254b16.mjs';
import { a as __nuxt_component_3, _ as __nuxt_component_7 } from './VoteSummary-73d34890.mjs';
import { _ as __nuxt_component_8 } from './PartyCard-dc3cce9c.mjs';
import { _ as __nuxt_component_9 } from './PersonCard-61386b6b.mjs';
import { _ as __nuxt_component_10 } from './PersonList-acac1d7d.mjs';
import { format, parse, formatDistanceToNow, parseISO } from 'date-fns';
import { mergeProps, withCtx, createVNode, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
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

const useVotesStore = defineStore("votes", {
  state() {
    return {
      items: []
    };
  },
  getters: {
    byID: (state) => (id) => {
      return state.items.find((vote) => vote.id.toString() === id);
    }
  },
  actions: {
    async fetch(id) {
      if (!this.byID(id)) {
        var state = this;
        await useFetch(API_BASE + "votes/" + id + "/", {
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
        }, "$rQCkRLmMXR");
      }
    }
  }
});
const _sfc_main = {
  name: "Vote",
  setup() {
    const votesStore = useVotesStore();
    return { votesStore };
  },
  created() {
    this.votesStore.fetch(this.$route.params.id);
  },
  methods: {
    formatDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    }
  },
  data() {
    return {
      listMode: "vote",
      // or "person"
      sortFunction: function(a, b) {
        if (a.person && b.person) {
          if (a.person.last_name.toLowerCase() < b.person.last_name.toLowerCase()) {
            return -1;
          } else if (a.person.last_name.toLowerCase() == b.person.last_name.toLowerCase()) {
            return 0;
          } else {
            return 1;
          }
        } else if (a.person && !b.person) {
          return 1;
        } else if (b.person && !a.person) {
          return -1;
        } else if (!a.person && !b.person) {
          if (a.contribution > b.contribution) {
            return -1;
          } else if (a.contribution < b.contribution) {
            return 1;
          } else {
            if (a.party.display_name.toLowerCase() < b.party.display_name.toLowerCase()) {
              return -1;
            } else if (a.party.display_name.toLowerCase() == b.party.display_name.toLowerCase()) {
              return 0;
            } else {
              return 1;
            }
          }
        }
      }
    };
  },
  computed: {
    vote() {
      return this.votesStore.byID(this.$route.params.id);
    },
    readingOrdinal() {
      return this.vote.reading + { 1: "st reading", 2: "nd reading", 3: "rd reading" }[this.vote.reading];
    },
    ayes() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == "y") {
          return true;
        }
      }).sort(this.sortFunction);
    },
    noes() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == "n") {
          return true;
        }
      }).sort(this.sortFunction);
    },
    abstentions() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == "a") {
          return true;
        }
      }).sort(this.sortFunction);
    },
    absences() {
      return this.vote.positions.filter((pos) => {
        if (pos.position == "x") {
          return true;
        }
      }).sort(this.sortFunction);
    },
    relativeDate() {
      return formatDistanceToNow(parseISO(this.vote.last_retrieved)) + " ago";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Meta = Meta;
  const _component_PageHeader = __nuxt_component_0;
  const _component_VoteSummary = __nuxt_component_3;
  const _component_Card = __nuxt_component_2;
  const _component_FontAwesomeIcon = __nuxt_component_1;
  const _component_ExternalLinkInline = __nuxt_component_6$1;
  const _component_DownloadLink = __nuxt_component_7;
  const _component_PartyCard = __nuxt_component_8;
  const _component_PersonCard = __nuxt_component_9;
  const _component_PersonList = __nuxt_component_10;
  if ($options.vote) {
    _push(`<div${ssrRenderAttrs(mergeProps({ id: "vote-view" }, _attrs))}>`);
    _push(ssrRenderComponent(_component_Head, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:title",
            content: $options.vote.name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          if ($options.vote.question_text) {
            _push2(ssrRenderComponent(_component_Meta, {
              name: "twitter:description",
              content: $options.vote.question_text
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($options.vote.question_text) {
            _push2(ssrRenderComponent(_component_Meta, {
              name: "description",
              content: $options.vote.question_text
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:title",
            content: $options.vote.name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          if ($options.vote.question_text) {
            _push2(ssrRenderComponent(_component_Meta, {
              property: "og:description",
              content: $options.vote.question_text
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
        } else {
          return [
            createVNode(_component_Meta, {
              name: "twitter:title",
              content: $options.vote.name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            $options.vote.question_text ? (openBlock(), createBlock(_component_Meta, {
              key: 0,
              name: "twitter:description",
              content: $options.vote.question_text
            }, null, 8, ["content"])) : createCommentVNode("", true),
            $options.vote.question_text ? (openBlock(), createBlock(_component_Meta, {
              key: 1,
              name: "description",
              content: $options.vote.question_text
            }, null, 8, ["content"])) : createCommentVNode("", true),
            createVNode(_component_Meta, {
              property: "og:title",
              content: $options.vote.name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            $options.vote.question_text ? (openBlock(), createBlock(_component_Meta, {
              key: 2,
              property: "og:description",
              content: $options.vote.question_text
            }, null, 8, ["content"])) : createCommentVNode("", true)
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_PageHeader, {
      pageTitle: $options.vote.bill.name,
      pageSubtitle: $options.readingOrdinal,
      pageDate: $options.vote.vote_date,
      backLink: "/bills/" + $options.vote.bill.id,
      backText: $options.vote.bill.name
    }, null, _parent));
    _push(`<div class="container mt-3">`);
    _push(ssrRenderComponent(_component_VoteSummary, {
      vote: $options.vote,
      countsOnly: true
    }, null, _parent));
    _push(`<h4>Summary</h4><div class="row"><div class="col-12">`);
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          if ($options.vote.question_text) {
            _push2(`<span${_scopeId}>${ssrInterpolate($options.vote.question_text)}</span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.vote.outcome_text) {
            _push2(`<strong${_scopeId}><br${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate($options.vote.outcome_text)}</strong>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<h5 class="mt-3"${_scopeId}>Vote type</h5>`);
          if ($options.vote.type == "personal") {
            _push2(`<span${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "person"] }, null, _parent2, _scopeId));
            _push2(` <strong${_scopeId}>Personal vote: </strong> MPs&#39; votes were cast and recorded individually. </span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.vote.type == "party" && $options.vote.contains_split_votes) {
            _push2(`<span${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }, null, _parent2, _scopeId));
            _push2(` <strong${_scopeId}>Split-party vote: </strong> The vote was conducted as a party vote, but one or more parties opted to split their vote across multiple positions. The position of each MP within those parties is recorded individually. </span>`);
          } else {
            _push2(`<!---->`);
          }
          if ($options.vote.type == "party" && !$options.vote.contains_split_votes) {
            _push2(`<span${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }, null, _parent2, _scopeId));
            _push2(` <strong${_scopeId}>Party vote: </strong> Parties cast one vote on behalf of all their MPs. </span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<hr${_scopeId}><div class="row"${_scopeId}><div class="col-12 col-xl-6"${_scopeId}>`);
          _push2(ssrRenderComponent(_component_ExternalLinkInline, {
            link: "https://www.parliament.nz/en/pb/hansard-debates/rhr/document/" + $options.vote.document_id
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(` View Hansard record`);
              } else {
                return [
                  createTextVNode(" View Hansard record")
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
          _push2(`</div><div class="col-12 col-xl-6 text-xl-end"${_scopeId}>`);
          _push2(ssrRenderComponent(_component_DownloadLink, {
            class: "ms-xl-2 me-xl-0",
            resourceType: "vote",
            fileType: "xlsx",
            resourceId: $options.vote.id
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_DownloadLink, {
            class: "ms-xl-2 me-xl-0",
            resourceType: "vote",
            fileType: "csv",
            resourceId: $options.vote.id
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_DownloadLink, {
            class: "ms-xl-2 me-xl-0",
            resourceType: "vote",
            fileType: "json",
            resourceId: $options.vote.id
          }, null, _parent2, _scopeId));
          _push2(`</div></div>`);
        } else {
          return [
            $options.vote.question_text ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString($options.vote.question_text), 1)) : createCommentVNode("", true),
            $options.vote.outcome_text ? (openBlock(), createBlock("strong", { key: 1 }, [
              createVNode("br"),
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "arrow-right"] }),
              createTextVNode(" " + toDisplayString($options.vote.outcome_text), 1)
            ])) : createCommentVNode("", true),
            createVNode("h5", { class: "mt-3" }, "Vote type"),
            $options.vote.type == "personal" ? (openBlock(), createBlock("span", { key: 2 }, [
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "person"] }),
              createTextVNode(),
              createVNode("strong", null, "Personal vote: "),
              createTextVNode(" MPs' votes were cast and recorded individually. ")
            ])) : createCommentVNode("", true),
            $options.vote.type == "party" && $options.vote.contains_split_votes ? (openBlock(), createBlock("span", { key: 3 }, [
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }),
              createTextVNode(),
              createVNode("strong", null, "Split-party vote: "),
              createTextVNode(" The vote was conducted as a party vote, but one or more parties opted to split their vote across multiple positions. The position of each MP within those parties is recorded individually. ")
            ])) : createCommentVNode("", true),
            $options.vote.type == "party" && !$options.vote.contains_split_votes ? (openBlock(), createBlock("span", { key: 4 }, [
              createVNode(_component_FontAwesomeIcon, { icon: ["fas", "people-group"] }),
              createTextVNode(),
              createVNode("strong", null, "Party vote: "),
              createTextVNode(" Parties cast one vote on behalf of all their MPs. ")
            ])) : createCommentVNode("", true),
            createVNode("hr"),
            createVNode("div", { class: "row" }, [
              createVNode("div", { class: "col-12 col-xl-6" }, [
                createVNode(_component_ExternalLinkInline, {
                  link: "https://www.parliament.nz/en/pb/hansard-debates/rhr/document/" + $options.vote.document_id
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View Hansard record")
                  ]),
                  _: 1
                }, 8, ["link"])
              ]),
              createVNode("div", { class: "col-12 col-xl-6 text-xl-end" }, [
                createVNode(_component_DownloadLink, {
                  class: "ms-xl-2 me-xl-0",
                  resourceType: "vote",
                  fileType: "xlsx",
                  resourceId: $options.vote.id
                }, null, 8, ["resourceId"]),
                createVNode(_component_DownloadLink, {
                  class: "ms-xl-2 me-xl-0",
                  resourceType: "vote",
                  fileType: "csv",
                  resourceId: $options.vote.id
                }, null, 8, ["resourceId"]),
                createVNode(_component_DownloadLink, {
                  class: "ms-xl-2 me-xl-0",
                  resourceType: "vote",
                  fileType: "json",
                  resourceId: $options.vote.id
                }, null, 8, ["resourceId"])
              ])
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div></div>`);
    if ($options.vote.type == "party") {
      _push(`<div>`);
      if ($options.ayes.length > 0) {
        _push(`<h5 class="mt-3">Ayes</h5>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.ayes.length > 0) {
        _push(`<div class="row"><!--[-->`);
        ssrRenderList($options.ayes, (position, i) => {
          _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
          if (!position.person) {
            _push(ssrRenderComponent(_component_PartyCard, {
              party: position.party
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(position.contribution)} vote`);
                  if (position.contribution != 1) {
                    _push2(`<span${_scopeId}>s</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createTextVNode(toDisplayString(position.contribution) + " vote", 1),
                    position.contribution != 1 ? (openBlock(), createBlock("span", { key: 0 }, "s")) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_PersonCard, {
              person: position.person
            }, null, _parent));
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.noes.length > 0) {
        _push(`<h5 class="mt-3">Noes</h5>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.noes.length > 0) {
        _push(`<div class="row"><!--[-->`);
        ssrRenderList($options.noes, (position, i) => {
          _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
          if (!position.person) {
            _push(ssrRenderComponent(_component_PartyCard, {
              party: position.party
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(position.contribution)} vote`);
                  if (position.contribution != 1) {
                    _push2(`<span${_scopeId}>s</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createTextVNode(toDisplayString(position.contribution) + " vote", 1),
                    position.contribution != 1 ? (openBlock(), createBlock("span", { key: 0 }, "s")) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_PersonCard, {
              person: position.person
            }, null, _parent));
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.abstentions.length > 0) {
        _push(`<h5 class="mt-3">Abstentions</h5>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.abstentions.length > 0) {
        _push(`<div class="row"><!--[-->`);
        ssrRenderList($options.abstentions, (position, i) => {
          _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
          if (!position.person) {
            _push(ssrRenderComponent(_component_PartyCard, {
              party: position.party
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(position.contribution)} vote`);
                  if (position.contribution != 1) {
                    _push2(`<span${_scopeId}>s</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createTextVNode(toDisplayString(position.contribution) + " vote", 1),
                    position.contribution != 1 ? (openBlock(), createBlock("span", { key: 0 }, "s")) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_PersonCard, {
              person: position.person
            }, null, _parent));
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.absences.length > 0) {
        _push(`<h5 class="mt-3">Absences</h5>`);
      } else {
        _push(`<!---->`);
      }
      if ($options.absences.length > 0) {
        _push(`<div class="row"><!--[-->`);
        ssrRenderList($options.absences, (position, i) => {
          _push(`<div class="col-12 col-md-6 col-lg-4 col-xl-3">`);
          if (!position.person) {
            _push(ssrRenderComponent(_component_PartyCard, {
              party: position.party
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(position.contribution)} vote`);
                  if (position.contribution != 1) {
                    _push2(`<span${_scopeId}>s</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createTextVNode(toDisplayString(position.contribution) + " vote", 1),
                    position.contribution != 1 ? (openBlock(), createBlock("span", { key: 0 }, "s")) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_PersonCard, {
              person: position.person
            }, null, _parent));
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<div>`);
      if ($data.listMode == "vote") {
        _push(`<div>`);
        if ($options.ayes.length > 0) {
          _push(`<h5 class="mt-3">Ayes</h5>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_Card, { class: "col-12" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_PersonList, { positions: $options.ayes }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_PersonList, { positions: $options.ayes }, null, 8, ["positions"])
              ];
            }
          }),
          _: 1
        }, _parent));
        if ($options.noes.length > 0) {
          _push(`<h5 class="mt-3">Noes</h5>`);
        } else {
          _push(`<!---->`);
        }
        if ($options.noes.length > 0) {
          _push(ssrRenderComponent(_component_Card, { class: "col-12" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_PersonList, { positions: $options.noes }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_PersonList, { positions: $options.noes }, null, 8, ["positions"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if ($options.abstentions.length > 0) {
          _push(`<h5 class="mt-3">Abstentions</h5>`);
        } else {
          _push(`<!---->`);
        }
        if ($options.abstentions.length > 0) {
          _push(ssrRenderComponent(_component_Card, { class: "col-12" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_PersonList, { positions: $options.abstentions }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_PersonList, { positions: $options.abstentions }, null, 8, ["positions"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if ($options.absences.length > 0) {
          _push(`<h5 class="mt-3">Absences</h5>`);
        } else {
          _push(`<!---->`);
        }
        if ($options.absences.length > 0) {
          _push(ssrRenderComponent(_component_Card, { class: "col-12" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_PersonList, { positions: $options.absences }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_PersonList, { positions: $options.absences }, null, 8, ["positions"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    }
    _push(`<div class="col-12"><p class="text-muted">Last updated from Hansard ${ssrInterpolate($options.relativeDate)}. `);
    if ($options.vote.hansard_status.toLowerCase() == "final") {
      _push(`<span>The Hansard record that contains this vote is final.</span>`);
    } else if ($options.vote.hansard_status.toLowerCase() == "draft") {
      _push(`<span>The Hansard record that contains this vote is in a draft state. Details of the vote are subject to change and the original Hansard will be checked regularly for updates.</span>`);
    } else if ($options.vote.hansard_status.toLowerCase() == "corrected") {
      _push(`<span>The Hansard record that contains this vote is in the &#39;corrected&#39; stage of publication, but it is not yet final. Minor changes are still possible.</span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</p></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/votes/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-1eaa8862.mjs.map
