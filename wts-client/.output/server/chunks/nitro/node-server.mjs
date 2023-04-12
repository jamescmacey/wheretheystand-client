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
    "mtime": "2023-04-12T09:36:02.941Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/_nuxt/ColourDot.95507605.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"70-DVHZDDJskcSpXbC3iRKfoYVQd5Q\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 112,
    "path": "../public/_nuxt/ColourDot.95507605.css"
  },
  "/_nuxt/ColourDot.b1c345ee.js": {
    "type": "application/javascript",
    "etag": "\"18c-AHNeaXnlIf6yvvE3MAy9dzumatc\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 396,
    "path": "../public/_nuxt/ColourDot.b1c345ee.js"
  },
  "/_nuxt/DisplayControlButton.6522af1d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a9-1bwff6e9xbcT31Pzpg0bjTEWNtQ\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 169,
    "path": "../public/_nuxt/DisplayControlButton.6522af1d.css"
  },
  "/_nuxt/DisplayControlButton.fa5edc75.js": {
    "type": "application/javascript",
    "etag": "\"119-L16xGEin1iuIsfRqAr6fS4AUeqw\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 281,
    "path": "../public/_nuxt/DisplayControlButton.fa5edc75.js"
  },
  "/_nuxt/ExternalLinkButton.3e80b7b6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5c-BI+cIsjrShhrwupv8PQ1tdBo9Kg\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 92,
    "path": "../public/_nuxt/ExternalLinkButton.3e80b7b6.css"
  },
  "/_nuxt/ExternalLinkButton.5b04b4e9.js": {
    "type": "application/javascript",
    "etag": "\"1d1-9VYp6KseV/SSiERLnFnJZ4N8XyY\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 465,
    "path": "../public/_nuxt/ExternalLinkButton.5b04b4e9.js"
  },
  "/_nuxt/Grid.fa1abbe7.js": {
    "type": "application/javascript",
    "etag": "\"23c-Ld8lLqgkvDpCTQeoNg/jniiQhlY\"",
    "mtime": "2023-04-12T09:36:02.940Z",
    "size": 572,
    "path": "../public/_nuxt/Grid.fa1abbe7.js"
  },
  "/_nuxt/PageHeader.63bfd911.js": {
    "type": "application/javascript",
    "etag": "\"a54-yDo2Q46B0pITRuxQf3Kr6h3o1bc\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 2644,
    "path": "../public/_nuxt/PageHeader.63bfd911.js"
  },
  "/_nuxt/PageHeader.aa400b41.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"171-fMyaezA3x5JXPS+jzgFNIoYsSAM\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 369,
    "path": "../public/_nuxt/PageHeader.aa400b41.css"
  },
  "/_nuxt/PartyCard.4337956d.js": {
    "type": "application/javascript",
    "etag": "\"2d7-ZoENw9nux6O3wKD3ehCXtjuj6v0\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 727,
    "path": "../public/_nuxt/PartyCard.4337956d.js"
  },
  "/_nuxt/PartyCard.f0c0625e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"95-B3ambjSYZl0tVU0+aJNJOmzkcvc\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 149,
    "path": "../public/_nuxt/PartyCard.f0c0625e.css"
  },
  "/_nuxt/PersonCard.b3e5e6be.js": {
    "type": "application/javascript",
    "etag": "\"509-W64Hy3hXtW1LB422P2qGkzQ9RqQ\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 1289,
    "path": "../public/_nuxt/PersonCard.b3e5e6be.js"
  },
  "/_nuxt/PersonCard.cb2455c4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"95-xn5E5mtSzCxOGEscdZ/NzdruWxQ\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 149,
    "path": "../public/_nuxt/PersonCard.cb2455c4.css"
  },
  "/_nuxt/PersonList.5ce8ebe9.js": {
    "type": "application/javascript",
    "etag": "\"634-xGgpk3f9edQfpaI87MNpd6e+HgA\"",
    "mtime": "2023-04-12T09:36:02.939Z",
    "size": 1588,
    "path": "../public/_nuxt/PersonList.5ce8ebe9.js"
  },
  "/_nuxt/PersonList.9b378e58.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"aa-ehQt4ctnVcRVN/4TSAeoddP0rqg\"",
    "mtime": "2023-04-12T09:36:02.938Z",
    "size": 170,
    "path": "../public/_nuxt/PersonList.9b378e58.css"
  },
  "/_nuxt/Spinner.fd0d777d.js": {
    "type": "application/javascript",
    "etag": "\"11b-bdq8wJxW4EhX0i/dZq9nUZmA0o8\"",
    "mtime": "2023-04-12T09:36:02.938Z",
    "size": 283,
    "path": "../public/_nuxt/Spinner.fd0d777d.js"
  },
  "/_nuxt/VoteSummary.4f064cb3.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5c-7rYJsEQUzidC7KxJ80hp7Mu9wx0\"",
    "mtime": "2023-04-12T09:36:02.938Z",
    "size": 92,
    "path": "../public/_nuxt/VoteSummary.4f064cb3.css"
  },
  "/_nuxt/VoteSummary.63429d7d.js": {
    "type": "application/javascript",
    "etag": "\"17e7-G0H2Ax7WJbBIts3F20oCQafgVuA\"",
    "mtime": "2023-04-12T09:36:02.938Z",
    "size": 6119,
    "path": "../public/_nuxt/VoteSummary.63429d7d.js"
  },
  "/_nuxt/_id_.29f297e7.js": {
    "type": "application/javascript",
    "etag": "\"562-bCJ4Nuii3tU3RszOaLJmCTlD2Ro\"",
    "mtime": "2023-04-12T09:36:02.938Z",
    "size": 1378,
    "path": "../public/_nuxt/_id_.29f297e7.js"
  },
  "/_nuxt/_id_.de0cd845.js": {
    "type": "application/javascript",
    "etag": "\"7eb-DcGseSIBIcMk4lKbNiV+ZA115xA\"",
    "mtime": "2023-04-12T09:36:02.938Z",
    "size": 2027,
    "path": "../public/_nuxt/_id_.de0cd845.js"
  },
  "/_nuxt/about.3c909174.js": {
    "type": "application/javascript",
    "etag": "\"d3a-y9Bo7p+ysykqPNbEKiCgwsQhDKM\"",
    "mtime": "2023-04-12T09:36:02.937Z",
    "size": 3386,
    "path": "../public/_nuxt/about.3c909174.js"
  },
  "/_nuxt/details.67e71f65.js": {
    "type": "application/javascript",
    "etag": "\"38c64-u+4KbYyT7zX6c9oUgnwpuqs9UsI\"",
    "mtime": "2023-04-12T09:36:02.937Z",
    "size": 232548,
    "path": "../public/_nuxt/details.67e71f65.js"
  },
  "/_nuxt/documents.fed04b3e.js": {
    "type": "application/javascript",
    "etag": "\"25f-AqeAfrsh51fzBhb8At1D1ucFoHo\"",
    "mtime": "2023-04-12T09:36:02.937Z",
    "size": 607,
    "path": "../public/_nuxt/documents.fed04b3e.js"
  },
  "/_nuxt/entry.bab167bf.js": {
    "type": "application/javascript",
    "etag": "\"5a6fa-Ceh1iPRk4mEPiLkvq2wEypQyNQY\"",
    "mtime": "2023-04-12T09:36:02.936Z",
    "size": 370426,
    "path": "../public/_nuxt/entry.bab167bf.js"
  },
  "/_nuxt/entry.cc34921e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"33b11-n2U2SW+uDvbS+ehqwQ/eIj2kwf4\"",
    "mtime": "2023-04-12T09:36:02.936Z",
    "size": 211729,
    "path": "../public/_nuxt/entry.cc34921e.css"
  },
  "/_nuxt/error-404.0ae4f97e.js": {
    "type": "application/javascript",
    "etag": "\"8a8-zF5IGWABXZBJpmCBQeXpH7So0pM\"",
    "mtime": "2023-04-12T09:36:02.936Z",
    "size": 2216,
    "path": "../public/_nuxt/error-404.0ae4f97e.js"
  },
  "/_nuxt/error-404.23f2309d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e2e-ivsbEmi48+s9HDOqtrSdWFvddYQ\"",
    "mtime": "2023-04-12T09:36:02.935Z",
    "size": 3630,
    "path": "../public/_nuxt/error-404.23f2309d.css"
  },
  "/_nuxt/error-500.83650425.js": {
    "type": "application/javascript",
    "etag": "\"756-vUaUcAizcGWFCM2/nUdSaQs7eKw\"",
    "mtime": "2023-04-12T09:36:02.935Z",
    "size": 1878,
    "path": "../public/_nuxt/error-500.83650425.js"
  },
  "/_nuxt/error-500.aa16ed4d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"79e-7j4Tsx89siDo85YoIs0XqsPWmPI\"",
    "mtime": "2023-04-12T09:36:02.935Z",
    "size": 1950,
    "path": "../public/_nuxt/error-500.aa16ed4d.css"
  },
  "/_nuxt/error-component.86aeb089.js": {
    "type": "application/javascript",
    "etag": "\"45e-MyBAnJ/xmq6RIea2OSd56l160RY\"",
    "mtime": "2023-04-12T09:36:02.935Z",
    "size": 1118,
    "path": "../public/_nuxt/error-component.86aeb089.js"
  },
  "/_nuxt/expenses.992e017a.js": {
    "type": "application/javascript",
    "etag": "\"115c-w+jZizTD0cuDDCLkDb1lURMx678\"",
    "mtime": "2023-04-12T09:36:02.934Z",
    "size": 4444,
    "path": "../public/_nuxt/expenses.992e017a.js"
  },
  "/_nuxt/groups.be48efa0.js": {
    "type": "application/javascript",
    "etag": "\"604-b5uCzP2/OV+BKrgX4ggE06o64LY\"",
    "mtime": "2023-04-12T09:36:02.934Z",
    "size": 1540,
    "path": "../public/_nuxt/groups.be48efa0.js"
  },
  "/_nuxt/index.01ab0f28.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"16c-pgOv+vYMZ4nbeWbfCe7CFXmloMQ\"",
    "mtime": "2023-04-12T09:36:02.934Z",
    "size": 364,
    "path": "../public/_nuxt/index.01ab0f28.css"
  },
  "/_nuxt/index.0ae60a9e.js": {
    "type": "application/javascript",
    "etag": "\"351f-v7t6tz49mjzFURTWoiGvVhQ/pWw\"",
    "mtime": "2023-04-12T09:36:02.934Z",
    "size": 13599,
    "path": "../public/_nuxt/index.0ae60a9e.js"
  },
  "/_nuxt/index.145ce648.js": {
    "type": "application/javascript",
    "etag": "\"1b9d0-mEtoFYpQ1OZsTwCz6sHTjCosrL0\"",
    "mtime": "2023-04-12T09:36:02.933Z",
    "size": 113104,
    "path": "../public/_nuxt/index.145ce648.js"
  },
  "/_nuxt/index.1f62c050.js": {
    "type": "application/javascript",
    "etag": "\"22f9-XTlUGGAIHsVaF8hEO/gRm56iKME\"",
    "mtime": "2023-04-12T09:36:02.933Z",
    "size": 8953,
    "path": "../public/_nuxt/index.1f62c050.js"
  },
  "/_nuxt/index.2db31af9.js": {
    "type": "application/javascript",
    "etag": "\"1e98-08Wv1vK8qBNxNFPnzzuDw0icgR0\"",
    "mtime": "2023-04-12T09:36:02.933Z",
    "size": 7832,
    "path": "../public/_nuxt/index.2db31af9.js"
  },
  "/_nuxt/index.33bc917c.js": {
    "type": "application/javascript",
    "etag": "\"38b9-42JqhhzyH5ETFVDc+87SRPwrfYI\"",
    "mtime": "2023-04-12T09:36:02.933Z",
    "size": 14521,
    "path": "../public/_nuxt/index.33bc917c.js"
  },
  "/_nuxt/index.58622fe6.js": {
    "type": "application/javascript",
    "etag": "\"2562-gVNiH/5BDHxSXrllU4lxQF8YCWU\"",
    "mtime": "2023-04-12T09:36:02.932Z",
    "size": 9570,
    "path": "../public/_nuxt/index.58622fe6.js"
  },
  "/_nuxt/index.7707a73d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"27e-kPVxCc9DMzmZ+9cAzgxLqBwMTmQ\"",
    "mtime": "2023-04-12T09:36:02.932Z",
    "size": 638,
    "path": "../public/_nuxt/index.7707a73d.css"
  },
  "/_nuxt/index.87738fa6.js": {
    "type": "application/javascript",
    "etag": "\"624-4CS9WbHjaliJu8fk6HqSn5VVNlM\"",
    "mtime": "2023-04-12T09:36:02.932Z",
    "size": 1572,
    "path": "../public/_nuxt/index.87738fa6.js"
  },
  "/_nuxt/index.9be365a7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"297-UdxNzYEWnXxwe4nPUEBGNAZpO84\"",
    "mtime": "2023-04-12T09:36:02.932Z",
    "size": 663,
    "path": "../public/_nuxt/index.9be365a7.css"
  },
  "/_nuxt/index.9ceb781e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ef-y8c60ofU+T4AMlBLubk5JMh8bJ0\"",
    "mtime": "2023-04-12T09:36:02.932Z",
    "size": 239,
    "path": "../public/_nuxt/index.9ceb781e.css"
  },
  "/_nuxt/index.a0cffd71.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"63-lXpRLmXxvYDcmti2ku6SpzUWlBw\"",
    "mtime": "2023-04-12T09:36:02.932Z",
    "size": 99,
    "path": "../public/_nuxt/index.a0cffd71.css"
  },
  "/_nuxt/index.a538a106.js": {
    "type": "application/javascript",
    "etag": "\"3f62-vcHr4CFx2U7NfDtSlPhPWy+9ol8\"",
    "mtime": "2023-04-12T09:36:02.931Z",
    "size": 16226,
    "path": "../public/_nuxt/index.a538a106.js"
  },
  "/_nuxt/index.a82b67d5.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"12b-XiDEXNt+K6Mhf8kDnEN9OtFcNeY\"",
    "mtime": "2023-04-12T09:36:02.931Z",
    "size": 299,
    "path": "../public/_nuxt/index.a82b67d5.css"
  },
  "/_nuxt/index.b243825a.js": {
    "type": "application/javascript",
    "etag": "\"6d7-7yOKIa5rsKsVB4dbPXwdNIT63UY\"",
    "mtime": "2023-04-12T09:36:02.931Z",
    "size": 1751,
    "path": "../public/_nuxt/index.b243825a.js"
  },
  "/_nuxt/index.b581b132.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"10a-zErM+C+yCR0ohXtX2TfEwJzycc8\"",
    "mtime": "2023-04-12T09:36:02.930Z",
    "size": 266,
    "path": "../public/_nuxt/index.b581b132.css"
  },
  "/_nuxt/index.b85c6916.js": {
    "type": "application/javascript",
    "etag": "\"a0-Yro467KnmGEugOsv3V9rcN3Yb3c\"",
    "mtime": "2023-04-12T09:36:02.930Z",
    "size": 160,
    "path": "../public/_nuxt/index.b85c6916.js"
  },
  "/_nuxt/index.c5224469.js": {
    "type": "application/javascript",
    "etag": "\"f01-306xN/8g25ML/UZCA6EXtASaa/k\"",
    "mtime": "2023-04-12T09:36:02.930Z",
    "size": 3841,
    "path": "../public/_nuxt/index.c5224469.js"
  },
  "/_nuxt/index.c88132ca.js": {
    "type": "application/javascript",
    "etag": "\"1774-/mSlQpMiHDXX9XBgxJBhKVS2v2s\"",
    "mtime": "2023-04-12T09:36:02.930Z",
    "size": 6004,
    "path": "../public/_nuxt/index.c88132ca.js"
  },
  "/_nuxt/index.cc6f46d1.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"df-NsmvwL1BGNFajTlCFNWzKfKQWrU\"",
    "mtime": "2023-04-12T09:36:02.929Z",
    "size": 223,
    "path": "../public/_nuxt/index.cc6f46d1.css"
  },
  "/_nuxt/index.dcb4ea67.js": {
    "type": "application/javascript",
    "etag": "\"a6f-K3OSGL2rKzU/ySbGP39r6daXnko\"",
    "mtime": "2023-04-12T09:36:02.929Z",
    "size": 2671,
    "path": "../public/_nuxt/index.dcb4ea67.js"
  },
  "/_nuxt/index.f6f071bb.js": {
    "type": "application/javascript",
    "etag": "\"ac5-8So8n1H7zt+88ENA9W4eWhtMlC4\"",
    "mtime": "2023-04-12T09:36:02.929Z",
    "size": 2757,
    "path": "../public/_nuxt/index.f6f071bb.js"
  },
  "/_nuxt/interests.7dd43f35.js": {
    "type": "application/javascript",
    "etag": "\"1037-vyGMvczZvcASnwPB+8hjTCezV6k\"",
    "mtime": "2023-04-12T09:36:02.928Z",
    "size": 4151,
    "path": "../public/_nuxt/interests.7dd43f35.js"
  },
  "/_nuxt/parties.29873277.js": {
    "type": "application/javascript",
    "etag": "\"610-VxS5wHfkG8AyXPM1oKs8mdF/ol0\"",
    "mtime": "2023-04-12T09:36:02.928Z",
    "size": 1552,
    "path": "../public/_nuxt/parties.29873277.js"
  },
  "/_nuxt/people.a813cf43.js": {
    "type": "application/javascript",
    "etag": "\"fe5-jTkn6aWS43IufzHr5tcfexHp64c\"",
    "mtime": "2023-04-12T09:36:02.928Z",
    "size": 4069,
    "path": "../public/_nuxt/people.a813cf43.js"
  },
  "/_nuxt/terms.80bacf36.js": {
    "type": "application/javascript",
    "etag": "\"165f-r2mCEtM16kg7tAVpcHNLo9OFRic\"",
    "mtime": "2023-04-12T09:36:02.927Z",
    "size": 5727,
    "path": "../public/_nuxt/terms.80bacf36.js"
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
