import { _ as _export_sfc, a as __nuxt_component_2 } from '../server.mjs';
import { resolveComponent, mergeProps, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, createCommentVNode, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = {
  name: "PartyCard",
  components: {
    Card: __nuxt_component_2
  },
  props: {
    party: Object
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_router_link = resolveComponent("router-link");
  const _component_Card = __nuxt_component_2;
  _push(ssrRenderComponent(_component_router_link, mergeProps({
    class: "router-link",
    to: "/parties/" + $props.party.slug
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Card, {
          stripeColour: $props.party.colour
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<h5 data-v-b2e6135b${_scopeId2}><strong data-v-b2e6135b${_scopeId2}>${ssrInterpolate($props.party.display_name)}</strong></h5>`);
              if ($props.party.seats) {
                _push3(`<p data-v-b2e6135b${_scopeId2}>${ssrInterpolate($props.party.seats)} seat`);
                if ($props.party.seats != 1) {
                  _push3(`<span data-v-b2e6135b${_scopeId2}>s</span>`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</p>`);
              } else {
                _push3(`<!---->`);
              }
              ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
            } else {
              return [
                createVNode("h5", null, [
                  createVNode("strong", null, toDisplayString($props.party.display_name), 1)
                ]),
                $props.party.seats ? (openBlock(), createBlock("p", { key: 0 }, [
                  createTextVNode(toDisplayString($props.party.seats) + " seat", 1),
                  $props.party.seats != 1 ? (openBlock(), createBlock("span", { key: 0 }, "s")) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_Card, {
            stripeColour: $props.party.colour
          }, {
            default: withCtx(() => [
              createVNode("h5", null, [
                createVNode("strong", null, toDisplayString($props.party.display_name), 1)
              ]),
              $props.party.seats ? (openBlock(), createBlock("p", { key: 0 }, [
                createTextVNode(toDisplayString($props.party.seats) + " seat", 1),
                $props.party.seats != 1 ? (openBlock(), createBlock("span", { key: 0 }, "s")) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ]),
            _: 3
          }, 8, ["stripeColour"])
        ];
      }
    }),
    _: 3
  }, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PartyCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_8 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-b2e6135b"]]);

export { __nuxt_component_8 as _ };
//# sourceMappingURL=PartyCard-dc3cce9c.mjs.map
