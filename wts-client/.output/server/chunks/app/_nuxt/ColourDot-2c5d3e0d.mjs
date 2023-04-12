import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc } from '../server.mjs';

const _sfc_main = {
  name: "ColourDot",
  props: ["colour"],
  computed: {
    sanitisedColour() {
      if (this.colour.startsWith("#")) {
        return this.colour;
      } else {
        return "#" + this.colour;
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<span${ssrRenderAttrs(mergeProps({
    class: "party-dot me-2",
    style: { backgroundColor: $options.sanitisedColour }
  }, _attrs))} data-v-fa75eff8></span>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ColourDot.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-fa75eff8"]]);

export { __nuxt_component_4 as _ };
//# sourceMappingURL=ColourDot-2c5d3e0d.mjs.map
