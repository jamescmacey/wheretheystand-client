import { h, defineComponent, computed, watch, version, unref, reactive, useSSRContext, ref, createElementBlock, Suspense, nextTick, Transition, provide, getCurrentInstance, inject, watchEffect, toRef, onServerPrefetch, resolveComponent, mergeProps, createApp, shallowReactive, markRaw, effectScope, isRef, isReactive, toRaw, getCurrentScope, onScopeDispose, onErrorCaptured, createVNode, resolveDynamicComponent, toRefs, shallowRef, isReadonly, defineAsyncComponent, withCtx, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode } from 'vue';
import { $fetch as $fetch$1 } from 'ofetch';
import { createHooks } from 'hookable';
import { getContext, executeAsync } from 'unctx';
import { renderSSRHead } from '@unhead/ssr';
import { composableNames, getActiveHead, createServerHead as createServerHead$1 } from 'unhead';
import { defineHeadPlugin } from '@unhead/shared';
import { RouterView, createMemoryHistory, createRouter } from 'vue-router';
import { sendRedirect, createError as createError$1, setResponseStatus as setResponseStatus$1 } from 'h3';
import { hasProtocol, parseURL, joinURL, parseQuery, withTrailingSlash, withoutTrailingSlash, isEqual } from 'ufo';
import { parse, icon, library } from '@fortawesome/fontawesome-svg-core';
import { faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faInfoCircle, faArrowRight, faPeopleGroup, faPerson, faArrowLeft, faFileCsv, faFileCode, faFileExcel, faBook, faUserCircle, faFileLines, faForwardFast, faCalendar, faPenNib, faMicrophoneLines } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ssrRenderAttrs, ssrRenderSlot, ssrInterpolate, ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import humps from 'humps';
import { hash } from 'ohash';
import { defu } from 'defu';
import { Harmonizer } from 'color-harmony';
import { PassageUser } from '@passageidentity/passage-elements/passage-user';
import { a as useRuntimeConfig$1 } from '../nitro/node-server.mjs';
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

/**
 * Converts a CSS style into a plain Javascript object.
 * @param {String} style The style to converts into a plain Javascript object.
 * @returns {Object}
 */
function styleToObject (style) {
  return style.split(';')
    .map(s => s.trim())
    .filter(s => s)
    .reduce(
      (output, pair) => {
        const idx = pair.indexOf(':');
        const prop = humps.camelize(pair.slice(0, idx));
        const value = pair.slice(idx + 1).trim();

        output[prop] = value;
        return output
      },
      {}
    )
}

/**
 * Converts a CSS class list into a plain Javascript object.
 * @param {Array<String>} classes The class list to convert.
 * @returns {Object}
 */
function classToObject (classes) {
  return classes.split(/\s+/)
    .reduce(
      (output, className) => {
        output[className] = true;
        return output
      },
      {}
    )
}

/**
 * Converts a FontAwesome abstract element of an icon into a Vue VNode.
 * @param {AbstractElement | String} abstractElement The element to convert.
 * @param {Object} props The user-defined props.
 * @param {Object} attrs The user-defined native HTML attributes.
 * @returns {VNode}
 */
function convert (abstractElement, props = {}, attrs = {}) {
  // If the abstract element is a string, we'll just return a string render function
  if (typeof abstractElement === 'string') {
    return abstractElement
  }

  // Converting abstract element children into Vue VNodes
  const children = (abstractElement.children || [])
    .map(child => convert(child));

  // Converting abstract element attributes into valid Vue format
  const mixins = Object.keys(abstractElement.attributes || {})
    .reduce(
      (mixins, key) => {
        const value = abstractElement.attributes[key];

        switch (key) {
          case 'class':
            mixins.class = classToObject(value);
            break
          case 'style':
            mixins.style = styleToObject(value);
            break
          default:
            mixins.attrs[key] = value;
        }

        return mixins
      },
      {
        attrs: {},
        class: {},
        style: {}
      }
    );

  // Now, we'll return the VNode
  const { class: _aClass = {}, style: aStyle = {}, ...otherAttrs } = attrs;

  return h(
    abstractElement.tag,
    {
      ...props,
      class: mixins.class,
      style: { ...mixins.style, ...aStyle },
      ...mixins.attrs,
      ...otherAttrs
    },
    children
  )
}

let PRODUCTION = false;

try {
  PRODUCTION = "production" === 'production';
} catch (e) { }

function log (...args) {
  if (!PRODUCTION && console && typeof console.error === 'function') {
    console.error(...args);
  }
}

function objectWithKey (key, value) {
  return ((Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value)) ? {[key]: value} : {}
}

function classList (props) {
  let classes = {
    'fa-spin': props.spin,
    'fa-pulse': props.pulse,
    'fa-fw': props.fixedWidth,
    'fa-border': props.border,
    'fa-li': props.listItem,
    'fa-inverse': props.inverse,
    'fa-flip': props.flip === true,
    'fa-flip-horizontal': props.flip === 'horizontal' || props.flip === 'both',
    'fa-flip-vertical': props.flip === 'vertical' || props.flip === 'both',
    [`fa-${props.size}`]: props.size !== null,
    [`fa-rotate-${props.rotation}`]: props.rotation !== null,
    [`fa-pull-${props.pull}`]: props.pull !== null,
    'fa-swap-opacity': props.swapOpacity,
    'fa-bounce': props.bounce,
    'fa-shake': props.shake,
    'fa-beat': props.beat,
    'fa-fade': props.fade,
    'fa-beat-fade': props.beatFade,
    'fa-flash': props.flash,
    'fa-spin-pulse': props.spinPulse,
    'fa-spin-reverse': props.spinReverse
  };

  return Object.keys(classes)
    .map(key => classes[key] ? key : null)
    .filter(key => key)
}

function normalizeIconArgs (icon) {
  if (icon && typeof icon === 'object' && icon.prefix && icon.iconName && icon.icon) {
    return icon
  }

  if (parse.icon) {
    return parse.icon(icon)
  }

  if (icon === null) {
    return null
  }

  if (typeof icon === 'object' && icon.prefix && icon.iconName) {
    return icon
  }

  if (Array.isArray(icon) && icon.length === 2) {
    return { prefix: icon[0], iconName: icon[1] }
  }

  if (typeof icon === 'string') {
    return { prefix: 'fas', iconName: icon }
  }
}

const FontAwesomeIcon$1 = defineComponent({
  name: 'FontAwesomeIcon',

  props: {
    border: {
      type: Boolean,
      default: false
    },
    fixedWidth: {
      type: Boolean,
      default: false
    },
    flip: {
      type: [Boolean, String],
      default: false,
      validator: (value) => [true, false, 'horizontal', 'vertical', 'both'].indexOf(value) > -1
    },
    icon: {
      type: [Object, Array, String],
      required: true
    },
    mask: {
      type: [Object, Array, String],
      default: null
    },
    listItem: {
      type: Boolean,
      default: false
    },
    pull: {
      type: String,
      default: null,
      validator: (value) => ['right', 'left'].indexOf(value) > -1
    },
    pulse: {
      type: Boolean,
      default: false
    },
    rotation: {
      type: [String, Number],
      default: null,
      validator: (value) => [90, 180, 270].indexOf(Number.parseInt(value, 10)) > -1
    },
    swapOpacity: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: null,
      validator: (value) => ['2xs', 'xs', 'sm', 'lg', 'xl', '2xl', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].indexOf(value) > -1
    },
    spin: {
      type: Boolean,
      default: false
    },
    transform: {
      type: [String, Object],
      default: null
    },
    symbol: {
      type: [Boolean, String],
      default: false
    },
    title: {
      type: String,
      default: null
    },
    inverse: {
      type: Boolean,
      default: false
    },
    bounce: {
      type: Boolean,
      default: false
    },
    shake: {
      type: Boolean,
      default: false
    },
    beat: {
      type: Boolean,
      default: false
    },
    fade: {
      type: Boolean,
      default: false
    },
    beatFade: {
      type: Boolean,
      default: false
    },
    flash: {
      type: Boolean,
      default: false
    },
    spinPulse: {
      type: Boolean,
      default: false
    },
    spinReverse: {
      type: Boolean,
      default: false
    },
  },

  setup (props, { attrs }) {
    const icon$1 = computed(() => normalizeIconArgs(props.icon));
    const classes = computed(() => objectWithKey('classes', classList(props)));
    const transform = computed(() => objectWithKey(
      'transform',
      (typeof props.transform === 'string')
        ? parse.transform(props.transform)
        : props.transform
    ));
    const mask = computed(() => objectWithKey('mask', normalizeIconArgs(props.mask)));

    const renderedIcon = computed(() => icon(icon$1.value, {
      ...classes.value,
      ...transform.value,
      ...mask.value,
      symbol: props.symbol,
      title: props.title
    }));

    watch(renderedIcon, (value) => {
      if (!value) {
        return log('Could not find one or more icon(s)', icon$1.value, mask.value)
      }
    }, { immediate: true });

    const vnode = computed(() => renderedIcon.value ? convert(renderedIcon.value.abstract[0], {}, attrs) : null);
    return () => vnode.value
  }
});

const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const nuxtAppCtx = /* @__PURE__ */ getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.4.0";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      data: shallowReactive({}),
      state: shallowReactive({}),
      _errors: shallowReactive({}),
      ...{ serverRendered: true }
    }),
    static: {
      data: {}
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: {},
    _payloadRevivers: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    async function contextCaller(hooks, args) {
      for (const hook of hooks) {
        await nuxtAppCtx.call(nuxtApp, () => hook(...args));
      }
    }
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
    }
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext._payloadReducers = {};
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  const compatibilityConfig = new Proxy(runtimeConfig, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return target.public[prop];
    },
    set(target, prop, value) {
      {
        return false;
      }
    }
  });
  nuxtApp.provide("config", compatibilityConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin !== "function") {
    return;
  }
  const { provide: provide2 } = await callWithNuxt(nuxtApp, plugin, [nuxtApp]) || {};
  if (provide2 && typeof provide2 === "object") {
    for (const key in provide2) {
      nuxtApp.provide(key, provide2[key]);
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  for (const plugin of plugins2) {
    await applyPlugin(nuxtApp, plugin);
  }
}
function normalizePlugins(_plugins2) {
  const plugins2 = [];
  for (const plugin of _plugins2) {
    if (typeof plugin !== "function") {
      continue;
    }
    let _plugin = plugin;
    if (plugin.length > 1) {
      _plugin = (nuxtApp) => plugin(nuxtApp, nuxtApp.provide);
    }
    plugins2.push(_plugin);
  }
  plugins2.sort((a, b) => {
    var _a, _b;
    return (((_a = a.meta) == null ? void 0 : _a.order) || orderMap.default) - (((_b = b.meta) == null ? void 0 : _b.order) || orderMap.default);
  });
  return plugins2;
}
const orderMap = {
  pre: -20,
  default: 0,
  post: 20
};
function defineNuxtPlugin(plugin, meta) {
  var _a;
  if (typeof plugin === "function") {
    return /* @__PURE__ */ defineNuxtPlugin({ setup: plugin }, meta);
  }
  const wrapper = (nuxtApp) => {
    if (plugin.hooks) {
      nuxtApp.hooks.addHooks(plugin.hooks);
    }
    if (plugin.setup) {
      return plugin.setup(nuxtApp);
    }
  };
  wrapper.meta = {
    name: (meta == null ? void 0 : meta.name) || plugin.name || ((_a = plugin.setup) == null ? void 0 : _a.name),
    order: (meta == null ? void 0 : meta.order) || plugin.order || orderMap[plugin.enforce || "default"] || orderMap.default
  };
  wrapper[NuxtPluginIndicator] = true;
  return wrapper;
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxtAppCtx.callAsync(nuxt, fn);
  }
}
function useNuxtApp() {
  const nuxtAppInstance = nuxtAppCtx.tryUse();
  if (!nuxtAppInstance) {
    const vm = getCurrentInstance();
    if (!vm) {
      throw new Error("nuxt instance unavailable");
    }
    return vm.appContext.app.$nuxt;
  }
  return nuxtAppInstance;
}
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const isVue2 = false;
/*!
  * pinia v2.0.34
  * (c) 2023 Eduardo San Martin Morote
  * @license MIT
  */
let activePinia;
const setActivePinia = (pinia) => activePinia = pinia;
const piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(o) {
  return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia);
      {
        pinia._a = app;
        app.provide(piniaSymbol, pinia);
        app.config.globalProperties.$pinia = pinia;
        toBeInstalled.forEach((plugin) => _p.push(plugin));
        toBeInstalled = [];
      }
    },
    use(plugin) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin);
      } else {
        _p.push(plugin);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia;
}
const noop = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign } = Object;
function isComputed(o) {
  return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia.state.value[id];
  let store;
  function setup() {
    if (!initialState && (!("production" !== "production") )) {
      {
        pinia.state.value[id] = state ? state() : {};
      }
    }
    const localState = toRefs(pinia.state.value[id]);
    return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia);
        const store2 = pinia._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign({ actions: {} }, options);
  const $subscribeOptions = {
    deep: true
    // flush: 'post',
  };
  let isListening;
  let isSyncListening;
  let subscriptions = markRaw([]);
  let actionSubscriptions = markRaw([]);
  let debuggerEvents;
  const initialState = pinia.state.value[$id];
  if (!isOptionsStore && !initialState && (!("production" !== "production") )) {
    {
      pinia.state.value[$id] = {};
    }
  }
  ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign($state, newState);
    });
  } : (
    /* istanbul ignore next */
    noop
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }
  function wrapAction(name, action) {
    return function() {
      setActivePinia(pinia);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }
  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(partialStore);
  pinia._s.set($id, store);
  const setupStore = pinia._e.run(() => {
    scope = effectScope();
    return scope.run(() => setup());
  });
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia.state.value[$id][key] = prop;
        }
      }
    } else if (typeof prop === "function") {
      const actionValue = wrapAction(key, prop);
      {
        setupStore[key] = actionValue;
      }
      optionsForPlugin.actions[key] = prop;
    } else ;
  }
  {
    assign(store, setupStore);
    assign(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => pinia.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        assign($state, state);
      });
    }
  });
  pinia._p.forEach((extender) => {
    {
      assign(store, scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })));
    }
  });
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }
  function useStore(pinia, hot) {
    const currentInstance = getCurrentInstance();
    pinia = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    (pinia) || currentInstance && inject(piniaSymbol, null);
    if (pinia)
      setActivePinia(pinia);
    pinia = activePinia;
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }
    const store = pinia._s.get(id);
    return store;
  }
  useStore.$id = id;
  return useStore;
}
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref2, lastKey = "") {
  if (ref2 instanceof Promise)
    return ref2;
  const root = resolveUnref(ref2);
  if (!ref2 || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r, lastKey));
  if (typeof root === "object") {
    return Object.fromEntries(
      Object.entries(root).map(([k, v]) => {
        if (k === "titleTemplate" || k.startsWith("on"))
          return [k, unref(v)];
        return [k, resolveUnrefHeadInput(v, k)];
      })
    );
  }
  return root;
}
const Vue3 = version.startsWith("3");
const headSymbol = "usehead";
function injectHead() {
  return getCurrentInstance() && inject(headSymbol) || getActiveHead();
}
function vueInstall(head) {
  const plugin = {
    install(app) {
      if (Vue3) {
        app.config.globalProperties.$unhead = head;
        app.config.globalProperties.$head = head;
        app.provide(headSymbol, head);
      }
    }
  };
  return plugin.install;
}
function createServerHead(options = {}) {
  const head = createServerHead$1({
    ...options,
    plugins: [
      VueReactiveUseHeadPlugin(),
      ...(options == null ? void 0 : options.plugins) || []
    ]
  });
  head.install = vueInstall(head);
  return head;
}
const VueReactiveUseHeadPlugin = () => {
  return defineHeadPlugin({
    hooks: {
      "entries:resolve": function(ctx) {
        for (const entry2 of ctx.entries)
          entry2.resolvedInput = resolveUnrefHeadInput(entry2.input);
      }
    }
  });
};
function clientUseHead(input, options = {}) {
  const head = injectHead();
  const deactivated = ref(false);
  const resolvedInput = ref({});
  watchEffect(() => {
    resolvedInput.value = deactivated.value ? {} : resolveUnrefHeadInput(input);
  });
  const entry2 = head.push(resolvedInput.value, options);
  watch(resolvedInput, (e) => {
    entry2.patch(e);
  });
  getCurrentInstance();
  return entry2;
}
function serverUseHead(input, options = {}) {
  const head = injectHead();
  return head.push(input, options);
}
function useHead(input, options = {}) {
  var _a;
  const head = injectHead();
  if (head) {
    const isBrowser = !!((_a = head.resolvedOptions) == null ? void 0 : _a.document);
    if (options.mode === "server" && isBrowser || options.mode === "client" && !isBrowser)
      return;
    return isBrowser ? clientUseHead(input, options) : serverUseHead(input, options);
  }
}
const coreComposableNames = [
  "injectHead"
];
({
  "@unhead/vue": [...coreComposableNames, ...composableNames]
});
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = "$s" + _key;
  const nuxt = useNuxtApp();
  const state = toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestFetch() {
  var _a;
  const event = (_a = useNuxtApp().ssrContext) == null ? void 0 : _a.event;
  return (event == null ? void 0 : event.$fetch) || globalThis.$fetch;
}
function setResponseStatus(arg1, arg2, arg3) {
  if (arg1 && typeof arg1 !== "number") {
    return setResponseStatus$1(arg1, arg2, arg3);
  }
  return setResponseStatus$1(useRequestEvent(), arg1, arg2);
}
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (getCurrentInstance()) {
    return inject("_route", useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
const defineNuxtRouteMiddleware = (middleware) => middleware;
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : to.path || "/";
  const isExternal = (options == null ? void 0 : options.external) || hasProtocol(toPath, { acceptRelative: true });
  if (isExternal && !(options == null ? void 0 : options.external)) {
    throw new Error("Navigating to external URL is not allowed by default. Use `navigateTo (url, { external: true })`.");
  }
  if (isExternal && parseURL(toPath).protocol === "script:") {
    throw new Error("Cannot navigate to an URL with script protocol.");
  }
  const router = useRouter();
  {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      if (isProcessingMiddleware() && !isExternal) {
        setResponseStatus(nuxtApp.ssrContext.event, (options == null ? void 0 : options.redirectCode) || 302);
        return to;
      }
      const redirectLocation = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || "/");
      return nuxtApp.callHook("app:redirected").then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, (options == null ? void 0 : options.redirectCode) || 302));
    }
  }
  if (isExternal) {
    if (options == null ? void 0 : options.replace) {
      location.replace(toPath);
    } else {
      location.href = toPath;
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (_err) => {
  const err = createError(_err);
  try {
    const nuxtApp = useNuxtApp();
    nuxtApp.callHook("app:error", err);
    const error = useError();
    error.value = error.value || err;
  } catch {
    throw err;
  }
  return err;
};
const createError = (err) => {
  const _err = createError$1(err);
  _err.__nuxt_error = true;
  return _err;
};
const getDefault = () => null;
function useAsyncData(...args) {
  var _a;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, handler, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof handler !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  options.server = options.server ?? true;
  options.default = options.default ?? getDefault;
  options.lazy = options.lazy ?? false;
  options.immediate = options.immediate ?? true;
  const nuxt = useNuxtApp();
  const getCachedData = () => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key];
  const hasCachedData = () => getCachedData() !== void 0;
  if (!nuxt._asyncData[key]) {
    nuxt._asyncData[key] = {
      data: ref(getCachedData() ?? ((_a = options.default) == null ? void 0 : _a.call(options)) ?? null),
      pending: ref(!hasCachedData()),
      error: toRef(nuxt.payload._errors, key)
    };
  }
  const asyncData = { ...nuxt._asyncData[key] };
  asyncData.refresh = asyncData.execute = (opts = {}) => {
    if (nuxt._asyncDataPromises[key]) {
      if (opts.dedupe === false) {
        return nuxt._asyncDataPromises[key];
      }
      nuxt._asyncDataPromises[key].cancelled = true;
    }
    if (opts._initial && hasCachedData()) {
      return getCachedData();
    }
    asyncData.pending.value = true;
    const promise = new Promise(
      (resolve, reject) => {
        try {
          resolve(handler(nuxt));
        } catch (err) {
          reject(err);
        }
      }
    ).then((_result) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      let result = _result;
      if (options.transform) {
        result = options.transform(_result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      asyncData.data.value = result;
      asyncData.error.value = null;
    }).catch((error) => {
      var _a2;
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      asyncData.error.value = error;
      asyncData.data.value = unref(((_a2 = options.default) == null ? void 0 : _a2.call(options)) ?? null);
    }).finally(() => {
      if (promise.cancelled) {
        return;
      }
      asyncData.pending.value = false;
      nuxt.payload.data[key] = asyncData.data.value;
      if (asyncData.error.value) {
        nuxt.payload._errors[key] = createError(asyncData.error.value);
      }
      delete nuxt._asyncDataPromises[key];
    });
    nuxt._asyncDataPromises[key] = promise;
    return nuxt._asyncDataPromises[key];
  };
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxt.hook("app:created", () => promise);
    }
  }
  const asyncDataPromise = Promise.resolve(nuxt._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _key = opts.key || hash([autoKey, unref(opts.baseURL), typeof request === "string" ? request : "", unref(opts.params || opts.query)]);
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = _key === autoKey ? "$f" + _key : _key;
  const _request = computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return unref(r);
  });
  if (!opts.baseURL && typeof _request.value === "string" && _request.value.startsWith("//")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch: watch2,
    immediate,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    immediate,
    watch: watch2 === false ? [] : [_fetchOptions, _request, ...watch2 || []]
  };
  let controller;
  const asyncData = useAsyncData(key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller);
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const isLocalFetch = typeof _request.value === "string" && _request.value.startsWith("/");
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch && isLocalFetch) {
      _$fetch = useRequestFetch();
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions });
  }, _asyncDataOptions);
  return asyncData;
}
const appHead = { "meta": [{ "name": "viewport", "content": "width=device-width, initial-scale=1" }, { "charset": "utf-8" }], "link": [], "style": [], "script": [], "noscript": [] };
const appPageTransition = false;
const appKeepalive = false;
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  const resolveTrailingSlashBehavior = (to, resolve) => {
    if (!to || options.trailingSlash !== "append" && options.trailingSlash !== "remove") {
      return to;
    }
    const normalizeTrailingSlash = options.trailingSlash === "append" ? withTrailingSlash : withoutTrailingSlash;
    if (typeof to === "string") {
      return normalizeTrailingSlash(to, true);
    }
    const path = "path" in to ? to.path : resolve(to).path;
    return {
      ...to,
      name: void 0,
      // named routes would otherwise always override trailing slash behavior
      path: normalizeTrailingSlash(path, true)
    };
  };
  return /* @__PURE__ */ defineComponent({
    name: componentName,
    props: {
      // Routing
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      // Attributes
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Prefetching
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Styling
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      // Vue Router's `<RouterLink>` additional props
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      // Edge cases handling
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Slot API
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = computed(() => {
        const path = props.to || props.href || "";
        return resolveTrailingSlashBehavior(path, router.resolve);
      });
      const isExternal = computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, { acceptRelative: true });
      });
      const prefetched = ref(false);
      const el = void 0;
      const elRef = void 0;
      return () => {
        var _a, _b;
        if (!isExternal.value) {
          const routerLinkProps = {
            ref: elRef,
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue,
            custom: props.custom
          };
          if (!props.custom) {
            if (prefetched.value) {
              routerLinkProps.class = props.prefetchedClass || options.prefetchedClass;
            }
            routerLinkProps.rel = props.rel;
          }
          return h(
            resolveComponent("RouterLink"),
            routerLinkProps,
            slots.default
          );
        }
        const href = typeof to.value === "object" ? ((_a = router.resolve(to.value)) == null ? void 0 : _a.href) ?? null : to.value || null;
        const target = props.target || null;
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        const navigate = () => navigateTo(href, { replace: props.replace });
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href,
            navigate,
            get route() {
              if (!href) {
                return void 0;
              }
              const url = parseURL(href);
              return {
                path: url.pathname,
                fullPath: url.pathname,
                get query() {
                  return parseQuery(url.search);
                },
                hash: url.hash,
                // stub properties for compat with vue-router
                params: {},
                name: void 0,
                matched: [],
                redirectedFrom: void 0,
                meta: {},
                href
              };
            },
            rel,
            target,
            isExternal: isExternal.value,
            isActive: false,
            isExactActive: false
          });
        }
        return h("a", { ref: el, href, rel, target }, (_b = slots.default) == null ? void 0 : _b.call(slots));
      };
    }
  });
}
const __nuxt_component_0$1 = /* @__PURE__ */ defineNuxtLink({ componentName: "NuxtLink" });
const plugin_vue3_A0OWXRrUgq = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);
  setActivePinia(pinia);
  {
    nuxtApp.payload.pinia = pinia.state.value;
  }
  return {
    provide: {
      pinia
    }
  };
});
const components = {};
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components",
  setup(nuxtApp) {
    for (const name in components) {
      nuxtApp.vueApp.component(name, components[name]);
      nuxtApp.vueApp.component("Lazy" + name, components[name]);
    }
  }
});
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  setup(nuxtApp) {
    const createHead = createServerHead;
    const head = createHead();
    head.push(appHead);
    nuxtApp.vueApp.use(head);
    {
      nuxtApp.ssrContext.renderMeta = async () => {
        const meta = await renderSSRHead(head);
        return {
          ...meta,
          bodyScriptsPrepend: meta.bodyTagsOpen,
          // resolves naming difference with NuxtMeta and Unhead
          bodyScripts: meta.bodyTags
        };
      };
    }
  }
});
const _routes = [
  {
    name: "about",
    path: "/about",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/about-bddef441.mjs').then((m) => m.default || m)
  },
  {
    name: "auth",
    path: "/auth",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/auth-0ccddcf9.mjs').then((m) => m.default || m)
  },
  {
    name: "bills-id",
    path: "/bills/:id()",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-82423990.mjs').then((m) => m.default || m)
  },
  {
    name: "bills",
    path: "/bills",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-6adeaf30.mjs').then((m) => m.default || m)
  },
  {
    name: "electorates-id",
    path: "/electorates/:id()",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-a22e811e.mjs').then((m) => m.default || m)
  },
  {
    name: "electorates",
    path: "/electorates",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-0cfc4442.mjs').then((m) => m.default || m)
  },
  {
    name: "index",
    path: "/",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-474113fb.mjs').then((m) => m.default || m)
  },
  {
    name: "me",
    path: "/me",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/me-7ba0309c.mjs').then((m) => m.default || m)
  },
  {
    name: "ministerial-lists-id",
    path: "/ministerial-lists/:id()",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-b8869e8d.mjs').then((m) => m.default || m)
  },
  {
    name: "ministerial-lists",
    path: "/ministerial-lists",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-97110595.mjs').then((m) => m.default || m)
  },
  {
    path: "/parties/:id()",
    children: [
      {
        name: "parties-id-documents",
        path: "documents",
        meta: {},
        alias: [],
        redirect: void 0,
        component: () => import('./_nuxt/documents-d9ba35bc.mjs').then((m) => m.default || m)
      },
      {
        name: "parties-id",
        path: "",
        meta: {},
        alias: [],
        redirect: void 0,
        component: () => import('./_nuxt/index-532d521a.mjs').then((m) => m.default || m)
      }
    ],
    name: void 0,
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/_id_-eaf179e2.mjs').then((m) => m.default || m)
  },
  {
    name: "parties",
    path: "/parties",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-5519427d.mjs').then((m) => m.default || m)
  },
  {
    path: "/people/:id()",
    children: [
      {
        name: "people-id-details",
        path: "details",
        meta: {},
        alias: [],
        redirect: void 0,
        component: () => import('./_nuxt/details-df180ab6.mjs').then((m) => m.default || m)
      },
      {
        name: "people-id-expenses",
        path: "expenses",
        meta: {},
        alias: [],
        redirect: void 0,
        component: () => import('./_nuxt/expenses-a1968bf4.mjs').then((m) => m.default || m)
      },
      {
        name: "people-id",
        path: "",
        meta: {},
        alias: [],
        redirect: void 0,
        component: () => import('./_nuxt/index-4f49ae48.mjs').then((m) => m.default || m)
      },
      {
        name: "people-id-interests",
        path: "interests",
        meta: {},
        alias: [],
        redirect: void 0,
        component: () => import('./_nuxt/interests-9dda6f00.mjs').then((m) => m.default || m)
      }
    ],
    name: void 0,
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/_id_-fab0f123.mjs').then((m) => m.default || m)
  },
  {
    name: "people",
    path: "/people",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-99e2dd1c.mjs').then((m) => m.default || m)
  },
  {
    name: "terms",
    path: "/terms",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/terms-c41fa0d7.mjs').then((m) => m.default || m)
  },
  {
    name: "votes-id",
    path: "/votes/:id()",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-deae98a9.mjs').then((m) => m.default || m)
  },
  {
    name: "votes",
    path: "/votes",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => import('./_nuxt/index-80e0d7ce.mjs').then((m) => m.default || m)
  }
];
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    let position = savedPosition || void 0;
    if (!position && from && to && to.meta.scrollToTop !== false && _isDifferentRoute(from, to)) {
      position = { left: 0, top: 0 };
    }
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) };
      }
    }
    const hasTransition = (route) => !!(route.meta.pageTransition ?? appPageTransition);
    const hookToWait = hasTransition(from) && hasTransition(to) ? "page:transition:finish" : "page:finish";
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await nextTick();
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) };
        }
        resolve(position);
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = document.querySelector(selector);
    if (elem) {
      return parseFloat(getComputedStyle(elem).scrollMarginTop);
    }
  } catch {
  }
  return 0;
}
function _isDifferentRoute(a, b) {
  const samePageComponent = a.matched[0] === b.matched[0];
  if (!samePageComponent) {
    return true;
  }
  if (samePageComponent && JSON.stringify(a.params) !== JSON.stringify(b.params)) {
    return true;
  }
  return false;
}
const configRouterOptions = {};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  var _a;
  let __temp, __restore;
  if (!((_a = to.meta) == null ? void 0 : _a.validate)) {
    return;
  }
  useNuxtApp();
  useRouter();
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  {
    return result;
  }
});
const globalMiddleware = [
  validate
];
const namedMiddleware = {};
const router_jmwsqit4Rs = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a, _b;
    let __temp, __restore;
    let routerBase = useRuntimeConfig().app.baseURL;
    if (routerOptions.hashMode && !routerBase.includes("#")) {
      routerBase += "#";
    }
    const history = ((_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes = ((_b = routerOptions.routes) == null ? void 0 : _b.call(routerOptions, _routes)) ?? _routes;
    const initialURL = nuxtApp.ssrContext.url;
    const router = createRouter({
      ...routerOptions,
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const _route = shallowRef(router.resolve(initialURL));
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      var _a2, _b2, _c, _d;
      if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d = (_c = from.matched[0]) == null ? void 0 : _c.components) == null ? void 0 : _d.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      route[key] = computed(() => _route.value[key]);
    }
    nuxtApp._route = reactive(route);
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    useError();
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => callWithNuxt(nuxtApp, showError, [error2])), await __temp, __restore();
    }
    const initialLayout = useState("_layout");
    router.beforeEach(async (to, from) => {
      var _a2;
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout.value && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout.value;
      }
      nuxtApp._processingMiddleware = true;
      const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
      for (const component of to.matched) {
        const componentMiddleware = component.meta.middleware;
        if (!componentMiddleware) {
          continue;
        }
        if (Array.isArray(componentMiddleware)) {
          for (const entry2 of componentMiddleware) {
            middlewareEntries.add(entry2);
          }
        } else {
          middlewareEntries.add(componentMiddleware);
        }
      }
      for (const entry2 of middlewareEntries) {
        const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_a2 = namedMiddleware[entry2]) == null ? void 0 : _a2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
        if (!middleware) {
          throw new Error(`Unknown route middleware: '${entry2}'.`);
        }
        const result = await callWithNuxt(nuxtApp, middleware, [to, from]);
        {
          if (result === false || result instanceof Error) {
            const error2 = result || createError$1({
              statusCode: 404,
              statusMessage: `Page Not Found: ${initialURL}`
            });
            await callWithNuxt(nuxtApp, showError, [error2]);
            return false;
          }
        }
        if (result || result === false) {
          return result;
        }
      }
    });
    router.afterEach(async (to) => {
      delete nuxtApp._processingMiddleware;
      if (to.matched.length === 0) {
        await callWithNuxt(nuxtApp, showError, [createError$1({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to.fullPath}`
        })]);
      } else {
        const currentURL = to.fullPath || "/";
        if (!isEqual(currentURL, initialURL, { trailingSlash: true })) {
          const event = await callWithNuxt(nuxtApp, useRequestEvent);
          const options = { redirectCode: event.node.res.statusCode !== 200 ? event.node.res.statusCode || 302 : 302 };
          await callWithNuxt(nuxtApp, navigateTo, [currentURL, options]);
        }
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        await router.replace({
          ...router.resolve(initialURL),
          name: void 0,
          // #4920, #$4982
          force: true
        });
      } catch (error2) {
        await callWithNuxt(nuxtApp, showError, [error2]);
      }
    });
    return { provide: { router } };
  }
}, 1);
library.add(faHistory, faTimes, faCheck, faMapSigns, faQuestion, faChevronUp, faChevronDown, faExternalLinkAlt, faTwitter, faFacebook, faInstagram, faSnapchat, faWikipediaW, faInfoCircle, faArrowRight, faPeopleGroup, faPerson, faArrowLeft, faFileCsv, faFileCode, faFileExcel, faBook, faUserCircle, faFileLines, faForwardFast, faCalendar, faPenNib, faMicrophoneLines);
const fontawesome_klhsrycjcK = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});
const _plugins = [
  plugin_vue3_A0OWXRrUgq,
  components_plugin_KR1HBZs4kY,
  unhead_KgADcZ0jPj,
  router_jmwsqit4Rs,
  fontawesome_klhsrycjcK
];
const removeUndefinedProps = (props) => Object.fromEntries(Object.entries(props).filter(([, value]) => value !== void 0));
const setupForUseMeta = (metaFactory, renderChild) => (props, ctx) => {
  useHead(() => metaFactory({ ...removeUndefinedProps(props), ...ctx.attrs }, ctx));
  return () => {
    var _a, _b;
    return renderChild ? (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a) : null;
  };
};
const globalProps = {
  accesskey: String,
  autocapitalize: String,
  autofocus: {
    type: Boolean,
    default: void 0
  },
  class: [String, Object, Array],
  contenteditable: {
    type: Boolean,
    default: void 0
  },
  contextmenu: String,
  dir: String,
  draggable: {
    type: Boolean,
    default: void 0
  },
  enterkeyhint: String,
  exportparts: String,
  hidden: {
    type: Boolean,
    default: void 0
  },
  id: String,
  inputmode: String,
  is: String,
  itemid: String,
  itemprop: String,
  itemref: String,
  itemscope: String,
  itemtype: String,
  lang: String,
  nonce: String,
  part: String,
  slot: String,
  spellcheck: {
    type: Boolean,
    default: void 0
  },
  style: String,
  tabindex: String,
  title: String,
  translate: String
};
const Link = /* @__PURE__ */ defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Link",
  inheritAttrs: false,
  props: {
    ...globalProps,
    as: String,
    crossorigin: String,
    disabled: Boolean,
    fetchpriority: String,
    href: String,
    hreflang: String,
    imagesizes: String,
    imagesrcset: String,
    integrity: String,
    media: String,
    prefetch: {
      type: Boolean,
      default: void 0
    },
    referrerpolicy: String,
    rel: String,
    sizes: String,
    title: String,
    type: String,
    /** @deprecated **/
    methods: String,
    /** @deprecated **/
    target: String,
    body: Boolean,
    renderPriority: [String, Number]
  },
  setup: setupForUseMeta((link) => ({
    link: [link]
  }))
});
const Title = /* @__PURE__ */ defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Title",
  inheritAttrs: false,
  setup: setupForUseMeta((_, { slots }) => {
    var _a, _b, _c;
    const title = ((_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children) || null;
    return {
      title
    };
  })
});
const Meta = /* @__PURE__ */ defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Meta",
  inheritAttrs: false,
  props: {
    ...globalProps,
    charset: String,
    content: String,
    httpEquiv: String,
    name: String,
    body: Boolean,
    renderPriority: [String, Number]
  },
  setup: setupForUseMeta((props) => {
    const meta = { ...props };
    if (meta.httpEquiv) {
      meta["http-equiv"] = meta.httpEquiv;
      delete meta.httpEquiv;
    }
    return {
      meta: [meta]
    };
  })
});
const Head = /* @__PURE__ */ defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Head",
  inheritAttrs: false,
  setup: (_props, ctx) => () => {
    var _a, _b;
    return (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a);
  }
});
const _sfc_main$9 = FontAwesomeIcon$1;
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FontAwesomeIcon.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_1$1 = _sfc_main$9;
const API_BASE = "https://wheretheystand.nz/api/";
const useNotificationsStore$1 = defineStore("notifications", {
  state() {
    return {
      banners: [],
      toasts: [],
      loaded: false,
      toastId: 0
    };
  },
  actions: {
    async fetchNotifications() {
      var state = this;
      if (!this.loaded) {
        await useFetch(API_BASE + "banners/", {
          onResponse({ request, response, options }) {
            state.banners = response._data;
            state.loaded = true;
          },
          onResponseError({ request, response, options }) {
            state.postResponseError(response);
          },
          onRequestError({ request, options, error }) {
            state.addToast("Error fetching resource (request)", error);
          }
        }, "$1J08Qe3nXo");
      }
    },
    addToast(title, message, error = null) {
      this.toasts.push({
        id: this.toastId,
        title,
        message,
        error
      });
      this.toastId = this.toastId + 1;
    },
    closeToast(id) {
      var removeIndex = this.toasts.map((item) => item.id).indexOf(id);
      if (removeIndex >= 0) {
        this.toasts.splice(removeIndex, 1);
      }
    },
    closeBanner(id) {
      var removeIndex = this.banners.map((item) => item.id).indexOf(id);
      if (removeIndex >= 0) {
        this.banners.splice(removeIndex, 1);
      }
    },
    postResponseError(response, fatalError = false) {
      if (fatalError) {
        this.addToast("Error fetching resource (response)", response.status + " " + response._data.detail, { statusCode: response.status, statusMessage: response._data.detail });
      } else {
        this.addToast("Error fetching resource (response)", response.status + " " + response._data.detail);
      }
    }
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$8 = {
  name: "Banners",
  setup() {
    const notificationsStore = useNotificationsStore$1();
    return { notificationsStore };
  },
  methods: {
    closeBanner(id) {
      this.notificationsStore.closeBanner(id);
    }
  },
  created() {
    this.notificationsStore.fetchNotifications();
  }
};
function _sfc_ssrRender$6(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_font_awesome_icon = __nuxt_component_1$1;
  const _component_NuxtLink = __nuxt_component_0$1;
  _push(`<!--[-->`);
  ssrRenderList($setup.notificationsStore.banners, (banner) => {
    _push(`<div data-v-d641860e><div class="jumbotron jumbotron-fluid py-3" data-v-d641860e><div class="container text-center" data-v-d641860e><div class="row" data-v-d641860e>`);
    if (banner.link_behaviour === "new") {
      _push(`<div data-v-d641860e><a${ssrRenderAttr("href", banner.link)} target="_blank" data-v-d641860e>`);
      if (banner.title) {
        _push(`<strong data-v-d641860e>${ssrInterpolate(banner.title)}: </strong>`);
      } else {
        _push(`<!---->`);
      }
      _push(`${ssrInterpolate(banner.message)} `);
      _push(ssrRenderComponent(_component_font_awesome_icon, {
        class: "ms-2",
        icon: ["fas", "external-link-alt"]
      }, null, _parent));
      _push(`</a>`);
      if (!banner.is_persistent) {
        _push(`<button type="button" class="btn ms-4 btn-sm btn-outline-light text-uppercase" data-v-d641860e>Dismiss</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else if (banner.link_behaviour === "none") {
      _push(`<div class="basic-banner" data-v-d641860e>`);
      if (banner.title) {
        _push(`<strong data-v-d641860e>${ssrInterpolate(banner.title)}: </strong>`);
      } else {
        _push(`<!---->`);
      }
      _push(`${ssrInterpolate(banner.message)} `);
      if (!banner.is_persistent) {
        _push(`<button type="button" class="btn ms-2 btn-sm btn-outline-light text-uppercase" data-v-d641860e>Dismiss</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else if (banner.link_behaviour === "same") {
      _push(`<div data-v-d641860e>`);
      if (banner.link_type === "external") {
        _push(`<a${ssrRenderAttr("href", banner.link)} data-v-d641860e>`);
        if (banner.title) {
          _push(`<strong data-v-d641860e>${ssrInterpolate(banner.title)}: </strong>`);
        } else {
          _push(`<!---->`);
        }
        _push(`${ssrInterpolate(banner.message)} `);
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          class: "ms-2",
          icon: ["fas", "external-link-alt"]
        }, null, _parent));
        _push(`</a>`);
      } else if (banner.link_type === "internal") {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: banner.link
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (banner.title) {
                _push2(`<strong data-v-d641860e${_scopeId}>${ssrInterpolate(banner.title)}: </strong>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`${ssrInterpolate(banner.message)}`);
            } else {
              return [
                banner.title ? (openBlock(), createBlock("strong", { key: 0 }, toDisplayString(banner.title) + ": ", 1)) : createCommentVNode("", true),
                createTextVNode(toDisplayString(banner.message), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (!banner.is_persistent) {
        _push(`<button type="button" class="btn ms-4 btn-sm btn-outline-light text-uppercase" data-v-d641860e>Dismiss</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div></div></div>`);
  });
  _push(`<!--]-->`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Banners.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_3$1 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender$6], ["__scopeId", "data-v-d641860e"]]);
const __nuxt_component_1 = /* @__PURE__ */ defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  // eslint-disable-next-line vue/require-prop-types
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots, attrs }) {
    const mounted = ref(false);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const _sfc_main$7 = {
  name: "Navbar",
  data() {
    return {
      visible: false
    };
  },
  methods: {
    toggle() {
      this.visible = !this.visible;
    }
  }
};
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_ClientOnly = __nuxt_component_1;
  _push(`<nav${ssrRenderAttrs(mergeProps({ class: "navbar navbar-expand-lg navbar-dark bg-theme1" }, _attrs))} data-v-5a94d1d1><div class="container-fluid" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: "navbar-brand",
    to: "/"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`WhereTheyStand`);
      } else {
        return [
          createTextVNode("WhereTheyStand")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<button class="navbar-toggler" type="button" aria-controls="navbarSupportedContent"${ssrRenderAttr("aria-expanded", $data.visible)} aria-label="Toggle navigation" data-v-5a94d1d1><span class="navbar-toggler-icon" data-v-5a94d1d1></span></button><div class="${ssrRenderClass([{ collapse: !$data.visible }, "navbar-collapse text-light"])}" id="navbarSupportedContent" data-v-5a94d1d1><ul class="navbar-nav me-auto" data-v-5a94d1d1><li class="nav-item" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: [_ctx.$route.fullPath.startsWith("/people/") ? "active nav-link" : "nav-link"],
    to: "/people/",
    "active-class": "active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`People`);
      } else {
        return [
          createTextVNode("People")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="nav-item" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: [_ctx.$route.fullPath.startsWith("/parties/") ? "active nav-link" : "nav-link"],
    to: "/parties/",
    "active-class": "active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Parties`);
      } else {
        return [
          createTextVNode("Parties")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="nav-item" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: [_ctx.$route.fullPath.startsWith("/electorates/") ? "active nav-link" : "nav-link"],
    to: "/electorates/",
    "active-class": "active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Electorates`);
      } else {
        return [
          createTextVNode("Electorates")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="nav-item" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: [_ctx.$route.fullPath.startsWith("/bills/") ? "active nav-link" : "nav-link"],
    to: "/bills/",
    "active-class": "active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Bills `);
      } else {
        return [
          createTextVNode("Bills ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="nav-item" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: [_ctx.$route.fullPath.startsWith("/votes/") ? "active nav-link" : "nav-link"],
    to: "/votes/",
    "active-class": "active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Votes `);
      } else {
        return [
          createTextVNode("Votes ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="nav-item" data-v-5a94d1d1>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: [_ctx.$route.fullPath.startsWith("/about/") ? "active nav-link" : "nav-link"],
    to: "/about/",
    "active-class": "active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`About`);
      } else {
        return [
          createTextVNode("About")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="nav-item" data-v-5a94d1d1><a class="${ssrRenderClass([_ctx.$route.fullPath.startsWith("/search/") ? "active nav-link" : "nav-link"])}" href="/search/" active-class="active" data-v-5a94d1d1>Search</a></li></ul>`);
  _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
  _push(`</div></div></nav>`);
}
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Navbar.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["ssrRender", _sfc_ssrRender$5], ["__scopeId", "data-v-5a94d1d1"]]);
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey = (routeProps, override) => {
  const matchedRoute = routeProps.route.matched.find((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === routeProps.Component.type;
  });
  const source = override ?? (matchedRoute == null ? void 0 : matchedRoute.meta.key) ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
const Fragment = /* @__PURE__ */ defineComponent({
  name: "FragmentWrapper",
  setup(_props, { slots }) {
    return () => {
      var _a;
      return (_a = slots.default) == null ? void 0 : _a.call(slots);
    };
  }
});
const _wrapIf = (component, props, slots) => {
  return { default: () => props ? h(component, props === true ? {} : props, slots) : h(Fragment, {}, slots) };
};
const __nuxt_component_3 = /* @__PURE__ */ defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs }) {
    const nuxtApp = useNuxtApp();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          if (!routeProps.Component) {
            return;
          }
          const key = generateRouteKey(routeProps, props.pageKey);
          const done = nuxtApp.deferHydration();
          const hasTransition = !!(props.transition ?? routeProps.route.meta.pageTransition ?? appPageTransition);
          const transitionProps = hasTransition && _mergeTransitionProps([
            props.transition,
            routeProps.route.meta.pageTransition,
            appPageTransition,
            { onAfterLeave: () => {
              nuxtApp.callHook("page:transition:finish", routeProps.Component);
            } }
          ].filter(Boolean));
          return _wrapIf(
            Transition,
            hasTransition && transitionProps,
            wrapInKeepAlive(
              props.keepalive ?? routeProps.route.meta.keepalive ?? appKeepalive,
              h(Suspense, {
                onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
                onResolve: () => {
                  nextTick(() => nuxtApp.callHook("page:finish", routeProps.Component).finally(done));
                }
              }, { default: () => h(RouteProvider, { key, routeProps, pageKey: key, hasTransition }) })
            )
          ).default();
        }
      });
    };
  }
});
function _toArray(val) {
  return Array.isArray(val) ? val : val ? [val] : [];
}
function _mergeTransitionProps(routeProps) {
  const _props = routeProps.map((prop) => ({
    ...prop,
    onAfterLeave: _toArray(prop.onAfterLeave)
  }));
  return defu(..._props);
}
const RouteProvider = /* @__PURE__ */ defineComponent({
  name: "RouteProvider",
  // TODO: Type props
  // eslint-disable-next-line vue/require-prop-types
  props: ["routeProps", "pageKey", "hasTransition"],
  setup(props) {
    const previousKey = props.pageKey;
    const previousRoute = props.routeProps.route;
    const route = {};
    for (const key in props.routeProps.route) {
      route[key] = computed(() => previousKey === props.pageKey ? props.routeProps.route[key] : previousRoute[key]);
    }
    provide("_route", reactive(route));
    return () => {
      return h(props.routeProps.Component);
    };
  }
});
const _sfc_main$6 = {
  name: "ExternalLinkInline",
  props: {
    link: String,
    text: {
      type: String,
      default: ""
    }
  }
};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_font_awesome_icon = __nuxt_component_1$1;
  _push(`<a${ssrRenderAttrs(mergeProps({
    href: $props.link,
    target: "_blank"
  }, _attrs))} data-v-9cd0161c>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`${ssrInterpolate($props.text)}`);
  _push(ssrRenderComponent(_component_font_awesome_icon, {
    class: "ms-2",
    icon: ["fas", "external-link-alt"]
  }, null, _parent));
  _push(`</a>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExternalLinkInline.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_6$1 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender$4], ["__scopeId", "data-v-9cd0161c"]]);
const _sfc_main$5 = {
  name: "ColourStripe",
  props: {
    colour: String,
    secondaryColour: String
  },
  computed: {
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
  }
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    id: "stripe",
    style: { backgroundImage: $options.gradient }
  }, _attrs))} data-v-a879b415></div>`);
}
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ColourStripe.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-a879b415"]]);
const _sfc_main$4 = {
  name: "Card",
  props: {
    missing: {
      type: Boolean,
      default: false
    },
    gradient: {
      type: Boolean,
      default: false
    },
    frosted: {
      type: Boolean,
      default: false
    },
    stripeColour: String
  }
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ColourStripe = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["wts-card", { "wts-card-missing": $props.missing, "wts-card-gradient": $props.gradient, "wts-card-frosted": $props.frosted }]
  }, _attrs))} data-v-ce0ca63e><div class="padding-div" data-v-ce0ca63e>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
  if ($props.stripeColour) {
    _push(ssrRenderComponent(_component_ColourStripe, { colour: $props.stripeColour }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Card.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-ce0ca63e"]]);
const useAuthStore = defineStore("authentication", {
  state() {
    return {
      isAuthenticated: false,
      didCheckAuthentication: false,
      userType: "guest",
      requiresSession: false,
      sessionLink: null
    };
  },
  getters: {},
  actions: {
    async checkAuthentication() {
      if (!this.didCheckAuthentication) {
        const user = new PassageUser();
        const userAuthToken = await user.getAuthToken();
        var state = this;
        await useFetch(
          API_BASE + "auth/psg-auth/",
          {
            headers: {
              Authorization: `Bearer ${userAuthToken}`
            },
            onResponse({ request, response, options }) {
              state.userType = response._data.user_type;
              state.requiresSession = response._data.requires_session;
              state.didCheckAuthentication = true;
            },
            onResponseError({ request, response, options }) {
              const store = useNotificationsStore();
              store.postResponseError(response);
            },
            onRequestError({ request, options, error }) {
              const store = useNotificationsStore();
              store.addToast("Error fetching resource (request)", error);
            }
          },
          "$JH8GhZEIT2"
        );
      }
    },
    async getSessionLink() {
      const user = new PassageUser();
      const userAuthToken = await user.getAuthToken();
      const data = await $fetch(
        API_BASE + "auth/session/",
        {
          headers: {
            Authorization: `Bearer ${userAuthToken}`
          }
        }
      );
      return API_BASE + "auth/initiate/" + data.id + "/" + data.token + "/";
    }
  }
});
const _sfc_main$3 = {
  name: "Footer",
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  methods: {
    async goToDjango() {
      const sessionLink = await this.authStore.getSessionLink();
      console.log(sessionLink);
      await navigateTo(sessionLink, { external: true });
      return;
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_RouterLink = resolveComponent("RouterLink");
  const _component_ExternalLinkInline = __nuxt_component_6$1;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_Card = __nuxt_component_2;
  _push(`<footer${ssrRenderAttrs(mergeProps({ class: "footer text-light" }, _attrs))} data-v-936f2948><div class="container" data-v-936f2948><div class="row" data-v-936f2948><div class="col-12 col-lg-4" data-v-936f2948><h5 data-v-936f2948>Pages</h5><hr data-v-936f2948><ul style="${ssrRenderStyle({ "list-style": "none", "padding-left": "0" })}" data-v-936f2948><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/people"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`People`);
      } else {
        return [
          createTextVNode("People")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/parties"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Parties`);
      } else {
        return [
          createTextVNode("Parties")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/electorates"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Electorates`);
      } else {
        return [
          createTextVNode("Electorates")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/bills"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Bills`);
      } else {
        return [
          createTextVNode("Bills")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/votes"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Votes`);
      } else {
        return [
          createTextVNode("Votes")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li></ul></div><div class="col-12 col-lg-4" data-v-936f2948><h5 data-v-936f2948>About</h5><hr data-v-936f2948><ul style="${ssrRenderStyle({ "list-style": "none", "padding-left": "0" })}" data-v-936f2948><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/about"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`About WhereTheyStand`);
      } else {
        return [
          createTextVNode("About WhereTheyStand")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li data-v-936f2948><a class="text-light footer-link" href="/feedback" data-v-936f2948>Feedback</a></li><li data-v-936f2948><a class="text-light footer-link" href="/corrections" data-v-936f2948>Corrections</a></li><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_RouterLink, {
    class: "text-light footer-link",
    to: "/terms"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Copyright and Privacy`);
      } else {
        return [
          createTextVNode("Copyright and Privacy")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_ExternalLinkInline, {
    class: "text-light footer-link",
    link: "https://status.wheretheystand.nz"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`System status`);
      } else {
        return [
          createTextVNode("System status")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li>`);
  if ($setup.authStore.isAuthenticated && $setup.authStore.requiresSession) {
    _push(`<li data-v-936f2948><a class="text-light footer-link" href="#" data-v-936f2948> Django </a></li>`);
  } else if ($setup.authStore.isAuthenticated) {
    _push(`<li data-v-936f2948>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      class: "text-light footer-link",
      to: "/auth"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`Admin`);
        } else {
          return [
            createTextVNode("Admin")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</li>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</ul></div><div class="col-12 col-lg-4" data-v-936f2948><h5 data-v-936f2948>Social media</h5><hr data-v-936f2948><ul style="${ssrRenderStyle({ "list-style": "none", "padding-left": "0" })}" data-v-936f2948><li data-v-936f2948>`);
  _push(ssrRenderComponent(_component_ExternalLinkInline, {
    class: "text-light footer-link",
    link: "https://x.com/wheretheystand_"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`X (Twitter)`);
      } else {
        return [
          createTextVNode("X (Twitter)")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li>`);
  _push(ssrRenderComponent(_component_Card, { gradient: true }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h5 data-v-936f2948${_scopeId}>Like WhereTheyStand?</h5> You can shout me a hot chocolate (or two).<br data-v-936f2948${_scopeId}>`);
        _push2(ssrRenderComponent(_component_ExternalLinkInline, {
          class: "text-light footer-link",
          link: "https://www.buymeacoffee.com/jamescmacey"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`buymeacoffee.com/jamescmacey`);
            } else {
              return [
                createTextVNode("buymeacoffee.com/jamescmacey")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode("h5", null, "Like WhereTheyStand?"),
          createTextVNode(" You can shout me a hot chocolate (or two)."),
          createVNode("br"),
          createVNode(_component_ExternalLinkInline, {
            class: "text-light footer-link",
            link: "https://www.buymeacoffee.com/jamescmacey"
          }, {
            default: withCtx(() => [
              createTextVNode("buymeacoffee.com/jamescmacey")
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</ul></div></div>`);
  if (_ctx.$route.fullPath.length <= 1) {
    _push(`<small data-v-936f2948>`);
    _push(ssrRenderComponent(_component_ExternalLinkInline, {
      class: "text-light footer-link",
      link: "https://commons.wikimedia.org/wiki/File:Beehive_and_Parliament_House_in_New_Zealand.jpg"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(` Header image by Wikimedia user &quot;Melonblob&quot;, used under CC BY-SA 4.0. Cropped and resized. `);
        } else {
          return [
            createTextVNode(' Header image by Wikimedia user "Melonblob", used under CC BY-SA 4.0. Cropped and resized. ')
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`</small>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<hr data-v-936f2948><h4 data-v-936f2948><a class="footer-link text-light special-font" href="https://wheretheystand.nz" data-v-936f2948>wheretheystand.nz</a></h4></div></footer>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Footer.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-936f2948"]]);
const _sfc_main$2 = {
  name: "Toasts",
  setup() {
    const notificationsStore = useNotificationsStore$1();
    return { notificationsStore };
  },
  methods: {
    closeToast(id) {
      this.notificationsStore.closeToast(id);
    },
    checkError(toast) {
      if (toast.error && Object.keys(toast.error).length !== 0) {
        throw createError(toast.error);
      }
      return "";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  if ($setup.notificationsStore.toasts.length > 0) {
    _push(`<div${ssrRenderAttrs(mergeProps({ class: "toast-container position-absolute p-3 top-0 end-0" }, _attrs))} data-v-46111153><!--[-->`);
    ssrRenderList($setup.notificationsStore.toasts, (toast) => {
      _push(`<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true" data-v-46111153><div class="toast-header" data-v-46111153>${ssrInterpolate($options.checkError(toast))} <strong class="me-auto" data-v-46111153>${ssrInterpolate(toast.title)}</strong><button type="button" class="btn-close" aria-label="Close" data-v-46111153></button></div><div class="toast-body" data-v-46111153>${ssrInterpolate(toast.message)}</div></div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Toasts.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-46111153"]]);
const _sfc_main$1 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} — WhereTheyStand` : "WhereTheyStand";
      },
      meta: [
        { name: "description", content: "WhereTheyStand aggregates and links information about Members of Parliament and political parties, allowing you to find relevant information easily." }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Head = Head;
      const _component_Meta = Meta;
      const _component_Link = Link;
      const _component_Banners = __nuxt_component_3$1;
      const _component_Navbar = __nuxt_component_4;
      const _component_NuxtPage = __nuxt_component_3;
      const _component_Footer = __nuxt_component_6;
      const _component_Toasts = __nuxt_component_7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Head, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Meta, {
              name: "twitter:card",
              content: "summary"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              name: "twitter:site",
              content: "@wheretheystand_"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              name: "twitter:title",
              content: "WhereTheyStand"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              name: "twitter:description",
              content: "See where your MP stands at wheretheystand.nz"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              property: "og:site_name",
              content: "WhereTheyStand"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              property: "og:locale",
              content: "en_NZ"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              property: "og:title",
              content: "WhereTheyStand"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              property: "og:description",
              content: "See where your MP stands at wheretheystand.nz"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Link, {
              rel: "apple-touch-icon",
              sizes: "180x180",
              href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/apple-touch-icon.png"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Link, {
              rel: "icon",
              type: "image/png",
              sizes: "32x32",
              href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon-32x32.png"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Link, {
              rel: "icon",
              type: "image/png",
              sizes: "16x16",
              href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon-16x16.png"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Link, {
              rel: "manifest",
              href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/site.webmanifest"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Link, {
              rel: "mask-icon",
              href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/safari-pinned-tab.svg",
              color: "#58787f"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Link, {
              rel: "shortcut icon",
              href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon.ico"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              name: "msapplication-TileColor",
              content: "#58787f"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              name: "msapplication-config",
              content: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/browserconfig.xml"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Meta, {
              name: "theme-color",
              content: "#58787f"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Meta, {
                name: "twitter:card",
                content: "summary"
              }),
              createVNode(_component_Meta, {
                name: "twitter:site",
                content: "@wheretheystand_"
              }),
              createVNode(_component_Meta, {
                name: "twitter:title",
                content: "WhereTheyStand"
              }),
              createVNode(_component_Meta, {
                name: "twitter:description",
                content: "See where your MP stands at wheretheystand.nz"
              }),
              createVNode(_component_Meta, {
                property: "og:site_name",
                content: "WhereTheyStand"
              }),
              createVNode(_component_Meta, {
                property: "og:locale",
                content: "en_NZ"
              }),
              createVNode(_component_Meta, {
                property: "og:title",
                content: "WhereTheyStand"
              }),
              createVNode(_component_Meta, {
                property: "og:description",
                content: "See where your MP stands at wheretheystand.nz"
              }),
              createVNode(_component_Link, {
                rel: "apple-touch-icon",
                sizes: "180x180",
                href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/apple-touch-icon.png"
              }),
              createVNode(_component_Link, {
                rel: "icon",
                type: "image/png",
                sizes: "32x32",
                href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon-32x32.png"
              }),
              createVNode(_component_Link, {
                rel: "icon",
                type: "image/png",
                sizes: "16x16",
                href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon-16x16.png"
              }),
              createVNode(_component_Link, {
                rel: "manifest",
                href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/site.webmanifest"
              }),
              createVNode(_component_Link, {
                rel: "mask-icon",
                href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/safari-pinned-tab.svg",
                color: "#58787f"
              }),
              createVNode(_component_Link, {
                rel: "shortcut icon",
                href: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/favicon.ico"
              }),
              createVNode(_component_Meta, {
                name: "msapplication-TileColor",
                content: "#58787f"
              }),
              createVNode(_component_Meta, {
                name: "msapplication-config",
                content: "https://storage.googleapis.com/wheretheystand-nz/nzpm_app/favicons/browserconfig.xml"
              }),
              createVNode(_component_Meta, {
                name: "theme-color",
                content: "#58787f"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex-wrapper-gx"><div class="gx-non-footer">`);
      _push(ssrRenderComponent(_component_Banners, null, null, _parent));
      _push(ssrRenderComponent(_component_Navbar, null, null, _parent));
      _push(ssrRenderComponent(_component_NuxtPage, { class: "content-wrapper" }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_Toasts, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AppComponent = _sfc_main$1;
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const ErrorComponent = /* @__PURE__ */ defineAsyncComponent(() => import('./_nuxt/error-component-a88ab082.mjs').then((r) => r.default || r));
    const IslandRenderer = /* @__PURE__ */ defineAsyncComponent(() => import('./_nuxt/island-renderer-ff0913a1.mjs').then((r) => r.default || r));
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide("_route", useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = callWithNuxt(nuxtApp, showError, [err]);
        onServerPrefetch(() => p);
        return false;
      }
    });
    const { islandContext } = nuxtApp.ssrContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RootComponent = _sfc_main;
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
let entry;
const plugins = normalizePlugins(_plugins);
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(RootComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.hooks.callHook("app:error", err);
      nuxt.payload.error = nuxt.payload.error || err;
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);

export { API_BASE as A, Head as H, Link as L, Meta as M, Title as T, _export_sfc as _, __nuxt_component_2 as a, __nuxt_component_6$1 as b, createError as c, __nuxt_component_0$1 as d, entry$1 as default, __nuxt_component_1$1 as e, __nuxt_component_1 as f, defineStore as g, __nuxt_component_3 as h, useNotificationsStore$1 as i, useHead as j, navigateTo as n, useFetch as u };
//# sourceMappingURL=server.mjs.map
