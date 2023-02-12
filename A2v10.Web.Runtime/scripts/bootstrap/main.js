// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20220416-7838
// app.js

"use strict";

(function () {

	window.app = {
		modules: {},
		components: {},
		templates: {},
		nextToken: nextToken
	};

	window.require = require;
	window.component = component;
	window.template = template;

	// amd typescript support
	window.define = define;

	let rootElem = document.querySelector('meta[name=rootUrl]');
	window.$$rootUrl = rootElem ? rootElem.content || '' : '';

	function require(module, noerror) {
		if (module in app.modules) {
			let am = app.modules[module];
			if (typeof am === 'function') {
				am = am(); // always singleton
				app.modules[module] = am;
			}
			return am;
		}
		if (noerror)
			return null;
		throw new Error('module "' + module + '" not found');
	}

	function component(name, noerror) {
		if (name in app.components)
			return app.components[name];
		if (noerror)
			return {};
		throw new Error('component "' + name + '" not found');
	}

	function template(name, noerror) {
		if (name in app.templates)
			return app.templates[name];
		if (noerror)
			return {};
		throw new Error('template "' + name + '" not found');
	}

	let currentToken = 1603;

	function nextToken() {
		return '' + currentToken++;
	}

	function define(args, factory) {
		let exports = {
			default: undefined
		};
		factory(require, exports);
		return exports.default;
	}

	/*
	Vue.config.warnHandler = function (msg, vm, trace) {
		console.warn(msg);
		return false;
	};
	*/

})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181201-7379
// services/locale.js

app.modules['std:locale'] = function () {
	return window.$$locale;
};

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181120-7363
// platform/polyfills.js


(function (elem) {
	elem.closest = elem.closest || function (css) {
		let node = this;
		while (node) {
			if (node.matches(css))
				return node;
			else
				node = node.parentElement;
		}
		return null;
	};

	elem.scrollIntoViewCheck = elem.scrollIntoViewCheck || function () {
		let el = this;
		let elRect = el.getBoundingClientRect();
		let pElem = el.parentElement;
		while (pElem) {
			if (pElem.offsetHeight < pElem.scrollHeight)
				break;
			pElem = pElem.parentElement;
		}
		if (!pElem)
			return;
		let parentRect = pElem.getBoundingClientRect();
		if (elRect.top < parentRect.top) {
			//pElem.scrollTop -= parentRect.top - elRect.top + 1;
			//el.scrollIntoView(true);
			el.scrollIntoView({ block: 'nearest' });
		}
		else if (elRect.bottom > parentRect.bottom) {
			//pElem.scrollTop += elRect.bottom - parentRect.bottom + 1;
			el.scrollIntoView({ block: 'nearest' });
			//el.scrollIntoView(false);
		}
	};


})(Element.prototype);

(function (date) {

	date.isZero = date.isZero || function () {
		let td = new Date(0, 0, 1, 0, 0, 0, 0);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return this.getTime() === td.getTime();
	};

})(Date.prototype);




// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200722-7691*/
/* platform/webvue.js */

(function () {

	function set(target, prop, value) {
		Vue.set(target, prop, value);
	}

	function defer(func) {
		Vue.nextTick(func);
	}

	function print() {
		window.print();
	}


	app.modules['std:platform'] = {
		set: set,
		defer: defer,
		print: print,
		File: File, /*file ctor*/
		performance: performance
	};

	app.modules['std:eventBus'] = new Vue({});

})();

// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221027-7902
// services/utils.js

app.modules['std:utils'] = function () {

	const locale = require('std:locale');
	const platform = require('std:platform');
	const dateLocale = locale.$Locale;
	const numLocale = locale.$Locale;
	const _2digit = '2-digit';

	const dateOptsDate = { timeZone: 'UTC', year: 'numeric', month: _2digit, day: _2digit };
	const dateOptsTime = { timeZone: 'UTC', hour: _2digit, minute: _2digit };
	
	const formatDate = new Intl.DateTimeFormat(dateLocale, dateOptsDate).format;
	const formatTime = new Intl.DateTimeFormat(dateLocale, dateOptsTime).format;

	const currencyFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 2, maximumFractionDigits: 6, useGrouping: true }).format;
	const numberFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 6, useGrouping: true }).format;

	const utcdatRegEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

	let numFormatCache = {};

	const zeroDate = new Date(Date.UTC(0, 0, 1, 0, 0, 0, 0));

	return {
		isArray: Array.isArray,
		isFunction, isDefined,
		isObject, isObjectExact,
		isDate, isString, isNumber, isBoolean,
		isPromise,
		toString,
		toBoolean,
		defaultValue,
		notBlank,
		toJson,
		fromJson: JSON.parse,
		isPrimitiveCtor: isPrimitiveCtor,
		isDateCtor,
		isEmptyObject,
		defineProperty: defProperty,
		eval: evaluate,
		simpleEval: simpleEval,
		format: format,
		toNumber,
		parse: parse,
		getStringId,
		isEqual,
		ensureType,
		clearObject,
		isPlainObjectEmpty,
		date: {
			today: dateToday,
			now: dateNow,
			zero: dateZero,
			parse: dateParse,
			tryParse: dateTryParse,
			equal: dateEqual,
			isZero: dateIsZero,
			formatDate: formatDate,
			format: formatDate,
			add: dateAdd,
			diff: dateDiff,
			create: dateCreate,
			compare: dateCompare,
			endOfMonth: endOfMonth,
			minDate: dateCreate(1901, 1, 1),
			maxDate: dateCreate(2999, 12, 31),
			fromDays: fromDays,
			parseTime: timeParse
		},
		text: {
			contains: textContains,
			containsText: textContainsText,
			sanitize,
			splitPath,
			capitalize,
			maxChars,
			equalNoCase: stringEqualNoCase,
			applyFilters
		},
		currency: {
			round: currencyRound,
			format: currencyFormat
		},
		func: {
			curry,
			debounce,
			defPropertyGet
		},
		debounce: debounce,
		model: {
			propFromPath
		},
		mergeTemplate
	};

	function isFunction(value) { return typeof value === 'function'; }
	function isDefined(value) { return typeof value !== 'undefined'; }
	function isObject(value) { return value !== null && typeof value === 'object'; }
	function isDate(value) { return value instanceof Date; }
	function isString(value) { return typeof value === 'string'; }
	function isNumber(value) { return typeof value === 'number'; }
	function isBoolean(value) { return typeof value === 'boolean'; }
	function isObjectExact(value) { return isObject(value) && !Array.isArray(value); }
	function isPromise(v) { return isDefined(v) && isFunction(v.then) && isFunction(v.catch); }

	function isPrimitiveCtor(ctor) {
		return ctor === String || ctor === Number || ctor === Boolean || ctor === Date || ctor === platform.File || ctor === Object;
	}

	function isDateCtor(ctor) {
		return ctor === Date;
	}

	function isEmptyObject(obj) {
		return !obj || Object.keys(obj).length === 0 && obj.constructor === Object;
	}

	function isEqual(o1, o2) {
		if (o1 === o2) return true;
		else if (isDate(o1) && isDate(o2))
			return o1.getTime() === o2.getTime();
		else if (isObjectExact(o1) && isObjectExact(o2))
			return JSON.stringify(o1) === JSON.stringify(o2);
		return false;
	}

	function notBlank(val) {
		if (!val)
			return false;
		if (isDate(val))
			return !dateIsZero(val);
		switch (typeof val) {
			case 'string':
				return val !== '';
			case 'date':
				return false;
			case 'object':
				if ('$id' in val) {
					return !!val.$id;
				}
				break;
		}
		return (val || '') !== '';
	}

	function toJson(data) {
		return JSON.stringify(data, function (key, value) {
			if (dateIsZero(this[key])) return undefined; // value is string!
			return key[0] === '$' || key[0] === '_' ? undefined : value;
		}, 2);
	}

	function toBoolean(obj) {
		if (!obj) return false;
		let val = obj.toString().toLowerCase();
		if (val === 'true' || val === '1')
			return true;
		return false;
	}

	function toString(obj) {
		if (!isDefined(obj))
			return '';
		else if (obj === null)
			return '';
		else if (isObject(obj))
			return toJson(obj);
		return '' + obj;
	}

	function isPlainObjectEmpty(obj) {
		if (!obj) return true;
		return !Object.keys(obj).some(key => !!obj[key]);
	}

	function clearObject(obj) {
		for (let key of Object.keys(obj)) {
			let val = obj[key];
			if (!val)
				continue;
			switch (typeof (val)) {
				case 'number':
					obj[key] = 0;
					break;
				case 'string':
					obj[key] = '';
					break;
				case 'object':
					clearObject(obj[key]);
					break;
				default:
					console.error(`utils.clearObject. Unknown property type ${typeof (val)}`);
			}
		}
	}

	function ensureType(type, val) {
		if (typeof val === type) return val;
		if (!isDefined(val))
			val = defaultValue(type);
		if (type === Number)
			return toNumber(val);
		else if (type === String)
			return toString(val);
		else if (type === Boolean)
			return toBoolean(val);
		else if (type === Date && !isDate(val))
			return dateParse('' + val);
		return val;
	}

	function defaultValue(type) {
		switch (type) {
			case undefined: return undefined;
			case Number: return 0;
			case String: return '';
			case Boolean: return false;
			case Date: return dateZero();
			case Object: return null;
			default:
				if (typeof type === 'function')
					return null; // complex object
				throw new Error(`There is no default value for type ${type}`);
		}
	}

	function simpleEval(obj, path) {
		if (!path || !obj)
			return '';
		let ps = (path || '').split('.');
		let r = obj;
		for (let i = 0; i < ps.length; i++) {
			let pi = ps[i];
			if (!(pi in r))
				throw new Error(`Property '${pi}' not found in ${r.constructor.name} object`);
			r = r[ps[i]];
		}
		return r;
	}

	function evaluate(obj, path, dataType, opts, skipFormat) {
		let r = simpleEval(obj, path);
		if (skipFormat) return r;
		if (isDate(r))
			return format(r, dataType);
		else if (isObject(r))
			return toJson(r);
		else
			return format(r, dataType, opts);
	}

	function pad2(num) {
		if (num < 10)
			return '0' + num;
		return '' + num;
	}

	function parse(obj, dataType) {
		switch (dataType) {
			case 'Currency':
			case 'Number':
				return toNumber(obj);
			case 'Date':
				return dateParse(obj);
		}
		return obj;
	}

	function formatNumber(num, format) {
		if (!format)
			return numberFormat(num);
		if (numFormatCache[format])
			return numFormatCache[format](num);
		let re = /^([#][,\s])?(#*)?(0*)?\.?(0*)?(#*)?$/;
		let fmt = format.match(re);
		if (!fmt) {
			console.error(`Invalid number format: '${format}'`);
			return num;
		}
		function getlen(x) {
			return x ? x.length : 0;
		}

		// 1-sep, 2-int part(#), 3-int part(0), 4-fract part (0), 5-fract part (#) 
		let useGrp = !!fmt[1],
			fih = getlen(fmt[2]), fi0 = getlen(fmt[3]),
			fp0 = getlen(fmt[4]), fph = getlen(fmt[5]);

		//console.dir(fmt);
		//console.dir({ useGrp, fp0, fph, fi0, fih });

		let formatFunc = Intl.NumberFormat(numLocale, {
			minimumFractionDigits: fp0,
			maximumFractionDigits: fp0 + fph,
			minimumIntegerDigits: fi0,
			useGrouping: useGrp
		}).format;

		numFormatCache[format] = formatFunc;

		return formatFunc(num);
	}

	function formatDateWithFormat(date, format) {
		if (!format)
			return formatDate(date);
		switch (format) {
			case 'MMMM yyyy':
				return capitalize(date.toLocaleDateString(locale.$Locale, { month: 'long', year: 'numeric' }));
			default:
				console.error('invalid date format: ' + format);
		}
		return formatDate(date);
	}


	function format(obj, dataType, opts) {
		opts = opts || {};
		if (!dataType)
			return obj;
		if (!isDefined(obj))
			return '';
		switch (dataType) {
			case "DateTime":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				if (opts.format)
					return formatDateWithFormat(obj, opts.format);
				return formatDate(obj) + ' ' + formatTime(obj);
			case "Date":
				if (isString(obj))
					obj = string2Date(obj);
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				if (opts.format)
					return formatDateWithFormat(obj, opts.format);
				return formatDate(obj);
			case 'DateUrl':
				if (dateIsZero(obj))
					return '';
				if (dateHasTime(obj))
					return obj.toISOString();
				return '' + obj.getFullYear() + pad2(obj.getMonth() + 1) + pad2(obj.getDate());
			case 'Time':
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatTime(obj);
			case 'Period':
				if (!obj.format) {
					console.error(`Invalid Period for utils.format (${obj})`);
					return obj;
				}
				return obj.format('Date');
			case 'Currency':
				if (!isNumber(obj)) {
					obj = toNumber(obj);
					//TODO:check console.error(`Invalid Currency for utils.format (${obj})`);
					//return obj;
				}
				if (opts.hideZeros && obj === 0)
					return '';
				if (opts.format)
					return formatNumber(obj, opts.format);
				return currencyFormat(obj);
			case 'Number':
				if (!isNumber(obj)) {
					obj = toNumber(obj);
					//TODO:check console.error(`Invalid Number for utils.format (${obj})`);
					//return obj;
				}
				if (opts.hideZeros && obj === 0)
					return '';

				return formatNumber(obj, opts.format);
			default:
				console.error(`Invalid DataType for utils.format (${dataType})`);
		}
		return obj;
	}


	function getStringId(obj) {
		if (!obj)
			return '0';
		if (isNumber(obj))
			return obj;
		else if (isObjectExact(obj)) {
			if ('$id' in obj)
				return obj.$id || 0;
			else if ("Id" in obj)
				return obj.Id || 0;
			else {
				console.error('Id or @id not found in object');
			}
		}
		return '0';
	}

	function toNumber(val) {
		if (isString(val))
			val = val.replace(/\s/g, '').replace(',', '.');
		return isFinite(val) ? +val : 0;
	}

	function dateToday() {
		let td = new Date();
		return new Date(Date.UTC(td.getFullYear(), td.getMonth(), td.getDate(), 0, 0, 0, 0));
	}

	function dateNow(second) {
		let td = new Date();
		let sec = second ? td.getSeconds() : 0;
		return new Date(Date.UTC(td.getFullYear(), td.getMonth(), td.getDate(), td.getHours(), td.getMinutes(), sec, 0));
	}

	function dateZero() {
		return zeroDate;
	}

	function dateTryParse(str) {
		if (!str) return dateZero();
		if (isDate(str)) return str;

		if (utcdatRegEx.test(str)) {
			return new Date(str);
		}

		let dt;
		if (str.length === 8) {
			dt = new Date(+str.substring(0, 4), +str.substring(4, 6) - 1, +str.substring(6, 8), 0, 0, 0, 0);
		} else if (str.startsWith('\"\\/\"')) {
			dt = new Date(str.substring(4, str.length - 4));
		} else {
			dt = new Date(str);
		}
		if (!isNaN(dt.getTime())) {
			return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0));
		}
		return str;
	}

	function string2Date(str) {
		try {
			let dt = new Date(str);
			dt.setUTCHours(0, 0, 0, 0);
			return dt;
		} catch (err) {
			return str;
		}
	}

	function timeParse(str) {
		str = str || '';
		let seg = str.split(/[^\d]/).filter(x => x);
		if (seg.length === 0)
			return new Date(1970, 0, 1, 0, 0, 0, 0);
		else if (seg.length === 1)
			seg.push('0');
		let h = Math.min(+seg[0], 23);
		let m = Math.min(+seg[1], 59);
		let td = new Date(1970, 0, 1, h, m, 0, 0);
		return td;
	}

	function dateParse(str, yearCutOff) {
		str = str || '';
		if (utcdatRegEx.test(str)) {
			return new Date(str);
		}
		if (!str) return dateZero();
		let today = dateToday();
		let seg = str.split(/[^\d]/).filter(x => x);
		if (seg.length === 1) {
			if (seg[0].length === 8) {
				//ddmmyyyy
				let x = seg[0];
				seg = [];
				seg.push(x.substring(0, 2)); // day
				seg.push(x.substring(2, 4)); // month
				seg.push(x.substring(4)); // year
			} else {
				seg.push('' + (today.getMonth() + 1));
				seg.push('' + today.getFullYear());
			}
		}
		else if (seg.length === 2) {
			seg.push('' + today.getFullYear());
		}

		let cutOffYear = function (year) {
			let yco = yearCutOff || '+10';
			let th = (yco.startsWith('+') || yco.startsWith('-')) ? (today.getFullYear() % 100 + parseInt(yco, 10)) : (+yco % 100);
			return year <= th ? '20' : '19';
		}

		let normalizeYear = function (y) {
			y = '' + y;
			switch (y.length) {
				case 1: y = cutOffYear(y) + '0' + y; break;
				case 2: y = cutOffYear(y) + y; break;
				case 4: break;
				default: y = today.getFullYear(); break;
			}
			return +y;
		};
		let td = new Date(Date.UTC(+normalizeYear(seg[2]), +((seg[1] ? seg[1] : 1) - 1), +seg[0], 0, 0, 0, 0));
		if (isNaN(td.getDate()))
			return dateZero();
		return td;
	}

	function dateEqual(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();
	}

	function dateIsZero(d1) {
		if (!isDate(d1)) return false;
		return dateEqual(d1, dateZero());
	}

	function dateHasTime(d1) {
		if (!isDate(d1)) return false;
		return d1.getUTCHours() !== 0 || d1.getUTCMinutes() !== 0 && d1.getUTCSeconds() !== 0;
	}

	function endOfMonth(dt) {
		var dte = new Date(Date.UTC(dt.getFullYear(), dt.getMonth() + 1, 0, 0, 0, 0));
		return dte;
	}

	function dateCreate(year, month, day) {
		let dt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
		return dt;
	}

	function dateDiff(unit, d1, d2) {
		if (d1.getTime() > d2.getTime())
			[d1, d2] = [d2, d1];
		switch (unit) {
			case "second":
				return (d2 - d1) / 1000;
			case "minute":
				return +(((d2 - d1) / 1000) / 60).toFixed(0);
			case "month":
				let delta = 0;
				if (d2.getDate() < d1.getDate())
					delta = -1;
				if (d1.getFullYear() === d2.getFullYear())
					return d2.getMonth() - d1.getMonth() + delta;
				let month = 0;
				let year = d1.getFullYear();
				while (year < d2.getFullYear()) {
					let day = d2.getDate();
					let dayOfMonth = endOfMonth(new Date(year + 1, d1.getMonth(), 1, 0, 0, 0, 0)).getDate();
					if (day > dayOfMonth)
						day = dayOfMonth;
					d1 = new Date(year + 1, d1.getMonth(), day, 0, 0, 0, 0);
					year = d1.getFullYear();
					month += 12;
				}
				month += d2.getMonth() - d1.getMonth();
				return month + delta;
			case "day":
				let du = 1000 * 60 * 60 * 24;
				return Math.floor((d2 - d1) / du);
			case "year":
				var dd = new Date(d1.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds(), d2.getMilliseconds());
				let dy = dd < d1 ?
					d2 > d1 ? -1 : 0 :
					d2 < d1 ? 1  : 0;
				return d2.getFullYear() - d1.getFullYear() + dy;
		}
		throw new Error('Invalid unit value for utils.date.diff');
	}

	function fromDays(days) {
		return new Date(Date.UTC(1900, 0, days, 0, 0, 0, 0));
	}

	function dateAdd(dt, nm, unit) {
		if (!isDate(dt))
			return null;
		var du = 0;
		switch (unit) {
			case 'year':
				return new Date(Date.UTC(dt.getFullYear() + nm, dt.getMonth(), dt.getDate(), 0, 0, 0, 0));
			case 'month':
				// save day of month
				let newMonth = dt.getMonth() + nm;
				let day = dt.getDate();
				var ldm = new Date(Date.UTC(dt.getFullYear(), newMonth + 1, 0, 0, 0)).getDate();
				if (day > ldm)
					day = ldm;
				var dtx = new Date(Date.UTC(dt.getFullYear(), newMonth, day, 0, 0, 0));
				return dtx;
			case 'day':
				du = 1000 * 60 * 60 * 24;
				break;
			case 'hour':
				du = 1000 * 60 * 60;
				break;
			case 'minute':
				du = 1000 * 60;
				break;
			case 'second':
				du = 1000;
				break;
			default:
				throw new Error('Invalid unit value for utils.date.add');
		}
		return new Date(dt.getTime() + nm * du);
	}

	function dateCompare(d1, d2) {
		if (!isDate(d1) || !isDate(d2)) return null;
		let t1 = d1.getTime();
		let t2 = d2.getTime();
		return t1 - t2;
	}

	function sanitize(text) {
		let t = '' + text || '';
		return t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
	}

	function splitPath(path) {
		let propIx = path.lastIndexOf('.');
		return {
			obj: path.substring(0, propIx),
			prop: path.substring(propIx + 1)
		};
	}

	function capitalize(text) {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
	function maxChars(text, length) {
		text = '' + text || '';
		if (text.length < length)
			return text;
		return text.substring(0, length - 1) + '\u2026' /*ellipsis*/;
	}

	function stringEqualNoCase(s1, s2) {
		return (s1 || '').toLowerCase() === (s2 || '').toLowerCase();
	}

	function toLatin(v) {
		v = v.toUpperCase();

		let tbl = {
			'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P', 'Х': '[', 'Ъ': ']', 'Ї': ']',
			'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'І': 'S', 'Ж': ':', 'Э': '"', 'Є': '"',
			'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>'
		};
		
		let r = '';
		for (let i = 0; i < v.length; i++) {
			let ch = tbl[v[i]];
			if (ch)
				r += ch;
			else
				r += v[i];
		}
		return r;
	}

	function applyFilters(filters, value) {
		if (!filters || !filters.length)
			return value;
		if (!value)
			return value;
		value = '' + value;
		for (let f of filters) {
			switch (f) {
				case 'trim':
					value = value.trim();
					break;
				case 'upper':
					value = value.toUpperCase();
					break;
				case 'lower':
					value = value.toLowerCase();
					break;
				case 'barcode':
					value = toLatin(value);
					break;
				case 'fract3':
					value = currencyRound(toNumber(value), 3);
					break;
				case 'fract2':
					value = currencyRound(toNumber(value), 2);
					break;
				case 'eval':
					if (value.startsWith('=')) {
						try {
							value = eval(value.replace(/[^0-9\s\+\-\*\/\,\.\,]/g, '').replaceAll(',', '.'));
						} catch (err) {
							value = '';
						}
					}
					break;
			}
		}
		return value;
	}

	function textContains(text, probe) {
		if (!probe)
			return true;
		if (!text)
			return false;
		return (text || '').toString().toLowerCase().indexOf(probe.toLowerCase()) !== -1;
	}

	function textContainsText(obj, props, probe) {
		if (!probe) return true;
		if (!obj)
			return false;
		for (let v of props.split(',')) {
			if (textContains(obj[v], probe))
				return true;
		}
		return false;
	}

	function defProperty(trg, prop, get, set /*todo!*/) {
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get: get
		});
	}

	function debounce(fn, timeout) {
		let timerId = null;
		return function () {
			clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn.call();
			}, timeout);
		};
	}

	function curry(fn, ...args) {
		return (..._arg) => {
			return fn(...args, ..._arg);
		};
	}

	function currencyRound(n, digits) {
		if (isNaN(n))
			return Nan;
		if (!isDefined(digits))
			digits = 2;
		let m = false;
		if (n < 0) {
			n = -n;
			m = true;
		}
		// toFixed = avoid js rounding error
		let r = Number(Math.round(n.toFixed(12) + `e${digits}`) + `e-${digits}`);
		return m ? -r : r;
	}

	function propFromPath(path) {
		if (!path)
			return '';
		let propIx = path.lastIndexOf('.');
		return path.substring(propIx + 1);
	}

	function defPropertyGet(trg, prop, get) {
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get: get
		});
	}

	function mergeTemplate(src, tml) {
		function assign(s, t) {
			return Object.assign({}, s || {}, t || {});
		}
		return assign(src, {
			properties: assign(src.properties, tml.properties),
			validators: assign(src.validators, tml.validators),
			events: assign(src.events, tml.events),
			defaults: assign(src.defaults, tml.defaults),
			commands: assign(src.commands, tml.commands),
			delegates: assign(src.delegates, tml.delegates)
		});
	}
};

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210729-7797*/
// services/period.js

app.modules['std:period'] = function () {

	const utils = require('std:utils');
	const date = utils.date;
	const locale = window.$$locale;

	function TPeriod(source) {
		if (source && 'From' in source) {
			if (!source.From && !source.To) {
				this.From = date.minDate;
				this.To = date.maxDate;
			}
			else {
				this.From = date.tryParse(source.From);
				this.To = date.tryParse(source.To);
			}
		} else {
			this.From = date.minDate;
			this.To = date.maxDate;
		}
		Object.defineProperty(this, 'Name', {
			enumerable: true,
			get() {
				return this.format('Date');
			}
		});
	}

	TPeriod.prototype.assign = function (v) {
		if (isPeriod(v)) {
			this.From = v.From;
			this.To = v.To;
		} else {
			if (v.From === null && v.To === null) {
				this.From = date.minDate;
				this.To = date.maxDate;
			} else {
				this.From = date.tryParse(v.From);
				this.To = date.tryParse(v.To);
			}
		}
		this.normalize();
		return this;
	};

	TPeriod.prototype.equal = function (p) {
		return date.equal(this.From, p.From) && date.equal(this.To, p.To);
	};

	TPeriod.prototype.fromUrl = function (v) {
		if (utils.isObject(v) && 'From' in v) {
			this.From = date.tryParse(v.From);
			this.To = date.tryParse(v.To);
			this.normalize();
			return this;
		}
		let px = (v || '').split('-');
		if (px[0].toLowerCase() === 'all') {
			this.From = date.minDate;
			this.To = date.maxDate;
			return this;
		}
		let df = px[0];
		let dt = px.length > 1 ? px[1] : px[0];
		this.From = date.tryParse(df);
		this.To = date.tryParse(dt);
		return this;
	};

	TPeriod.prototype.isAllData = function () {
		return this.From.getTime() === date.minDate.getTime() &&
			this.To.getTime() === date.maxDate.getTime();
	};

	TPeriod.prototype.format = function (dataType) {
		//console.warn(`${this.From.getTime()}-${date.minDate.getTime()} : ${this.To.getTime()}-${date.maxDate.getTime()}`);
		if (this.isAllData())
			return dataType === 'DateUrl' ? 'All' : locale.$AllPeriodData;
		let from = this.From;
		let to = this.To;
		if (from.getTime() === to.getTime())
			return utils.format(from, dataType);
		if (dataType === "DateUrl")
			return utils.format(from, dataType) + '-' + utils.format(to, dataType);
		return utils.format(from, dataType) + ' - ' + (utils.format(to, dataType) || '???');
	};

	TPeriod.prototype.text = function (showCustom) {
		//console.warn(`${this.From.getTime()}-${date.minDate.getTime()} : ${this.To.getTime()}-${date.maxDate.getTime()}`);
		if (this.isAllData())
			return locale.$AllPeriodData;
		// $PrevMonth, key: 'prevMonth
		let menu = predefined(false);
		for (let mi of menu) {
			//console.dir(mi);
			let np = createPeriod(mi.key);
			if (this.equal(np)) {
				return mi.name;
			}
		}
		if (showCustom)
			return locale.$CustomPeriod;
		let from = this.From;
		let to = this.To;
		return utils.format(from, 'Date') + ' - ' + (utils.format(to, 'Date') || '???');
	};

	TPeriod.prototype.in = function (dt) {
		let t = dt.getTime();
		let zd = utils.date.zero().getTime();
		if (this.From.getTime() === zd || this.To.getTime() === zd) return;
		return t >= this.From.getTime() && t <= this.To.getTime();
	};

	TPeriod.prototype.normalize = function () {
		if (this.From.getTime() > this.To.getTime())
			[this.From, this.To] = [this.To, this.From];
		return this;
	};

	TPeriod.prototype.set = function (from, to) {
		this.From = from;
		this.To = to;
		return this.normalize();
	};

	TPeriod.prototype.setFrom = function(from) {
		this.From = from;
		if (this.To.getTime() < this.From.getTime())
			this.To = this.From;
		return this;
	}

	TPeriod.prototype.setTo = function(to) {
		this.To = to;
		if (this.From.getTime() > this.To.getTime())
			this.From = this.To;
		return this;
	}

	TPeriod.prototype.toJson = function () {
		return JSON.stringify(this);
	};

	
	return {
		isPeriod,
		like: likePeriod,
		constructor: TPeriod,
		zero: zeroPeriod,
		all: allDataPeriod,
		create: createPeriod,
		predefined: predefined
	};

	function isPeriod(value) { return value instanceof TPeriod; }

	function likePeriod(obj) {
		if (!obj)
			return false;
		if (Object.getOwnPropertyNames(obj).length !== 2)
			return false;
		if (obj.hasOwnProperty('From') && obj.hasOwnProperty('To'))
			return true;
		return false;
	}

	function zeroPeriod() {
		return new TPeriod();
	}

	function allDataPeriod() {
		return createPeriod('allData');
	}

	function predefined (showAll) {
		let menu = [
			{ name: locale.$Today, key: 'today' },
			{ name: locale.$Yesterday, key: 'yesterday' },
			{ name: locale.$Last7Days, key: 'last7' },
			//{ name: locale.$Last30Days, key: 'last30' },
			//{ name: locale.$MonthToDate, key: 'startMonth' },
			{ name: locale.$CurrMonth, key: 'currMonth' },
			{ name: locale.$PrevMonth, key: 'prevMonth' },
			//{ name: locale.$QuartToDate, key: 'startQuart' },
			{ name: locale.$CurrQuart, key: 'currQuart' },
			{ name: locale.$PrevQuart, key: 'prevQuart' },
			//{ name: locale.$YearToDate, key: 'startYear' },
			{ name: locale.$CurrYear, key: 'currYear'},
			{ name: locale.$PrevYear, key: 'prevYear' }
		];
		if (showAll) {
			menu.push({ name: locale.$AllPeriodData, key: 'allData' });
		}
		return menu;
	}

	function createPeriod(key, from, to) {
		let today = date.today();
		let p = zeroPeriod();
		switch (key) {
			case 'today':
				p.set(today, today);
				break;
			case 'yesterday':
				let yesterday = date.add(today, -1, 'day');
				p.set(yesterday, yesterday);
				break;
			case 'last7':
				// -6 (include today!)
				let last7 = date.add(today, -6, 'day');
				p.set(last7, today);
				break;
			case 'last30':
				// -29 (include today!)
				let last30 = date.add(today, -29, 'day');
				p.set(last30, today);
				break;
			case 'startMonth':
				let d1 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
				p.set(d1, today);
				break;
			case 'prevMonth': {
					let d1 = date.create(today.getFullYear(), today.getMonth(), 1);
					let d2 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
					p.set(d1, date.add(d2, -1, 'day'));
				}
				break;
			case 'currMonth': {
					let d1 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
					let d2 = date.create(today.getFullYear(), today.getMonth() + 2, 1);
					p.set(d1, date.add(d2, -1, 'day'));
				}
				break;
			case 'startQuart': {
				let q = Math.floor(today.getMonth() / 3);
				let m = q * 3;
				let d1 = date.create(today.getFullYear(), m + 1, 1);
				p.set(d1, today);
			}
				break;
			case 'currQuart': {
				let year = today.getFullYear();
				let q = Math.floor(today.getMonth() / 3);
				let m1 = q * 3;
				let m2 = (q + 1) * 3;
				let d1 = date.create(year, m1 + 1, 1);
				let d2 = date.add(date.create(year, m2 + 1, 1), -1, 'day');
				//console.dir(d1 + ':' + d2);
				p.set(d1, d2);
			}
				break;
			case 'prevQuart': {
				let year = today.getFullYear();
				let q = Math.floor(today.getMonth() / 3) - 1;
				if (q < 0) {
					year -= 1;
					q = 3;
				}
				let m1 = q * 3;
				let m2 = (q + 1) * 3;
				let d1 = date.create(year, m1 + 1, 1);
				let d2 = date.add(date.create(year, m2 + 1, 1), -1, 'day');
				p.set(d1, d2);
			}
				break;
			case 'startYear':
				let dy1 = date.create(today.getFullYear(), 1, 1);
				p.set(dy1, today);
				break;
			case 'currYear': {
					let dy1 = date.create(today.getFullYear(), 1, 1);
					let dy2 = date.create(today.getFullYear(), 12, 31);
					p.set(dy1, dy2);
				}
				break;
			case 'prevYear': {
				let dy1 = date.create(today.getFullYear() - 1, 1, 1);
				let dy2 = date.create(today.getFullYear() - 1, 12, 31);
				p.set(dy1, dy2);
			}
				break;
			case 'allData':
				// full period
				p.set(date.minDate, date.maxDate);
				break;
			case "custom":
				p.set(from, to);
				break;
			default:
				console.error('invalid menu key: ' + key);
		}
		return p;
	}
};

// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

/*20220626-7852*/
/* services/url.js */

app.modules['std:url'] = function () {

	const utils = require('std:utils');
	const period = require('std:period');

	return {
		combine,
		makeQueryString,
		parseQueryString,
		normalizeRoot,
		idChangedOnly,
		idOrCopyChanged,
		makeBaseUrl,
		parseUrlAndQuery,
		replaceUrlQuery,
		createUrlForNavigate,
		firstUrl: '',
		encodeUrl: encodeURIComponent,
		helpHref,
		replaceSegment,
		removeFirstSlash,
		isNewPath,
		splitCommand
	};

	function normalize(elem) {
		elem = '' + elem || '';
		elem = elem.replace(/\\/g, '/');
		if (elem.startsWith('/'))
			elem = elem.substring(1);
		if (elem.endsWith('/'))
			elem = elem.substring(0, elem.length - 1);
		return elem;
	}

	function normalizeRoot(path) {
		let root = window.$$rootUrl;
		if (root && path.startsWith(root))
			return path.substring(root.length);
		return path;
	}

	function removeFirstSlash(url) {
		if (url && url.startsWith && url.startsWith('/'))
			return url.substring(1);
		return url;
	}
	function combine(...args) {
		return '/' + args.map(normalize).filter(x => !!x).join('/');
	}

	function toUrl(obj) {
		if (!utils.isDefined(obj) || obj === null) return '';
		if (utils.isDate(obj)) {
			return utils.format(obj, "DateUrl");		
		} else if (period.isPeriod(obj)) {
			return obj.format('DateUrl');
		} else if (utils.isObjectExact(obj)) {
			if (obj.constructor.name === 'Object') {
				if (!utils.isDefined(obj.Id))
					console.error('Id is not defined for Filter object');
				return '' + (obj.Id || '');
			} else if (!utils.isDefined(obj.$id)) {
				console.error(`$id is not defined for ${obj.constructor.name}`);
			}
			return '' + (obj.$id || '0');
		}
		return '' + obj;
	}

	function isEmptyForUrl(obj) {
		if (!obj) return true;
		let objUrl = toUrl(obj);
		if (!objUrl) return true;
		if (objUrl === '0') return true;
		return false;
	}

	function makeQueryString(obj) {
		if (!obj) return '';
		if (!utils.isObjectExact(obj)) return '';

		let esc = encodeURIComponent;

		// skip special (starts with '_' or '$')
		let query = Object.keys(obj)
			.filter(k => !k.startsWith('_') && !k.startsWith('$') && !isEmptyForUrl(obj[k]))
			.map(k => esc(k) + '=' + esc(toUrl(obj[k])))
			.join('&');
		return query ? '?' + query : '';
	}

	function parseQueryString(str) {
		var obj = {};
		str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
			obj[decodeURIComponent(key)] = '' + decodeURIComponent(value);
		});
		return obj;
	}

	function idChangedOnly(newUrl, oldUrl) {
		let n1 = (newUrl || '').split('?')[0];
		let o1 = (oldUrl || '').split('?')[0];
		let ns = n1.split('/');
		let os = o1.split('/');
		if (ns.length !== os.length)
			return false;

		function isNewPathArr(arr) {
			let ai = arr[arr.length - 1];
			return ai === 'new' || ai === '0';
		}

		if (isNewPathArr(os) && !isNewPathArr(ns)) {
			if (ns.slice(0, ns.length - 1).join('/') === os.slice(0, os.length - 1).join('/'))
				return true;
		}

		return false;
	}

	function idOrCopyChanged(newUrl, oldUrl) {
		let n1 = (newUrl || '').split('?')[0];
		let o1 = (oldUrl || '').split('?')[0];
		let ns = n1.split('/');
		let os = o1.split('/');
		if (ns.length !== os.length)
			return false;
		// remove id
		ns.pop();
		os.pop();
		if (ns.pop() === 'edit' && os.pop() === 'copy') {
			return ns.join('/') === os.join('/');
		}
		return false;
	}

	function makeBaseUrl(url) {
		let x = (url || '').split('/');
		let len = x.length;
		if (len >= 6)
			return x.slice(2, len - 2).join('/');
		return url;
	}

	function parseUrlAndQuery(url, querySrc) {
		let query = {};
		for (let p in querySrc) {
			if (p.startsWith('_') || p.startsWith('$')) continue;
			query[p] = toUrl(querySrc[p]); // all values are string
		}
		let rv = { url: url, query: query };
		if (url.indexOf('?') !== -1) {
			let a = url.split('?');
			rv.url = a[0];
			// first from url then from query
			rv.query = Object.assign({}, parseQueryString(a[1]), query);
		}
		return rv;
	}
	function replaceUrlQuery(url, query) {
		if (!url)
			url = window.location.pathname + window.location.search;
		let pu = parseUrlAndQuery(url, query);
		return pu.url + makeQueryString(pu.query);
	}

	function createUrlForNavigate(url, data) {
		let urlId = data || 'new';
		let qs = '';
		if (utils.isDefined(urlId.$id))
			urlId = urlId.$id;
		else if (utils.isObjectExact(urlId)) {
			urlId = data.Id;
			delete data['Id'];
			qs = makeQueryString(data);
			if (!utils.isDefined(urlId))
				urlId = 'new';
		}
		if (url.endsWith('new') && urlId === 'new')
			urlId = '';
		// special behaviour for main menu urls
		if (url.split('/').length === 3 && urlId === 'new')
			urlId = '';
		return combine(url, urlId) + qs;
	}

	function helpHref(path) {
		let helpUrlElem = document.querySelector('meta[name=helpUrl]');
		if (!helpUrlElem || !helpUrlElem.content) {
			console.warn('help url is not specified');
			return '';
		}
		return helpUrlElem.content + (path || '');
	}

	function replaceId(url, newId) {
		alert('todo::replaceId');
	}

	function isDialogPath(url) {
		return url.startsWith('/_dialog/');
	}

	function replaceSegment(url, id, action) {
		let parts = url.split('/');
		if (isDialogPath(url)) {
			parts.pop();
			if (id)
				parts.push(id);
		} else {
			if (action) parts.pop();
			if (id) parts.pop();
			if (action) parts.push(action);
			if (id) parts.push(id);
		}
		return parts.join('/');
	}

	function isNewPath(url) {
		url = url.split('?')[0]; // first segment
		if (!url) return false;
		if (url.indexOf('/new') !== -1)
			return true;
		if (isDialogPath(url) && url.endsWith('/0'))
			return true;
		return false;
	}

	function splitCommand(url) {
		let seg = url.split('/');
		let action = seg.pop();
		return {
			action,
			url: seg.join('/')
		};
	}
};






// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221124-7907
/* services/http.js */

app.modules['std:http'] = function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	const httpQueue = {
		arr: [],
		processing: false
	};

	return {
		get,
		post,
		load,
		upload,
		localpost,
		queue
	};

	async function doRequest(method, url, data, raw, skipEvents) {
		if (!skipEvents)
			eventBus.$emit('beginRequest', url);
		try {
			var response = await fetch(url, {
				method,
				mode: 'same-origin',
				headers: {
					'X-Requested-With': 'XMLHttpRequest',
					'Accept': 'application/json, text/html'
				},
				body: data
			});
			let ct = response.headers.get("content-type") || '';
			switch (response.status) {
				case 200:
					if (raw)
						return await response.blob();
					if (ct.startsWith('application/json'))
						return await response.json();
					return await response.text();
					break;
				case 255:
					let txt = response.statusText;
					if (ct.startsWith('text/'))
						txt = await response.text();
					throw txt;
				case 401: // Unauthorized
					setTimeout(() => {
						window.location.assign('/');
					}, 10);
					throw '__blank__';
					break;
				case 473: /*non standard */
					if ((response.statusText || (await response.text())) === 'Unauthorized') {
						// go to login page
						setTimeout(() => {
							window.location.assign('/');
						}, 10)
						throw '__blank__';
					}
					break;
				default:
					throw response.statusText;
			}
		}
		catch (err) {
			throw err;
		}
		finally {
			if (!skipEvents)
				eventBus.$emit('endRequest', url);
		}
	}

	function get(url, raw) {
		return doRequest('GET', url, null, raw);
	}

	function post(url, data, raw, skipEvents) {
		return doRequest('POST', url, data, raw, skipEvents);
	}

	async function upload(url, data) {
		eventBus.$emit('beginRequest', url);
		try {
			var response = await fetch(url, {
				method: 'POST',
				headers: {
					'X-Requested-With': 'XMLHttpRequest',
					'Accept': 'application/json'
				},
				body: data
			});
			let ct = response.headers.get("content-type") || '';
			switch (response.status) {
				case 200:
					if (ct.startsWith('application/json'))
						return await response.json();
					return await response.text();
				case 255:
					let txt = response.statusText;
					if (ct.startsWith('text/'))
						txt = await response.text();
					throw txt;
			}

		} catch (err) {
			throw err;
		} finally {
			eventBus.$emit('endRequest', url);
		}
	}

	function load(url, selector, baseUrl, skipIndicator) {

		if (selector) {
			let fc = selector.firstElementChild
			if (fc && fc.__vue__) {
				let ve = fc.__vue__;
				ve.$destroy();
				ve.$el.remove();
				ve.$el = null;
				fc.__vue__ = null;
				selector.innerHTML = '';
			}
			selector.__loadedUrl__ = url;
		}

		return new Promise(function (resolve, reject) {
			eventBus.$emit('beginLoad');
			doRequest('GET', url, null, false, skipIndicator)
				.then(function (html) {
					if (!html)
						return;
					if (html.startsWith('<!DOCTYPE')) {
						// full page - may be login?
						window.location.assign('/');
						return;
					}

					let cu = selector ? selector.__loadedUrl__ : undefined;
					if (cu && cu !== url) {
						// foreign url
						eventBus.$emit('endLoad');
						return;
					}

					let dp = new DOMParser();
					let rdoc = dp.parseFromString(html, 'text/html');
					// first element from fragment body
					let srcElem = rdoc.body.firstElementChild;
					let elemId = srcElem.id || null;
					selector.innerHTML = srcElem ? srcElem.outerHTML : '';
					if (elemId && !document.getElementById(elemId)) {
						selector.innerHTML = '';
						resolve(false);
						return;
					}
					for (let i = 0; i < rdoc.scripts.length; i++) {
						let s = rdoc.scripts[i];
						if (s.type === 'text/javascript') {
							let newScript = document.createElement("script");
							if (s.src)
								newScript.src = s.src;
							else
								newScript.text = s.text;
							document.body.appendChild(newScript).parentNode.removeChild(newScript);
						}
					}

					let fec = selector.firstElementChild;
					if (fec && fec.__vue__) {
						let ve = fec.__vue__;
						ve.$data.__baseUrl__ = baseUrl || urlTools.normalizeRoot(url);
						// save initial search
						ve.$data.__baseQuery__ = urlTools.parseUrlAndQuery(url).query;
						if (fec.classList.contains('modal')) {
							let dca = fec.getAttribute('data-controller-attr');
							if (dca)
								eventBus.$emit('modalSetAttribites', dca, ve);
						}
					}
					rdoc.body.remove();
					resolve(true);
					eventBus.$emit('endLoad');
				})
				.catch(function (error) {
					if (error == '__blank__')
						return;
					reject(error);
					eventBus.$emit('endLoad');
				});
		});
	}

	async function localpost(command, data) {
		let url = "http://127.0.0.1:64031/" + command;
		let response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'Accept': 'text/plain',
				'Content-Type': 'text/plain'
			},
			body: data
		});

		if (response.status == 200) {
			let ct = response.headers.get("content-type") || '';
			if (ct.startsWith('application/json'))
				return await response.json();
			return await response.text();
		} else if (response.status == 255) {
			throw await response.text() || response.statusText;
		} else {
			throw response.statusText;
		}
	}

	function queue(url, selector) {
		httpQueue.arr.push({ url, selector });
		if (!httpQueue.processing)
			doQueue();
	}

	async function doQueue() {
		if (!httpQueue.arr.length)
			return;
		httpQueue.processing = true;
		while (httpQueue.arr.length > 0) {
			let el = httpQueue.arr.shift();
			await load(el.url, el.selector, null);
		}
		httpQueue.processing = false;
	}
};





// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210502-7773*/
/* services/accel.js */

app.modules['std:accel'] = function () {

	const _elems = [];
	let _listenerAdded = false;
	let _key = 42;

	return {
		registerControl,
		unregisterControl
	};

	function _keyDownHandler(ev) {
		// control/alt/shift/meta
		let code = ev.code;
		// console.dir(code);
		if (code === 'NumpadEnter')
			code = "Enter";
		const keyAccel = `${ev.ctrlKey ? 'C' : '_'}${ev.altKey ? 'A' : '_'}${ev.shiftKey ? 'S' : '_'}${ev.metaKey ? 'M' : '_'}:${code}`;
		let el = _elems.find(x => x.accel === keyAccel);
		if (!el || !el.handlers || !el.handlers.length) return;
		let handler = el.handlers[0];
		if (handler.action === 'focus') {
			ev.preventDefault();
			ev.stopPropagation();
			Vue.nextTick(() => {
				if (typeof handler.elem.focus === 'function')
					handler.elem.focus();
			});
		} else if (handler.action == 'func') {
			ev.preventDefault();
			ev.stopPropagation();
			Vue.nextTick(() => {
				if (typeof handler.elem === 'function')
					handler.elem();
			});
		}
	}

	function setListeners() {
		if (_elems.length > 0) {
			if (_listenerAdded)
				return;
			document.addEventListener('keydown', _keyDownHandler, false);
			_listenerAdded = true;
			//console.dir('set listener')
		} else {
			if (!_listenerAdded)
				return;
			document.removeEventListener('keydown', _keyDownHandler, false);
			_listenerAdded = false;
			//console.dir('remove listener')
		}
	}

	function registerControl(accel, elem, action) {
		let key = _key++;
		var found = _elems.find(c => c.accel === accel);
		if (found)
			found.handlers.unshift({ key, elem, action });
		else
			_elems.push({ accel: accel, handlers: [{ key, elem, action }] });
		setListeners();
		return key;
	}

	function unregisterControl(key) {
		var found = _elems.findIndex(c => c.handlers.findIndex(x => x.key === key) != -1);
		if (found == -1) {
			console.error('Invalid accel handler');
			return;
		}
		let elem1 = _elems[found];
		elem1.handlers.shift();
		if (!elem1.handlers.length)
			_elems.splice(found, 1);
		setListeners();
	}
};

// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

// 20221124-7907
/* platform/routex.js */

(function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	// TODO:

	// 1: save/restore query (localStorage)

	const titleStore = {};

	function setTitle(to) {
		if (to.title) {
			document.title = to.title;
			titleStore[to.url] = to.title;
		}
	}

	function makeBackUrl(url) {
		let urlArr = url.split('/');
		if (urlArr.length === 5)
			return urlArr.slice(0, 3).join('/');
		else if (url.length === 4)
			return urlArr.slice(0, 2).join('/');
		return url;
	}

	function normalizedRoute() {
		let path = window.location.pathname;
		return urlTools.normalizeRoot(path);
	}

	const store = new Vuex.Store({
		strict: true,
		state: {
			route: normalizedRoute(),
			query: urlTools.parseQueryString(window.location.search)
		},
		getters: {
			seg0: (state) => state.route.split('/')[1],
			seg1: (state) => state.route.split('/')[2],
			len: (state) => state.route.split('/').length,
			url: (state) => state.route,
			query: (state) => state.query,
			route: (state) => {
				let sr = state.route.split('/');
				return {
					len: sr.length,
					seg0: sr[1],
					seg1: sr[2]
				};
			},
			baseUrl: (state) => {
				return state.route + urlTools.makeQueryString(state.query);
			},
			search: (state) => {
				return urlTools.makeQueryString(state.query);
			}
		},
		mutations: {
			navigate: function (state, to) { // to: {url, query, title}
				eventBus.$emit('closeAllPopups');
				eventBus.$emit('modalCloseAll');
				eventBus.$emit('showSidePane', null);
				let root = window.$$rootUrl;
				let oldUrl = root + state.route + urlTools.makeQueryString(state.query);
				state.route = to.url.toLowerCase();
				//console.dir(state.route);
				state.query = Object.assign({}, to.query);
				let newUrl = root + state.route + urlTools.makeQueryString(to.query);
				let h = window.history;
				setTitle(to);
				// push/pop state feature. Replace the current state and push new one.
				h.replaceState(oldUrl, null, oldUrl);
				h.pushState(oldUrl, null, newUrl);
			},
			query: function (state, query) {
				// changes all query
				let root = window.$$rootUrl;
				state.query = Object.assign({}, query);
				let newUrl = root + state.route + urlTools.makeQueryString(state.query);
				//console.warn('set query: ' + newUrl);
				window.history.replaceState(null, null, newUrl);
			},
			setquery: function (state, query) {
				// TODO: replaceUrl: boolean
				// changes some fields or query
				let root = window.$$rootUrl;
				let oldUrl = root + this.getters.baseUrl;
				state.query = Object.assign({}, state.query, query);
				let newUrl = root + this.getters.baseUrl;
				if (newUrl === oldUrl) return;
				window.history.replaceState(null, null, newUrl);
				eventBus.$emit('queryChange', state.query);
			},
			popstate: function (state) {
				state.route = normalizedRoute();
				state.query = urlTools.parseQueryString(window.location.search);
				if (state.route in titleStore) {
					document.title = titleStore[state.route];
				}
			},
			setstate: function (state, to) { // to: {url, title}
				window.history.replaceState(null, null, window.$$rootUrl + to.url);
				state.route = normalizedRoute();
				state.query = urlTools.parseQueryString(window.location.search);
				setTitle(to);
			},
			setnewid: function (state, to) {
				let root = window.$$rootUrl;
				let oldRoute = state.route;
				let newRoute = urlTools.replaceSegment(oldRoute, to.id, to.action);
				state.route = newRoute;
				let newUrl = root + newRoute + urlTools.makeQueryString(state.query);
				window.history.replaceState(null, null, newUrl);
			},
			close: function (state) {

				function navigateBack() {
					// TODO: ??? 
					window.close();
					/*
					let url = makeBackUrl(state.route);
					if (url === state.route) {
						let firstUrl = urlTools.firstUrl;
						store.commit('navigate', { url: firstUrl.url, title: firstUrl.title });
					} else {
						store.commit('navigate', { url: url });
					}
					*/
				}

				if (window.history.length > 1) {
					let oldUrl = window.location.pathname;
					window.history.back();
					// it is done?
					setTimeout(() => {
						if (window.location.pathname === oldUrl) {
							navigateBack();
						}
					}, 300);
				} else
					navigateBack();
			}
		}
	});

	function replaceUrlSearch(url, search) {
		let parts = url.split('?');
		return parts[0] + (search || '');
	}

	function replaceUrlQuery(url, query) {
		return replaceUrlSearch(url, urlTools.makeQueryString(query));
	}

	store.parseQueryString = urlTools.parseQueryString;
	store.makeQueryString = urlTools.makeQueryString;
	store.replaceUrlSearch = replaceUrlSearch;
	store.replaceUrlQuery = replaceUrlQuery;
	store.makeBackUrl = makeBackUrl;

	app.components['std:store'] = store;
})();
// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221124-7907
/*components/include.js*/

(function () {

	const http = require('std:http');
	const urlTools = require('std:url');
	const eventBus = require('std:eventBus');
	const utils = require('std:utils');

	function _destroyElement(el) {
		let fc = el.firstElementChild;
		if (!fc) return;
		let vue = fc.__vue__;
		// Maybe collectionView created the wrapper!
		if (vue && !vue.$marker)
			vue = vue.$parent;
		if (vue && vue.$marker()) {
			vue.$destroy();
		}
		el.__vue__ = null;
	}

	Vue.component('include', {
		template: '<div :class="implClass"></div>',
		props: {
			src: String,
			cssClass: String,
			needReload: Boolean,
			insideDialog: Boolean,
			done: Function,
			queued: Boolean,
			hideIndicator: Boolean
		},
		data() {
			return {
				loading: true,
				currentUrl: '',
				_needReload: true
			};
		},
		methods: {
			loaded(ok) {
				this.loading = false;
				if (this.insideDialog)
					eventBus.$emit('modalCreated', this);
				if (this.done)
					this.done();
			},
			requery() {
				if (this.currentUrl) {
					// Do not set loading. Avoid blinking
					this.__destroy();
					http.load(this.currentUrl, this.$el, undefined, this.hideIndicator)
						.then(this.loaded)
						.catch(this.error);
				}
			},
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			modalRequery() {
				if (!this.insideDialog) return;
				setTimeout(() => {
					this.requery();
				}, 1);
			},
			error(msg) {
				if (msg instanceof Error)
					msg = msg.message;
				else
					msg = msg || '';
				if (this.insideDialog)
					eventBus.$emit('modalClose', false);
				if (msg.indexOf('UI:') === 0) {
					let dlgData = {
						promise: null, data: {
							message: msg.substring(3).replace('\\n', '\n'),
							style: 'alert'
						}
					};
					eventBus.$emit('confirm', dlgData);
				} else
					alert(msg);
			}
		},
		computed: {
			implClass() {
				return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
			}
		},
		mounted() {
			//console.warn('include has been mounted');
			if (this.src) {
				this.currentUrl = this.src;
				http.load(this.src, this.$el, undefined, this.hideIndicator)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		},
		watch: {
			src: function (newUrl, oldUrl) {
				if (this.insideDialog) {
					// Dialog. No need to reload always.
					this.currentUrl = newUrl;
				}
				else if (newUrl.split('?')[0] === oldUrl.split('?')[0]) {
					// Only the search has changed. No need to reload.
					this.currentUrl = newUrl;
				}
				else if (urlTools.idChangedOnly(newUrl, oldUrl)) {
					// Id has changed after save. No need to reload.
					this.currentUrl = newUrl;
				} else if (urlTools.idOrCopyChanged(newUrl, oldUrl)) {
					// Id has changed after save. No need to reload.
					this.currentUrl = newUrl;
				}
				else {
					this.loading = true; // hides the current view
					this.currentUrl = newUrl;
					this.__destroy();
					http.load(newUrl, this.$el, undefined, this.hideIndicator)
						.then(this.loaded)
						.catch(this.error);
				}
			},
			needReload(val) {
				// works like a trigger
				if (val) this.requery();
			}
		}
	});


	Vue.component('a2-include', {
		template: '<div class="a2-include"></div>',
		props: {
			source: String,
			arg: undefined,
			dat: undefined,
		},
		data() {
			return {
				needLoad: 0
			};
		},
		methods: {
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			loaded() {
			},
			error(msg) {
				if (msg instanceof Error)
					msg = msg.message;
				alert(msg);
			},
			makeUrl() {
				let arg = this.arg || '0';
				let url = urlTools.combine('_page', this.source, arg);
				if (this.dat)
					url += urlTools.makeQueryString(this.dat);
				return url;
			},
			load() {
				let url = this.makeUrl();
				this.__destroy();
				http.load(url, this.$el, undefined, this.hideIndicator)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		watch: {
			source(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			arg(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			dat(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			needLoad() {
				this.load();
			}
		},
		mounted() {
			if (this.source) {
				this.currentUrl = this.makeUrl(this.source);
				http.load(this.currentUrl, this.$el, undefined, this.hideIndicator)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		}
	});


	Vue.component('a2-queued-include', {
		template: '<div class="a2-include"></div>',
		props: {
			source: String,
			arg: undefined,
			dat: undefined,
		},
		data() {
			return {
				needLoad: 0
			};
		},
		methods: {
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			loaded() {
			},
			error(msg) {
				if (msg instanceof Error)
					msg = msg.message;
				alert(msg);
			},
			makeUrl() {
				let arg = this.arg || '0';
				let url = urlTools.combine('_page', this.source, arg);
				if (this.dat)
					url += urlTools.makeQueryString(this.dat);
				return url;
			},
			load() {
				let url = this.makeUrl();
				this.__destroy();
				http.queue(url, this.$el);
			}
		},
		watch: {
			source(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			arg(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			dat(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			needLoad() {
				this.load();
			}
		},
		mounted() {
			if (this.source) {
				this.currentUrl = this.makeUrl(this.source);
				http.queue(this.currentUrl, this.$el);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		}
	});
})();
// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

// 20221127-7908
// components/collectionview.js

/*
TODO:
11. GroupBy for server, client (url is done)
*/

(function () {


	const log = require('std:log', true);
	const utils = require('std:utils');
	const period = require('std:period');
	const eventBus = require('std:eventBus');

	const DEFAULT_PAGE_SIZE = 20;

	const eqlower = utils.text.equalNoCase;

	function getModelInfoProp(src, propName) {
		if (!src) return undefined;
		let mi = src.$ModelInfo;
		if (!mi) return undefined;
		return mi[propName];
	}

	function setModelInfoProp(src, propName, value) {
		if (!src) return;
		let mi = src.$ModelInfo;
		if (!mi) return;
		mi[propName] = value;
	}

	function makeNewQueryFunc(that) {
		let nq = { dir: that.dir, order: that.order, offset: that.offset, group: that.GroupBy };
		for (let x in that.filter) {
			let fVal = that.filter[x];
			if (period.isPeriod(fVal)) {
				nq[x] = fVal.format('DateUrl');
			}
			else if (utils.isDate(fVal)) {
				nq[x] = utils.format(fVal, 'DateUrl');
			}
			else if (utils.isObjectExact(fVal)) {
				if (!('Id' in fVal)) {
					console.error('The object in the Filter does not have Id property');
				}
				nq[x] = fVal.Id ? fVal.Id : undefined;
			}
			else if (fVal) {
				nq[x] = fVal;
			}
			else {
				nq[x] = undefined;
			}
		}
		return nq;
	}

	function modelInfoToFilter(q, filter) {
		if (!q) return;
		for (let x in filter) {
			if (x in q) {
				let iv = filter[x];
				if (period.isPeriod(iv)) {
					filter[x] = iv.fromUrl(q[x]);
				}
				else if (utils.isDate(iv)) {
					filter[x] = utils.date.tryParse(q[x]);
				}
				else if (utils.isObjectExact(iv)) 
					iv.Id = q[x];
				else if (utils.isNumber(iv))
					filter[x] = +q[x];
				else {
					filter[x] = q[x];
				}
			}
		}
	}

	// client collection

	Vue.component('collection-view', {
		//store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialPageSize: Number,
			initialFilter: Object,
			initialSort: Object,
			runAt: String,
			filterDelegate: Function
		},
		data() {
			let lq = Object.assign({}, {
				offset: 0,
				dir: 'asc',
				order: ''
			}, this.initialFilter);

			return {
				filter: this.initialFilter,
				filteredCount: 0,
				localQuery: lq
			};
		},
		computed: {
			pageSize() {
				if (this.initialPageSize > 0)
					return this.initialPageSize;
				return -1; // invisible pager
			},
			dir() {
				return this.localQuery.dir;
			},
			offset() {
				return this.localQuery.offset;
			},
			order() {
				return this.localQuery.order;
			},
			pagedSource() {
				let s = performance.now();
				let arr = [].concat(this.ItemsSource);

				if (this.filterDelegate) {
					arr = arr.filter((item) => this.filterDelegate(item, this.filter));
				}
				// sort
				if (this.order && this.dir) {
					let p = this.order;
					let d = eqlower(this.dir, 'asc');
					arr.sort((a, b) => {
						if (a[p] === b[p])
							return 0;
						else if (a[p] < b[p])
							return d ? -1 : 1;
						return d ? 1 : -1;
					});
				}
				// HACK!
				this.filteredCount = arr.length;
				// pager
				if (this.pageSize > 0)
					arr = arr.slice(this.offset, this.offset + this.pageSize);
				arr.$origin = this.ItemsSource;
				if (arr.indexOf(arr.$origin.$selected) === -1) {
					// not found in target array
					arr.$origin.$clearSelected();
				}
				if (log) log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
				return this.filteredCount;
			},
			thisPager() {
				return this;
			},
			pages() {
				let cnt = this.filteredCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			$setOffset(offset) {
				this.localQuery.offset = offset;
			},
			sortDir(order) {
				return eqlower(order, this.order) ? this.dir : undefined;
			},
			doSort(order) {
				let nq = this.makeNewQuery();
				if (eqlower(nq.order, order))
					nq.dir = eqlower(nq.dir, 'asc') ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
				}
				if (!nq.order)
					nq.dir = null;
				// local
				this.localQuery.dir = nq.dir;
				this.localQuery.order = nq.order;
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			copyQueryToLocal(q) {
				for (let x in q) {
					let fVal = q[x];
					if (x === 'offset')
						this.localQuery[x] = q[x];
					else
						this.localQuery[x] = fVal ? fVal : undefined;
				}
			}
		},
		created() {
			if (this.initialSort) {
				this.localQuery.order = this.initialSort.order;
				this.localQuery.dir = this.initialSort.dir;
			}
			this.$on('sort', this.doSort);
		}
	});


	// server collection view
	Vue.component('collection-view-server', {
		//store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter" :ParentCollectionView="parentCw">
	</slot>
</div>
`,
		props: {
			ItemsSource: [Array, Object],
			initialFilter: Object,
			persistentFilter: Array
		},

		data() {
			return {
				filter: this.initialFilter,
				lockChange: true
			};
		},

		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},

		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			thisPager() {
				return this;
			},
			pageSize() {
				return getModelInfoProp(this.ItemsSource, 'PageSize');
			},
			dir() {
				return  getModelInfoProp(this.ItemsSource, 'SortDir');
			},
			order() {
				return getModelInfoProp(this.ItemsSource, 'SortOrder');
			},
			offset() {
				return getModelInfoProp(this.ItemsSource, 'Offset');
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			},
			parentCw() {
				// find parent collection view;
				let p = this.$parent;
				while (p && p.$options && p.$options._componentTag && !p.$options._componentTag.startsWith('collection-view-server'))
					p = p.$parent;
				return p;
			}
		},
		methods: {
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, 'Offset', offset);
				this.reload();
			},
			sortDir(order) {
				return eqlower(order, this.order) ? this.dir : undefined;
			},
			doSort(order) {
				if (eqlower(order, this.order)) {
					let dir = eqlower(this.dir, 'asc') ? 'desc' : 'asc';
					setModelInfoProp(this.ItemsSource, 'SortDir', dir);
				} else {
					setModelInfoProp(this.ItemsSource, 'SortOrder', order);
					setModelInfoProp(this.ItemsSource, 'SortDir', 'asc');
				}
				this.reload();
			},
			filterChanged() {
				if (this.lockChange) return;
				let mi = this.ItemsSource.$ModelInfo;
				if (!mi) {
					mi = { Filter: this.filter };
					this.ItemsSource.$ModelInfo = mi;
				}
				else {
					this.ItemsSource.$ModelInfo.Filter = this.filter;
				}
				if (this.persistentFilter && this.persistentFilter.length) {
					let parentProp = this.ItemsSource._path_;
					let propIx = parentProp.lastIndexOf('.');
					parentProp = parentProp.substring(propIx + 1);
					for (let topElem of this.ItemsSource.$parent.$parent) {
						if (!topElem[parentProp].$ModelInfo)
							topElem[parentProp].$ModelInfo = mi;
						else {
							for (let pp of this.persistentFilter) {
								if (!utils.isEqual(topElem[parentProp].$ModelInfo.Filter[pp], this.filter[pp])) {
									topElem[parentProp].$ModelInfo.Filter[pp] = this.filter[pp];
									topElem[parentProp].$loaded = false;
								}
							}
						}
					}
				}
				if ('Offset' in mi)
					setModelInfoProp(this.ItemsSource, 'Offset', 0);
				this.reload();
			},
			reload() {
				this.$root.$emit('cwChange', this.ItemsSource);
			},
			updateFilter() {
				// modelInfo to filter
				let mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
				if (!mi) return;
				let fi = mi.Filter;
				if (!fi) return;
				this.lockChange = true;
				for (var prop in this.filter) {
					if (prop in fi)
						this.filter[prop] = fi[prop];
				}
				this.$nextTick(() => {
					this.lockChange = false;
				});
			},
			__setFilter(props) {
				if (this.ItemsSource !== props.source) return;
				if (period.isPeriod(props.value))
					this.filter[props.prop].assign(props.value);
				else
					this.filter[props.prop] = props.value;
			}
		},
		created() {
			// get filter values from modelInfo
			let mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
			if (mi) {
				modelInfoToFilter(mi.Filter, this.filter);
			}
			this.$nextTick(() => {
				this.lockChange = false;
			});
			// from datagrid, etc
			this.$on('sort', this.doSort);
			eventBus.$on('setFilter', this.__setFilter);
		},
		updated() {
			this.updateFilter();
		},
		beforeDestroy() {
			eventBus.$off('setFilter', this.__setFilter);
		}
	});

	// server url collection view
	Vue.component('collection-view-server-url', {
		store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter" :Grouping="thisGrouping">
	</slot>
</div>
`,
		props: {
			ItemsSource: [Array, Object],
			initialFilter: Object,
			initialGroup: Object
		},
		data() {
			return {
				filter: this.initialFilter,
				GroupBy: '',
				lockChange: true
			};
		},
		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			},
			GroupBy: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},
		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			pageSize() {
				let ps = getModelInfoProp(this.ItemsSource, 'PageSize');
				return ps ? ps : DEFAULT_PAGE_SIZE;
			},
			dir() {
				let dir = this.$store.getters.query.dir;
				if (!dir) dir = getModelInfoProp(this.ItemsSource, 'SortDir');
				return dir;
			},
			offset() {
				let ofs = this.$store.getters.query.offset;
				if (!utils.isDefined(ofs))
					ofs = getModelInfoProp(this.ItemsSource, 'Offset');
				return ofs || 0;
			},
			order() {
				return getModelInfoProp(this.ItemsSource,'SortOrder');
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			},
			thisPager() {
				return this;
			},
			thisGrouping() {
				return this;
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			},
			Filter() {
				return this.filter;
			}
		},
		methods: {
			commit(query) {
				//console.dir(this.$root.$store);
				query.__baseUrl__ = '';
				if (this.$root.$data)
					query.__baseUrl__ = this.$root.$data.__baseUrl__;
				this.$store.commit('setquery', query);
			},
			sortDir(order) {
				return eqlower(order, this.order) ? this.dir : undefined;
			},
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, "Offset", offset);
				this.commit({ offset: offset });
			},
			doSort(order) {
				let nq = this.makeNewQuery();
				if (eqlower(nq.order, order))
					nq.dir = eqlower(nq.dir ,'asc') ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
				}
				if (!nq.order)
					nq.dir = null;
				this.commit(nq);
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			filterChanged() {
				if (this.lockChange) return;
				// for server only
				let nq = this.makeNewQuery();
				nq.offset = 0;
				if (!nq.order) nq.dir = undefined;
				//console.warn('filter changed');
				this.commit(nq);
			},
			__setFilter(props) {
				if (this.ItemsSource !== props.source) return;
				if (period.isPeriod(props.value))
					this.filter[props.prop].assign(props.value);
				else
					this.filter[props.prop] = props.value;
			},
			__clearFilter(props) {
				if (this.ItemsSource !== props.source) return;
				this.filter = this.initialFilter;
			}
		},
		created() {
			// get filter values from modelInfo and then from query
			let mi = this.ItemsSource.$ModelInfo;
			if (mi) {
				modelInfoToFilter(mi.Filter, this.filter);
				if (mi.GroupBy) {
					this.GroupBy = mi.GroupBy;
				}
			}
			// then query from url
			let q = this.$store.getters.query;
			modelInfoToFilter(q, this.filter);

			this.$nextTick(() => {
				this.lockChange = false;
			});

			this.$on('sort', this.doSort);

			eventBus.$on('setFilter', this.__setFilter);
			eventBus.$on('clearFilter', this.__clearFilter);
		},
		beforeDestroy() {
			eventBus.$off('setFilter', this.__setFilter);
			eventBus.$off('clearFilter', this.__clearFilter);
		}
	});

})();
// Copyright © 2021 Alex Kukhtin. All rights reserved.

// 20210502-7773
// components/accelcommand.js

const maccel = require('std:accel');

(function () {
	Vue.component('a2-accel-command', {
		props: {
			accel: String,
			command: Function
		},
		render() {
		},
		mounted() {
			if (this.accel)
				this._key = maccel.registerControl(this.accel, this.command, 'func');
		},
		beforeDestroy() {
			if (this.accel)
				maccel.unregisterControl(this._key);
		},
	});
})();

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210211-7747
/* services/modelinfo.js */

app.modules['std:modelInfo'] = function () {


	const DEFAULT_PAGE_SIZE = 20;

	const period = require('std:period');

	return {
		copyfromQuery: copyFromQuery,
		get: getPagerInfo,
		reconcile,
		reconcileAll,
		setModelInfoForRoot,
		setModelInfo
	};

	function copyFromQuery(mi, q) {
		if (!mi) return;
		let psq = { PageSize: q.pageSize, Offset: q.offset, SortDir: q.dir, SortOrder: q.order, GroupBy: q.group };
		for (let p in psq) {
			mi[p] = psq[p];
		}
		if (mi.Filter) {
			for (let p in mi.Filter) {
				mi.Filter[p] = q[p];
			}
		}
	}

	function getPagerInfo(mi) {
		if (!mi) return undefined;
		let x = { pageSize: mi.PageSize, offset: mi.Offset, dir: mi.SortDir, order: mi.SortOrder, group: mi.GroupBy };
		if (mi.Filter) {
			for (let p in mi.Filter) {
				x[p] = mi.Filter[p];
			}
		}
		return x;
	}

	function reconcile(mi) {
		if (!mi) return;
		if (!mi.Filter) return;
		for (let p in mi.Filter) {
			let fv = mi.Filter[p];
			if (typeof fv === 'string' && fv.startsWith('\"\\/\"')) {
				let dx = new Date(fv.substring(4, fv.length - 4));
				mi.Filter[p] = dx;
				//console.dir(mi.Filter[p]);
			}
		}
	}

	function reconcileAll(m) {
		if (!m) return;
		for (let p in m) {
			reconcile(m[p]);
		}
	}

	function checkPeriod(obj) {
		let f = obj.Filter;
		if (!f) return obj;
		if (!('Period' in f))
			return obj;
		let p = f.Period;
		if (period.like(p))
			f.Period = new period.constructor(p);
		return obj;
	}

	function setModelInfo(root, info, rawData) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: DEFAULT_PAGE_SIZE
		};
		let mi = rawData.$ModelInfo;
		if (!mi) return;
		reconcileAll(mi);
		for (let p in mi) {
			root[p].$ModelInfo = checkPeriod(mi[p]);
		}
	}

	function setModelInfoFilter(prop, val) {
		if (period.isPeriod(val))
			this.Filter[prop].assign(val);
		else
			this.Filter[prop] = val;
	}

	function setRootModelInfo(elem, data) {
		if (!data.$ModelInfo) return;
		for (let p in data.$ModelInfo) {
			if (!elem) elem = this[p];
			elem.$ModelInfo = checkPeriod(data.$ModelInfo[p]);
			elem.$ModelInfo.$setFilter = setModelInfoFilter;
			return elem.$ModelInfo;
		}
	}

	function createElemModelInfo(elem, raw) {
		if (!elem.$ModelInfo) {
			elem.$ModelInfo = checkPeriod(raw);
			elem.$ModelInfo.$setFilter = setModelInfoFilter;
		}
		return elem.$ModelInfo;
	}

	function findRootModelInfo() {
		for (let p in this._meta_.props) {
			let x = this[p];
			if (x.$ModelInfo)
				return x.$ModelInfo;
		}
		return null;
	}

	function setModelInfoForRoot(elem) {
		elem.$createModelInfo = createElemModelInfo;
		elem._setModelInfo_ = setRootModelInfo;
		elem._findRootModelInfo = findRootModelInfo;
	}

};


// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190307-7460*/
/* services/mask.js */

app.modules['std:mask'] = function () {


	const PLACE_CHAR = '_';

	return {
		getMasked,
		getUnmasked,
		mountElement,
		unmountElement,
		setMask
	};

	function isMaskChar(ch) {
		return ch === '#' || ch === '@';
	}

	function isSpaceChar(ch) {
		return '- ()'.indexOf(ch) !== -1;
	}

	function isValidChar(mask, char) {
		if (mask === '#') {
			return char >= '0' && char <= '9' || char === PLACE_CHAR;
		}
		return false; // todo: alpha
	}

	function getMasked(mask, value) {
		let str = '';
		let j = 0;
		for (let i = 0; i < mask.length; i++) {
			let mc = mask[i];
			let ch = value[j];
			if (mc === ch) {
				str += ch;
				j++;
			} else if (isMaskChar(mc)) {
				str += ch || PLACE_CHAR;
				j++;
			} else {
				str += mc;
			}
		}
		return str;
	}

	function fitMask(mask, value) {
		let str = '';
		let j = 0;

		function nextValueChar() {
			let ch;
			for (; ;) {
				ch = value[j];
				if (!ch) return PLACE_CHAR;
				// TODO: this is for digits only!
				j++;
				if (ch >= '0' && ch <= '9') {
					return ch;
				}
			}
		}

		let ch = nextValueChar();
		
		for (let i = 0; i < mask.length; i++) {
			let mc = mask[i];
			if (isSpaceChar(mc)) {
				str += mc;
			}
			else if (isMaskChar(mc)) {
				str += ch;
				ch = nextValueChar();
			} else {
				str += mc;
				if (mc === ch)
					ch = nextValueChar();
			}
		}
		return str;
	}

	function getUnmasked(mask, value) {
		let str = '';
		for (let i = 0; i < mask.length; i++) {
			let mc = mask[i];
			let ch = value[i];
			if (isSpaceChar(mc)) continue;
			if (isMaskChar(mc)) {
				if (ch && ch !== PLACE_CHAR) {
					str += ch;
				} else {
					return '';
				}
			} else {
				str += mc;
			}
		}
		return str;
	}

	function mountElement(el, mask) {
		if (!el) return; // static, etc
		el.__opts = {
			mask: mask
		};
		el.addEventListener('keydown', keydownHandler, false);
		el.addEventListener('blur', blurHandler, false);
		el.addEventListener('focus', focusHandler, false);
		el.addEventListener('paste', pasteHandler, false);
	}

	function unmountElement(el, mask) {
		if (!el) return;
		delete el.__opts;
		el.removeEventListener('keydown', keydownHandler);
		el.removeEventListener('blur', blurHandler);
		el.removeEventListener('focus', focusHandler);
		el.removeEventListener('paste', pasteHandler);
	}

	function setMask(el, mask) {
		if (!el) return;
		if (!mask) {
			// remove mask
			unmountElement(el, mask);
			el.value = '';
		} else if (el.__opts) {
			// change mask
			el.__opts.mask = mask;
			//console.dir('set new mask');
			el.value = getMasked(mask, '');
		} else {
			// set new
			mountElement(el, mask);
			el.value = getMasked(mask, '');
		}
	}

	function getCaretPosition(input) {
		if (!input)
			return 0;
		if (input.selectionStart !== undefined) {
			if (input.selectionStart !== input.selectionEnd)
				input.setSelectionRange(input.selectionStart, input.selectionStart);
			return input.selectionStart;
		}
		return 0;
	}

	function fitCaret(mask, pos, fit) {
		if (pos >= mask.length)
			return pos + 1; // after text
		let mc = mask[pos];
		if (isMaskChar(mc))
			return pos;
		if (fit === 'r') {
			for (let i = pos + 1; i < mask.length; i++) {
				if (isMaskChar(mask[i])) return i;
			}
			return mask.length + 1;
		} else if (fit === 'l') {
			for (let i = pos - 1; i >= 0; i--) {
				if (isMaskChar(mask[i])) return i;
			}
			return fitCaret(mask, 0, 'r'); // first
		}
		throw new Error(`mask.fitCaret. Invalid fit value '${fit}'`);
	}

	function setCaretPosition(input, pos, fit) {
		//console.dir('set position');
		if (!input) return;
		if (input.offsetWidth === 0 || input.offsetHeight === 0) {
			return; // Input's hidden
		}
		if (input.setSelectionRange) {
			let mask = input.__opts.mask;
			pos = fitCaret(mask, pos, fit);
			input.setSelectionRange(pos, pos);
		}
	}

	function setRangeText(input, text, s, e) {
		//console.dir('set range text');
		if (input.setRangeText) {
			input.setRangeText(text, s, e);
			return;
		}
		let val = input.value;
		let r = val.substring(0, s);
		r += text;
		r += val.substring(e);
		input.value = r;
	}

	function clearRangeText(input) {
		setRangeText(input, '', input.selectionStart, input.selectionEnd);
	}

	function clearSelectionFull(ev, input) {
		if (ev.which !== 46) return false;
		let s = input.selectionStart;
		let e = input.selectionEnd;
		let l = input.value.length;
		if (s === 0 && e === l) {
			//console.dir(`s: ${s}, e:${e} v:${input.value.length}`);
			input.value = getMasked(input.__opts.mask, '');
			setCaretPosition(input, 0, 'r');
			ev.preventDefault();
			ev.stopPropagation();
			return true;
		}
		return false;
	}

	function setCurrentChar(input, char) {
		let pos = getCaretPosition(input);
		let mask = input.__opts.mask;
		pos = fitCaret(mask, pos, 'r');
		let cm = mask[pos];
		if (isValidChar(cm, char)) {
			setRangeText(input, char, pos, pos + 1);
			let np = fitCaret(mask, pos + 1, 'r');
			input.setSelectionRange(np, np);
		}
	}

	function isAccel(e, input) {
		if (e.which >= 112 && e.which <= 123)
			return true; // f1-f12
		if (e.which === 16 || e.which === 17)
			return true; // ctrl || shift
		if (e.which >= 112 && e.which <= 123)
			return true; // f1-f12
		if (e.which === 9) return true; // tab
		if (e.which === 13) {
			fireChange(input);
			setTimeout(() => {
				let d = 'l'; // last
				if (!input.value) {
					input.value = getMasked(input.__opts.mask, '');
					d = 'r'; // first
				}
				setCaretPosition(input, d === 'r' ? 0 : 32768, d);
			}, 10);
			return true; // enter
		}
		if (e.ctrlKey) {
			switch (e.which) {
				case 86: // V
				case 67: // C
				case 65: // A
				case 88: // X
				case 90: // Z
				case 45: // Ins
					return true;
			}
		} else if (e.shiftKey) {
			switch (e.which) {
				case 45: // ins
				case 46: // del
				case 37: // left
				case 39: // right
				case 36: // home
				case 35: // end
					return true;
			}
		}
		return false;
	}

	function keydownHandler(e) {
		if (isAccel(e, this)) return;
		let handled = false;
		if (clearSelectionFull(e, this)) return;
		let pos = getCaretPosition(this);
		//console.dir(e.which);
		let char = e.which;
		if (char === 229) {
			// mobile fix
			char = e.target.value.charAt(e.target.selectionStart - 1).charCodeAt();
		}
		switch (char) {
			case 37: /* left */
				setCaretPosition(this, pos - 1, 'l');
				handled = true;
				break;
			case 39: /* right */
				setCaretPosition(this, pos + 1, 'r');
				handled = true;
				break;
			case 38: /* up */
			case 40: /* down */
			case 33: /* pgUp */
			case 34: /* pgDn* */
				handled = true;
				break;
			case 36: /*home*/
				setCaretPosition(this, 0, 'r');
				handled = true;
				break;
			case 35: /*end*/
				setCaretPosition(this, this.__opts.mask.length, 'l');
				handled = true;
				break;
			case 46: /*delete*/
				setCurrentChar(this, PLACE_CHAR);
				handled = true;
				break;
			case 8: /*backspace*/
				setCaretPosition(this, pos - 1, 'l');
				setCurrentChar(this, PLACE_CHAR);
				setCaretPosition(this, pos - 1, 'l');
				handled = true;
				break;
			default:
				if (e.key.length === 1)
					setCurrentChar(this, e.key);
				handled = true;
				break;
		}
		if (handled) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	function blurHandler(e) {
		fireChange(this);
	}

	function focusHandler(/*e*/) {
		if (!this.value)
			this.value = getMasked(this.__opts.mask, '');
		setTimeout(() => {
			setCaretPosition(this, 0, 'r');
		}, 10);
	}

	function pasteHandler(e) {
		e.preventDefault();
		let dat = e.clipboardData.getData('text/plain');
		if (!dat) return;
		this.value = fitMask(this.__opts.mask, dat);
	}


	function fireChange(input) {
		var evt = document.createEvent('HTMLEvents');
		evt.initEvent('change', false, true);
		input.dispatchEvent(evt);
	}
};

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20201004-7806
/* services/html.js */

app.modules['std:html'] = function () {

	const frameId = "print-direct-frame";// todo: shared CONST

	return {
		getColumnsWidth,
		getRowHeight,
		downloadBlob,
		downloadUrl,
		openUrl,
		printDirect,
		removePrintFrame,
		updateDocTitle,
		uploadFile
	};

	function getColumnsWidth(elem) {
		let cols = elem.getElementsByTagName('col');
		// FF bug fix. Popover does not work inside <td>.
		let body = elem.querySelectorAll('tbody.col-shadow')[0];
		body.style.display = "table-row-group";
		let cells = elem.querySelectorAll('tbody.col-shadow > tr > td');
		let len = Math.min(cols.length, cells.length);
		for (let i = 0; i < len; i++) {
			let w = cells[i].offsetWidth;
			cols[i].setAttribute('data-col-width', w);
		}
		body.style.display = "none";
	}

	function getRowHeight(elem, padding) {
		let rows = elem.getElementsByTagName('tr');
		for (let r = 0; r < rows.length; r++) {
			let h = rows[r].offsetHeight - (padding || 12); /* padding from css */
			rows[r].setAttribute('data-row-height', h);
		}
	}

	function openUrl(url) {
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link);
		link.href = url;
		link.setAttribute('target', '_blank');
		link.click();
		document.body.removeChild(link);
	}

	function downloadUrl(url) {
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link);
		link.href = url;
		link.setAttribute('download', '');
		link.click();
		document.body.removeChild(link);
	}

	function downloadBlob(blob, fileName, format) {
		let objUrl = URL.createObjectURL(blob);
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link); // FF!
		let downloadFile = fileName || 'file';
		format = (format || '').toLowerCase();
		if (format === 'excel')
			downloadFile += '.xlsx';
		else if (format === "pdf")
			downloadFile += ".pdf";
		link.download = downloadFile;
		link.href = objUrl;
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(objUrl);
	}

	function printDirect(url) {


		if (window.cefHost || navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
			window.open(url);
			return;
		}
		removePrintFrame();
		let frame = document.createElement("iframe");
		document.body.classList.add('waiting');
		frame.id = frameId;
		frame.style.cssText = "display:none;width:0;height:0;border:none;position:absolute;left:-10000,top:-100000";
		document.body.appendChild(frame);
		if (document.activeElement)
			document.activeElement.blur();
		//let emb = document.createElement('embed');
		//emb.setAttribute('src', url);
		//frame.appendChild(emb);
		frame.setAttribute('src', url);


		frame.onload = function (ev) {
			let cw = frame.contentWindow;
			if (cw.document.body) {
				let finp = cw.document.createElement('input');
				finp.setAttribute("id", "dummy-focus");
				finp.cssText = "width:0;height:0;border:none;position:absolute;left:-10000,top:-100000";
				cw.document.body.appendChild(finp);
				finp.focus();
				cw.document.body.removeChild(finp);
			}
			document.body.classList.remove('waiting');
			cw.print();
		};
	}

	function removePrintFrame() {
		let frame = window.frames[frameId];
		if (frame)
			document.body.removeChild(frame);
	}

	function updateDocTitle(title) {
		if (document.title === title)
			return;
		document.title = title;
	}

	function uploadFile(accept) {
		return new Promise(function (resolve, reject) {
			let input = document.createElement('input');
			input.setAttribute("type", "file");
			if (accept)
				input.setAttribute('accept', accept);
			input.style = "display:none";
			input.addEventListener('change', ev => {
				resolve(ev.target.files[0]);
			});
			document.body.appendChild(input); // FF!
			input.click();
			document.body.removeChild(input);
		});
	}
};





// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210223-7751*/
/*validators.js*/

app.modules['std:validators'] = function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const ERROR = 'error';

	// from chromium ? https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
	const EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	const URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+\])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;

	let validateMap = new WeakMap();

	return {
		validate: validateItem,
		removeWeak
	};

	function validateStd(rule, val) {
		switch (rule.valid) {
			case 'notBlank':
				return utils.notBlank(val);
			case "email":
				return val === '' || EMAIL_REGEXP.test(val);
			case "url":
				return val === '' || URL_REGEXP.test(val);
			case "isTrue":
				return val === true;
			case "regExp":
				if (!(rule.regExp instanceof RegExp)) {
					console.error('rule.regExp is undefined or is not an regular expression');
					return false;
				}
				return val === '' || rule.regExp.test(val);
		}
		console.error(`invalid std rule: '${rule}'`);
		return true;
	}

	function removeWeak() {
		validateMap = new WeakMap();
	}

	function addToWeak(rule, item, val) {
		let valMap;
		if (validateMap.has(rule)) {
			valMap = validateMap.get(rule);
		} else {
			valMap = new WeakMap(); // internal
			validateMap.set(rule, valMap);
		}
		if (utils.isObjectExact(val) && '$id' in val)
			val = val.$id;
		let valRes = { val: val, result: null };
		valMap.set(item, valRes);
		return valRes;
	}


	function getValForCompare(o1) {
		if (utils.isObjectExact(o1) && '$id' in o1) {
			return o1.$id;
		}
		return o1;
	}

	function validateImpl(rules, item, val, ff) {
		let retval = [];
		retval.pending = 0;
		rules.forEach(function (rule) {
			const sev = rule.severity || ERROR;
			if (utils.isFunction(rule.applyIf)) {
				if (!rule.applyIf(item, val)) return;
			}
			if (utils.isString(rule)) {
				if (!validateStd({ valid: 'notBlank' }, val))
					retval.push({ msg: rule, severity: ERROR });
			} else if (utils.isFunction(rule)) {
				let vr = rule(item, val);
				if (utils.isString(vr) && vr) {
					retval.push({ msg: vr, severity: sev });
				} else if (utils.isObject(vr)) {
					retval.push({ msg: vr.msg, severity: vr.severity || sev });
				}
			} else if (utils.isString(rule.valid)) {
				if (!validateStd(rule, val))
					retval.push({ msg: rule.msg, severity: sev });
			} else if (utils.isFunction(rule.valid)) {
				if (rule.async) {
					if (validateMap.has(rule)) {
						let vmset = validateMap.get(rule);
						if (vmset.has(item)) {
							let vmv = vmset.get(item);

							if (vmv.val === getValForCompare(val)) {
								// Let's skip already validated values
								if (vmv.result)
									retval.push(vmv.result);
								return;
							}
						} else {
							// First call. Save valid value.
							addToWeak(rule, item, val);
							return;
						}
					} else {
						// First call. Save valid value.
						addToWeak(rule, item, val);
						return;
					}
				}
				let vr = rule.valid(item, val);
				if (vr && vr.then) {
					retval.pending += 1;
					if (!rule.async) {
						console.error('Async rules should be marked async:true');
						return;
					}
					let valRes = addToWeak(rule, item, val);
					vr.then((result) => {
						let dm = { severity: sev, msg: rule.msg };
						let nu = false;
						if (utils.isString(result)) {
							dm.msg = result;
							valRes.result = dm;
							retval.push(dm);
							nu = true;
						} else if (!result) {
							retval.push(dm);
							valRes.result = dm;
							nu = true;
						}
						// need to update the validators
						item._root_._needValidate_ = true;
						if (nu && ff) ff();
						retval.pending -= 1;
						eventBus.$emit('pendingValidate');
					});
				}
				else if (utils.isString(vr)) {
					retval.push({ msg: vr, severity: sev });
				}
				else if (utils.isObjectExact(vr)) {
					retval.push({ msg: vr.msg, severity: vr.severity });
				}
				else if (!vr) {
					retval.push({ msg: rule.msg, severity: sev });
				}
			} else {
				console.error('invalid valid element type for rule');
			}
		});
		return retval;
	}

	function validateItem(rules, item, val, du) {
		//console.warn(item);
		let arr = [];
		if (utils.isArray(rules))
			arr = rules;
		else if (utils.isObject(rules))
			arr.push(rules);
		else if (utils.isFunction(rules))
			arr.push(rules);
		else if (utils.isString(rules))
			arr.push({ valid: 'notBlank', msg: rules });
		let err = validateImpl(arr, item, val, du);
		return err; // always array. may be defer
	}
};



// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

/*20221026-7902*/
/* services/impl/array.js */

app.modules['std:impl:array'] = function () {

	const utils = require('std:utils');
	const platform = require('std:platform');

	const defPropertyGet = utils.func.defPropertyGet;

	return {
		defineArray,
		defineArrayItemProto
	};

	function emitSelect(arr, item) {
		let selectEvent = arr._path_ + '[].select';
		arr._root_.$emit(selectEvent, arr/*array*/, item);
	}

	function defineArray(arr) {

		arr.$lock = false;

		arr.$lockUpdate = function (lock) {
			this.$lock = lock;
		};

		arr.$new = function (src) {
			let newElem = new this._elem_(src || null, this._path_ + '[]', this);
			newElem.__checked = false;
			return newElem;
		};

		arr.$sum = function (fn) {
			return this.reduce((a, c) => a + fn(c), 0);
		};

		arr.$find = function (fc, thisArg) {
			for (let i = 0; i < this.length; i++) {
				let el = this[i];
				if (fc.call(thisArg, el, i, this))
					return el;
				if ('$items' in el) {
					let x = el.$items.$find(fc, thisArg);
					if (x)
						return x;
				}
			}
			return null;
		}

		arr.$sort = function (compare) {
			this.sort(compare);
			this.$renumberRows();
			return this;
		};

		arr.$copy = function (src) {
			if (this.$root.isReadOnly)
				return this;
			this.$empty();
			if (utils.isArray(src)) {
				for (let i = 0; i < src.length; i++) {
					this.push(this.$new(src[i]));
				}
			}
			this.$renumberRows();
			return this;
		};

		arr.$select = function(elem) {
			elem.$select();
		};

		arr.$clearSelected = function () {
			let sel = this.$selected;
			if (!sel) return this; // already null
			sel.$selected = false;
			emitSelect(this, null);
			return this;
		};


		addResize(arr);
		addLoad(arr);
		addProperties(arr);

		arr.Selected = function (propName) {
			let sel = this.$selected;
			return sel ? sel[propName] : null;
		};


		arr.$reload = function () {
			this.$lock = false;
			return this.$vm.$reload(this);
		}

	}

	function addResize(arr) {

		arr.$empty = function () {
			if (this.$root.isReadOnly)
				return this;
			this.splice(0, this.length);
			if ('$RowCount' in this)
				this.$RowCount = 0;
			return this;
		};

		arr.$append = function (src) {
			return this.$insert(src, 'end');
		};

		arr.$prepend = function (src) {
			return this.$insert(src, 'start');
		};

		arr.$insert = function (src, to, current) {
			const that = this;

			function append(src, select) {
				let addingEvent = that._path_ + '[].adding';
				let newElem = that.$new(src);
				// emit adding and check result
				let er = that._root_.$emit(addingEvent, that/*array*/, newElem/*elem*/);
				if (er === false)
					return null; // disabled
				let len = that.length;
				let ne = null;
				let ix;
				switch (to) {
					case 'end':
						len = that.push(newElem);
						ne = that[len - 1]; // maybe newly created reactive element
						break;
					case 'start':
						that.unshift(newElem);
						ne = that[0];
						len = 1;
						break;
					case 'above':
						ix = that.indexOf(current);
						that.splice(ix, 0, newElem);
						ne = that[ix];
						len = ix + 1;
						break;
					case 'below':
						ix = that.indexOf(current) + 1;
						that.splice(ix, 0, newElem);
						ne = that[ix];
						len = ix + 1;
						break;
				}
				if ('$RowCount' in that) that.$RowCount += 1;
				let eventName = that._path_ + '[].add';
				that._root_.$setDirty(true);
				that._root_.$emit(eventName, that /*array*/, ne /*elem*/, len - 1 /*index*/);
				if (select) {
					ne.$select();
					emitSelect(that, ne);
				}
				// set RowNumber
				if ('$rowNo' in newElem._meta_) {
					let rowNoProp = newElem._meta_.$rowNo;
					for (let i = 0; i < that.length; i++)
						that[i][rowNoProp] = i + 1; // 1-based
				}
				if (that.$parent) {
					let m = that.$parent._meta_;
					if (m.$hasChildren && that._path_.endsWith('.' + m.$items)) {
						that.$parent[m.$hasChildren] = true;
					}
				}
				return ne;
			}

			if (utils.isArray(src)) {
				let ra = [];
				let lastElem = null;
				src.forEach(function (elem) {
					lastElem = append(elem, false);
					ra.push(lastElem);
				});
				if (lastElem) {
					// last added element
					lastElem.$select();
				}
				return ra;
			} else
				return append(src, true);
		};

		arr.$renumberRows = function () {
			if (!this.length) return this;
			let item = this[0];
			// renumber rows
			if ('$rowNo' in item._meta_) {
				let rowNoProp = item._meta_.$rowNo;
				for (let i = 0; i < this.length; i++) {
					this[i][rowNoProp] = i + 1; // 1-based
				}
			}
			return this;
		};

		arr.$remove = function (item) {
			if (this.$root.isReadOnly)
				return this;
			if (!item)
				return this;
			let index = this.indexOf(item);
			if (index === -1)
				return this;
			this.splice(index, 1);
			if ('$RowCount' in this) this.$RowCount -= 1;
			// EVENT
			let eventName = this._path_ + '[].remove';
			this._root_.$setDirty(true);
			this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);

			if (!this.length) {
				if (this.$parent) {
					let m = this.$parent._meta_;
					if (m.$hasChildren && this._path_.endsWith('.' + m.$items)) {
						this.$parent[m.$hasChildren] = false;
					}
					// try to select parent element
					if (m.$items)
						this.$parent.$select();
				}
				return this;
			}
			if (index >= this.length)
				index -= 1;
			this.$renumberRows();
			if (this.length > index) {
				this[index].$select();
			}
			return this;
		};

	}

	function addLoad(arr) {

		arr.$isLazy = function () {
			const meta = this.$parent._meta_;
			if (!meta.$lazy) return false;
			let prop = utils.model.propFromPath(this._path_);
			return meta.$lazy.indexOf(prop) !== -1;
		};

		arr.$resetLazy = function () {
			this.$lock = false;
			this.$empty();
			if (this.$loaded)
				this.$loaded = false;
			return this;
		};

		arr.$loadLazy = function () {
			if (!this.$isLazy())
				return;
			if (this.$lock) return;
			return new Promise((resolve, _) => {
				if (!this.$vm) return;
				if (this.$loaded) { resolve(this); return; }
				if (!this.$parent) { resolve(this); return; }
				const meta = this.$parent._meta_;
				if (!meta.$lazy) { resolve(this); return; }
				let prop = utils.model.propFromPath(this._path_);
				if (meta.$lazy.indexOf(prop) === -1) { resolve(this); return; }
				this.$vm.$loadLazy(this.$parent, prop).then(() => resolve(this));
			});
		};

		arr.$load = function () {
			if (!this.$isLazy()) return;
			platform.defer(() => this.$loadLazy());
		};

	}

	function addProperties(arr) {
		defPropertyGet(arr, "$selected", function () {
			for (let x of this.$elements) {
				if (x.$selected) {
					return x;
				}
			}
			return undefined;
		});

		defPropertyGet(arr, "$selectedIndex", function () {
			for (let i = 0; i < this.length; i++) {
				if (this[i].$selected) return i;
			}
			return -1;
		});

		defPropertyGet(arr, "$elements", function () {
			function* elems(arr) {
				for (let i = 0; i < arr.length; i++) {
					let val = arr[i];
					yield val;
					if (val.$items) {
						yield* elems(val.$items);
					}
				}
			}
			return elems(this);
		});

		defPropertyGet(arr, "Count", function () {
			return this.length;
		});

		defPropertyGet(arr, "$isEmpty", function () {
			return !this.length;
		});

		defPropertyGet(arr, "$checked", function () {
			return this.filter((el) => el.$checked);
		});

		defPropertyGet(arr, "$hasSelected", function () {
			return !!this.$selected;
		});

		defPropertyGet(arr, "$hasChecked", function () {
			return this.$checked && this.$checked.length;
		});
	}

	function defineArrayItemProto(elem) {
		let proto = elem.prototype;

		proto.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};

		proto.$select = function (root) {
			let arr = root || this._parent_;
			let sel = arr.$selected;
			if (sel === this) return;
			if (sel) sel.$selected = false;
			this.$selected = true;
			emitSelect(arr, this);
			if (this._meta_.$items) {
				// expand all parent items
				let p = this._parent_._parent_;
				while (p) {
					if (!p || p === this.$root || !utils.isDefined(p.$expanded))
						break;
					p.$expanded = true;
					p = p._parent_._parent_;
				}
			}
		};

	}
};

/* Copyright © 2015-2022 Alex Kukhtin. All rights reserved.*/

/*20220825-7883*/
// services/datamodel.js

/*
 * TODO: template & validate => /impl
 * treeImpl => /impl/tree
 */

(function () {

	"use strict";

	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
	const ERRORS = '_errors_';
	const ROWCOUNT = '$RowCount';

	const ERR_STR = '#err#';

	const FLAG_VIEW = 1;
	const FLAG_EDIT = 2;
	const FLAG_DELETE = 4;
	const FLAG_APPLY = 8;
	const FLAG_UNAPPLY = 16;

	const platform = require('std:platform');
	const validators = require('std:validators');
	const utils = require('std:utils');
	const log = require('std:log', true);
	const period = require('std:period');
	const mitool = require('std:modelInfo');
	const arrtool = require('std:impl:array');

	let __initialized__ = false;

	function loginfo(msg) {
		if (!log) return;
		log.info(msg);
	}

	function logtime(msg, time) {
		if (!log) return;
		log.time(msg, time);
	}

	function defHidden(obj, prop, value, writable) {
		Object.defineProperty(obj, prop, {
			writable: writable || false,
			enumerable: false,
			configurable: false,
			value: value
		});
	}

	function defHiddenGet(obj, prop, get) {
		Object.defineProperty(obj, prop, {
			enumerable: false,
			configurable: false,
			get: get
		});
	}

	const defPropertyGet = utils.func.defPropertyGet;

	const propFromPath = utils.model.propFromPath;

	function defSource(trg, source, prop, parent) {

		let propCtor = trg._meta_.props[prop];
		if (propCtor.type) propCtor = propCtor.type;
		let pathdot = trg._path_ ? trg._path_ + '.' : '';
		let shadow = trg._src_;
		source = source || {};
		if (utils.isObjectExact(propCtor)) {
			//console.warn(`${prop}:${propCtor.len}`);
			if ("type" in propCtor)
				propCtor = propCtor.type;
			else
				throw new Error(`Invalid _meta_ for '${prop}'`);
		}
		switch (propCtor) {
			case Number:
				shadow[prop] = source[prop] || 0;
				break;
			case String:
				shadow[prop] = source[prop] || "";
				break;
			case Boolean:
				shadow[prop] = source[prop] || false;
				break;
			case Date:
				let srcval = source[prop] || null;
				shadow[prop] = srcval ? new Date(srcval) : utils.date.zero();
				break;
			case platform.File:
			case Object:
				shadow[prop] = null;
				break;
			case TMarker: // marker for dynamic property
				let mp = trg._meta_.markerProps[prop];
				shadow[prop] = mp;
				break;
			case period.constructor:
				shadow[prop] = new propCtor(source[prop]);
				break;
			default:
				shadow[prop] = new propCtor(source[prop] || null, pathdot + prop, trg);
				break;
		}
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get() {
				return this._src_[prop];
			},
			set(val) {
				let eventWasFired = false;
				let skipDirty = prop.startsWith('$$');
				let ctor = this._meta_.props[prop];
				let isjson = false;
				if (ctor.type) {
					isjson = !!ctor.json;
					ctor = ctor.type;
				}
				if (!isjson) {
					val = utils.ensureType(ctor, val);
				}
				if (val === this._src_[prop])
					return;
				let oldVal = this._src_[prop];
				if (!this._lockEvents_) {
					let changingEvent = (this._path_ || 'Root') + '.' + prop + '.changing';
					let ret = this._root_.$emit(changingEvent, this, val, oldVal, prop);
					if (ret === false)
						return;
				}
				if (this._src_[prop] && this._src_[prop].$set) {
					// object
					this._src_[prop].$set(val);
					eventWasFired = true; // already fired
				} else {
					this._src_[prop] = val;
				}
				if (!skipDirty) // skip special properties
					this._root_.$setDirty(true, this._path_, prop);
				if (this._lockEvents_) return; // events locked
				if (eventWasFired) return; // was fired
				let eventName = (this._path_ || 'Root') + '.' + prop + '.change';
				this._root_.$emit(eventName, this, val, oldVal, prop);
			}
		});
	}

	function TMarker() { }

	function createPrimitiveProperties(elem, ctor) {
		const templ = elem._root_.$template;
		if (!templ) return;
		const props = templ._props_;
		if (!props) return;
		let objname = ctor.name;

		if (objname in props) {
			for (let p in props[objname]) {
				let propInfo = props[objname][p];
				if (utils.isPrimitiveCtor(propInfo)) {
					loginfo(`create scalar property: ${objname}.${p}`);
					elem._meta_.props[p] = propInfo;
				} else if (utils.isObjectExact(propInfo)) {
					if (!propInfo.get) { // plain object
						loginfo(`create object property: ${objname}.${p}`);
						elem._meta_.props[p] = TMarker;
						if (!elem._meta_.markerProps)
							elem._meta_.markerProps = {};
						elem._meta_.markerProps[p] = propInfo;
					}
				}
			}
		}
	}

	function createObjProperties(elem, ctor) {
		let templ = elem._root_.$template;
		if (!templ) return;
		let props = templ._props_;
		if (!props) return;
		let objname = ctor.name;
		if (objname in props) {
			for (let p in props[objname]) {
				let propInfo = props[objname][p];
				if (utils.isPrimitiveCtor(propInfo)) {
					continue;
				}
				else if (utils.isFunction(propInfo)) {
					loginfo(`create property: ${objname}.${p}`);
					Object.defineProperty(elem, p, {
						configurable: false,
						enumerable: true,
						get: propInfo
					});
				} else if (utils.isObjectExact(propInfo)) {
					if (propInfo.get) { // has get, maybe set
						loginfo(`create property: ${objname}.${p}`);
						Object.defineProperty(elem, p, {
							configurable: false,
							enumerable: true,
							get: propInfo.get,
							set: propInfo.set
						});
					}
				} else {
					alert('todo: invalid property type');
				}
			}
		}
	}

	function addTreeMethods(elem) {
		elem.$expand = function () {
			if (!this._meta_.$items) return null;
			if (this.$expanded) return null;
			let coll = this[this._meta_.$items];
			return this.$vm.$expand(this, this._meta_.$items, true);
		};
		elem.$selectPath = async function (arr, cb) {
			if (!arr.length) return null;
			let itemsProp = this._meta_.$items;
			if (!itemsProp) return null;
			let current = null;
			if (cb(this, arr[0]))
				current = this;
			for (let i = 1 /*second*/; i < arr.length; i++) {
				if (!current) return null;
				await current.$expand();
				current = current[itemsProp].$find(itm => cb(itm, arr[i]));
			}
			return current;
		}
	}

	function createObject(elem, source, path, parent) {
		const ctorname = elem.constructor.name;
		let startTime = null;
		if (ctorname === 'TRoot')
			startTime = platform.performance.now();
		parent = parent || elem;
		defHidden(elem, SRC, {});
		defHidden(elem, PATH, path || '');
		defHidden(elem, ROOT, parent._root_ || parent);
		defHidden(elem, PARENT, parent);
		defHidden(elem, ERRORS, null, true);
		defHidden(elem, '_lockEvents_', 0, true);
		elem._uiprops_ = {}; // observable!

		let hasTemplProps = false;
		const templ = elem._root_.$template;
		if (templ && !utils.isEmptyObject(templ._props_))
			hasTemplProps = true;

		if (hasTemplProps)
			createPrimitiveProperties(elem, elem.constructor);

		for (let propName in elem._meta_.props) {
			defSource(elem, source, propName, parent);
		}

		if (hasTemplProps)
			createObjProperties(elem, elem.constructor);

		if (path && path.endsWith(']'))
			elem.$selected = false;

		if (elem._meta_.$items) {
			let exp = false;
			let clps = false;
			if (elem._meta_.$expanded) {
				let val = source[elem._meta_.$expanded];
				exp = !!val;
				clps = !val;
			}
			elem.$expanded = exp; // tree elem
			elem.$collapsed = clps; // sheet elem
			elem.$level = 0;
			addTreeMethods(elem);
		}

		elem.$lockEvents = function () {
			this._lockEvents_ += 1;
		};

		elem.$unlockEvents = function () {
			this._lockEvents_ -= 1;
		};

		defHiddenGet(elem, '$eventsLocked', function () {
			return this._lockEvents_ > 0;
		});

		defPropertyGet(elem, '$valid', function () {
			if (this._root_._needValidate_)
				this._root_._validateAll_();
			if (this._errors_)
				return false;
			for (var x in this) {
				if (x[0] === '$' || x[0] === '_')
					continue;
				let sx = this[x];
				if (utils.isArray(sx)) {
					for (let i = 0; i < sx.length; i++) {
						let ax = sx[i];
						if (utils.isObject(ax) && '$valid' in ax) {
							if (!ax.$valid)
								return false;
						}
					}
				} else if (utils.isObject(sx) && '$valid' in sx) {
					if (!sx.$valid)
						return false;
				}
			}
			return true;
		});
		defPropertyGet(elem, "$invalid", function () {
			return !this.$valid;
		});

		elem.$errors = function (prop) {
			if (!this) return null;
			let root = this._root_;
			if (!root) return null;
			if (!root._validate_)
				return null;
			let path = `${this._path_}.${prop}`; 
			let arr = root._validate_(this, path, this[prop]);
			if (arr && arr.length === 0) return null;
			return arr;
		};
		
		if (elem._meta_.$group === true) {
			defPropertyGet(elem, "$groupName", function () {
				if (!utils.isDefined(this.$level))
					return ERR_STR;
				// this.constructor.name == objectType;
				const mi = this._root_.__modelInfo.Levels;
				if (mi) {
					const levs = mi[this.constructor.name];
					if (levs && this.$level <= levs.length)
						return this[levs[this.$level - 1]];
				}
				console.error('invalid data for $groupName');
				return ERR_STR;
			});
		}

		if (elem._meta_.$itemType) {
			elem.$setProperty = function (prop, src) {
				let itmPath = path + '.' + prop;
				let ne = new elem._meta_.$itemType(src, itmPath, elem);
				platform.set(this, prop, ne);
				this._root_.$setDirty(true);
				return ne;
			};
		}

		function setDefaults(root) {
			if (!root.$template || !root.$template.defaults)
				return;
			for (let p in root.$template.defaults) {
				let px = p.lastIndexOf('.');
				if (px === -1)
					continue;
				let path = p.substring(0, px);
				let prop = p.substring(px + 1);
				if (prop.endsWith('[]'))
					continue;
				let def = root.$template.defaults[p];
				let obj = utils.simpleEval(root, path);
				if (obj.$isNew) {
					if (utils.isFunction(def))
						platform.set(obj, prop, def.call(root, obj, prop));
					else
						platform.set(obj, prop, def);
				}
			}
		}

		let constructEvent = ctorname + '.construct';
		let _lastCaller = null;
		let propForConstruct = path ? propFromPath(path) : '';
		elem._root_.$emit(constructEvent, elem, propForConstruct);

		if (elem._root_ === elem) {
			// root element
			elem._root_ctor_ = elem.constructor;
			elem.$dirty = false;
			elem._query_ = {};

			// rowcount implementation
			for (var m in elem._meta_.props) {
				let rcp = m + '.$RowCount';
				if (source && rcp in source) {
					let rcv = source[rcp] || 0;
					elem[m].$RowCount = rcv;
				}
			}
			mitool.setModelInfoForRoot(elem);

			elem._setRuntimeInfo_ = setRootRuntimeInfo;

			elem._saveSelections = saveSelections;
			elem._restoreSelections = restoreSelections;

			elem._enableValidate_ = true;
			elem._needValidate_ = false;

			elem._modelLoad_ = (caller) => {
				_lastCaller = caller;
				setDefaults(elem);
				elem._fireLoad_();
				__initialized__ = true;
			};

			elem._fireLoad_ = () => {
				platform.defer(() => {
					let isRequery = elem.$vm.__isModalRequery();
					elem.$emit('Model.load', elem, _lastCaller, isRequery);
					elem._root_.$setDirty(elem._root_.$isCopy ? true : false);
				});
			};
			elem._fireUnload_ = () => {
				elem.$emit('Model.unload', elem);
			};

			defHiddenGet(elem, '$readOnly', isReadOnly);
			defHiddenGet(elem, '$stateReadOnly', isStateReadOnly);
			defHiddenGet(elem, '$isCopy', isModelIsCopy);
			defHiddenGet(elem, '$mainObject', mainObject);

			elem._seal_ = seal;

			elem._fireGlobalPeriodChanged_ = (period) => {
				elem.$emit('GlobalPeriod.change', elem, period);
			};
		}
		if (startTime) {
			logtime('create root time:', startTime, false);
		}
		return elem;
	}

	function seal(elem) {
		Object.seal(elem);
		if (!elem._meta_) return;
		for (let p in elem._meta_.props) {
			let ctor = elem._meta_.props[p];
			if (ctor.type) ctor = ctor.type;
			if (utils.isPrimitiveCtor(ctor)) continue;
			if (ctor === period.constructor) continue;
			let val = elem[p];
			if (utils.isArray(val)) {
				val.forEach(itm => seal(itm));
			} else if (utils.isObjectExact(val)) {
				seal(val);
			}
		}
	}

	function isReadOnly() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.ReadOnly) && mi.ReadOnly)
				return true;
			if (utils.isDefined(mi.StateReadOnly) && mi.StateReadOnly)
				return true;
		}
		return false;
	}

	function isStateReadOnly() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.StateReadOnly) && mi.StateReadOnly)
				return true;
		}
		return false;
	}

	function mainObject() {
		if ('$main' in this._meta_) {
			let mainProp = this._meta_.$main;
			return this[mainProp];
		}
		return null;
	}

	function isModelIsCopy() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.Copy))
				return mi.Copy;
		}
		return false;
	}

	function createArray(source, path, ctor, arrctor, parent) {
		let arr = new _BaseArray(source ? source.length : 0);
		let dotPath = path + '[]';
		defHidden(arr, '_elem_', ctor);
		defHidden(arr, PATH, path);
		defHidden(arr, PARENT, parent);
		defHidden(arr, ROOT, parent._root_ || parent);

		defPropertyGet(arr, "$valid", function () {
			if (this._errors_)
				return false;
			for (var x of this) {
				if (x._errors_)
					return false;
			}
			return true;
		});

		defPropertyGet(arr, "$invalid", function () {
			return !this.$valid;
		});

		if (ctor.prototype._meta_.$cross)
			defPropertyGet(arr, "$cross", function () {
				return ctor.prototype._meta_.$cross;
			});

		createObjProperties(arr, arrctor);

		let constructEvent = arrctor.name + '.construct';
		arr._root_.$emit(constructEvent, arr);

		if (!source)
			return arr;
		for (let i = 0; i < source.length; i++) {
			arr[i] = new arr._elem_(source[i], dotPath, arr);
			arr[i].__checked = false;
		}
		return arr;
	}

	function _BaseArray(length) {
		let arr = new Array(length || 0);
		addArrayProps(arr);
		return arr;
	}

	function addArrayProps(arr) {

		defineCommonProps(arr);
		arrtool.defineArray(arr);
		arr.__fireChange__ = function (opts) {
			let root = this.$root;
			let itm = this;
			if (opts === 'selected')
				itm = this.$selected;
			root.$emit(this._path_ + '[].change', this, itm);
		};
	}

	function defineCommonProps(obj) {
		defHiddenGet(obj, "$host", function () {
			return this._root_._host_;
		});

		defHiddenGet(obj, "$root", function () {
			return this._root_;
		});

		defHiddenGet(obj, "$parent", function () {
			return this._parent_;
		});

		defHiddenGet(obj, "$vm", function () {
			if (this._root_ && this._root_._host_)
				return this._root_._host_.$viewModel;
			return null;
		});

		defHiddenGet(obj, "$ctrl", function () {
			if (this._root_ && this._root_._host_)
				return this._root_._host_.$ctrl;
			return null;
		});

		defHiddenGet(obj, "$ready", function () {
			if (!this.$vm) return true;
			return !this.$vm.$isLoading;
		});

		obj.$isValid = function (props) {
			return true;
		};
	}

	function defineObject(obj, meta, arrayItem) {
		defHidden(obj.prototype, META, meta);

		obj.prototype.$merge = merge;
		obj.prototype.$empty = empty;
		obj.prototype.$set = setElement;
		obj.prototype.$maxLength = getMaxLength;

		defineCommonProps(obj.prototype);

		defHiddenGet(obj.prototype, "$isNew", function () {
			return !this.$id;
		});

		defHiddenGet(obj.prototype, "$isEmpty", function () {
			return !this.$id;
		});

		defHiddenGet(obj.prototype, "$id", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				let tpname = this.constructor.name;
				throw new Error(tpname + ' object does not have an Id property');
			}
			return this[idName];
		});

		defHiddenGet(obj.prototype, "$id__", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				return undefined;
			}
			return this[idName];
		});

		defHiddenGet(obj.prototype, "$name", function () {
			let nameName = this._meta_.$name;
			if (!nameName) {
				let tpname = this.constructor.name;
				throw new Error(tpname + ' object does not have a Name property');
			}
			return this[nameName];
		});

		if (arrayItem) 
			defArrayItem(obj);

		if (meta.$hasChildren) {
			defHiddenGet(obj.prototype, "$hasChildren", function () {
				let hcName = this._meta_.$hasChildren;
				if (!hcName) return undefined;
				return this[hcName];
			});
		}
		if (meta.$items) {
			defHiddenGet(obj.prototype, "$items", function () {
				let itmsName = this._meta_.$items;
				if (!itmsName) return undefined;
				return this[itmsName];
			});
		}
		if (meta.$permissions) {
			defHiddenGet(obj.prototype, "$permissions", function () {
				let permName = this._meta_.$permissions;
				if (!permName) return undefined;
				var perm = this[permName];
				if (this.$isNew && perm === 0) {
					let mi = this.$ModelInfo;
					if (mi && utils.isDefined(mi.Permissions))
						perm = mi.Permissions;
				}
				return Object.freeze({
					canView: !!(perm & FLAG_VIEW),
					canEdit: !!(perm & FLAG_EDIT),
					canDelete: !!(perm & FLAG_DELETE),
					canApply: !!(perm & FLAG_APPLY),
					canUnapply: !!(perm & FLAG_UNAPPLY)
				});
			});
		}
	}

	function defArrayItem(elem) {

		arrtool.defineArrayItemProto(elem);

		Object.defineProperty(elem.prototype, '$checked', {
			enumerable: true,
			configurable: true, /* needed */
			get() {
				return this.__checked;
			},
			set(val) {
				this.__checked = val;
				let arr = this.$parent;
				let checkEvent = arr._path_ + '[].check';
				arr._root_.$emit(checkEvent, arr/*array*/, this);
			}
		});
	}

	function emit(event, ...arr) {
		if (this._enableValidate_) {
			if (!this._needValidate_) {
				this._needValidate_ = true;
			}
		}
		loginfo('emit: ' + event);
		let templ = this.$template;
		if (!templ) return;
		let events = templ.events;
		if (!events) return;
		if (event in events) {
			// fire event
			loginfo('handle: ' + event);
			let func = events[event];
			let rv = func.call(this, ...arr);
			if (rv === false)
				loginfo(event + ' returns false');
			return rv;
		}
	}

	function getDelegate(name) {
		let tml = this.$template;
		if (!tml || !tml.delegates) {
			console.error('There are no delegates in the template');
			return null;
		}
		if (name in tml.delegates) {
			return tml.delegates[name].bind(this.$root);
		}
		console.error(`Delegate "${name}" not found in the template`);
	}

	function canExecuteCommand(cmd, arg, opts) {
		const tml = this.$template;
		if (!tml) return false;
		if (!tml.commands) return false;
		const cmdf = tml.commands[cmd];
		if (!cmdf) return false;

		const optsCheckValid = opts && opts.validRequired === true;
		const optsCheckRO = opts && opts.checkReadOnly === true;
		const optsCheckArg = opts && opts.checkArgument === true;

		if (optsCheckArg && !arg)
			return false;

		if (cmdf.checkReadOnly === true || optsCheckRO) {
			if (this.$root.$readOnly)
				return false;
		}
		if (cmdf.validRequired === true || optsCheckValid) {
			if (!this.$root.$valid)
				return false;
		}
		if (utils.isFunction(cmdf.canExec)) {
			return cmdf.canExec.call(this, arg);
		} else if (utils.isBoolean(cmdf.canExec)) {
			return cmdf.canExec; // for debugging purposes
		} else if (utils.isDefined(cmdf.canExec)) {
			console.error(`${cmd}.canExec should be a function`);
			return false;
		}
		return true;
	}

	function executeCommand(cmd, arg, confirm, opts) {
		try {
			this._root_._enableValidate_ = false;
			let vm = this.$vm;
			const tml = this.$template;
			if (!tml) return;
			if (!tml.commands) return;
			let cmdf = tml.commands[cmd];
			if (!cmdf) {
				console.error(`Command "${cmd}" not found`);
				return;
			}
			const optConfirm = cmdf.confirm || confirm;
			const optSaveRequired = cmdf.saveRequired || opts && opts.saveRequired;
			const optValidRequired = cmdf.validRequired || opts && opts.validRequired;

			if (optValidRequired && !vm.$data.$valid) return; // not valid

			if (utils.isFunction(cmdf.canExec)) {
				if (!cmdf.canExec.call(this, arg)) return;
			}

			let that = this;
			const doExec = function () {
				const realExec = function () {
					if (utils.isFunction(cmdf))
						return cmdf.call(that, arg);
					else if (utils.isFunction(cmdf.exec))
						return cmdf.exec.call(that, arg);
					else
						console.error($`There is no method 'exec' in command '${cmd}'`);
				};

				if (optConfirm) {
					vm.$confirm(optConfirm).then(realExec);
				} else {
					return realExec();
				}
			};

			if (optSaveRequired && vm.$isDirty)
				vm.$save().then(doExec);
			else
				return doExec();

		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
		}
	}

	function validateImpl(item, path, val, du) {
		if (!item) return null;
		let tml = item._root_.$template;
		if (!tml) return null;
		var vals = tml.validators;
		if (!vals) return null;
		var elemvals = vals[path];
		if (!elemvals) return null;
		return validators.validate(elemvals, item, val, du);
	}

	function saveErrors(item, path, errors) {
		if (!item._errors_ && !errors)
			return; // already null
		else if (!item._errors_ && errors)
			item._errors_ = {}; // new empty object
		if (errors && errors.length > 0)
			item._errors_[path] = errors;
		else if (path in item._errors_)
			delete item._errors_[path];
		if (utils.isEmptyObject(item._errors_))
			item._errors_ = null;
		return errors;
	}

	function validate(item, path, val, ff) {
		if (!item._root_._needValidate_) {
			// already done
			if (!item._errors_)
				return null;
			if (path in item._errors_)
				return item._errors_[path];
			return null;
		}
		let res = validateImpl(item, path, val, ff);
		return saveErrors(item, path, res);
	}

	function* enumData(root, path, name, index) {
		index = index || '';
		if (!path) {
			// scalar value in root
			yield { item: root, val: root[name], ix: index };
			return;
		}
		let sp = path.split('.');
		let currentData = root;
		for (let i = 0; i < sp.length; i++) {
			let last = i === sp.length - 1;
			let prop = sp[i];
			if (prop.endsWith('[]')) {
				// is array
				let pname = prop.substring(0, prop.length - 2);
				if (!(pname in currentData)) {
					console.error(`Invalid validator key. Property '${pname}' not found in '${currentData.constructor.name}'`);
				}
				let objto = currentData[pname];
				if (!objto) continue;
				for (let j = 0; j < objto.length; j++) {
					let arrItem = objto[j];
					if (last) {
						yield { item: arrItem, val: arrItem[name], ix: index + ':' + j };
					} else {
						let newpath = sp.slice(i + 1).join('.');
						yield* enumData(arrItem, newpath, name, index + ':' + j);
					}
				}
				return;
			} else {
				// simple element
				if (!(prop in currentData)) {
					console.error(`Invalid Validator key. property '${prop}' not found in '${currentData.constructor.name}'`);
				}
				let objto = currentData[prop];
				if (last) {
					if (objto)
						yield { item: objto, val: objto[name], ix: index };
					return;
				}
				else {
					currentData = objto;
				}
			}
		}
	}

	// enumerate all data (recursive)
	function* dataForVal(root, path) {
		let ld = path.lastIndexOf('.');
		let dp = '';
		let dn = path;
		if (ld !== -1) {
			dp = path.substring(0, ld);
			dn = path.substring(ld + 1);
		}
		yield* enumData(root, dp, dn, '');
	}

	function validateOneElement(root, path, vals) {
		if (!vals)
			return;
		let errs = [];
		for (let elem of dataForVal(root, path)) {
			let res = validators.validate(vals, elem.item, elem.val);
			saveErrors(elem.item, path, res);
			if (res && res.length) {
				errs.push(...res);
				// elem.ix - array indexes
				// console.dir(elem.ix);
			}

		}
		return errs.length ? errs : null;
	}

	function forceValidateAll() {
		let me = this;
		me._needValidate_ = true;
		var retArr = me._validateAll_(false);
		me._validateAll_(true); // and validate async again
		return retArr;

	}

	function validateAll(force) {
		var me = this;
		if (!me._host_) return;
		if (!me._needValidate_) return;
		me._needValidate_ = false;
		if (force)
			validators.removeWeak();
		var startTime = platform.performance.now();
		let tml = me.$template;
		if (!tml) return;
		let vals = tml.validators;
		if (!vals) return;
		let allerrs = [];
		for (var val in vals) {
			let err1 = validateOneElement(me, val, vals[val]);
			if (err1) {
				allerrs.push({ x: val, e: err1 });
			}
		}
		logtime('validation time:', startTime);
		return allerrs;
		//console.dir(allerrs);
	}

	function setDirty(val, path, prop) {
		if (this.$root.$readOnly)
			return;
		if (path && path.toLowerCase().startsWith('query'))
			return;
		if (isNoDirty(this.$root))
			return;
		if (path && prop && isSkipDirty(this.$root, `${path}.${prop}`))
			return;
		this.$dirty = val;
	}

	function empty() {
		this.$set({});
		return this;
	}

	function setElement(src) {
		if (this.$root.isReadOnly)
			return;
		this.$merge(src);
	}

	function getMaxLength(prop) {
		let m = this._meta_.props;
		if (!m) return undefined;
		let x = m[prop];
		if (utils.isObjectExact(x))
			return x.len;
		return undefined;
	}

	function isSkipMerge(root, prop) {
		let t = root.$template;
		let opts = t && t.options;
		let bo = opts && opts.bindOnce;
		if (!bo) return false;
		return bo.indexOf(prop) !== -1;
	}

	function isNoDirty(root) {
		let t = root.$template;
		let opts = t && t.options;
		return opts && opts.noDirty;
	}

	function isSkipDirty(root, path) {
		let t = root.$template;
		const opts = t && t.options;
		if (!opts) return false;
		const sd = opts.skipDirty;
		if (!sd || !utils.isArray(sd)) return false;
		return sd.indexOf(path) !== -1;
	}

	function saveSelections() {
		let root = this;
		let t = root.$template;
		let opts = t && t.options;
		if (!opts) return;
		let ps = opts.persistSelect;
		if (!ps || !ps.length) return;
		let result = {};
		for (let p of ps) {
			let arr = utils.simpleEval(root, p);
			if ('$selected' in arr) {
				let sel = arr.$selected;
				if (sel)
					result[p] = sel.$id;
			}
		}
		return result;
	}


	function restoreSelections(sels) {
		if (!sels) return;
		let root = this;
		for (let p in sels) {
			let arr = utils.simpleEval(root, p);
			let selId = sels[p];
			if ('$find' in arr) {
				let se = arr.$find(x => x.$id === selId);
				if (se)
					se.$select();
			}
		}
	}

	function merge(src, checkBindOnce, existsOnly) {
		let oldId = this.$id__;
		try {
			if (src === null)
				src = {};
			this._root_._enableValidate_ = false;
			this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				if (prop.startsWith('$$')) continue; // always skip
				if (checkBindOnce && isSkipMerge(this._root_, prop)) continue;
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				let trg = this[prop];
				if (Array.isArray(trg)) {
					if (trg.$loaded)
						trg.$loaded = false; // may be lazy
					trg.$copy(src[prop]);
					// copy rowCount
					if (ROWCOUNT in trg) {
						let rcProp = prop + '.$RowCount';
						if (rcProp in src)
							trg.$RowCount = src[rcProp] || 0;
						else
							trg.$RowCount = 0;
					}
					//TODO: try to select old value
				} else {
					if (utils.isDateCtor(ctor)) {
						let dt = src[prop];
						if (!dt)
							platform.set(this, prop, utils.date.zero());
						else
							platform.set(this, prop, new Date(src[prop]));
					} else if (utils.isPrimitiveCtor(ctor)) {
						platform.set(this, prop, src[prop]);
					} else {
						if (existsOnly && !(prop in src))
							continue; // no item in src
						let newsrc = new ctor(src[prop], prop, this);
						platform.set(this, prop, newsrc);
					}
				}
			}
		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
			this._lockEvents_ -= 1;
		}
		if (this.$parent._lockEvents_) return this; // may be custom lock
		let newId = this.$id__;
		let fireChange = false;
		if (utils.isDefined(newId) && utils.isDefined(oldId))
			fireChange = newId !== oldId; // check id, no fire event
		if (fireChange) {
			// emit .change event for entire object
			let eventName = this._path_ + '.change';
			this._root_.$emit(eventName, this.$parent, this, this, propFromPath(this._path_));
		}
		return this;
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$defer = platform.defer;
		root.prototype.$merge = merge;
		root.prototype.$template = template;
		root.prototype._exec_ = executeCommand;
		root.prototype._canExec_ = canExecuteCommand;
		root.prototype._delegate_ = getDelegate;
		root.prototype._validate_ = validate;
		root.prototype._validateAll_ = validateAll;
		root.prototype.$forceValidate = forceValidateAll;
		root.prototype.$destroy = destroyRoot;
		// props cache for t.construct
		if (!template) return;
		let xProp = {};
		for (let p in template.properties) {
			let px = p.split('.'); // Type.Prop
			if (px.length !== 2) {
				console.error(`invalid propery name '${p}'`);
				continue;
			}
			let typeName = px[0];
			let propName = px[1];
			let pv = template.properties[p]; // property value
			if (!(typeName in xProp))
				xProp[typeName] = {};
			xProp[typeName][propName] = pv;
		}
		template._props_ = xProp;
	}

	function setRootRuntimeInfo(runtime) {
		if (!runtime || !runtime.$cross) return;
		function ensureCrossSize(elem, cross) {
			if (!elem._elem_ || !elem.$cross) return;
			for (let crstp in cross) {
				if (elem._elem_.name !== crstp) continue;
				let t = elem.$cross;
				let s = cross[crstp];
				for (let p in t) {
					let ta = t[p];
					let sa = s[p];
					if (ta && sa)
						ta.splice(0, ta.length, ...sa);
					else if (ta && !sa)
						ta.splice(0, ta.length);
				}
			}
		}

		for (let p in this) {
			if (p.startsWith("$") || p.startsWith('_')) continue;
			let ta = this[p];
			ensureCrossSize(ta, runtime.$cross);
			if (ta._meta_ && ta._meta_.$items) {
				ta = ta[ta._meta_.$items];
				ensureCrossSize(ta, runtime.$cross);
			}
		}
	}

	function destroyRoot() {
		this._host_.$viewModel = null;
		this._host_ = null;
	}

	app.modules['std:datamodel'] = {
		createObject: createObject,
		createArray: createArray,
		defineObject: defineObject,
		implementRoot: implementRoot,
		setModelInfo: mitool.setModelInfo,
		enumData: enumData
	};
})();


// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221124-7907
// dataservice.js
(function () {

	let http = require('std:http');

	function post(url, data, raw, hideIndicator) {
		return http.post(url, data, raw, hideIndicator);
	}

	function get(url) {
		return http.get(url);
	}

	app.modules['std:dataservice'] = {
		post: post,
		get: get
	};
})();




// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

/*20221127-7908*/
// controllers/base.js

(function () {

	const eventBus = require('std:eventBus');
	const utils = require('std:utils');
	const dataservice = require('std:dataservice');
	const urltools = require('std:url');
	const log = require('std:log', true /*no error*/);
	const locale = window.$$locale;
	const mask = require('std:mask');
	const modelInfo = require('std:modelInfo');
	const platform = require('std:platform');
	const htmlTools = require('std:html', true /*no error*/);
	const httpTools = require('std:http');

	const store = component('std:store');
	const documentTitle = component('std:doctitle', true /*no error*/);

	const __blank__ = "__blank__";

	let __updateStartTime = 0;
	let __createStartTime = 0;

	function __runDialog(url, arg, query, cb) {
		return new Promise(function (resolve, reject) {
			const dlgData = { promise: null, data: arg, query: query, rd:true };
			eventBus.$emit('modal', url, dlgData);
			dlgData.promise.then(function (result) {
				cb(result);
				resolve(result);
			});
		});
	}

	function makeErrors(errs) {
		let ra = [];
		for (let x of errs) {
			for (let y of x.e) {
				ra.push(y.msg);
			}
		}
		return ra.length ? ra : null;
	}

	function treeNormalPath(path) {
		if (!path) return;
		path = '' + path;
		return [... new Set(path.split('.'))].join('.');
	}

	function isPermissionsDisabled(opts, arg) {
		if (opts && opts.checkPermission) {
			if (utils.isObjectExact(arg)) {
				if (arg.$permissions) {
					let perm = arg.$permissions;
					let prop = opts.checkPermission;
					if (prop in perm) {
						if (!perm[prop])
							return true;
					} else {
						console.error(`invalid permssion name: '${prop}'`);
					}
				}
			}
		}
		return false;
	}

	const base = Vue.extend({
		// inDialog: Boolean (in derived class)
		// pageTitle: String (in derived class)
		store: store,
		components: {
			'a2-document-title': documentTitle
		},
		data() {
			return {
				__init__: true,
				__baseUrl__: '',
				__baseQuery__: {},
				__requestsCount__: 0,
				__lockQuery__: true,
				__testId__: null,
				__saveEvent__: null
			};
		},

		computed: {
			$baseUrl() {
				return this.$data.__baseUrl__;
			},
			$baseQuery() {
				return this.$data.__baseQuery__;
			},
			$indirectUrl() {
				return this.$data.__modelInfo.__indirectUrl__ || '';
			},
			$query() {
				return this.$data._query_;
			},
			$jsonQuery() {
				return utils.toJson(this.$data.Query);
			},
			$isDirty() {
				return this.$data.$dirty;
			},
			$isPristine() {
				return !this.$data.$dirty;
			},
			$isLoading() {
				return this.$data.__requestsCount__ > 0;
			},
			$modelInfo() {
				return this.$data.__modelInfo;
			},
			$canSave() {
				return this.$isDirty && !this.$isLoading;
			}
		},
		watch: {
			$jsonQuery(newData, oldData) {
				//console.warn(newData);
				this.$nextTick(() => this.$reload());
			}
		},
		methods: {
			$marker() {
				return true;
			},
			$exec(cmd, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				if (this.$isLoading) return;

				if (isPermissionsDisabled(opts, arg)) {
					this.$alert(locale.$PermissionDenied);
					return;
				}
				eventBus.$emit('closeAllPopups');
				const root = this.$data;
				return root._exec_(cmd, arg, confirm, opts);
			},

			async $invokeServer(url, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				const root = this.$data;
				if (confirm)
					await this.$confirm(confirm);
				if (opts && opts.saveRequired && this.$isDirty)
					await this.$save();
				if (opts && opts.validRequired && root.$invalid) { 
					this.$alert(locale.$MakeValidFirst);
					return;
				}
				let data = { Id: arg.$id };
				let cmd = urltools.splitCommand(url);
				await this.$invoke(cmd.action, data, cmd.url);
				if (opts && opts.requeryAfter)
					await this.$requery();
				else if (opts && opts.reloadAfter)
					await this.$reload();
			},

			$toJson(data) {
				return utils.toJson(data);
			},
			$maxChars(text, length) {
				return utils.text.maxChars(text, length);
			},
			$isReadOnly(opts) {
				return opts && opts.checkReadOnly && this.$data.$readOnly;
			},

			$execSelected(cmd, arg, confirm) {
				if (this.$isLoading) return;
				let root = this.$data;
				if (!utils.isArray(arg)) {
					console.error('Invalid argument for $execSelected');
					return;
				}
				eventBus.$emit('closeAllPopups');
				if (!confirm)
					root._exec_(cmd, arg.$selected);
				else
					this.$confirm(confirm).then(() => root._exec_(cmd, arg.$selected));
			},
			$canExecute(cmd, arg, opts) {
				//if (this.$isLoading) return false; // do not check here. avoid blinking
				if (this.$isReadOnly(opts))
					return false;
				let root = this.$data;
				return root._canExec_(cmd, arg, opts);
			},
			$setCurrentUrl(url) {
				if (this.inDialog)
					url = urltools.combine('_dialog', url);
				this.$data.__baseUrl__ = url;
				eventBus.$emit('modalSetBase', url);
			},
			$emitSaveEvent() {
				if (this.__saveEvent__)
					this.$caller.$data.$emit(this.__saveEvent__, this.$data);
			},
			$emitCaller(event, ...arr) {
				if (this.$caller)
					this.$caller.$data.$emit(event, ...arr);
				else
					log.error('There is no caller here');
			},
			$save(opts) {
				if (this.$data.$readOnly)
					return;
				if (!this.$data.$dirty)
					return;
				eventBus.$emit('closeAllPopups');
				let mainObjectName = this.$data._meta_.$main;
				let self = this;
				let root = window.$$rootUrl;
				const routing = require('std:routing'); // defer loading
				let url = `${root}/${routing.dataUrl()}/save`;
				let urlToSave = this.$indirectUrl || this.$baseUrl;
				const isCopy = this.$data.$isCopy;
				const validRequired = !!opts && opts.options && opts.options.validRequired;
				if (validRequired && this.$data.$invalid) {
					let errs = makeErrors(this.$data.$forceValidate());
					this.$alert(locale.$MakeValidFirst, undefined, errs);
					return;
				}
				self.$data.$emit('Model.beforeSave', self.$data);

				let saveSels = self.$data._saveSelections();

				return new Promise(function (resolve, reject) {
					let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
					let wasNew = urltools.isNewPath(self.$baseUrl);
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						self.$data.$merge(data, true, true /*only exists*/);
						self.$data.$emit('Model.saved', self.$data);
						if (self.__saveEvent__)
							self.$caller.$data.$emit(self.__saveEvent__, self.$data);
						self.$data.$setDirty(false);
						// data is a full model. Resolve requires only single element.
						let dataToResolve;
						let newId;
						if (mainObjectName) {
							dataToResolve = data[mainObjectName];
							newId = self.$data[mainObjectName].$id; // new element
						}
						else {
							// mainObject not defined. Use first element in the result
							for (let p in data) {
								dataToResolve = data[p];
								newId = self.$data[p].$id; // new element
								if (dataToResolve)
									break;
							}
						}
						if (wasNew && newId) {
							// assign the new id to the route
							if (!self.inDialog)
								self.$store.commit('setnewid', { id: newId });
							// and in the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId);
						} else if (isCopy) {
							// TODO: get action ????
							if (!self.inDialog)
								self.$store.commit('setnewid', { id: newId, action: 'edit' });
							// and in the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId, 'edit');
						}
						self.$data._restoreSelections(saveSels);
						resolve(dataToResolve); // single element (raw data)
						let toast = opts && opts.toast ? opts.toast : null;
						if (toast)
							self.$toast(toast);
						self.$notifyOwner(newId, toast);
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
					});
				});
			},
			$notifyOwner(id, toast) {
				if (!window.opener) return;
				if (!window.$$token) return;
				let rq = window.opener.require;
				if (!rq) return;
				const bus = rq('std:eventBus');
				if (!bus) return;
				let dat = {
					token: window.$$token.token,
					update: window.$$token.update,
					toast: toast || null,
					id: id
				};
				bus.$emit('childrenSaved', dat);
			},

			$showSidePane(url, arg, data) {
				let newurl = urltools.combine('_navpane', url, arg || '0') + urltools.makeQueryString(data);
				eventBus.$emit('showSidePane', newurl);
			},

			$invoke(cmd, data, base, opts) {
				let self = this;
				let root = window.$$rootUrl;
				const routing = require('std:routing');
				let url = `${root}/${routing.dataUrl()}/invoke`;
				let baseUrl = self.$indirectUrl || self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				let hideIndicator = opts && opts.hideIndicator || false;
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData, false, hideIndicator).then(function (data) {
						if (self.__destroyed__) return;
						if (utils.isObject(data))
							resolve(data);
						else if (utils.isString(data))
							resolve(data);
						else
							throw new Error('Invalid response type for $invoke');
					}).catch(function (msg) {
						if (msg === __blank__)
							return; // already done
						if (opts && opts.catchError) {
							reject(msg);
						} else {
							self.$alertUi(msg);
						}
					});
				});
			},

			$asyncValid(cmd, data) {
				const vm = this;
				const cache = vm.__asyncCache__;
				const djson = JSON.stringify(data);
				let val = cache[cmd];
				if (!val) {
					val = { data: '', result: null };
					cache[cmd] = val;
				}
				if (val.data === djson) {
					return val.result;
				}
				val.data = djson;
				return new Promise(function (resolve, reject) {
					if (vm.__destroyed__) return;
					Vue.nextTick(() => {
						vm.$invoke(cmd, data).then((result) => {
							if (vm.__destroyed__) return;
							val.result = result.Result.Value;
							resolve(val.result);
						});
					});
				});
			},

			$reload(args) {
				//console.dir('$reload was called for' + this.$baseUrl);
				eventBus.$emit('closeAllPopups');
				let self = this;
				if (utils.isArray(args) && args.$isLazy()) {
					// reload lazy
					let propIx = args._path_.lastIndexOf('.');
					let prop = args._path_.substring(propIx + 1);
					args.$loaded = false; // reload
					return self.$loadLazy(args.$parent, prop);
				}
				let root = window.$$rootUrl;
				const routing = require('std:routing'); // defer loading
				let url = `${root}/${routing.dataUrl()}/reload`;
				let dat = self.$data;

				let mi = args ? modelInfo.get(args.$ModelInfo) : null;
				if (!args && !mi) {
					// try to get first $ModelInfo
					let modInfo = this.$data._findRootModelInfo();
					if (modInfo) {
						mi = modelInfo.get(modInfo);
					}
				}

				let saveSels = dat._saveSelections();

				return new Promise(function (resolve, reject) {
					let dataToQuery = { baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi) };
					if (utils.isDefined(dat.Query)) {
						// special element -> use url
						dataToQuery.baseUrl = urltools.replaceUrlQuery(self.$baseUrl, dat.Query);
						let newUrl = urltools.replaceUrlQuery(null/*current*/, dat.Query);
						window.history.replaceState(null, null, newUrl);
					}
					let jsonData = utils.toJson(dataToQuery);
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						if (utils.isObject(data)) {
							dat.$merge(data, true/*checkBindOnce*/);
							modelInfo.reconcileAll(data.$ModelInfo);
							dat._setModelInfo_(undefined, data);
							dat._setRuntimeInfo_(data.$runtime);
							dat._fireLoad_();
							dat._restoreSelections(saveSels);
							resolve(dat);
						} else {
							throw new Error('Invalid response type for $reload');
						}
					}).catch(function (msg) {
						if (msg === __blank__)
							return; // already done
						self.$alertUi(msg);
					});
				});
			},
			async $nodirty(callback) {
				let wasDirty = this.$data.$dirty;
				await callback();
				this.$defer(() => this.$data.$setDirty(wasDirty));
			},
			$requery() {
				if (this.inDialog)
					eventBus.$emit('modalRequery', this.$baseUrl);
				else
					eventBus.$emit('requery');
			},

			$remove(item, confirm) {
				if (this.$data.$readOnly) return;
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},

			$removeSelected(arr, confirm) {
				if (!utils.isArray(arr)) {
					console.error('$removeSelected. The argument is not an array');
				}
				if (this.$data.$readOnly)
					return;
				let item = arr.$selected;
				if (!item)
					return;
				this.$remove(item, confirm);
			},
			$mailto(arg, subject) {
				let href = 'mailto:' + arg;
				if (subject)
					href += '?subject=' + urltools.encodeUrl(subject);
				return href;
			},
			$callphone(phone) {
				return `tel:${phone}`;
			},
			$href(url, data) {
				return urltools.createUrlForNavigate(url, data);
			},
			$navigate(url, data, newWindow, update, opts) {
				if (this.$isReadOnly(opts)) return;
				eventBus.$emit('closeAllPopups');
				let urlToNavigate = urltools.createUrlForNavigate(url, data);
				if (newWindow === true) {
					let nwin = window.open(urlToNavigate, "_blank");
					if (nwin)
						nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: urlToNavigate });
			},
			$navigateSimple(url, newWindow, update) {
				eventBus.$emit('closeAllPopups');
				if (newWindow === true) {
					let nwin = window.open(url, "_blank");
					if (nwin)
						nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: url });
			},

			$navigateExternal(url, newWindow) {
				eventBus.$emit('closeAllPopups');
				if (newWindow === true) {
					window.open(url, "_blank");
				}
				else
					window.location.assign(url);
			},

			$download(url) {
				eventBus.$emit('closeAllPopups');
				const root = window.$$rootUrl;
				url = urltools.combine('/file', url.replace('.', '-'));
				window.location = root + url;
			},

			async $upload(url, accept, data, opts) {
				eventBus.$emit('closeAllPopups');
				let root = window.$$rootUrl;
				try {
					let file = await htmlTools.uploadFile(accept, url);
					var dat = new FormData();
					dat.append('file', file, file.name);
					if (data)
						dat.append('Key', data.Key || null);
					let uploadUrl = urltools.combine(root, '_file', url);
					uploadUrl = urltools.createUrlForNavigate(uploadUrl, data);
					return await httpTools.upload(uploadUrl, dat);
				} catch (err) {
					err = err || 'unknown error';
					if (opts && opts.catchError)
						throw err;
					else if (err.indexOf('UI:') === 0)
						this.$alert(err);
					else
						alert(err);
				}
			},

			$file(url, arg, opts) {
				eventBus.$emit('closeAllPopups');
				const root = window.$$rootUrl;
				let id = arg;
				let token = undefined;
				if (arg && utils.isObject(arg)) {
					id = utils.getStringId(arg);
					if (arg._meta_ && arg._meta_.$token)
						token = arg[arg._meta_.$token];
				}
				let fileUrl = urltools.combine(root, '_file', url, id);
				let qry = {};
				let action = (opts || {}).action;
				if (token)
					qry.token = token;
				if (action == 'download')
					qry.export = 1;
				fileUrl += urltools.makeQueryString(qry);
				switch (action) {
					case 'download':
						htmlTools.downloadUrl(fileUrl);
						break;
					case 'print':
						htmlTools.printDirect(fileUrl);
						break;
					default:
						window.open(fileUrl, '_blank');
				}
			},

			$attachment(url, arg, opts) {
				eventBus.$emit('closeAllPopups');
				const root = window.$$rootUrl;
				let cmd = opts && opts.export ? 'export' : 'show';
				let id = arg;
				let token = undefined;
				if (arg && utils.isObject(arg)) {
					id = utils.getStringId(arg);
					if (arg._meta_ && arg._meta_.$token)
						token = arg[arg._meta_.$token];
				}
				let attUrl = urltools.combine(root, 'attachment', cmd, id);
				let qry = { base: url };
				if (token)
					qry.token = token;
				attUrl = attUrl + urltools.makeQueryString(qry);
				if (opts && opts.newWindow)
					window.open(attUrl, '_blank');
				else if (opts && opts.print)
					htmlTools.printDirect(attUrl);
				else
					window.location.assign(attUrl);
			},

			$eusign(baseurl, arg) {
				// id => attachment id
				// open dialog with eu-sign frame
				function rawDialog(url) {
					return new Promise(function (resolve, reject) {
						const dlgData = {
							promise: null, data: arg, query: { base: baseurl }, raw: true
						};
						eventBus.$emit('modal', url, dlgData);
						dlgData.promise.then(function (result) {
							cb(result);
							resolve(result);
						});
					});
				}
				const root = window.$$rootUrl;
				rawDialog('/eusign/index').then(function (resolve, reject) {
					alert('promise resolved');
				});
			},

			$dbRemove(elem, confirm, opts) {
				if (!elem)
					return;

				if (isPermissionsDisabled(opts, elem)) {
					this.$alert(locale.$PermissionDenied);
					return;
				}
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');

				let id = elem.$id;
				let lazy = elem.$parent.$isLazy ? elem.$parent.$isLazy() : false;
				let root = window.$$rootUrl;
				const self = this;

				function lastProperty(path) {
					let pos = path.lastIndexOf('.');
					if (pos === -1)
						return undefined;
					return path.substring(pos + 1);
				}

				function dbRemove() {
					let postUrl = root + '/_data/dbRemove';
					let jsonObj = { baseUrl: self.$baseUrl, id: id };
					if (lazy) {
						jsonObj.prop = lastProperty(elem.$parent._path_);
					}
					let jsonData = utils.toJson(jsonObj);
					dataservice.post(postUrl, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						elem.$remove(); // without confirm
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
					});
				}
				if (confirm) {
					this.$confirm(confirm).then(function () {
						dbRemove();
					});
				} else {
					dbRemove();
				}
			},

			$dbRemoveSelected(arr, confirm, opts) {
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				let sel = arr.$selected;
				if (!sel)
					return;
				this.$dbRemove(sel, confirm, opts);
			},

			$openSelectedFrame(url, arr) {
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
				let urlToNavigate = urltools.createUrlForNavigate(url, sel.$id);
				eventBus.$emit('openframe', urlToNavigate);
			},

			$openSelected(url, arr, newwin, update) {
				eventBus.$emit('closeAllPopups');
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
				if (url.startsWith('{')) { // decorated. defer evaluate
					url = url.substring(1, url.length - 1);
					let nUrl = utils.eval(sel, url);
					if (!nUrl)
						throw new Error(`Property '${url}' not found in ${sel.constructor.name} object`);
					url = nUrl;
				}
				this.$navigate(url, sel.$id, newwin, update);
			},

			$hasSelected(arr, opts) {
				if (opts && opts.validRequired) {
					let root = this.$data;
					if (!root.$valid) return false;
				}
				return arr && !!arr.$selected;
			},

			$hasChecked(arr) {
				return arr && arr.$checked && arr.$checked.length;
			},

			$sanitize(text) {
				return utils.text.sanitize(text);
			},

			$confirm(prms) {
				// TODO: tools
				if (utils.isString(prms))
					prms = { message: prms };
				prms.style = prms.style || 'confirm';
				prms.message = prms.message || prms.msg; // message or msg
				let dlgData = { promise: null, data: prms };
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$focus(htmlid) {
				let elem = document.querySelector('#' + htmlid);
				if (!elem) return;
				let ch = elem.querySelector('input, textarea, button, select');
				this.$defer(() => {
					if (ch && ch.focus)
						ch.focus();
					else if (elem.focus)
						elem.focus();
				});
			},

			$msg(msg, title, style) {
				let prms = { message: msg, title: title || locale.$Message, style: style || 'info' };
				return this.$confirm(prms);
			},

			$alert(msg, title, list) {
				// TODO: tools
				if (utils.isObject(msg) && !title && !list) {
					let prms = msg;
					msg = prms.message || prms.msg;
					title = prms.title;
					list = prms.list;
				}
				let dlgData = {
					promise: null, data: {
						message: msg, title: title, style: 'alert', list: list
					}
				};
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$alertUi(msg) {
				if (msg instanceof Error) {
					alert(msg.message);
					return;
				}
				if (msg.indexOf('UI:') === 0)
					this.$alert(msg.substring(3).replace('\\n', '\n'));

				else
					alert(msg);
			},

			$toast(toast, style) {
				if (!toast) return;
				if (utils.isString(toast))
					toast = { text: toast, style: style || 'success' };
				eventBus.$emit('toast', toast);
			},

			$showDialog(url, arg, query, opts) {
				return this.$dialog('show', url, arg, query, opts);
			},

			$inlineOpen(id) {
				eventBus.$emit('inlineDialog', { cmd: 'open', id: id});
			},

			$inlineClose(id, result) {
				eventBus.$emit('inlineDialog', { cmd: 'close', id: id, result: result });
			},

			$inlineDepth() {
				let opts = { count: 0 };
				eventBus.$emit('inlineDialogCount', opts);
				return opts.count;
			},

			$closeAllPopups() {
				eventBus.$emit('closeAllPopups');
			},

			$dialog(command, url, arg, query, opts) {
				if (this.$isReadOnly(opts))
					return;
				const that = this;
				eventBus.$emit('closeAllPopups');
				function argIsNotAnArray() {
					if (!utils.isArray(arg)) {
						console.error(`$dialog.${command}. The argument is not an array`);
						return true;
					}
				}
				function argIsNotAnObject() {
					if (!utils.isObjectExact(arg)) {
						console.error(`$dialog.${command}. The argument is not an object`);
						return true;
					}
				}

				function simpleMerge(target, src) {
					for (let p in target) {
						if (p in src)
							target[p] = src[p];
						else
							target[p] = undefined;
					}
				}

				function doDialog() {
					// result always is raw data
					if (isPermissionsDisabled(opts, arg)) {
						that.$alert(locale.$PermissionDenied);
						return;
					}
					if (utils.isFunction(query))
						query = query();
					let reloadAfter = opts && opts.reloadAfter;
					switch (command) {
						case 'new':
							if (argIsNotAnArray()) return;
							return __runDialog(url, 0, query, (result) => {
								let sel = arg.$selected;
								if (sel)
									sel.$merge(result);
							});
						case 'append':
							if (argIsNotAnArray()) return;
							return __runDialog(url, 0, query, (result) => { arg.$append(result); });
						case 'browse':
							if (!utils.isObject(arg)) {
								console.error(`$dialog.${command}. The argument is not an object`);
								return;
							}
							return __runDialog(url, arg, query, (result) => {
								if (arg.$merge) {
									arg.$merge(result);
								} else if (result !== false) {
									simpleMerge(arg, result);
								}
							});
						case 'edit-selected':
							if (argIsNotAnArray()) return;
							if (!arg.$selected) return;
							return __runDialog(url, arg.$selected, query, (result) => {
								arg.$selected.$merge(result);
								arg.__fireChange__('selected');
								if (reloadAfter) 
									that.$reload();
							});
						case 'show-selected': 
							if (argIsNotAnArray()) return;
							if (!arg.$selected) return;
							return __runDialog(url, arg.$selected, query, (result) => {
								if (result === 'reload' || reloadAfter)
									that.$reload();
							});
						case 'edit':
							if (argIsNotAnObject()) return;
							return __runDialog(url, arg, query, (result) => {
								if (result === 'reload')
									that.$reload();
								else if (arg.$merge && utils.isObjectExact(result)) {
									arg.$merge(result);
									if (reloadAfter)
										that.$reload();
								}
							});
						case 'copy':
							if (argIsNotAnObject()) return;
							let arr = arg.$parent;
							return __runDialog(url, arg, query, (result) => {
								arr.$append(result);
								if (reloadAfter) {
									that.$reload();
								}
							});
						default: // simple show dialog
							return __runDialog(url, arg, query, (r) => {
								if (reloadAfter) {
									that.$reload();
								}
							});
					}
				}

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				let mo = this.$data.$mainObject;
				if (opts && opts.saveRequired && (this.$isDirty || mo && mo.$isNew)) {
					let dlgResult = null;
					this.$save().then(() => { dlgResult = doDialog(); });
					return dlgResult;
				}
				return doDialog();
			},

			$export(arg, url, dat, opts) {
				if (this.$isLoading) return;
				const doExport = () => {
					let id = arg || '0';
					if (arg && utils.isObject(arg))
						id = utils.getStringId(arg);
					const self = this;
					const root = window.$$rootUrl;
					let newurl = url ? urltools.combine('/_export', url, id) : self.$baseUrl.replace('/_page/', '/_export/');
					newurl = urltools.combine(root, newurl) + urltools.makeQueryString(dat);
					window.location = newurl; // to display errors
				};

				if (opts && opts.saveRequired && this.$isDirty) {
					this.$save().then(() => {
						doExport();
					});
				}
				else {
					doExport();
				}
			},

			$exportTo(format, fileName) {
				const root = window.$$rootUrl;
				let elem = this.$el.getElementsByClassName('sheet-page');
				if (!elem.length) {
					console.error('element not found (.sheet-page)');
					return;
				}
				let table = elem[0];
				var tbl = table.getElementsByTagName('table');
				if (tbl.length == 0) {
					console.error('element not found (.sheet-page table)');
					return;
				}
				tbl = tbl[0];
				if (htmlTools) {
					htmlTools.getColumnsWidth(tbl);
					// attention! from css!
					let padding = tbl.classList.contains('compact') ? 4 : 12;
					htmlTools.getRowHeight(tbl, padding);
				}
				let html = '<table>' + tbl.innerHTML + '</table>';
				let data = { format, html, fileName, zoom: +(window.devicePixelRatio).toFixed(2) };
				const routing = require('std:routing');
				let url = `${root}/${routing.dataUrl()}/exportTo`;
				dataservice.post(url, utils.toJson(data), true).then(function (blob) {
					if (htmlTools)
						htmlTools.downloadBlob(blob, fileName, format);
				}).catch(function (error) {
					alert(error);
				});
			},

			$report(rep, arg, opts, repBaseUrl, data) {
				if (this.$isReadOnly(opts)) return;
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				let cmd = 'show';
				let fmt = '';
				let viewer = 'report';
				if (opts) {
					if (opts.export) {
						cmd = 'export';
						fmt = opts.format || '';
					} else if (opts.attach)
						cmd = 'attach';
					else if (opts.print)
						cmd = 'print';
					if (opts.viewer && cmd === 'show')
						viewer = opts.viewer;
				}

				const doReport = () => {
					let id = arg;
					if (arg && utils.isObject(arg))
						id = utils.getStringId(arg);
					const root = window.$$rootUrl;
					let url = `${root}/${viewer}/${cmd}/${id}`;
					let reportUrl = urltools.removeFirstSlash(repBaseUrl) || this.$indirectUrl || this.$baseUrl;
					let baseUrl = urltools.makeBaseUrl(reportUrl);
					let qry = Object.assign({}, { base: baseUrl, rep: rep }, data);
					if (fmt)
						qry.format = fmt;
					url = url + urltools.makeQueryString(qry);
					// open in new window
					if (!opts) {
						window.open(url, '_blank');
						return;
					}
					if (opts.export)
						window.location = url;
					else if (opts.print)
						htmlTools.printDirect(url);
					else if (opts.attach)
						return; // do nothing
					else
						window.open(url, '_blank');
				};

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				if (opts && opts.saveRequired && this.$isDirty) {
					this.$save().then(() => {
						doReport();
					});
				} else {
					doReport();
				}
			},

			$modalSaveAndClose(result, opts) {
				if (this.$isDirty) {
					const root = this.$data;
					if (opts && opts.validRequired && root.$invalid) {
						let errs = makeErrors(root.$forceValidate());
						//console.dir(errs);
						this.$alert(locale.$MakeValidFirst, undefined, errs);
						return;
					}
					this.$save().then((result) => eventBus.$emit('modalClose', result));
				}
				else
					eventBus.$emit('modalClose', result);
			},

			$modalClose(result) {
				eventBus.$emit('modalClose', result);
			},

			$setFilter(obj, prop, val) {
				eventBus.$emit('setFilter', { source: obj, prop: prop, value: val });
			},

			$clearFilter(obj) {
				eventBus.$emit('clearFilter', {source: obj});
			},
			$modalSelect(array, opts) {
				if (!('$selected' in array)) {
					console.error('Invalid array for $modalSelect');
					return;
				}
				if (opts && opts.validRequired) {
					let root = this.$data;
					if (!root.$valid) return;
				}
				this.$modalClose(array.$selected);
			},

			$modalSelectChecked(array) {
				if (!('$checked' in array)) {
					console.error('invalid array for $modalSelectChecked');
					return;
				}
				let chArray = array.$checked;
				if (chArray.length > 0)
					this.$modalClose(chArray);
			},

			$saveAndClose(opts) {
				if (this.$isDirty)
					this.$save(opts).then(() => this.$close());
				else
					this.$close();
			},

			$close() {
				if (this.$saveModified()) {
					this.$store.commit("close");
				}
			},

			$showHelp(path) {
				window.open(this.$helpHref(path), "_blank");
			},

			$helpHref(path) {
				return urltools.helpHref(path);
			},

			$searchChange() {
				let newUrl = this.$store.replaceUrlSearch(this.$baseUrl);
				this.$data.__baseUrl__ = newUrl;
				this.$reload();
			},

			$saveModified(message, title) {
				if (!this.$isDirty)
					return true;
				if (this.isIndex)
					return true;
				let self = this;
				let dlg = {
					message: message || locale.$ElementWasChanged,
					title: title || locale.$ConfirmClose,
					buttons: [
						{ text: locale.$Save, result: "save" },
						{ text: locale.$NotSave, result: "close" },
						{ text: locale.$Cancel, result: false }
					]
				};
				function closeImpl(result) {
					if (self.inDialog)
						eventBus.$emit('modalClose', result);
					else
						self.$close();
				}

				this.$confirm(dlg).then(function (result) {
					if (result === 'close') {
						// close without saving
						self.$data.$setDirty(false);
						closeImpl(false);
					} else if (result === 'save') {
						// save then close
						self.$save().then(function (saveResult) {
							//console.dir(saveResult);
							closeImpl(saveResult);
						});
					}
				});
				return false;
			},

			$format(value, opts) {
				if (!opts) return value;
				if (utils.isString(opts))
					opts = { dataType: opts };
				if (!opts.format && !opts.dataType && !opts.mask)
					return value;
				if (opts.mask)
					return value ? mask.getMasked(opts.mask, value) : value;
				if (opts.dataType)
					return utils.format(value, opts.dataType, { hideZeros: opts.hideZeros, format: opts.format });
				if (opts.format && opts.format.indexOf('{0}') !== -1)
					return opts.format.replace('{0}', value);
				if (utils.isDate(value) && opts.format)
					return utils.format(value, 'DateTime', { format: opts.format });
				return value;
			},

			$getNegativeRedClass(value) {
				if (utils.isNumber(value))
					return value < 0 ? 'negative-red' : '';
				return '';
			},

			$expand(elem, propName, expval) {
				let self = this,
					root = window.$$rootUrl,
					url = root + '/_data/expand';

				return new Promise(function (resolve, reject) {
					let arr = elem[propName];
					if (utils.isDefined(expval)) {
						if (elem.$expanded == expval) {
							resolve(arr);
							return;
						} else {
							platform.set(elem, '$expanded', expval);
						}
					}
					if (arr.$loaded) {
						resolve(arr);
						return;
					}
					if (!utils.isDefined(elem.$hasChildren)) {
						resolve(arr);
						return; // no $hasChildren property - static expand
					}
					if (!elem.$hasChildren) {
						// try to expand empty array
						arr.$loaded = true;
						resolve(arr);
						return;
					}
					let jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id });
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						let srcArray = data[propName];
						arr.$empty();
						if (srcArray) {
							for (let el of srcArray)
								arr.push(arr.$new(el));
						}
						resolve(arr);
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
						reject(arr);
					});

					arr.$loaded = true;
				});
			},

			$loadLazy(elem, propName) {
				const routing = require('std:routing'); // defer loading
				let self = this,
					root = window.$$rootUrl,
					url = `${root}/${routing.dataUrl()}/loadlazy`,
					selfMi = elem[propName].$ModelInfo,
					parentMi = elem.$parent.$ModelInfo;

				// HACK. inherit filter from parent modelInfo
				/*
				?????
				if (parentMi && parentMi.Filter) {
					if (selfMi)
						modelInfo.mergeFilter(selfMi.Filter, parentMi.Filter);
					else
						selfMi = parentMi;
				}
				*/

				let mi = modelInfo.get(selfMi);
				let xQuery = urltools.parseUrlAndQuery(self.$baseUrl, mi);
				let newUrl = xQuery.url + urltools.makeQueryString(mi);
				//console.dir(newUrl);
				//let jsonData = utils.toJson({ baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi), id: elem.$id, prop: propName });
				let jsonData = utils.toJson({ baseUrl: newUrl, id: elem.$id, prop: propName });

				return new Promise(function (resolve, reject) {
					let arr = elem[propName];
					if (arr.$loaded) {
						resolve(arr);
						return;
					}
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						if (propName in data) {
							arr.$empty();
							for (let el of data[propName])
								arr.push(arr.$new(el));
							let rcName = propName + '.$RowCount';
							if (rcName in data) {
								arr.$RowCount = data[rcName];
							}
							if (data.$ModelInfo)
								modelInfo.reconcile(data.$ModelInfo[propName]);
							arr._root_._setModelInfo_(arr, data);
							let eventName = treeNormalPath(arr._path_) + '.load';
							self.$data.$emit(eventName, arr);
						}
						resolve(arr);
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
					});
					arr.$loaded = true;
				});
			},

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
			},

			$defer: platform.defer,
			$print: platform.print,

			$hasError(path) {
				let ps = utils.text.splitPath(path);
				let err = this[ps.obj]._errors_;
				if (!err) return false;
				let arr = err[path];
				return arr && arr.length;
			},

			$errorMessage(path) {
				let ps = utils.text.splitPath(path);
				let err = this[ps.obj]._errors_;
				if (!err) return '';
				let arr = err[path];
				if (arr && arr.length)
					return arr[0].msg;
				return '';
			},

			$getErrors(severity) {
				let errs = this.$data.$forceValidate();
				if (!errs || !errs.length)
					return null;

				if (severity && !utils.isArray(severity))
					severity = [severity];

				function isInclude(sev) {
					if (!severity)
						return true; // include
					if (severity.indexOf(sev) !== -1)
						return true;
					return false;
				}

				let result = [];
				for (let x of errs) {
					for (let ix = 0; ix < x.e.length; ix++) {
						let y = x.e[ix];
						if (isInclude(y.severity))
							result.push({ path: x, msg: y.msg, severity: y.severity, index: ix });
					}
				}
				return result.length ? result : null;
			},

			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__cwChange(source) {
				this.$reload(source);
			},
			__queryChange(search, source) {
				// preserve $baseQuery (without data from search)
				if (!utils.isObjectExact(search)) {
					console.error('base.__queryChange. invalid argument type');
				}
				let searchBase = search.__baseUrl__;
				if (searchBase) {
					let searchurl = urltools.parseUrlAndQuery(searchBase);
					let thisurl = urltools.parseUrlAndQuery(this.$data.__baseUrl__);
					if (searchurl.url !== thisurl.url)
						return;
				}
				let nq = Object.assign({}, this.$baseQuery);
				for (let p in search) {
					if (p.startsWith('__'))
						continue;
					if (search[p]) {
						// replace from search
						nq[p] = search[p];
					}
					else {
						// undefined element, delete from query
						delete nq[p];
					}
				}
				//this.$data.__baseUrl__ = this.$store.replaceUrlSearch(this.$baseUrl, urltools.makeQueryString(nq));
				let mi = source ? source.$ModelInfo : this.$data._findRootModelInfo();
				modelInfo.copyfromQuery(mi, nq);
				this.$reload(source);
			},
			__doInit__(baseUrl) {
				const root = this.$data;
				if (!root._modelLoad_) return;
				let caller = null;
				if (baseUrl)
					root.__baseUrl__ = baseUrl;
				if (this.$caller)
					caller = this.$caller.$data;
				this.__createController__();
				root._modelLoad_(caller);
				root._seal_(root);
			},
			__createController__() {
				let ctrl = {
					$save: this.$save,
					$invoke: this.$invoke,
					$close: this.$close,
					$modalClose: this.$modalClose,
					$msg: this.$msg,
					$alert: this.$alert,
					$confirm: this.$confirm,
					$showDialog: this.$showDialog,
					$inlineOpen: this.$inlineOpen,
					$inlineClose: this.$inlineClose,
					$inlineDepth: this.$inlineDepth,
					$saveModified: this.$saveModified,
					$asyncValid: this.$asyncValid,
					$toast: this.$toast,
					$requery: this.$requery,
					$reload: this.$reload,
					$notifyOwner: this.$notifyOwner,
					$navigate: this.$navigate,
					$defer: platform.defer,
					$setFilter: this.$setFilter,
					$clearFilter: this.$clearFilter,
					$expand: this.$expand,
					$focus: this.$focus,
					$report: this.$report,
					$upload: this.$upload,
					$emitCaller: this.$emitCaller,
					$emitSaveEvent: this.$emitSaveEvent,
					$nodirty: this.$nodirty,
					$showSidePane: this.$showSidePane
				};
				Object.defineProperty(ctrl, "$isDirty", {
					enumerable: true,
					configurable: true, /* needed */
					get: () => this.$isDirty
				});
				Object.defineProperty(ctrl, "$isPristine", {
					enumerable: true,
					configurable: true, /* needed */
					get: () => this.$isPristine
				});
				Object.seal(ctrl);
				return ctrl;
			},
			__notified(token) {
				if (!token) return;
				if (this.__currentToken__ !== token.token) return;
				if (token.toast)
					this.$toast(token.toast);
				this.$reload(token.update || null).then(function (array) {
					if (!token.id) return;
					if (!utils.isArray(array)) return;
					let el = array.find(itm => itm.$id === token.id);
					if (el && el.$select) el.$select();
				});
			},
			__parseControllerAttributes(attr) {
				if (!attr) return null;
				let json = JSON.parse(attr.replace(/\'/g, '"'));
				let result = {};
				if (json.canClose) {
					let ccd = this.$delegate(json.canClose);
					if (ccd)
						result.canClose = ccd.bind(this.$data);
				}
				if (json.alwaysOk)
					result.alwaysOk = true;
				if (json.saveEvent) {
					this.__saveEvent__ = json.saveEvent;
				}
				if (json.placement)
					result.placement = json.placement;
				return result;
			},
			__isModalRequery() {
				let arg = { url: this.$baseUrl, result: false };
				eventBus.$emit('isModalRequery', arg);
				return arg.result;
			},
			__invoke__test__(args) {
				args = args || {};
				if (args.target !== 'controller')
					return;
				if (this.inDialog) {
					// testId for dialogs only
					if (args.testId !== this.__testId__)
						return;
				}
				const root = this.$data;
				switch (args.action) {
					case 'eval':
						args.result = utils.eval(root, args.path);
						break;
				}
			},
			__global_period_changed__(period) {
				this.$data._fireGlobalPeriodChanged_(period);
			}
		},
		created() {
			let out = { caller: null };
			if (!this.isSkipDataStack)
				eventBus.$emit('registerData', this, out);
			this.$caller = out.caller;
			this.__destroyed__ = false;

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);
			eventBus.$on('queryChange', this.__queryChange);
			eventBus.$on('childrenSaved', this.__notified);
			eventBus.$on('invokeTest', this.__invoke__test__);
			eventBus.$on('globalPeriodChanged', this.__global_period_changed__);

			this.$on('cwChange', this.__cwChange);
			this.__asyncCache__ = {};
			this.__currentToken__ = window.app.nextToken();
			if (log)
				log.time('create time:', __createStartTime, false);
		},
		beforeDestroy() {
			this.$data._fireUnload_();
		},
		destroyed() {
			//console.dir('base.js has been destroyed');
			this.$caller = null;
			if (!this.isSkipDataStack)
				eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			eventBus.$off('childrenSaved', this.__notified);
			eventBus.$off('invokeTest', this.__invoke__test__);
			eventBus.$off('globalPeriodChanged', this.__global_period_changed__);

			this.$off('cwChange', this.__cwChange);
			htmlTools.removePrintFrame();
			if (this.$data.$destroy)
				this.$data.$destroy();
			this._data = null;
			this.__destroyed__ = true;
		},
		beforeUpdate() {
			__updateStartTime = performance.now();
		},
		beforeCreate() {
			__createStartTime = performance.now();
		},
		mounted() {
			let testId = this.$el.getAttribute('test-id');
			if (testId)
				this.__testId__ = testId;
		},
		updated() {
			if (log)
				log.time('update time:', __updateStartTime, false);
		}
	});

	app.components['baseController'] = base;
})();
// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

/*20220816-7880*/
/* controllers/navmenu.js */

(function () {

	const platform = require('std:platform');
	const urlTools = require('std:url');


	function isSeparatePage(pages, seg) {
		if (!seg || !pages) return false;
		return pages.indexOf(seg + ',') !== -1;
	}

	function findMenu(menu, func, parentMenu) {
		if (!menu)
			return null;
		for (let i = 0; i < menu.length; i++) {
			let itm = menu[i];
			if (func(itm))
				return itm;
			if (itm.Menu) {
				if (parentMenu)
					parentMenu.Url = itm.Url;
				let found = findMenu(itm.Menu, func);
				if (found) {
					platform.set(itm, '$expanded', true);
					return found;
				}
			}
		}
		return null;
	}

	function makeMenuUrl(menu, url, opts) {
		opts = opts || {};
		url = urlTools.combine(url).toLowerCase();
		let sUrl = url.split('/');
		if (sUrl.length >= 4)
			return url; // full qualified
		let routeLen = sUrl.length;
		let seg1 = sUrl[1];
		if (seg1 === 'app')
			return url; // app
		if (opts && isSeparatePage(opts.pages, seg1))
			return url; // separate page
		let am = null;
		if (seg1)
			am = menu.find((mi) => mi.Url === seg1);
		if (!am) {
			// no segments - find first active menu
			if (seg1)
				return url; // invalid segment -> invalid url
			let parentMenu = { Url: '' };
			am = findMenu(menu, (mi) => mi.Url && !mi.Menu, parentMenu);
			if (am) {
				opts.title = am.Name;
				return urlTools.combine(url, parentMenu.Url, am.Url);
			}
		} else if (am && !am.Menu) {
			opts.title = am.Name;
			return url; // no sub menu
		}
		url = urlTools.combine(seg1);
		let seg2 = sUrl[2];
		if (!seg2 && opts.seg2)
			seg2 = opts.seg2; // may be
		if (!seg2) {
			// find first active menu in am.Menu
			am = findMenu(am.Menu, (mi) => mi.Url && !mi.Menu);
		} else {
			// find current active menu in am.Menu
			am = findMenu(am.Menu, (mi) => mi.Url === seg2);
		}
		if (am) {
			opts.title = am.Name;
			return urlTools.combine(url, am.Url);
		}
		return url; //TODO: ????
	}



	app.components['std:navmenu'] = {
		findMenu,
		makeMenuUrl,
		isSeparatePage
	};
})();	
// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210801-7798*/
/* bootstrap/appheader.js */

(function () {

	const locale = window.$$locale;
	const urlTools = require('std:url');
	const menuTools = component('std:navmenu');

	const a2AppHeader = {
		props: {
			title: String,
			subtitle: String,
			userState: Object,
			personName: String,
			clientId: String,
			userIsAdmin: Boolean,
			menu: Array,
			newMenu: Array,
			settingsMenu: Array,
			appData: Object,
		},
		computed: {
			locale() { return locale; },
			seg0() { return this.$store.getters.seg0; }
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
				let savedUrl = localStorage.getItem(storageKey) || '';
				if (savedUrl && !menuTools.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menuTools.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			}
		}
	};

	app.components['std:appHeaderBase'] = a2AppHeader;

})();


// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210604-7780*/
/* bootstrap/sidebar.js */

(function () {
	const store = component('std:store');
	const urlTools = require('std:url');
	const menuTools = component('std:navmenu');
	const htmlTools = require('std:html');

	const sideBar = {
		props: {
			menu: Array,
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			topMenu() {
				let seg0 = this.seg0;
				return menuTools.findMenu(this.menu, (mi) => mi.Url === seg0);
			},
			sideMenu() {
				let top = this.topMenu;
				return top ? top.Menu : null;
			}
		},
		methods: {
			isActive(item) {
				let isActive = this.seg1 === item.Url;
				if (isActive)
					htmlTools.updateDocTitle(item.Name);
				return isActive;
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				if (!item.Url) return;
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.Url, item.Url);
					if (item.Url.indexOf('/') === -1) {
						// save only simple path
						try {
							// avoid EDGE error QuotaExceeded
							localStorage.setItem('menu:' + urlTools.combine(window.$$rootUrl, top.Url), item.Url);
						}
						catch (e) {
							// do nothing
						}
					}
					this.$store.commit('navigate', { url: url, title: item.Name });
				}
				else
					console.error('no top menu found');
			}
		}
	}



	app.components['std:sideBarBase'] = sideBar;
})();

// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210604-7780*/
/* bootstrap/mainview.js */

(function () {
	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');
	const menuTools = component('std:navmenu');

	const contentView = {
		props: {
			menu: Array,
			title: String
		},
		render(h) {
			return h('div', {
				attrs: {
					class: 'main-view'
				}
			}, [h('include', {
				props: {
					src: this.currentView,
					needReload: this.needReload
				}
			})]);
		},
		computed: {
			currentView() {
				let root = window.$$rootUrl;
				let url = store.getters.url;
				if (url === '/')
					return; // no views here
				let len = store.getters.len;
				if (len === 2 || len === 3)
					url += '/index/0';
				return urlTools.combine(root, '/_page', url) + store.getters.search;
			}
		},
		data() {
			return {
				needReload: false
			};
		},
		created() {
			// content view
			var me = this;
			eventBus.$on('requery', function () {
				// just trigger
				me.needReload = true;
				Vue.nextTick(() => me.needReload = false);
			});
			let opts = { title: null, pages: this.pages };
			let menuPath = urlTools.normalizeRoot(window.location.pathname);
			// fix frequent error
			if (menuPath === '/home' && this.menu && !this.menu.find(v => v.Url.toLowerCase() === 'home')) {
				menuPath = '/';
			}
			let newUrl = menuTools.makeMenuUrl(this.menu, menuPath, opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

			let firstUrl = {
				url: '',
				title: ''
			};

			firstUrl.url = menuTools.makeMenuUrl(this.menu, '/', opts);

			firstUrl.title = opts.title;
			urlTools.firstUrl = firstUrl;
		}
	};

	app.components['std:mainViewBase'] = contentView;
})();



(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');

	const shell = Vue.extend({
		components: {
		},
		store,
		data() {
			return {
				globalPeriod:null
			};
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			fullPage() {
				let top = this.menu.find(x => x.Url === this.seg0);
				return !(top && top.Menu !== null && top.Menu.length);
			}
		},
		watch: {
		},
		methods: {
		},
		created() {
			const me = this;
			me.__dataStack__ = [];
			window.addEventListener('popstate', function (event, a, b) {
				eventBus.$emit('modalCloseAll');
				if (me.__dataStack__.length > 0) {
					let comp = me.__dataStack__[0];
					let oldUrl = event.state;
					if (!comp.$saveModified()) {
						// disable navigate
						oldUrl = comp.$data.__baseUrl__.replace('/_page', '');
						window.history.pushState(oldUrl, null, oldUrl);
						return;
					}
				}

				me.$store.commit('popstate');
			});
		}
	});

	app.components['std:shellController'] = shell;

})();

