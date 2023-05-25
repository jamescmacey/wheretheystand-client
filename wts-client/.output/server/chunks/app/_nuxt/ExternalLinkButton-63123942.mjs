import { _ as _export_sfc, e as __nuxt_component_1$1 } from '../server.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = {
  name: "ExternalLinkButton",
  props: {
    link: String,
    text: {
      type: String,
      default: ""
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_font_awesome_icon = __nuxt_component_1$1;
  _push(`<a${ssrRenderAttrs(mergeProps({
    href: $props.link,
    target: "_blank"
  }, _attrs))} data-v-9b52c1f3><h6 data-v-9b52c1f3>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`${ssrInterpolate($props.text)}`);
  _push(ssrRenderComponent(_component_font_awesome_icon, {
    class: "ms-2",
    icon: ["fas", "external-link-alt"]
  }, null, _parent));
  _push(`</h6></a>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExternalLinkButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-9b52c1f3"]]);

export { __nuxt_component_0 as _ };
//# sourceMappingURL=ExternalLinkButton-63123942.mjs.map
