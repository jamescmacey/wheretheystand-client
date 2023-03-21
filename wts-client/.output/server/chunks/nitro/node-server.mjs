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
  "/_nuxt/ColourDot-c2be864e.mjs": {
    "type": "application/javascript",
    "etag": "\"18b-Li6lntqgFQGHz7fZ86VTNa21Xsw\"",
    "mtime": "2023-03-21T12:54:41.775Z",
    "path": "../public/_nuxt/ColourDot-c2be864e.mjs"
  },
  "/_nuxt/DisplayControlButton-6515c06f.mjs": {
    "type": "application/javascript",
    "etag": "\"118-zd9BIZoAWGBn83yM8WRCvDCz9yY\"",
    "mtime": "2023-03-21T12:54:41.775Z",
    "path": "../public/_nuxt/DisplayControlButton-6515c06f.mjs"
  },
  "/_nuxt/ExternalLinkButton-8ddc2159.mjs": {
    "type": "application/javascript",
    "etag": "\"1ef-z6Oczui6drkJ0Nyeegaf+T9DL2I\"",
    "mtime": "2023-03-21T12:54:41.775Z",
    "path": "../public/_nuxt/ExternalLinkButton-8ddc2159.mjs"
  },
  "/_nuxt/Grid-3a978f9e.mjs": {
    "type": "application/javascript",
    "etag": "\"23b-HALYHdqua0EJf398YyKHjcODZTU\"",
    "mtime": "2023-03-21T12:54:41.775Z",
    "path": "../public/_nuxt/Grid-3a978f9e.mjs"
  },
  "/_nuxt/PageHeader-d882b9c8.mjs": {
    "type": "application/javascript",
    "etag": "\"a4d-4jq/WSl2ZFK9DEkEmo7VN52rrNs\"",
    "mtime": "2023-03-21T12:54:41.774Z",
    "path": "../public/_nuxt/PageHeader-d882b9c8.mjs"
  },
  "/_nuxt/PartyCard-e8ee27e7.mjs": {
    "type": "application/javascript",
    "etag": "\"2d6-/ZUuc2NJI5fUwsFRLX1Qt0HqhoM\"",
    "mtime": "2023-03-21T12:54:41.774Z",
    "path": "../public/_nuxt/PartyCard-e8ee27e7.mjs"
  },
  "/_nuxt/PersonCard-9ebd8257.mjs": {
    "type": "application/javascript",
    "etag": "\"504-Xg6AiSlHUbYUxSBLBO7YZDWDIOk\"",
    "mtime": "2023-03-21T12:54:41.774Z",
    "path": "../public/_nuxt/PersonCard-9ebd8257.mjs"
  },
  "/_nuxt/PersonList-2e2876db.mjs": {
    "type": "application/javascript",
    "etag": "\"634-d8YvKadRO0dfys1qK2oHUa5BOZE\"",
    "mtime": "2023-03-21T12:54:41.774Z",
    "path": "../public/_nuxt/PersonList-2e2876db.mjs"
  },
  "/_nuxt/Spinner-9086acdb.mjs": {
    "type": "application/javascript",
    "etag": "\"11a-fPD0/1GnJbfeGaWp7Kd1foSN5vg\"",
    "mtime": "2023-03-21T12:54:41.773Z",
    "path": "../public/_nuxt/Spinner-9086acdb.mjs"
  },
  "/_nuxt/VoteSummary-e07b1212.mjs": {
    "type": "application/javascript",
    "etag": "\"17ec-eKSSVH0rMj7V46oBzU6R9hm464k\"",
    "mtime": "2023-03-21T12:54:41.771Z",
    "path": "../public/_nuxt/VoteSummary-e07b1212.mjs"
  },
  "/_nuxt/_id_-54f1e8e9.mjs": {
    "type": "application/javascript",
    "etag": "\"531-P8kiy5kBPV/GxhIqjC1ps6n5VHU\"",
    "mtime": "2023-03-21T12:54:41.767Z",
    "path": "../public/_nuxt/_id_-54f1e8e9.mjs"
  },
  "/_nuxt/_id_-b817de9b.mjs": {
    "type": "application/javascript",
    "etag": "\"7bb-LX10oAHo3hhl7TeRur5nCN9zQoU\"",
    "mtime": "2023-03-21T12:54:41.767Z",
    "path": "../public/_nuxt/_id_-b817de9b.mjs"
  },
  "/_nuxt/about-c3d21d31.mjs": {
    "type": "application/javascript",
    "etag": "\"d2f-t5HpGr/nW2xkR+CykvFCBfIVLbU\"",
    "mtime": "2023-03-21T12:54:41.767Z",
    "path": "../public/_nuxt/about-c3d21d31.mjs"
  },
  "/_nuxt/details-c9cb18ae.mjs": {
    "type": "application/javascript",
    "etag": "\"20f3-FCdeF8LY3+Lri53Hr9frEJBMUlY\"",
    "mtime": "2023-03-21T12:54:41.766Z",
    "path": "../public/_nuxt/details-c9cb18ae.mjs"
  },
  "/_nuxt/documents-dfcaf464.mjs": {
    "type": "application/javascript",
    "etag": "\"236-3sU4rAnwFOsnxbTyS/YiaVn4xAQ\"",
    "mtime": "2023-03-21T12:54:41.766Z",
    "path": "../public/_nuxt/documents-dfcaf464.mjs"
  },
  "/_nuxt/entry-4f6a8f6f.mjs": {
    "type": "application/javascript",
    "etag": "\"1a131f-nxw0QMVLoLgtnu9DZofF9IN9wLk\"",
    "mtime": "2023-03-21T12:54:41.766Z",
    "path": "../public/_nuxt/entry-4f6a8f6f.mjs"
  },
  "/_nuxt/entry.7f4e7ed8.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3a85a-ZEYeTDgw+E7XHH94jKCOoajXROE\"",
    "mtime": "2023-03-21T12:54:41.763Z",
    "path": "../public/_nuxt/entry.7f4e7ed8.css"
  },
  "/_nuxt/expenses-e61b2dea.mjs": {
    "type": "application/javascript",
    "etag": "\"113f-s7NBqoL+DwyfNpmhbm8ypz+NVyE\"",
    "mtime": "2023-03-21T12:54:41.763Z",
    "path": "../public/_nuxt/expenses-e61b2dea.mjs"
  },
  "/_nuxt/index-165a3d06.mjs": {
    "type": "application/javascript",
    "etag": "\"338b-FVfX+tlTHBheIjMxD791vfSCges\"",
    "mtime": "2023-03-21T12:54:41.762Z",
    "path": "../public/_nuxt/index-165a3d06.mjs"
  },
  "/_nuxt/index-2ca7a4d9.mjs": {
    "type": "application/javascript",
    "etag": "\"3966-DgsXI2xOCkG1h2kWqxMZ6DvIWwA\"",
    "mtime": "2023-03-21T12:54:41.762Z",
    "path": "../public/_nuxt/index-2ca7a4d9.mjs"
  },
  "/_nuxt/index-2d39c809.mjs": {
    "type": "application/javascript",
    "etag": "\"1e9b-idtgBbixB60l1M1+hnoim9SaIRM\"",
    "mtime": "2023-03-21T12:54:41.762Z",
    "path": "../public/_nuxt/index-2d39c809.mjs"
  },
  "/_nuxt/index-2fc87c0d.mjs": {
    "type": "application/javascript",
    "etag": "\"ecc-yAdPBxhTacw7jft0rAZfRX2dN/w\"",
    "mtime": "2023-03-21T12:54:41.762Z",
    "path": "../public/_nuxt/index-2fc87c0d.mjs"
  },
  "/_nuxt/index-31b46174.mjs": {
    "type": "application/javascript",
    "etag": "\"4026-VtPBP1SBpiZov3v+qSOyenSJ6lc\"",
    "mtime": "2023-03-21T12:54:41.761Z",
    "path": "../public/_nuxt/index-31b46174.mjs"
  },
  "/_nuxt/index-5105d2ca.mjs": {
    "type": "application/javascript",
    "etag": "\"2107-6SGrke0esez4RyOQnse5zS4PWZs\"",
    "mtime": "2023-03-21T12:54:41.761Z",
    "path": "../public/_nuxt/index-5105d2ca.mjs"
  },
  "/_nuxt/index-73ae3c28.mjs": {
    "type": "application/javascript",
    "etag": "\"a82-T+foMGoxC5KwL0i7/smkIWUEOEM\"",
    "mtime": "2023-03-21T12:54:41.761Z",
    "path": "../public/_nuxt/index-73ae3c28.mjs"
  },
  "/_nuxt/index-904253b0.mjs": {
    "type": "application/javascript",
    "etag": "\"21bf-JunJV/CtthJQzsH8U0T4eQD+I4w\"",
    "mtime": "2023-03-21T12:54:41.760Z",
    "path": "../public/_nuxt/index-904253b0.mjs"
  },
  "/_nuxt/index-babbdece.mjs": {
    "type": "application/javascript",
    "etag": "\"5bc-OrqG6iSGCEQdDcN0bmtOX/PP+ec\"",
    "mtime": "2023-03-21T12:54:41.760Z",
    "path": "../public/_nuxt/index-babbdece.mjs"
  },
  "/_nuxt/index-c2297665.mjs": {
    "type": "application/javascript",
    "etag": "\"1849-6bGx5KCMH6ML6pX2+7AjcaPUU4w\"",
    "mtime": "2023-03-21T12:54:41.759Z",
    "path": "../public/_nuxt/index-c2297665.mjs"
  },
  "/_nuxt/index-c3519071.mjs": {
    "type": "application/javascript",
    "etag": "\"696-hpkHOJnU2vgLljfVH/eUN79pl+I\"",
    "mtime": "2023-03-21T12:54:41.759Z",
    "path": "../public/_nuxt/index-c3519071.mjs"
  },
  "/_nuxt/index-e53ea8dd.mjs": {
    "type": "application/javascript",
    "etag": "\"a8d-sAbgvJlF0MsWVieVJJ+f0+F8cgg\"",
    "mtime": "2023-03-21T12:54:41.759Z",
    "path": "../public/_nuxt/index-e53ea8dd.mjs"
  },
  "/_nuxt/interests-f4bf0ac6.mjs": {
    "type": "application/javascript",
    "etag": "\"ff8-ungd2z/K2WiqrQjp+AWmbVMDJs8\"",
    "mtime": "2023-03-21T12:54:41.759Z",
    "path": "../public/_nuxt/interests-f4bf0ac6.mjs"
  },
  "/_nuxt/manifest.json": {
    "type": "application/json",
    "etag": "\"1f8f-LCWvzbaZgqC/ULFpxx3QNbVswEs\"",
    "mtime": "2023-03-21T12:54:41.758Z",
    "path": "../public/_nuxt/manifest.json"
  },
  "/_nuxt/terms-ecb6b383.mjs": {
    "type": "application/javascript",
    "etag": "\"166d-05GEVEZ9ZG1T1aaktbzxxGlI+jQ\"",
    "mtime": "2023-03-21T12:54:41.758Z",
    "path": "../public/_nuxt/terms-ecb6b383.mjs"
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
