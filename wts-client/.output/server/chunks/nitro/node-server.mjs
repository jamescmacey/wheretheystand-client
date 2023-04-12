globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'node:http';
import { Server } from 'node:https';
import destr from 'destr';
import { defineEventHandler, handleCacheHeaders, createEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseStatus, setResponseHeader, getRequestHeaders, createError, createApp, createRouter as createRouter$1, toNodeListener, fetchWithEvent, lazyEventHandler } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ofetch';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import defu, { defuFn } from 'defu';
import { hash } from 'ohash';
import { parseURL, withoutBase, joinURL, withQuery, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { createStorage, prefixStorage } from 'unstorage';
import { toRouteMatcher, createRouter } from 'radix3';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'pathe';

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":""},"nitro":{"envPrefix":"NUXT_","routeRules":{"/__nuxt_error":{"cache":false},"/_nuxt/**":{"headers":{"cache-control":"public, max-age=31536000, immutable"}}}},"public":{}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
overrideConfig(_runtimeConfig);
const runtimeConfig = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => runtimeConfig;
deepFreeze(appConfig);
function getEnv(key) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]
  );
}
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

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
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

storage.mount('/assets', assets$1);

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  const validate = opts.validate || (() => true);
  async function get(key, resolver, shouldInvalidateCache) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || !validate(entry);
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry)) {
          useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = opts.shouldInvalidateCache?.(...args);
    const entry = await get(key, () => fn(...args), shouldInvalidateCache);
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return key.replace(/[^\dA-Za-z]/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const key = await opts.getKey?.(event);
      if (key) {
        return escapeKey(key);
      }
      const url = event.node.req.originalUrl || event.node.req.url;
      const friendlyName = escapeKey(decodeURI(parseURL(url).pathname)).slice(
        0,
        16
      );
      const urlHash = hash(url);
      return `${friendlyName}.${urlHash}`;
    },
    validate: (entry) => {
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: [opts.integrity, handler]
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const reqProxy = cloneWithProxy(incomingEvent.node.req, { headers: {} });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
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
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            for (const header in headers2) {
              this.setHeader(header, headers2[header]);
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.context = incomingEvent.context;
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = headers.Etag || headers.etag || `W/"${hash(body)}"`;
      headers["last-modified"] = headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString();
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
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      event.node.res.setHeader(name, response.headers[name]);
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

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler() {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      return sendRedirect(
        event,
        routeRules.redirect.to,
        routeRules.redirect.statusCode
      );
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      }
      return proxyRequest(event, target, {
        fetch: $fetch.raw,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    const path = new URL(event.node.req.url, "http://localhost").pathname;
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(path, useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const plugins = [
  
];

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function normalizeError(error) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.node.req.url,
    statusCode,
    statusMessage,
    message,
    stack: "",
    data: error.data
  };
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    event.node.res.end(JSON.stringify(errorObject));
    return;
  }
  const isErrorPage = event.node.req.url?.startsWith("/__nuxt_error");
  const res = !isErrorPage ? await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig().app.baseURL, "/__nuxt_error"), errorObject), {
    headers: getRequestHeaders(event),
    redirect: "manual"
  }).catch(() => null) : null;
  if (!res) {
    const { template } = await import('../error-500.mjs');
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    event.node.res.end(template(errorObject));
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  event.node.res.end(await res.text());
});

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-n8egyE9tcb7sKGr/pYCaQ4uWqxI\"",
    "mtime": "2023-04-12T06:39:24.395Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/_nuxt/ColourDot.5228b2ad.js": {
    "type": "application/javascript",
    "etag": "\"18c-VqeK+JbvSnGWqgla4jD2VeS6qLM\"",
    "mtime": "2023-04-12T06:39:24.395Z",
    "size": 396,
    "path": "../public/_nuxt/ColourDot.5228b2ad.js"
  },
  "/_nuxt/ColourDot.95507605.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"70-DVHZDDJskcSpXbC3iRKfoYVQd5Q\"",
    "mtime": "2023-04-12T06:39:24.395Z",
    "size": 112,
    "path": "../public/_nuxt/ColourDot.95507605.css"
  },
  "/_nuxt/DisplayControlButton.07f99396.js": {
    "type": "application/javascript",
    "etag": "\"119-KRiMoeCr2KusOAn0k2ikLtwOrmw\"",
    "mtime": "2023-04-12T06:39:24.394Z",
    "size": 281,
    "path": "../public/_nuxt/DisplayControlButton.07f99396.js"
  },
  "/_nuxt/DisplayControlButton.6522af1d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a9-1bwff6e9xbcT31Pzpg0bjTEWNtQ\"",
    "mtime": "2023-04-12T06:39:24.394Z",
    "size": 169,
    "path": "../public/_nuxt/DisplayControlButton.6522af1d.css"
  },
  "/_nuxt/ExternalLinkButton.3e80b7b6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5c-BI+cIsjrShhrwupv8PQ1tdBo9Kg\"",
    "mtime": "2023-04-12T06:39:24.394Z",
    "size": 92,
    "path": "../public/_nuxt/ExternalLinkButton.3e80b7b6.css"
  },
  "/_nuxt/ExternalLinkButton.a4f7276e.js": {
    "type": "application/javascript",
    "etag": "\"1d1-iBXlJLEMKKFE5Q1Cqm4/GFgKFes\"",
    "mtime": "2023-04-12T06:39:24.394Z",
    "size": 465,
    "path": "../public/_nuxt/ExternalLinkButton.a4f7276e.js"
  },
  "/_nuxt/Grid.9ffebfcd.js": {
    "type": "application/javascript",
    "etag": "\"23c-62qZCG2ZxvhadUAR7BSwVaBd43Y\"",
    "mtime": "2023-04-12T06:39:24.394Z",
    "size": 572,
    "path": "../public/_nuxt/Grid.9ffebfcd.js"
  },
  "/_nuxt/PageHeader.8a2871a7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"142-e2Dwwb4NT8XVG2v0LYd4gWHqHuo\"",
    "mtime": "2023-04-12T06:39:24.394Z",
    "size": 322,
    "path": "../public/_nuxt/PageHeader.8a2871a7.css"
  },
  "/_nuxt/PageHeader.f960e25b.js": {
    "type": "application/javascript",
    "etag": "\"a60-yvpn1Vk4B73helDY80TOGCGcpGE\"",
    "mtime": "2023-04-12T06:39:24.393Z",
    "size": 2656,
    "path": "../public/_nuxt/PageHeader.f960e25b.js"
  },
  "/_nuxt/PartyCard.75b3bc9e.js": {
    "type": "application/javascript",
    "etag": "\"2d7-qkV3x8BL7WzUuNRSlNvzSUBInyc\"",
    "mtime": "2023-04-12T06:39:24.393Z",
    "size": 727,
    "path": "../public/_nuxt/PartyCard.75b3bc9e.js"
  },
  "/_nuxt/PartyCard.f0c0625e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"95-B3ambjSYZl0tVU0+aJNJOmzkcvc\"",
    "mtime": "2023-04-12T06:39:24.393Z",
    "size": 149,
    "path": "../public/_nuxt/PartyCard.f0c0625e.css"
  },
  "/_nuxt/PersonCard.92a75652.js": {
    "type": "application/javascript",
    "etag": "\"509-Cc/thdTMVK9vhWwh2t81C7f6kR8\"",
    "mtime": "2023-04-12T06:39:24.393Z",
    "size": 1289,
    "path": "../public/_nuxt/PersonCard.92a75652.js"
  },
  "/_nuxt/PersonCard.cb2455c4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"95-xn5E5mtSzCxOGEscdZ/NzdruWxQ\"",
    "mtime": "2023-04-12T06:39:24.393Z",
    "size": 149,
    "path": "../public/_nuxt/PersonCard.cb2455c4.css"
  },
  "/_nuxt/PersonList.51ce97e4.js": {
    "type": "application/javascript",
    "etag": "\"634-cTrXGnXi2horC6hXy1/XskhNh4M\"",
    "mtime": "2023-04-12T06:39:24.392Z",
    "size": 1588,
    "path": "../public/_nuxt/PersonList.51ce97e4.js"
  },
  "/_nuxt/PersonList.9b378e58.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"aa-ehQt4ctnVcRVN/4TSAeoddP0rqg\"",
    "mtime": "2023-04-12T06:39:24.392Z",
    "size": 170,
    "path": "../public/_nuxt/PersonList.9b378e58.css"
  },
  "/_nuxt/Spinner.5967ecad.js": {
    "type": "application/javascript",
    "etag": "\"11b-oLtEX4pFSeRxAOqDKsvqqglGJuY\"",
    "mtime": "2023-04-12T06:39:24.392Z",
    "size": 283,
    "path": "../public/_nuxt/Spinner.5967ecad.js"
  },
  "/_nuxt/VoteSummary.4f064cb3.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5c-7rYJsEQUzidC7KxJ80hp7Mu9wx0\"",
    "mtime": "2023-04-12T06:39:24.392Z",
    "size": 92,
    "path": "../public/_nuxt/VoteSummary.4f064cb3.css"
  },
  "/_nuxt/VoteSummary.75538177.js": {
    "type": "application/javascript",
    "etag": "\"17e7-Kzz1qbw/3gcKcfgo8iQ7wBIH/rA\"",
    "mtime": "2023-04-12T06:39:24.392Z",
    "size": 6119,
    "path": "../public/_nuxt/VoteSummary.75538177.js"
  },
  "/_nuxt/_id_.1d492864.js": {
    "type": "application/javascript",
    "etag": "\"562-PoXCGwOKEOu/lV/VfcFYl4V6QzE\"",
    "mtime": "2023-04-12T06:39:24.391Z",
    "size": 1378,
    "path": "../public/_nuxt/_id_.1d492864.js"
  },
  "/_nuxt/_id_.b4dec851.js": {
    "type": "application/javascript",
    "etag": "\"7eb-xHSim0hApVPt76896dTDvFP3Sgk\"",
    "mtime": "2023-04-12T06:39:24.391Z",
    "size": 2027,
    "path": "../public/_nuxt/_id_.b4dec851.js"
  },
  "/_nuxt/about.a68f3b0c.js": {
    "type": "application/javascript",
    "etag": "\"d3a-iw1c28ltMd9/CMLGbGdGcjKvqs4\"",
    "mtime": "2023-04-12T06:39:24.391Z",
    "size": 3386,
    "path": "../public/_nuxt/about.a68f3b0c.js"
  },
  "/_nuxt/details.de377075.js": {
    "type": "application/javascript",
    "etag": "\"38c64-WEyj1St5iluHDXKGDd/p73xmaYE\"",
    "mtime": "2023-04-12T06:39:24.391Z",
    "size": 232548,
    "path": "../public/_nuxt/details.de377075.js"
  },
  "/_nuxt/documents.24d210fa.js": {
    "type": "application/javascript",
    "etag": "\"25f-QMktAD4kx0dX5nQW8X7ENw24rqE\"",
    "mtime": "2023-04-12T06:39:24.391Z",
    "size": 607,
    "path": "../public/_nuxt/documents.24d210fa.js"
  },
  "/_nuxt/entry.cc34921e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"33b11-n2U2SW+uDvbS+ehqwQ/eIj2kwf4\"",
    "mtime": "2023-04-12T06:39:24.390Z",
    "size": 211729,
    "path": "../public/_nuxt/entry.cc34921e.css"
  },
  "/_nuxt/entry.fe9423a6.js": {
    "type": "application/javascript",
    "etag": "\"5a6fa-nM6ERbFWbeX84QTAJIeXIQsnW40\"",
    "mtime": "2023-04-12T06:39:24.390Z",
    "size": 370426,
    "path": "../public/_nuxt/entry.fe9423a6.js"
  },
  "/_nuxt/error-404.23f2309d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e2e-ivsbEmi48+s9HDOqtrSdWFvddYQ\"",
    "mtime": "2023-04-12T06:39:24.390Z",
    "size": 3630,
    "path": "../public/_nuxt/error-404.23f2309d.css"
  },
  "/_nuxt/error-404.f93a554c.js": {
    "type": "application/javascript",
    "etag": "\"8a8-Dr0SkrnIjtBdKmXTDuFB//YgtM0\"",
    "mtime": "2023-04-12T06:39:24.390Z",
    "size": 2216,
    "path": "../public/_nuxt/error-404.f93a554c.js"
  },
  "/_nuxt/error-500.7af56a4e.js": {
    "type": "application/javascript",
    "etag": "\"756-oV9bER+F5bI/cqL4V+gV7U41TX8\"",
    "mtime": "2023-04-12T06:39:24.389Z",
    "size": 1878,
    "path": "../public/_nuxt/error-500.7af56a4e.js"
  },
  "/_nuxt/error-500.aa16ed4d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"79e-7j4Tsx89siDo85YoIs0XqsPWmPI\"",
    "mtime": "2023-04-12T06:39:24.389Z",
    "size": 1950,
    "path": "../public/_nuxt/error-500.aa16ed4d.css"
  },
  "/_nuxt/error-component.2a1bb5b4.js": {
    "type": "application/javascript",
    "etag": "\"45e-O8YsFcwiFsPB8T856s2jzgrgD+0\"",
    "mtime": "2023-04-12T06:39:24.389Z",
    "size": 1118,
    "path": "../public/_nuxt/error-component.2a1bb5b4.js"
  },
  "/_nuxt/expenses.eb559fbc.js": {
    "type": "application/javascript",
    "etag": "\"115c-VlSaY3n5+NbdT1RQhytz4bhTezA\"",
    "mtime": "2023-04-12T06:39:24.389Z",
    "size": 4444,
    "path": "../public/_nuxt/expenses.eb559fbc.js"
  },
  "/_nuxt/groups.fc3c4030.js": {
    "type": "application/javascript",
    "etag": "\"604-LjyTDejs1s1RTnIG9S9//RwcJtE\"",
    "mtime": "2023-04-12T06:39:24.389Z",
    "size": 1540,
    "path": "../public/_nuxt/groups.fc3c4030.js"
  },
  "/_nuxt/index.05930cb8.js": {
    "type": "application/javascript",
    "etag": "\"2562-XwjbOjdzPVNupysRd2FOmSK+7OY\"",
    "mtime": "2023-04-12T06:39:24.388Z",
    "size": 9570,
    "path": "../public/_nuxt/index.05930cb8.js"
  },
  "/_nuxt/index.145ce648.js": {
    "type": "application/javascript",
    "etag": "\"1b9d0-mEtoFYpQ1OZsTwCz6sHTjCosrL0\"",
    "mtime": "2023-04-12T06:39:24.388Z",
    "size": 113104,
    "path": "../public/_nuxt/index.145ce648.js"
  },
  "/_nuxt/index.1b9ac76e.js": {
    "type": "application/javascript",
    "etag": "\"f01-sxHWEcDIayLF8yR8mSB8c9baqLE\"",
    "mtime": "2023-04-12T06:39:24.388Z",
    "size": 3841,
    "path": "../public/_nuxt/index.1b9ac76e.js"
  },
  "/_nuxt/index.69d5713b.js": {
    "type": "application/javascript",
    "etag": "\"6d7-beZPPzCTKfLLc6/Zp7zzXj8Sbqk\"",
    "mtime": "2023-04-12T06:39:24.388Z",
    "size": 1751,
    "path": "../public/_nuxt/index.69d5713b.js"
  },
  "/_nuxt/index.69dfb849.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"16c-BjmqKqtDYfjiwV5upE/w5p//zRk\"",
    "mtime": "2023-04-12T06:39:24.387Z",
    "size": 364,
    "path": "../public/_nuxt/index.69dfb849.css"
  },
  "/_nuxt/index.7707a73d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"27e-kPVxCc9DMzmZ+9cAzgxLqBwMTmQ\"",
    "mtime": "2023-04-12T06:39:24.387Z",
    "size": 638,
    "path": "../public/_nuxt/index.7707a73d.css"
  },
  "/_nuxt/index.93be5fdf.js": {
    "type": "application/javascript",
    "etag": "\"1e98-aU1JbmhI/m1F60IZj5qCpVlBYe8\"",
    "mtime": "2023-04-12T06:39:24.387Z",
    "size": 7832,
    "path": "../public/_nuxt/index.93be5fdf.js"
  },
  "/_nuxt/index.9be365a7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"297-UdxNzYEWnXxwe4nPUEBGNAZpO84\"",
    "mtime": "2023-04-12T06:39:24.387Z",
    "size": 663,
    "path": "../public/_nuxt/index.9be365a7.css"
  },
  "/_nuxt/index.9ceb781e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ef-y8c60ofU+T4AMlBLubk5JMh8bJ0\"",
    "mtime": "2023-04-12T06:39:24.387Z",
    "size": 239,
    "path": "../public/_nuxt/index.9ceb781e.css"
  },
  "/_nuxt/index.a0cffd71.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"63-lXpRLmXxvYDcmti2ku6SpzUWlBw\"",
    "mtime": "2023-04-12T06:39:24.386Z",
    "size": 99,
    "path": "../public/_nuxt/index.a0cffd71.css"
  },
  "/_nuxt/index.a507f1db.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"12b-DpFbs0Y4gmucfyA3F5ZIEgkz9rM\"",
    "mtime": "2023-04-12T06:39:24.386Z",
    "size": 299,
    "path": "../public/_nuxt/index.a507f1db.css"
  },
  "/_nuxt/index.aa32fd36.js": {
    "type": "application/javascript",
    "etag": "\"ac5-Oe2RGZ8ODzegtbJIk7TqtrHFL1s\"",
    "mtime": "2023-04-12T06:39:24.386Z",
    "size": 2757,
    "path": "../public/_nuxt/index.aa32fd36.js"
  },
  "/_nuxt/index.b09a20d7.js": {
    "type": "application/javascript",
    "etag": "\"381e-gCgMsnv8KXvqOhz8aPj6HtMMN2c\"",
    "mtime": "2023-04-12T06:39:24.386Z",
    "size": 14366,
    "path": "../public/_nuxt/index.b09a20d7.js"
  },
  "/_nuxt/index.b581b132.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"10a-zErM+C+yCR0ohXtX2TfEwJzycc8\"",
    "mtime": "2023-04-12T06:39:24.385Z",
    "size": 266,
    "path": "../public/_nuxt/index.b581b132.css"
  },
  "/_nuxt/index.b85c6916.js": {
    "type": "application/javascript",
    "etag": "\"a0-Yro467KnmGEugOsv3V9rcN3Yb3c\"",
    "mtime": "2023-04-12T06:39:24.385Z",
    "size": 160,
    "path": "../public/_nuxt/index.b85c6916.js"
  },
  "/_nuxt/index.ba2571a6.js": {
    "type": "application/javascript",
    "etag": "\"351f-6GTvjIuutI9NGgzVz+6JBR64jaA\"",
    "mtime": "2023-04-12T06:39:24.385Z",
    "size": 13599,
    "path": "../public/_nuxt/index.ba2571a6.js"
  },
  "/_nuxt/index.bbbf06c2.js": {
    "type": "application/javascript",
    "etag": "\"3f04-g4ASBZGN5vKQhCbXJGcSb23wiSg\"",
    "mtime": "2023-04-12T06:39:24.385Z",
    "size": 16132,
    "path": "../public/_nuxt/index.bbbf06c2.js"
  },
  "/_nuxt/index.cc6f46d1.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"df-NsmvwL1BGNFajTlCFNWzKfKQWrU\"",
    "mtime": "2023-04-12T06:39:24.384Z",
    "size": 223,
    "path": "../public/_nuxt/index.cc6f46d1.css"
  },
  "/_nuxt/index.dcb4ea67.js": {
    "type": "application/javascript",
    "etag": "\"a6f-K3OSGL2rKzU/ySbGP39r6daXnko\"",
    "mtime": "2023-04-12T06:39:24.384Z",
    "size": 2671,
    "path": "../public/_nuxt/index.dcb4ea67.js"
  },
  "/_nuxt/index.e8c02293.js": {
    "type": "application/javascript",
    "etag": "\"5de-/gEpmfLJTvDiNbcwnJUefTLM0Y0\"",
    "mtime": "2023-04-12T06:39:24.383Z",
    "size": 1502,
    "path": "../public/_nuxt/index.e8c02293.js"
  },
  "/_nuxt/index.ed1cd21b.js": {
    "type": "application/javascript",
    "etag": "\"1774-jKyMuLmDZuF6n4Wzd8O7YRtMR70\"",
    "mtime": "2023-04-12T06:39:24.383Z",
    "size": 6004,
    "path": "../public/_nuxt/index.ed1cd21b.js"
  },
  "/_nuxt/index.f7e14229.js": {
    "type": "application/javascript",
    "etag": "\"22f9-Sk0TRz7exyxPDN2P4WYEePu8zd0\"",
    "mtime": "2023-04-12T06:39:24.383Z",
    "size": 8953,
    "path": "../public/_nuxt/index.f7e14229.js"
  },
  "/_nuxt/interests.0b5b831e.js": {
    "type": "application/javascript",
    "etag": "\"1037-VStQVP9ImZKBGRPdRLwE1g7U93I\"",
    "mtime": "2023-04-12T06:39:24.382Z",
    "size": 4151,
    "path": "../public/_nuxt/interests.0b5b831e.js"
  },
  "/_nuxt/parties.997061f3.js": {
    "type": "application/javascript",
    "etag": "\"610-2vAfHOCQ4MgcDppQltLL/H2liIw\"",
    "mtime": "2023-04-12T06:39:24.381Z",
    "size": 1552,
    "path": "../public/_nuxt/parties.997061f3.js"
  },
  "/_nuxt/people.a2709c8c.js": {
    "type": "application/javascript",
    "etag": "\"fe5-As6P8lrqkQjlzdqZotPUmh5YcjI\"",
    "mtime": "2023-04-12T06:39:24.381Z",
    "size": 4069,
    "path": "../public/_nuxt/people.a2709c8c.js"
  },
  "/_nuxt/terms.7d3d139f.js": {
    "type": "application/javascript",
    "etag": "\"165f-QwOd3usYXmKSGiVwZGsBsa15hQU\"",
    "mtime": "2023-04-12T06:39:24.380Z",
    "size": 5727,
    "path": "../public/_nuxt/terms.7d3d139f.js"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.node.req.method && !METHODS.has(event.node.req.method)) {
    return;
  }
  let id = decodeURIComponent(
    withLeadingSlash(
      withoutTrailingSlash(parseURL(event.node.req.url).pathname)
    )
  );
  let asset;
  const encodingHeader = String(
    event.node.req.headers["accept-encoding"] || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    event.node.res.setHeader("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.node.res.removeHeader("cache-control");
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.node.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return;
  }
  const ifModifiedSinceH = event.node.req.headers["if-modified-since"];
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return;
  }
  if (asset.type && !event.node.res.getHeader("Content-Type")) {
    event.node.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag && !event.node.res.getHeader("ETag")) {
    event.node.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime && !event.node.res.getHeader("Last-Modified")) {
    event.node.res.setHeader("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.node.res.getHeader("Content-Encoding")) {
    event.node.res.setHeader("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.node.res.getHeader("Content-Length")) {
    event.node.res.setHeader("Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_D4qlkt = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_D4qlkt, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_D4qlkt, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  const router = createRouter$1();
  h3App.use(createRouteRulesHandler());
  const localCall = createCall(toNodeListener(h3App));
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(
    eventHandler((event) => {
      const envContext = event.node.req.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: $fetch });
    })
  );
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
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
const useNitroApp = () => nitroApp;

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const s = server.listen(port, host, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const i = s.address();
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${i.family === "IPv6" ? `[${i.address}]` : i.address}:${i.port}${baseURL}`;
  console.log(`Listening ${url}`);
});
{
  process.on(
    "unhandledRejection",
    (err) => console.error("[nitro] [dev] [unhandledRejection] " + err)
  );
  process.on(
    "uncaughtException",
    (err) => console.error("[nitro] [dev] [uncaughtException] " + err)
  );
}
const nodeServer = {};

export { useRuntimeConfig as a, getRouteRules as g, nodeServer as n, useNitroApp as u };
//# sourceMappingURL=node-server.mjs.map
