import { _ as _export_sfc, d as __nuxt_component_0$1 } from '../server.mjs';
import { _ as __nuxt_component_4 } from './ColourDot-2c5d3e0d.mjs';
import { withCtx, openBlock, createBlock, createVNode, createCommentVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = {
  name: "PersonList",
  props: {
    people: {
      default: [],
      type: Array
    },
    positions: {
      default: [],
      type: Array
    }
  },
  computed: {
    displayPeople() {
      if (this.people.length > 0) {
        return this.people;
      } else if (this.positions.length > 0) {
        var people = [];
        this.positions.forEach((pos) => {
          people.push(pos.person);
        });
        return people;
      } else {
        return [];
      }
    },
    showVoting() {
      if (this.people.length == 0 && this.positions.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_ColourDot = __nuxt_component_4;
  _push(`<!--[-->`);
  ssrRenderList($options.displayPeople, (person, i) => {
    _push(`<div data-v-1cec79bd>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      class: "router-link",
      to: "/people/" + person.slug
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          if (person.image) {
            _push2(`<div class="d-flex align-items-center" data-v-1cec79bd${_scopeId}><div class="flex-shrink-0" data-v-1cec79bd${_scopeId}>`);
            if (person.image) {
              _push2(`<img${ssrRenderAttr("src", person.image)} class="me-3 person-image"${ssrRenderAttr("alt", person.display_name)} data-v-1cec79bd${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex-grow-1 ms-3" data-v-1cec79bd${_scopeId}><h6 data-v-1cec79bd${_scopeId}><strong data-v-1cec79bd${_scopeId}>${ssrInterpolate(person.display_name)}</strong></h6><p class="text-muted person-description" data-v-1cec79bd${_scopeId}>`);
            if (person.colour) {
              _push2(ssrRenderComponent(_component_ColourDot, {
                colour: person.colour
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`${ssrInterpolate(person.description)}</p></div></div>`);
          } else {
            _push2(`<div data-v-1cec79bd${_scopeId}><h6 data-v-1cec79bd${_scopeId}><strong data-v-1cec79bd${_scopeId}>${ssrInterpolate(person.display_name)}</strong></h6>`);
            if (person.description) {
              _push2(`<p class="text-muted person-description" data-v-1cec79bd${_scopeId}>`);
              if (person.colour) {
                _push2(ssrRenderComponent(_component_ColourDot, {
                  colour: person.colour
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`${ssrInterpolate(person.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          }
        } else {
          return [
            person.image ? (openBlock(), createBlock("div", {
              key: 0,
              class: "d-flex align-items-center"
            }, [
              createVNode("div", { class: "flex-shrink-0" }, [
                person.image ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: person.image,
                  class: "me-3 person-image",
                  alt: person.display_name
                }, null, 8, ["src", "alt"])) : createCommentVNode("", true)
              ]),
              createVNode("div", { class: "flex-grow-1 ms-3" }, [
                createVNode("h6", null, [
                  createVNode("strong", null, toDisplayString(person.display_name), 1)
                ]),
                createVNode("p", { class: "text-muted person-description" }, [
                  person.colour ? (openBlock(), createBlock(_component_ColourDot, {
                    key: 0,
                    colour: person.colour
                  }, null, 8, ["colour"])) : createCommentVNode("", true),
                  createTextVNode(toDisplayString(person.description), 1)
                ])
              ])
            ])) : (openBlock(), createBlock("div", { key: 1 }, [
              createVNode("h6", null, [
                createVNode("strong", null, toDisplayString(person.display_name), 1)
              ]),
              person.description ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-muted person-description"
              }, [
                person.colour ? (openBlock(), createBlock(_component_ColourDot, {
                  key: 0,
                  colour: person.colour
                }, null, 8, ["colour"])) : createCommentVNode("", true),
                createTextVNode(toDisplayString(person.description), 1)
              ])) : createCommentVNode("", true)
            ]))
          ];
        }
      }),
      _: 2
    }, _parent));
    if (i < $options.displayPeople.length - 1) {
      _push(`<hr data-v-1cec79bd>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  });
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PersonList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_10 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-1cec79bd"]]);

export { __nuxt_component_10 as _ };
//# sourceMappingURL=PersonList-acac1d7d.mjs.map
