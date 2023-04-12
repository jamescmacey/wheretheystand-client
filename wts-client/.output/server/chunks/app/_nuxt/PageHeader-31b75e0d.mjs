import { _ as _export_sfc, H as Head, T as Title, d as __nuxt_component_0$1, e as __nuxt_component_1 } from '../server.mjs';
import { Harmonizer } from 'color-harmony';
import { format, parse } from 'date-fns';
import { withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';

const _sfc_main = {
  name: "PageHeader",
  props: {
    pageTitle: String,
    pageSubtitle: String,
    pageDate: String,
    image: String,
    colour: String,
    secondaryColour: String,
    metaPageTitle: {
      type: String,
      default: null
    },
    pageLinks: {
      type: Array,
      default: () => {
        return [];
      }
    },
    backLink: {
      type: String,
      default: null
    },
    backText: {
      type: String,
      default: "Go back"
    }
  },
  computed: {
    metaTitle() {
      if (this.metaPageTitle) {
        return this.metaPageTitle;
      } else if (this.pageTitle) {
        return this.pageTitle;
      } else {
        return "";
      }
    },
    harmony: function() {
      var harmonizer = new Harmonizer();
      if (!this.colour) {
        return ["#58787f", "rgb(52, 148, 148)"];
      }
      if (this.secondaryColour) {
        return [this.colour, this.secondaryColour];
      }
      return harmonizer.harmonize(this.colour, "neutral");
    },
    gradient: function() {
      return `linear-gradient(230deg, ${this.harmony[1]} 0%, ${this.harmony[0]} 50%)`;
    }
  },
  methods: {
    formatDate(date) {
      return format(parse(date, "yyyy-MM-dd", /* @__PURE__ */ new Date()), "d MMMM yyyy");
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Head = Head;
  const _component_Title = Title;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_FontAwesomeIcon = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-e962b025>`);
  _push(ssrRenderComponent(_component_Head, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Title, null, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`${ssrInterpolate($options.metaTitle)}`);
            } else {
              return [
                createTextVNode(toDisplayString($options.metaTitle), 1)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_Title, null, {
            default: withCtx(() => [
              createTextVNode(toDisplayString($options.metaTitle), 1)
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<div class="container-fluid hero" style="${ssrRenderStyle({ backgroundImage: $options.gradient })}" data-v-e962b025><div class="container" data-v-e962b025>`);
  if (!$props.image) {
    _push(`<div data-v-e962b025><h1 class="hero" data-v-e962b025>${ssrInterpolate($props.pageTitle)}</h1>`);
    if ($props.pageSubtitle) {
      _push(`<h3 class="hero" data-v-e962b025>${ssrInterpolate($props.pageSubtitle)}</h3>`);
    } else {
      _push(`<!---->`);
    }
    if ($props.pageDate) {
      _push(`<h5 class="hero text-uppercase" data-v-e962b025>${ssrInterpolate($options.formatDate($props.pageDate))}</h5>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  } else {
    _push(`<div data-v-e962b025><div class="d-flex align-items-center" data-v-e962b025><div class="flex-shrink-0" data-v-e962b025><img class="me-3"${ssrRenderAttr("src", $props.image)}${ssrRenderAttr("alt", $props.pageTitle)} data-v-e962b025></div><div class="flex-grow-1 ms-3" data-v-e962b025><h1 class="hero" data-v-e962b025>${ssrInterpolate($props.pageTitle)}</h1>`);
    if ($props.pageSubtitle) {
      _push(`<h3 class="hero" data-v-e962b025>${ssrInterpolate($props.pageSubtitle)}</h3>`);
    } else {
      _push(`<!---->`);
    }
    if ($props.pageDate) {
      _push(`<h5 class="hero text-uppercase" data-v-e962b025>${ssrInterpolate($options.formatDate($props.pageDate))}</h5>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div></div>`);
  }
  if ($props.pageLinks.length) {
    _push(`<nav class="navbar navbar-expand-lg navbar-light sub-nav" data-v-e962b025><ul class="navbar-nav" data-v-e962b025><!--[-->`);
    ssrRenderList($props.pageLinks, (link, index) => {
      _push(`<li class="nav-item" data-v-e962b025>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "nav-link",
        to: link.to,
        "active-class": "active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(link.name)}`);
          } else {
            return [
              createTextVNode(toDisplayString(link.name), 1)
            ];
          }
        }),
        _: 2
      }, _parent));
      _push(`</li>`);
    });
    _push(`<!--]--></ul></nav>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
  if ($props.backLink) {
    _push(`<div class="container-fluid" style="${ssrRenderStyle({ backgroundColor: $options.harmony[1] })}" data-v-e962b025><div class="container py-2" data-v-e962b025>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      class: "back-link",
      to: $props.backLink
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_FontAwesomeIcon, { icon: ["fas", "arrow-left"] }, null, _parent2, _scopeId));
          _push2(` ${ssrInterpolate($props.backText)}`);
        } else {
          return [
            createVNode(_component_FontAwesomeIcon, { icon: ["fas", "arrow-left"] }),
            createTextVNode(" " + toDisplayString($props.backText), 1)
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PageHeader.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-e962b025"]]);

export { __nuxt_component_0 as _ };
//# sourceMappingURL=PageHeader-31b75e0d.mjs.map
