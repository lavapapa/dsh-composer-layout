window.__ModuleLoader__.load({ id: "dsh-composer-layout", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/ComposerSplitAction.tsx
var import_react = require("react");
var import_react_dom = require("react-dom");

// node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.2/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
  return result;
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
    return true;
  }) ?? Object.keys({
    ...a,
    ...b
  }).every((key) => deepEqual(a[key], b[key], strict));
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) date2 = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// node_modules/.pnpm/@deepseek-ai+schemastery@3.18.1/node_modules/@deepseek-ai/schemastery/lib/index.mjs
var kSchema = Symbol.for("schemastery");
var kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  options;
  name = "ValidationError";
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
    else if (typeof segment === "number") prefix += "[" + segment + "]";
    else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") try {
    schema.callback = new Function("return " + schema.callback)();
  } catch {
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
  return {
    version: 1,
    vendor: "schemastery",
    validate: (value) => {
      try {
        return { value: Schema.resolve(value, this, {})[0] };
      } catch (error) {
        if (ValidationError.is(error)) return { issues: [{
          message: error.message,
          path: error.options.path
        }] };
        throw error;
      }
    }
  };
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = {
    uid: this.uid,
    refs: globalThis.__schemastery_refs__
  };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
    else if (typeof value === "string") result[locale] = value;
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
    return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
  });
  if (schema.list) schema.list = schema.list.map((inner, index) => {
    return inner.i18n(mapValues(messages, (data = {}) => {
      if (Array.isArray(getInner(data))) return getInner(data)[index];
      if (Array.isArray(data)) return data[index];
      return extractKeys(data);
    }));
  });
  if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
    if (getInner(data)) return getInner(data);
    return extractKeys(data);
  }));
  if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
};
for (const key of [
  "required",
  "disabled",
  "collapse",
  "hidden",
  "loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "deprecated",
    type: "danger"
  });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "experimental",
    type: "warning"
  });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = {
    ...schema.meta,
    pattern: pattern2
  };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) Object.assign(result, item.simplify(value));
    return result;
  } else if (this.type === "union") for (const schema of this.list) try {
    Schema.resolve(value, schema, {});
    return schema.simplify(value);
  } catch {
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    role,
    extra: extra2
  };
  return schema;
};
for (const key of [
  "default",
  "link",
  "comment",
  "description",
  "max",
  "min",
  "step"
]) Object.assign(Schema.prototype, { [key](value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
var resolvers = {};
Schema.extend = function extend(type, resolve2) {
  resolvers[type] = resolve2;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) return Schema.any();
  else if ([
    "string",
    "number",
    "boolean"
  ].includes(typeof source)) return Schema.const(source).required();
  else if (source[kSchema]) return source;
  else if (typeof source === "function") switch (source) {
    case String:
      return Schema.string().required();
    case Number:
      return Schema.number().required();
    case Boolean:
      return Schema.boolean().required();
    case Function:
      return Schema.function().required();
    default:
      return Schema.is(source).required();
  }
  else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = {
        ...schema.meta,
        ...schema.inner.meta
      };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({
    type: "lazy",
    builder,
    inner: { toJSON: toJSON2 }
  });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
    const date2 = new Date(value);
    if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
    return date2;
  }, true)]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
    try {
      return new RegExp(value, flag);
    } catch (e) {
      throw new ValidationError(e.message, options);
    }
  }, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = {
      ...schema.meta,
      ...schema.inner.meta
    };
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) if (data & bits[key]) keys.push(key);
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else throw new ValidationError(`expected number or array but got ${data}`, options);
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) result[key] = value;
  }
  if (!strict) merge(result, data);
  return [result];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages = [];
  for (const inner of list) try {
    return Schema.resolve(data, inner, options, strict);
  } catch (error) {
    messages.push(error);
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) result = value;
    else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    else if (typeof value === "object") merge(result ??= {}, value);
    else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
  }
  if (!strict && isPlainObject(data)) merge(result, data);
  return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) return [callback(result)];
  else return [callback(result), callback(adapted)];
});
var formatters = {};
function defineMethod(name, keys, format) {
  formatters[name] = format;
  Object.assign(Schema, { [name](...args) {
    const schema = new Schema({ type: name });
    keys.forEach((key, index) => {
      switch (key) {
        case "sKey":
          schema.sKey = args[index] ?? Schema.string();
          break;
        case "inner":
          schema.inner = Schema.from(args[index]);
          break;
        case "list":
          schema.list = args[index].map(Schema.from);
          break;
        case "dict":
          schema.dict = mapValues(args[index], Schema.from);
          break;
        case "bits":
          schema.bits = {};
          for (const key2 in args[index]) {
            if (typeof args[index][key2] !== "number") continue;
            schema.bits[key2] = args[index][key2];
          }
          break;
        case "callback": {
          const callback = schema.callback = args[index];
          callback["toJSON"] ||= () => callback.toString();
          break;
        }
        case "constructor": {
          const constructor = schema.constructor = args[index];
          if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
          break;
        }
        default:
          schema[key] = args[index];
      }
    });
    if (name === "object" || name === "dict") schema.meta.default = {};
    else if (name === "array" || name === "tuple") schema.meta.default = [];
    else if (name === "bitset") schema.meta.default = 0;
    return schema;
  } });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") return constructor.name;
  else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
  "inner",
  "callback",
  "preserve"
], ({ inner }, isInner) => inner.toString(isInner));

// src/settings.ts
var COMPOSER_LAYOUT_SETTINGS_NAMESPACE = "ui-composer-split";
var COMPOSER_LAYOUT_DEFAULTS = {
  defaultPlacement: "bottom",
  rememberPlacement: true,
  bottomHandleHoverOnly: false,
  defaultWidthPreset: "medium"
};
var ComposerLayoutSettingsSchema = Schema.object({
  defaultPlacement: Schema.union(["bottom", "right"]).default(COMPOSER_LAYOUT_DEFAULTS.defaultPlacement),
  rememberPlacement: Schema.boolean().default(COMPOSER_LAYOUT_DEFAULTS.rememberPlacement),
  bottomHandleHoverOnly: Schema.boolean().default(COMPOSER_LAYOUT_DEFAULTS.bottomHandleHoverOnly),
  defaultWidthPreset: Schema.union(["narrow", "medium", "wide"]).default(COMPOSER_LAYOUT_DEFAULTS.defaultWidthPreset)
});

// src/client/settings-storage.ts
var SETTINGS_KEY = "dsh.composer-split.settings";
var SESSION_LAYOUTS_KEY = "dsh.composer-split.session-layouts";
function readLocalSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return parsed !== null && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function writeLocalSetting(field, value) {
  try {
    const next = { ...readLocalSettings(), [field]: value };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
  }
}
function readSessionLayouts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_LAYOUTS_KEY) ?? "{}");
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}
function readSessionLayout(sessionId) {
  const value = readSessionLayouts()[sessionId];
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  return {
    ...value.placement === "bottom" || value.placement === "right" ? { placement: value.placement } : {},
    ...typeof value.width === "number" && Number.isFinite(value.width) && value.width > 0 ? { width: value.width } : {}
  };
}
function writeSessionLayout(sessionId, value) {
  try {
    const layouts = readSessionLayouts();
    layouts[sessionId] = value;
    localStorage.setItem(SESSION_LAYOUTS_KEY, JSON.stringify(layouts));
  } catch {
  }
}

// src/client/layout-policy.js
var MIN_COMPOSER_WIDTH = 360;
var MIN_CHAT_WIDTH = 320;
var SIDE_LAYOUT_BREAKPOINT = MIN_COMPOSER_WIDTH + MIN_CHAT_WIDTH;
function clampComposerWidth(width, bodyWidth) {
  const largestComposerWidth = Math.max(MIN_COMPOSER_WIDTH, bodyWidth - MIN_CHAT_WIDTH);
  return Math.max(MIN_COMPOSER_WIDTH, Math.min(width, largestComposerWidth));
}
function canUseSideLayout(bodyWidth) {
  return bodyWidth >= SIDE_LAYOUT_BREAKPOINT;
}

// dsh-css-module:/Users/marvin/Developer/Apps/dsh-composer-layout/src/client/ComposerSplitAction.module.css
var css = '.t35lgq_control{display:contents}.t35lgq_edgeTrigger{z-index:20;cursor:pointer;background:0 0;border:0;outline:none;padding:0;position:fixed}.t35lgq_toolbarBottom,.t35lgq_toolbarSide{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-elevated) 94%, transparent);pointer-events:auto;backdrop-filter:blur(10px);z-index:30;border-radius:9px;align-items:center;gap:2px;min-height:32px;padding:3px;display:flex;position:fixed;transform:translate(-100%,-50%);box-shadow:0 6px 20px #00000038}.t35lgq_toolButton{width:28px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;place-items:center;padding:0;line-height:1;display:grid}.t35lgq_toolButton:hover,.t35lgq_toolButton:focus-visible,.t35lgq_toolButton[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary);outline:none}.t35lgq_dockIcon{box-sizing:border-box;border:2px solid;border-radius:2px;width:20px;height:15px;position:relative}.t35lgq_dockIcon:after{content:"";background:currentColor;border-radius:1px;position:absolute}.t35lgq_dockBottom:after{height:4px;bottom:1px;left:1px;right:1px}.t35lgq_dockRight:after{width:5px;top:1px;bottom:1px;right:1px}.t35lgq_separator{top:0;bottom:0;z-index:20;touch-action:none;cursor:col-resize;outline:none;width:10px;position:absolute;inset-inline-start:-5px}.t35lgq_edgeTrigger:before,.t35lgq_separator:before{content:"";opacity:.58;background:#ffffffc7;border-radius:2px;width:2px;height:44px;transition:opacity .12s,width .12s,left .12s;position:absolute;top:50%;left:4px;transform:translateY(-50%);box-shadow:0 0 0 1px #0000001f,0 1px 5px #0003}.t35lgq_edgeTrigger:hover:before,.t35lgq_edgeTrigger:focus-visible:before,.t35lgq_edgeTrigger[aria-expanded=true]:before,.t35lgq_separator:hover:before,.t35lgq_separator:focus-visible:before,.t35lgq_separator:active:before{opacity:1;width:4px;left:3px}.t35lgq_separator:before{opacity:0;left:12px}.t35lgq_separator:hover:before,.t35lgq_separator:focus-visible:before,.t35lgq_separator:active:before{left:11px}[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger:before{opacity:0}[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger:hover:before,[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger:focus-visible:before,[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger[aria-expanded=true]:before{opacity:1}[data-phase=hero] .t35lgq_edgeTrigger,[data-phase=hero] .t35lgq_toolbarBottom,[data-phase=hero] .t35lgq_separator{display:none}[data-dsh-composer-split-pane] :has([data-composer-card]),[data-dsh-composer-split-pane] [data-composer-card],[data-dsh-composer-split-pane] [data-input-scroll]{flex:1 1 0;min-height:0}[data-dsh-composer-split-active=true]{container:t35lgq_dsh-composer-split-root/inline-size}[data-dsh-composer-split-active=true]>[data-dsh-composer-split-body]{grid-template-columns:minmax(320px, 1fr) minmax(360px, var(--dsh-composer-split-width,420px));grid-template-rows:minmax(0,1fr);min-height:0;scrollbar-gutter:auto!important;display:grid!important;overflow:hidden!important}[data-dsh-composer-split-body] [data-dsh-composer-split-chat]{scrollbar-gutter:stable;min-width:0;height:100%;overflow:hidden auto;flex:1 1 0!important;min-height:0!important}[data-dsh-composer-split-body]>[data-dsh-composer-split-pane]{z-index:7;box-sizing:border-box;border-left:0;justify-content:flex-end;min-width:0;height:100%;min-height:0;overflow:hidden auto;container-type:size;background:var(--dsw-alias-bg-base)!important;position:relative!important;bottom:auto!important}[data-dsh-composer-split-pane]{--dsh-chat-content-width:100%;--dsh-composer-card-max-width:100%;--dsh-composer-side-clearance:12px;--dsh-composer-text-max-height:max(96px, calc(100cqh - 104px))}[data-dsh-composer-split-pane] [data-input-scroll]{min-height:clamp(96px,18cqh,168px)}[data-dsh-composer-split-pane] [data-input-scroll]>:has(>[data-input-mirror]){min-height:100%}[data-dsh-composer-split-pane] [data-composer-card]>:has(:is([role=listbox],[role=menu])){height:0;inset:auto 0 80px}[data-dsh-composer-split-pane] :is([role=listbox],[role=menu]){max-height:min(320px,100cqh - 128px)!important}@container t35lgq_dsh-composer-split-root (width<=680px){[data-dsh-composer-split-pane] :has([data-composer-card]),[data-dsh-composer-split-pane] [data-composer-card],[data-dsh-composer-split-pane] [data-input-scroll]{flex:0 auto;min-height:auto}[data-dsh-composer-split-active=true]>[data-dsh-composer-split-body]{flex-direction:column;display:flex!important;overflow-y:auto!important}[data-dsh-composer-split-body] [data-dsh-composer-split-chat]{height:auto;overflow:visible;flex:1 0 auto!important}[data-dsh-composer-split-body]>[data-dsh-composer-split-pane]{border-top:1px solid var(--dsw-alias-border-l2);border-left:0;flex:none;height:auto;max-height:52%;padding-top:0;position:sticky!important;bottom:0!important}}';
var tagId = "dsh-composer-layout/ComposerSplitAction.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-composer-layout";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var ComposerSplitAction_default = { "control": "t35lgq_control", "dockBottom": "t35lgq_dockBottom", "dockIcon": "t35lgq_dockIcon", "dockRight": "t35lgq_dockRight", "dsh-composer-split-root": "t35lgq_dsh-composer-split-root", "edgeTrigger": "t35lgq_edgeTrigger", "separator": "t35lgq_separator", "toolbarBottom": "t35lgq_toolbarBottom", "toolbarSide": "t35lgq_toolbarSide", "toolButton": "t35lgq_toolButton" };

// src/client/ComposerSplitAction.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var DEFAULT_WIDTH = 420;
var HANDLE_HIT_WIDTH = 10;
function widthForPreset(preset, bodyWidth) {
  const fraction = preset === "narrow" ? 0.28 : preset === "wide" ? 0.46 : 0.36;
  return clampComposerWidth(bodyWidth * fraction, bodyWidth);
}
function findOwner(control) {
  const root = control.closest("[data-phase]");
  const composer = control.closest("[data-composer-seat]");
  const body = composer?.parentElement;
  if (root === null || composer === null || !(body instanceof HTMLElement)) return null;
  return { root, body, composer };
}
function findLegacyLayout(control) {
  const root = control.closest("[data-phase]");
  if (root === null) return null;
  const body = root.querySelector(
    ":scope > [data-conversation-scroll], :scope > [data-dsh-composer-split-body]"
  );
  if (body === null) return null;
  const sessionWrapper = body.querySelector(':scope > [data-slot="conversation.session"]');
  const chat = sessionWrapper?.firstElementChild;
  const composer = body.querySelector(":scope > [data-composer-seat]");
  if (sessionWrapper === null || !(chat instanceof HTMLElement) || composer === null) return null;
  return { root, body, sessionWrapper, chat, composer };
}
function installLegacyLayout(layout) {
  const { root, body, chat, composer } = layout;
  const initialScrollTop = body.scrollTop;
  root.dataset.dshComposerSplitActive = "true";
  body.dataset.dshComposerSplitBody = "";
  composer.dataset.dshComposerSplitPane = "";
  body.removeAttribute("data-conversation-scroll");
  chat.setAttribute("data-conversation-scroll", "");
  chat.dataset.dshComposerSplitChat = "";
  body.scrollTop = 0;
  chat.scrollTop = initialScrollTop;
  return () => {
    const chatScrollTop = chat.scrollTop;
    delete root.dataset.dshComposerSplitActive;
    root.style.removeProperty("--dsh-composer-split-width");
    delete body.dataset.dshComposerSplitBody;
    delete composer.dataset.dshComposerSplitPane;
    delete chat.dataset.dshComposerSplitChat;
    chat.removeAttribute("data-conversation-scroll");
    body.setAttribute("data-conversation-scroll", "");
    body.scrollTop = chatScrollTop;
  };
}
function rectOf(body) {
  const rect = body.getBoundingClientRect();
  const contentRight = body.clientWidth > 0 ? rect.left + body.clientWidth : rect.right;
  return { top: rect.top, contentRight, height: rect.height, width: rect.width };
}
var fallbackSnapshot = { status: "unavailable", value: void 0, base: void 0, user: void 0, revision: void 0, writable: false, mode: "memory" };
var fallbackSettings = {
  getSnapshot: () => fallbackSnapshot,
  subscribe: () => () => {
  },
  set: async () => {
  },
  unset: async () => {
  }
};
function ComposerSplitAction({ settings, sessionId, dismissInputTrigger }) {
  const effectiveSettings = settings ?? fallbackSettings;
  const settingsSnapshot = (0, import_react.useSyncExternalStore)(
    effectiveSettings.subscribe.bind(effectiveSettings),
    effectiveSettings.getSnapshot.bind(effectiveSettings)
  );
  const localPreferences = readLocalSettings();
  const preferences = {
    ...COMPOSER_LAYOUT_DEFAULTS,
    ...settingsSnapshot.value ?? {},
    ...localPreferences
  };
  const controlRef = (0, import_react.useRef)(null);
  const toolbarRef = (0, import_react.useRef)(null);
  const edgeTriggerRef = (0, import_react.useRef)(null);
  const separatorRef = (0, import_react.useRef)(null);
  const ownerRef = (0, import_react.useRef)(null);
  const sessionLayoutRef = (0, import_react.useRef)(readSessionLayout(sessionId));
  const sessionIdRef = (0, import_react.useRef)(sessionId);
  const widthOverrideRef = (0, import_react.useRef)(sessionLayoutRef.current.width !== void 0);
  const sessionChangedRef = (0, import_react.useRef)(false);
  const legacyRef = (0, import_react.useRef)(null);
  const widthDragRef = (0, import_react.useRef)(null);
  const appliedPresetRef = (0, import_react.useRef)(null);
  const [split, setSplit] = (0, import_react.useState)(false);
  const [composerWidth, setComposerWidth] = (0, import_react.useState)(DEFAULT_WIDTH);
  const [bodyRect, setBodyRect] = (0, import_react.useState)(null);
  const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
  const [sideMenuAnchor, setSideMenuAnchor] = (0, import_react.useState)(null);
  (0, import_react.useLayoutEffect)(() => {
    if (sessionIdRef.current === sessionId) return;
    sessionIdRef.current = sessionId;
    sessionLayoutRef.current = readSessionLayout(sessionId);
    widthOverrideRef.current = sessionLayoutRef.current.width !== void 0;
    sessionChangedRef.current = true;
    appliedPresetRef.current = null;
    setMenuOpen(false);
    setSideMenuAnchor(null);
    setSplit(false);
    setComposerWidth(DEFAULT_WIDTH);
  }, [sessionId]);
  (0, import_react.useEffect)(() => {
    if (bodyRect === null) return;
    const remembered = sessionLayoutRef.current;
    const placement = preferences.rememberPlacement && remembered.placement !== void 0 ? remembered.placement : preferences.defaultPlacement;
    setSplit(placement === "right");
    if (appliedPresetRef.current === preferences.defaultWidthPreset) return;
    appliedPresetRef.current = preferences.defaultWidthPreset;
    const rememberedWidth = preferences.rememberPlacement ? sessionLayoutRef.current.width : void 0;
    widthOverrideRef.current = rememberedWidth !== void 0;
    if (rememberedWidth !== void 0) {
      setComposerWidth(clampComposerWidth(rememberedWidth, bodyRect.width));
    } else {
      setComposerWidth(widthForPreset(preferences.defaultWidthPreset, bodyRect.width));
    }
  }, [bodyRect, preferences]);
  (0, import_react.useEffect)(() => {
    const root = ownerRef.current?.root;
    if (root === void 0) return;
    root.dataset.dshComposerBottomHandleHoverOnly = String(preferences.bottomHandleHoverOnly);
    return () => {
      delete root.dataset.dshComposerBottomHandleHoverOnly;
    };
  }, [preferences.bottomHandleHoverOnly]);
  (0, import_react.useLayoutEffect)(() => {
    const control = controlRef.current;
    if (control === null) return;
    const owner = findOwner(control);
    if (owner === null) return;
    ownerRef.current = owner;
    setBodyRect(rectOf(owner.body));
    const observer = new ResizeObserver(() => {
      const next = rectOf(owner.body);
      setBodyRect(next);
      setComposerWidth((current) => clampComposerWidth(current, next.width));
      setMenuOpen(false);
    });
    observer.observe(owner.body);
    return () => {
      observer.disconnect();
      ownerRef.current = null;
      setBodyRect(null);
    };
  }, []);
  (0, import_react.useEffect)(() => {
    const composer = ownerRef.current?.composer;
    if (!split || composer === void 0 || dismissInputTrigger === void 0) return;
    const onPopupTriggerPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[role="listbox"]') !== null) return;
      const trigger = target.closest('button, [role="button"]');
      if (trigger === null || trigger.getAttribute("aria-haspopup") === "listbox") return;
      dismissInputTrigger();
    };
    composer.addEventListener("pointerdown", onPopupTriggerPointerDown, true);
    return () => {
      composer.removeEventListener("pointerdown", onPopupTriggerPointerDown, true);
    };
  }, [dismissInputTrigger, split]);
  (0, import_react.useEffect)(() => {
    const composer = ownerRef.current?.composer;
    if (!split || composer === void 0) return;
    const onBlankDraftPointerDown = (event) => {
      if (event.button !== 0 && event.button !== void 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const scrollport = target.closest("[data-input-scroll]");
      if (scrollport === null || !composer.contains(scrollport)) return;
      if (target.closest('textarea, input, [contenteditable="true"], button, a, [role="button"], [role="listbox"], [role="menu"]') !== null) return;
      const editor = composer.querySelector(
        'textarea:not([disabled]), input:not([disabled]), [contenteditable="true"], [role="textbox"]'
      );
      if (editor === null) return;
      event.preventDefault();
      editor.focus({ preventScroll: true });
    };
    composer.addEventListener("pointerdown", onBlankDraftPointerDown);
    return () => {
      composer.removeEventListener("pointerdown", onBlankDraftPointerDown);
    };
  }, [split]);
  (0, import_react.useEffect)(() => {
    if (!menuOpen) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (controlRef.current?.contains(target) === true) return;
      if (edgeTriggerRef.current?.contains(target) === true) return;
      if (toolbarRef.current?.contains(target) === true) return;
      if (separatorRef.current?.contains(target) === true) return;
      if (target instanceof Element && target.closest("[data-composer-width-handle]") !== null) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);
  (0, import_react.useLayoutEffect)(() => {
    const control = controlRef.current;
    if (!split || control === null) return;
    const layout = findLegacyLayout(control);
    if (layout === null) return;
    legacyRef.current = layout;
    const dispose = installLegacyLayout(layout);
    return () => {
      legacyRef.current = null;
      dispose();
    };
  }, [split]);
  (0, import_react.useEffect)(() => {
    const owner = ownerRef.current;
    if (owner === null || !split) return;
    if (sessionChangedRef.current) {
      sessionChangedRef.current = false;
      return;
    }
    const next = clampComposerWidth(composerWidth, owner.body.getBoundingClientRect().width);
    const layout = legacyRef.current;
    if (layout !== null) layout.root.style.setProperty("--dsh-composer-split-width", `${next}px`);
    if (preferences.rememberPlacement && widthOverrideRef.current) {
      sessionLayoutRef.current = { ...sessionLayoutRef.current, width: next };
      writeSessionLayout(sessionId, sessionLayoutRef.current);
    }
  }, [composerWidth, preferences.defaultWidthPreset, preferences.rememberPlacement, sessionId, split]);
  const setDock = (nextSplit) => {
    setMenuOpen(false);
    setSplit(nextSplit);
    if (preferences.rememberPlacement) {
      const placement = nextSplit ? "right" : "bottom";
      sessionLayoutRef.current = { ...sessionLayoutRef.current, placement };
      writeSessionLayout(sessionId, sessionLayoutRef.current);
    }
  };
  const resetWidth = (0, import_react.useCallback)(() => {
    const width = bodyRect === null ? MIN_COMPOSER_WIDTH : widthForPreset("medium", bodyRect.width);
    widthOverrideRef.current = true;
    setComposerWidth(width);
  }, [bodyRect]);
  const onWidthPointerDown = (0, import_react.useCallback)((event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    widthDragRef.current = { x: event.clientX, width: composerWidth, moved: false };
  }, [composerWidth]);
  const onWidthPointerMove = (0, import_react.useCallback)((event) => {
    const drag = widthDragRef.current;
    const rect = bodyRect;
    if (drag === null || rect === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    if (Math.abs(event.clientX - drag.x) > 3) drag.moved = true;
    widthOverrideRef.current = true;
    setComposerWidth(clampComposerWidth(drag.width - (event.clientX - drag.x), rect.width));
  }, [bodyRect]);
  const onWidthPointerUp = (0, import_react.useCallback)((event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);
  const openLegacyMenu = (event) => {
    const drag = widthDragRef.current;
    widthDragRef.current = null;
    if (drag?.moved === true) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setSideMenuAnchor({
      top: rect.top + rect.height / 2,
      left: Math.min(rect.right + 6, window.innerWidth - 6)
    });
    setMenuOpen((open) => !open);
  };
  const onWidthKeyDown = (0, import_react.useCallback)((event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      widthOverrideRef.current = true;
      setComposerWidth((value) => bodyRect === null ? value : clampComposerWidth(value + 16, bodyRect.width));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      widthOverrideRef.current = true;
      setComposerWidth((value) => bodyRect === null ? value : clampComposerWidth(value - 16, bodyRect.width));
    } else if (event.key === "Home") {
      event.preventDefault();
      resetWidth();
    }
  }, [bodyRect, resetWidth]);
  const sideLayoutAvailable = canUseSideLayout(bodyRect?.width ?? 0);
  const toolbar = (className, style) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      ref: toolbarRef,
      className,
      role: "toolbar",
      "aria-label": "\u8F93\u5165\u533A\u57DF\u5E03\u5C40",
      style,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: ComposerSplitAction_default.toolButton,
            "aria-pressed": !split,
            title: "\u505C\u9760\u5230\u5E95\u90E8",
            "aria-label": "\u505C\u9760\u5230\u5E95\u90E8",
            onClick: () => {
              setDock(false);
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${ComposerSplitAction_default.dockIcon} ${ComposerSplitAction_default.dockBottom}`, "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: ComposerSplitAction_default.toolButton,
            "aria-pressed": split,
            title: "\u505C\u9760\u5230\u53F3\u4FA7",
            "aria-label": "\u505C\u9760\u5230\u53F3\u4FA7",
            disabled: !sideLayoutAvailable,
            onClick: () => {
              setDock(true);
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${ComposerSplitAction_default.dockIcon} ${ComposerSplitAction_default.dockRight}`, "aria-hidden": "true" })
          }
        )
      ]
    }
  );
  const separator = split && bodyRect !== null && sideLayoutAvailable && ownerRef.current !== null ? (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ref: separatorRef,
        className: ComposerSplitAction_default.separator,
        role: "separator",
        "aria-label": "\u8C03\u6574\u8F93\u5165\u533A\u57DF\u5BBD\u5EA6\uFF1B\u70B9\u51FB\u6253\u5F00\u5E03\u5C40\u83DC\u5355",
        "aria-orientation": "vertical",
        "aria-valuemin": MIN_COMPOSER_WIDTH,
        "aria-valuemax": Math.max(MIN_COMPOSER_WIDTH, Math.round(bodyRect.width - MIN_CHAT_WIDTH)),
        "aria-valuenow": Math.round(clampComposerWidth(composerWidth, bodyRect.width)),
        tabIndex: 0,
        onClick: openLegacyMenu,
        onDoubleClick: resetWidth,
        onPointerDown: onWidthPointerDown,
        onPointerMove: onWidthPointerMove,
        onPointerUp: onWidthPointerUp,
        onPointerCancel: () => {
          widthDragRef.current = null;
        },
        onKeyDown: onWidthKeyDown
      }
    ),
    ownerRef.current.composer
  ) : null;
  const sideToolbar = split && menuOpen && sideMenuAnchor !== null ? (0, import_react_dom.createPortal)(toolbar(ComposerSplitAction_default.toolbarSide, sideMenuAnchor), document.body) : null;
  const openSideToolbar = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSideMenuAnchor({
      top: rect.top + rect.height / 2,
      left: Math.min(rect.right + 6, window.innerWidth - 6)
    });
    setMenuOpen((open) => !open);
  };
  const recoveryTrigger = split && bodyRect !== null && !sideLayoutAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      ref: edgeTriggerRef,
      type: "button",
      className: ComposerSplitAction_default.edgeTrigger,
      "aria-label": "\u6253\u5F00\u8F93\u5165\u533A\u57DF\u5E03\u5C40\u83DC\u5355\uFF1B\u7A97\u53E3\u8FC7\u7A84\uFF0C\u5DF2\u6682\u65F6\u505C\u9760\u5230\u5E95\u90E8",
      "aria-expanded": menuOpen,
      style: {
        top: bodyRect.top,
        left: bodyRect.contentRight - 13,
        width: HANDLE_HIT_WIDTH,
        height: bodyRect.height
      },
      onClick: openSideToolbar
    }
  ) : null;
  const bottomTrigger = !split && bodyRect !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      ref: edgeTriggerRef,
      type: "button",
      className: ComposerSplitAction_default.edgeTrigger,
      "aria-label": "\u6253\u5F00\u8F93\u5165\u533A\u57DF\u5E03\u5C40\u83DC\u5355",
      "aria-expanded": menuOpen,
      style: {
        top: bodyRect.top,
        left: bodyRect.contentRight - 13,
        width: HANDLE_HIT_WIDTH,
        height: bodyRect.height
      },
      onClick: () => {
        setMenuOpen((open) => !open);
      }
    }
  ) : null;
  const bottomToolbar = !split && menuOpen && bodyRect !== null ? toolbar(ComposerSplitAction_default.toolbarBottom, {
    top: bodyRect.top + bodyRect.height / 2,
    left: bodyRect.contentRight - 19
  }) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      ref: controlRef,
      className: ComposerSplitAction_default.control,
      "data-dsh-composer-split-mode": split ? "split" : "stacked",
      "data-dsh-composer-split-adapter": "plugin",
      children: [
        bottomTrigger,
        bottomToolbar,
        separator,
        recoveryTrigger,
        sideToolbar
      ]
    }
  );
}

// src/client/ComposerLayoutSettingsTab.tsx
var import_react2 = require("react");

// dsh-css-module:/Users/marvin/Developer/Apps/dsh-composer-layout/src/client/ComposerLayoutSettingsTab.module.css
var css2 = "._4gIWUG_root{gap:16px;max-width:720px;display:grid}._4gIWUG_intro h2{color:var(--dsw-alias-label-primary);margin:0 0 6px;font-size:20px}._4gIWUG_intro p,._4gIWUG_row small{color:var(--dsw-alias-label-secondary)}._4gIWUG_intro p{margin:0;line-height:1.5}._4gIWUG_guide{width:min(100%,400px);margin:-2px 0 0}._4gIWUG_guide img{width:100%;height:auto;display:block}._4gIWUG_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-elevated);border-radius:10px;justify-content:space-between;align-items:center;gap:24px;padding:14px 16px;display:flex}._4gIWUG_row span{gap:4px;display:grid}._4gIWUG_row strong{color:var(--dsw-alias-label-primary);font-weight:500}._4gIWUG_row small{line-height:1.35}._4gIWUG_row select,._4gIWUG_number{border:1px solid var(--dsw-alias-border-l2);min-width:110px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border-radius:6px;padding:6px 8px}._4gIWUG_row input[type=checkbox]{width:18px;height:18px;accent-color:var(--dsw-alias-state-business-primary)}._4gIWUG_number{width:92px;min-width:92px}";
var tagId2 = "dsh-composer-layout/ComposerLayoutSettingsTab.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId2) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-composer-layout";
  tag.dataset.pluginCss = tagId2;
  tag.textContent = css2;
  document.head.appendChild(tag);
}
var ComposerLayoutSettingsTab_default = { "guide": "_4gIWUG_guide", "intro": "_4gIWUG_intro", "number": "_4gIWUG_number", "root": "_4gIWUG_root", "row": "_4gIWUG_row" };

// assets/screenshots/layout-guide-en.webp
var layout_guide_en_default = "data:image/webp;base64,UklGRv4sAABXRUJQVlA4IPIsAACwMwGdASqvBKMBPlUqkkcjoiG/oRIIY/AKiWlu3JzlB5UGX/t3B329uLnH/IpgXXx6W9zFuNvLMPBoF//2rGd0rnuX2ze8T+b6K/zAfof/pf5f72XOq9Zz6DH6O+kT+znwlft96POrV/S/9V3xPtt+PHob5DPPntZ/eP/V/j/u+xD9gH+p6G/yn7Z/mf7t+2n93/cz79/3P/C8S/lr/feoR+Pfyz/M/2X9wPzV5Ubdv976AvsH9N/4H+M/HP4evuP8h6MfYP/V/274Af5h/Uf9z9w3zr/2vEz/Ef8D/ke4L/M/7H/1P79/jf3R+Sf/r/yH+w9VX5//oP/T/m/gL/lf9q/6/+J9tL2Z/uz7Jv7Z//8IRjPbJdhGKNIfgEXoLY8Yo4MvlSgwnlqpLOdmMqkddoCpXOGi3ZC6LKhmr2eCzR6Wk7sy39KyKwjmfNOaTou01pO/DDM/sHh4RYoa/P1XwXEXSkdbvgVCp1vRnZSNE6FUsMejfJc90oCVvRlXSDFVyXmFSxYSzQotmW7tLr6/Hd8GbyW3b+lnBzu1dO4/XVHOQdSWfwMgXzv6tQoQC54iC9kE8z+ge5IsnZLJpRkCCOqHvP0QeoDQuZi9kHwSYCnu5mMmpaHpkN9lbNjXeUEdAkcGtPMzF7JLrQkWRlAKV/2tzlPRX/bi9kE8QUF3tfWwzxIyugkgs3LSGawipaawhFEnsZA9do58jCXTSjILnihQPmH+nX2IPD6ehCKDILnilZEt7Pp9Rh7IJ83DIJ5mfKVA6hJ+kiOV2P2UlTaGi3ftg28ouuAYhCBSUNcUkmSdNAHPtF44KmetKHZt83CJCZZEbtjsLpz7ReYULrEaazIf6zp7VAX5/KyjkpG7Pq8mWzdmi12CFUPm6/l0pZnYtSs4IbWhJLimDd+E8jM14gdTVJb9oSS79jmwrfqdk1hCLhodxfLGWJTZoSt3tg8Z5uglL4R7D0C08wojUtr47kf17zhot30oqlkJsuyAgPNO0j2gC8GFeScucU5IuUhubQzwkbePxKk88RBfd5FUGX0Ix7MB/zhhYDiaE4VLdfs1berrMcmX4nsu40lv/vp8VU5K/jtL0IgdWImchBzI5mjqyDyN2/E59ISax+4+rPsNNX5SlKEFn+/XaMG+KkucAu61NYQmxNwrGl4dE1u9SkkFSuS/oRQEw+VnVoVJhXPL8fLZDN5b0U216WCHs3XsKFt+H8FNf3Mwl+kt4Yx4GPPgk4Ri9INk9kVU2Pi9s2bcEJk95wDVxbI7y2Nf2CGz+vE3PPxULZl0TaGu6jliKfj4ULjpea9CeZdWKTR17HvOBvREFrQkl37XiW/qNinQObbXOYCjxVR/fppTguOxTrhddaLy3W2vp0CcuN6sHMRP5/qsdqiHQlxSgE46KbWI6MdZNp7Q6EMoPWOu/RdcKpKas1EINrQkixAiA0lyIlKmiNwkt+LPP4BralkO45rp2i8t1ZO/S7UJPrMeR+UMdsiaJTOLOVLcRJemE6nSoGFfV1FrUO6e3yWUZJXenveIUvJbt/pC1VMMePDo/spaE5Y5cGovd+2DtcrJdIcmyCeZoswa2YOFy4Do5w0WjjlUggxEzekzv1E/AgXRZ3dzqpLj1hku9lxXy3gDHpeKNe6oXZPe3L00h9uJHlajx4R3vjZ9fe0Vv+Hifa+0c4aLbk6SJ6vHgvZBU0/dVmG9mSQ3sVlEF2MSjHeXmr6hTPy042SvRvzjDN/ovMKf5EbrafohFs93Q8Mh1O1vkrdYfeOSVhOZj2i7ej1gVzv8zF7Jbamw9jzVrFcwcSclq5w0W75jOg9VceMCf5hBex2FNHbvQF6FBmUncOMshL5c/3HuQoa5nj3IoS1zlvn0QhXsgmzkS2IXmGYYMr83e13l5rZxgCiqzzQsFdTqvwaBZqxhC3yUeEfKkrezp7VMVaqzcexBGhhABXgT3JlLtzfmS9GQXPNTxBlgsEld5wqW79sHkuUbpKuddoOArf2CgDn2i8vnOz2ov327Jo27TeIU7g8RNIp9Pams+YOgU6Panotj9rd+2DzCpVTXKyAh++31vXk5eTL8UQ7lenvQ13OGi3SOwq21L+Ai9w8vOCMLp0u7jWlShprheYVFUBJaGo4tSWIXmaVSF/sgn1x3vGkb0QIWkFSm0NFu+PZrnoi1/eSm77LZic8t6j9kg8/UhwyYrdo4Oy8d5+i4srOBywNv28WMdrkBMsee9INCVu4/rG4BhbWodQ0KTTPBc8RDMmeSKBAWtZIiwpjMJrQkl37YPMKdH3cRQL9TbzxUCBekT4BcHfU4i72weYomgNCSTPTIHfNlyShi7G30jySe8oSS79sDFDfop63w2kwqVc8UJP3/IoWYzwL2lWgV0UjtTucNFuBYWbDm72weYVK5w0VhwT/9tSucNFu/bB5hUps0BlvMyuO5mL2QTXxjnFZ77cXsgnmZh5w8JcO0+e1NYQigyBBcOLwV1egCd/UOUwG1+e3r2tGxmZ2QhsLX9KBuC5tt1dR9G8Ao/o6yBGL4TIX9x6Gx9fwuKZe2WA4vXxwp2u2TcxtedR5sXObIDM22h3ee+pTuQc1Lzos8zD6tNdjG+LpImgwWDPDB9WyJzYvkXHVlaxRRFd/Xw1X2ZmSyP5+ujgBXvfBtSSWten1LeM4oNYBeCOse7ztQd21xHIWrCclhMbTPvjwYBsseVikCEdvVZ+ynA7zz9Pcc8dNyomz+5i0WyAtIqKsKUh5XtCEKX3st2TP0C7tdUY4XWtkzGISeDoAXQQGIynhkjs/GBt2RdjV28CD/ddZTZATwC62ypAUQXoUzLYgocSmvV8ADtCDZvH5sVzaXQogp4Mw7On5kUrpN240IRZ6y77ebELNRp3ADA3cYtnk9ZsEmz+AZ2LMANytRThRJvAUerhwUHwentTV52uxW4a0L/y1swOWTOUKcqVHHbVt4gkRVSU+bhQB+c3IBw7vCg/KRUl7Ko+G7XG3x4JrqJgPPjKAtVaTtno09+USvEP0tF2P5tvAP3B7U1F+6+8kPMvx1kAUmpHg9FPii1BX3tOcMaiXwBllWvYpsIH4zM3CT8ezQ0AK21Q8q2vL4kkNKsqsj+GbHX0EGMDQmqreSsj7lA7NvMzQZ808ZmCFeEJ5fLFj7g8lRO0+SvxWtFszIkbpteyJB5bEO3DtwE6+X/o+lR/coJ7mYt9blGycC0/5YQigxtKwKj+5QOyg9lSVznElR/coHZQeypAUQXse4PLUCnJX4sz8/ED6ybeZdwRjih7Uwkgt4fnyAiUImNlAAAP7926fHWrSeu+fw1xU3dsQnPfnySkSNxCqQY/UFsZPFJQQK/TmpnALhilg+gDM3x9l31jgZiTmB7IdZP7Qb3O8c83jbFltd8KaR4G7nc6JmjsXH5inGxl4WyZeB0kC9CMY1pFVzPV8k4qy8Mm4nplyBGgUw1egcafRRmOLlFRLyVsBF2659yqVkEKGeSN5GFReMH/D6LZYnCuIJFgtVRllvie1QE5a2rDhSBcomlTcTlF9e+BV8DbKZnRNELOWmYowGVUaLJtE6XUsEJ9dz5S2PI5qRWp+SwegDKIAAAXm8vT1VAn4SAA1D0Vt4q1fKLpqRzcZl4U5SVYCzYMoEAFh9jfAUxFmAVy4HBLAX6v3IAAAiX8nWI1jJYoV7P+4qiVYPdGK68FmdaX98MbpKoNYrqV9E4bnjIzIIg+T1xdx2/jR/ni/AABSLTjsNJdGpaegAAo614QdM2fyglSzTfwnfOWqKgHvlpwAEW3755xENNZbEdbeuj9vAX7D29u9l2wtaL1T3ypB9CmswpCn4EYgIFAnLcI/L17vQRqw6FaXzJVzUfK+vkrG+7hN/k85usAwrsBwYQXY3DiAAA+PoZ07Jiy2biptGIfHympogm+WeR28+p8jEZQsjAbiE1y/C6+uW9MXEzgqygJ4P1nwDnIPhBE5Mm0eVrNvZU7QZ3dkOaXfgAAHXU9xGNEde5hgk7pXqpCTPvibAAAueVYAq9UJYtd7Q5QdfLcyDiLuni+/HbJPE7zavTx5KPGgAAZRoUCoeHm162SH5l4t6+FmCR0BvjeHPLHOjRkEegLepA8E36dWJmEqEN80InOhx7o5IjXv929EAPMt9xb69hGmtscH86YQOU4sAz7I/uXdqcwiHWT6HV4a1DNsmmIqmgXxU70H4BNqr5fOEapAXrTqPOFbzzCaXS71Jr+Rf/cyOvjLfwf8bYP+gO/PpYVCTj51A2d+QGaVckcpXzZKtk0FDg8xUO/+lidyrA9OlM5GAHcMQM2ndWd4uhNZ8X18H1Hq72bW79BJygYUwXBiCnjgiYHMZwWiv+Eg4NWkoQAuBfA5FjftzO5eN6qbVxKh4n2Xk57lgqJi45wA0emrVAUyyLhwlOeakkidck7oC5rz2W6xTYLQ54wWNgoUM7HubKprG6n9nVKmSuHM7cA2SMPj2s4hrpNuKCDfnoNmQGGPE+O3rIGS4WoWHcYUuFsuVuVYzrlWQu3VoyKkzmawIEfFr4Mpqek3zlpAVmxRn1E+FewdeuBkeSEwsVD5yOPQzHgtnQwM0gbzxTLCv7HVk39slyKqiRTJCZBp8AShA1wCBx+2/AELoEskYn8aYe9bQwFIBDTXEemznfZ+1P/yB6Sx0PEbxCnN09S2EO8H7UgmIgNNRe9J2iBGf8aQ5P8WQsHr9h+rN0Lu7ZMNXgA6BZIzvV2qCKCh6ngBc1/uEk29PqiNojMFjsDdGD4ukYlo/kLufVJF/2Qdfsi76wM5vjA1ANuceEi3XLs6BnV5nRhqmoQRggEWmXEg0C/GCKN8Cm8XtZKNFIMs58epzy7jI8d+jg5TXNnY9a+3SwKLOTg2FgBmwtRg2oiGqqvBIcP0bGsrq/g4Gi78mZtBYg11LSrfqgTZUbIiG+aHsElAA1IHpfFUkavc5BPYMzR5etB6OIqbVd2i7BPpFrsCH2EnvYMvDA3oFdbwP9ZQjJhx4N9N2yRZZ6iCUpoYvV8Eadqaj7JL5KrcV98SEBP6eyEf6QS02Nhs8IFK5iuEyXXX3NtbHuHdYJcJ3ANu9KPPawkgwxzUiiwUJGFY26Wah9+jnBUFCSeZ8l4tfRFQdUKG+DnSJRVuYLoX0MTBMv/QglUJgBJpci+BzFE9hcY5A6QZlbjCXFyndm2Z/5Bj0atbL4Hw+uNGv8wdjj3VuZ/c3bsHo+VBMPOqNNHTFwwEzync62OgjrH7L76Hetk30T/+bO2Y6EviWILnio88AVjepoAn0kUySp+Y8XvdQI/Bj2HIHNxS3MmeeK1lmzOOBS1tORqc9EzcNXrGY3B7igQ6nuJ03NWJF9yB8hL+/0v+wmRl+ko+G/aQdXBw4rSi5sw5/BOpZKacn/l/UkQBMTAscwBCel3bW6uMQrvHHiKn6xqu2AvHzXaCQZzFRfIaHx6qTf7KNs0JByCe7QTPmoIuwXYUEKvasNUpRJX54aMCkhAE+rTo6bkJrhQLQ1VhUSXzdkexuOTg69GJ+PaxLe52I5pW/LWqntVxsd5Uz3/J7R6Ia6tSC+vHtdlQPFfnEi/ZpOUyWCE4ysPNjQF3fygwBuxDY3QN8/LguB4k6pyYvAwEjkRE8aGJ+fgIv4FNUDChclVGEsYoZISz2P2KxXWRF1EWQ2M+ZOzptxzm+z2AD00gcPlA0beCNxyI5onn8kHd4AG0ET61avyeXMm0t30WqhJuv9KhgCfnYjchmCFM4RdLR/nqQahKi8ybVx+l0Bxe7RWe2doaACuZH13jdy8p0MrUmGN2cHCBxrCpcYjF7u2EZZhHLqXSK6q+cScsjq0vEwWuqNmUbwhfQ9JSiHWf7fM3U68wwAJ24UB5KWlzwKzE8NDWMA85Voc6vpfswZZNudcUhYIOVGekYoavxFhPNThoco4RsPJzVbcNq+hNAkLyQIXNeyy25h6mx+7BMEFIH9ItROf/cKuoLDaKfAoPhXZhEw/dQMdNSHqI2nQ19KNYOGQUXnin/NcLNZsJGM2+WnZgjx//dvALA9A7rL1xgcz8SRs0RJ/21XTYJ3oihfaYYsafTYX9dX/nbTqc0gCY0uXZ/1w+NW/jKfe4TS/4Az7228zJiLG6n7eF8x31PJRU1B9jb5Ecm1QiPWbrSdN2W+bFcp72mEW475ip4+QK0K5OOp/XyM0/yxZW7BtXnwFPtlBMeuFnIMgVhQ8A3+mU9V15HE3I60uvc3s6szLt/sh1TGWawWxo8AzK9BxqnmlvmnmnkKvs1j8GKuBtEuJlPEU4vE4Jz+YZrH9J6cK8e+08VVz9zWl+VtS4ymzR96701mLgkE17f2/wduEuaZtSgGyuDD7F2R6pbtQsYo/vYFyZjXgqbqlbhKo0On/0Smk7v2gzPMXW2gdJazMKLOh0XIn6Hkyojnzup/MOKyHKUNinp3uTii+K3Dba+yjyB3IWPAussGZ78/HjJk1Xx+He9oWpGdrFF1cYAC2n9ymhhoF1W2ouurrRXZTBySF88xtBR0gZUGVVNjzPWhvLovDoSaCJKhgFX4NYHOoeFsbFm71tdgNj6xJfPjCOwqSCw6O7DKGWgukWNzKD+Dzp823M7TPF7oBIr40kOxGag9lKLnwOvN4rq1KrnnDcKMGPCYtt2PEnseLDI3TWzC/HXApSlPhFryAQP7PMYbrFE+xWuKuvdwdkPd1d0t+1vY2HLYiST33lrrrmBPUkk6W7F2VFnKA7WozhpH0jbB8l9o9PyejTGmu8q5IhvYdWnRo/do+7yhXZKNWCT7WhQocyPLGkCqbUjv724QMOsNsHLV8b/9133+fB8p0y87PKjJgPTNIsBCefvyAW8+GVyxpxUnj5CIgHtBOsNQAe/cyb4ed1o5IUV6vj0ZijwDFkcB81iul16HtLVaL3VzWL0QPt9BMyWeKCTa0szIKCLB/5vjzUkq831pUSlHn2GM7vKDHCn2UhnpHRZKvUeX1mtHR3AtpzjfDZs/ujWv1trBxiIczGwoN2KYEj+sOcO6WKaaPdyc9+l/DkGz5cniVzDautTO1RNcGZletRlx4g5XLNRRCGZ1n7QZ6oWBpZuo9DknTRlouHvpcStNxrjIEKmN8O/nc2wXnN/dJDmNPPdJmOlmkQAAPAi+I769GfcDRkXA8Cx1qJSZ7y4bn0u1Kr8PKgGmkw0Cxv40zYUiv8R32nGDuP9YMq15Bx1K+FeKeYigCeksEZDK/qseEo5NLj0R5nmYgK4QIWieBiM5tuUh+SuZfaR724W9NMMXgiDxdobkbpxywWIof3PB141Gf/ciP9xFbVyV6mW1McBXRUuJqyBLvUUPMnVsekfTq57h9hUwLXIq4oyOJkw6PeqcB+yOHEigYLZ5YN7Pc1p/tos337a2hLBnSoGnsrteunNuVVyTwKbLeKTVzo+YikLwJi/s+0VHqnwmRNhYUOtK3cJJEfapaaMYm/3jN2dRjDMwjM46aT/BoPK28paSX9fABZENzsR1rXUYXymsNr9ZsnBIkDqU9K4nqib3InFUH06gauZCuqVhNI4R1mE6z7FgAAET72+AWsmRhRaRkFe58q9TvSegIpgOcTe8K+obDg7o4WG9i0if9U6IA7vIEdG95vjS9RDQckbVzg1jywXWTBX2GLc7cxBa8TBZCTNXHL0wAAI37TPHZjPI37n6USpr2ieOXPPNDyguaABbHkpuz0afu4EPfGeUn5wUZCyj74IR16SN/eNGJKvWjZrF0ZioDaWGUfxYIAALGclngjB/BMZBBOMNHE0BcRZonm1jY0ZB1E7Ximhexfuj7PBV3q55xF7fk6Ci+o5xZhSkvrLZYjOVbn2p8tQvZksBX3XN5sIjwJA9XjJ/lwJhLgSEha4NpQDe0grF7D7CapG9OEzubmbcP8zwWfUeoRCEK6KVBVOBRLGCJBsb+/hShRyH31J8qb1vf5BD8lq2wxy1YVqBX5diB1VmhfpIbxQz5P7itrm8PFwaIebLxWtGHGWlrREU8HeaeOHDGGTVW2czckOrF/aev2EA+Vhk+ZQ6E1luC387nuCY3nB550Xfns/X7jt4YyCzAgZ0M126np549RWER+uxrm74GUJZl45yh8k+HfljTNRz0dOUKY7z63BBkVoB0uLaouUBsKVsTCPr9BZP90GCz+sIxnsC9sBjWzQmg/1aT+yx18YOJTQtfrTVO0IbKtuWziSWSNIvDAjbQxTlNssWRbAWC8vmk90WxVM/+weynJrFGL5ByqPsQZFI3jEgYg6kJ3H3fkaSyaTInq8lU17hbtaPXQHf2Hl/FvIuWMkZalDEm8cNqEQZay4eRPgd7AfBLLV22DhNqC6BfMZ3rxWAdKjRn7Vathe8tAf4mXQruui6R4c73eRNbxB8Irf1dQ4HLTddD5j4czeggZO6fWJpx7ZMLGTNBTLmiDBGznoYKR676OZ8HKa6UTVtUgtbaSqaCjsAzIfJl9Ul1i3Bz1cHvxIpmVhsx5h1wD4cIDLP6CpwVIyi2VREigU02+Q/zfxbPkR2WQozNEeIf32wkH1GEzpkk6Sc8wPEVu4ESoaRRq7+vfIpNUqbDBVHwiwAZCMqO+0pQvaqxuGm1+SfiIo0Jczzzm6mTyDsE9lHYvAwB8cgQAAAE6FmcYdjwWFMAAdE3Z+1xIIkf0kgVq84y7dqmdfeWFOiZoqYlb8i2wDfC9g7QeC65VQY5KyoABTpqgq81QAlcsmOwYyG+VBiiRyGjPBhTfkxBbNYtpLpLYbelGh67ivaZxv4HHkzz6ikT13/WogsbPW5MiRMLAX1wBMc/nmmSE6IDrdwxfSbWNUJXBDLBTYazwVYjc/+37U5u+pfJLuPDHSUDvm3Tm5pMpMLPycP635yMH1TENqWJFHdTUyPKxjwmu/qoMN0n4KR3+b9cGnKa6l0byY5bqkeJacRH9r/KFFpzKxep9zKdIJfZWpuKtcJbtkKoCUcZ4P10jZHDHx6i6lCI9F6hQwQuMmUOY7vxIFtquxbmtFI/LPRNX82+KZnkY4mvHHkPjYIPNKu6PghBaNblo6CJyeWKrlPpu+AyzYDnIc3beM/vuvb9yoKfarWwgVCGnTXExjx/MFlJ5zrta+iZSsVkHFUeg176lDly1C/jdrql7TLvo38eiZCKBcC6LtGRQiYkXW5uBJd61K9sdBx++nIOgfbVXQpXFbsZMkiV1IX19oSG6vFiPoJHygaPMyxebS3/HL1OmHjdMvewUXxcs11JQLMokSN7lJnZb7cJ21PYoiLbH+i+bJjxnUSkOTWRz1hgmtcluzluEgnQ7jg2Ynr+RAKdcRMYdiozzGOnOPxg912b/DGx/LFjZ57FpCl/l1AtmLS/4ItnscV/5iOMaVOWsYRxW1Fj8ipPnPOQ3ohBCoUHZvpaGZU7LzbG3BuOvDcXchyglP1VyQVheNTuIf3YfBowHzRPa+MMsDUXRPXa2xQkclWq06u7kxkHrUjIa/LIvan2mXfSUQq/lXG0zNTknkiqJ3k7Rn+x1WkWSp/tNA3QbKdmThbXvBhOROcgLGZhDNlTsCTily14Skk9M33FWftBTbiMiAHiHk78/VyISSYJnp2RJw+MS+8wFH0o7qlX25tTjiz0UcqRVbArGrcTOgpLKG5TxFnyZ+OkHohM4w3okwA1+XhidkBpYNUdGR9Ha1sYcy/6nwsfIMDbi7j//u3fZnoYtjwuQhJR6fjWaHsE23pCDnik8L3n8AzG9UnHX91in/pjSNY59p2CxRwOSDeKj2+boiFHJ1tLUfBkh1LARPI8VuTSiO+QRH6bnnaJ/Yz6mGSk/6Mj6rxpYiT0SXKc5/IWT0dP8QgKJDBQg7Og6c9CxCfHX13p/wkYmGK9n6b3Dumjq6nK4BH48GVA90CUQAwv0A5j43BiL4F9oo0YI8i84ItsAYvsHDeUIB6UVg8DmJXiLDG85B3hWegsHi55vHupDC2043oP33k1puEGtVLk4EeUkcNxqHQ4Rj4Ss0ZklGzCWfwbezPv+o+xQcEmd70KnULMPQAGcrkE1O7TjQAFROIb07/sbCC3PZsc98+5/AI9wvTEr1Fg2KfkMpVm+Z1WZPMmm4MQO2GWfsAlUpx5/e8eL7RE3WHSln0K2rpAoiWD7PM8UukS09KZMPnmui3BsaVZ5LLywyIHoZ19yZGu0Kj4v/w/G4VTL/M4z7hf6b0x4yFr6VvbA5YdXXYJtmgMEgPTm3Ocd9S28J1H5RxZCA1Jxiq0PFTpsq+jD9HnG7LUhKCG2xQ6+E1PJfY/ZxI11kZ9j8XkW6/XJziVAB/w9KOZMf7aPfTGynwKPP4cCPkm+mecZpFc7IyVTi+sz2EznpJ0stwaPJ/kiLieEmg2r2PNjZ2+GoMwBUacuMVb4uQCnbKlAN1udwMpMlvsMU96ZhpcusHDq6RbLyOEL+LKc5QOJvz1r2SNKlH0wtMfo+mz8bt5zkbmglpT/vCLdAD4RDIrsUGHcoLZgAXwK/GbFZNh4czLBBPlTTZviMYFped8xrAu7kajiB7V8zlflr26uNMXMw2GcsLTfeyFtdv0zqvvnYK+jqKU9bnXR5rf53Nee5KxYUtLWwQB0ld7yMfpt+PjEeG/r0wnHmOTzcqptvLeTAmDswBaJ8IuL6EY7ASUIMA6rxuwX3i8jZ4Pag4D/jKmfq7LqF9418smtazklf+4KZ8P9od0tVWyjmfDA/Ctc3zrKe6zx8zVLKY7P3PPyo2seeE7adV/mI/WqK985VUbOtzt+RKeJ6y4AcpPlad34Tjdc6Yl1ogJ4WSk5lvXzlJTNcD8oxOnEHIfMtzy59LX3SsoXBIPSAKrthj3yqKsBq5FT5jt/qiRQBgpwTZBSjN32xSq/0qsRcCFcggQLVSeSHl/818dFuKYRqobGmRRvpEZBA9390uJywe0oSjZNGb6707kLLL7mem9Xeb5R2gJx3OZkpsXkm9atx3StCvH3G08DPhhnlA2y6MZNiLtkpDPVRRR3UkuhOs335D1lof/X+UGO7vRkaelAJweUTZ6FeVJIGh4N0Nm7K1TA8Nnrdbq+ALBP/SbfikZS7bFqJxcaX4yQxbDn/OBbIlwO0BqD7R4Wk2hvVl+7PtBibL8EOzfcLhVK1lBBp2HiZ3GL5kkgJewsUyinBwMC+7ayI/wOGmCYv/ijn7g9wieFWoSw7OI7EoYigexRsgddsLxN91LjBG5J9xw9h9Q6B5GLQ6b2NH6B2h9pmaG8LoE+n8EIvgRjq5Z/aTqkJ92cyQvZ29jSZCRTJ/MSFEKgh7lbhMzzkIe3on58vhalqOcheV3zcf9EPT6KaYwvLlR1Y0swstCZyRPqXil2jKml8ofSlUdhV0M3Q/Ok2A45CfIbL0FRrMiXBow3zmg9PP6rZfUWyX+rLsvtp+NGkw+1V5zIXkkrnJ96rZatxzVh3wEQpnVut5Y9JcIqCpuAv6H4DKhslXfSnhxr0oQmIP/gPoGix/WONYGlPPgpriI20tnhN8eTFii7PA3wYhnz/GbTPlMqtKKYNZXvms7FoxZSu7Eby/w/INzftjDJnIVBTknc9BprlnidXJN1ZoFApgFLtV4jmTdKN2lED4Ax7umntqARpdb+qD6sn5bTuIda0uFbk2HVTMTEI7Bzd7vxrXJb4PQStmv0cEfBfqUQH67520l76ix5veb0pTvq/uXqlfYyPEPskUVWEBZNZK3mHqc+XHQVKD6lgNNeGHsvV2brJxCPfd83Wkjw53s2kJmi+6+wP9B8mKrTei0IKPqLbFutzAhMrfmyG+kZxAD/HjAeBPFmVilSx5/659vk2/k09aen5EJxexF2DAgqkBejtdTISCcSyIkxL4YPR69dVjIxt/to9yxPwlt6q8KJ2hMhR7crUABHXiNRs1R9KEb8cjtlrf/D9tnSKrvvKgq1HSzKVLjsd4t74efZhVycEnzHL8QZsq/iLshSIdOoIXl9duy5donUCD/awfKi9BYJFMumBWrRpf/qHzyHl+hKxn2tuKUOIN+aOemY+jY1cAHizZzCxP1NP53/WQrmNOQYP3xFVBwBHVWvs0MKEjwk7tEooc7tDz4uRc7Cs8BpqC0/8oGQCLnyF1G5Wrp+DoXgJMveaflm/fmf4slWQt03KIJTrC0IJuYHQpYMARtxcLDcUcLBDQee12VHXVEhIrWQZcJfQH8B+3V+I7GDU+Q9KzwkQsIn1CPnU0oTilh0UaCAsAA3WwIZdpe1g1bmJySAMoTKP+1zqpO4KdAbxRvG5hwqmTpk7HHbad5sopPs46lfBgS6Qw1mg/RLWMmZVdvKQmYQDvrse5C4E3dNrrzif3kumcptELZDb8J4kHu1pbqqhaz5H29rkp45VZHbw3qPhKf9mF9/7XQO7IUPt4Y6UH7k7I6xNREoUb74GHfPl75ca9OGOnmhXeTj1/TGJOaseTswyZdT51j/07knkLTjub3v/tqZ91/qvo8x3FnmPjjtI3Sj0obclU5dQyge2JVLd4If+goIjKqIfM1zpKilDFCbVtGZYEwSVgk+u/cqvEJW3Nk89wVhkQA/+hktsEqEsc8C13TXw+un5XOgJ0e/V6TI1iBLoaffQNddHhvN2QPiTKxfMRmy2Ak4HRXnUvqO6SMCS3iF7sbFp1OcT9uELXlezKq8Qog8ZFy4LZzee9+AD4PD5Ud5HX0j0HtELJTOAKvFrKTyJQKnDJg3mNy5LvzatfFyRDuDzA4kLSZAuVFnx7lbCCm4zbMDFfcS09ucYPkAziBOEqod5yy9P5tJT3Mgu4/4V5AXc3EBu8xE4Qb7ePRP8phAP5+2Ac4YOTPVUGvg7XQuxkZy0gPdWyfLXZcD0GN0oyYOxYTjLkoix9ChvsiWRQoZW/W1gFcTtA6O3MzDyTy9OFKd2nuh6T0YiAabAuFiLCt4dXK3oxFT755mxQCFw9yOFBWvD5iWXjpBJVFCRkR8g42J8/b4/tVTMCNKg7Yvidalxi0gPA8J1YCo5anduQj7keIi0TkgPtyhnroxi8DUnQZC6eJHRnhjEkP38ns7GtHynGfYlQ32fgle2ndyeXkLRgC65AanzCSO14ObA2JYPfZwE7McQbj7eo3d2CjLvWaC8cZDXiVZxbB2OsLtsW8zC0ZF4K85A0mLBoXWI/ZdEmF/ErRP+wBoSl94Ybpkhcz6mCZa/8Bejj/Che03yP3ETxwJVQ2jhVStT1hfE3MlbH33cPLkXF6Mu6Cl4kcjUUOK2iecLLX5V7ZQWCfH6jO9ppoB0BV30EEYfF4hPW5MBEo7nZGjoLxMguoQ6PoqBZsTWdqiKY1XpyMiBxkAbdsws99B5e193vJak+gQmoY16VH9QWPweijdCIq5KMBtFsRjoYWx1ruT9RtMbFpGbdr7mmaVX5AU3tvyJftPDOoeIgHthbvShI/clUQ2BkmIssWEfC9ec6w1wOy61aw3zv42eosfXsTXSSPv3Ibd9tweVC7Ooil95oTMxLi2gCEt0hpZdWb/srCqbL9PUM1awHpW5JSFfklmGuLJeh6zKvSpp5etDfyi99+AdFhD/J8sukDIWhiDMDBpGzqZw/eq+kftiKEBKZ/3rpP28VVo5PwynPEICxqO18fb/vPVQQ3g33Fe0cY0DHHJWBZNgN/Of7d0LXENNWQjcjAdhL+X2R1jQUkm1BYyK0KJoE9mgNKdhGSjnHTe+rMwhhtx8NUkAhoG3KEWznPu8WJDKwN5wTwfmL7qtwtNQJNnst5sr/PVH11xVCSR9QlQdYXphD8YVcAPd4/KfFaS/+qdPNQ1j9XKNs9q2KYJxFKODrC4AYqu3BlhgInRf7fws85jxFCLDoJf7JJ79+CqqWjEYtHfPrTy6d/kZPrq76VimDl3hDlFvjecfWI11gWemWA2HEK3Lqlm9ebSKWXwagGSiXjGQCzZ8SyYXGOX12Y3GGf30k+ORgl/LZtpzOcPc8yiN0Cy4ZirI+mG2/QvInkE2dw3C5KnBzvV2zwRoWcuS9L+tK4usEJA71dhLU9VG9iZkWVBpw9bF7f8olM+5MGmjDz9zvJGL8MSiw2h4uFy8/oA1hefUYE+DDOvFQ84D4XdcxGLKBdycCCEiUs/geI7Or1nVM8bQxcSrO8fwTy+EfwPY13g9GSSn7iIaJin7NbbGnoOfMFJovLigRXLEtwmJGO+fz1p07BLmS8nphvNpnX4kEnymWwY+GTTW9Pc0h7TqSPTi34GjgkQtv2N/TQaZnGfTpWVhsGQBv01buFtQ+y3z6V072edvyRsiUaVMzcz7eu7JLZQL31gNP7Ify5NHkDxkCmcnpqjWG2slVx6MSn62RVKiWbcG+WjByF4xEPcmUB7/TSN89huFqlMG4sy010jJYAfgu1ir1dlsbKmqPfp5OTPHB5NB+B8J948EogJXu9bqCuOJLnYDytva7ri3ds/4U/2RlYmD5bcMXsIwyONrgcR+h7jDtIeTp/5vaBbsR04yVLWii7piXtDw2wkvXzz2f+DU0ztm5rjKw2VOhatf4TKPHI1Arx6pptUpw5/K52j3MLkI9cIiLbNt1mMGTRGA31AKlbNxGvhQr1StdlJqAR3wbPlW3xPhJzq2DgnXgB/JdQ2m/+tMsD4Zvn9/m2i/JdEO2t4OlJVhuHHzvlzoYwiLTUrvh4w+7GEu4VLkcZTlSqEm7Q8A4rAAEl65pEIzNBxCNCJ8NPxoJbtf/UEr/Al47dXafJ5zBCT3C9cQdb2a4N4Gecog/FKvucpMeb6lRNfg669a81NnjCguNVY/Y/q9wRNcbxhCyysaUEFpvy9YZGXC+Z+CFh3Qv43A5wynMdbvVodTY13B3fJsp8oB5Ri0WO2DybqhNSUQXj3oWHo9fG74K7KoeIh4VP7QT2P9eZSUP2KuUFdxP858G/yqR09UEmo7shji5LSwzkaoZoKCqf9ufpNmQQtKo1RtCWAb/iUivwr1BWlMEGHr4xGyAjaMqfi/jvoftrYzjDColUJh/p5VaI+vlJgZOOBYGSoPne7IQOxBaX/LiNFyciBUF5eJ3+zrxxbiZT3x4Q1nvqXl+8QFJKpBgALJg/gQ6ZWcP1axkH2EUtFzELe2l/DowseBLzXmvGbqq33S1afAcOrEpFY25P9ufcz7JKcWkdMEMAWzNSvSlbz162TdmuUr53ym0h3N9XjqL6wQ9Kh9F+gRIRMHVRQ80z0yf3/yy5/UvtidCX/y7uEuCXpEDkHCKPlYP9J4XNb7JNs54gmNeKdnCsVzBsDIyOAhydq6q2Y4YfJ1Zdb8QBAvISReoAAAT0EqmwAV7iKJlAAKcICYXwCQZAAEH+AVb/VXxzpYvO6ILxeCYwtSEqueLwb9MHAIqi6tzR+tU8G3eYzQfNQAUSzwKiPxgXz1XMAA";

// assets/screenshots/layout-guide-zh.webp
var layout_guide_zh_default = "data:image/webp;base64,UklGRjInAABXRUJQVlA4ICYnAABQBwGdASquBGABPlUqkkcjoiGhoNKYYHAKiWlu3Mg7JERQNEJ71p89M+Rhy53/0tJlvI3SulZ7wfMyM8oL//2rPUe4x101bagP0r/WD3med06wD0AP1d9ML2O/3D9HvVufpH+p/z/qy6K/k/6B+PDxd7If2X/3f4j5Nv7PykblfRH+VfZX7x/Zf2p/sX7c/eX+//4Xij8rP6r8nfgI/Hv5H/dPyh/t37l8rkAL8n/nH+Y/u/+F/839q+HD6P/T+k/1g/y3uAfyb+Z/5785vkP9lfMa+q/9j2Av5P/V/+h/hPy9+RL/e/z3on/Rf8l/3P85+T32Gfy3+vf8j/Bfk786XsQ/cv2Yv2Z/+gOJcCWyF+MSaJGs+R1h0fj8Nu8st3H5if/n7eVqFSjNSDaD/w+3+0Xj8fj8fj8fhwX7xF0j1Xi6emNpZ54TF0p5fbnxKshKRqkWqgpqBoHcdr16dwLLnNlH2IVeCol23HaroCDXg7KfyvSFuvaLx9sx+EgwVFbiJFjuHXTD9e5le0Xj8JBqKpz/b+M6hiHZx1BSRbjtVzRj7YNQhPG6+OEZZcYjaDKTVdF44pkmGJbguYfpmxkOzpnRUhaQYzhXETDTmIujEb3F7M5Sg6gS523zPkpd3Vy6NV666znebPoX5KjBA1uE+36WzpSG3bd/Mi6LdbraA9PqHq/tiYTYN6XT0i8fj8cR3wEGrhvoYTY+Yrm4VZOk0VmOO17mh+GeP+jWzW6ONKBt/F6Ey+Zvy2txqbO5ZrRFjm7eJh0xXGijntPxuhKL3ZakazNhsdYxlKkSPzlTuNamYL33cmdQoaS9IokB97lFV5yuqJitT9sWTsFmheKlmNJCA0ZxTOHvI4EN1JDaEpf2RcsXu41VMfl1jk9EOT1Nc8MzVy3DvCrRHOTX8D+3OMvIZanAsEHQsoXO/iRcOwLdhHGuQO7edz24Pwzqu4bzmSCDvdjcQiFoUhmwWF4O1onRsI8ugJmcl4gB0maKRRCjS6AetqNF9ICJ97XjzQpl6j1knZamuf9ejYXV4aqppaLbcntlr/+CGs+h13a18Y2+AThKNBu/UHesiJnrGtvPyY8Qz48fPHgAmz7BnSilKE5DSx1vTlXP3gj3PUjWPv6mNkPMAxdGD3ir26SC+ic7He1myCzwVWPi/4mF2aogApBhQKMCMsX3MGUhafI6odBVZ71QpJR9aSEdS8q69Dd5OOZ+lkd1ddxNQQD05t2PKp0Szsrw5q9GcRuEuIhaKzfp/KSINE+Ln27ZaoQAYgPP2pVj0QVlP3hyar7XtC40PjRGd4ztEQb4VEChyJtHCF4xybDrY+qcD0izXd9m3CEoQ5KkzNLJHd7PTW/+1D325BP+GshLJdZRCM34//iT7v0b6ipUBeUYKzqX4l4zNXLaN3ieGuiiyuWBBKRqb8jrLpFKEB82pDvS018v9Az7ibu24o0SLdGPw5OK1Llqgz1nTqfnEnlKGyYvxoWPWqiKCCfVGTbxrfJELwh4wObo8eMjWt1EOGcEzXMeLqakzRJ57OJ772i8gNj8fhoP2jpVv93olnDlYvgq92tx2vaLuf/zRjekqrVaaH0BBxbq59qONcfMR7OM1qut759l6yxueEcf+Gcq25TIFRLtuO16vjMAmclSxTQdtTR2yFBWu247XtFEnuyPXxqPoeMpcYZwZZeJtV8defz2xHIYbEKuL1hlGdATi4czOqlx6IWis3/HOTYc7FSqUmrVDByVF9SVS0To/3hxXDoVwE8SSijoIrmBxpG5lZ4wwoBDvzp5gDoC8sST7p4v1ndTUBONhATQM/DcdZl4gBZjyQwytg+EnJ21JoRoI31NSYKAkTT0j6moAM6Geg2oOW+zK6N9TT0j6dANyRQj2bt19+cXHXrvEOTuYuN/2wCaa5M7G3dMRt2V+yyl2WUuH/kZwXg+XjiIPzv/HnOSVO3nC8WJRljcvtulO17mi4/FKVm4e5+rsRfmKViIxCBb+7RcgbLkDZbx0xrd+QBsuQNltfpAkhFYLRaZWX9m8BpYFiRrPjkYW7GIZ0WF7NdpPza85icMdVu246a3NCV23Ha3vRepC0+R1W7OmnVt5Nhmj+UYZT2E8uCDBoPp8lFozzGvk1DUcskU2QokxYQQsCZ1NU3xz8HqEwEE/vho13Dk1ATK51DxnghRbNjKn3aCkI9VlbNVs5XUgRqIaJxeKrwWg9LvXJkrSngXFxwqx+DhF4ynRle9cTLi8Ia69J4h8/kvI3nzfKH7fuZ3yRjgH5CDswQoDp/XXpoZsLSYxy6yUhiIfwJw58eURA9DrfU1ARmM7LPZ9a8gylVrUCj3vJo9AhAizFlqAByMGBJk/no+VpGkYpbrR8iy4V35LJK9XFWD0j1+JEhnJMbjfUgX3sBcUDG6cY1yHs9aefL6yGNsGp35zqFSDvfrZ5mgWXzs19DXPDIspCP9NeVNRNMXDZNqpHBMuPZe7w7LMBG7TsC57d1cVEfL4+IrP2Gs8ryqKBZTCOUMPAmPm7WVCd6yNj5WH0AcR9gz8bFwFewcscuse/G+536rb4nc/L7bmHYPf3Ksb4bg3Eocnx7dBNaXPDYBQnSIA9QfoIH+qQ59LYJWd2WvgMobO5MTdlhbqxEYbEDpyDgeNWglQTTqoXliGM3kUO/uv1OAbW1H1+BvV1CRDqxuTuOf5cey5n2AtyLX4S7HohcKB63JlZrNkbaJfnE+qGlx/BOG2Ls08JBWI5wKk4HmAuC0+/rQKdzksnFMQek2XOk30OIBVifAC9sZdFRjfU1ujjurbmHZcey5rZ6j2XL9uYdlz0W8cUAA/v3qzRPXAeUT5ucb1Y5BJXI/6IeJGwepI5vBSmibzElNebVssnYgpdQwMHw2TvY0kb+dphuMV2BjMuhH3uFn/1lB1UvM8ActRsqPB8xawCPAIENOoU/HuESkFGDUW3ubh654qqmEwH1ncuiBoJR9ahTF2/S7ZSAhs+Yqw+Ll5AQ4A5gP4DHaH2+XkfJ+tWq60l2/UOmHOSGBdGo6NdjWdL/zadv2KtkoD0Ugvdt/5fQTx1/4VMMibhcZVWKIAB1c1gjykj/QFNG2Ao+Y4874c3HPxFYyCItwJv252Iy1E2tBZtQHssrWTmn+oEfiex3A/qR/yUoPmFV4bgKn+HPFQ6AOFVxfvEs5hKO+AhecPWBWcy9wwWoGBJJmtaB2I7qDmxqoOuYXYWZmQk1knQ6e8ugkmptcX1b2IDdSjOyhHksgQ4Y+BRDqD+pJL1ENcXdJ0s2pUwMo7rGBo8SEadhYaZ/m++gHUy3yoE6FgQXQvGO+ktgBzh0l/Y+P8pIGQ6L32BDeH7nD0J8Yp45a0AX3CATySxgJiCnADn3MfGvMjVM2po7qbLm/Wmea5V3Tarn4B9gXCCXGBhoBxZ2tJf1aqiq9ELUttBPBng8iLV2J/zW3yfRicTvUG589gvWY7yokQ7Wd4n/6yGVVGCJmOgTa29MFXzGd6qNo5nPeLo/j1RUA44Ls8XzCdeWT0Qn2nQw484JFwhC69cM66evUbeqREw95QSwsaW0Jqugfsx9AACT5PQHL9/emGc9WKbsTWQMUebQbnu6FbZlyyGffHZopzIkmLH8bETR4HzFruFQpcGtPPbP1sCMxAP9ByePUfl48oH033WYQaBxiWYkJDOPLRiQ/i72JNJAOXtF8pai5ssmzpqltvqGCz5cWU/9B5A6YFp+1RrpvlIVmV/K6lbpKIckAb41JnT3jOXTluRbaCqBYnJ+wMkObBpXzjPpRoOZwUaWoxW+M2P/4MUsgw1YGS/yPy8A8V6Ot35n2yzbjxt4mW1o/BXsWiaK4IGE8nJkKQvZx4pXBeSBHY9dVyngiloNVWTcJ5wBT83T/zACSIK76CZaooZt/CmwYpusYOFlE4pjzWGhWCtoaFkdoZVmt9l4ZIoYhlVKROtx6DqBWh7WqrjR+B4/gRpwASFZuBiJ/lOcOMjuqyrA7ieYc6QMznR+ppXIabYh55d0UDTYMahU2lhdDQXp0KdyIh76i9XIWKxOG6p80I8XykMmMGJ+ekzbRofNn6kBvQY804yXtjW/OPJlpnjynmAkTksEuF4Dz84/7Xv/1qAHNz9TZLJwEacAGqeEd/tjVoCwEoTlrlo1Q3/vMMAAB+ZvHRUyS+se49U0MNVTBpXu+9Hb7fCgjkPw1k9noc6a/pO6P6EFn5OVYVizubFkCTkEcGdCY73bR7KDwP/UbAtielexHC0aw4aJ36k7rqQWFsvS5eziRx8kXwibrb1FgNjbZsHamnkWYTNACbUAHlfUHGYVLOyTRxbS9ivuGWakcgPI+HzCjS382RoT3nYZ8fxHGkyzsWQj2SXGTcPeCGNSLPUUJYRpsm6fcXDY+JKc+GCt2F+eBA98p8ggIqOfMD3SaQ7zlOoC/o8WDmRM55uM+5/c01I3tqbE35fxxrFiZ4TwgDSkfiZ9Z+OB0G/DfJ3q/bc2JoOGniZkDgfLQYqzDO+JSIqdyqJbHl1JGdQx3sL/6aQDCux5jvY0z6zMN67ZjxlBK20oPIb/8Lzxu76Aaxtyxgdtf7taps1bH8dysBIDeFzllqOfhg2A8NNj9+T6xZlCBOkTdrxyJ84bffUmcbeeegAufJISzySFjublrY7B+bPEwIZxQlZDIN26UaJvcALCXbGNHdg8jAxnR/nTcy5ELFkFMEJpGiFA4G31IFoYr+HtTJFvcqrMsSIrvEVWULMliygpR14W4EeMW/KQ5fidyBLWB4uoWAaCM6KFlqczfIDPkpe4/549D4oJ1+p7OSxH+M9GnACoUvQJK6VCqB9GpUz+SDZkFv/WUfYRn0VaCSNOVoDF0fGnomnsNfYnz1WkMGAwPYutZ5yw+Y/aurqGxqosk7se2e5fPIXN4v6aQEvOr6YthA8b6sCffrNS1s2MiMwDGOPonS7Ltm6kFmfX8ctvDdTyoLEDuG+u3o7mvOUFxEqF9HQPH2toK2eMDI1mrs0ohLHksTlOFXFWiincFkktMvoEWpIT9p/tAjBONxZ1uhiqdls9Lrv/R54bt+rEHpFyQElR01QgB5N9Z/5fzdpF0Ac77NmbIIuejDh+qY9/boVe4Ule5S2c7hQw9MMSGggVgxUxt30nMYqJ1jfwySOqtZAUuxuEcQ0dODv86gQxmwzqeDlLdL/3kyt6nL+A8b9sy7Xkmf0OYdc+fB48x+T9UaifFGrnGwJDj0ro09BMalET//PyoBYep3HgBSRoFnbDFIs/MxUuymbDriXT9dnIfi1vFX0F+aOePIyMfaNa+UvJXgPuPK9qfgAdSgFmjPjYeWpqZ6RCJziQZjWe5S8GJQLfjUti8eGhUfhcvdjoB/MBKmB+gSQecRFcmWQpqev8JA9F9ydHuGF1YdaOPjOwOHl/rBsEXOkCpy5mVzZdQUWxMin1kLurN7Wnwp/JVba5HCs6bGWaapJcToOnpXSRCcwiibCIqxJ4QL9D3byBL4hxCAARucQAAcD7Sm5lKcEkN/doeJRD2NnzR3QuCOyvDJRz6mS5a6KZV57hvlRhZOEvlOtIpVWRV4d+hggzj77bnpHIaKNaDfCuJA+d/My5JjnNXXoG5eLpnKYF/XUy/qRNly29SIg1BgVaygZkSVtGRvAaVGjUrct2X7qmv51ofn0bXvmv0/VHhAZkhHWHtpLVL14PW9w6Qf+fo0UwAIwVwZyrwpu5RlN2tVOUWqXcXW4iRZAl9FSHFfIPzrTjAiQvCqdChuG1a7+H/ft3Zszki1RWVUCPls1lLM1kctHmjRB2ixLPLZhfyAuh5wlNXMeZbV8/SmCGG5H/P2IL+KnA4oYf4a0zKniCjAEs4efuCk+uHlR2bttNUxfP5odaEShpJo9mPT2b1v2bpIFDEQFjnj2DBkp5xWaV9HXnJeZZ/VKpNB3AvPOqM/d04HR3TadZgAAq7L2lV1Bh8c1JVaOLOD5bQf1XWsMRIot93Z4ipKvOe+DrIo+kBIOnyA0GFBppjDZohrfFy7s1kuPjl9RlaPRgxZ1Ih/Iit9dd6t8MWeZ9oGYH/TNcA/1J5Fkz4YMR3pkMUbWZBQQz6u4sX9We/lpJtDXkmrQ5n8z4NvOdIoozyVA1V7ho1FqfxHKxEz5KK4ddWSimzkYOUzvOcC98KyHyZgOIUtMfxpL1nyyMLx8F9SDsNfT8ERiw67Zynac0hJSqZOdpEDcq2nO0oAETOW9cMXxzeokV5f0TuQf7/NgmqTTsEADzfNF2/iJfj8JaT9fwK/ko02vNpaStNSvY5LSf3LQxixmxX5dO1tuEO4UTjtN/L2bu8xlXr3YlN2efaMIJqF9knWtlE3ctzB3bywDe22CKjA5G3Mz2uH1+WJeBM3lH+PeWFUOxYg6EFmqMqNCkaRAEfU85ZdPp2UjAAmeMlvTze5EP5B0rHLi7C6tcw+/+Qnxrc7sujLKuiV4ud8IVX1mQSZZzELtyvKyLLmM702tPH0p/ZArSovEomVprjrITfsQ61ll0TlUC0H/S7H3xtXa30whBAahpJgEu9+y9rsNa242zvGFP6UbOb+Yydcn73v5boksrUPE0AKDAW5qNADfGn7wVeMy7ydsSnVtVfAAAABmU6iJLcwfL/wgR3ktosWIAABGwQtXGqXUtqGZr75BYSZG33hAjivenPhi0mQ2g6ix/sYG2MqwOT/0HgEKFQqRMd4ASwDhDsoAAAABUpciTkAAAAByj/BiHljaJcAEtgRbwAAf0M+T0vnH/P/tV/qaAAAACYWXIr+6X/7cpTAr6sOaonpL1PfAAAABA+t/4Nwm/XSuPaOPzSLb315lAABGnADfb/9Vu1S1O51VBQCUY3KE0FBjb0GLJbFKbbprKrqxbTZagXZyxa53vLBYzXL6Uo0aKm/pP1mV2LnV6AmkUuA/maE5aiKuar7rbMKN/lljzMluX0oojdvVzcEKhYe2hyKZE8EGYRkR2sFBPnglSSwhDfCS1F/eC6fL4Y65N95Uzh5yCtMKLlOo1Qp2N7q4/wz1HOLyy07EsvNm1jKB4x2fTGgkTRTEGMFOvBwCMNTeXW+D7HqlVGpwNhM1Q8Ag+X30OKpuOm9q36zqZU+VYTs9e64VSTfv6X26NNn7DiQJ++30FXuv6+quENpQf3sfiNtFUa7o+Pab/2gsHC7u9O9gqYjr4OIsEIAAOeVUEMP1NQZTjuqdUd81I7qyxfMi3D/Ryfn10+KsWGroBD5bc8ySKgActJp30cJIAFGiAXhdZ1z8qkkSx9wEm2p+aTTLS85mt8pg7kqyKhw6+yWo1OQOn147EIl9j1kADUTs7qO58M1LKXF1f8h7hllDnDzyGzUZMz7wGKP5us2vwfS6W3YYWBHVso+kZTWVggXS22nfqsyVksU0Yj/yqBFA1VQmHqqZp03G1e4xQdMa/T78dZvc7hLSE8xWZcwu+wUqnhU6FcdAbGjjVwBdDZko3SEY50I8WUf26GlBUP5oEkH+w4vv7rA8v5YS2Vmiq/BMR4UtJd7udkerzlAzVhZ84SU9IEZbu/Jv74wu0AEzLKki7TuvldEByKMUAUbJS7YDWk6fz85JxRgbKi+EWO5V9KYmZyKVXlusz337ijlJmb1fIj4hFxUJB8ERJ3St0LAwzgPB6pd/Bh1t4/9TqHzbaRaGs9IcbNy1AuPZp8XIVlpRQR/o6F2j05tKYLuYSn+960dykuMZa8H9om6SBP9k02aC9rZqJIksAL39XaF9yYOVi57C5shRKeqDx1avydPyrWAM/laAizPF35N62+9b+GWSKCwQG838yRtOfsKuw6CgdC2NgXyc/M7LeNATltI28y4QZ8Q6PzZYHNu9+uJ9VQ+JGvq8L0CbvbwgJa9jc+dBsG1fOTTt6hv6mF5T2um2FWhrLWFwNvv2rIqd5udK8m8nTpvTRcuPzxKcBdd0u/qDGw7GdzlX1+bplrHlaGFC0HZ78KlAn22XldnUPxgxTkIgZEJOLj1oSaNQ0dqh33MLhgBWbCHrubHC+BMpIgkL1L3n+ivmYXa7c0/sOTBLUb0e5Tov6SZylI5JEiubwa+rFzZqh6UrC1KYqzH6JsChblf4K2pvLKwrLH+ehs7rWJd2qVL1JMvuk88jqef/i8kIGlNQbdx7PB3jEHkasr5w9RQQ6EdXHkvAHwuC7P5Gn65G9yzC/UzQQ7t0ceRKlXpTjReJsNbosL6RV4HWkGAO5u7TkPXYjlSP/bv2mTAlD20Intm0w6T1OT1+VWP205zLEtKeAYUReZm6HaSYk4xRCgeABFosROe30qtx7ir25cTE07WluDAX6ul/8pV5rGe93huGzMOzXGCE+gSb2Rn0Hce3jFmFN26V2r++v38lEP1gRgRDSaukFEvLrwRfwacZFo8Pp/fWMon6wtTwJN1tdWOnUqToMCBiJyCrB+ZJTJvcTVJ+LgbyjPrrOG3RkzQfSkHUHch/lZNtpJiK0FWQTJz/G2lkzLTluoU0sqz0T9DQbqKx/NjJTUtOsm8wKmyYqeIPC+ZjnWgiI/9ToIDPfLd//NfCFPUHj3vkmo01Vq60ZuCZnPJJmPO5j82PyfyFlRQM0ldP5Gw+J/ENG0sq76NRTvZKKGbBS5nE9v8oFajtIp/O9mTvRxuit36wKPwC+EPj79gu3eQIY7B6cfDfGgnHd195vuWUHHVj4wgwZg2y3AvUfVAM8k/ab4IgMgETQg2wKeY60zlcaYhXvFQvHUlF11GAqrEOMuCZh1MUS9fNRx64QCTUjto76pgKKq0c1QgfCMElwEOyGiWt04n5qpfPGZbTb6CxexN7YbsvTxbv63u4J/6lIdnzfPqs3GsRTQAfA9fxok8OR81jvhj3kxEg4ePE38WQMmonqAqUsxAy4/bnWp8bcfJ3TpmNkOl6UC/arPf+3aM3a/pk5JcerT3JMWope31iySbO3jVPlKHz5Xu/qiYqeNm5VtLXbTBuPVrGxGXIo8+GhpfhARwRyU13EG6EWjkvEj1nSY4Bi+EDSSMOwuj0lD4sLQu3k/PlSuM1ShuxN2zZW3AqRZWGRLfdj32qL+c6i/OQkit4dgO3MvzHInxd8sX7uHfTyYNf7aY5Uw/g5OrgOdI9hZk2MQ0nyAG8qTP+RUPn/pj3cKsjHPNsL7CAbGnCx7YlPU5+wX4jsTgGEwMqtOlVERtOKx8jz7YO2sX3PNlv2++3lReyZOJKxPy1G36AgOUwEyFSumNUkqvDa1BY7Xe4g7HoteZTAN1U7cbGMuUQzpWCqDFJf94SpfSbuOlgAuCfYbNJUe/XW7SMO/SES6Gy3EhohKnjuC7sK6nc+tVJhvp2kw3VivytzJfDjKh/zYBz0uef8hUzklj2qkYK93MHXd5XXNG35xs9wPZ8SKbyCkeoanxNbfGUIG5z8vRG1T6eqK2fz/2UkQWzO738b8JxfZw/QOPbQgmeN9VaPOB3xffNYvBaucLxwOVvypAE7Vgn+oCcMW8wrNivWgMMWGqL+HZdIIGBka5iHax0PmCveE47b4CwnxtN/C00qm/Xew/fOagqoStQyTeK/hwEgkRT22Y15a15Yx2YQW4C2DseQyoamAIAzFDZ1n3BeqPcW/6OrPo2EL3YWdWab8UCf21Nqb7zKeXvXrb3JDwAxaRIpAX6xsfeSiX8HTRliSycXW3CUSjOVZslTlnC+lJeV9Ls55f5qN6WLkk3F0xAp/jnpw+k6gdvMONV5DmA0aMy3fkdfUclT+ZdgKg5Odq7yw3bzboWZGOMQVKfaDojjMitD50REBryhwWJh+chtdwCApZKarKGh3iu1YeHRv2r0Jwj3KsNldniB1tuhz9PJZWRaii4JX8Jhnz+Sl6F9xopnSgoO66X9gGsny9lSgU3r8US49YL9JsrnKq9D6GBbPVfp+ydG90+lxruGFNTWsZ315nDpyGwCUiIbR7tYfFpfFck4HLqRz/jqGYYZ2r79qw2rQKge4B005LjVn+WtCWIQb4IIXCyqkdXqfmBv+qzp7dGUeaKlpb+l4e7FvuS1kZY3GRsjoikIWJkKR9LNQDD3uB6LfoCtN4OuwA/NFY3hV9r+yDAnODcOA8kbgU0K/OY9G1r4ooqUg4U2E3axt9boDespAMQlod61d1bK7eSG/lUjjM9KVAppbgCYLIjWCfmm8UlZf/l9t1fOHryWmHZWdk1b44jBvJ8QWkBYEYTrpbtGOecwaQ7iW4v/+gaG/Qr7ZqT7eZLBH+7vRZhfNMvoIU2gCdRr3uRLzc5ZGNPbmfWU1dNr8eBQ5UfhsVsQPiVuuZlU84aD3/QxgOgYmW4Nmap0XWWoVu+5i0yeLPO5YwFqVM+xm9Z7hDtMoZU2A0UkXKX0WH79dezMZzXQXU9+Y1DFoXKjGZiVjYOwmxMrm5YDohYNLuwqkXeqOnJTDy7sjK9fhOOOig6KoU7K7/vL8dBaG6viQ679j21aw1KGv3ek+Z6nGUPFrYGoY/GE8/yABwagyOwcPnl2jeEhjWC3WXUqaEaZAqHwvbebYyJixqfzLd3FdZC4HfKyg+UGEe7dsswH9ldFE5kpgvsDFnE26F9M4RumiWOAJzk9AgxnvkPtliWnXJVMXd/ureTtphLoplK4zt9zC+vI7hbgsHkz+GRIMEeLwAglPmBcI9w7Z6tFx0VuiVtcA0pLE/5cfvt3T2jI7ppO+aKKFyKD/22fEn1CRNDiyf1tGzde+K/tQ2YZdwrPqHDGICzNTuqsxTQlPDsQXCFnRD8cWR3aReZQuRLw8emx6J+dqXqegOz+RfykYBSsDyA2H8IYHIqE9Uj5rscd7nhdV8n9TJc9xlJ06kFlKDtz9hJyidGX1dlFni1zGa9ZWbJnZW/KD6OSZCY80JtlNxBUVN54Rsc/EGRQTM0SF6xQ4Ojq8+SJ8wUqD79FwsgcWlGkuP/OCzk+eGlmYH6jm41ShIl5XoymBNtJTja+0PnPoZ9/DvF0Kfp2xXNgQBalS7jly3NK+1dniIIhSIiuZeCftRDox5bW8ULMKW+itmMVSa6tkaUCDDN+GgvXU0T9pkIW5X1ZMvY3tVdPyL4zhtCbl0PiDXimKvANFvz/GX0rRtfUVnHOcFiZJTJKbafU8gVPfwCCZe2nHXDJBSyjsA6HqmQ/iy/J52w9NMbsJ9W4yQV+p65f/3I9S5BJQzHCOc/lcu1ZeOl9Az+sVs0skLFNrovjnDlbyNOHtpXtpnCX94MJsQzlX3Eq1ObG7kHnCEoIdSTT9TdnJyw/z3/aU+7O4JY4wRSDiOXH64vlzl0KZTlv/i7WzotLX1h0vJH7RsRZ6lT5wMNFHoQWrF9RwOepLAdbg8g79nJaoPR51pNjWpfPTgLOVds2sYXmiQFH0GvdTaoZLKmK6IeLp7R5se3Pcqh4cMQTw+GSFp+4wKmTKJZnPjSP/37H7BVezApwyMGt/JQNmCAEXzkiEIPRYRTvq+cfQ+akLGGGwgPpYg11TK86sTW4++vJKKmEi1y0BzVPMh9g37sfUjcfdIEgNExKXGvc976bJJ90Nb+IYtVqcVRuOzda3ocxFFoEy4iAV6iLmTSiZbFDXCjBaKoif5fnX5uAf1gmx1MsujTLdlNb2f5yewFT5BZwP4OPyGw8VbCC7pSN6DqRmptFUN3gtTkJEFS9Qix3UJvQ/p8DHqQv/ZEeTY7DKNgtlDNBSp4lYCqE65QVT8WyUV/e6pofzCetq5+nXGgIsxQ8iD627nsL/iYDBVHbElNHXbXTpL45Ido7pqu14d0x0P8y20qVQv3Mv1BXrCJO6SLEbl4ey7f1rtsXe+SjNNmpsa3AiISgBC4u0M3CMV/zn5QhIePzYamef/QUBKIeASv/xPXhWLpn2TIR6xsU/bODJ9TpGK/myhewY4l4gMGMky+2PxU6kdEmbv8EXzoEzIBEKcWPsVz9Uvv1iaB9zIO+OcRY3suSuFn0DuUHS7b0qB/DFrSLySWvNYEXSIXKsUmU5j2C4pVvvn6IKKw3rqvH4j/YRqEm9y7MbrWoNfHlqSKO8nbHlX+YfiARKWXytT11R0bdozKypVDfJxf0Ey81g7/C1gcGvo+DsyGRUIanB9stM+mQvj4zxkYwrlpz7W1c+fjNKQCeDzWRUJjN24qHBHzxlji5M7z4QLLbZDltZj++Um6yaA10YHB2h+dd6YeHT9EPa1P+21jis5DYAiWAPpizy49aK8UfE5j9XS6Rucw/6i5UZR8PeogbM/gep17uKTaqRGXNBUWTYH5wz+EzUdR2vJFDvP5KkQKNlEJtl3SxVWnYfYD/hy2KX/J06yzWQp7GDlR6VpICkU4i4BPWYG5bqkHMjg4SklF9pI3+qu0Fl8jgDtEOyTLGn5Xen+ziyKQTDEq7953f2xovLou11XO7msYwufsf/Sj7AMFj8y0cjF/svAWdd09z7z7ARkyp/Mful/RnrokQb2ZYcBhzIsqB1JVptwX+USq2ng1lyL0do0A3FHj0F8nLc5J7G64Ondxe95sG6uNXH5jtfwmQ5jaKH7KvTSbaICYUDvLmCt5ew29et1/idtWV45rwZM0DjKD/E4wVAm9KlPMS7LL2tBK4rS2lrv2AJmBKGHAkvwWZf8ElvDUB1Mu9CQFgSH/qMYZtWiIS3IbeaULgWkqRHuVTSoCRtpK8TDZ6g0Lf1LZ6avHXeuq/rgV7rdZUQ+JMo43fmbc5/8YsDuoDv/Aofwr49suP5lIn7L8qYvdjhY/3NRUYu1HsEf0GOlC4P4void82THnI4P+LifyUNz2L2+vphntH5Do2zjQ6eKeYaqmeBBFs+ZGp8Dz/hZ744iuLwaN/zHSvDtYozvl9/44z/84UHDKY3gXn22Pei0Et/4mLU4qoA4aOcaZPn3U7y5V3Zb9+R1zr8DGenJVeaLZED6LAWm3YLRlqWX39meft9fR60YY6GT1DldvijDNhnikcUQd0O01bYnOox+V6cA2TIQvOVkQtwQ1ecUAT+a9t1F42Doqx/PFOQp23nHcHRbsJmcGrqTJR55diRF59hUaL4uIDWm5q2Ntxw8Ekw83lBmnwAW7bmlKbCzRHBE1LUxtVik9qZusN+nsBb5JTuY8NPiKwKqgJr80OQMsr4heH9uPZcixRqqnDd/w4/YfTnu4dw7v3WDrP1gPOQZOfnJuF9OVLJyTMA0m3HHcgwCGit/vbQNpLCRG1bK+mriL28Vk8fIpTBoWiCYki48VU/yXthjustBxhpcxee1y5ZpW/uL5xMtjFYH1LruTvB4NG6zCvXkUnM/HNzaIYM7Z5YAYbDCYagI9uC6vK5YO7HCbLUbmpt2wgS+mAWxmVdmO1j1orM2yi76ORGcoAGUAl+iUm2i6BAIeoiU2QgEXTc5sYs2e/8+MnGkEBSOyGIJAzBieQAAA==";

// src/client/ComposerLayoutSettingsTab.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var unavailableSnapshot = { status: "unavailable", value: void 0, base: void 0, user: void 0, revision: void 0, writable: false, mode: "memory" };
var unavailableSettings = {
  getSnapshot: () => unavailableSnapshot,
  subscribe: () => () => {
  },
  set: async () => {
  },
  unset: async () => {
  }
};
function ComposerLayoutSettingsTab({ t, settings }) {
  const effectiveSettings = settings ?? unavailableSettings;
  const snapshot = (0, import_react2.useSyncExternalStore)(
    effectiveSettings.subscribe.bind(effectiveSettings),
    effectiveSettings.getSnapshot.bind(effectiveSettings)
  );
  const translate = typeof t === "function" ? t : ((key) => key);
  const guide = translate("guideLocale") === "zh" ? layout_guide_zh_default : layout_guide_en_default;
  const [localOverrides, setLocalOverrides] = (0, import_react2.useState)(readLocalSettings);
  const value = {
    ...COMPOSER_LAYOUT_DEFAULTS,
    ...snapshot.value ?? {},
    ...localOverrides
  };
  const set2 = (field, next) => {
    writeLocalSetting(field, next);
    setLocalOverrides((current) => ({ ...current, [field]: next }));
    void settings.set(field, next);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: ComposerLayoutSettingsTab_default.root, "aria-label": translate("title"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: ComposerLayoutSettingsTab_default.intro, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children: translate("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: translate("description") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("figure", { className: ComposerLayoutSettingsTab_default.guide, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { src: guide, alt: translate("guideAlt") }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: ComposerLayoutSettingsTab_default.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: translate("defaultPlacement") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: translate("defaultPlacementHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "select",
        {
          value: value.defaultPlacement,
          disabled: !snapshot.writable,
          onChange: (event) => set2("defaultPlacement", event.currentTarget.value),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "bottom", children: translate("bottom") }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "right", children: translate("right") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: ComposerLayoutSettingsTab_default.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: translate("rememberPlacement") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: translate("rememberPlacementHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "checkbox",
          checked: value.rememberPlacement,
          disabled: !snapshot.writable,
          onChange: (event) => set2("rememberPlacement", event.currentTarget.checked)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: ComposerLayoutSettingsTab_default.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: translate("bottomHandleHoverOnly") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: translate("bottomHandleHoverOnlyHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "checkbox",
          checked: value.bottomHandleHoverOnly,
          disabled: !snapshot.writable,
          onChange: (event) => set2("bottomHandleHoverOnly", event.currentTarget.checked)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: ComposerLayoutSettingsTab_default.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: translate("defaultWidthPreset") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: translate("defaultWidthPresetHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "select",
        {
          value: value.defaultWidthPreset,
          disabled: !snapshot.writable,
          onChange: (event) => set2("defaultWidthPreset", event.currentTarget.value),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "narrow", children: translate("narrow") }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "medium", children: translate("medium") }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "wide", children: translate("wide") })
          ]
        }
      )
    ] })
  ] });
}

// src/client/locale.ts
var composerLayoutLocale = {
  en: {
    nav: "Composer Layout",
    tab: "Composer Layout",
    title: "Composer Layout",
    description: "Choose how Chat and Composer share the conversation window.",
    guideLocale: "en",
    guideAlt: "Use the right-edge rail to switch the Composer layout, then resize the right pane.",
    defaultPlacement: "Default placement",
    defaultPlacementHint: "Used when a conversation opens.",
    rememberPlacement: "Remember this session layout",
    rememberPlacementHint: "Keep this session\u2019s Composer position and width when you return.",
    bottomHandleHoverOnly: "Show the bottom handle only on hover",
    bottomHandleHoverOnlyHint: "The right-layout divider always remains hover-only.",
    defaultWidthPreset: "Default right-pane width",
    defaultWidthPresetHint: "Choose a relative width that adapts to the conversation window.",
    narrow: "Narrow",
    medium: "Medium",
    wide: "Wide",
    bottom: "Bottom",
    right: "Right"
  },
  zh: {
    nav: "Composer \u5E03\u5C40",
    tab: "Composer \u5E03\u5C40",
    title: "Composer \u5E03\u5C40",
    description: "\u9009\u62E9 Chat \u4E0E Composer \u5728\u4F1A\u8BDD\u7A97\u53E3\u4E2D\u7684\u5E03\u5C40\u65B9\u5F0F\u3002",
    guideLocale: "zh",
    guideAlt: "\u901A\u8FC7\u53F3\u4FA7\u767D\u6761\u5207\u6362 Composer \u5E03\u5C40\uFF0C\u5E76\u8C03\u6574\u53F3\u680F\u5BBD\u5EA6\u3002",
    defaultPlacement: "\u9ED8\u8BA4\u4F4D\u7F6E",
    defaultPlacementHint: "\u6253\u5F00\u4F1A\u8BDD\u65F6\u4F7F\u7528\u3002",
    rememberPlacement: "\u8BB0\u4F4F\u5F53\u524D\u4F1A\u8BDD\u5E03\u5C40",
    rememberPlacementHint: "\u8FD4\u56DE\u8FD9\u4E2A\u4F1A\u8BDD\u65F6\u4FDD\u7559\u5B83\u7684 Composer \u4F4D\u7F6E\u548C\u5BBD\u5EA6\u3002",
    bottomHandleHoverOnly: "\u4E0A\u4E0B\u5E03\u5C40\u4EC5\u5728 hover \u65F6\u663E\u793A\u767D\u6761",
    bottomHandleHoverOnlyHint: "\u5DE6\u53F3\u5E03\u5C40\u7684\u4E2D\u95F4\u5206\u9694\u6761\u59CB\u7EC8\u4EC5\u5728 hover \u6216\u805A\u7126\u65F6\u663E\u793A\u3002",
    defaultWidthPreset: "\u9ED8\u8BA4\u53F3\u680F\u5BBD\u5EA6",
    defaultWidthPresetHint: "\u6309\u4F1A\u8BDD\u7A97\u53E3\u5BBD\u5EA6\u81EA\u9002\u5E94\u9009\u62E9\u76F8\u5BF9\u5927\u5C0F\u3002",
    narrow: "\u7A84",
    medium: "\u9002\u4E2D",
    wide: "\u5BBD",
    bottom: "\u5E95\u90E8",
    right: "\u53F3\u4FA7"
  }
};

// src/client/index.ts
var inject = ["slots", "sessions", "inputTriggers"];
var fallbackSettings2 = {
  getSnapshot: () => ({ status: "unavailable", value: void 0, base: void 0, user: void 0, revision: void 0, writable: false, mode: "memory" }),
  subscribe: () => () => {
  },
  set: async () => {
  },
  unset: async () => {
  }
};
function apply(ctx) {
  const settingsService = ctx.get("settingsScope");
  const settings = settingsService !== void 0 && ctx.get("connection") !== void 0 && ctx.get("remote") !== void 0 ? settingsService.bind({ namespace: COMPOSER_LAYOUT_SETTINGS_NAMESPACE }) : fallbackSettings2;
  const locale = ctx.get("locale");
  if (locale !== void 0) {
    ctx.effect(() => locale.register("settings.composerLayout", composerLayoutLocale), "composer-layout: settings locale");
    ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
      name: "settings.plugins.tab",
      id: "composer-layout",
      order: 20,
      label: () => locale.bind("settings.composerLayout")("tab"),
      locale: "settings.composerLayout",
      inject: () => ({ settings })
    }, ComposerLayoutSettingsTab));
  }
  ctx.inject(["slots", "sessions", "inputTriggers"], (scope) => {
    const { sessions, inputTriggers } = scope;
    scope.slots.inject(
      "conversation.input.overlay",
      () => {
        const disposeEntry = scope.slots.register({
          name: "conversation.input.overlay",
          id: "composer-layout-controls",
          order: 30,
          inject: (sessionId) => ({
            settings,
            dismissInputTrigger: () => {
              const session = sessions.scope(sessionId);
              if (session !== void 0) inputTriggers.sessionOf(session).dismiss();
            }
          })
        }, ComposerSplitAction);
        return disposeEntry;
      }
    );
  });
}
return module.exports; }});
