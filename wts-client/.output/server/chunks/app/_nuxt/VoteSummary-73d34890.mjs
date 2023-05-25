import { _ as _export_sfc, e as __nuxt_component_1$1, a as __nuxt_component_2 } from '../server.mjs';
import { mergeProps, useSSRContext, withCtx, openBlock, createBlock, createVNode, toDisplayString, createTextVNode, createCommentVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { format, parse } from 'date-fns';

const _sfc_main$1 = {
  name: "DownloadLink",
  data() {
    return {
      apiRoot: "https://wheretheystand.nz"
    };
  },
  props: {
    fileType: {
      type: String,
      default: "csv",
      validator(value) {
        return ["csv", "json", "xlsx"].includes(value);
      }
    },
    resourceType: {
      type: String,
      validator(value) {
        return ["vote", "bill"].includes(value);
      }
    },
    resourceId: {
      type: String
    },
    friendlyName: {
      default: null
    }
  },
  computed: {
    fasIconName() {
      if (this.fileType == "csv") {
        return "file-csv";
      } else if (this.fileType == "json") {
        return "file-code";
      } else if (this.fileType == "xlsx") {
        return "file-excel";
      }
    },
    link() {
      switch (this.fileType) {
        case "csv":
          switch (this.resourceType) {
            case "vote":
              return this.apiRoot + "/api/votes/" + this.resourceId + "?df=csv";
          }
        case "xlsx":
          switch (this.resourceType) {
            case "vote":
              return this.apiRoot + "/api/votes/" + this.resourceId + "?df=xlsx";
          }
        case "json":
          switch (this.resourceType) {
            case "vote":
              return this.apiRoot + "/api/votes/" + this.resourceId + "?format=json";
            case "bill":
              return this.apiRoot + "/api/bills/" + this.resourceId + "?format=json";
          }
      }
    },
    saveName() {
      if (!this.friendlyName) {
        return this.resourceType + "_" + this.resourceId + "." + this.fileType;
      } else {
        return this.friendlyName + "_" + this.resourceId + "." + this.fileType;
      }
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_font_awesome_icon = __nuxt_component_1$1;
  _push(`<a${ssrRenderAttrs(mergeProps({
    href: $options.link,
    class: "me-2",
    target: "_blank",
    download: $options.saveName
  }, _attrs))} data-v-e072208e>`);
  _push(ssrRenderComponent(_component_font_awesome_icon, {
    class: "me-1",
    icon: ["fas", $options.fasIconName]
  }, null, _parent));
  _push(`${ssrInterpolate($props.fileType.toUpperCase())}</a>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DownloadLink.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-e072208e"]]);
const _sfc_main = {
  props: {
    vote: {
      type: Object
    },
    countsOnly: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    }
  },
  computed: {
    readingOrdinal() {
      return this.vote.reading + { 1: "st reading", 2: "nd reading", 3: "rd reading" }[this.vote.reading];
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2;
  if ($props.vote) {
    _push(ssrRenderComponent(_component_Card, _attrs, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          if (!$props.countsOnly) {
            _push2(`<div${_scopeId}><h6 class="text-uppercase"${_scopeId}><strong${_scopeId}>${ssrInterpolate($options.readingOrdinal)}</strong></h6><h5 class="text-uppercase"${_scopeId}>`);
            if ($props.vote.motion_successful === true) {
              _push2(`<span${_scopeId}><span class="dot-yes"${_scopeId}></span> <strong${_scopeId}>Passed</strong></span>`);
            } else if ($props.vote.motion_successful === false) {
              _push2(`<span${_scopeId}><span class="dot-no"${_scopeId}></span> <strong${_scopeId}>Defeated</strong></span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</h5><h6 class="text-muted"${_scopeId}>${ssrInterpolate($options.formatDate($props.vote.vote_date))}</h6><hr${_scopeId}></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="row"${_scopeId}><div class="col-3 text-center"${_scopeId}><h3${_scopeId}>${ssrInterpolate($props.vote.totals.ayes)}</h3><h6 class="text-muted text-uppercase"${_scopeId}><span class="dot-yes"${_scopeId}></span> Ayes</h6></div><div class="col-3 text-center"${_scopeId}><h3${_scopeId}>${ssrInterpolate($props.vote.totals.noes)}</h3><h6 class="text-muted text-uppercase"${_scopeId}><span class="dot-no"${_scopeId}></span> Noes</h6></div><div class="col-3 text-center"${_scopeId}><h3${_scopeId}>${ssrInterpolate($props.vote.totals.abstentions)}</h3><h6 class="text-muted text-uppercase"${_scopeId}><span class="dot-abstain"${_scopeId}></span> Abst.</h6></div><div class="col-3 text-center"${_scopeId}><h3${_scopeId}>${ssrInterpolate($props.vote.totals.absent)}</h3><h6 class="text-muted text-uppercase"${_scopeId}><span class="dot-absent"${_scopeId}></span> Abse.</h6></div></div>`);
        } else {
          return [
            !$props.countsOnly ? (openBlock(), createBlock("div", { key: 0 }, [
              createVNode("h6", { class: "text-uppercase" }, [
                createVNode("strong", null, toDisplayString($options.readingOrdinal), 1)
              ]),
              createVNode("h5", { class: "text-uppercase" }, [
                $props.vote.motion_successful === true ? (openBlock(), createBlock("span", { key: 0 }, [
                  createVNode("span", { class: "dot-yes" }),
                  createTextVNode(),
                  createVNode("strong", null, "Passed")
                ])) : $props.vote.motion_successful === false ? (openBlock(), createBlock("span", { key: 1 }, [
                  createVNode("span", { class: "dot-no" }),
                  createTextVNode(),
                  createVNode("strong", null, "Defeated")
                ])) : createCommentVNode("", true)
              ]),
              createVNode("h6", { class: "text-muted" }, toDisplayString($options.formatDate($props.vote.vote_date)), 1),
              createVNode("hr")
            ])) : createCommentVNode("", true),
            createVNode("div", { class: "row" }, [
              createVNode("div", { class: "col-3 text-center" }, [
                createVNode("h3", null, toDisplayString($props.vote.totals.ayes), 1),
                createVNode("h6", { class: "text-muted text-uppercase" }, [
                  createVNode("span", { class: "dot-yes" }),
                  createTextVNode(" Ayes")
                ])
              ]),
              createVNode("div", { class: "col-3 text-center" }, [
                createVNode("h3", null, toDisplayString($props.vote.totals.noes), 1),
                createVNode("h6", { class: "text-muted text-uppercase" }, [
                  createVNode("span", { class: "dot-no" }),
                  createTextVNode(" Noes")
                ])
              ]),
              createVNode("div", { class: "col-3 text-center" }, [
                createVNode("h3", null, toDisplayString($props.vote.totals.abstentions), 1),
                createVNode("h6", { class: "text-muted text-uppercase" }, [
                  createVNode("span", { class: "dot-abstain" }),
                  createTextVNode(" Abst.")
                ])
              ]),
              createVNode("div", { class: "col-3 text-center" }, [
                createVNode("h3", null, toDisplayString($props.vote.totals.absent), 1),
                createVNode("h6", { class: "text-muted text-uppercase" }, [
                  createVNode("span", { class: "dot-absent" }),
                  createTextVNode(" Abse.")
                ])
              ])
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VoteSummary.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { __nuxt_component_7 as _, __nuxt_component_3 as a };
//# sourceMappingURL=VoteSummary-73d34890.mjs.map
