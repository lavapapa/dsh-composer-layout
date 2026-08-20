window.__ModuleLoader__.load({
	id: "dsh-composer-layout",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region ../../../vendor/cosmokit/src/misc.ts
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/types.ts
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		let Binary;
		(function(_Binary) {
			_Binary.is = isArrayBufferLike;
			_Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			_Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			_Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			_Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			_Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			_Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
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
		/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
		function deepEqual(a, b, strict) {
			if (a === b) return true;
			if (!strict && isNullable(a) && isNullable(b)) return true;
			if (typeof a !== typeof b) return false;
			if (typeof a !== "object") return false;
			if (!a || !b) return false;
			function check(test, then) {
				return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
			}
			return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? Object.keys({
				...a,
				...b
			}).every((key) => deepEqual(a[key], b[key], strict));
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/time.ts
		let Time;
		(function(_Time) {
			_Time.millisecond = 1;
			const second = _Time.second = 1e3;
			const minute = _Time.minute = second * 60;
			const hour = _Time.hour = minute * 60;
			const day = _Time.day = hour * 24;
			const week = _Time.week = day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			_Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			_Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / minute - offset) / 1440);
			}
			_Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * minute);
			}
			_Time.fromDateNumber = fromDateNumber;
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
				return (parseFloat(capture[1]) * week || 0) + (parseFloat(capture[2]) * day || 0) + (parseFloat(capture[3]) * hour || 0) + (parseFloat(capture[4]) * minute || 0) + (parseFloat(capture[5]) * second || 0);
			}
			_Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			_Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= day - hour / 2) return Math.round(ms / day) + "d";
				else if (abs >= hour - minute / 2) return Math.round(ms / hour) + "h";
				else if (abs >= minute - second / 2) return Math.round(ms / minute) + "m";
				else if (abs >= second) return Math.round(ms / second) + "s";
				return ms + "ms";
			}
			_Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			_Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			_Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/src/index.ts
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
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
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
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
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
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
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
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
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
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
		const resolvers = {};
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
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
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
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
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
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
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
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
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
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
						default: schema[key] = args[index];
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
		//#endregion
		//#region src/settings.ts
		const COMPOSER_LAYOUT_SETTINGS_NAMESPACE = "ui-composer-split";
		const COMPOSER_LAYOUT_DEFAULTS = {
			defaultPlacement: "bottom",
			rememberPlacement: true,
			bottomHandleHoverOnly: false,
			defaultWidthPreset: "medium"
		};
		Schema.object({
			defaultPlacement: Schema.union(["bottom", "right"]).default(COMPOSER_LAYOUT_DEFAULTS.defaultPlacement),
			rememberPlacement: Schema.boolean().default(COMPOSER_LAYOUT_DEFAULTS.rememberPlacement),
			bottomHandleHoverOnly: Schema.boolean().default(COMPOSER_LAYOUT_DEFAULTS.bottomHandleHoverOnly),
			defaultWidthPreset: Schema.union([
				"narrow",
				"medium",
				"wide"
			]).default(COMPOSER_LAYOUT_DEFAULTS.defaultWidthPreset)
		});
		//#endregion
		//#region src/client/settings-storage.ts
		const SETTINGS_KEY = "dsh.composer-split.settings";
		const SESSION_LAYOUTS_KEY = "dsh.composer-split.session-layouts";
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
				const next = {
					...readLocalSettings(),
					[field]: value
				};
				localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
			} catch {}
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
		/** Read the layout override belonging to one conversation session. */
		function readSessionLayout(sessionId) {
			const value = readSessionLayouts()[sessionId];
			if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
			return {
				...value.placement === "bottom" || value.placement === "right" ? { placement: value.placement } : {},
				...typeof value.width === "number" && Number.isFinite(value.width) && value.width > 0 ? { width: value.width } : {}
			};
		}
		/** Persist the current placement and width for one conversation session. */
		function writeSessionLayout(sessionId, value) {
			try {
				const layouts = readSessionLayouts();
				layouts[sessionId] = value;
				localStorage.setItem(SESSION_LAYOUTS_KEY, JSON.stringify(layouts));
			} catch {}
		}
		//#endregion
		//#region \0dsh-css:/Users/marvin/Developer/Apps/deepseek-harness/packages/client/ui-composer-split/src/client/ComposerSplitAction.module.css.mjs
		const css$1 = ".Q0LEdW_control{display:contents}.Q0LEdW_edgeTrigger{z-index:20;cursor:pointer;background:0 0;border:0;outline:none;padding:0;position:fixed}.Q0LEdW_toolbarBottom,.Q0LEdW_toolbarSide{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-elevated) 94%, transparent);pointer-events:auto;backdrop-filter:blur(10px);z-index:30;border-radius:9px;align-items:center;gap:2px;min-height:32px;padding:3px;display:flex;position:fixed;transform:translate(-100%,-50%);box-shadow:0 6px 20px #00000038}.Q0LEdW_toolButton{width:28px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;place-items:center;padding:0;line-height:1;display:grid}.Q0LEdW_toolButton:hover,.Q0LEdW_toolButton:focus-visible,.Q0LEdW_toolButton[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary);outline:none}.Q0LEdW_dockIcon{box-sizing:border-box;border:2px solid;border-radius:2px;width:20px;height:15px;position:relative}.Q0LEdW_dockIcon:after{content:\"\";background:currentColor;border-radius:1px;position:absolute}.Q0LEdW_dockBottom:after{height:4px;bottom:1px;left:1px;right:1px}.Q0LEdW_dockRight:after{width:5px;top:1px;bottom:1px;right:1px}.Q0LEdW_separator{top:0;bottom:0;z-index:20;touch-action:none;cursor:col-resize;outline:none;width:10px;position:absolute;inset-inline-start:-5px}.Q0LEdW_edgeTrigger:before,.Q0LEdW_separator:before{content:\"\";opacity:.58;background:#ffffffc7;border-radius:2px;width:2px;height:44px;transition:opacity .12s,width .12s,left .12s;position:absolute;top:50%;left:4px;transform:translateY(-50%);box-shadow:0 0 0 1px #0000001f,0 1px 5px #0003}.Q0LEdW_edgeTrigger:hover:before,.Q0LEdW_edgeTrigger:focus-visible:before,.Q0LEdW_edgeTrigger[aria-expanded=true]:before,.Q0LEdW_separator:hover:before,.Q0LEdW_separator:focus-visible:before,.Q0LEdW_separator:active:before{opacity:1;width:4px;left:3px}.Q0LEdW_separator:before{opacity:0;left:12px}.Q0LEdW_separator:hover:before,.Q0LEdW_separator:focus-visible:before,.Q0LEdW_separator:active:before{left:11px}[data-dsh-composer-bottom-handle-hover-only=true] .Q0LEdW_edgeTrigger:before{opacity:0}[data-dsh-composer-bottom-handle-hover-only=true] .Q0LEdW_edgeTrigger:hover:before,[data-dsh-composer-bottom-handle-hover-only=true] .Q0LEdW_edgeTrigger:focus-visible:before,[data-dsh-composer-bottom-handle-hover-only=true] .Q0LEdW_edgeTrigger[aria-expanded=true]:before{opacity:1}[data-phase=hero] .Q0LEdW_edgeTrigger,[data-phase=hero] .Q0LEdW_toolbarBottom,[data-phase=hero] .Q0LEdW_separator{display:none}[data-dsh-composer-side-max] [data-composer-stack],[data-dsh-composer-side-max] [data-composer-bar],[data-dsh-composer-side-max] [data-composer-card],[data-dsh-composer-side-max] [data-input-scroll]{flex:1 1 0;min-height:0}[data-dsh-composer-split-active=true]{container:Q0LEdW_dsh-composer-split-root/inline-size}[data-dsh-composer-split-active=true]>[data-dsh-composer-split-body]{grid-template-columns:minmax(420px, 1fr) minmax(360px, var(--dsh-composer-split-width,420px));grid-template-rows:minmax(0,1fr);min-height:0;scrollbar-gutter:auto!important;display:grid!important;overflow:hidden!important}[data-dsh-composer-split-body] [data-dsh-composer-split-chat]{scrollbar-gutter:stable;min-width:0;height:100%;overflow:hidden auto;flex:1 1 0!important;min-height:0!important}[data-dsh-composer-split-body]>[data-dsh-composer-split-pane]{z-index:7;box-sizing:border-box;border-left:0;justify-content:flex-end;min-width:0;height:100%;min-height:0;overflow:hidden auto;container-type:size;background:var(--dsw-alias-bg-base)!important;position:relative!important;bottom:auto!important}[data-dsh-composer-split-pane]{--dsh-chat-content-width:100%;--dsh-composer-card-max-width:100%;--dsh-composer-side-clearance:12px;--dsh-composer-text-max-height:max(96px, calc(100cqh - 104px))}[data-dsh-composer-split-pane] [data-input-scroll]{min-height:clamp(96px,18cqh,168px)}@container Q0LEdW_dsh-composer-split-root (width<=680px){[data-dsh-composer-split-active=true]>[data-dsh-composer-split-body]{flex-direction:column;display:flex!important;overflow-y:auto!important}[data-dsh-composer-split-body] [data-dsh-composer-split-chat]{height:auto;overflow:visible;flex:1 0 auto!important}[data-dsh-composer-split-body]>[data-dsh-composer-split-pane]{border-top:1px solid var(--dsw-alias-border-l2);border-left:0;flex:none;height:auto;max-height:52%;padding-top:0;position:sticky!important;bottom:0!important}}";
		const tagId$1 = "dsh-composer-layout/ComposerSplitAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-composer-layout";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var ComposerSplitAction_module_css_default = {
			"toolbarBottom": "Q0LEdW_toolbarBottom",
			"control": "Q0LEdW_control",
			"edgeTrigger": "Q0LEdW_edgeTrigger",
			"toolbarSide": "Q0LEdW_toolbarSide",
			"dockRight": "Q0LEdW_dockRight",
			"dockIcon": "Q0LEdW_dockIcon",
			"dockBottom": "Q0LEdW_dockBottom",
			"separator": "Q0LEdW_separator",
			"toolButton": "Q0LEdW_toolButton",
			"dsh-composer-split-root": "Q0LEdW_dsh-composer-split-root"
		};
		//#endregion
		//#region src/client/ComposerSplitAction.tsx
		const DEFAULT_WIDTH = 420;
		const MIN_COMPOSER_WIDTH = 360;
		const MIN_CHAT_WIDTH = 420;
		const SIDE_LAYOUT_BREAKPOINT = 680;
		const HANDLE_HIT_WIDTH = 10;
		function widthForPreset(preset, bodyWidth) {
			return clampWidth(bodyWidth * (preset === "narrow" ? .28 : preset === "wide" ? .46 : .36), bodyWidth);
		}
		function clampWidth(width, bodyWidth) {
			return Math.max(MIN_COMPOSER_WIDTH, Math.min(width, Math.max(MIN_COMPOSER_WIDTH, bodyWidth - MIN_CHAT_WIDTH)));
		}
		function findOwner(control) {
			const root = control.closest("[data-phase]");
			const composer = control.closest("[data-composer-seat]");
			const body = composer?.parentElement;
			if (root === null || composer === null || !(body instanceof HTMLElement)) return null;
			return {
				root,
				body,
				composer
			};
		}
		function findLegacyLayout(control) {
			const root = control.closest("[data-phase]");
			if (root === null) return null;
			const body = root.querySelector(":scope > [data-conversation-scroll], :scope > [data-dsh-composer-split-body]");
			if (body === null) return null;
			const sessionWrapper = body.querySelector(":scope > [data-slot=\"conversation.session\"]");
			const chat = sessionWrapper?.firstElementChild;
			const composer = body.querySelector(":scope > [data-composer-seat]");
			if (sessionWrapper === null || !(chat instanceof HTMLElement) || composer === null) return null;
			return {
				root,
				body,
				sessionWrapper,
				chat,
				composer
			};
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
			return {
				top: rect.top,
				contentRight,
				height: rect.height,
				width: rect.width
			};
		}
		/** Placement menu plus the plugin-owned, reversible split adapter. */
		const fallbackSnapshot = {
			status: "unavailable",
			value: void 0,
			base: void 0,
			user: void 0,
			revision: void 0,
			writable: false,
			mode: "memory"
		};
		const fallbackSettings$1 = {
			getSnapshot: () => fallbackSnapshot,
			subscribe: () => () => {},
			set: async () => {},
			unset: async () => {}
		};
		function ComposerSplitAction({ settings, sessionId }) {
			const effectiveSettings = settings ?? fallbackSettings$1;
			const settingsSnapshot = (0, react.useSyncExternalStore)(effectiveSettings.subscribe.bind(effectiveSettings), effectiveSettings.getSnapshot.bind(effectiveSettings));
			const localPreferences = readLocalSettings();
			const preferences = {
				...COMPOSER_LAYOUT_DEFAULTS,
				...settingsSnapshot.value ?? {},
				...localPreferences
			};
			const controlRef = (0, react.useRef)(null);
			const toolbarRef = (0, react.useRef)(null);
			const edgeTriggerRef = (0, react.useRef)(null);
			const separatorRef = (0, react.useRef)(null);
			const ownerRef = (0, react.useRef)(null);
			const sessionLayoutRef = (0, react.useRef)(readSessionLayout(sessionId));
			const sessionIdRef = (0, react.useRef)(sessionId);
			const widthOverrideRef = (0, react.useRef)(sessionLayoutRef.current.width !== void 0);
			const sessionChangedRef = (0, react.useRef)(false);
			const legacyRef = (0, react.useRef)(null);
			const widthDragRef = (0, react.useRef)(null);
			const appliedPresetRef = (0, react.useRef)(null);
			const [split, setSplit] = (0, react.useState)(false);
			const [composerWidth, setComposerWidth] = (0, react.useState)(DEFAULT_WIDTH);
			const [bodyRect, setBodyRect] = (0, react.useState)(null);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const [sideMenuAnchor, setSideMenuAnchor] = (0, react.useState)(null);
			(0, react.useLayoutEffect)(() => {
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
			(0, react.useEffect)(() => {
				if (bodyRect === null) return;
				const remembered = sessionLayoutRef.current;
				setSplit((preferences.rememberPlacement && remembered.placement !== void 0 ? remembered.placement : preferences.defaultPlacement) === "right");
				if (appliedPresetRef.current === preferences.defaultWidthPreset) return;
				appliedPresetRef.current = preferences.defaultWidthPreset;
				const rememberedWidth = preferences.rememberPlacement ? sessionLayoutRef.current.width : void 0;
				widthOverrideRef.current = rememberedWidth !== void 0;
				if (rememberedWidth !== void 0) setComposerWidth(clampWidth(rememberedWidth, bodyRect.width));
				else setComposerWidth(widthForPreset(preferences.defaultWidthPreset, bodyRect.width));
			}, [bodyRect, preferences]);
			(0, react.useEffect)(() => {
				const root = ownerRef.current?.root;
				if (root === void 0) return;
				root.dataset.dshComposerBottomHandleHoverOnly = String(preferences.bottomHandleHoverOnly);
				return () => {
					delete root.dataset.dshComposerBottomHandleHoverOnly;
				};
			}, [preferences.bottomHandleHoverOnly]);
			(0, react.useLayoutEffect)(() => {
				const control = controlRef.current;
				if (control === null) return;
				const owner = findOwner(control);
				if (owner === null) return;
				ownerRef.current = owner;
				setBodyRect(rectOf(owner.body));
				const observer = new ResizeObserver(() => {
					const next = rectOf(owner.body);
					setBodyRect(next);
					setComposerWidth((current) => clampWidth(current, next.width));
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
			(0, react.useLayoutEffect)(() => {
				const owner = ownerRef.current;
				if (owner === null) return;
				if (split && (bodyRect?.width ?? 0) > SIDE_LAYOUT_BREAKPOINT) owner.composer.dataset.dshComposerSideMax = "";
				else {
					delete owner.composer.dataset.dshComposerSideMax;
					if (!split) owner.body.style.removeProperty("--dsh-composer-inline-width");
				}
			}, [bodyRect, split]);
			(0, react.useEffect)(() => {
				const root = ownerRef.current?.root;
				if (root === void 0) return;
				const onNativeTrigger = (event) => {
					const target = event.target;
					if (!(target instanceof HTMLElement)) return;
					const handle = target.closest("[data-composer-width-handle]");
					if (handle === null) return;
					const rect = handle.getBoundingClientRect();
					setSideMenuAnchor({
						top: rect.top + rect.height / 2,
						left: Math.min(rect.right + 6, window.innerWidth - 6)
					});
					setMenuOpen((open) => !open);
				};
				root.addEventListener("dsh-composer-layout-trigger", onNativeTrigger);
				return () => {
					root.removeEventListener("dsh-composer-layout-trigger", onNativeTrigger);
				};
			}, []);
			(0, react.useEffect)(() => {
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
			(0, react.useLayoutEffect)(() => {
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
			(0, react.useEffect)(() => {
				const owner = ownerRef.current;
				if (owner === null || !split) return;
				if (sessionChangedRef.current) {
					sessionChangedRef.current = false;
					return;
				}
				const next = clampWidth(composerWidth, owner.body.getBoundingClientRect().width);
				owner.body.style.setProperty("--dsh-composer-inline-width", `${next}px`);
				const layout = legacyRef.current;
				if (layout !== null) layout.root.style.setProperty("--dsh-composer-split-width", `${next}px`);
				if (preferences.rememberPlacement && widthOverrideRef.current) {
					sessionLayoutRef.current = {
						...sessionLayoutRef.current,
						width: next
					};
					writeSessionLayout(sessionId, sessionLayoutRef.current);
				}
			}, [
				composerWidth,
				preferences.defaultWidthPreset,
				preferences.rememberPlacement,
				sessionId,
				split
			]);
			const setDock = (nextSplit) => {
				const forceInline = nextSplit && split;
				setMenuOpen(false);
				setSplit(nextSplit);
				ownerRef.current?.root.dispatchEvent(new CustomEvent("dsh-composer-layout-force-inline", {
					bubbles: true,
					detail: { force: forceInline }
				}));
				if (preferences.rememberPlacement) {
					const placement = nextSplit ? "right" : "bottom";
					sessionLayoutRef.current = {
						...sessionLayoutRef.current,
						placement
					};
					writeSessionLayout(sessionId, sessionLayoutRef.current);
				}
			};
			const resetWidth = (0, react.useCallback)(() => {
				const width = bodyRect === null ? MIN_COMPOSER_WIDTH : widthForPreset("medium", bodyRect.width);
				widthOverrideRef.current = true;
				setComposerWidth(width);
			}, [bodyRect]);
			const onWidthPointerDown = (0, react.useCallback)((event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				widthDragRef.current = {
					x: event.clientX,
					width: composerWidth,
					moved: false
				};
			}, [composerWidth]);
			const onWidthPointerMove = (0, react.useCallback)((event) => {
				const drag = widthDragRef.current;
				const rect = bodyRect;
				if (drag === null || rect === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
				if (Math.abs(event.clientX - drag.x) > 3) drag.moved = true;
				widthOverrideRef.current = true;
				setComposerWidth(clampWidth(drag.width - (event.clientX - drag.x), rect.width));
			}, [bodyRect]);
			const onWidthPointerUp = (0, react.useCallback)((event) => {
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
			const onWidthKeyDown = (0, react.useCallback)((event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					event.currentTarget.click();
					return;
				}
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					widthOverrideRef.current = true;
					setComposerWidth((value) => bodyRect === null ? value : clampWidth(value + 16, bodyRect.width));
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					widthOverrideRef.current = true;
					setComposerWidth((value) => bodyRect === null ? value : clampWidth(value - 16, bodyRect.width));
				} else if (event.key === "Home") {
					event.preventDefault();
					resetWidth();
				}
			}, [bodyRect, resetWidth]);
			const toolbar = (className, style) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: toolbarRef,
				className,
				role: "toolbar",
				"aria-label": "输入区域布局",
				style,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ComposerSplitAction_module_css_default.toolButton,
					"aria-pressed": !split,
					title: "停靠到底部",
					"aria-label": "停靠到底部",
					onClick: () => {
						setDock(false);
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `${ComposerSplitAction_module_css_default.dockIcon} ${ComposerSplitAction_module_css_default.dockBottom}`,
						"aria-hidden": "true"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ComposerSplitAction_module_css_default.toolButton,
					"aria-pressed": split,
					title: "停靠到右侧",
					"aria-label": "停靠到右侧",
					onClick: () => {
						setDock(true);
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `${ComposerSplitAction_module_css_default.dockIcon} ${ComposerSplitAction_module_css_default.dockRight}`,
						"aria-hidden": "true"
					})
				})]
			});
			const separator = split && bodyRect !== null && bodyRect.width >= 780 && ownerRef.current !== null ? (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: separatorRef,
				className: ComposerSplitAction_module_css_default.separator,
				role: "separator",
				"aria-label": "调整输入区域宽度；点击打开布局菜单",
				"aria-orientation": "vertical",
				"aria-valuemin": MIN_COMPOSER_WIDTH,
				"aria-valuemax": Math.max(MIN_COMPOSER_WIDTH, Math.round(bodyRect.width - MIN_CHAT_WIDTH)),
				"aria-valuenow": Math.round(clampWidth(composerWidth, bodyRect.width)),
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
			}), ownerRef.current.composer) : null;
			const sideToolbar = split && menuOpen && sideMenuAnchor !== null ? (0, react_dom.createPortal)(toolbar(ComposerSplitAction_module_css_default.toolbarSide, sideMenuAnchor), document.body) : null;
			const bottomTrigger = !split && bodyRect !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				ref: edgeTriggerRef,
				type: "button",
				className: ComposerSplitAction_module_css_default.edgeTrigger,
				"aria-label": "打开输入区域布局菜单",
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
			}) : null;
			const bottomToolbar = !split && menuOpen && bodyRect !== null ? toolbar(ComposerSplitAction_module_css_default.toolbarBottom, {
				top: bodyRect.top + bodyRect.height / 2,
				left: bodyRect.contentRight - 19
			}) : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: controlRef,
				className: ComposerSplitAction_module_css_default.control,
				"data-dsh-composer-split-mode": split ? "split" : "stacked",
				"data-dsh-composer-split-adapter": "plugin",
				children: [
					bottomTrigger,
					bottomToolbar,
					separator,
					sideToolbar
				]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/marvin/Developer/Apps/deepseek-harness/packages/client/ui-composer-split/src/client/ComposerLayoutSettingsTab.module.css.mjs
		const css = ".LEYroW_root{gap:16px;max-width:720px;display:grid}.LEYroW_intro h2{color:var(--dsw-alias-label-primary);margin:0 0 6px;font-size:20px}.LEYroW_intro p,.LEYroW_row small{color:var(--dsw-alias-label-secondary)}.LEYroW_intro p{margin:0;line-height:1.5}.LEYroW_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-elevated);border-radius:10px;justify-content:space-between;align-items:center;gap:24px;padding:14px 16px;display:flex}.LEYroW_row span{gap:4px;display:grid}.LEYroW_row strong{color:var(--dsw-alias-label-primary);font-weight:500}.LEYroW_row small{line-height:1.35}.LEYroW_row select,.LEYroW_number{border:1px solid var(--dsw-alias-border-l2);min-width:110px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border-radius:6px;padding:6px 8px}.LEYroW_row input[type=checkbox]{width:18px;height:18px;accent-color:var(--dsw-alias-state-business-primary)}.LEYroW_number{width:92px;min-width:92px}";
		const tagId = "dsh-composer-layout/ComposerLayoutSettingsTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-composer-layout";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ComposerLayoutSettingsTab_module_css_default = {
			"intro": "LEYroW_intro",
			"row": "LEYroW_row",
			"root": "LEYroW_root",
			"number": "LEYroW_number"
		};
		//#endregion
		//#region src/client/ComposerLayoutSettingsTab.tsx
		const unavailableSnapshot = {
			status: "unavailable",
			value: void 0,
			base: void 0,
			user: void 0,
			revision: void 0,
			writable: false,
			mode: "memory"
		};
		const unavailableSettings = {
			getSnapshot: () => unavailableSnapshot,
			subscribe: () => () => {},
			set: async () => {},
			unset: async () => {}
		};
		function ComposerLayoutSettingsTab({ t, settings }) {
			const effectiveSettings = settings ?? unavailableSettings;
			const snapshot = (0, react.useSyncExternalStore)(effectiveSettings.subscribe.bind(effectiveSettings), effectiveSettings.getSnapshot.bind(effectiveSettings));
			const translate = typeof t === "function" ? t : ((key) => key);
			const [localOverrides, setLocalOverrides] = (0, react.useState)(readLocalSettings);
			const value = {
				...COMPOSER_LAYOUT_DEFAULTS,
				...snapshot.value ?? {},
				...localOverrides
			};
			const set = (field, next) => {
				writeLocalSetting(field, next);
				setLocalOverrides((current) => ({
					...current,
					[field]: next
				}));
				settings.set(field, next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: ComposerLayoutSettingsTab_module_css_default.root,
				"aria-label": translate("title"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ComposerLayoutSettingsTab_module_css_default.intro,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: translate("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: translate("description") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ComposerLayoutSettingsTab_module_css_default.row,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: translate("defaultPlacement") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: translate("defaultPlacementHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: value.defaultPlacement,
							disabled: !snapshot.writable,
							onChange: (event) => set("defaultPlacement", event.currentTarget.value),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "bottom",
								children: translate("bottom")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "right",
								children: translate("right")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ComposerLayoutSettingsTab_module_css_default.row,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: translate("rememberPlacement") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: translate("rememberPlacementHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: value.rememberPlacement,
							disabled: !snapshot.writable,
							onChange: (event) => set("rememberPlacement", event.currentTarget.checked)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ComposerLayoutSettingsTab_module_css_default.row,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: translate("bottomHandleHoverOnly") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: translate("bottomHandleHoverOnlyHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: value.bottomHandleHoverOnly,
							disabled: !snapshot.writable,
							onChange: (event) => set("bottomHandleHoverOnly", event.currentTarget.checked)
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ComposerLayoutSettingsTab_module_css_default.row,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: translate("defaultWidthPreset") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: translate("defaultWidthPresetHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: value.defaultWidthPreset,
							disabled: !snapshot.writable,
							onChange: (event) => set("defaultWidthPreset", event.currentTarget.value),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "narrow",
									children: translate("narrow")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "medium",
									children: translate("medium")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "wide",
									children: translate("wide")
								})
							]
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/locale.ts
		const composerLayoutLocale = {
			en: {
				nav: "Composer Layout",
				tab: "Composer Layout",
				title: "Composer Layout",
				description: "Choose how Chat and Composer share the conversation window.",
				defaultPlacement: "Default placement",
				defaultPlacementHint: "Used when a conversation opens.",
				rememberPlacement: "Remember this session layout",
				rememberPlacementHint: "Keep this session’s Composer position and width when you return.",
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
				nav: "Composer 布局",
				tab: "Composer 布局",
				title: "Composer 布局",
				description: "选择 Chat 与 Composer 在会话窗口中的布局方式。",
				defaultPlacement: "默认位置",
				defaultPlacementHint: "打开会话时使用。",
				rememberPlacement: "记住当前会话布局",
				rememberPlacementHint: "返回这个会话时保留它的 Composer 位置和宽度。",
				bottomHandleHoverOnly: "上下布局仅在 hover 时显示白条",
				bottomHandleHoverOnlyHint: "左右布局的中间分隔条始终仅在 hover 或聚焦时显示。",
				defaultWidthPreset: "默认右栏宽度",
				defaultWidthPresetHint: "按会话窗口宽度自适应选择相对大小。",
				narrow: "窄",
				medium: "适中",
				wide: "宽",
				bottom: "底部",
				right: "右侧"
			}
		};
		//#endregion
		//#region src/client/index.ts
		/** Required client services. Layout ownership stays inside this standalone plugin. */
		const inject = ["slots"];
		/** Register the Composer-card hover controls. */
		const fallbackSettings = {
			getSnapshot: () => ({
				status: "unavailable",
				value: void 0,
				base: void 0,
				user: void 0,
				revision: void 0,
				writable: false,
				mode: "memory"
			}),
			subscribe: () => () => {},
			set: async () => {},
			unset: async () => {}
		};
		function apply(ctx) {
			const settingsService = ctx.get("settingsScope");
			const settings = settingsService !== void 0 && ctx.get("connection") !== void 0 && ctx.get("remote") !== void 0 ? settingsService.bind({ namespace: COMPOSER_LAYOUT_SETTINGS_NAMESPACE }) : fallbackSettings;
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
			ctx.slots.inject("conversation.input.overlay", () => {
				return ctx.slots.register({
					name: "conversation.input.overlay",
					id: "composer-layout-controls",
					order: 30,
					inject: () => ({ settings })
				}, ComposerSplitAction);
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map