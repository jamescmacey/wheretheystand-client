import { _ as _export_sfc, a as __nuxt_component_2 } from '../server.mjs';
import { _ as __nuxt_component_3 } from './Grid-e4643e38.mjs';
import { u as usePeopleStore } from './people-df592ada.mjs';
import { mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
import '@passageidentity/passage-elements/passage-user';
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
  name: "PersonExpenses",
  setup() {
    const peopleStore = usePeopleStore();
    return { peopleStore };
  },
  created() {
    this.peopleStore.fetchMpExpenses(this.$route.params.id);
    this.peopleStore.fetchExecExpenses(this.$route.params.id);
    this.peopleStore.fetchReturns(this.$route.params.id);
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
    person() {
      return this.peopleStore.byIdentifier(this.$route.params.id);
    },
    execExpenses() {
      return this.peopleStore.execExpensesByIdentifier(this.$route.params.id);
    },
    mpExpenses() {
      return this.peopleStore.mpExpensesByIdentifier(this.$route.params.id);
    },
    returns() {
      return this.peopleStore.returnsByIdentifier(this.$route.params.id);
    },
    returnsRows() {
      var rows = [];
      this.returns.forEach((thisReturn) => {
        rows.push([
          thisReturn.election.name,
          thisReturn.electorate.name,
          this.formatCurrency(thisReturn.donations_amount),
          this.formatCurrency(thisReturn.expenses_amount)
        ]);
      });
      return rows;
    },
    execExpensesRows() {
      var rows = [];
      this.execExpenses.forEach((thisReturn) => {
        rows.push([
          thisReturn.report_date,
          this.formatCurrency(thisReturn.wellington_accommodation),
          this.formatCurrency(thisReturn.rest_of_nz_accommodation),
          this.formatCurrency(thisReturn.nz_air_travel),
          this.formatCurrency(thisReturn.nz_surface_travel),
          this.formatCurrency(thisReturn.domestic_total),
          this.formatCurrency(thisReturn.international)
        ]);
      });
      return rows;
    },
    mpExpensesRows() {
      var rows = [];
      this.mpExpenses.forEach((thisReturn) => {
        if (thisReturn.subtotal || thisReturn.interparl) {
          rows.push([
            thisReturn.report_date,
            this.formatCurrency(thisReturn.wellington_accommodation),
            this.formatCurrency(thisReturn.rest_of_nz_accommodation),
            this.formatCurrency(thisReturn.air_travel),
            this.formatCurrency(thisReturn.surface_travel),
            this.formatCurrency(thisReturn.vip_transport),
            this.formatCurrency(thisReturn.subtotal),
            this.formatCurrency(thisReturn.interparl)
          ]);
        }
      });
      return rows;
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Card = __nuxt_component_2;
  const _component_Grid = __nuxt_component_3;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))}><div class="row mt-3"><div class="col-12"><h4>Expenses and donations</h4></div></div><div class="row"><div class="col-12">`);
  if ($options.mpExpenses && $options.mpExpenses != {}) {
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h5${_scopeId}>MP expenses</h5><p${_scopeId}>These expenses are those incurred by ${ssrInterpolate($options.person.display_name)} as a Member of Parliament, and are prepared by the Parliamentary Service. They do not include executive (Ministerial) expenses, since these are prepared by the Department of Internal Affairs and are categorised differently.</p>`);
          _push2(ssrRenderComponent(_component_Grid, {
            columns: ["Period", "Wellington accommodation", "Rest of New Zealand accommodation", "Air travel", "Surface travel", "VIP Transport", "Grand Total", "Overseas Inter-Parliamentary travel"],
            rows: $options.mpExpensesRows
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode("h5", null, "MP expenses"),
            createVNode("p", null, "These expenses are those incurred by " + toDisplayString($options.person.display_name) + " as a Member of Parliament, and are prepared by the Parliamentary Service. They do not include executive (Ministerial) expenses, since these are prepared by the Department of Internal Affairs and are categorised differently.", 1),
            createVNode(_component_Grid, {
              columns: ["Period", "Wellington accommodation", "Rest of New Zealand accommodation", "Air travel", "Surface travel", "VIP Transport", "Grand Total", "Overseas Inter-Parliamentary travel"],
              rows: $options.mpExpensesRows
            }, null, 8, ["rows"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(ssrRenderComponent(_component_Card, {
      missing: true,
      class: "text-center"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<p${_scopeId}><strong${_scopeId}>No MP expenses were found for ${ssrInterpolate($options.person.display_name)}</strong></p>`);
        } else {
          return [
            createVNode("p", null, [
              createVNode("strong", null, "No MP expenses were found for " + toDisplayString($options.person.display_name), 1)
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
  }
  _push(`</div></div><div class="row"><div class="col-12">`);
  if ($options.execExpenses && $options.execExpenses != {}) {
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h5${_scopeId}>Executive expenses</h5><p${_scopeId}>These expenses are those incurred by ${ssrInterpolate($options.person.display_name)} as a member of the executive, and are prepared by the Department of Internal Affairs. Expenses relating to when ${ssrInterpolate($options.person.display_name)} was a Member of Parliament are prepared by the Parliamentary Service and are categorised differently.</p>`);
          _push2(ssrRenderComponent(_component_Grid, {
            columns: ["Period", "Wellington accommodation", "Rest of New Zealand accommodation", "Domestic air travel", "Domestic surface travel", "Domestic total", "Cabinet-approved overseas travel"],
            rows: $options.execExpensesRows
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode("h5", null, "Executive expenses"),
            createVNode("p", null, "These expenses are those incurred by " + toDisplayString($options.person.display_name) + " as a member of the executive, and are prepared by the Department of Internal Affairs. Expenses relating to when " + toDisplayString($options.person.display_name) + " was a Member of Parliament are prepared by the Parliamentary Service and are categorised differently.", 1),
            createVNode(_component_Grid, {
              columns: ["Period", "Wellington accommodation", "Rest of New Zealand accommodation", "Domestic air travel", "Domestic surface travel", "Domestic total", "Cabinet-approved overseas travel"],
              rows: $options.execExpensesRows
            }, null, 8, ["rows"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(ssrRenderComponent(_component_Card, {
      missing: true,
      class: "text-center"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<p${_scopeId}><strong${_scopeId}>No executive expenses were found for ${ssrInterpolate($options.person.display_name)}</strong></p>`);
        } else {
          return [
            createVNode("p", null, [
              createVNode("strong", null, "No executive expenses were found for " + toDisplayString($options.person.display_name), 1)
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
  }
  _push(`</div></div><div class="row"><div class="col-12">`);
  if ($options.returns && $options.returns != {}) {
    _push(ssrRenderComponent(_component_Card, null, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h5${_scopeId}>Election returns for ${ssrInterpolate($options.person.display_name)}</h5>`);
          _push2(ssrRenderComponent(_component_Grid, {
            columns: ["Election", "Electorate", "Donations", "Expenses"],
            rows: $options.returnsRows
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode("h5", null, "Election returns for " + toDisplayString($options.person.display_name), 1),
            createVNode(_component_Grid, {
              columns: ["Election", "Electorate", "Donations", "Expenses"],
              rows: $options.returnsRows
            }, null, 8, ["rows"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(ssrRenderComponent(_component_Card, {
      missing: true,
      class: "text-center"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<p${_scopeId}><strong${_scopeId}>No election returns were found for ${ssrInterpolate($options.person.display_name)}</strong></p><p${_scopeId}>WhereTheyStand only has election returns for 2017 and onwards. Only candidates who stand for election in an electorate submit these returns; list only candidates do not.</p>`);
        } else {
          return [
            createVNode("p", null, [
              createVNode("strong", null, "No election returns were found for " + toDisplayString($options.person.display_name), 1)
            ]),
            createVNode("p", null, "WhereTheyStand only has election returns for 2017 and onwards. Only candidates who stand for election in an electorate submit these returns; list only candidates do not.")
          ];
        }
      }),
      _: 1
    }, _parent));
  }
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/people/[id]/expenses.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const expenses = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { expenses as default };
//# sourceMappingURL=expenses-d0c0c452.mjs.map
