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
    "mtime": "2023-05-25T06:26:39.587Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/_nuxt/ColourDot.8e64cad0.js": {
    "type": "application/javascript",
    "etag": "\"18c-KCWfQCAgIXuepq+n1NAjkNC0LU4\"",
    "mtime": "2023-05-25T06:26:39.586Z",
    "size": 396,
    "path": "../public/_nuxt/ColourDot.8e64cad0.js"
  },
  "/_nuxt/ColourDot.95507605.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"70-DVHZDDJskcSpXbC3iRKfoYVQd5Q\"",
    "mtime": "2023-05-25T06:26:39.586Z",
    "size": 112,
    "path": "../public/_nuxt/ColourDot.95507605.css"
  },
  "/_nuxt/DisplayControlButton.6522af1d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a9-1bwff6e9xbcT31Pzpg0bjTEWNtQ\"",
    "mtime": "2023-05-25T06:26:39.586Z",
    "size": 169,
    "path": "../public/_nuxt/DisplayControlButton.6522af1d.css"
  },
  "/_nuxt/DisplayControlButton.fc203166.js": {
    "type": "application/javascript",
    "etag": "\"119-ti39/nKIxCOnlVhH9IwTsK1Nn8k\"",
    "mtime": "2023-05-25T06:26:39.586Z",
    "size": 281,
    "path": "../public/_nuxt/DisplayControlButton.fc203166.js"
  },
  "/_nuxt/ExternalLinkButton.3e80b7b6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5c-BI+cIsjrShhrwupv8PQ1tdBo9Kg\"",
    "mtime": "2023-05-25T06:26:39.585Z",
    "size": 92,
    "path": "../public/_nuxt/ExternalLinkButton.3e80b7b6.css"
  },
  "/_nuxt/ExternalLinkButton.a5ef8b90.js": {
    "type": "application/javascript",
    "etag": "\"1d1-G+ittFnYL+JMrlHKRi18rPoxB0c\"",
    "mtime": "2023-05-25T06:26:39.585Z",
    "size": 465,
    "path": "../public/_nuxt/ExternalLinkButton.a5ef8b90.js"
  },
  "/_nuxt/Grid.68f5aa08.js": {
    "type": "application/javascript",
    "etag": "\"23c-QCUUp7UdLTJFIV/Po1NHyV7x7PQ\"",
    "mtime": "2023-05-25T06:26:39.585Z",
    "size": 572,
    "path": "../public/_nuxt/Grid.68f5aa08.js"
  },
  "/_nuxt/PageHeader.89256eba.js": {
    "type": "application/javascript",
    "etag": "\"a5a-hm4srv7FQaYFg7oFnplCDc66oEI\"",
    "mtime": "2023-05-25T06:26:39.585Z",
    "size": 2650,
    "path": "../public/_nuxt/PageHeader.89256eba.js"
  },
  "/_nuxt/PageHeader.aa400b41.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"171-fMyaezA3x5JXPS+jzgFNIoYsSAM\"",
    "mtime": "2023-05-25T06:26:39.585Z",
    "size": 369,
    "path": "../public/_nuxt/PageHeader.aa400b41.css"
  },
  "/_nuxt/PartyCard.f0c0625e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"95-B3ambjSYZl0tVU0+aJNJOmzkcvc\"",
    "mtime": "2023-05-25T06:26:39.584Z",
    "size": 149,
    "path": "../public/_nuxt/PartyCard.f0c0625e.css"
  },
  "/_nuxt/PartyCard.fa2b74c9.js": {
    "type": "application/javascript",
    "etag": "\"2d7-VztI7DsL/lwEtf53Z3cTKnLnUh0\"",
    "mtime": "2023-05-25T06:26:39.584Z",
    "size": 727,
    "path": "../public/_nuxt/PartyCard.fa2b74c9.js"
  },
  "/_nuxt/PersonCard.c671fa48.js": {
    "type": "application/javascript",
    "etag": "\"509-iacqPIrSohaRoUKLyMzq/SDmk+c\"",
    "mtime": "2023-05-25T06:26:39.584Z",
    "size": 1289,
    "path": "../public/_nuxt/PersonCard.c671fa48.js"
  },
  "/_nuxt/PersonCard.cb2455c4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"95-xn5E5mtSzCxOGEscdZ/NzdruWxQ\"",
    "mtime": "2023-05-25T06:26:39.584Z",
    "size": 149,
    "path": "../public/_nuxt/PersonCard.cb2455c4.css"
  },
  "/_nuxt/PersonList.17cdef05.js": {
    "type": "application/javascript",
    "etag": "\"62f-B6Y0bk+VMafHD3E99FkI6WBpr2w\"",
    "mtime": "2023-05-25T06:26:39.583Z",
    "size": 1583,
    "path": "../public/_nuxt/PersonList.17cdef05.js"
  },
  "/_nuxt/PersonList.9b378e58.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"aa-ehQt4ctnVcRVN/4TSAeoddP0rqg\"",
    "mtime": "2023-05-25T06:26:39.583Z",
    "size": 170,
    "path": "../public/_nuxt/PersonList.9b378e58.css"
  },
  "/_nuxt/Spinner.4905d90a.js": {
    "type": "application/javascript",
    "etag": "\"11b-FVYbQy0FLx5xn99ErzHo3U8CFEg\"",
    "mtime": "2023-05-25T06:26:39.583Z",
    "size": 283,
    "path": "../public/_nuxt/Spinner.4905d90a.js"
  },
  "/_nuxt/VoteSummary.4f064cb3.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5c-7rYJsEQUzidC7KxJ80hp7Mu9wx0\"",
    "mtime": "2023-05-25T06:26:39.583Z",
    "size": 92,
    "path": "../public/_nuxt/VoteSummary.4f064cb3.css"
  },
  "/_nuxt/VoteSummary.519018e3.js": {
    "type": "application/javascript",
    "etag": "\"c81-zn2uxYZs465j9RTR9jKI2TzcEyc\"",
    "mtime": "2023-05-25T06:26:39.582Z",
    "size": 3201,
    "path": "../public/_nuxt/VoteSummary.519018e3.js"
  },
  "/_nuxt/_id_.3e424be5.js": {
    "type": "application/javascript",
    "etag": "\"7d5-TmyP1twZcfeW9QpbYEl/WMHoXMU\"",
    "mtime": "2023-05-25T06:26:39.582Z",
    "size": 2005,
    "path": "../public/_nuxt/_id_.3e424be5.js"
  },
  "/_nuxt/_id_.958e3882.js": {
    "type": "application/javascript",
    "etag": "\"562-zr3pLHm3rT7CZZyM8IkSeT4mk78\"",
    "mtime": "2023-05-25T06:26:39.582Z",
    "size": 1378,
    "path": "../public/_nuxt/_id_.958e3882.js"
  },
  "/_nuxt/about.6efaca2d.js": {
    "type": "application/javascript",
    "etag": "\"d3a-qLx+w/npLIxo1Dxzq+7zUgXIWB4\"",
    "mtime": "2023-05-25T06:26:39.582Z",
    "size": 3386,
    "path": "../public/_nuxt/about.6efaca2d.js"
  },
  "/_nuxt/auth.3f3fed8c.js": {
    "type": "application/javascript",
    "etag": "\"30b-McMMTOC8sbcDOnItjUSJL6h3HPg\"",
    "mtime": "2023-05-25T06:26:39.581Z",
    "size": 779,
    "path": "../public/_nuxt/auth.3f3fed8c.js"
  },
  "/_nuxt/auth.c9ac9f81.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"399-cxLeN2U3ODQFdmdoPxv343ovK5Q\"",
    "mtime": "2023-05-25T06:26:39.581Z",
    "size": 921,
    "path": "../public/_nuxt/auth.c9ac9f81.css"
  },
  "/_nuxt/details.c4b1d452.js": {
    "type": "application/javascript",
    "etag": "\"38c64-Bw5xQa/VSm2nO/mqMYHl0wWYGbA\"",
    "mtime": "2023-05-25T06:26:39.581Z",
    "size": 232548,
    "path": "../public/_nuxt/details.c4b1d452.js"
  },
  "/_nuxt/documents.4a916f64.js": {
    "type": "application/javascript",
    "etag": "\"25f-Afe9TgwSrIoomv5MmDwAnRJmI3g\"",
    "mtime": "2023-05-25T06:26:39.581Z",
    "size": 607,
    "path": "../public/_nuxt/documents.4a916f64.js"
  },
  "/_nuxt/entry.79783e7f.js": {
    "type": "application/javascript",
    "etag": "\"117378-lT0eaPfgShKnAmnPac2FylsBqjk\"",
    "mtime": "2023-05-25T06:26:39.580Z",
    "size": 1143672,
    "path": "../public/_nuxt/entry.79783e7f.js"
  },
  "/_nuxt/entry.8268a310.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"33b86-iHzCZasHi/Vvc4YBHt3y7rqdX8M\"",
    "mtime": "2023-05-25T06:26:39.579Z",
    "size": 211846,
    "path": "../public/_nuxt/entry.8268a310.css"
  },
  "/_nuxt/error-404.1b909068.js": {
    "type": "application/javascript",
    "etag": "\"8a9-IHE4fPR+24ToLRFLn7t5o4OHlU0\"",
    "mtime": "2023-05-25T06:26:39.579Z",
    "size": 2217,
    "path": "../public/_nuxt/error-404.1b909068.js"
  },
  "/_nuxt/error-404.23f2309d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e2e-ivsbEmi48+s9HDOqtrSdWFvddYQ\"",
    "mtime": "2023-05-25T06:26:39.578Z",
    "size": 3630,
    "path": "../public/_nuxt/error-404.23f2309d.css"
  },
  "/_nuxt/error-500.aa16ed4d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"79e-7j4Tsx89siDo85YoIs0XqsPWmPI\"",
    "mtime": "2023-05-25T06:26:39.578Z",
    "size": 1950,
    "path": "../public/_nuxt/error-500.aa16ed4d.css"
  },
  "/_nuxt/error-500.f0a03dce.js": {
    "type": "application/javascript",
    "etag": "\"757-SvXvCrPyAegTLZ+QySWGAxmwv/M\"",
    "mtime": "2023-05-25T06:26:39.578Z",
    "size": 1879,
    "path": "../public/_nuxt/error-500.f0a03dce.js"
  },
  "/_nuxt/error-component.dd6f3481.js": {
    "type": "application/javascript",
    "etag": "\"45e-VVWNDQu4jsi7FG/7JwpNPRtL7ZM\"",
    "mtime": "2023-05-25T06:26:39.578Z",
    "size": 1118,
    "path": "../public/_nuxt/error-component.dd6f3481.js"
  },
  "/_nuxt/expenses.8f2d7253.js": {
    "type": "application/javascript",
    "etag": "\"115c-7rdVzNe6kMgH4g7Ul26fz2LS8Ac\"",
    "mtime": "2023-05-25T06:26:39.578Z",
    "size": 4444,
    "path": "../public/_nuxt/expenses.8f2d7253.js"
  },
  "/_nuxt/groups.1add2863.js": {
    "type": "application/javascript",
    "etag": "\"604-1zlf9rbRqr3aIbY8aBflZqePCKk\"",
    "mtime": "2023-05-25T06:26:39.578Z",
    "size": 1540,
    "path": "../public/_nuxt/groups.1add2863.js"
  },
  "/_nuxt/index.145ce648.js": {
    "type": "application/javascript",
    "etag": "\"1b9d0-mEtoFYpQ1OZsTwCz6sHTjCosrL0\"",
    "mtime": "2023-05-25T06:26:39.577Z",
    "size": 113104,
    "path": "../public/_nuxt/index.145ce648.js"
  },
  "/_nuxt/index.18cc4a48.js": {
    "type": "application/javascript",
    "etag": "\"3540-F+KID0wLhTcVe7X5+6MgQBebZvE\"",
    "mtime": "2023-05-25T06:26:39.577Z",
    "size": 13632,
    "path": "../public/_nuxt/index.18cc4a48.js"
  },
  "/_nuxt/index.21328158.js": {
    "type": "application/javascript",
    "etag": "\"3877-YtgeiEqopz7w7PIdndVKzX0SyGw\"",
    "mtime": "2023-05-25T06:26:39.577Z",
    "size": 14455,
    "path": "../public/_nuxt/index.21328158.js"
  },
  "/_nuxt/index.2d1fcc4a.js": {
    "type": "application/javascript",
    "etag": "\"231a-F9Dha61mMch3SRM9oY0oSQ3CFeU\"",
    "mtime": "2023-05-25T06:26:39.577Z",
    "size": 8986,
    "path": "../public/_nuxt/index.2d1fcc4a.js"
  },
  "/_nuxt/index.39804519.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"27e-dl6+Ce9nJPEgHEG9ythO6v8nk6s\"",
    "mtime": "2023-05-25T06:26:39.577Z",
    "size": 638,
    "path": "../public/_nuxt/index.39804519.css"
  },
  "/_nuxt/index.40a29631.js": {
    "type": "application/javascript",
    "etag": "\"624-SeXT0cS0v6LuAS1yZzjqiKXcTiY\"",
    "mtime": "2023-05-25T06:26:39.576Z",
    "size": 1572,
    "path": "../public/_nuxt/index.40a29631.js"
  },
  "/_nuxt/index.4983527d.js": {
    "type": "application/javascript",
    "etag": "\"f01-CE2T2iyOmoAheWkt6jHgKnL+jyU\"",
    "mtime": "2023-05-25T06:26:39.576Z",
    "size": 3841,
    "path": "../public/_nuxt/index.4983527d.js"
  },
  "/_nuxt/index.58aab3e7.js": {
    "type": "application/javascript",
    "etag": "\"b5d-T+Rj1DxQ5/A/dvCOVBk8EuCIAC8\"",
    "mtime": "2023-05-25T06:26:39.576Z",
    "size": 2909,
    "path": "../public/_nuxt/index.58aab3e7.js"
  },
  "/_nuxt/index.5bb936c3.js": {
    "type": "application/javascript",
    "etag": "\"6d7-67b6YC0vM1+PdEgd4YPhMa7ZrjM\"",
    "mtime": "2023-05-25T06:26:39.576Z",
    "size": 1751,
    "path": "../public/_nuxt/index.5bb936c3.js"
  },
  "/_nuxt/index.7fb58679.js": {
    "type": "application/javascript",
    "etag": "\"255d-vdX1Br1ggFbc/occ1QLsebVWwNw\"",
    "mtime": "2023-05-25T06:26:39.576Z",
    "size": 9565,
    "path": "../public/_nuxt/index.7fb58679.js"
  },
  "/_nuxt/index.9be365a7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"297-UdxNzYEWnXxwe4nPUEBGNAZpO84\"",
    "mtime": "2023-05-25T06:26:39.576Z",
    "size": 663,
    "path": "../public/_nuxt/index.9be365a7.css"
  },
  "/_nuxt/index.9ceb781e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ef-y8c60ofU+T4AMlBLubk5JMh8bJ0\"",
    "mtime": "2023-05-25T06:26:39.575Z",
    "size": 239,
    "path": "../public/_nuxt/index.9ceb781e.css"
  },
  "/_nuxt/index.a0cffd71.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"63-lXpRLmXxvYDcmti2ku6SpzUWlBw\"",
    "mtime": "2023-05-25T06:26:39.575Z",
    "size": 99,
    "path": "../public/_nuxt/index.a0cffd71.css"
  },
  "/_nuxt/index.a82b67d5.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"12b-XiDEXNt+K6Mhf8kDnEN9OtFcNeY\"",
    "mtime": "2023-05-25T06:26:39.575Z",
    "size": 299,
    "path": "../public/_nuxt/index.a82b67d5.css"
  },
  "/_nuxt/index.b1cd5496.js": {
    "type": "application/javascript",
    "etag": "\"1774-mkYttoQ5mRJcaFB6OBHpUagLODk\"",
    "mtime": "2023-05-25T06:26:39.575Z",
    "size": 6004,
    "path": "../public/_nuxt/index.b1cd5496.js"
  },
  "/_nuxt/index.b581b132.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"10a-zErM+C+yCR0ohXtX2TfEwJzycc8\"",
    "mtime": "2023-05-25T06:26:39.575Z",
    "size": 266,
    "path": "../public/_nuxt/index.b581b132.css"
  },
  "/_nuxt/index.b85c6916.js": {
    "type": "application/javascript",
    "etag": "\"a0-Yro467KnmGEugOsv3V9rcN3Yb3c\"",
    "mtime": "2023-05-25T06:26:39.574Z",
    "size": 160,
    "path": "../public/_nuxt/index.b85c6916.js"
  },
  "/_nuxt/index.bb6fa342.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"16c-n1AOxWrRHMi8v8U5b1lZjHDSMgY\"",
    "mtime": "2023-05-25T06:26:39.574Z",
    "size": 364,
    "path": "../public/_nuxt/index.bb6fa342.css"
  },
  "/_nuxt/index.cb63f3ce.js": {
    "type": "application/javascript",
    "etag": "\"3f62-nA1NYBSiSMHcg3LrNpoa88TFYjc\"",
    "mtime": "2023-05-25T06:26:39.574Z",
    "size": 16226,
    "path": "../public/_nuxt/index.cb63f3ce.js"
  },
  "/_nuxt/index.cc6f46d1.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"df-NsmvwL1BGNFajTlCFNWzKfKQWrU\"",
    "mtime": "2023-05-25T06:26:39.574Z",
    "size": 223,
    "path": "../public/_nuxt/index.cc6f46d1.css"
  },
  "/_nuxt/index.ce70cf79.js": {
    "type": "application/javascript",
    "etag": "\"ac5-x89UOex+Je1hIpUg+xUk5QLpsUc\"",
    "mtime": "2023-05-25T06:26:39.574Z",
    "size": 2757,
    "path": "../public/_nuxt/index.ce70cf79.js"
  },
  "/_nuxt/index.dcb4ea67.js": {
    "type": "application/javascript",
    "etag": "\"a6f-K3OSGL2rKzU/ySbGP39r6daXnko\"",
    "mtime": "2023-05-25T06:26:39.573Z",
    "size": 2671,
    "path": "../public/_nuxt/index.dcb4ea67.js"
  },
  "/_nuxt/index.e98d0b08.js": {
    "type": "application/javascript",
    "etag": "\"1e98-l9zWDvcwZQdrd4Qp0cFcrr2d7cc\"",
    "mtime": "2023-05-25T06:26:39.573Z",
    "size": 7832,
    "path": "../public/_nuxt/index.e98d0b08.js"
  },
  "/_nuxt/interests.6b2288b7.js": {
    "type": "application/javascript",
    "etag": "\"1109-0ul0sa1wthhDq6yd7hMB3YlatmA\"",
    "mtime": "2023-05-25T06:26:39.573Z",
    "size": 4361,
    "path": "../public/_nuxt/interests.6b2288b7.js"
  },
  "/_nuxt/me.9d5f1590.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"39b-xXMdmZD343E4gfm9/gLnKSJ4P1Q\"",
    "mtime": "2023-05-25T06:26:39.573Z",
    "size": 923,
    "path": "../public/_nuxt/me.9d5f1590.css"
  },
  "/_nuxt/me.b9fe36fd.js": {
    "type": "application/javascript",
    "etag": "\"f40-6/hSVhNy7DZj81fnZPdjaL1V6PI\"",
    "mtime": "2023-05-25T06:26:39.572Z",
    "size": 3904,
    "path": "../public/_nuxt/me.b9fe36fd.js"
  },
  "/_nuxt/parties.bac9d714.js": {
    "type": "application/javascript",
    "etag": "\"610-zPR6E9xm68Hr02W5S1pPLLPC9Ls\"",
    "mtime": "2023-05-25T06:26:39.572Z",
    "size": 1552,
    "path": "../public/_nuxt/parties.bac9d714.js"
  },
  "/_nuxt/people.d3b7f916.js": {
    "type": "application/javascript",
    "etag": "\"fec-XwIVezeomrVtlgyzujQ+b+v+tvI\"",
    "mtime": "2023-05-25T06:26:39.572Z",
    "size": 4076,
    "path": "../public/_nuxt/people.d3b7f916.js"
  },
  "/_nuxt/terms.49de1d7e.js": {
    "type": "application/javascript",
    "etag": "\"165f-GoyDW8roJ1ZAtoGDW+b2Hp3AzyI\"",
    "mtime": "2023-05-25T06:26:39.572Z",
    "size": 5727,
    "path": "../public/_nuxt/terms.49de1d7e.js"
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
