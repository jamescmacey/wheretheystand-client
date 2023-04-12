import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from '../server.mjs';

const _sfc_main = {
  name: "Grid",
  props: {
    columns: {
      type: Array
    },
    rows: {
      type: Array
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<table${ssrRenderAttrs(mergeProps({ class: "table table-striped table-bordered table-responsive-sm" }, _attrs))}><thead><tr><!--[-->`);
  ssrRenderList($props.columns, (column, i) => {
    _push(`<th scope="col">${ssrInterpolate(column)}</th>`);
  });
  _push(`<!--]--></tr></thead><tbody><!--[-->`);
  ssrRenderList($props.rows, (row, i) => {
    _push(`<tr><!--[-->`);
    ssrRenderList(row, (data, j) => {
      _push(`<td>${ssrInterpolate(data)}</td>`);
    });
    _push(`<!--]--></tr>`);
  });
  _push(`<!--]--></tbody></table>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Grid.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { __nuxt_component_3 as _ };
//# sourceMappingURL=Grid-e4643e38.mjs.map
