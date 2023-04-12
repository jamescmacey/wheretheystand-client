import { u as usePartiesStore } from './parties-51e5848a.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc } from '../server.mjs';
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

const _sfc_main = {
  name: "PartyDocuments",
  setup() {
    const partiesStore = usePartiesStore();
    return { partiesStore };
  },
  created() {
  },
  methods: {
    formatCurrency(amount) {
      var formatter = new Intl.NumberFormat("en-NZ", {
        style: "currency",
        currency: "NZD"
      });
      if (amount != null) {
        return formatter.format(amount);
      } else {
        return "-";
      }
    }
  },
  computed: {
    party() {
      return this.partiesStore.byIdentifier(this.$route.params.id);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))}><div class="row mt-3"><div class="col-12"><h4>Documents</h4></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/parties/[id]/documents.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const documents = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { documents as default };
//# sourceMappingURL=documents-6ae66999.mjs.map
