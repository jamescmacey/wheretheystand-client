import { f as defineStore, u as useFetch, A as API_BASE, _ as _export_sfc, H as Head, M as Meta, a as __nuxt_component_2, d as __nuxt_component_0$1 } from '../server.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-31b75e0d.mjs';
import { _ as __nuxt_component_9 } from './PersonCard-61386b6b.mjs';
import { _ as __nuxt_component_4 } from './ColourDot-2c5d3e0d.mjs';
import { format, parse } from 'date-fns';
import { mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
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

const useElectoratesStore = defineStore("electorates", {
  state() {
    return {
      items: [],
      data: {
        histories: {},
        shapes: {}
      }
    };
  },
  getters: {
    byIdentifier: (state) => (id) => {
      if (state.items.find((item) => item.slug === id)) {
        return state.items.find((item) => item.slug === id);
      }
      return state.items.find((item) => item.id === id);
    },
    historyByIdentifier: (state) => (id) => {
      return state.data.histories[id];
    },
    shapeByIdentifier: (state) => (id) => {
      return state.data.shapes[id];
    }
  },
  actions: {
    async fetch(id) {
      if (!this.byIdentifier(id)) {
        var state = this;
        await useFetch(API_BASE + "electorates/" + id + "/", {
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
        }, "$uURIksy8X5");
      }
    },
    async fetchHistory(id) {
      if (!this.historyByIdentifier(id)) {
        var state = this;
        await useFetch(API_BASE + "electorates/" + id + "/history/", {
          onResponse({ request, response, options }) {
            state.data.histories[id] = response._data;
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$Hh9FkjXIxP");
      }
    },
    async fetchShape(id) {
      if (!this.shapeByIdentifier(id)) {
        var state = this;
        await useFetch(API_BASE + "electorates/" + id + "/shape/", {
          onResponse({ request, response, options }) {
            state.data.shapes[id] = response._data;
          },
          onResponseError({ request, response, options }) {
            const store = useNotificationsStore();
            store.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            const store = useNotificationsStore();
            store.addToast("Error fetching resource (request)", error);
          }
        }, "$wzooPl4C85");
      }
    }
  }
});
const _sfc_main = {
  name: "Electorate",
  setup() {
    const electoratesStore = useElectoratesStore();
    return { electoratesStore };
  },
  data() {
    return {
      showReasons: false
    };
  },
  created() {
    this.electoratesStore.fetch(this.$route.params.id);
    this.electoratesStore.fetchHistory(this.$route.params.id);
    this.electoratesStore.fetchShape(this.$route.params.id);
  },
  computed: {
    electorate() {
      return this.electoratesStore.byIdentifier(this.$route.params.id);
    },
    affiliations() {
      return this.electoratesStore.historyByIdentifier(this.$route.params.id);
    },
    shape() {
      return null;
    },
    paths() {
      if (!this.shape || this.shape["wts-comment"] == "noshape") {
        return [];
      }
      var feature = this.shape.features[0];
      if (feature.geometry.type == "Polygon") {
        return this.shape.features[0].geometry.coordinates;
      } else if (feature.geometry.type == "MultiPolygon") {
        var paths = [];
        this.shape.features[0].geometry.coordinates.forEach((polygon) => {
          paths.push(polygon[0]);
        });
        return paths;
      }
    },
    limits() {
      if (!this.shape || this.shape["wts-comment"] == "noshape") {
        return void 0;
      }
      var north = -180;
      var south = 0;
      var east = 0;
      var west = 360;
      this.paths.forEach((polygon) => {
        polygon.forEach((coordinate) => {
          var ewc = coordinate[0];
          var nsc = coordinate[1];
          if (ewc < 0) {
            ewc = ewc + 360;
          }
          if (ewc > east) {
            east = ewc;
          }
          if (ewc < west) {
            west = ewc;
          }
          if (nsc > north) {
            north = nsc;
          }
          if (nsc < south) {
            south = nsc;
          }
        });
      });
      if (east > 180) {
        east = east - 360;
      }
      return {
        north,
        south,
        east,
        west
      };
    },
    center() {
      if (this.limits) {
        var east = this.limits.east;
        if (east < 0) {
          east = east + 360;
        }
        var ewCentre = (east + this.limits.west) / 2;
        if (ewCentre > 180) {
          ewCentre = ewCentre - 360;
        }
        return [ewCentre, (this.limits.north + this.limits.south) / 2];
      } else {
        return [0, 0];
      }
    },
    centerGoogle() {
      return { lat: this.center[0], lng: this.center[1] };
    }
  },
  methods: {
    formatDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    }
  },
  watch: {
    $route(to, from) {
      if (to.fullPath.startsWith("/electorates/")) {
        this.electoratesStore.fetch(to.params.id);
        this.electoratesStore.fetchHistory(to.params.id);
        this.electoratesStore.fetchShape(to.params.id);
      }
    }
  },
  mounted() {
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Meta = Meta;
  const _component_PageHeader = __nuxt_component_0;
  const _component_PersonCard = __nuxt_component_9;
  const _component_Card = __nuxt_component_2;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_colour_dot = __nuxt_component_4;
  const _component_ColourDot = __nuxt_component_4;
  if ($options.electorate) {
    _push(`<div${ssrRenderAttrs(mergeProps({ id: "electorate-view" }, _attrs))} data-v-d4b8fde5>`);
    _push(ssrRenderComponent(_component_Head, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:title",
            content: $options.electorate.name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "twitter:description",
            content: $options.electorate.description
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            name: "description",
            content: $options.electorate.description
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:title",
            content: $options.electorate.name + " - WhereTheyStand"
          }, null, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_Meta, {
            property: "og:description",
            content: $options.electorate.description
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_Meta, {
              name: "twitter:title",
              content: $options.electorate.name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "twitter:description",
              content: $options.electorate.description
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              name: "description",
              content: $options.electorate.description
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:title",
              content: $options.electorate.name + " - WhereTheyStand"
            }, null, 8, ["content"]),
            createVNode(_component_Meta, {
              property: "og:description",
              content: $options.electorate.description
            }, null, 8, ["content"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_PageHeader, {
      pageTitle: $options.electorate.name,
      pageSubtitle: $options.electorate.description
    }, null, _parent));
    _push(`<div class="container-fluid hero pt-0" data-v-d4b8fde5></div><div class="mt-3 container" data-v-d4b8fde5>`);
    if (($options.electorate.status === "current" || $options.electorate.status === "retiring") && $options.electorate.incumbent) {
      _push(`<div data-v-d4b8fde5><div class="row" data-v-d4b8fde5><div class="col-12 col-xl-4" data-v-d4b8fde5><h4 data-v-d4b8fde5>Incumbent Member of Parliament</h4>`);
      _push(ssrRenderComponent(_component_PersonCard, {
        person: $options.electorate.incumbent
      }, null, _parent));
      _push(`</div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($options.electorate.status !== "current") {
      _push(`<div data-v-d4b8fde5><div class="row" data-v-d4b8fde5><div class="col-12" data-v-d4b8fde5>`);
      if ($options.electorate.status === "retiring") {
        _push(ssrRenderComponent(_component_Card, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h5 data-v-d4b8fde5${_scopeId}>This electorate is retiring`);
              if ($options.electorate.valid_to) {
                _push2(`<span data-v-d4b8fde5${_scopeId}> on ${ssrInterpolate($options.formatDate($options.electorate.valid_to))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`.</h5>`);
              if ($options.electorate.replaced_by) {
                _push2(`<p data-v-d4b8fde5${_scopeId}>The electorate of ${ssrInterpolate($options.electorate.name)} will be replaced by `);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/electorates/" + $options.electorate.replaced_by.slug
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate($options.electorate.replaced_by.name)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString($options.electorate.replaced_by.name), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`.</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("h5", null, [
                  createTextVNode("This electorate is retiring"),
                  $options.electorate.valid_to ? (openBlock(), createBlock("span", { key: 0 }, " on " + toDisplayString($options.formatDate($options.electorate.valid_to)), 1)) : createCommentVNode("", true),
                  createTextVNode(".")
                ]),
                $options.electorate.replaced_by ? (openBlock(), createBlock("p", { key: 0 }, [
                  createTextVNode("The electorate of " + toDisplayString($options.electorate.name) + " will be replaced by ", 1),
                  createVNode(_component_NuxtLink, {
                    to: "/electorates/" + $options.electorate.replaced_by.slug
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString($options.electorate.replaced_by.name), 1)
                    ]),
                    _: 1
                  }, 8, ["to"]),
                  createTextVNode(".")
                ])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if ($options.electorate.status === "former") {
        _push(ssrRenderComponent(_component_Card, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h5 data-v-d4b8fde5${_scopeId}>This electorate retired`);
              if ($options.electorate.valid_to) {
                _push2(`<span data-v-d4b8fde5${_scopeId}> on ${ssrInterpolate($options.formatDate($options.electorate.valid_to))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`.</h5>`);
              if ($options.electorate.replaced_by) {
                _push2(`<p data-v-d4b8fde5${_scopeId}>The electorate of ${ssrInterpolate($options.electorate.name)} has been replaced by `);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/electorates/" + $options.electorate.replaced_by.slug
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate($options.electorate.replaced_by.name)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString($options.electorate.replaced_by.name), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`.</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("h5", null, [
                  createTextVNode("This electorate retired"),
                  $options.electorate.valid_to ? (openBlock(), createBlock("span", { key: 0 }, " on " + toDisplayString($options.formatDate($options.electorate.valid_to)), 1)) : createCommentVNode("", true),
                  createTextVNode(".")
                ]),
                $options.electorate.replaced_by ? (openBlock(), createBlock("p", { key: 0 }, [
                  createTextVNode("The electorate of " + toDisplayString($options.electorate.name) + " has been replaced by ", 1),
                  createVNode(_component_NuxtLink, {
                    to: "/electorates/" + $options.electorate.replaced_by.slug
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString($options.electorate.replaced_by.name), 1)
                    ]),
                    _: 1
                  }, 8, ["to"]),
                  createTextVNode(".")
                ])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="row" data-v-d4b8fde5><div class="col-12" data-v-d4b8fde5><h4 data-v-d4b8fde5>Previous MPs</h4><div class="form-check" data-v-d4b8fde5><input class="form-check-input" type="checkbox" value=""${ssrIncludeBooleanAttr(Array.isArray($data.showReasons) ? ssrLooseContain($data.showReasons, "") : $data.showReasons) ? " checked" : ""} id="showReasons" data-v-d4b8fde5><label class="form-check-label" for="showReasons" data-v-d4b8fde5> Show reasons for commencement and conclusion of terms </label></div></div><div class="col-12" data-v-d4b8fde5>`);
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<!--[-->`);
          ssrRenderList($options.affiliations, (affiliation, i) => {
            _push2(`<div data-v-d4b8fde5${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "NuxtLink",
              to: "/people/" + affiliation.person.slug
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (i == 0 || $options.affiliations[i].person.id != $options.affiliations[i - 1].person.id) {
                    _push3(`<div data-v-d4b8fde5${_scopeId2}>`);
                    if (affiliation.person.image) {
                      _push3(`<div class="d-flex align-items-center" data-v-d4b8fde5${_scopeId2}><div class="flex-shrink-0" data-v-d4b8fde5${_scopeId2}>`);
                      if (affiliation.person.image) {
                        _push3(`<img${ssrRenderAttr("src", affiliation.person.image)} class="me-3 person-image"${ssrRenderAttr("alt", affiliation.person.display_name)} data-v-d4b8fde5${_scopeId2}>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div><div class="flex-grow-1 ms-3" data-v-d4b8fde5${_scopeId2}><h5 data-v-d4b8fde5${_scopeId2}><strong data-v-d4b8fde5${_scopeId2}>${ssrInterpolate(affiliation.person.display_name)}</strong></h5><p class="text-muted" data-v-d4b8fde5${_scopeId2}>`);
                      if (affiliation.person.colour) {
                        _push3(ssrRenderComponent(_component_colour_dot, {
                          colour: affiliation.person.colour
                        }, null, _parent3, _scopeId2));
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(` Currently: ${ssrInterpolate(affiliation.person.description)}</p></div></div>`);
                    } else {
                      _push3(`<div data-v-d4b8fde5${_scopeId2}><h6 data-v-d4b8fde5${_scopeId2}><strong data-v-d4b8fde5${_scopeId2}>${ssrInterpolate(affiliation.person.display_name)}</strong></h6><p class="text-muted person-description" data-v-d4b8fde5${_scopeId2}>`);
                      if (affiliation.person.colour) {
                        _push3(ssrRenderComponent(_component_ColourDot, {
                          colour: affiliation.person.colour
                        }, null, _parent3, _scopeId2));
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(` Currently: ${ssrInterpolate(affiliation.person.description)}</p></div>`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="row" data-v-d4b8fde5${_scopeId2}><div class="col-1" data-v-d4b8fde5${_scopeId2}></div><div class="col-11" data-v-d4b8fde5${_scopeId2}><div class="row" data-v-d4b8fde5${_scopeId2}><div class="col-12 col-md-6" data-v-d4b8fde5${_scopeId2}><h6 class="affiliation-date-heading" data-v-d4b8fde5${_scopeId2}>Started:</h6> ${ssrInterpolate($options.formatDate(affiliation.start_date))} `);
                  if ($data.showReasons && affiliation.start_reason_desc) {
                    _push3(`<h6 class="affiliation-date-heading" data-v-d4b8fde5${_scopeId2}>Reason: </h6>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if ($data.showReasons && affiliation.start_reason_desc) {
                    _push3(`<span data-v-d4b8fde5${_scopeId2}>${ssrInterpolate(affiliation.start_reason_desc)}</span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  if (affiliation.end_date) {
                    _push3(`<div class="col-12 col-md-6" data-v-d4b8fde5${_scopeId2}><h6 class="affiliation-date-heading" data-v-d4b8fde5${_scopeId2}>Ended:</h6> ${ssrInterpolate($options.formatDate(affiliation.end_date))} `);
                    if ($data.showReasons && affiliation.end_reason_desc) {
                      _push3(`<h6 class="affiliation-date-heading" data-v-d4b8fde5${_scopeId2}>Reason: </h6>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if ($data.showReasons && affiliation.end_reason_desc) {
                      _push3(`<span data-v-d4b8fde5${_scopeId2}>${ssrInterpolate(affiliation.end_reason_desc)}</span>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  if (i < $options.affiliations.length - 1 && $options.affiliations[i].person.id == $options.affiliations[i + 1].person.id) {
                    _push3(`<hr data-v-d4b8fde5${_scopeId2}>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></div>`);
                  if (i < $options.affiliations.length - 1 && $options.affiliations[i].person.id != $options.affiliations[i + 1].person.id) {
                    _push3(`<hr data-v-d4b8fde5${_scopeId2}>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    i == 0 || $options.affiliations[i].person.id != $options.affiliations[i - 1].person.id ? (openBlock(), createBlock("div", { key: 0 }, [
                      affiliation.person.image ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "d-flex align-items-center"
                      }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          affiliation.person.image ? (openBlock(), createBlock("img", {
                            key: 0,
                            src: affiliation.person.image,
                            class: "me-3 person-image",
                            alt: affiliation.person.display_name
                          }, null, 8, ["src", "alt"])) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "flex-grow-1 ms-3" }, [
                          createVNode("h5", null, [
                            createVNode("strong", null, toDisplayString(affiliation.person.display_name), 1)
                          ]),
                          createVNode("p", { class: "text-muted" }, [
                            affiliation.person.colour ? (openBlock(), createBlock(_component_colour_dot, {
                              key: 0,
                              colour: affiliation.person.colour
                            }, null, 8, ["colour"])) : createCommentVNode("", true),
                            createTextVNode(" Currently: " + toDisplayString(affiliation.person.description), 1)
                          ])
                        ])
                      ])) : (openBlock(), createBlock("div", { key: 1 }, [
                        createVNode("h6", null, [
                          createVNode("strong", null, toDisplayString(affiliation.person.display_name), 1)
                        ]),
                        createVNode("p", { class: "text-muted person-description" }, [
                          affiliation.person.colour ? (openBlock(), createBlock(_component_ColourDot, {
                            key: 0,
                            colour: affiliation.person.colour
                          }, null, 8, ["colour"])) : createCommentVNode("", true),
                          createTextVNode(" Currently: " + toDisplayString(affiliation.person.description), 1)
                        ])
                      ]))
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "row" }, [
                      createVNode("div", { class: "col-1" }),
                      createVNode("div", { class: "col-11" }, [
                        createVNode("div", { class: "row" }, [
                          createVNode("div", { class: "col-12 col-md-6" }, [
                            createVNode("h6", { class: "affiliation-date-heading" }, "Started:"),
                            createTextVNode(" " + toDisplayString($options.formatDate(affiliation.start_date)) + " ", 1),
                            $data.showReasons && affiliation.start_reason_desc ? (openBlock(), createBlock("h6", {
                              key: 0,
                              class: "affiliation-date-heading"
                            }, "Reason: ")) : createCommentVNode("", true),
                            $data.showReasons && affiliation.start_reason_desc ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(affiliation.start_reason_desc), 1)) : createCommentVNode("", true)
                          ]),
                          affiliation.end_date ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "col-12 col-md-6"
                          }, [
                            createVNode("h6", { class: "affiliation-date-heading" }, "Ended:"),
                            createTextVNode(" " + toDisplayString($options.formatDate(affiliation.end_date)) + " ", 1),
                            $data.showReasons && affiliation.end_reason_desc ? (openBlock(), createBlock("h6", {
                              key: 0,
                              class: "affiliation-date-heading"
                            }, "Reason: ")) : createCommentVNode("", true),
                            $data.showReasons && affiliation.end_reason_desc ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(affiliation.end_reason_desc), 1)) : createCommentVNode("", true)
                          ])) : createCommentVNode("", true)
                        ]),
                        i < $options.affiliations.length - 1 && $options.affiliations[i].person.id == $options.affiliations[i + 1].person.id ? (openBlock(), createBlock("hr", { key: 0 })) : createCommentVNode("", true)
                      ])
                    ]),
                    i < $options.affiliations.length - 1 && $options.affiliations[i].person.id != $options.affiliations[i + 1].person.id ? (openBlock(), createBlock("hr", { key: 1 })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          });
          _push2(`<!--]--><hr data-v-d4b8fde5${_scopeId}><p class="text-muted" data-v-d4b8fde5${_scopeId}>These dates correspond to when an MP was eligible to sit and vote in the House of Representatives, not when they were declared elected. This list only includes MPs with profiles on WhereTheyStand, so it may contain some gaps.</p>`);
        } else {
          return [
            (openBlock(true), createBlock(Fragment, null, renderList($options.affiliations, (affiliation, i) => {
              return openBlock(), createBlock("div", {
                key: affiliation.id
              }, [
                createVNode(_component_NuxtLink, {
                  class: "NuxtLink",
                  to: "/people/" + affiliation.person.slug
                }, {
                  default: withCtx(() => [
                    i == 0 || $options.affiliations[i].person.id != $options.affiliations[i - 1].person.id ? (openBlock(), createBlock("div", { key: 0 }, [
                      affiliation.person.image ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "d-flex align-items-center"
                      }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          affiliation.person.image ? (openBlock(), createBlock("img", {
                            key: 0,
                            src: affiliation.person.image,
                            class: "me-3 person-image",
                            alt: affiliation.person.display_name
                          }, null, 8, ["src", "alt"])) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "flex-grow-1 ms-3" }, [
                          createVNode("h5", null, [
                            createVNode("strong", null, toDisplayString(affiliation.person.display_name), 1)
                          ]),
                          createVNode("p", { class: "text-muted" }, [
                            affiliation.person.colour ? (openBlock(), createBlock(_component_colour_dot, {
                              key: 0,
                              colour: affiliation.person.colour
                            }, null, 8, ["colour"])) : createCommentVNode("", true),
                            createTextVNode(" Currently: " + toDisplayString(affiliation.person.description), 1)
                          ])
                        ])
                      ])) : (openBlock(), createBlock("div", { key: 1 }, [
                        createVNode("h6", null, [
                          createVNode("strong", null, toDisplayString(affiliation.person.display_name), 1)
                        ]),
                        createVNode("p", { class: "text-muted person-description" }, [
                          affiliation.person.colour ? (openBlock(), createBlock(_component_ColourDot, {
                            key: 0,
                            colour: affiliation.person.colour
                          }, null, 8, ["colour"])) : createCommentVNode("", true),
                          createTextVNode(" Currently: " + toDisplayString(affiliation.person.description), 1)
                        ])
                      ]))
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "row" }, [
                      createVNode("div", { class: "col-1" }),
                      createVNode("div", { class: "col-11" }, [
                        createVNode("div", { class: "row" }, [
                          createVNode("div", { class: "col-12 col-md-6" }, [
                            createVNode("h6", { class: "affiliation-date-heading" }, "Started:"),
                            createTextVNode(" " + toDisplayString($options.formatDate(affiliation.start_date)) + " ", 1),
                            $data.showReasons && affiliation.start_reason_desc ? (openBlock(), createBlock("h6", {
                              key: 0,
                              class: "affiliation-date-heading"
                            }, "Reason: ")) : createCommentVNode("", true),
                            $data.showReasons && affiliation.start_reason_desc ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(affiliation.start_reason_desc), 1)) : createCommentVNode("", true)
                          ]),
                          affiliation.end_date ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "col-12 col-md-6"
                          }, [
                            createVNode("h6", { class: "affiliation-date-heading" }, "Ended:"),
                            createTextVNode(" " + toDisplayString($options.formatDate(affiliation.end_date)) + " ", 1),
                            $data.showReasons && affiliation.end_reason_desc ? (openBlock(), createBlock("h6", {
                              key: 0,
                              class: "affiliation-date-heading"
                            }, "Reason: ")) : createCommentVNode("", true),
                            $data.showReasons && affiliation.end_reason_desc ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(affiliation.end_reason_desc), 1)) : createCommentVNode("", true)
                          ])) : createCommentVNode("", true)
                        ]),
                        i < $options.affiliations.length - 1 && $options.affiliations[i].person.id == $options.affiliations[i + 1].person.id ? (openBlock(), createBlock("hr", { key: 0 })) : createCommentVNode("", true)
                      ])
                    ]),
                    i < $options.affiliations.length - 1 && $options.affiliations[i].person.id != $options.affiliations[i + 1].person.id ? (openBlock(), createBlock("hr", { key: 1 })) : createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1032, ["to"])
              ]);
            }), 128)),
            createVNode("hr"),
            createVNode("p", { class: "text-muted" }, "These dates correspond to when an MP was eligible to sit and vote in the House of Representatives, not when they were declared elected. This list only includes MPs with profiles on WhereTheyStand, so it may contain some gaps.")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div></div>`);
    if ($options.electorate.replaced_electorate) {
      _push(`<div data-v-d4b8fde5><div class="row" data-v-d4b8fde5><div class="col-12" data-v-d4b8fde5><h4 data-v-d4b8fde5>History</h4>`);
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h5 data-v-d4b8fde5${_scopeId}>This electorate replaced the `);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/electorates/" + $options.electorate.replaced_electorate.slug
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate($options.electorate.replaced_electorate.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString($options.electorate.replaced_electorate.name), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(` electorate on ${ssrInterpolate($options.formatDate(
              $options.electorate.valid_from
            ))}.</h5><p data-v-d4b8fde5${_scopeId}>See `);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/electorates/" + $options.electorate.replaced_electorate.slug
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate($options.electorate.replaced_electorate.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString($options.electorate.replaced_electorate.name), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(` for more former MPs.</p>`);
          } else {
            return [
              createVNode("h5", null, [
                createTextVNode("This electorate replaced the "),
                createVNode(_component_NuxtLink, {
                  to: "/electorates/" + $options.electorate.replaced_electorate.slug
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString($options.electorate.replaced_electorate.name), 1)
                  ]),
                  _: 1
                }, 8, ["to"]),
                createTextVNode(" electorate on " + toDisplayString($options.formatDate(
                  $options.electorate.valid_from
                )) + ".", 1)
              ]),
              createVNode("p", null, [
                createTextVNode("See "),
                createVNode(_component_NuxtLink, {
                  to: "/electorates/" + $options.electorate.replaced_electorate.slug
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString($options.electorate.replaced_electorate.name), 1)
                  ]),
                  _: 1
                }, 8, ["to"]),
                createTextVNode(" for more former MPs.")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/electorates/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-d4b8fde5"]]);

export { index as default };
//# sourceMappingURL=index-63363c33.mjs.map
