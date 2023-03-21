globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { defineEventHandler, handleCacheHeaders, createEvent, eventHandler, createError, createApp, createRouter, lazyEventHandler } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ohmyfetch';
import { createRouter as createRouter$1 } from 'radix3';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { parseURL, withQuery, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { createStorage } from 'unstorage';
import { promises } from 'fs';
import { resolve, dirname } from 'pathe';
import { fileURLToPath } from 'url';

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":""},"nitro":{"routes":{},"envPrefix":"NUXT_"},"public":{}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}
overrideConfig(_runtimeConfig);
const config = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => config;
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: []
};
function timingMiddleware(_req, res, next) {
  const start = globalTiming.start();
  const _end = res.end;
  res.end = (data, encoding, callback) => {
    const metrics = [["Generate", globalTiming.end(start)], ...globalTiming.metrics];
    const serverTiming = metrics.map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`).join(", ");
    if (!res.headersSent) {
      res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(res, data, encoding, callback);
  };
  next();
}

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets$1);

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  async function get(key, resolver) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl;
    const _resolve = async () => {
      if (!pending[key]) {
        entry.value = void 0;
        entry.integrity = void 0;
        entry.mtime = void 0;
        entry.expires = void 0;
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      entry.mtime = Date.now();
      entry.integrity = integrity;
      delete pending[key];
      useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return Promise.resolve(entry);
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const key = (opts.getKey || getKey)(...args);
    const entry = await get(key, () => fn(...args));
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length ? hash(args, {}) : "";
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: (event) => {
      return decodeURI(parseURL(event.req.originalUrl || event.req.url).pathname).replace(/\/$/, "/index");
    },
    group: opts.group || "nitro/handlers",
    integrity: [
      opts.integrity,
      handler
    ]
  };
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const reqProxy = cloneWithProxy(incomingEvent.req, { headers: {} });
    const resHeaders = {};
    const resProxy = cloneWithProxy(incomingEvent.res, {
      statusCode: 200,
      getHeader(name) {
        return resHeaders[name];
      },
      setHeader(name, value) {
        resHeaders[name] = value;
        return this;
      },
      getHeaderNames() {
        return Object.keys(resHeaders);
      },
      hasHeader(name) {
        return name in resHeaders;
      },
      removeHeader(name) {
        delete resHeaders[name];
      },
      getHeaders() {
        return resHeaders;
      }
    });
    const event = createEvent(reqProxy, resProxy);
    event.context = incomingEvent.context;
    const body = await handler(event);
    const headers = event.res.getHeaders();
    headers.Etag = `W/"${hash(body)}"`;
    headers["Last-Modified"] = new Date().toUTCString();
    const cacheControl = [];
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`);
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
      } else {
        cacheControl.push("stale-while-revalidate");
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`);
    }
    if (cacheControl.length) {
      headers["Cache-Control"] = cacheControl.join(", ");
    }
    const cacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    };
    return cacheEntry;
  }, _opts);
  return defineEventHandler(async (event) => {
    const response = await _cachedHandler(event);
    if (event.res.headersSent || event.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["Last-Modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.res.statusCode = response.code;
    for (const name in response.headers) {
      event.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const plugins = [
  
];

function hasReqHeader(req, header, includes) {
  const value = req.headers[header];
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event.req, "accept", "application/json") || hasReqHeader(event.req, "user-agent", "curl/") || hasReqHeader(event.req, "user-agent", "httpie/") || event.req.url?.endsWith(".json") || event.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Route Not Found" : "Internal Server Error");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(_error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(_error);
  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    description: "",
    data: _error.data
  };
  event.res.statusCode = errorObject.statusCode;
  event.res.statusMessage = errorObject.statusMessage;
  if (errorObject.statusCode !== 404) {
    console.error("[nuxt] [request error]", errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.res.setHeader("Content-Type", "application/json");
    event.res.end(JSON.stringify(errorObject));
    return;
  }
  const url = withQuery("/__nuxt_error", errorObject);
  const html = await $fetch(url).catch((error) => {
    console.error("[nitro] Error while generating error response", error);
    return errorObject.statusMessage;
  });
  event.res.setHeader("Content-Type", "text/html;charset=UTF-8");
  event.res.end(html);
});

const assets = {
  "/_nuxt/ColourDot-e623c90d.mjs": {
    "type": "application/javascript",
    "etag": "\"18b-qW7NoNxSp+ZSNixtCD2q/rlEYzU\"",
    "mtime": "2023-03-21T12:26:04.975Z",
    "path": "../public/_nuxt/ColourDot-e623c90d.mjs"
  },
  "/_nuxt/DisplayControlButton-4d9021f5.mjs": {
    "type": "application/javascript",
    "etag": "\"118-FZRnN+gmZZeD1v0ALZcglZQpbNI\"",
    "mtime": "2023-03-21T12:26:04.974Z",
    "path": "../public/_nuxt/DisplayControlButton-4d9021f5.mjs"
  },
  "/_nuxt/ExternalLinkButton-b88f9502.mjs": {
    "type": "application/javascript",
    "etag": "\"1ef-TBd/z6xgB/mkbIejqkMPGwmQWhI\"",
    "mtime": "2023-03-21T12:26:04.974Z",
    "path": "../public/_nuxt/ExternalLinkButton-b88f9502.mjs"
  },
  "/_nuxt/Grid-e12484ec.mjs": {
    "type": "application/javascript",
    "etag": "\"23b-bFITn63ESbaIJh3jtswP6l7my3g\"",
    "mtime": "2023-03-21T12:26:04.973Z",
    "path": "../public/_nuxt/Grid-e12484ec.mjs"
  },
  "/_nuxt/PageHeader-3e1d1f75.mjs": {
    "type": "application/javascript",
    "etag": "\"a4d-yPZVOTjYOhLkso42BX4lBAUCVv4\"",
    "mtime": "2023-03-21T12:26:04.973Z",
    "path": "../public/_nuxt/PageHeader-3e1d1f75.mjs"
  },
  "/_nuxt/PartyCard-f1f1cc48.mjs": {
    "type": "application/javascript",
    "etag": "\"2d6-Vbz1YMwd7foBZequIqNDRnWIqvc\"",
    "mtime": "2023-03-21T12:26:04.973Z",
    "path": "../public/_nuxt/PartyCard-f1f1cc48.mjs"
  },
  "/_nuxt/PersonCard-60767f43.mjs": {
    "type": "application/javascript",
    "etag": "\"504-tjK1/oGKI5NYCMzIteMxeFdW6wQ\"",
    "mtime": "2023-03-21T12:26:04.972Z",
    "path": "../public/_nuxt/PersonCard-60767f43.mjs"
  },
  "/_nuxt/PersonList-d2b988d4.mjs": {
    "type": "application/javascript",
    "etag": "\"634-ldHDDw4SZi+Mh3yPpggdDhW2Nb8\"",
    "mtime": "2023-03-21T12:26:04.972Z",
    "path": "../public/_nuxt/PersonList-d2b988d4.mjs"
  },
  "/_nuxt/Spinner-e8dc5234.mjs": {
    "type": "application/javascript",
    "etag": "\"11a-k3lVI2HKb9cQlDW8nXIhvWYexkk\"",
    "mtime": "2023-03-21T12:26:04.972Z",
    "path": "../public/_nuxt/Spinner-e8dc5234.mjs"
  },
  "/_nuxt/VoteSummary-abd46823.mjs": {
    "type": "application/javascript",
    "etag": "\"17ec-jdUzX2l10RDrbCD75owPuW2p99c\"",
    "mtime": "2023-03-21T12:26:04.971Z",
    "path": "../public/_nuxt/VoteSummary-abd46823.mjs"
  },
  "/_nuxt/_id_-056e059f.mjs": {
    "type": "application/javascript",
    "etag": "\"531-y73rOW+itmY3lWYZF/jI4ELqObk\"",
    "mtime": "2023-03-21T12:26:04.971Z",
    "path": "../public/_nuxt/_id_-056e059f.mjs"
  },
  "/_nuxt/_id_-ce8afa32.mjs": {
    "type": "application/javascript",
    "etag": "\"7bb-VAb0sJNMqGt2v7GqQ0UfjcNqqr4\"",
    "mtime": "2023-03-21T12:26:04.971Z",
    "path": "../public/_nuxt/_id_-ce8afa32.mjs"
  },
  "/_nuxt/about-4dedf634.mjs": {
    "type": "application/javascript",
    "etag": "\"d2f-A07D7BHTPEXmU06xSrRL+RQxBQg\"",
    "mtime": "2023-03-21T12:26:04.970Z",
    "path": "../public/_nuxt/about-4dedf634.mjs"
  },
  "/_nuxt/details-609665bb.mjs": {
    "type": "application/javascript",
    "etag": "\"20f3-17tKKBaOV0esjDWcyh2IZyMOLHM\"",
    "mtime": "2023-03-21T12:26:04.970Z",
    "path": "../public/_nuxt/details-609665bb.mjs"
  },
  "/_nuxt/documents-34313439.mjs": {
    "type": "application/javascript",
    "etag": "\"236-ksmHKUbYSi6BUQiepoavuisjyAo\"",
    "mtime": "2023-03-21T12:26:04.970Z",
    "path": "../public/_nuxt/documents-34313439.mjs"
  },
  "/_nuxt/entry-474574c5.mjs": {
    "type": "application/javascript",
    "etag": "\"1a1203-+8X17WPrXmrxKABGN7tWMcTSgao\"",
    "mtime": "2023-03-21T12:26:04.969Z",
    "path": "../public/_nuxt/entry-474574c5.mjs"
  },
  "/_nuxt/entry.8bbb1a9c.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3a85a-qkUSxGNJA+CD2U+OCesFmbS3j8M\"",
    "mtime": "2023-03-21T12:26:04.967Z",
    "path": "../public/_nuxt/entry.8bbb1a9c.css"
  },
  "/_nuxt/expenses-0c3c3cb7.mjs": {
    "type": "application/javascript",
    "etag": "\"113f-1GpfX/PMKEKVEtfeo0VjuIzPTDA\"",
    "mtime": "2023-03-21T12:26:04.966Z",
    "path": "../public/_nuxt/expenses-0c3c3cb7.mjs"
  },
  "/_nuxt/index-23d84a3a.mjs": {
    "type": "application/javascript",
    "etag": "\"3966-oFqOi3SC2i9DcBppIdxbnovhzH8\"",
    "mtime": "2023-03-21T12:26:04.966Z",
    "path": "../public/_nuxt/index-23d84a3a.mjs"
  },
  "/_nuxt/index-74618e6c.mjs": {
    "type": "application/javascript",
    "etag": "\"4026-l05rUHKN6OkQfrP4fLXp0QbGPvc\"",
    "mtime": "2023-03-21T12:26:04.966Z",
    "path": "../public/_nuxt/index-74618e6c.mjs"
  },
  "/_nuxt/index-805ab583.mjs": {
    "type": "application/javascript",
    "etag": "\"5bc-+toMPBVLnkG1NCu9dattKWw/ZZ0\"",
    "mtime": "2023-03-21T12:26:04.965Z",
    "path": "../public/_nuxt/index-805ab583.mjs"
  },
  "/_nuxt/index-a25ec11c.mjs": {
    "type": "application/javascript",
    "etag": "\"ecc-oNXTqms9C6+JYH65CEr3YD28A5c\"",
    "mtime": "2023-03-21T12:26:04.965Z",
    "path": "../public/_nuxt/index-a25ec11c.mjs"
  },
  "/_nuxt/index-a968a5a8.mjs": {
    "type": "application/javascript",
    "etag": "\"a8d-BsnXo5WmCkTKOL566VljHPRqCBo\"",
    "mtime": "2023-03-21T12:26:04.964Z",
    "path": "../public/_nuxt/index-a968a5a8.mjs"
  },
  "/_nuxt/index-ae700789.mjs": {
    "type": "application/javascript",
    "etag": "\"21bf-7j1Dd+21y1oJh4xrVvr8JXE++OA\"",
    "mtime": "2023-03-21T12:26:04.964Z",
    "path": "../public/_nuxt/index-ae700789.mjs"
  },
  "/_nuxt/index-b5061b1b.mjs": {
    "type": "application/javascript",
    "etag": "\"1e9b-LUsZPA5kIx8VU85SQ+kAvlQi81E\"",
    "mtime": "2023-03-21T12:26:04.963Z",
    "path": "../public/_nuxt/index-b5061b1b.mjs"
  },
  "/_nuxt/index-d63cb175.mjs": {
    "type": "application/javascript",
    "etag": "\"338b-2FljF/VPK5sl+WaWZBhmDYlH2cc\"",
    "mtime": "2023-03-21T12:26:04.962Z",
    "path": "../public/_nuxt/index-d63cb175.mjs"
  },
  "/_nuxt/index-debe12ea.mjs": {
    "type": "application/javascript",
    "etag": "\"2107-WkM4yI/j/bNMwA4RWUAqS+cFSgs\"",
    "mtime": "2023-03-21T12:26:04.962Z",
    "path": "../public/_nuxt/index-debe12ea.mjs"
  },
  "/_nuxt/index-e9a9673a.mjs": {
    "type": "application/javascript",
    "etag": "\"184f-V8KPTX6XQ7yXQ7BwuZBgjPULhdM\"",
    "mtime": "2023-03-21T12:26:04.962Z",
    "path": "../public/_nuxt/index-e9a9673a.mjs"
  },
  "/_nuxt/index-ed0b2efe.mjs": {
    "type": "application/javascript",
    "etag": "\"696-ndIh7Xvcl7Qj+J2Q0sO8zw0BX7s\"",
    "mtime": "2023-03-21T12:26:04.961Z",
    "path": "../public/_nuxt/index-ed0b2efe.mjs"
  },
  "/_nuxt/index-f15a075e.mjs": {
    "type": "application/javascript",
    "etag": "\"a82-j6UkxrfQ113AZ4SzQPgPL411ISE\"",
    "mtime": "2023-03-21T12:26:04.960Z",
    "path": "../public/_nuxt/index-f15a075e.mjs"
  },
  "/_nuxt/interests-7269908f.mjs": {
    "type": "application/javascript",
    "etag": "\"ff8-gUfOeu0EiaVeVWI9cLQ37u8pipg\"",
    "mtime": "2023-03-21T12:26:04.959Z",
    "path": "../public/_nuxt/interests-7269908f.mjs"
  },
  "/_nuxt/manifest.json": {
    "type": "application/json",
    "etag": "\"1f8f-ul2Mp0935WxeV3G9y/5x8rONP0w\"",
    "mtime": "2023-03-21T12:26:04.959Z",
    "path": "../public/_nuxt/manifest.json"
  },
  "/_nuxt/terms-0758995a.mjs": {
    "type": "application/javascript",
    "etag": "\"166d-XtLPp4+Lpuq7tQFhUzNkuRv0AMw\"",
    "mtime": "2023-03-21T12:26:04.958Z",
    "path": "../public/_nuxt/terms-0758995a.mjs"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = ["/_nuxt"];

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const _152570 = eventHandler(async (event) => {
  if (event.req.method && !METHODS.includes(event.req.method)) {
    return;
  }
  let id = decodeURIComponent(withLeadingSlash(withoutTrailingSlash(parseURL(event.req.url).pathname)));
  let asset;
  for (const _id of [id, id + "/index.html"]) {
    const _asset = getAsset(_id);
    if (_asset) {
      asset = _asset;
      id = _id;
      break;
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.res.statusCode = 304;
    event.res.end("Not Modified (etag)");
    return;
  }
  const ifModifiedSinceH = event.req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      event.res.statusCode = 304;
      event.res.end("Not Modified (mtime)");
      return;
    }
  }
  if (asset.type) {
    event.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    event.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    event.res.setHeader("Last-Modified", asset.mtime);
  }
  const contents = await readAsset(id);
  event.res.end(contents);
});

const _lazy_252530 = () => import('../handlers/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _152570, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_252530, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_252530, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter();
  const routerOptions = createRouter$1({ routes: config.nitro.routes });
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    const referenceRoute = h.route.replace(/:\w+|\*\*/g, "_");
    const routeOptions = routerOptions.lookup(referenceRoute) || {};
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: "nitro/routes"
      });
    }
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(/\/+/g, "/");
      h3App.use(middlewareBase, handler);
    } else {
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(h3App.nodeHandler);
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, nitroApp.h3App.nodeHandler) : new Server$1(nitroApp.h3App.nodeHandler);
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const hostname = process.env.NITRO_HOST || process.env.HOST || "0.0.0.0";
server.listen(port, hostname, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  console.log(`Listening on ${protocol}://${hostname}:${port}${useRuntimeConfig().app.baseURL}`);
});
{
  process.on("unhandledRejection", (err) => console.error("[nitro] [dev] [unhandledRejection] " + err));
  process.on("uncaughtException", (err) => console.error("[nitro] [dev] [uncaughtException] " + err));
}
const nodeServer = {};

export { nodeServer as n, useRuntimeConfig as u };
//# sourceMappingURL=node-server.mjs.map
