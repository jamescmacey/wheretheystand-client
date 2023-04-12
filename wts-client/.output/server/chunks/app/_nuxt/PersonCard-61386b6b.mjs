import { _ as _export_sfc, a as __nuxt_component_2 } from '../server.mjs';
import { _ as __nuxt_component_4 } from './ColourDot-2c5d3e0d.mjs';
import { resolveComponent, mergeProps, withCtx, openBlock, createBlock, createVNode, createCommentVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = {
  name: "PersonCard",
  components: {
    Card: __nuxt_component_2,
    ColourDot: __nuxt_component_4
  },
  props: {
    person: Object
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_Card = __nuxt_component_2;
  const _component_colour_dot = __nuxt_component_4;
  _push(ssrRenderComponent(_component_router_link, mergeProps({
    class: "router-link",
    to: "/people/" + $props.person.slug
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Card, null, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              if ($props.person.image) {
                _push3(`<div class="d-flex align-items-center" data-v-61cf02b7${_scopeId2}><div class="flex-shrink-0" data-v-61cf02b7${_scopeId2}>`);
                if ($props.person.image) {
                  _push3(`<img${ssrRenderAttr("src", $props.person.image)} class="me-3 person-image"${ssrRenderAttr("alt", $props.person.display_name)} data-v-61cf02b7${_scopeId2}>`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</div><div class="flex-grow-1 ms-3" data-v-61cf02b7${_scopeId2}><h5 data-v-61cf02b7${_scopeId2}><strong data-v-61cf02b7${_scopeId2}>${ssrInterpolate($props.person.display_name)}</strong></h5><p class="text-muted" data-v-61cf02b7${_scopeId2}>`);
                if ($props.person.colour) {
                  _push3(ssrRenderComponent(_component_colour_dot, {
                    colour: $props.person.colour
                  }, null, _parent3, _scopeId2));
                } else {
                  _push3(`<!---->`);
                }
                _push3(`${ssrInterpolate($props.person.description)}</p></div></div>`);
              } else {
                _push3(`<div data-v-61cf02b7${_scopeId2}><h5 data-v-61cf02b7${_scopeId2}><strong data-v-61cf02b7${_scopeId2}>${ssrInterpolate($props.person.display_name)}</strong></h5>`);
                if ($props.person.description) {
                  _push3(`<p class="text-muted" data-v-61cf02b7${_scopeId2}>`);
                  if ($props.person.colour) {
                    _push3(ssrRenderComponent(_component_colour_dot, {
                      colour: $props.person.colour
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`${ssrInterpolate($props.person.description)}</p>`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</div>`);
              }
            } else {
              return [
                $props.person.image ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "d-flex align-items-center"
                }, [
                  createVNode("div", { class: "flex-shrink-0" }, [
                    $props.person.image ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: $props.person.image,
                      class: "me-3 person-image",
                      alt: $props.person.display_name
                    }, null, 8, ["src", "alt"])) : createCommentVNode("", true)
                  ]),
                  createVNode("div", { class: "flex-grow-1 ms-3" }, [
                    createVNode("h5", null, [
                      createVNode("strong", null, toDisplayString($props.person.display_name), 1)
                    ]),
                    createVNode("p", { class: "text-muted" }, [
                      $props.person.colour ? (openBlock(), createBlock(_component_colour_dot, {
                        key: 0,
                        colour: $props.person.colour
                      }, null, 8, ["colour"])) : createCommentVNode("", true),
                      createTextVNode(toDisplayString($props.person.description), 1)
                    ])
                  ])
                ])) : (openBlock(), createBlock("div", { key: 1 }, [
                  createVNode("h5", null, [
                    createVNode("strong", null, toDisplayString($props.person.display_name), 1)
                  ]),
                  $props.person.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-muted"
                  }, [
                    $props.person.colour ? (openBlock(), createBlock(_component_colour_dot, {
                      key: 0,
                      colour: $props.person.colour
                    }, null, 8, ["colour"])) : createCommentVNode("", true),
                    createTextVNode(toDisplayString($props.person.description), 1)
                  ])) : createCommentVNode("", true)
                ]))
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_Card, null, {
            default: withCtx(() => [
              $props.person.image ? (openBlock(), createBlock("div", {
                key: 0,
                class: "d-flex align-items-center"
              }, [
                createVNode("div", { class: "flex-shrink-0" }, [
                  $props.person.image ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: $props.person.image,
                    class: "me-3 person-image",
                    alt: $props.person.display_name
                  }, null, 8, ["src", "alt"])) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex-grow-1 ms-3" }, [
                  createVNode("h5", null, [
                    createVNode("strong", null, toDisplayString($props.person.display_name), 1)
                  ]),
                  createVNode("p", { class: "text-muted" }, [
                    $props.person.colour ? (openBlock(), createBlock(_component_colour_dot, {
                      key: 0,
                      colour: $props.person.colour
                    }, null, 8, ["colour"])) : createCommentVNode("", true),
                    createTextVNode(toDisplayString($props.person.description), 1)
                  ])
                ])
              ])) : (openBlock(), createBlock("div", { key: 1 }, [
                createVNode("h5", null, [
                  createVNode("strong", null, toDisplayString($props.person.display_name), 1)
                ]),
                $props.person.description ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-muted"
                }, [
                  $props.person.colour ? (openBlock(), createBlock(_component_colour_dot, {
                    key: 0,
                    colour: $props.person.colour
                  }, null, 8, ["colour"])) : createCommentVNode("", true),
                  createTextVNode(toDisplayString($props.person.description), 1)
                ])) : createCommentVNode("", true)
              ]))
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PersonCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_9 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-61cf02b7"]]);

export { __nuxt_component_9 as _ };
//# sourceMappingURL=PersonCard-61386b6b.mjs.map
