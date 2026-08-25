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
var css = '.t35lgq_control{display:contents}.t35lgq_edgeTrigger{z-index:20;cursor:pointer;background:0 0;border:0;outline:none;padding:0;position:fixed}.t35lgq_toolbarBottom,.t35lgq_toolbarSide{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-elevated) 94%, transparent);pointer-events:auto;backdrop-filter:blur(10px);z-index:30;border-radius:9px;align-items:center;gap:2px;min-height:32px;padding:3px;display:flex;position:fixed;transform:translate(-100%,-50%);box-shadow:0 6px 20px #00000038}.t35lgq_toolButton{width:28px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;place-items:center;padding:0;line-height:1;display:grid}.t35lgq_toolButton:hover,.t35lgq_toolButton:focus-visible,.t35lgq_toolButton[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary);outline:none}.t35lgq_dockIcon{box-sizing:border-box;border:2px solid;border-radius:2px;width:20px;height:15px;position:relative}.t35lgq_dockIcon:after{content:"";background:currentColor;border-radius:1px;position:absolute}.t35lgq_dockBottom:after{height:4px;bottom:1px;left:1px;right:1px}.t35lgq_dockRight:after{width:5px;top:1px;bottom:1px;right:1px}.t35lgq_separator{top:0;bottom:0;z-index:20;touch-action:none;cursor:col-resize;outline:none;width:10px;position:absolute;inset-inline-start:-5px}.t35lgq_edgeTrigger:before,.t35lgq_separator:before{content:"";opacity:.58;background:#ffffffc7;border-radius:2px;width:2px;height:44px;transition:opacity .12s,width .12s,left .12s;position:absolute;top:50%;left:4px;transform:translateY(-50%);box-shadow:0 0 0 1px #0000001f,0 1px 5px #0003}.t35lgq_edgeTrigger:hover:before,.t35lgq_edgeTrigger:focus-visible:before,.t35lgq_edgeTrigger[aria-expanded=true]:before,.t35lgq_separator:hover:before,.t35lgq_separator:focus-visible:before,.t35lgq_separator:active:before{opacity:1;width:4px;left:3px}.t35lgq_separator:before{opacity:0;left:12px}.t35lgq_separator:hover:before,.t35lgq_separator:focus-visible:before,.t35lgq_separator:active:before{left:11px}[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger:before{opacity:0}[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger:hover:before,[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger:focus-visible:before,[data-dsh-composer-bottom-handle-hover-only=true] .t35lgq_edgeTrigger[aria-expanded=true]:before{opacity:1}[data-phase=hero] .t35lgq_edgeTrigger,[data-phase=hero] .t35lgq_toolbarBottom,[data-phase=hero] .t35lgq_separator{display:none}[data-dsh-composer-side-max] :has([data-composer-card]),[data-dsh-composer-side-max] [data-composer-card],[data-dsh-composer-side-max] [data-input-scroll]{flex:1 1 0;min-height:0}[data-dsh-composer-split-active=true]{container:t35lgq_dsh-composer-split-root/inline-size}[data-dsh-composer-split-active=true]>[data-dsh-composer-split-body]{grid-template-columns:minmax(320px, 1fr) minmax(360px, var(--dsh-composer-split-width,420px));grid-template-rows:minmax(0,1fr);min-height:0;scrollbar-gutter:auto!important;display:grid!important;overflow:hidden!important}[data-dsh-composer-split-body] [data-dsh-composer-split-chat]{scrollbar-gutter:stable;min-width:0;height:100%;overflow:hidden auto;flex:1 1 0!important;min-height:0!important}[data-dsh-composer-split-body]>[data-dsh-composer-split-pane]{z-index:7;box-sizing:border-box;border-left:0;justify-content:flex-end;min-width:0;height:100%;min-height:0;overflow:hidden auto;container-type:size;background:var(--dsw-alias-bg-base)!important;position:relative!important;bottom:auto!important}[data-dsh-composer-split-pane]{--dsh-chat-content-width:100%;--dsh-composer-card-max-width:100%;--dsh-composer-side-clearance:12px;--dsh-composer-text-max-height:max(96px, calc(100cqh - 104px))}[data-dsh-composer-split-pane] [data-input-scroll]{min-height:clamp(96px,18cqh,168px)}[data-dsh-composer-split-pane] [data-composer-card]>:has(:is([role=listbox],[role=menu])){height:0;inset:auto 0 80px}[data-dsh-composer-split-pane] :is([role=listbox],[role=menu]){max-height:min(320px,100cqh - 128px)!important}@container t35lgq_dsh-composer-split-root (width<=680px){[data-dsh-composer-split-active=true]>[data-dsh-composer-split-body]{flex-direction:column;display:flex!important;overflow-y:auto!important}[data-dsh-composer-split-body] [data-dsh-composer-split-chat]{height:auto;overflow:visible;flex:1 0 auto!important}[data-dsh-composer-split-body]>[data-dsh-composer-split-pane]{border-top:1px solid var(--dsw-alias-border-l2);border-left:0;flex:none;height:auto;max-height:52%;padding-top:0;position:sticky!important;bottom:0!important}}';
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
      delete owner.composer.dataset.dshComposerSideMax;
      setBodyRect(null);
    };
  }, []);
  (0, import_react.useLayoutEffect)(() => {
    const owner = ownerRef.current;
    if (owner === null) return;
    if (split && canUseSideLayout(bodyRect?.width ?? 0)) {
      owner.composer.dataset.dshComposerSideMax = "";
    } else {
      delete owner.composer.dataset.dshComposerSideMax;
      if (!split) owner.body.style.removeProperty("--dsh-composer-inline-width");
    }
  }, [bodyRect, split]);
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
    owner.body.style.setProperty("--dsh-composer-inline-width", `${next}px`);
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
var css2 = "._4gIWUG_root{gap:16px;max-width:720px;display:grid}._4gIWUG_intro h2{color:var(--dsw-alias-label-primary);margin:0 0 6px;font-size:20px}._4gIWUG_intro p,._4gIWUG_row small{color:var(--dsw-alias-label-secondary)}._4gIWUG_intro p{margin:0;line-height:1.5}._4gIWUG_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-elevated);border-radius:10px;justify-content:space-between;align-items:center;gap:24px;padding:14px 16px;display:flex}._4gIWUG_row span{gap:4px;display:grid}._4gIWUG_row strong{color:var(--dsw-alias-label-primary);font-weight:500}._4gIWUG_row small{line-height:1.35}._4gIWUG_row select,._4gIWUG_number{border:1px solid var(--dsw-alias-border-l2);min-width:110px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border-radius:6px;padding:6px 8px}._4gIWUG_row input[type=checkbox]{width:18px;height:18px;accent-color:var(--dsw-alias-state-business-primary)}._4gIWUG_number{width:92px;min-width:92px}";
var tagId2 = "dsh-composer-layout/ComposerLayoutSettingsTab.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId2) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-composer-layout";
  tag.dataset.pluginCss = tagId2;
  tag.textContent = css2;
  document.head.appendChild(tag);
}
var ComposerLayoutSettingsTab_default = { "intro": "_4gIWUG_intro", "number": "_4gIWUG_number", "root": "_4gIWUG_root", "row": "_4gIWUG_row" };

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
