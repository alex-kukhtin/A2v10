// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190813-7521
// app.js

"use strict";

(function () {

	window.app = {
		modules: {},
		components: {},
		nextToken: nextToken
	};

	window.require = require;
	window.component = component;

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

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190704-7504*/
/* services/const.js */

app.modules['std:const'] = function () {

	return {
		SEVERITY: {
			ERROR: 'error',
			WARNING: 'warning',
			INFO: 'info'
		}
	};
};






// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200925-7708
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


	return {
		isArray: Array.isArray,
		isFunction: isFunction,
		isDefined: isDefined,
		isObject: isObject,
		isObjectExact: isObjectExact,
		isDate: isDate,
		isString: isString,
		isNumber: isNumber,
		isBoolean: isBoolean,
		toString: toString,
		defaultValue: defaultValue,
		notBlank: notBlank,
		toJson: toJson,
		fromJson: JSON.parse,
		isPrimitiveCtor: isPrimitiveCtor,
		isDateCtor: isDateCtor,
		isEmptyObject: isEmptyObject,
		defineProperty: defProperty,
		eval: evaluate,
		simpleEval: simpleEval,
		format: format,
		toNumber: toNumber,
		parse: parse,
		getStringId: getStringId,
		isEqual: isEqual,
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
			equalNoCase: stringEqualNoCase
		},
		currency: {
			round: currencyRound,
			format: currencyFormat
		},
		func: {
			curry,
			debounce
		},
		debounce: debounce
	};

	function isFunction(value) { return typeof value === 'function'; }
	function isDefined(value) { return typeof value !== 'undefined'; }
	function isObject(value) { return value !== null && typeof value === 'object'; }
	function isDate(value) { return value instanceof Date; }
	function isString(value) { return typeof value === 'string'; }
	function isNumber(value) { return typeof value === 'number'; }
	function isBoolean(value) { return typeof value === 'boolean'; }
	function isObjectExact(value) { return isObject(value) && !Array.isArray(value); }

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

	function toString(obj) {
		if (!isDefined(obj))
			return '';
		else if (obj === null)
			return '';
		else if (isObject(obj))
			return toJson(obj);
		return '' + obj;
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
		let td = new Date(Date.UTC(0, 0, 1, 0, 0, 0, 0));
		return td;
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
		if (!str) return dateZero();
		let seg = str.split(/[^\d]/).filter(x => x);
		if (seg.length === 1) {
			seg.push('0');
		}
		let h = Math.min(+seg[0], 23);
		let m = Math.min(+seg[1], 59);
		let td = new Date(0, 0, 1, h, m, 0, 0);
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
			seg.push('' + (today.getMonth() + 1));
			seg.push('' + today.getFullYear());
		} else if (seg.length === 2) {
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
				// TODO: check getTimezone
				return new Date(dt.getFullYear() + nm, dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
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
};

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190411-7483*/
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
		isNewPath
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
};






// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191101-7575*/
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


// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210201-7744
/* services/http.js */

app.modules['std:http'] = function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	let fc = null;

	return {
		get,
		post,
		load,
		upload,
		localpost
	};

	function blob2String(blob, callback) {
		const fr = new FileReader();
		fr.addEventListener('loadend', (e) => {
			const text = fr.result;
			callback(text);
		});
		fr.readAsText(blob);
	}

	function doRequest(method, url, data, raw, skipEvents) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				if (!skipEvents)
					eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					if (raw) {
						resolve(xhr.response);
						return;
					}
					let ct = xhr.getResponseHeader('content-type') || '';
					let xhrResult = xhr.responseText;
					if (ct && ct.indexOf('application/json') !== -1)
						xhrResult = xhr.responseText ? JSON.parse(xhr.responseText) : '';
					resolve(xhrResult);
				}
				else if (xhr.status === 255) {
					if (raw) {
						if (xhr.response instanceof Blob)
							blob2String(xhr.response, (msg) => reject('server error: ' + msg));
						else
							reject(xhr.statusText); // response is blob!
					}
					else
						reject(xhr.responseText || xhr.statusText);
				} else if (xhr.status === 473 /*non standard */) {
					if (xhr.statusText === 'Unauthorized') {
						// go to login page
						window.location.assign('/');
					}
				}
				else
					reject(xhr.statusText);
			};
			xhr.onerror = function (response) {
				if (!skipEvents)
					eventBus.$emit('endRequest', url);
				reject(xhr.statusText);
			};
			xhr.open(method, url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'application/json, text/html');
			if (raw)
				xhr.responseType = "blob";
			if (!skipEvents)
				eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function get(url, raw) {
		return doRequest('GET', url, null, raw);
	}

	function post(url, data, raw, skipEvents) {
		return doRequest('POST', url, data, raw, skipEvents);
	}

	function upload(url, data) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					let xhrResult = xhr.responseText ? JSON.parse(xhr.responseText) : '';
					resolve(xhrResult);
				} else if (xhr.status === 255) {
					reject(xhr.responseText || xhr.statusText);
				}
			};
			xhr.onerror = function (response) {
				alert('Error');
			};
			xhr.open("POST", url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'application/json');
			eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function load(url, selector, baseUrl) {
		if (selector) {
			let fc = selector.firstElementChild
			if (fc && fc.__vue__) {
				let ve = fc.__vue__;
				ve.$destroy();
				ve.$el.remove();
				ve.$el = null;
				fc.__vue__ = null;
			}
			selector.innerHTML = '';
		}

		return new Promise(function (resolve, reject) {
			eventBus.$emit('beginLoad');
			doRequest('GET', url)
				.then(function (html) {
					if (html.startsWith('<!DOCTYPE')) {
						// full page - may be login?
						window.location.assign('/');
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
					if (selector.firstElementChild && selector.firstElementChild.__vue__) {
						let fec = selector.firstElementChild;
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
					reject(error);
					eventBus.$emit('endLoad');
				});
		});
	}

	function localpost(command, data) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				if (xhr.status === 200) {
					let ct = xhr.getResponseHeader('content-type');
					let xhrResult = xhr.responseText;
					if (ct.indexOf('application/json') !== -1)
						xhrResult = JSON.parse(xhr.responseText);
					resolve(xhrResult);
				}
				else if (xhr.status === 255) {
					reject(xhr.responseText || xhr.statusText);
				}
				else {
					reject(xhr.statusText);
				}
			};
			xhr.onerror = function (response) {
				reject(response);
			};
			let url = "http://127.0.0.1:64031/" + command;
			xhr.open("POST", url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'text/plain');
			xhr.setRequestHeader('Content-Type', 'text/plain');
			xhr.send(data);
		});
	}
};





// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181121-7364
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
// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210104-7738*/
/* services/log.js */

app.modules['std:log'] = function () {


	let _traceEnabled = false;
	let _sessionLoaded = false;
	const traceEnabledKey = 'traceEnabled';

	return {
		info: info,
		warn: warning,
		error: error,
		time: countTime,
		traceEnabled: function () {
			if (!_sessionLoaded)
				loadSession();
			return _traceEnabled;
		},
		enableTrace: function (val) {
			if (!window.$$debug) return;
			_traceEnabled = val;
			console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
			try {
				window.sessionStorage.setItem(traceEnabledKey, val);
			}
			catch (err) {
				// do nothing
			}
		}
	};

	function info(msg) {
		if (!_traceEnabled) return;
		console.info(msg);
	}

	function warning(msg) {
		if (!_traceEnabled) return;
		console.warn(msg);
	}

	function error(msg) {
		console.error(msg); // always
	}

	function countTime(msg, start, enable) {
		if (!_traceEnabled && !enable) return;
		console.warn(msg + ' ' + (performance.now() - start).toFixed(2) + ' ms');
	}

	function loadSession() {
		let te = window.sessionStorage.getItem(traceEnabledKey);
		if (te !== null) {
			_traceEnabled = te === 'true';
			if (_traceEnabled)
				console.warn('tracing is enabled');
		}
		_sessionLoaded = true;
	}
};


app.modules['std:console'] = function () {
	return {
		log() {
			if (window.$$debug)
				console.log(...arguments);
		},
		dir() {
			if (window.$$debug)
				console.dir(...arguments);
		},
		info() {
			if (window.$$debug)
				console.info(...arguments);
		},
		error() {
			if (window.$$debug)
				console.error(...arguments);
		},
		warn() {
			if (window.$$debug)
				console.warn(...arguments);
		}
	}
};
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191122-7587*/
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



// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210211-7747*/
/* services/impl/array.js */

app.modules['std:impl:array'] = function () {

	const utils = require('std:utils');

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
					if (!p || p === this.$root)
						break;
					p.$expanded = true;
					p = p._parent_._parent_;
				}
			}
		};

	}
};

/* Copyright © 2015-2021 Alex Kukhtin. All rights reserved.*/

/*20210211-7747*/
// services/datamodel.js

/*
 * TODO: template & validate => /impl
 * arr.$checked => /impl/array
 * arr.$load/lazy => /impl/array
 * treeImpl => /impl/tree
 * ensureType to std:utils
 * try minimize by grunt
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

	function defPropertyGet(trg, prop, get) {
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get: get
		});
	}

	function ensureType(type, val) {
		if (!utils.isDefined(val))
			val = utils.defaultValue(type);
		if (type === Number)
			return utils.toNumber(val);
		else if (type === String)
			return utils.toString(val);
		else if (type === Date && !utils.isDate(val))
			return utils.date.parse('' + val);
		return val;
	}

	function propFromPath(path) {
		if (!path)
			return '';
		let propIx = path.lastIndexOf('.');
		return path.substring(propIx + 1);
	}

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
					val = ensureType(ctor, val);
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
			elem.$expanded = false; // tree elem
			elem.$collapsed = false; // sheet elem
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

		arr.Selected = function (propName) {
			let sel = this.$selected;
			return sel ? sel[propName] : null;
		};

		arr.$isLazy = function () {
			const meta = this.$parent._meta_;
			if (!meta.$lazy) return false;
			let prop = propFromPath(this._path_);
			return meta.$lazy.indexOf(prop) !== -1;
		};

		arr.$load = function () {
			if (!this.$isLazy()) return;
			platform.defer(() => this.$loadLazy());
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
			return new Promise((resolve, reject) => {
				if (!this.$vm) return;
				if (this.$loaded) { resolve(this); return; }
				if (!this.$parent) { resolve(this); return; }
				const meta = this.$parent._meta_;
				if (!meta.$lazy) { resolve(this); return; }
				let prop = propFromPath(this._path_);
				if (meta.$lazy.indexOf(prop) === -1) { resolve(this); return; }
				this.$vm.$loadLazy(this.$parent, prop).then(() => resolve(this));
			});
		};

		arr.$reload = function () {
			this.$lock = false;
			return this.$vm.$reload(this);
		}

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
        /*
        platform.defer(() => {
            console.dir('end init');
        });
        */
	}

	function setRootRuntimeInfo(runtime) {
		if (!runtime) return;
		if (runtime.$cross) {
			for (let p in this) {
				if (p.startsWith("$") || p.startsWith('_')) continue;
				let ta = this[p];
				if (ta._elem_ && ta.$cross) {
					for (let x in runtime.$cross) {
						if (ta._elem_.name != x) continue;
						let t = ta.$cross;
						let s = runtime.$cross[x];
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


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180319-7135
// dataservice.js
(function () {

	let http = require('std:http');
	let utils = require('std:utils');

	function post(url, data, raw) {
		return http.post(url, data, raw);
	}

	function get(url) {
		return http.get(url);
	}

	app.modules['std:dataservice'] = {
		post: post,
		get: get
	};
})();




// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20171029-7060*/
/* services/popup.js */

app.modules['std:popup'] = function () {

	const __dropDowns__ = [];
	let __started = false;

	const __error = 'Perhaps you forgot to create a _close function for popup element';


	return {
		startService: startService,
		registerPopup: registerPopup,
		unregisterPopup: unregisterPopup,
		closeAll: closeAllPopups,
		closest: closest,
		closeInside: closeInside
	};

	function registerPopup(el) {
		__dropDowns__.push(el);
	}

	function unregisterPopup(el) {
		let ix = __dropDowns__.indexOf(el);
		if (ix !== -1)
			__dropDowns__.splice(ix, 1);
		delete el._close;
	}

	function startService() {
		if (__started)
			return;

		__started = true;

		document.body.addEventListener('click', closePopups);
		document.body.addEventListener('contextmenu', closePopups);
		document.body.addEventListener('keydown', closeOnEsc);
	}


	function closest(node, css) {
		if (node) return node.closest(css);
		return null;
	}

	function closeAllPopups() {
		__dropDowns__.forEach((el) => {
			if (el._close)
				el._close(document);
		});
	}

	function closeInside(el) {
		if (!el) return;
		// inside el only
		let ch = el.querySelectorAll('.popover-wrapper');
		for (let i = 0; i < ch.length; i++) {
			let chel = ch[i];
			if (chel._close) {
				chel._close();
			}
		}
	}

	function closePopups(ev) {
		if (__dropDowns__.length === 0)
			return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (closest(ev.target, '.dropdown-item') ||
				ev.target.hasAttribute('close-dropdown') ||
				closest(ev.target, '[dropdown-top]') !== el) {
				if (!el._close) {
					throw new Error(__error);
				}
				el._close(ev.target);
			}
		}
	}

	// close on esc
	function closeOnEsc(ev) {
		if (ev.which !== 27) return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (!el._close)
				throw new Error(__error);
			el._close(ev.target);
		}
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180702-7237*/
/* services/tools.js */

app.modules['std:tools'] = function () {

	const eventBus = require('std:eventBus');

	return {
		alert
	};

	function alert(msg, title, list) {
		let dlgData = {
			promise: null, data: {
				message: msg, title: title, style: 'alert', list: list
			}
		};
		eventBus.$emit('confirm', dlgData);
		return dlgData.promise;
	}
};

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200713-7685
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
		updateDocTitle
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
};





// Copyright © 2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* services/routing.js */

app.modules['std:routing'] = function () {

	return {
		dataUrl
	};

	function dataUrl(msg) {
		return '_data';
	}
};

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191211-7596*/
/* services/accel.js */

app.modules['std:accel'] = function () {

	const _elems = [];
	let _listenerAdded = false;

	return {
		registerControl,
		unregisterControl
	};

	function _keyDownHandler(ev) {
		// control/alt/shift/meta
		const keyAccel = `${ev.ctrlKey ? 'C' : '_'}${ev.altKey ? 'A' : '_'}${ev.shiftKey ? 'S' : '_'}${ev.metaKey ? 'M' : '_'}:${ev.code}`;
		let el = _elems.find(x => x.accel === keyAccel);
		if (!el) return;
		if (el.action === 'focus') {
			Vue.nextTick(() => {
				el.elem.focus();
			});
		}
	}

	function setListeners() {
		if (_elems.length > 0) {
			if (_listenerAdded)
				return;
			document.addEventListener('keydown', _keyDownHandler, false);
			_listenerAdded = true;
		} else {
			if (!_listenerAdded)
				return;
			document.removeEventListener('keydown', _keyDownHandler, false);
		}
	}

	function registerControl(accel, elem, action) {
		var found = _elems.findIndex(c => c.elem === elem);
		if (found === -1)
			_elems.push({ elem: elem, accel: accel, action: action });
		setListeners();
	}

	function unregisterControl(elem) {
		var found = _elems.findIndex(c => c.elem === elem);
		if (found !== -1)
			_elems.splice(found);
	}
};

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200903-7705
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
			done: Function
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
					http.load(this.currentUrl, this.$el)
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
				http.load(this.src, this.$el)
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
					http.load(newUrl, this.$el)
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
			dat: undefined
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
				http.load(url, this.$el)
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
				http.load(this.currentUrl, this.$el)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		}
	});
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200206-7653
// components/control.js

(function () {

	const utils = require('std:utils');
	const mask = require('std:mask');
	const maccel = require('std:accel');

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean,
			tabIndex: Number,
			dataType: String,
			format: String,
			validatorOptions: Object,
			updateTrigger: String,
			mask: String,
			hideZeros: Boolean,
			testId: String,
			accel: String
		},
		computed: {
			path() {
				if (this.item._path_)
					return this.item._path_ + '.' + this.prop;
				else
					return this.prop;
			},
			pathToValidate() {
				return this.itemToValidate._path_ + '.' + this.propToValidate;
			},
			modelValue() {
				if (!this.item) return null;
				let val = this.item[this.prop];
				if (this.dataType)
					return utils.format(val, this.dataType, {hideZeros: this.hideZeros, format: this.format });
				else if (this.mask && val)
					return mask.getMasked(this.mask, val);
				return val;
			},
			modelValueRaw() {
				if (!this.item) return null;
				let val = this.item[this.prop];
				return val;
			},
			errors() {
				if (!this.item) return null;
				let root = this.item._root_;
				if (!root) return null;
				if (!root._validate_)
					return null;
				let err;
				if (this.itemToValidate)
					err = root._validate_(this.itemToValidate, this.pathToValidate, this.itemToValidate[this.propToValidate], this.deferUpdate);
				else
					err = root._validate_(this.item, this.path, this.modelValueRaw, this.deferUpdate);
				return err;
			},
			inputClass() {
				let cls = '';
				if (this.align && this.align !== 'left')
					cls += 'text-' + this.align;
				if (this.isNegative) cls += ' negative-red';
				if (this.updateTrigger === 'input')
					cls += ' trigger-input';
				return cls;
			},
			isNegative() {
				if (this.dataType === 'Number' || this.dataType === 'Currency')
					if (this.item && this.modelValue < 0)
						return true;
				return false;
			},
			hasLabel() {
				return !!this.label;
			},
			hasDescr() {
				return !!this.description;
			},
			maxLength() {
				if (!this.item) return undefined;
				if (!this.item.$maxLength) return undefined;
				return this.item.$maxLength(this.prop);
			}
		},
		mounted() {
			// direct parent only
			if (this.$parent.$registerControl)
				this.$parent.$registerControl(this);
			if (this.accel)
				maccel.registerControl(this.accel, this.$refs.input, 'focus');
			if (!this.mask) return;
			mask.mountElement(this.$refs.input, this.mask);
		},
		beforeDestroy() {
			// direct parent only
			if (this.$parent.$unregisterControl)
				this.$parent.$unregisterControl(this);
			if (this.accel)
				maccel.unregisterControl(this.$refs.input);
			if (!this.mask) return;
			mask.unmountElement(this.$refs.input, this.mask);
		},
		methods: {
			valid() {
				// method! no cache!
				return !this.invalid();
			},
			invalid(out) {
				// method! no cache!
				let err = this.errors;
				if (!err) return false;
				if (out) {
					out.warn = err.every(r => r.severity === 'warning');
					out.info = err.every(r => r.severity === 'info');
					out.all = err.length;
				}
				return err.length > 0;
			},
			pending() {
				return this.errors && this.errors.pending > 0;
			},
			cssClass() {
				// method! no cached!!!
				let out = {};
				let inv = this.invalid(out);
				let cls = 'control-group' + (inv ? ' invalid' : ' valid');
				//console.dir(out);
				if (inv && out.warn)
					cls += ' val-warning';
				else if (inv && out.info)
					cls += ' val-info';
				if (this.required) cls += ' required';
				if (this.disabled) cls += ' disabled';
				return cls;
			},
			deferUpdate() {
				this.$children.forEach((val) => val.$forceUpdate());
				this.$forceUpdate();
			},
			test() {
				alert('from base control');
			}
		},
		watch: {
			mask() {
				mask.setMask(this.$refs.input, this.mask);
				if (this.updateValue)
					this.updateValue(this.$refs.input.value);
			}
		}
	};

	app.components['control'] = control;

})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190226-7444*/
/*components/validator.js*/

Vue.component('validator', {
	props: {
		invalid: Function,
		errors: Array,
		options: Object
	},
	template: '<div v-if="invalid()" class="validator" :class="cssClass" :style="cssStyle"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
	computed: {
		cssStyle() {
			let r = {};
			if (this.options && this.options.width)
				r.width = this.options.width;
			return r;
		},
		cssClass() {
			let r = {};
			if (!this.options)
				return r;
			if (this.options.placement)
				r[this.options.placement] = true;
			if (this.options.width)
				r['with-width'] = true;
			return r;
		}
	}
});


Vue.component('a2-static-validator', {
	props: {
		item: {
			type: Object, default() {
				return {};
			}
		},
		prop: String
	},
	template: '<div v-if="invalid()" class="static-validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
	computed: {
		path() {
			return this.item._path_ + '.' + this.prop;
		},
		modelValue() {
			if (!this.item) return null;
			return this.item[this.prop];
		},
		errors() {
			if (!this.item) return null;
			let root = this.item._root_;
			if (!root) return null;
			if (!root._validate_)
				return null;
			let err;
			err = root._validate_(this.item, this.path, this.modelValue, this.deferUpdate);
			return err;
		}
	},
	methods: {
		invalid(out) {
			// method! no cache!
			let err = this.errors;
			if (!err) return false;
			return err.length > 0;
		}
	}
});

/*
TODO: нужно, чтобы добавлялся invalid для родительского элемента.
Vue.component('validator-control', {
    template: '<validator :invalid="invalid" :errors="errors"></validator></div>',
    props: {
        item: {
            type: Object, default() {
                return {};
            }
        },
        prop: String
    },
    created() {
        alert(this.errors);
    },
    computed: {
        path() {
            return this.item._path_ + '.' + this.prop;
        },
        invalid() {
            let err = this.errors;
            return err && err.length > 0;
        },
        errors() {
            if (!this.item) return null;
            let root = this.item._root_;
            if (!root) return null;
            if (!root._validate_)
                return null;
            return root._validate_(this.item, this.path, this.item[this.prop]);
        },
    }
});
*/
// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20200219-7749*/
/*components/textbox.js*/

/* password-- fake fields are a workaround for chrome autofill getting the wrong fields -->*/

(function () {

	const utils = require('std:utils');
	const mask = require('std:mask');

	let textBoxTemplate =
		`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<input v-if="password" type="text" class="fake-pwd-field" />
		<input ref="input" :type="controlType" v-focus :autocomplete="autocompleteText"
			v-bind:value="modelValue" 
				v-on:change="onChange($event.target.value)" 
				v-on:input="onInput($event.target.value)"
				v-on:keypress="onKey($event)"
				:class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength" :spellcheck="spellCheck"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let textAreaTemplate =
		`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<textarea ref="input" v-focus v-auto-size="autoSize" v-bind:value="modelValue2" :style="areaStyle"
			v-on:change="onChange($event.target.value)" 
			v-on:input="onInput($event.target.value)"
			v-on:keypress="onKey($event)"
			:rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength" :spellcheck="spellCheck"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let staticTemplate =
		`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group static">
		<span v-focus v-text="textProp" :class="inputClass" :tabindex="tabIndex" class="static-input"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	/*
	<span>{{ path }}</span>
		<button @click="test" >*</button >
	*/

	let baseControl = component('control');

	const textbox = {
		extends: baseControl,
		template: textBoxTemplate,
		props: {
			item: {
				type: [Object, Array], default() {
					return {};
				}
			},
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			password: Boolean,
			number: Boolean,
			spellCheck: { type: Boolean, default: undefined },
			enterCommand: Function
		},
		computed: {
			controlType() {
				return this.password ? 'password' : 'text';
			},
			autocompleteText() {
				return this.password ? 'new-password' : 'off';
			}
		},
		methods: {
			updateValue(value) {
				if (this.mask)
					this.item[this.prop] = mask.getUnmasked(this.mask, value);
				else
					this.item[this.prop] = utils.parse(value, this.dataType);
				let mv = this.modelValue;
				if (this.$refs.input.value !== mv) {
					this.$refs.input.value = mv;
					this.$emit('change', this.item[this.prop]);
				}
			},
			onInput(value) {
				if (this.updateTrigger === 'input')
					this.updateValue(value);
			},
			onChange(value) {
				if (this.updateTrigger !== 'input')
					this.updateValue(value);
			},
			onKey(event) {
				if (!this.number) return;
				if ((event.charCode < 48 || event.charCode > 57) && event.charCode !== 45 /*minus*/) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	};

	Vue.component('textbox', textbox);
	app.components['textbox'] = textbox;

	const textarea = {
		extends: baseControl,
		template: textAreaTemplate,
		props: {
			item: {
				type: [Object, Array], default() {
					return {};
				}
			},
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			autoSize: Boolean,
			rows: Number,
			spellCheck: { type: Boolean, default: undefined },
			enterCommand: Function,
			maxHeight: String
		},
		computed: {
			modelValue2() {
				if (!this.item) return null;
				return this.item[this.prop];
			},
			areaStyle() {
				if (this.maxHeight)
					return { 'max-height': this.maxHeight };
				return undefined;
			}
		},
		methods: {
			updateValue(value) {
				if (this.item[this.prop] === value) return;
				this.item[this.prop] = value;
				this.$emit('change', this.item[this.prop]);
			},
			onInput(value) {
				if (this.updateTrigger === 'input')
					this.updateValue(value);
			},
			onChange(value) {
				if (this.updateTrigger !== 'input')
					this.updateValue(value);
			},
			onKey(event) {
				if (event.code === "Enter" && event.ctrlKey) {
					if (this.enterCommand) {
						this.enterCommand();
					}
				}
			}
		},
		watch: {
			modelValue() {
				if (!this.autoSize) return;
				let inp = this.$refs.input;
				if (!inp) return;
				// send for auto size
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent('autosize', false, true);
				inp.dispatchEvent(evt);
			}
		}

	};

	const staticControl = {
		extends: baseControl,
		template: staticTemplate,
		props: {
			item: {
				type: [Object, Array], default() {
					return {};
				}
			},
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			text: [String, Number, Date]
		},
		computed: {
			textProp() {
				if (this.mask && this.text)
					return mask.getMasked(this.mask, this.text);
				return this.text;
			}
		}
	};


	Vue.component('textbox', textbox);
	app.components['textbox'] = textbox;

	Vue.component('a2-textarea', textarea);
	app.components['a2-textarea', textarea];

	Vue.component('static', staticControl);
	app.components['static', staticControl];

})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200618-7674*/
/*components/combobox.js*/

(function () {


	const utils = require('std:utils');

	let comboBoxTemplate =
`<div :class="cssClass()" v-lazy="itemsSource" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<div class="select-wrapper" :disabled="disabled" >
			<div v-text="getWrapText()" class="select-text" ref="wrap" :class="wrapClass"/>
			<span class="caret"/>
		</div>
		<select v-focus v-model="cmbValue" :disabled="disabled" :tabindex="tabIndex" ref="sel" :title="getWrapText()">
			<slot>
				<option v-for="(cmb, cmbIndex) in itemsSource" :key="cmbIndex" 
					v-text="getName(cmb, true)" :value="getValue(cmb)"></option>
			</slot>
		</select>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let baseControl = component('control');

	const defaultObj = {
		_validate_() {
			return true;
		}
	};

	Vue.component('combobox', {
		extends: baseControl,
		template: comboBoxTemplate,
		props: {
			prop: String,
			item: {
				type: Object, default() { return {}; }
			},
			itemsSource: {
				type: Array, default() { return []; }
			},
			itemToValidate: Object,
			propToValidate: String,
			nameProp: String,
			valueProp: String,
			showvalue: Boolean,
			align: String
		},
		computed: {
			cmbValue: {
				get() {
					return this.getComboValue();
				},
				set(value) {
					if (this.item) this.item[this.prop] = value;
				}
			},
			wrapClass() {
				let cls = '';
				if (this.align && this.align !== 'left')
					cls += 'text-' + this.align;
				return cls;
			}
		},
		methods: {
			getName(itm, trim) {
				let n = this.nameProp ? utils.eval(itm, this.nameProp) : itm.$name;
				return n;
			},
			getValue(itm) {
				let v = this.valueProp ? utils.eval(itm, this.valueProp) : itm;
				return v;
			},
			getWrapText() {
				return this.showvalue ? this.getComboValue() : this.getText();
			},
			getComboValue() {
				let val = this.item ? this.item[this.prop] : null;
				if (!utils.isObjectExact(val))
					return val;
				let vProp = this.valueProp || '$id';
				if (!(vProp in val))
					return val;
				if (this.itemsSource.indexOf(val) !== -1) {
					return val;
				}
				// always return value from ItemsSource
				return this.itemsSource.find(x => x[vProp] === val[vProp]);
			},
			getText() {
				let cv = this.getComboValue();
				if (utils.isObjectExact(cv))
					return this.getName(cv);
				if (this.itemsSource && this.itemsSource.length) {
					let vProp = this.valueProp || '$id';
					let ob = this.itemsSource.find(x => x[vProp] === cv);
					return ob ? this.getName(ob) : '';
				} else {
					return this.getOptionsText(cv);
				}
			},
			getOptionsText(cv) {
					// get text from select directly.
				let sel = this.$refs.sel;
				if (!sel) return '';
				let ops = sel.options;
				for (let i = 0; i < ops.length; i++) {
					if (''+ ops[i].value === '' + cv)
						return ops[i].text;
				}
				let si = sel.selectedIndex;
				if (si < 0 || si >= ops.length) return '';
				return ops[si].text;
			}
		},
		mounted() {
			// litle hack. $refs are unavailable during init.
			let t = this.getText();
			if (t)
				this.$refs.wrap.innerText = t;
		}
	});
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200109-7704
// components/calendar.js

(function () {

	const utils = require('std:utils');
	const locale = window.$$locale;

	Vue.component('a2-calendar', {
		template: `
<div @click.stop.prevent="dummy">
	<table class="calendar-pane">
		<thead><tr>
				<th class="h-btn"><a v-if="hasPrev" @click.stop.prevent="prevMonth"><i class="ico ico-triangle-left"></i></a></th>
				<th :colspan="isDayView ? 5 : 7" class="month-title"><span v-text="title"></span></th>
				<th class="h-btn"><a v-if="hasNext" @click.stop.prevent='nextMonth'><i class="ico ico-triangle-right"></i></a></th>
			</tr>
			<tr class="weekdays" v-if="isDayView"><th v-for="d in 7" v-text="wdTitle(d)">Пн</th></tr>
			<tr class="weekdays" v-else><th colspan="9"></th></tr>
		</thead>
		<tbody v-if="isDayView">
			<tr v-for="row in days">
				<td v-for="day in row" :class="dayClass(day)"><a @click.stop.prevent="selectDay(day)" 
					@mouseover="mouseOver(day)"
					v-text="day.getDate()" :title="dayTitle(day)"/></td>
			</tr>
		</tbody>
		<tbody v-else>
			<tr v-for="qr in monthes">
				<td v-for="m in qr" class="mcell" :class="monthClass(m.date)" colspan="3"><a @click.stop.prevent="selectDay(m.date)" v-text="m.name"/></td>
			</tr>
		</tbody>
		<tfoot v-if="showFooter" ><tr><td colspan="7" class="calendar-footer">
			<a class="today" @click.stop.prevent='today' v-text='todayText'></a></td></tr></tfoot>
	</table>
</div>
`,
		props: {
			showToday: { type: Boolean, default: true },
			pos: String,
			model: Date,
			setMonth: Function,
			setDay: Function,
			getDayClass: Function,
			hover: Function,
			view: String
		},
		computed: {
			isDayView() {
				return (this.view || 'day') === 'day';
			},
			showFooter() {
				return this.showToday && this.isDayView;
			},
			days() {
				let dt = new Date(this.model);
				dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
				let d = dt.getDate();
				dt.setDate(1); // 1-st day of month
				let w = dt.getDay() - 1; // weekday
				if (w === -1) w = 6;
				else if (w === 0) w = 7;
				dt.setDate(-w + 1);
				let arr = [];
				for (let r = 0; r < 6; r++) {
					let row = [];
					for (let c = 0; c < 7; c++) {
						let xd = new Date(dt);
						xd.setHours(0, -xd.getTimezoneOffset(), 0, 0);
						row.push(new Date(xd));
						dt.setDate(dt.getDate() + 1);
					}
					arr.push(row);
				}
				return arr;
			},
			monthes() {
				let ma = [];
				for (let q = 0; q < 4; q++) {
					let ia = [];
					for (let m = 0; m < 3; m++) {
						let mno = q * 3 + m;
						let dt = utils.date.create(this.model.getFullYear(), mno + 1, 1);
						let mname = utils.text.capitalize(dt.toLocaleDateString(locale.$Locale, { month: 'long' }));
						ia.push({ date:dt, month: mno + 1, name: mname });
					}
					ma.push(ia);
				}
				return ma;
			},
			hasPrev() {
				return this.pos !== 'right';
			},
			hasNext() {
				return this.pos !== 'left';
			},
			title() {
				let mn = this.model.toLocaleString(locale.$Locale, { month: "long", year: 'numeric' });
				return utils.text.capitalize(mn);
			},
			todayText() {
				return locale.$Today;
			},
			todayDate() {
				return utils.date.today();
			}
		},
		methods: {
			dummy() { },
			nextMonth() {
				let dt = new Date(this.model);
				if (this.isDayView)
					dt = utils.date.add(dt, 1, 'month');
				else
					dt.setFullYear(dt.getFullYear() + 1);
				this.setMonth(dt, this.pos);
			},
			prevMonth() {
				let dt = new Date(this.model);
				if (this.isDayView)
					dt = utils.date.add(dt, -1, 'month');
				else
					dt.setFullYear(dt.getFullYear() - 1);
				this.setMonth(dt, this.pos);
			},
			wdTitle(d) {
				let dt = this.days[0][d - 1];
				return dt.toLocaleString(locale.$Locale, { weekday: "short" });
			},
			today() {
				this.setDay(this.todayDate);
			},
			selectDay(d) {
				this.setDay(d, this.pos);
			},
			dayClass(day) {
				let cls = '';
				if (day.getMonth() !== this.model.getMonth())
					cls += " other";
				if (this.getDayClass) {
					cls += this.getDayClass(day);
					return cls;
				}
				let tls = utils.date;
				if (tls.equal(day, this.todayDate))
					cls += ' today';
				if (tls.equal(day, this.model))
					cls += ' active';
				return cls;
			},
			monthClass(day) {
				let cls = '';
				if (day.getFullYear() === this.model.getFullYear() && day.getMonth() === this.model.getMonth())
					cls += ' active';
				return cls;
			},
			dayTitle(day) {
				return day.toLocaleString(locale.$Locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
			},
			mouseOver(day) {
				if (this.hover)
					this.hover(day);
			}
		}
	});
})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20200831-7704
// components/datepicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;

	Vue.component('a2-date-picker', {
		extends: baseControl,
		template: `
<div :class="cssClass2()" class="date-picker" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group"  @click="clickInput($event)">
		<input v-focus v-model.lazy="model" :class="inputClass" :disabled="inputDisabled"/>
		<a href @click.stop.prevent="toggle($event)"><i class="ico ico-calendar"></i></a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="calendar" v-if="isOpen">		
			<a2-calendar :model="modelDate" :view="view"
				:set-month="setMonth" :set-day="selectDay" :get-day-class="dayClass"/>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			// override control.align (default value)
			align: { type: String, default: 'center' },
			view: String,
			yearCutOff: String
		},
		data() {
			return {
				isOpen: false
			};
		},
		methods: {
			toggle(ev) {
				if (this.disabled) return;
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					if (utils.date.isZero(this.modelDate))
						this.item[this.prop] = utils.date.today();
				}
				this.isOpen = !this.isOpen;
			},
			clickInput(ev) {
				if (this.view === 'month') {
					this.toggle(ev);
					ev.stopPropagation();
					ev.preventDefault();
				}
			},
			setMonth(dt) {
				this.setDate(dt);
			},
			selectDay(day) {
				var dt = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0));
				this.setDate(dt);
				this.isOpen = false;
			},
			setDate(d) {
				// save time
				let md = this.modelDate;
				let nd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), md.getUTCHours(), md.getUTCMinutes(), 0, 0));
				this.item[this.prop] = nd;
			},
			dayClass(day) {
				let cls = '';
				let tls = utils.date;
				if (tls.equal(day, tls.today()))
					cls += ' today';
				if (tls.equal(day, this.modelDate))
					cls += ' active';
				if (day.getMonth() !== this.modelDate.getMonth())
					cls += " other";
				return cls;
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen)
					cx += ' open';
				return cx;
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		computed: {
			modelDate() {
				return this.item[this.prop];
			},
			inputDisabled() {
				return this.disabled || this.view === 'month';
			},
			model: {
				get() {
					if (utils.date.isZero(this.modelDate))
						return '';
					if (this.view === 'month')
						return utils.text.capitalize(this.modelDate.toLocaleString(locale.$Locale, { timeZone:'UTC',  year: 'numeric', month: 'long' }));
					else
						return this.modelDate.toLocaleString(locale.$Locale, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
				},
				set(str) {
					let md = utils.date.parse(str, this.yearCutOff);
					if (utils.date.isZero(md)) {
						this.item[this.prop] = md;
						this.isOpen = false;
					} else {
						this.setDate(md);
					}
				}
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200907-7706
// components/datepicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;

	const timesheet = {
		props: {
			model: Date,
			setHour: Function,
			setMinute: Function,
			getHourClass: Function,
			getMinuteClass: Function
		},
		template: `
<div @click.stop.prevent="dummy" class="time-picker-pane calendar-pane">
<table class="table-hours">
<thead><tr><th colspan="6" v-text="locale.$Hours">Години</th></tr></thead>
<tbody>
	<tr v-for="row in hours">
		<td v-for="h in row" :class="getHourClass(h)"><a @click.stop.prevent="clickHours(h)" v-text="h"/></td>
	</tr>	
</tbody></table>
<div class="divider"/>
<table class="table-minutes">
<thead><tr><th colspan="3" v-text="locale.$Minutes">Хвилини</th></tr></thead>
<tbody>
	<tr v-for="row in minutes">
		<td v-for="m in row" :class="getMinuteClass(m)"><a @click.stop.prevent="clickMinutes(m)" v-text="m"/></td>
	</tr>	
</tbody></table>
</div>
`,
		methods: {
			clickHours(h) {
				if (this.setHour)
					this.setHour(+h);
			},
			clickMinutes(m) {
				if (this.setMinute)
					this.setMinute(m);
			},
			dummy() {

			}
		},
		computed: {
			locale() { return locale; },
			hours() {
				let a = [];
				for (let y = 0; y < 4; y++) {
					let r = [];
					a.push(r);
					for (let x = 0; x < 6; x++) {
						var v = y * 6 + x;
						if (v < 10)
							v = '0' + v;
						r.push(v);
					}
				}
				return a;
			},
			minutes() {
				let a = [];
				for (let y = 0; y < 4; y++) {
					let r = [];
					a.push(r);
					for (let x = 0; x < 3; x++) {
						var v = (y * 3 + x) * 5;
						if (v < 10)
							v = '0' + v;
						r.push(v);
					}
				}
				return a;
			}
		}
	};

	/*
			<a2-calendar :model="modelDate"
				:set-month="setMonth" :set-day="selectDay" :get-day-class="dayClass"/>
	 */
	Vue.component('a2-time-picker', {
		extends: baseControl,
		template: `
<div :class="cssClass2()" class="date-picker">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<input v-focus v-model.lazy="model" :class="inputClass" :disabled="inputDisabled"/>
		<a href @click.stop.prevent="toggle($event)"><i class="ico ico-waiting-outline"></i></a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="calendar" v-if="isOpen">
			<a2-time-sheet :model="modelDate" :set-hour="setHour" :set-minute="setMinute" :get-hour-class="hourClass" :get-minute-class="minuteClass"/>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		components: {
			'a2-time-sheet': timesheet
		},
		props: {
			item: Object,
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			// override control.align (default value)
			align: { type: String, default: 'center' }
		},
		data() {
			return {
				isOpen: false
			};
		},
		methods: {
			toggle(ev) {
				if (this.disabled) return;
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					if (utils.date.isZero(this.modelDate))
						this.item[this.prop] = utils.date.today();
				}
				this.isOpen = !this.isOpen;
			},
			setHour(h) {
				let nd = new Date(this.modelDate);
				nd.setUTCHours(h);
				this.item[this.prop] = nd;
			},
			setMinute(m) {
				let md = new Date(this.modelDate);
				md.setMinutes(m);
				this.item[this.prop] = md;
				this.isOpen = false;
			},
			hourClass(h) {
				let cls = '';
				if (this.modelDate.getUTCHours() === +h)
					cls += ' active';
				return cls;
			},
			minuteClass(m) {
				return this.modelDate.getUTCMinutes() === +m ? 'active' : undefined;
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen)
					cx += ' open';
				return cx;
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		computed: {
			modelDate() {
				return this.item[this.prop];
			},
			inputDisabled() {
				return this.disabled;
			},
			model: {
				get() {
					let md = this.modelDate;
					if (utils.date.isZero(md))
						return '';
					return md.toLocaleTimeString(locale.$Locale, { timeZone: 'UTC', hour: '2-digit', minute:"2-digit"});
				},
				set(str) {
					let md = new Date(this.modelDate);
					if (str) {
						let time = utils.date.parseTime(str);
						md.setUTCHours(time.getHours(), time.getMinutes());
					} else {
						md.setUTCHours(0, 0);
					}
					this.item[this.prop] = md;
					this.isOpen = false;
				}
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190831-7549
// components/periodpicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const uPeriod = require('std:period');

	const baseControl = component('control');
	const locale = window.$$locale;

	const DEFAULT_DEBOUNCE = 150;

	Vue.component('a2-period-picker', {
		extends: baseControl,
		template: `
<div class="control-group period-picker" @click.stop.prevent="toggle($event)" :class="{open: isOpen}">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/></label>
	<div class="input-group">
		<span class="period-text" v-text="text" :class="inputClass" :tabindex="tabIndex"/>
		<span class="caret"/>
		<div class="calendar period-pane" v-if="isOpen" @click.stop.prevent="dummy">
			<ul class="period-menu" style="grid-area: 1 / 1 / span 2 / auto">
				<li v-for='(mi, ix) in menu' :key="ix" :class="{active: isSelectedMenu(mi.key)}"><a v-text='mi.name' @click.stop.prevent="selectMenu(mi.key)"></a></li>
			</ul>
			<a2-calendar style="grid-area: 1 / 2" :show-today="false" pos="left" :model="prevModelDate" 
				:set-month="setMonth" :set-day="setDay" :get-day-class="dayClass" :hover="mouseHover"/>
			<a2-calendar style="grid-area: 1 / 3; margin-left:6px":show-today="false" pos="right" :model="modelDate" 
				:set-month="setMonth" :set-day="setDay" :get-day-class="dayClass" :hover="mouseHover"/>
			<div class="period-footer" style="grid-area: 2 / 2 / auto / span 2">
				<span class="current-period" v-text="currentText" :class="{processing: selection}"/>
				<span class="aligner"></span>
				<button class="btn btn-primary" @click.stop.prevent="apply" v-text="locale.$Apply" :disabled="applyDisabled"/>
				<button class="btn btn-default" @click.stop.prevent="close" v-text="locale.$Cancel" />
			</div>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			showAll: {
				type: Boolean,
				default: true
			},
			display: String,
			callback: Function
		},
		data() {
			return {
				isOpen: false,
				selection: '',
				modelDate: utils.date.today(),
				currentPeriod: uPeriod.zero(),
				selectEnd: utils.date.zero(),
				timerId: null
			};
		},
		computed: {
			locale() {
				return window.$$locale;
			},
			text() {
				if (this.display === 'name')
					return this.period.text();
				else if (this.display === 'namedate') {
					if (this.period.isAllData())
						return this.period.text(true);
					return `${this.period.text(true)} [${this.period.format('Date')}]`;
				}
				return this.period.format('Date');
			},
			period() {
				if (!this.item)
					return this.currentPeriod;
				let period = this.item[this.prop];
				if (!uPeriod.isPeriod(period))
					console.error('PeriodPicker. Value is not a Period');
				return period;
			},
			prevModelDate() {
				return utils.date.add(this.modelDate, -1, 'month');
			},
			currentText() {
				return this.currentPeriod.format('Date');
			},
			applyDisabled() {
				return this.selection === 'start';
			},
			menu() {
				return uPeriod.predefined(this.showAll);
			}
		},
		methods: {
			dummy() {
			},
			setMonth(d, pos) {
				if (pos === 'left')
					this.modelDate = utils.date.add(d, 1, 'month'); // prev month
				else
					this.modelDate = d;
			},
			setDay(d) {
				if (!this.selection) {
					this.selection = 'start';
					this.currentPeriod.From = d;
					this.currentPeriod.To = utils.date.zero();
					this.selectEnd = utils.date.zero();
				} else if (this.selection === 'start') {
					this.currentPeriod.To = d;
					this.currentPeriod.normalize();
					this.selection = '';
				}
			},
			dayClass(day) {
				let cls = '';
				let px = this.currentPeriod;
				if (this.selection)
					px = uPeriod.create('custom', this.currentPeriod.From, this.selectEnd);
				if (px.in(day))
					cls += ' active';
				if (px.From.getTime() === day.getTime())
					cls += ' period-start';
				if (px.To.getTime() === day.getTime())
					cls += ' period-end';
				return cls;
			},
			close() {
				this.isOpen = false;
			},
			apply() {
				// apply period here
				if (!this.period.equal(this.currentPeriod)) {
					this.period.assign(this.currentPeriod);
					this.fireEvent();
				}
				this.isOpen = false;
			},
			fireEvent() {
				if (this.callback)
					this.callback(this.period);
				let root = this.item.$root;
				if (!root) return;
				let eventName = this.item._path_ + '.' + this.prop + '.change';
				root.$emit(eventName, this.item, this.period, null);
			},
			toggle(ev) {
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					this.modelDate = this.period.To; // TODO: calc start month
					if (this.modelDate.isZero() || this.modelDate.getTime() === utils.date.maxDate.getTime())
						this.modelDate = utils.date.today();
					this.currentPeriod.assign(this.period);
					this.selection = '';
					this.selectEnd = utils.date.zero();
				}
				this.isOpen = !this.isOpen;
			},
			__clickOutside() {
				this.isOpen = false;
			},
			isSelectedMenu(key) {
				let p = uPeriod.create(key);
				return p.equal(this.currentPeriod);
			},
			selectMenu(key) {
				let p = uPeriod.create(key);
				this.currentPeriod.assign(p);
				this.apply();
			},
			mouseHover(day) {
				if (!this.selection) return;
				if (this.selectEnd.getTime() === day.getTime()) return;
				clearTimeout(this.timerId);
				this.timerId = setTimeout(() => {
					this.selectEnd = day;
				}, DEFAULT_DEBOUNCE);
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();


// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210127-7744*/
// components/selector.js

/*TODO*/

(function selector_component() {
	const popup = require('std:popup');
	const utils = require('std:utils');
	const platform = require('std:platform');
	const locale = window.$$locale;
	const eventBus = require('std:eventBus');

	const baseControl = component('control');

	const DEFAULT_DELAY = 300;

	Vue.component('a2-selector', {
		extends: baseControl,
		template: `
<div :class="cssClass2()"  :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<div v-if="isCombo" class="selector-combo" @click.stop.prevent="open"><span tabindex="-1" class="select-text" v-text="valueText" @keydown="keyDown" ref="xcombo"/></div>
		<input v-focus v-model="query" :class="inputClass" :placeholder="placeholder" v-else
			@input="debouncedUpdate" @blur.stop="blur" @keydown="keyDown" @keyup="keyUp" ref="input" 
			:disabled="disabled" @click="clickInput($event)"/>
		<slot></slot>
		<a class="selector-open" href="" @click.stop.prevent="open" v-if="caret"><span class="caret"></span></a>
		<a class="selector-clear" href="" @click.stop.prevent="clear" v-if="clearVisible">&#x2715</a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="selector-pane" v-if="isOpen" ref="pane" :class="paneClass">
			<div class="selector-body" :style="bodyStyle">
				<slot name="pane" :items="items" :is-item-active="isItemActive" :item-name="itemName" :hit="hit" :slotStyle="slotStyle">
					<ul class="selector-ul">
						<li @mousedown.prevent="hit(itm)" :class="{active: isItemActive(itmIndex)}"
							v-for="(itm, itmIndex) in items" :key="itmIndex" v-text="itemName(itm)">}</li>
					</ul>
				</slot>
			</div>
			<a v-if='canNew' class="create-elem a2-hyperlink a2-inline" @mousedown.stop.prevent="doNew()"><i class="ico ico-plus"/> <span v-text="newText"></span></a>
		</div>
		<div class="selector-pane" v-if="isOpenNew" @click.stop.prevent="dummy">
			<slot name="new-pane"></slot>
		</div>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			itemsSource: Array,
			textItem: Object,
			textProp: String,
			display: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			delay: Number,
			minChars: Number,
			fetch: Function,
			hitfunc: Function,
			listWidth: String,
			listHeight: String,
			createNew: Function,
			placement: String,
			caret: Boolean,
			hasClear: Boolean,
			mode: String
		},
		data() {
			return {
				isOpen: false,
				isOpenNew: false,
				loading: false,
				items: [],
				query: '',
				filter: '',
				current: -1
			};
		},
		computed: {
			valueText() {
				if (!this.item) return '';
				if (this.hasText) {
					let el = this.item[this.prop];
					if (el.$isEmpty)
						return this.textItem[this.textProp];
				}
				let el = this.item[this.prop];
				if (utils.isNumber(el) && this.itemsSource) {
					el = this.itemsSource.find(x => x.$id === el);
					if (!el) return '';
				}
				return utils.simpleEval(el, this.display);
			},
			canNew() {
				return !!this.createNew;
			},
			clearVisible() {
				if (!this.hasClear) return false;
				let to = this.item[this.prop];
				return to && utils.isDefined(to) && !to.$isEmpty;
			},
			hasText() { return !!this.textProp; },
			newText() {
				return `${locale.$CreateLC} "${this.query}"`;
			},
			pane() {
				return {
					items: this.items,
					isItemActive: this.isItemActive,
					itemName: this.itemName,
					hit: this.hit
				};
			},
			paneClass() {
				if (this.placement)
					return "panel-" + this.placement;
			},
			bodyStyle() {
				let s = {};
				if (this.listWidth) {
					s.minWidth = this.listWidth;
				}
				if (this.listHeight)
					s.maxHeight = this.listHeight;
				return s;
			},
			slotStyle() {
				let r = {};
				if (this.listWidth) {
					r.width = this.listWidth;
					r.minWidth = this.listWidth;
				}
				if (this.listHeight)
					r.maxHeight = this.maxHeight;
				return r;
			},
			debouncedUpdate() {
				let delay = this.delay || DEFAULT_DELAY;
				return utils.debounce(() => {
					this.current = -1;
					this.filter = this.query;
					this.update();
				}, delay);
			},
			isCombo() {
				return this.mode === 'combo-box' || this.mode === 'hyperlink';
			}
		},
		watch: {
			valueText(newVal) {
				if (this.hasText) {
					let el = this.item[this.prop];
					if (!el.$isEmpty)
						this.textItem[this.textProp] = ''; // clear text
				}
				this.query = this.valueText;
			}
		},
		methods: {
			dummy() {

			},
			__clickOutside() {
				this.isOpen = false;
				this.isOpenNew = false;
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen || this.isOpenNew)
					cx += ' open';
				if (this.mode === 'hyperlink')
					cx += ' selector-hyperlink';
				else if (this.mode === 'combo-box')
					cx += ' selector-combobox';
				return cx;
			},
			isItemActive(ix) {
				return ix === this.current;
			},
			itemName(itm) {
				return utils.simpleEval(itm, this.display);
			},
			blur() {
				let text = this.query;
				if (this.hasText && text !== this.valueText) {
					let to = this.item[this.prop];
					if (to && to.$empty)
						to.$empty();
					this.textItem[this.textProp] = text;
				}
				this.cancel();
			},
			open() {
				if (!this.isOpen) {
					eventBus.$emit('closeAllPopups');
					if (this.current != -1)
						this.$nextTick(() => this.scrollIntoView());
						//setTimeout(, 0);
					this.doFetch(this.valueText, true);
					if (this.isCombo) {
						let combo = this.$refs['xcombo'];
						if (combo)
							combo.focus();
					} else {
						let input = this.$refs['input'];
						if (input)
							input.focus();
					}
				}
				this.isOpen = !this.isOpen;
			},
			cancel() {
				this.query = this.valueText;
				this.isOpen = false;
			},
			keyUp(event) {
				if (this.isOpen && event.which === 27) {
					event.preventDefault();
					event.stopPropagation();
					this.cancel();
				} else if (event.which === 13) {
					if (this.hasText)
						this.blur();
				}
			},
			clickInput(event) {
				if (this.caret && !this.isOpen) {
					event.stopPropagation();
					event.preventDefault();
					this.open();
				}
			},
			keyDown(event) {
				if (!this.isOpen) {
					if (event.which === 115)
						this.open();
					return;
				}
				event.stopPropagation();
				switch (event.which) {
					case 27: // esc
						event.preventDefault();
						break;
					case 13: // enter
						if (this.current === -1) return;
						this.hit(this.items[this.current]);
						break;
					case 40: // down
						event.preventDefault();
						this.current += 1;
						if (this.current >= this.items.length)
							this.current = 0;
						this.query = this.itemName(this.items[this.current]);
						this.scrollIntoView();
						break;
					case 38: // up
						event.preventDefault();
						this.current -= 1;
						if (this.current < 0)
							this.current = this.items.length - 1;
						this.query = this.itemName(this.items[this.current]);
						this.scrollIntoView();
						break;
					case 115: // F4
						this.cancel();
						break;
					default:
						return;
				}
			},
			hit(itm) {
				let obj = this.item[this.prop];
				this.query = this.valueText;
				this.isOpen = false;
				this.isOpenNew = false;
				this.current = this.items.indexOf(itm);
				this.$nextTick(() => {
					if (this.hitfunc) {
						this.hitfunc.call(this.item.$root, itm);
						return;
					}
					if (obj && obj.$merge)
						obj.$merge(itm, true /*fire*/);
					else if (utils.isNumber(obj))
						this.item[this.prop] = itm.$id;
					else
						platform.set(this.item, this.prop, itm);
				});
			},
			clear() {
				this.query = '';
				this.isOpen = false;
				this.isOpenNew = false;
				let obj = this.item[this.prop];
				if (obj.$empty)
					obj.$empty();
			},
			scrollIntoView() {
				this.$nextTick(() => {
					let pane = this.$refs['pane'];
					if (!pane) return;
					let elem = pane.querySelector('.active');
					if (!elem) return;
					elem.scrollIntoView(false);
				});
			},
			update() {
				let text = this.query || '';
				let chars = +(this.minChars || 0);
				if (chars && text.length < chars) return;
				//this.items = [];
				this.isOpen = true;
				this.isOpenNew = false;
				if (text === '') {
					this.clear();
					return;
				}
				this.doFetch(text, false);
			},
			doFetch(text, all) {
				if (this.itemsSource) {
					if (!this.items.length)
						this.items = this.itemsSource;
					let fi = -1;
					let el = this.item[this.prop];
					if (utils.isNumber(el))
						fi = this.items.findIndex(x => x.Id === el);
					else
						fi = this.items.indexOf(el);
					if (fi !== -1) {
						this.current = fi;
						setTimeout(() => this.scrollIntoView(), 10);
					}
					return;
				}
				this.loading = true;
				let fData = this.fetchData(text, all);
				if (fData.then) {
					// promise
					fData.then((result) => {
						this.loading = false;
						// first property from result
						let prop = Object.keys(result)[0];
						this.items = result[prop];
					}).catch(() => {
						this.items = [];
					});
				} else {
					if (utils.isArray(fData)) {
						if (this.items != fData) {
							if (this.items.length != fData.length)
								this.current = -1; // reset current element
							this.items = fData;
						}
					}
				}
			},
			fetchData(text, all) {
				if (!this.fetch)
					console.error('Selector. Fetch not defined');
				all = all || false;
				let elem = this.item[this.prop];
				if (elem && !('$vm' in elem))
					elem.$vm = this.$root; // plain object hack
				return this.fetch.call(this.item.$root, elem, text, all);
			},
			doNew() {
				this.isOpen = false;
				if (this.createNew) {
					let elem = this.item[this.prop];
					let arg = {
						elem: elem,
						text: this.query
					};
					this.createNew(arg);
				}
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.query = this.valueText;
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();
// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210127-7744
// components/datagrid.js*/

(function () {

	/**
	 * Some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable
	 * Groupings. "v-show" on a line is much faster than "v-if" on an entire template.
	 */

	/*TODO:
   7. Доделать checked
   10.
   */


	const utils = require('std:utils');
	const log = require('std:log');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const eqlower = utils.text.equalNoCase;

	/* group marker
				<th v-if="isGrouping" class="group-cell" style="display:none">
					<div class="h-group">
						<a @click.prevent="expandGroups(gi)" v-for="gi in $groupCount" v-text='gi' /><a
							@click.prevent="expandGroups($groupCount + 1)" v-text='$groupCount + 1' />
					</div>
				</th>
			<col v-if="isGrouping" class="fit"/>
	 */

	const dataGridTemplate = `
<div v-lazy="itemsSource" :class="{'data-grid-container':true, 'fixed-header': fixedHeader, 'bordered': border}" :test-id="testId">
	<div class="data-grid-header-border" v-if="fixedHeader" />
	<div :class="{'data-grid-body': true, 'fixed-header': fixedHeader}">
	<div class="data-grid-empty" v-if="$isEmpty">
		<slot name="empty" />
	</div>
	<table :class="cssClass">
		<colgroup>
			<col v-if="isMarkCell" class="fit"/>
			<col v-if="isRowDetailsCell" class="fit" />
			<col v-bind:class="columnClass(col)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
		</colgroup>
		<thead>
			<tr v-show="isHeaderVisible">
				<th v-if="isMarkCell" class="marker"><div v-if="fixedHeader" class="h-holder">&#160;</div></th>
				<th v-if="isRowDetailsCell" class="details-marker"><div v-if="fixedHeader" class="h-holder">&#160;</div></th>
				<slot></slot>
			</tr>
		</thead>
		<template v-if="isGrouping">
			<tbody>
				<template v-for="(g, gIndex) of $groups">
					<tr v-if="isGroupGroupVisible(g)" :class="'group lev-' + g.level" :key="gIndex">
						<td @click.prevent='toggleGroup(g)' :colspan="groupColumns">
						<span :class="{expmark: true, expanded: g.expanded}" />
						<span class="grtitle" v-text="groupTitle(g)" />
						<span v-if="isGroupCountVisible(g)" class="grcount" v-text="g.count" /></td>
					</tr>
					<template v-for="(row, rowIndex) in g.items">
						<data-grid-row v-show="isGroupBodyVisible(g)" :group="true" :level="g.level" :cols="columns" :row="row" :key="gIndex + ':' + rowIndex" :index="rowIndex" :mark="mark" ref="row" />
						<data-grid-row-details v-if="rowDetails" v-show="isGroupBodyVisible(g)" :cols="columns.length" :row="row" :key="'rd:' + gIndex + ':' + rowIndex" :mark="mark">
							<slot name="row-details" :row="row"></slot>
						</data-grid-row-details>
					</template>
				</template>
			</tbody>
		</template>
		<template v-else>
			<tbody>
				<template v-for="(item, rowIndex) in $items">
					<data-grid-row :cols="columns" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark" ref="row" :is-item-active="isItemActive" :hit-item="hitItem"/>
					<data-grid-row-details v-if="rowDetails" :cols="columns.length" :row="item" :key="'rd:' + rowIndex" :mark="mark">
						<slot name="row-details" :row="item"></slot>
					</data-grid-row-details>
				</template>
			</tbody>
		</template>
		<slot name="footer"></slot>
	</table>
	</div>
</div>
`;

	/* @click.prevent disables checkboxes & other controls in cells 
	<td class="group-marker" v-if="group"></td>

	@mousedown.prevent???? зачем то было???
	 */
	const dataGridRowTemplate = `
<tr @click="rowSelect(row)" :class="rowClass()" v-on:dblclick.prevent="doDblClick" ref="tr" @mousedown="mouseDown(row)">
	<td v-if="isMarkCell" class="marker">
		<div :class="markClass"></div>
	</td>
	<td v-if="detailsMarker" class="details-marker" @click.prevent="toggleDetails">
		<i v-if="detailsIcon" class="ico" :class="detailsExpandClass" />
	</td>
	<data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index" />
</tr>`;

	const dataGridRowDetailsTemplate = `
<tr v-if="visible()" class="row-details">
	<td v-if="isMarkCell" class="marker">
		<div :class="markClass"></div>
	</td>
	<td :colspan='totalCols' class="details-cell">
		<div class="details-wrapper"><slot></slot></div>
	</td>
</tr>
`;
    /**
        icon on header!!!
		<i :class="\'ico ico-\' + icon" v-if="icon"></i>
     */
	const dataGridColumnTemplate = `
<th :class="cssClass" @click.prevent="doSort">
	<div class="h-fill" v-if="fixedHeader" v-text="headerText">
	</div><div class="h-holder">
		<slot>{{headerText}}</slot>
	</div>
</th>
`;

	const dataGridColumn = {
		name: 'data-grid-column',
		template: dataGridColumnTemplate,
		props: {
			header: String,
			content: String,
			dataType: String,
			hideZeros: Boolean,
			format: String,
			icon: String,
			bindIcon: String,
			id: String,
			align: { type: String, default: 'left' },
			editable: { type: Boolean, default: false },
			noPadding: { type: Boolean, default: false },
			validate: String,
			sort: { type: Boolean, default: undefined },
			sortProp: String,
			small: { type: Boolean, default: undefined },
			bold: String, //{ type: Boolean, default: undefined },
			mark: String,
			controlType: String,
			width: String,
			fit: Boolean,
			wrap: String,
			command: Object
		},
		created() {
			this.$parent.$addColumn(this);
		},
		destroyed() {
			this.$parent.$removeColumn(this);
		},
		computed: {
			sortProperty() {
				return this.sortProp || this.content;
			},
			dir() {
				return this.$parent.sortDir(this.sortProperty);
			},
			fixedHeader() {
				return this.$parent.fixedHeader;
			},
			isSortable() {
				if (!this.sortProperty)
					return false;
				return typeof this.sort === 'undefined' ? this.$parent.isGridSortable : this.sort;
			},
			isUpdateUrl() {
				return !this.$root.inDialog;
			},
			template() {
				return this.id ? this.$parent.$scopedSlots[this.id] : null;
			},
			classAlign() {
				return this.align !== 'left' ? (' text-' + this.align).toLowerCase() : '';
			},
			cssClass() {
				let cssClass = this.classAlign;
				if (this.isSortable) {
					cssClass += ' sort';
					if (this.dir)
						cssClass += ' ' + this.dir;
				}
				return cssClass;
			},
			headerText() {
				return this.header || '\xa0';
			},
			evalOpts() {
				return {
					hideZeros: this.hideZeros,
					format: this.format
				};
			}
		},
		methods: {
			doSort() {
				if (!this.isSortable)
					return;
				this.$parent.doSort(this.sortProperty);
			},
			cellCssClass(row, editable) {
				let cssClass = this.classAlign;

				if (this.mark) {
					let mark = utils.simpleEval(row, this.mark);
					if (mark)
						cssClass += ' ' + mark;
				}
				if (editable && this.controlType !== 'checkbox')
					cssClass += ' cell-editable';

				function addClassBool(bind, cls) {
					if (!bind) return;
					if (bind === 'true')
						cssClass += cls;
					else if (bind.startsWith('{')) {
						var prop = bind.substring(1, bind.length - 1);
						if (utils.simpleEval(row, prop))
							cssClass += cls;
					}
				}

				if (this.wrap)
					cssClass += ' ' + this.wrap;
				if (this.small)
					cssClass += ' small';
				addClassBool(this.bold, ' bold');
				return cssClass.trim();
			}
		}
	};

	Vue.component('data-grid-column', dataGridColumn);

	const dataGridCell = {
		functional: true,
		name: 'data-grid-cell',
		props: {
			row: Object,
			col: Object,
			index: Number
		},
		render(h, ctx) {
			//console.warn('render cell');
			let tag = 'td';
			let row = ctx.props.row;
			let col = ctx.props.col;
			let ix = ctx.props.index;
			let cellProps = {
				'class': col.cellCssClass(row, col.editable || col.noPadding)
			};

			let childProps = {
				props: {
					row: row,
					col: col
				}
			};
			if (col.template) {
				let vNode = col.template(childProps.props);
				return h(tag, cellProps, [vNode]);
			}

			if (col.controlType === 'validator') {
				let cellValid = {
					props: ['item', 'col'],
					template: '<span><i v-if="item.$invalid" class="ico ico-error"></i></span>'
				};
				cellProps.class = { 'cell-validator': true };
				return h(tag, cellProps, [h(cellValid, { props: { item: row, col: col } })]);
			}

			if (!col.content && !col.icon && !col.bindIcon) {
				return h(tag, cellProps);
			}

			let validator = {
				props: ['path', 'item'],
				template: '<validator :path="path" :item="item"></validator>'
			};

			let validatorProps = {
				props: {
					path: col.validate,
					item: row
				}
			};

			function normalizeArg(arg, doEval) {
				if (utils.isBoolean(arg) || utils.isNumber(arg) || utils.isObjectExact(arg))
					return arg;
				arg = arg || '';
				if (arg === 'this')
					arg = row;
				else if (arg.startsWith('{')) {
					arg = arg.substring(1, arg.length - 1);
					if (arg.indexOf('.') !== -1)
						arg = utils.eval(row, arg);
					else {
						if (!(arg in row))
							throw new Error(`Property '${arg}' not found in ${row.constructor.name} object`);
						arg = row[arg];
					}
				} else if (arg && doEval) {
					arg = utils.eval(row, arg, col.dataType, col.evalOpts);
				}
				return arg;
			}

			if (col.command) {
				// column command -> hyperlink
				// arg1. command
				let arg1 = normalizeArg(col.command.arg1, false);
				let arg2 = normalizeArg(col.command.arg2, col.command.eval);
				let arg3 = normalizeArg(col.command.arg3, false);
				let arg4 = col.command.arg4; // without normalize
				let child = {
					props: ['row', 'col'],
					/*@click.prevent, no stop*/
					template: '<a @click.prevent="doCommand($event)" :href="getHref()"><i v-if="hasIcon" :class="iconClass" class="ico"></i><span v-text="eval(row, col.content, col.dataType, col.evalOpts)"></span></a>',
					computed: {
						hasIcon() { return col.icon || col.bindIcon; },
						iconClass() {
							let icoSingle = !col.content ? ' ico-single' : '';
							if (col.bindIcon)
								return 'ico-' + utils.eval(row, col.bindIcon) + icoSingle;
							else if (col.icon)
								return 'ico-' + col.icon + icoSingle;
							return null;
						}
					},
					methods: {
						doCommand(ev) {
							//console.dir(`cell click: x:${ev.x}, y:${ev.y}`);
							col.command.cmd(arg1, arg2, arg3, arg4);
						},
						eval: utils.eval,
						getHref() {
							if (!col.command) return null;
							if (col.command.isDialog)
								return null;
							if (col.command.cmd.name.indexOf('$exec') !== -1)
								return null;
							let id = arg2;
							if (utils.isObjectExact(arg2))
								id = arg2.$id;
							return arg1 + '/' + id;
						}
					}
				};
				return h(tag, cellProps, [h(child, childProps)]);
			}
			/* simple content */
			if (col.content === '$index')
				return h(tag, cellProps, [ix + 1]);

			function isNegativeRed(col) {
				if (col.dataType === 'Number' || col.dataType === 'Currency') {
					let val = utils.eval(row, col.content, col.dataType, col.evalOpts, true /*skip format*/);
					if (val < 0)
						return true;
				}
				return false;
			}

			let content = utils.eval(row, col.content, col.dataType, col.evalOpts);
			let chElems = [h('span', { 'class': { 'dg-cell': true, 'negative-red': isNegativeRed(col) } }, content)];
			let icoSingle = !col.content ? ' ico-single' : '';
			if (col.icon)
				chElems.unshift(h('i', { 'class': 'ico ico-' + col.icon + icoSingle }));
			else if (col.bindIcon)
				chElems.unshift(h('i', { 'class': 'ico ico-' + utils.eval(row, col.bindIcon) + icoSingle }));
			/*TODO: validate ???? */
			if (col.validate) {
				chElems.push(h(validator, validatorProps));
			}
			return h(tag, cellProps, chElems);
		}
	};

	const dataGridRow = {
		name: 'data-grid-row',
		template: dataGridRowTemplate,
		components: {
			'data-grid-cell': dataGridCell
		},
		props: {
			row: Object,
			cols: Array,
			index: Number,
			mark: String,
			group: Boolean,
			level: Number,
			isItemActive: Function,
			hitItem: Function
		},
		computed: {
			isMarkCell() {
				return this.$parent.isMarkCell;
			},
			detailsMarker() {
				return this.$parent.isRowDetailsCell;
			},
			detailsIcon() {
				if (!this.detailsMarker)
					return false;
				let prdv = this.$parent.rowDetailsVisible;
				if (prdv === false) return true; // property not specified
				return prdv && this.row[prdv];
			},
			detailsExpandClass() {
				return this.row._uiprops_.$details ? "ico-minus-circle" : "ico-plus-circle";
			},
			totalColumns() {
				console.error('implement me');
			},
			markClass() {
				return this.mark ? utils.simpleEval(this.row, this.mark) : '';
			}
		},
		methods: {
			rowClass() {
				let cssClass = 'dg-row';
				const isActive = this.isItemActive ? this.isItemActive(this.index) : !!this.row.$selected;
				//console.warn(`i = ${this.index} l = ${this.row.$parent.length}`);
				if (isActive) cssClass += ' active';
				if (this.$parent.isMarkRow && this.mark) {
					cssClass += ' ' + utils.simpleEval(this.row, this.mark);
				}
				if ((this.index + 1) % 2)
					cssClass += ' even';
				if (this.$parent.rowBold && this.row[this.$parent.rowBold])
					cssClass += ' bold';
				if (this.level)
					cssClass += ' lev-' + this.level;
				return cssClass.trim();
			},
			rowSelect(row) {
				//console.dir('row select');
				if (row.$select)
					row.$select();
			},
			mouseDown(row) {
				//console.dir('row select mouse down');
				if (this.hitItem)
					this.hitItem(row);
			},
			doDblClick($event) {
				// deselect text
				$event.stopImmediatePropagation();
				if (!this.$parent.doubleclick)
					return;
				window.getSelection().removeAllRanges();
				this.$parent.doubleclick();
			},
			toggleDetails($event) {
				//$event.stopImmediatePropagation();
				if (!this.detailsIcon) return;
				Vue.set(this.row._uiprops_, "$details", !this.row._uiprops_.$details);
			}
		}
	};

	const dataGridRowDetails = {
		name: 'data-grid-row-details',
		template: dataGridRowDetailsTemplate,
		props: {
			cols: Number,
			row: Object,
			mark: String
		},
		computed: {
			isMarkCell() {
				return this.$parent.isMarkCell;
			},
			markClass() {
				return this.mark ? utils.simpleEval(this.row, this.mark) : '';
			},
			detailsMarker() {
				return this.$parent.isRowDetailsCell;
			},
			totalCols() {
				return this.cols +
					(this.isMarkCell ? 1 : 0) +
					(this.detailsMarker ? 1 : 0);
			}
		},
		methods: {
			visible() {
				if (this.$parent.isRowDetailsCell)
					return this.row._uiprops_.$details ? true : false;
				return this.row === this.$parent.selected();
			}
		}
	};

	Vue.component('data-grid', {
		props: {
			'items-source': [Object, Array],
			border: Boolean,
			grid: String,
			fixedHeader: Boolean,
			hideHeader: Boolean,
			hover: {
				type: Boolean, default: undefined
			},
			striped: {
				type: Boolean,
				default: undefined
			},
			compact: Boolean,
			sort: Boolean,
			routeQuery: Object,
			mark: String,
			filterFields: String,
			markStyle: String,
			rowBold: String,
			doubleclick: Function,
			groupBy: [Array, Object, String],
			rowDetails: Boolean,
			rowDetailsActivate: String,
			rowDetailsVisible: [String /*path*/, Boolean],
			isItemActive: Function,
			hitItem: Function,
			emptyPanelCallback: Function,
			testId: String
		},
		template: dataGridTemplate,
		components: {
			'data-grid-row': dataGridRow,
			'data-grid-row-details': dataGridRowDetails
		},
		data() {
			return {
				columns: [],
				clientItems: null,
				clientGroups: null,
				localSort: {
					dir: 'asc',
					order: ''
				}
			};
		},
		computed: {
			$items() {
				return this.clientItems ? this.clientItems : this.itemsSource;
			},
			isMarkCell() {
				return this.markStyle === 'marker' || this.markStyle === 'both';
			},
			isRowDetailsCell() {
				return this.rowDetails && this.rowDetailsActivate === 'cell';
			},
			isMarkRow() {
				return this.markStyle === 'row' || this.markStyle === 'both';
			},
			isHeaderVisible() {
				return !this.hideHeader;
			},
			cssClass() {
				let cssClass = 'data-grid';
				if (this.grid) cssClass += ' grid-' + this.grid.toLowerCase();
				if (this.striped != undefined)
					cssClass += this.striped ? ' striped' : ' no-striped';
				if (this.hover != undefined)
					cssClass += this.hover ? ' hover' : ' no-hover';
				if (this.compact) cssClass += ' compact';
				return cssClass;
			},
			isGridSortable() {
				return !!this.sort;
			},
			isLocal() {
				return !this.$parent.sortDir;
			},
			isGrouping() {
				return this.groupBy;
			},
			groupColumns() {
				return this.columns.length + //1 +
					(this.isMarkCell ? 1 : 0) +
					(this.isRowDetailsCell ? 1 : 0);
			},
			$groupCount() {
				if (utils.isString(this.groupBy))
					return this.groupBy.split('-').length;
				else if (utils.isObjectExact(this.groupBy))
					return 1;
				else
					return this.groupBy.length;
			},
			$groups() {
				function* enumGroups(src, p0, lev, cnt) {
					for (let grKey in src) {
						if (grKey === 'items') continue;
						let srcElem = src[grKey];
						let count = srcElem.items ? srcElem.items.length : 0;
						if (cnt)
							cnt.c += count;
						let pElem = {
							group: grKey,
							p0: p0,
							expanded: true,
							level: lev,
							items: srcElem.items || null,
							count: count
						};
						yield pElem;
						if (!src.items) {
							let cnt = { c: 0 };
							yield* enumGroups(srcElem, pElem, lev + 1, cnt);
							pElem.count += cnt.c;
						}
					}
				}
				//console.dir(this.clientGroups);
				this.doSortLocally();
				// classic tree
				let startTime = performance.now();
				let grmap = {};
				let grBy = this.groupBy;
				if (utils.isString(grBy)) {
					let rarr = [];
					for (let vs of grBy.split('-'))
						rarr.push({ prop: vs.trim(), count: true });
					grBy = rarr;
				}
				else if (utils.isObjectExact(grBy))
					grBy = [grBy];
				if (!this.$items) return null;
				for (let itm of this.$items) {
					let root = grmap;
					for (let gr of grBy) {
						let key = utils.eval(itm, gr.prop);
						if (utils.isDate(key))
							key = utils.format(key, "Date");
						if (!utils.isDefined(key)) key = '';
						if (key === '') key = locale.$Unknown || "Unknown";
						if (!(key in root)) root[key] = {};
						root = root[key];
					}
					if (!root.items)
						root.items = [];
					root.items.push(itm);
				}
				// tree to plain array
				let grArray = [];
				for (let el of enumGroups(grmap, null, 1)) {
					el.source = grBy[el.level - 1];
					if (el.source.expanded === false)
						el.expanded = false;
					grArray.push(el);
				}
				this.clientGroups = grArray;
				log.time('datagrid grouping time:', startTime);
				return this.clientGroups;
			},
			$isEmpty() {
				if (!this.itemsSource) return false;
				let mi = this.itemsSource.$ModelInfo;
				if (!mi) return false;
				if ('HasRows' in mi) {
					if (this.itemsSource.length)
						return false;
					return mi.HasRows === false;
				} else {
					return this.itemsSource.length === 0;
				}
				return false;
			}
		},
		watch: {
			localSort: {
				handler() {
					this.handleSort();
				},
				deep: true
			},
			'itemsSource.length'() {
				this.handleSort();
			},
			'$isEmpty'(newval, oldval) {
				if (this.emptyPanelCallback)
					this.emptyPanelCallback.call(this.$root.$data, newval);
			}
		},
		methods: {
			selected() {
				let src = this.itemsSource;
				if (src.$origin) {
					src = src.$origin;
				}
				return src.$selected;
			},
			$addColumn(column) {
				this.columns.push(column);
			},
			$removeColumn(column) {
				let ix = this.columns.indexOf(column);
				if (ix !== -1)
					this.columns.splice(ix, 1);
			},
			columnClass(column) {
				let cls = '';
				if (column.fit || column.controlType === 'validator')
					cls += 'fit';
				if (this.sort && column.isSortable && utils.isDefined(column.dir))
					cls += ' sorted';
				return cls;
			},
			columnStyle(column) {
				return {
					width: utils.isDefined(column.width) ? column.width : undefined
				};
			},
			doSort(order) {
				// TODO: // collectionView || locally
				if (this.isLocal) {
					if (eqlower(this.localSort.order, order))
						this.localSort.dir = eqlower(this.localSort.dir, 'asc') ? 'desc' : 'asc';
					else {
						this.localSort = { order: order, dir: 'asc' };
					}
				} else {
					this.$parent.$emit('sort', order);
				}
			},
			sortDir(order) {
				// TODO: 
				if (this.isLocal)
					return eqlower(this.localSort.order, order) ? this.localSort.dir : undefined;
				else
					return this.$parent.sortDir(order);
			},
			doSortLocally() {
				if (!this.isLocal) return;
				if (!this.localSort.order) return;
				let startTime = performance.now();
				let rev = this.localSort.dir === 'desc';
				let sortProp = this.localSort.order;
				let arr = [].concat(this.itemsSource);
				arr.sort((a, b) => {
					let av = a[sortProp];
					let bv = b[sortProp];
					if (av === bv)
						return 0;
					else if (av < bv)
						return rev ? 1 : -1;
					else
						return rev ? -1 : 1;
				});
				log.time('datagrid sorting time:', startTime);
				this.clientItems = arr;
			},
			handleSort() {
				if (this.isGrouping)
					this.clientGroups = null;
				else
					this.doSortLocally();
			},
			toggleGroup(g) {
				g.expanded = !g.expanded;
			},
			isGroupCountVisible(g) {
				if (g && g.source && utils.isDefined(g.source.count))
					return g.source.count;
				return true;
			},
			isGroupGroupVisible(g) {
				if (!g.group)
					return false;
				if (!g.p0)
					return true;
				let cg = g.p0;
				while (cg) {
					if (!cg.expanded) return false;
					cg = cg.p0;
				}
				return true;
			},
			isGroupBodyVisible(g) {
				if (!g.expanded) return false;
				let cg = g.p0;
				while (cg) {
					if (!cg.expanded) return false;
					cg = cg.p0;
				}
				return true;
			},
			groupTitle(g) {
				if (g.source && g.source.title)
					return g.source.title
						.replace('{Value}', g.group)
						.replace('{Count}', g.count);
				return g.group;
			},
			expandGroups(lev) {
				// lev 1-based
				for (var gr of this.$groups)
					gr.expanded = gr.level < lev;
			},
			__invoke__test__(args) {
				args = args || {};
				if (args.target !== 'datagrid')
					return;
				if (args.testId !== this.testId)
					return;
				switch (args.action) {
					case 'selectRow':
						this.$items.forEach(e => {
							if (e.$id.toString() === args.id) {
								e.$select();
								args.result = 'success';
							}
						});
						break;
				}
			}
		},
		updated() {
			let src = this.itemsSource;
			if (!src) return;
			let ix = src.$selectedIndex;
			let rows = this.$refs.row;
			if (ix !== -1 && rows && ix < rows.length) {
				let tr = rows[ix].$refs.tr;
				tr.scrollIntoViewCheck();
			}
		},
		mounted() {
			if (this.testId)
				eventBus.$on('invokeTest', this.__invoke__test__);
		},
		beforeDestroy() {
			if (this.testId)
				eventBus.$off('invokeTest', this.__invoke__test__);
		}
	});
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200625-7676
/*components/pager.js*/


(function () {

/*
template: `
<div class="pager">
	<a href @click.prevent="source.first" :disabled="disabledFirst"><i class="ico ico-chevron-left-end"/></a>
	<a href @click.prevent="source.prev" :disabled="disabledPrev"><i class="ico ico-chevron-left"/></a>

	<a href v-for="b in middleButtons " @click.prevent="page(b)"><span v-text="b"></span></a>

	<a href @click.prevent="source.next"><i class="ico ico-chevron-right"/></a>
	<a href @click.prevent="source.last"><i class="ico ico-chevron-right-end"/></a>
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}} count={{source.sourceCount}}</code>
</div>
*/

	const locale = window.$$locale;
	const eventBus = require('std:eventBus');

	Vue.component('a2-pager', {
		props: {
			source: Object,
			emptyText: String,
			templateText: String
		},
		computed: {
			pages() {
				return Math.ceil(this.count / this.source.pageSize);
			},
			currentPage() {
				return Math.ceil(this.offset / this.source.pageSize) + 1;
			},
			title() {
				if (!this.count)
					return this.emptyString;
				return this.textString;
			},
			emptyString() {
				return this.emptyText ? this.emptyText : locale.$NoElements;
			},
			textString() {
				let lastNo = Math.min(this.count, this.offset + this.source.pageSize);
				if (this.templateText)
					return this.templateText
						.replace(/\#\[Start\]/g, this.offset + 1)
						.replace(/\#\[End\]/g, lastNo)
						.replace(/\#\[Count\]/g, this.count);
				else
					return `${locale.$PagerElements}: <b>${this.offset + 1}</b>-<b>${lastNo}</b> ${locale.$Of} <b>${this.count}</b>`;
			},
			offset() {
				return +this.source.offset;
			},
			count() {
				return +this.source.sourceCount;
			}
		},
		methods: {
			setOffset(offset) {
				offset = +offset;
				if (this.offset === offset)
					return;
				eventBus.$emit('closeAllPopups');
				this.$nextTick(() => this.source.$setOffset(offset));
			},
			isActive(page) {
				return page === this.currentPage;
			},
			click(arg, $ev) {
				$ev.preventDefault();
				switch (arg) {
					case 'prev':
						this.setOffset(this.offset - this.source.pageSize);
						break;
					case 'next':
						this.setOffset(this.offset + this.source.pageSize);
						break;
				}
			},
			goto(page, $ev) {
				$ev.preventDefault();
				let offset = (page - 1) * this.source.pageSize;
				this.setOffset(offset);
			}
		},
		render(h, ctx) {
			if (this.source.pageSize === -1) return; // invisible
			let contProps = {
				class: 'a2-pager'
			};
			let children = [];
			const dotsClass = { 'class': 'a2-pager-dots' };
			const renderBtn = (page) => {
				return h('button', {
					domProps: { innerText: page },
					on: { click: ($ev) => this.goto(page, $ev) },
					class: { active: this.isActive(page) }
				});
			};
			// prev
			children.push(h('button', {
				on: { click: ($ev) => this.click('prev', $ev) },
				attrs: { disabled: this.offset === 0, 'aria-label': 'Previous page' }
			}, [h('i', { 'class': 'ico ico-chevron-left' })]
			));
			// first
			if (this.pages > 0)
				children.push(renderBtn(1));
			// middle
			let ms = 2;
			let me = this.pages - 1;
			if (this.pages == 2)
				me = 2;
			let sd = false, ed = false, cp = this.currentPage;
			let len = me - ms;
			if (len > 4) {
				if (cp > 4)
					sd = true;
				if (cp < this.pages - 3)
					ed = true;
				if (sd && !ed)
					ms = me - 3;
				else if (!sd && ed)
					me = ms + 3;
				 else if (sd && ed) {
					ms = cp - 1;
					me = cp + 1;
				}
			}
			if (sd)
				children.push(h('span', dotsClass, '...'));
			for (let mi = ms; mi <= me; ++mi)
				children.push(renderBtn(mi));
			if (ed)
				children.push(h('span', dotsClass, '...'));
			// last
			if (this.pages > 2)
				children.push(renderBtn(this.pages));
			// next
			children.push(h('button', {
				on: { click: ($ev) => this.click('next', $ev) },
				attrs: { disabled: this.currentPage >= this.pages, 'aria-label': 'Next Page' }
			},
				[h('i', { 'class': 'ico ico-chevron-right' })]
			));

			children.push(h('span', { class: 'a2-pager-divider' }));
			children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
			return h('div', contProps, children);
		}
	});
})();


// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

//20210104-7738
/*components/popover.js*/

Vue.component('popover', {
	template: `
<div v-dropdown class="popover-wrapper" :style="{top: top}" :class="{show: isShowHover}">
	<span toggle class="popover-title" v-on:mouseover="mouseover" v-on:mouseout="mouseout"><i v-if="hasIcon" :class="iconClass"></i> <span :title="title" v-text="content"></span><slot name="badge"></slot></span>
	<div class="popup-body" :style="{width: width, left:offsetLeft}">
		<div class="arrow" :style="{left:offsetArrowLeft}"/>
		<div v-if="visible">
			<include :src="popoverUrl"/>
		</div>
		<slot />
	</div>
</div>
`,
	/*
	1. If you add tabindex = "- 1" for 'toggle', then you can close it by 'blur'
	
	2. You can add a close button. It can be any element with a 'close-dropdown' attribute.
		For expample: <span class="close" close-dropdown style="float:right">x</span >
	*/

	data() {
		return {
			state: 'hidden',
			hoverstate: false,
			popoverUrl: ''
		};
	},
	props: {
		icon: String,
		url: String,
		content: [String, Number],
		title: String,
		width: String,
		top: String,
		hover: Boolean,
		offsetX: String
	},
	computed: {
		hasIcon() {
			return !!this.icon;
		},
		offsetLeft() {
			return this.offsetX || undefined;
		},
		offsetArrowLeft() {
			if (this.offsetX && this.offsetX.indexOf('-') === 0)
				return `calc(${this.offsetX.substring(1)} + 6px)`;
			return undefined;
		},
		iconClass() {
			let cls = "ico po-ico";
			if (this.icon)
				cls += ' ico-' + this.icon;
			return cls;
		},
		visible() {
			return this.url && this.state === 'shown';
		},
		isShowHover() {
			return this.hover && this.hoverstate ? 'show' : undefined;
		}
	},
	methods: {
		mouseover() {
			if (this.hover)
				this.hoverstate = true;
		},
		mouseout() {
			if (this.hover) {
				this.hoverstate = false;
				/*
				setTimeout(x => {
					this.hoverstate = false;
				}, 250);
				*/
			}
		}
	},
	mounted() {
		this.$el._show = () => {
			this.state = 'shown';
			if (this.url) {
				const urltools = require('std:url');
				let root = window.$$rootUrl;
				this.popoverUrl = urltools.combine(root, '/_popup', this.url);
			}
		};
		this.$el._hide = () => {
			this.state = 'hidden';
			this.popoverUrl = '';
		};
	}
});

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210131-7744*/
// components/treeview.js

(function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const platform = require('std:platform');

	//stop for toggle is required!

	const treeItemComponent = {
		name: 'tree-item',
		template: `
<li @click.stop.prevent="doClick(item)" :title=title v-on:dblclick.stop.prevent="doDblClick(item)"
	v-show=isItemVisible
	:class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected, folder:isFolder, group: isItemGroup}" >
	<div :class="{overlay:true, 'no-icons': !options.hasIcon}">
		<a class="toggle" v-if="isFolder" href @click.stop.prevent=toggle></a>
		<span v-else class="toggle"/>
		<i v-if="options.hasIcon" :class="iconClass"/>
		<a v-if="hasLink(item)" :href=dataHref tabindex="-1" v-text="item[options.label]" :class="{'no-wrap':!options.wrapLabel }"/>
		<span v-else v-text="item[options.label]" :class="{'tv-folder':true, 'no-wrap':!options.wrapLabel}"/>
	</div>
	<ul v-if=isFolder v-show=isExpanded>
		<tree-item v-for="(itm, index) in item[options.subitems]" :options="options"
			:key="index" :item="itm" :click="click" :doubleclick="doubleclick" :get-href="getHref" :is-active="isActive" :expand="expand" :root-items="rootItems">
		</tree-item>
	</ul>
</li>
`,
		props: {
			item: Object,
			options: Object,
			rootItems: Array,
			/* callbacks */
			click: Function,
			expand: Function,
			isActive: Function,
			isGroup: Function,
			getHref: Function,
			doubleclick: Function
		},
		methods: {
			isFolderSelect(item) {
				let fs = this.options.folderSelect;
				if (utils.isFunction(fs))
					return fs(item);
				return !!this.options.folderSelect;
			},
			doClick(item) {
				eventBus.$emit('closeAllPopups');
				if (this.isFolder && !this.isFolderSelect(item))
					this.toggle();
				else if ("$select" in item)
					item.$select(this.rootItems);
				else if (this.click)
					this.click(item);
			},
			doDblClick(item) {
				eventBus.$emit('closeAllPopups');
				if (this.isFolder && !this.isFolderSelect(item))
					return;
				if (this.doubleclick)
					this.doubleclick();
			},
			hasLink(item) {
				return !this.isFolder || this.isFolderSelect(item);
			},
			toggle() {
				// toggle with stop!
				eventBus.$emit('closeAllPopups');
				if (!this.isFolder)
					return;
				this.expandItem(!this.item.$expanded);
				if (this.expand) {
					this.expand(this.item, this.options.subitems);
				}
			},
			expandItem(val) {
				platform.set(this.item, '$expanded', val);
			},
			openElem: function() {
				if (!this.isFolder)
					return;
				this.expandItem(true);
			}
		},
		computed: {
			isFolder: function () {
				if (utils.isDefined(this.item.$hasChildren) && this.item.$hasChildren)
					return true;
				if (utils.isDefined(this.options.isFolder))
					return this.item[this.options.isFolder];
				let ch = this.item[this.options.subitems];
				return ch && ch.length;
			},
			isItemVisible: function () {
				let iv = this.options.isVisible;
				if (!iv) return true;
				return this.item[iv];
			},
			isExpanded: function () {
				return this.isFolder && this.item.$expanded;
			},
			isCollapsed: function () {
				return this.isFolder && !this.item.$expanded;
			},
			title() {
				var t = this.item[this.options.title];
				if (!t)
					t = this.item[this.options.label];
				return t;
			},
			isItemSelected: function () {
				if (this.item && "$selected" in this.item)
					return this.item.$selected;
				return this.isActive && this.isActive(this.item);
			},
			isItemGroup() {
				let gp = this.options ? this.options.isGroup : undefined;
				if (gp)
					return utils.eval(this.item, gp);
				else
					return this.isGroup && this.isGroup(this.item);
			},
			iconClass: function () {
				let icons = this.options.staticIcons;
				if (icons)
					return "ico ico-" + (this.isFolder ? icons[0] : icons[1]);
				if (this.options.icon) {
					let icon = this.item[this.options.icon];
					return icon ? "ico ico-" + (icon || 'empty') : '';
				}
				return undefined;
			},
			dataHref() {
				return this.getHref ? this.getHref(this.item) : '';
			}
		},
		watch: {
			isItemSelected(newVal) {
				if (newVal && this.$el.scrollIntoViewCheck)
					this.$el.scrollIntoViewCheck();
			}
		},
		updated(x) {
			// close expanded when reloaded
			if (this.item.$expanded) {
				if (this.item.$hasChildren) {
					let arr = this.item[this.options.subitems];
					if (!arr.$loaded) {
						this.expandItem(false);
					}
				}
			}
		}
	};

	Vue.component('tree-view', {
		components: {
			'tree-item': treeItemComponent
		},
		template: `
<ul class="tree-view">
	<tree-item v-for="(itm, index) in items" :options="options" :get-href="getHref"
		:item="itm" :key="index"
		:click="click" :doubleclick="doubleclick" :is-active="isActive" :is-group="isGroup" :expand="expand" :root-items="items">
	</tree-item>
</ul>`,
		props: {
			options: Object,
			items: Array,
			isActive: Function,
			isGroup: Function,
			click: Function,
			expand: Function,
			autoSelect: String,
			getHref: Function,
			expandFirstItem: Boolean,
			doubleclick: Function
		},
		computed: {
			isSelectFirstItem() {
				return this.autoSelect === 'first-item';
			}
		},
		watch: {
			items: function () {
				this.doExpandFirst();
			}
		},
		methods: {
			selectFirstItem() {
				if (!this.isSelectFirstItem) return;
				let itms = this.items;
				if (!itms.length) return;
				let fe = null;
				if (this.options && this.options.isVisible) {
					let vi = this.options.isVisible;
					fe = itms.$find(x => x[vi]);
				} else
					fe = itms[0];
				if (!fe) return;
				if (fe.$select)
					fe.$select(this.items);
			},
			doExpandFirst() {
				if (!this.expandFirstItem)
					return;
				this.$nextTick(() => {
					if (!this.$children)
						return;
					this.$children.forEach((val) => {
						if (val && val.openElem) {
							val.openElem();
						}
					});
				});
			}
		},
		created() {
			this.selectFirstItem();
			this.doExpandFirst();
		},
		updated() {
			if (this.isSelectFirstItem && !this.items.$selected) {
				this.selectFirstItem();
			}
		}
	});
})();

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200505-7654
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
				return this.ItemsSource.length;
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
			ItemsSource: Array,
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
			ItemsSource: Array,
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
					this.Filter[props.prop] = props.value;
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
		},
		beforeDestroy() {
			eventBus.$off('setFilter', this.__setFilter);
		}
	});

})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20201106-7720
// components/upload.js

(function () {

	const url = require('std:url');
	const http = require('std:http');
	const tools = require('std:tools');

	const locale = window.$$locale;

	Vue.component("a2-upload", {
		template: `
<label :class="cssClass" @dragover="dragOver" @dragleave="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadImage" v-bind:multiple="isMultiple" :accept="accept" />
	<i class="ico" :class="icoClass"></i>
	<span class="upload-tip" v-text="tip" v-if="tip"></span>
</label>
		`,
		props: {
			item: Object,
			prop: String,
			base: String,
			newItem: Boolean,
			tip: String,
			readOnly: Boolean,
			accept: String,
			limit: Number,
			icon: String
		},
		data: function () {
			return {
				hover: false
			};
		},
		computed: {
			cssClass() {
				return 'file-upload' + (this.hover ? ' hover' : '');
			},
			isMultiple() {
				return !!this.newItem;
			},
			canUpload() {
				return !this.readOnly;
			},
			icoClass() {
				if (this.icon)
					return `ico-${this.icon}`;
				return this.accept === 'image/*' ? 'ico-image' : 'ico-upload';
			}
		},
		methods: {
			dragOver(ev) {
				this.hover = true;
				ev.preventDefault();
			},
			dragLeave(ev) {
				this.hover = false;
				ev.preventDefault();
			},
			checkLimit(file) {
				if (!this.limit) return false;
				let sizeKB = file.size / 1024;
				return sizeKB > this.limit;
			},
			uploadImage(ev) {
				let root = window.$$rootUrl;
				let id = this.item[this.prop];
				let imgUrl = url.combine(root, '_image', this.base, this.prop, id);
				var fd = new FormData();
				for (let file of ev.target.files) {
					if (this.checkLimit(file)) {
						ev.target.value = ''; // clear current selection
						let msg = locale.$FileTooLarge.replace('{0}', this.limit);
						tools.alert(msg);
						return;
					}
					fd.append('file', file, file.name);
				}
				http.upload(imgUrl, fd).then((result) => {
					// result = {status: '', elems:[Id:0, Token:'']}
					ev.target.value = ''; // clear current selection
					let token = undefined;
					if (this.item._meta_)
						token = this.item._meta_.$token;
					if (result.status === 'OK') {
						if (this.newItem) {
							let p0 = this.item.$parent;
							for (let elem of result.elems) {
								let ni = p0.$append();
								ni[this.prop] = elem.Id;
								ni[token] = elem.Token;
							}
						} else {
							this.item[this.prop] = result.elems[0].Id;
							this.item[token] = result.elems[0].Token;
						}
					}
				}).catch(msg => {
					if (msg.indexOf('UI:') === 0)
						tools.alert(msg.substring(3).replace('\\n', '\n'));
					else
						alert(msg);
				});
			}
		}
	});

	Vue.component("a2-simple-upload", {
		template: `
<label class="a2-simple-upload" :class="labelClass">
	<i class="ico" :class='icon'></i>
	<input type="file" @change="uploadChange" ref="file"/>
	<span v-text="labelText" class="upload-text"></span>
	<button class="btnclose" @click.prevent="clear" v-if="file">&#x2715;</button>
</label>
		`,
		props: {
			item: Object,
			prop: String,
			text: String
		},
		data: function () {
			return {
			};
		},
		computed: {
			labelText() {
				if (this.file) return this.file.name;
				return this.text || locale.$ChooseFile;
			},
			icon() {
				return this.file && this.file.name ? 'ico-file' : 'ico-attach';
			},
			file() {
				return this.item ? this.item[this.prop] : null;
			},
			labelClass() {
				return this.file ? 'has-file' : undefined;
			}
		},
		methods: {
			fireChange() {
			},
			clear() {
				if (!this.item) return;
				this.item[this.prop] = null;
				this.fireChange();
				this.$refs.file.value = '';
			},
			uploadChange(ev) {
				let files = ev.target.files;
				this.item[this.prop] = files[0];
				this.fireChange();
			}
		}
	});

})();

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


/* 20180821-7280 */
/*components/tab.js*/

/*
TODO:

2. isActive with location hash
5. enable/disable tabs
7. много табов - добавить стрелки ?
10. default header for dynamic tab
*/

(function () {

    /*
    <ul class="tab-header">
        <li v-for="(itm, index) in tabs" :key="index">
            <span v-text="itm.header"></span>
        </li>
    </ul >
    */
	const utils = require('std:utils');

	const tabPanelTemplate = `
<div class="tab-panel">
	<template v-if="static">
		<ul class="tab-header">
			<li :class="tab.tabCssClass" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click.prevent="select(tab)" v-show="tab.isVisible">
				<i v-if="tab.hasIcon" :class="tab.iconCss" ></i>
				<span v-text="tab.header"></span><span class="badge" v-if="tab.hasBadge" v-text="tab.badge"></span>
				<i v-if="tab.isInvalid()" class="ico ico-error-outline"/>
			</li>
		</ul>
		<slot name="title" />
		<div class="tab-content" :class="contentCssClass">
			<slot />
		</div>
	</template>
	<template v-else>
		<ul class="tab-header">
			<li :class="{active: isActiveTab(item)}" v-for="(item, tabIndex) in items" :key="tabIndex" @click.prevent="select(item)" v-show="item.isVisible">
				<slot name="header" :item="item" :index="tabIndex" :number="tabIndex + 1">
					<span v-text="defaultTabHeader(item, tabIndex)"></span> 
				</slot>
			</li>
		</ul>
		<slot name="title" />
		<div class="tab-content">
			<div class="tab-item" v-if="isActiveTab(item)" v-for="(item, tabIndex) in items" :key="tabIndex">
				<slot name="items" :item="item" :index="tabIndex" />
			</div>
		</div>
	</template>
</div>
`;

	const tabItemTemplate = `
<div class="tab-item" v-show="isActive">
	<slot />
</div>
`;


	Vue.component('a2-tab-item', {
		name: 'a2-tab-item',
		template: tabItemTemplate,
		props: {
			header: String,
			badge: [String, Number, Object],
			icon: String,
			tabStyle: String,
			show: undefined,
			itemToValidate: Object,
			propToValidate: String
		},
		data() {
			return {
				controls:[]
			};
		},
		computed: {
			hasIcon() {
				return !!this.icon;
			},
			hasBadge() {
				return !!this.badge;
			},
			iconCss() {
				return this.icon ? "ico ico-" + this.icon : '';
			},
			isActive() {
				return this === this.$parent.activeTab;
			},
			tabCssClass() {
				return (this.isActive ? 'active ' : '') + (this.tabStyle || '');
			},
			isVisible() {
				if (typeof this.show === 'boolean')
					return this.show;
				return true;
			}
		},
		methods: {
			isInvalid() {
				if (!this.controls.length) return false;
				for (let c of this.controls) {
					if (c.invalid()) {
						return true;
					}
				}
				return false;
			},
			$registerControl(control) {
				this.controls.push(control);
			},
			$unregisterControl(control) {
				let ix = this.controls.indexOf(control);
				if (ix !== -1)
					this.controls.splice(ix, 1);
			}
		},
		created() {
			this.$parent.$addTab(this);
		},
		destroyed() {
			this.$parent.$removeTab(this);
		}
	});


	Vue.component('a2-tab-panel', {
		template: tabPanelTemplate,
		props: {
			items: Array,
			header: String
		},
		data() {
			return {
				tabs: [],
				activeTab: null
			};
		},
		computed: {
			static() {
				return !this.items;
			},
			contentCssClass() {
				return this.activeTab ? this.activeTab.tabStyle : '';
			}
		},
		watch: {
			items(newVal, oldVal) {
				let tabs = this.items;
				if (newVal.length < oldVal.length) {
					// tab has been removed
					if (this._index >= tabs.length)
						this._index = tabs.length - 1;
					this.select(tabs[this._index]);
				} else if (newVal.length === oldVal.length) {
					// may be reloaded
					if (tabs.length > 0) this.select(tabs[0]);
				} else {
					// tab has been added
					this.select(tabs[tabs.length - 1]);
				}
			}
		},
		methods: {
			select(item) {
				this.activeTab = item;
				if (this.items)
					this._index = this.items.indexOf(item);
			},
			nextTab() {
				alert('next');
			},
			prevTab() {
				alert('prev');
			},
			isActiveTab(item) {
				return item === this.activeTab;
			},
			defaultTabHeader(item, index) {
				return 'Tab ' + (index + 1);
			},
			$addTab(tab) {
				this.tabs.push(tab);
			},
			$removeTab(tab) {
				let ix = this.tabs.indexOf(tab);
				if (ix === -1) return;
				this.tabs.splice(ix, 1);
				if (this.tabs.indexOf(this.activeTab) === -1) {
					if (this.tabs.length > 0)
						this.select(this.tabs[0]);
				}
			}
		},
		mounted() {
			if (this.tabs.length > 0)
				this.activeTab = this.tabs[0]; // no tab, reactive item
			else if (this.items && this.items.length)
				this.activeTab = this.items[0];
			this._index = 0;
		}
	});

})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190328-7473
// components/list.js

/* TODO:
*/

(function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	Vue.component("a2-list", {
		template:

`
<ul class="a2-list" v-lazy="itemsSource">
	<template v-if="itemsSource">
		<li class="a2-list-item" tabindex="1" :class="cssClass(listItem)" v-for="(listItem, listItemIndex) in source" :key="listItemIndex" 
				@mousedown.prevent="select(listItem)" @keydown="keyDown" 
				ref="li">
			<span v-if="listItem.__group" v-text="listItem.__group"></span>
			<slot name="items" :item="listItem" v-if="!listItem.__group"/>
		</li>
		<div class="list-empty" v-if="$isEmpty">
			<slot name="empty" />
		</div>
	</template>
	<template v-else>
		<slot />
	</template>
</ul>
`,
		props: {
			itemsSource: Array,
			autoSelect: String,
			mark: String,
			markStyle: String,
			command: Function,
			selectable: {
				type: Boolean, default: true
			},
			hover: {
				type: Boolean, default: true
			},
			groupBy: String
		},
		computed: {
			selectedSource() {
				// method! not cached
				let src = this.itemsSource;
				if (!src) return null;
				if (src.$origin)
					src = src.$origin;
				return src.$selected;
			},
			source() {
				if (!this.groupBy)
					return this.itemsSource;
				let grmap = {};
				for (let itm of this.itemsSource) {
					let key = utils.eval(itm, this.groupBy);
					if (utils.isDate(key))
						key = utils.format(key, "Date");
					if (!utils.isDefined(key)) key = '';
					if (key === '') key = locale.$Unknown || "Unknown";
					if (!(key in grmap)) {
						grmap[key] = {
							group: key,
							items: []
						};
					}
					grmap[key].items.push(itm);
				}
				let rarr = [];
				for (let key in grmap) {
					let me = grmap[key];
					rarr.push(Object.assign({}, me, { __group: me.group, __count: me.items.length }));
					for (var e of me.items) {
						rarr.push(e);
					}
				}
				//console.dir(rarr);
				return rarr;
			},
			$isEmpty() {
				return this.itemsSource && this.itemsSource.length === 0;
			}
		},
		methods: {
			cssClass(item) {
				let getMark = el => {
					if (!this.mark) return '';
					let cls = utils.eval(el, this.mark);
					if (this.markStyle === 'row')
						cls += ' no-marker';
					else if (this.markStyle === 'marker')
						cls += ' no-background';
					return cls;
				};
				if (this.groupBy && item.__group)
					return 'group' + (this.mark ? ' mark' : '');
				return (item.$selected ? 'active ' : ' ') + getMark(item);
			},
			select(item) {
				if (!this.selectable) return;
				if (item.$select) item.$select();
			},
			selectStatic() {
				alert('yet not implemented');
				console.dir(this);
			},
			selectFirstItem() {
				if (!this.autoSelect) return;
				if (!this.selectable) return;
				let src = this.itemsSource;
				if (src.$selected) return; // already selected
				if (!src || !src.length)
					return;
				if (this.autoSelect === 'first-item') {
					// from source (not $origin!)
					let fe = src[0];
					this.select(fe);
					return;
				} else if (this.autoSelect === 'last-item') {
					// from source (not $origin!)
					let fe = src[src.length - 1];
					this.select(fe);
					return;
				} else if (this.autoSelect === 'item-id') {
					let rootId = this.$root.$modelInfo.Id;
					if (!utils.isDefined(rootId)) {
						console.error('Id not found in Root.modelInfo');
						return;
					}
					let fe = src.find(itm => itm.$id === rootId);
					if (!fe) {
						console.error(`Element with id=${rootId} not found`);
						fe = src[0];
					}
					if (fe)
						this.select(fe);
				}
			},
			keyDown(e) {
				const next = (delta) => {
					let index;
					index = this.itemsSource.indexOf(this.selectedSource);
					if (index === -1)
						return;
					index += delta;
					if (index === -1)
						return;
					if (index < this.itemsSource.length)
						this.select(this.itemsSource[index]);
				};
				switch (e.which) {
					case 38: // up
						next(-1);
						break;
					case 40: // down
						next(1);
						break;
					case 36: // home
						//this.selected = this.itemsSource[0];
						break;
					case 35: // end
						//this.selected = this.itemsSource[this.itemsSource.length - 1];
						break;
					case 33: // pgUp
						break;
					case 34: // pgDn
						break;
					case 13: // Enter
						if (utils.isFunction(this.command)) {
							// TODO:
							this.command();
						}
						break;
					default:
						return;
				}
				e.preventDefault();
				e.stopPropagation();
			}
		},
		created() {
			this.selectFirstItem();
		},
		updated() {
			if (!this.selectedSource && this.autoSelect) {
				this.selectFirstItem();
			}
			let src = this.itemsSource;
			if (!src) return;
			let li = this.$refs.li;
			if (!li) return;
			setTimeout(() => {
				let ix = li.findIndex(itm => itm.classList.contains('active'));
				if (ix !== -1 && li && ix < li.length)
					li[ix].scrollIntoViewCheck();
			}, 0);
		}
	});
})();

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200129-7623
// components/modal.js


(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;
	const utils = require('std:utils');

	const modalTemplate = `
<div class="modal-window modal-animation-window" @keydown.tab="tabPress" :class="mwClass">
	<include v-if="isInclude" class="modal-body" :src="dialog.url" :done="loaded" :inside-dialog="true"></include>
	<div v-else class="modal-body">
		<div class="modal-header" v-drag-window><span v-text="title"></span><button ref='btnclose' class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
		<div :class="bodyClass">
			<i v-if="hasIcon" :class="iconClass" />
			<div class="modal-body-content">
				<div v-html="messageText()" />
				<ul v-if="hasList" class="modal-error-list">
					<li v-for="(itm, ix) in dialog.list" :key="ix" v-text="itm"/>
				</ul>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn btn-default" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"/>
		</div>
	</div>
</div>
`;

	const setWidthComponent = {
		inserted(el, binding) {
			// TODO: width or cssClass???
			let mw = el.closest('.modal-window');
			if (mw) {
				if (binding.value.width)
					mw.style.width = binding.value.width;
				let cssClass = binding.value.cssClass;
				switch (cssClass) {
					case 'modal-large':
						mw.style.width = '800px'; // from less
						break;
					case 'modal-small':
						mw.style.width = '350px'; // from less
						break;
				}
				if (binding.value.minWidth)
					mw.style.minWidth = binding.value.minWidth;
			}
		}
	};

	const maximizeComponent = {
		inserted(el, binding) {
			let mw = el.closest('.modal-window');
			if (mw && binding.value)
				mw.setAttribute('maximize', 'true');
		}
	}

	const dragDialogDirective = {
		inserted(el, binding) {

			const mw = el.closest('.modal-window');
			if (!mw)
				return;
			const opts = {
				down: false,
				init: { x: 0, y: 0, cx: 0, cy: 0 },
				offset: { x: 0, y: 0 }
			};

			function onMouseDown(event) {
				opts.down = true;
				opts.offset.x = event.pageX;
				opts.offset.y = event.pageY;
				const cs = window.getComputedStyle(mw);
				opts.init.x = Number.parseFloat(cs.marginLeft);
				opts.init.y = Number.parseFloat(cs.marginTop);
				opts.init.cx = Number.parseFloat(cs.width);
				opts.init.cy = Number.parseFloat(cs.height);
				document.addEventListener('mouseup', onRelease, false);
				document.addEventListener('mousemove', onMouseMove, false);
			}

			function onRelease(event) {
				opts.down = false;
				document.removeEventListener('mouseup', onRelease);
				document.removeEventListener('mousemove', onMouseMove);
			}

			function onMouseMove(event) {
				if (!opts.down)
					return;
				let dx = event.pageX - opts.offset.x;
				let dy = event.pageY - opts.offset.y;
				let mx = opts.init.x + dx;
				let my = opts.init.y + dy;
				// fit
				let maxX = window.innerWidth - opts.init.cx;
				let maxY = window.innerHeight - opts.init.cy;
				if (my < 0) my = 0;
				if (mx < 0) mx = 0;
				if (mx > maxX) mx = maxX;
				//if (my > maxY) my = maxY; // any value available
				//console.warn(`dx:${dx}, dy:${dy}, mx:${mx}, my:${my}, cx:${opts.init.cx}`);
				mw.style.marginLeft = mx + 'px';
				mw.style.marginTop = my + 'px';
			}

			el.addEventListener('mousedown', onMouseDown, false);
		}
	};

	Vue.directive('drag-window', dragDialogDirective);

	Vue.directive('modal-width', setWidthComponent);

	Vue.directive('maximize', maximizeComponent);

	const modalComponent = {
		template: modalTemplate,
		props: {
			dialog: Object
		},
		data() {
			// always need a new instance of function (modal stack)
			return {
				modalCreated: false,
				keyUpHandler: function (event) {
					// escape
					if (event.which === 27) {
						eventBus.$emit('modalClose', false);
						event.stopPropagation();
						event.preventDefault();
					}
				}
			};
		},
		methods: {
			modalClose(result) {
				eventBus.$emit('modalClose', result);
			},
			loaded() {
				// include loading is complete
			},
			messageText() {
				return utils.text.sanitize(this.dialog.message);
			},
			tabPress(event) {
				function createThisElems() {
					let qs = document.querySelectorAll('.modal-body [tabindex]');
					let ea = [];
					for (let i = 0; i < qs.length; i++) {
						//TODO: check visibilty!
						ea.push({ el: qs[i], ti: +qs[i].getAttribute('tabindex') });
					}
					ea = ea.sort((a, b) => a.ti > b.ti);
					//console.dir(ea);
					return ea;
				}


				if (this._tabElems === undefined) {
					this._tabElems = createThisElems();
				}
				if (!this._tabElems || !this._tabElems.length)
					return;
				let back = event.shiftKey;
				let lastItm = this._tabElems.length - 1;
				let maxIndex = this._tabElems[lastItm].ti;
				let aElem = document.activeElement;
				let ti = +aElem.getAttribute("tabindex");
				//console.warn(`ti: ${ti}, maxIndex: ${maxIndex}, back: ${back}`);
				if (ti === 0) {
					event.preventDefault();
					return;
				}
				if (back) {
					if (ti === 1) {
						event.preventDefault();
						this._tabElems[lastItm].el.focus();
					}
				} else {
					if (ti === maxIndex) {
						event.preventDefault();
						this._tabElems[0].el.focus();
					}
				}
			},
			__modalRequery() {
				alert('requery');
			}
		},
		computed: {
			isInclude: function () {
				return !!this.dialog.url;
			},
			mwClass() {
				return this.modalCreated ? 'loaded' : '';
			},
			hasIcon() {
				return !!this.dialog.style;
			},
			title: function () {
				// todo localization
				if (this.dialog.title)
					return this.dialog.title;
				return this.dialog.style === 'confirm' ? locale.$Confirm :
					this.dialog.style === 'info' ? locale.$Message : locale.$Error;
			},
			bodyClass() {
				return 'modal-body ' + (this.dialog.style || '');
			},
			iconClass() {
				let ico = this.dialog.style;
				if (ico === 'info')
					ico = 'info-blue';
				return "ico ico-" + ico;
			},
			hasList() {
				return this.dialog.list && this.dialog.list.length;
			},
			buttons: function () {
				//console.warn(this.dialog.style);
				let okText = this.dialog.okText || locale.$Ok;
				let cancelText = this.dialog.cancelText || locale.$Cancel;
				if (this.dialog.buttons)
					return this.dialog.buttons;
				else if (this.dialog.style === 'alert')
					return [{ text: okText, result: true, tabindex: 1 }];
				else if (this.dialog.style === 'info')
					return [{ text: okText, result: true, tabindex:1 }];
				return [
					{ text: okText, result: true, tabindex:2 },
					{ text: cancelText, result: false, tabindex:1 }
				];
			}
		},
		created() {
			document.addEventListener('keyup', this.keyUpHandler);
			if (document.activeElement)
				document.activeElement.blur();
		},
		mounted() {
			setTimeout(() => {
				this.modalCreated = true;
			}, 50); // same as shell
		},
		destroyed() {
			document.removeEventListener('keyup', this.keyUpHandler);
		}
	};

	app.components['std:modal'] = modalComponent;
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200819-7703
// components/waitcursor.js


(function () {
	/* doesn't work without load-indicator for some reason */
	const waitCursor = {
		template: `<div class="wait-cursor" v-if="visible()"><div class="spinner"/></div>`,
		props: {
			ready: Boolean
		},
		methods: {
			visible() {
				return !this.ready;
			}
		}
	};

	Vue.component("wait-cursor", waitCursor);
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


/* 20181126-7373 */
/*components/wizard.js*/

(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const wizardPageTemplate = `
<div class="wizard-page" v-if="isActive">
	<slot />
</div>
`;

	const wizardPanelTemplate = `
<div class="wizard-panel" :style="panelStyle">
	<ul class="wizard-header">
		<li v-for="(p, px) in pages" :class="pageClass(p)" @click.prevent="selectPage(p)">
			<a><span class="wizard-header-title" v-text="p.header"/><span class="wizard-header-descr" v-text="p.descr"></span><i v-if="p.errorIcon" class="ico ico-error-outline"></i></a>
		</li>
	</ul>
	<div class="wizard-content">
		<slot />
	</div>
	<div class="modal-footer">
		<template v-if="helpLink">
			<a class="btn-help" rel="help" :href="helpLink" @click.prevent="$showHelp()"><i class="ico ico-help"/><span v-text="$locale.$Help"/></a>
			<div class="aligner"/>
		</template>
		<button class="btn a2-inline" :disabled="backDisabled" @click.stop="back"><i class="ico ico-chevron-left"/> <span v-text="$locale.$Back"/></button>
		<button class="btn a2-inline btn-primary" @click.stop="nextFinish" :disabled="nextDisabled()"><span v-text="nextFinishText"/> <i class="ico" :class="nextFinishIco""/></button>
		<button class="btn a2-inline" @click.prevent="close" v-text="$locale.$Cancel" style="margin-left:2rem"/>
	</div>
</div>
`;

	Vue.component('a2-wizard-panel', {
		template: wizardPanelTemplate,
		props: {
			finish: Function,
			helpLink: String,
			minHeight: String
		},
		data() {
			return {
				pages: [],
				activePage: null
			};
		},
		computed: {
			$locale() {
				return locale;
			},
			nextFinishText() {
				let pgs = this.pages;
				return this.activePage === pgs[pgs.length - 1] ? locale.$Finish : locale.$Next;
			},
			nextFinishIco() {
				let pgs = this.pages;
				return this.activePage === pgs[pgs.length - 1] ? 'ico-chevron-right-end' : 'ico-chevron-right';
			},
			backDisabled() {
				return this.activePage === this.pages[0];
			},
			panelStyle() {
				if (this.minHeight)
					return { 'min-height': this.minHeight };
				return undefined;
			}
		},
		methods: {
			nextDisabled() {
				if (!this.activePage) return false;
				if (this.activePage.$invalid()) return true;
				return false;
			},
			setActivePage(page) {
				if (this.activePage) this.activePage.visit = true;
				this.activePage = page;
				this.activePage.state = 'edit';
			},
			selectPage(page) {
				if (this.$nextPage(page) && !this.nextDisabled()) {
					this.setActivePage(page);
					return;
				}
				if (!page.visit) return;
				this.setActivePage(page);
			},
			pageClass(page) {
				let cls = '';
				if (!page.visit) {
					if (this.$nextPage(page) && !this.nextDisabled())
						return cls;
					cls = 'disabled';
				}
				if (page === this.activePage)
					cls = 'active';
				else if (page.wasInvalid)
					cls = 'invalid';
				return cls;
			},
			close() {
				eventBus.$emit('modalClose');
			},
			back() {
				let pgs = this.pages;
				let ix = pgs.indexOf(this.activePage);
				if (ix <= 0) return;
				this.setActivePage(pgs[ix - 1]);
			},
			nextFinish() {
				if (this.nextDisabled()) return;
				let pgs = this.pages;
				let ix = pgs.indexOf(this.activePage);
				if (ix === pgs.length - 1) {
					if (this.finish)
						this.finish();
					else {
						console.error('The FinishCommand is not specified');
					}
				} else {
					this.setActivePage(pgs[ix + 1]);
				}
			},
			$nextPage(page) {
				let ia = this.pages.indexOf(this.activePage);
				let ix = this.pages.indexOf(page);
				return ix === ia + 1;
			},
			$addPage(page) {
				this.pages.push(page);
			},
			$removePage(page) {
				let ix = this.pages.indexOf(page);
				if (ix !== -1)
					this.pages.splice(ix, 1);
			},
			$showHelp() {
				if (!this.helpLink) return;
				window.open(this.helpLink, "_blank");
			},
			_pendingValidate() {
				this.$forceUpdate();
			}
		},
		mounted() {
			if (this.pages.length > 0) {
				this.activePage = this.pages[0];
				this.activePage.state = 'edit';
			}
		},
		created() {
			eventBus.$on('pendingValidate', this._pendingValidate);
		},
		beforeDestroy() {
			eventBus.$off('pendingValidate', this._pendingValidate);
		}
	});

	Vue.component("a2-wizard-page", {
		template: wizardPageTemplate,
		props: {
			header: String,
			descr: String
		},
		data() {
			return {
				controls: [],
				state: 'init',
				wasInvalid: false,
				visit: false
			};
		},
		computed: {
			isActive() {
				return this === this.$parent.activePage;
			},
			isNextPage() {
				return $parent.$nextPage(this);
			},
			errorIcon() {
				if (!this.visit) return false;
				// ther are no controls here
				return this.wasInvalid;
			}
		},
		methods: {
			$invalid() {
				if (!this.controls.length) {
					this.wasInvalid = false;
					return false;
				}
				for (let c of this.controls) {
					if (c.invalid() /*|| c.pending() blinking? */) {
						this.wasInvalid = true;
						return true;
					}
				}
				this.wasInvalid = false;
				return false;
			},
			$registerControl(control) {
				this.controls.push(control);
			},
			$unregisterControl(control) {
				let ix = this.controls.indexOf(control);
				if (ix !== -1)
					this.controls.splice(ix, 1);
			}
		},
		created() {
			this.$parent.$addPage(this);
		},
		beforeDestroy() {
			this.controls.splice(0, this.controls.length);
		},
		destroyed() {
			this.$parent.$removePage(this);
		}
	});

})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190610-7499
// components/toastr.js


(function () {

	const locale = window.$$locale;
	const eventBus = require('std:eventBus');

	const toastTemplate = `
<li class="toast" :class="toast.style">
	<i class="ico" :class="icoCssClass"></i>
	<span v-text="toast.text" />
</li>
`;

	const toastrTemplate = `
<div class="toastr-stack" >
	<transition-group name="list" tag="ul">
		<a2-toast v-for="(t, k) in items":toast="t" :key="t.$index"></a2-toast>
	</transition-group>
</div>
`;

	/*
	{{toast}}
		<li class="toast success">
			<i class="ico ico-check"></i><span>i am the toast 1 (11)</span>
		</li>
		<li class="toast warning">
			<i class="ico ico-warning-outline"></i><span>i am the toast warning (test for bundle)</span>
		</li>
		<li class="toast info">
			<i class="ico ico-info-outline"></i><span>Документ сохранен успешно и записан в базу данных!</span>
		</li>
		<li class="toast danger">
			<i class="ico ico-error-outline-nocolor"></i><span>Документ сохранен c ошибкой. Проверьте все, что можно</span>
		</li>
	 */

	const toastComponent = {
		template: toastTemplate,
		props: {
			toast: Object
		},
		computed: {
			icoCssClass() {
				switch (this.toast.style) {
					case 'success' : return 'ico-check';
					case 'danger':
					case 'error':
						return 'ico-error-outline-nocolor';
					case 'warning': return 'ico-warning-outline';
					case 'info': return 'ico-info-outline';
				}
				return 'ico-dot';
			}
		}
	};

	const toastrComponent = {
		template: toastrTemplate,
		components: {
			'a2-toast': toastComponent
		},
		props: {
		},
		data() {
			return {
				items: [],
				currentIndex: 0
			};
		},
		methods: {
			showToast(toast) {
				toast.$index = ++this.currentIndex;
				this.items.unshift(toast);

				setTimeout(() => {
					this.removeToast(toast.$index);
				}, 2000);
			},
			removeToast(tstIndex) {
				let ix = this.items.findIndex(x => x.$index === tstIndex);
				if (ix === -1) return;
				this.items.splice(ix, 1);
			}
		},
		created() {
			eventBus.$on('toast', this.showToast);
		}
	};

	app.components['std:toastr'] = toastrComponent;
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20201119-7731
// components/image.js

(function () {

    /**
     TODO:
    2. if/else - image/upload
    3. Photo, Base for list
    4. multiple for list
    5. css
    <span v-text="href"></span>
    <span>{{newElem}}</span>
     */

	const url = require('std:url');
	const utils = require('std:utils');

	const locale = window.$$locale;

	Vue.component('a2-image', {
		template: `
<div class="a2-image">
	<img v-if="hasImage" :src="href" :style="cssStyle" @click.prevent="clickOnImage"/>
	<a class="remove-image" v-if="hasRemove" @click.prevent="removeImage">&#x2715;</a>
	<a2-upload v-if="isUploadVisible" :style=uploadStyle accept="image/*"
		:item=itemForUpload :base=base :prop=prop :new-item=newItem :tip=tip :read-only=readOnly :limit=limit :icon=icon></a2-upload>
</div>
`,
		props: {
			base: String,
			item: Object,
			prop: String,
			newItem: Boolean,
			inArray: Boolean,
			source: Array,
			width: String,
			height: String,
			readOnly: Boolean,
			limit: Number,
			placeholder: String,
			icon: String
		},
		data() {
			return {
				newElem: {}
			};
		},
		computed: {
			href: function () {
				if (this.newItem)
					return undefined;
				let root = window.$$rootUrl;
				let id = this.item[this.prop];
				if (!id) return undefined;
				let qry = {};
				if (this.item._meta_ && this.item._meta_.$token)
					qry.token = this.item[this.item._meta_.$token];
				return url.combine(root, '_image', this.base, this.prop, id) + url.makeQueryString(qry);
			},
			tip() {
				if (this.readOnly) return this.placeholder;
				return this.placeholder ? this.placeholder : locale.$ClickToDownloadPicture;
			},
			cssStyle() {
				return { maxWidth: this.width, maxHeight: this.height };
			},
			uploadStyle() {
				let w = { width: this.width, height: this.height };
				if (!w.width) w.width = w.height;
				if (!w.height) w.height = w.width;
				return w;
			},
			hasImage() {
				return !!this.href;
			},
			hasRemove() {
				if (this.readOnly) return false;
				return this.hasImage;
			},
			isUploadVisible: function () {
				if (this.newItem) return true;
				if (this.readOnly)
					return !this.hasImage;
				return !this.inArray && !this.item[this.prop];
			},
			itemForUpload() {
				return this.newItem ? this.newElem : this.item;
			}
		},
		methods: {
			removeImage: function () {
				if (this.inArray)
					this.item.$remove();
				else
					this.item[this.prop] = undefined;
			},
			clickOnImage: function () {
				//alert('click on image');
			}
		},
		created() {
			if (this.newItem && this.source && this.source.$new) {
				this.newElem = this.source.$new();
			}
		}
	});

	Vue.component('a2-static-image', {
		template: '<img :src="href" :alt="alt"/>',
		props: {
			url: String,
			alt: String
		},
		computed: {
			href: function () {
				let root = window.$$rootUrl;
				return url.combine(root, '_static_image', this.url.replace(/\./g, '-'));
			}
		}
	});

	Vue.component('a2-file-image', {
		template: '<img :src="href" :style="cssStyle" />',
		props: {
			url: String,
			width: String,
			height: String,
			value: [String, Number, Object]
		},
		computed: {
			href: function () {
				let root = window.$$rootUrl;
				let id = this.value;
				let qry = {};
				if (utils.isObjectExact(this.value)) {
					id = utils.getStringId(this.value);
					if (this.value._meta_ && this.value._meta_.$token)
						qry.token = this.value[this.value._meta_.$token];
				}
				return url.combine(root, '_file', this.url, id) + url.makeQueryString(qry);
			},
			cssStyle() {
				let r = {};
				if (this.width)
					r.maxWidth = this.width;
				if (this.height)
					r.maxHeight = this.height;
				return r;
			}
		}
	});
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200108-7609
// components/fileupload.js

(function () {

    /**
     TODO:
    2. if/else - image/upload
    3. Photo, Base for list
    4. multiple for list
    5. css
    <span v-text="href"></span>
    <span>{{newElem}}</span>
     */

	const url = require('std:url');
	const http = require('std:http');
	const locale = window.$$locale;
	const tools = require('std:tools');

	Vue.component('a2-file-upload', {
		template: `
<div class="a2-file-upload">
<label :class="cssClass" @dragover.prevent="dragOver" @dragleave.prevent="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadFile" v-bind:multiple="isMultiple" :accept="accept" ref="inputFile"/>
	<i class="ico ico-upload"></i>
	<span class="upload-tip" v-text="tip" v-if="tip"></span>
</label>
</div>
`,
		data() {
			return {
				hover: false
			};
		},
		props: {
			accept: String,
			url: String,
			source: Object,
			delegate: Function,
			errorDelegate: Function,
			argument: [Object, String, Number],
			limit:Number
		},
		computed: {
			cssClass() {
				return 'file-upload' + (this.hover ? ' hover' : '');
			},
			canUpload() {
				return true;
			},
			isMultiple() {
				return false;
			},
			tip() {
				if (this.readOnly) return '';
				return locale.$ClickToDownloadFile;
			}
		},
		methods: {
			dragOver(ev) {
				this.hover = true;
			},
			dragLeave(ev) {
				this.hover = false;
			},
			checkLimit(file) {
				if (!this.limit) return false;
				let sizeKB = file.size / 1024;
				return sizeKB > this.limit;
			},
			uploadFile(ev) {
				let root = window.$$rootUrl;

				let id = 1;
				let uploadUrl = url.combine(root, '_file', this.url);
				let na = this.argument ? Object.assign({}, this.argument) : { Id: id };
				uploadUrl = url.createUrlForNavigate(uploadUrl, na);
				var fd = new FormData();
				for (let file of ev.target.files) {
					if (this.checkLimit(file)) {
						ev.target.value = ''; // clear current selection
						let msg = locale.$FileTooLarge.replace('{0}', this.limit);
						tools.alert(msg);
						return;
					}
					fd.append('file', file, file.name);
				}
				this.$refs.inputFile.value = '';
				http.upload(uploadUrl, fd).then((result) => {
					ev.target.value = ''; // clear current selected files
					if (this.delegate)
						this.delegate(result);
				}).catch(msg => {
					if (this.errorDelegate)
						this.errorDelegate(msg);
					else if (msg.indexOf('UI:') === 0)
						tools.alert(msg.substring(3).replace('\\n', '\n'));
					else
						alert(msg);
				});
			}
		}
	});
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200111-7611
// components/taskpad.js

Vue.component("a2-taskpad", {
	template:
		`<div :class="cssClass">
	<a class="ico taskpad-collapse-handle" @click.stop="toggle"></a>
	<div v-if="expanded" class="taskpad-body">
		<slot>
		</slot>
	</div>
	<div v-else class="taskpad-title" @click.prevent="toggle">
		<span class="taskpad-label" v-text="tasksText"></span>
	</div>
</div>
`,
	props: {
		title: String,
		initialCollapsed: Boolean
	},
	data() {
		return {
			expanded: true,
			__savedCols: ''
		};
	},
	computed: {
		cssClass() {
			let cls = "taskpad";
			if (this.expanded) cls += ' expanded'; else cls += ' collapsed';
			return cls;
		},
		tasksText() {
			return this.title || window.$$locale.$Tasks;
		}
	},
	methods: {
		setExpanded(exp) {
			this.expanded = exp;
			// HACK
			let topStyle = this.$el.parentElement.style;
			if (this.expanded)
				topStyle.gridTemplateColumns = this.__savedCols;
			else
				topStyle.gridTemplateColumns = "1fr 36px"; // TODO: ???
		},
		toggle() {
			this.setExpanded(!this.expanded);
		}
	},
	mounted() {
		let topStyle = this.$el.parentElement.style;
		this.__savedCols = topStyle.gridTemplateColumns;
		if (this.initialCollapsed)
			this.setExpanded(false);
	}
});


// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190309-7488
// components/panel.js

Vue.component('a2-panel', {
	template:
`<div :class="cssClass" :test-id="testId">
	<div class="panel-header" @click.prevent="toggle" v-if="!noHeader">
		<slot name='header'></slot>
		<span v-if="collapsible" class="ico panel-collapse-handle"></span>
	</div>
	<slot v-if="expanded"></slot>
</div>
`,
	props: {
		initialCollapsed: Boolean,
		collapsible: Boolean,
		panelStyle: String,
		noHeader: Boolean,
		testId: String
	},
	data() {
		return {
			collapsed: this.initialCollapsed
		};
	},
	computed: {
		cssClass() {
			let cls = "panel";
			if (this.collapsed) cls += ' collapsed'; else cls += ' expanded';
			if (this.panelStyle) {
				let ps = this.panelStyle.toLowerCase(); 
				switch (ps) {
					case "red":
					case "danger":
					case "error":
						cls += ' panel-red';
						break;
					case "info":
					case "cyan":
						cls += ' panel-cyan';
						break;
					case "green":
					case "success":
						cls += ' panel-green';
						break;
					case "warning":
					case "yellow":
						cls += ' panel-yellow';
						break;
					default:
						cls += ' panel-' + ps;
						break;
				}
			}
			return cls;
		},
		expanded() {
			return !this.collapsed;
		}
	},
	methods: {
		toggle() {
			if (!this.collapsible)
				return;
			this.collapsed = !this.collapsed;
		}
	}
});
// Copyright © 2020 Alex Kukhtin. All rights reserved.

// 20201130-7634
// components/inlinedialog.js
(function () {
	const eventBus = require('std:eventBus');

	Vue.component('a2-inline-dialog', {
		template:
`<div class="inline-modal-wrapper modal-animation-frame" v-if="visible" :class="{show: open}" v-cloak>
	<div class="modal-window modal-animation-window" :class="{loaded: open}" :style="dlgStyle">
		<slot></slot>
	</div>
</div>
`,
		props: {
			dialogId: String,
			dialogTitle: String,
			width: String,
			noClose: Boolean
		},
		data() {
			return {
				visible: false,
				open: false //for animation
			};
		},
		computed: {
			dlgStyle() {
				if (this.width)
					return { width: this.width };
				return undefined;
			}
		},
		methods: {
			__keyUp(event) {
				if (this.noClose) return;
				if (event.which === 27) {
					eventBus.$emit('inlineDialog', { cmd: 'close', id: this.dialogId });
					event.stopPropagation();
					event.preventDefault();
				}
			},
			__inlineEvent(opts) {
				if (!opts) return;
				if (opts.id !== this.dialogId) return;
				switch (opts.cmd) {
					case 'close':
						if (window.__requestsCount__ > 0) return;
						this.open = false;
						this.visible = false;
						document.removeEventListener('keyup', this.__keyUp);
						break;
					case 'open':
						this.visible = true;
						document.addEventListener('keyup', this.__keyUp);
						setTimeout(() => {
							this.open = true;
						}, 50); // same as shell
						break;
					default:
						console.error(`invalid inline command '${opts.cmd}'`);
				}
			}
		},
		created() {
			eventBus.$on('inlineDialog', this.__inlineEvent);
		},
		beforeDestroy() {
			eventBus.$off('inlineDialog', this.__inlineEvent);
		}
	});

})();
/*! Copyright © 2015-2020 Alex Kukhtin. All rights reserved.*/

// 20200113-7612
// components/sheet.js

(function () {

	const sheetTemplate = `
<table class="sheet">
	<slot name="columns"></slot>
	<thead>
		<slot name="header"></slot>
	</thead>
	<slot name="col-shadow"></slot>
	<slot name="body"></slot>
	<tfoot>
		<slot name="footer"></slot>
	</tfoot>
</table>
`;

	const sheetSectionTemplate = `
<tbody>
	<slot></slot>
</tbody>
`;

	function* traverse(item, prop, lev) {
		if (prop in item) {
			let arr = item[prop];
			for (let i = 0; i < arr.length; i++) {
				let elem = arr[i];
				elem.$level = lev;
				yield elem;
				if (!elem.$collapsed)
					yield* traverse(elem, prop, lev + 1);
			}
		}
	}

	Vue.component('a2-sheet', {
		template: sheetTemplate
	});

	Vue.component("a2-sheet-section", {
		template: sheetSectionTemplate
	});

	Vue.component('a2-sheet-section-tree', {
		functional: true,
		name: 'a2-sheet-section',
		props: {
			itemsSource: Object,
			propName: String
		},
		render(h, ctx) {
			const prop = ctx.props.propName;
			const source = ctx.props.itemsSource;
			if (!source) return;
			if (!prop) return;

			function toggle() {
				let clpsed = this.item.$collapsed || false;
				Vue.set(this.item, "$collapsed", !clpsed);
			}

			function cssClass() {
				let cls = '';
				if (this.hasChildren())
					cls += 'has-children';
				if (this.item.$collapsed)
					cls += ' collapsed';
				cls += ' lev-' + this.item.$level;
				return cls;
			}

			function rowCssClass() {
				let cls = '';
				if (this.hasChildren())
					cls += ' group';
				if (this.item.$collapsed)
					cls += ' collapsed';
				return cls;
			}

			function indentCssClass() {
				return 'indent lev-' + this.item.$level;
			}

			function hasChildren() {
				let chElems = this.item[prop];
				return chElems && chElems.length > 0;
			}

			const slot = ctx.data.scopedSlots.default;

			let compArr = [];

			for (let v of traverse(source, prop, 1)) {
				let slotElem = slot({ item: v, toggle, cssClass, hasChildren, rowCssClass, indentCssClass })[0];
				compArr.push(h(slotElem.tag, slotElem.data, slotElem.children));
			}
			return h('tbody', {}, compArr);
		}
	});
})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190816-7525*/
/*components/newbutton.js*/

(function () {

	const store = component('std:store');
	const urltools = require('std:url');
	const eventBus = require('std:eventBus');

	const newButtonTemplate =
`<div class="dropdown dir-down a2-new-btn separate" v-dropdown v-if="isVisible">
	<button class="btn btn-icon" :class="btnClass" toggle aria-label="New"><i class="ico" :class="iconClass"></i></button>
	<div class="dropdown-menu menu down-left">
		<div class="super-menu" :class="cssClass">
			<div v-for="(m, mx) in topMenu" :key="mx" class="menu-group">
				<div class="group-title" v-text="m.Name"></div>
				<template v-for="(itm, ix) in m.Menu">
					<div class="divider" v-if=isDivider(itm)></div>
					<a v-else @click.prevent='doCommand(itm.Url, itm.Params)' 
						class="dropdown-item" tabindex="-1"><i class="ico" :class="'ico-' + itm.Icon"></i><span v-text="itm.Name"></span></a>
				</template>
			</div>
		</div>
	</div>
</div>
`;

	Vue.component('a2-new-button', {
		template: newButtonTemplate,
		store: store,
		props: {
			menu: Array,
			icon: String,
			btnStyle: String
		},
		computed: {
			isVisible() {
				return !!this.menu;
			},
			topMenu() {
				return this.menu ? this.menu[0].Menu : null;
			},
			iconClass() {
				return this.icon ? 'ico-' + this.icon : '';
			},
			btnClass() {
				return this.btnStyle ? 'btn-' + this.btnStyle : '';
			},
			columns() {
				let descr = this.menu ? this.menu[0].Params : '';
				if (!descr) return 1;
				try {
					return +JSON.parse(descr).columns || 1;
				} catch (err) {
					return 1;
				}
			},
			cssClass() {
				return 'cols-' + this.columns;
			}
		},
		created() {
		},
		methods: {
			isDivider(itm) {
				return itm.Name === '-';
			},
			doCommand(cmd, strOpts) {
				let requeryAfter = false;
				if (strOpts) {
					try {
						requeryAfter = JSON.parse(strOpts).requeryAfter;
					} catch (err) {
						requeryAfter = false;
					}
				}
				cmd = cmd || '';
				if (cmd.startsWith('navigate:')) {
					this.navigate(cmd.substring(9));
				} else if (cmd.startsWith('dialog:')) {
					this.dialog(cmd.substring(7), requeryAfter);
				} else {
					alert('invalid command:' + cmd);
				}
			},
			navigate(url) {
				//let urlToNavigate = urltools.createUrlForNavigate(url);
				this.$store.commit('navigate', { url: url });
			},
			dialog(url, requeryAfter) {
				const dlgData = { promise: null};
				eventBus.$emit('modaldirect', url, dlgData);
				dlgData.promise.then(function (result) {
					// todo: resolve?
					if (requeryAfter) {
						eventBus.$emit('requery', url, dlgData);
					}
				});
			}
		}
	});
})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191216-7600*/
/*components/newbutton.js*/

(function () {


	const companyButtonTemplate =
`<div class="a2-company-btn"><div class="dropdown dir-down separate" v-dropdown v-if="isVisible">
	<button class="btn btn-companyname" toggle aria-label="Company">
		<i class="ico ico-home"></i>
		<span class="company-name" v-text=companyName></span>
		<span class="caret"/>
	</button>
	<div class="dropdown-menu menu down-left">
		<a v-for="comp in source" @click.prevent="selectCompany(comp)" href="" tabindex="-1" class="dropdown-item">
			<i class="ico" :class="icoClass(comp)"/><span class="company-menu-name" v-text="comp.Name"/>
		</a>
		<template v-if="hasLinks">
			<div class="divider"/>
			<a v-for="link in links" @click.prevent="gotoLink(link)" href="" tabindex="-1" class="dropdown-item">
				<i class="ico" :class="linkClass(link)"/><span v-text="link.Name" />
			</a>
		</template>
	</div>
</div></div>
`;

	Vue.component('a2-company-button', {
		template: companyButtonTemplate,
		props: {
			source: Array,
			links: Array
		},
		computed: {
			isVisible() {
				return this.source.length > 0;
			},
			hasLinks() {
				return this.links && this.links.length;
			},
			companyName() {
				if (this.source.length === 0)
					return '';
				let comp = this.source.find(x => x.Current);
				if (comp)
					return comp.Name;
				return "*** UNSELECTED ***";
			}
		},
		methods: {
			selectCompany(comp) {
				const http = require("std:http");
				const urlTools = require("std:url");
				const rootUrl = window.$$rootUrl;
				const data = JSON.stringify({ company: comp.Id });
				http.post(urlTools.combine(rootUrl, '_application/switchtocompany'), data)
					.then(x => {
						window.location.assign(urlTools.combine(rootUrl, '/') /*always root */);
					}).catch(err => {
						alert(err);
					});
			},
			gotoLink(link) {
				const store = component('std:store');
				if (store)
					store.commit('navigate', { url: link.Url});
			},
			icoClass(cmp) {
				return cmp.Current ? 'ico-check' : 'ico-none';
			},
			linkClass(link) {
				return `ico-${link.Icon || 'none'}`;
			}
		}
	});

})();
// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210208-7745
// components/graphics.js

(function () {

	let graphId = 1237;

	function nextGraphicsId() {
		graphId += 1;
		return 'el-gr-' + graphId;
	}

	Vue.component("a2-graphics", {
		template:
			`<div :id="id" class="a2-graphics" ref=canvas></div>`,
		props: {
			render: Function,
			arg: [Object, String, Number, Array, Boolean, Date],
			watchmode: String
		},
		data() {
			return {
				unwatch: null,
				id: nextGraphicsId()
			};
		},
		computed: {
			controller() {
				return this.$root;
			}
		},
		methods: {
			draw() {
				const domElem = this.$refs.canvas;
				const chart = d3.select(domElem);
				chart.selectAll('*').remove();
				this.render.call(this.controller.$data, chart, this.arg, domElem);
			}
		},
		mounted() {
			this.$nextTick(() => this.draw());
			if (this.watchmode === 'none') return;
			let deep = this.watchmode === 'deep';
			this.unwatch = this.$watch('arg', () => this.draw(), { deep: deep });
		},
		beforeDestroy() {
			if (this.unwatch)
				this.unwatch();
			const chart = d3.select('#' + this.id);
			chart.selectAll('*').remove();
			this.$el.remove();
		}
	});
})();

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210201-7744
// components/debug.js*/

(function () {

    /**
     */

	const http = require('std:http');
	const urlTools = require('std:url');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;
	const utils = require('std:utils');

	const isZero = utils.date.isZero;

	const specKeys = {
		'$vm': null,
		'$ctrl': null,
		'$host': null,
		'$root': null,
		'$parent': null,
		'$items': null
	};

	function toJsonDebug(data) {
		return JSON.stringify(data, function (key, value) {
			if (key[0] === '$')
				return !(key in specKeys) ? value : undefined;
			else if (key[0] === '_')
				return undefined;
			if (isZero(this[key])) return null;
			return value;
		}, 2);
	}

	const traceItem = {
		name: 'a2-trace-item',
		template: `
<div v-if="hasElem" class="trace-item-body">
	<span class="title" v-text="name"/><span class="badge" v-text="elem.length"/>
	<ul class="a2-debug-trace-item">
		<li v-for="itm in elem">
			<div class="rq-title"><span class="elapsed" v-text="itm.elapsed + ' ms'"/> <span v-text="itm.text"/></div>
		</li>
	</ul>
</div>`,
		props: {
			name: String,
			elem: Array
		},
		computed: {
			hasElem() {
				return this.elem && this.elem.length;
			}
		}
	};

	Vue.component('a2-debug', {
		template: `
<div class="debug-panel" v-if="paneVisible" :class="panelClass">
	<div class="debug-pane-header">
		<span class="debug-pane-title" v-text="title"></span>
		<a class="btn btn-close" @click.prevent="close">&#x2715</a>
	</div>
	<div class="toolbar">
		<button class="btn btn-tb" @click.prevent="refresh"><i class="ico ico-reload"></i> {{text('$Refresh')}}</button>
		<div class="aligner"></div>
		<button class="btn btn-tb" @click.prevent="toggle"><i class="ico" :class="toggleIcon"></i></button>
	</div>
	<div class="debug-model debug-body" v-if="modelVisible">
		<pre class="a2-code" v-text="modelJson()"></pre>
	</div>
	<div class="debug-trace debug-body" v-if="traceVisible">
		<ul class="a2-debug-trace">
			<li v-for="r in trace">
				<div class="rq-title"><span class="elapsed" v-text="r.elapsed + ' ms'"/> <span v-text="r.url" /></div>
				<a2-trace-item name="Sql" :elem="r.items.Sql"></a2-trace-item>
				<a2-trace-item name="Render" :elem="r.items.Render"></a2-trace-item>
				<a2-trace-item name="Report" :elem="r.items.Report"></a2-trace-item>
				<a2-trace-item name="Workflow" :elem="r.items.Workflow"></a2-trace-item>
				<a2-trace-item class="exception" name="Exceptions" :elem="r.items.Exception"></a2-trace-item>
			</li>
		</ul>
	</div>
</div>
`,
		components: {
			'a2-trace-item': traceItem
		},
		props: {
			modelVisible: Boolean,
			traceVisible: Boolean,
			modelStack: Array,
			counter: Number,
			close: Function
		},
		data() {
			return {
				trace: [],
				left: false
			};
		},
		computed: {
			refreshCount() {
				return this.counter;
			},
			paneVisible() {
				return this.modelVisible || this.traceVisible;
			},
			title() {
				return this.modelVisible ? locale.$DataModel
					: this.traceVisible ? locale.$Profiling
						: '';
			},
			traceView() {
				return this.traceVisible;
			},
			toggleIcon() {
				return this.left ? 'ico-pane-right' : 'ico-pane-left';
			},
			panelClass() {
				return this.left ? 'left' : 'right';
			}
		},
		methods: {
			modelJson() {
				// method. not cached
				if (!this.modelVisible)
					return;
				if (this.modelStack.length) {
					return toJsonDebug(this.modelStack[0].$data);
				}
				return '';
			},
			refresh() {
				if (this.modelVisible)
					this.$forceUpdate();
				else if (this.traceVisible)
					this.loadTrace();
			},
			toggle() {
				this.left = !this.left;
			},
			loadTrace() {
				const root = window.$$rootUrl;
				const url = urlTools.combine(root, '_shell/trace');
				const that = this;
				// with skip events
				http.post(url, null, null, true).then(function (result) {
					that.trace.splice(0, that.trace.length);
					if (!result) return;
					result.forEach((val) => {
						that.trace.push(val);
					});
				});
			},
			text(key) {
				return locale[key];
			}
		},
		watch: {
			refreshCount() {
				// dataModel stack changed
				this.$forceUpdate();
			},
			traceView(newVal) {
				if (newVal)
					this.loadTrace();
			}
		},
		created() {
			eventBus.$on('endRequest', (url) => {
				if (url.indexOf('/_shell/trace') !== -1) return;
				if (!this.traceVisible) return;
				this.loadTrace();
			});
		}
	});
})();

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180605-7210
// components/feedback.js*/

(function () {

    /**
     * TODO
    1. Trace window
    2. Dock right/left
    6.
     */

	const dataService = require('std:dataservice');
	const urlTools = require('std:url');
	const locale = window.$$locale;
	const utils = require('std:utils');

	Vue.component('a2-feedback', {
		template: `
<div class="feedback-panel" v-if="visible">
    <div class="feedback-pane-header">
        <span class="feedback-pane-title" v-text="source.title"></span>
        <a class="btn btn-close" @click.prevent="close">&#x2715</a>
    </div>
    <div class="feedback-body">
		<template v-if="shown">
			<div v-html="source.promptText"></div>
			<div style="margin-bottom:20px" />
			<div class="control-group" style="">
				<label v-html="source.labelText" /> 
				<div class="input-group">
					<textarea rows="5" maxlength="2048" v-model="value" style="height: 92px;max-height:400px" v-auto-size="true" />
				</div>
			</div>
			<button class="btn btn-primary" :disabled="noValue" @click.prevent="submit" v-text="source.buttonText" />
			<include v-if="source.externalFragment" :src="source.externalFragment"/>
			
		</template>
		<template v-else>
			<div class="thanks" v-html="source.thanks" />
			<button class="btn btn-primary" @click.prevent="close" v-text="closeText" />
		</template>
	</div>
</div>
`,
		components: {
		},
		props: {
			visible: Boolean,
			modelStack: Array,
			close: Function,
			source: Object
		},
		data() {
			return {
				value: "",
				shown: true
			};
		},
		computed: {
			noValue() { return !this.value; },
			closeText() { return locale.$Close; }
		},
		methods: {
			text(key) {
				return locale[key];
			},
			refresh() {
			},
			loadfeedbacks() {

			},
			submit() {
				const root = window.$$rootUrl;
				const url = urlTools.combine(root, '_shell/savefeedback');
				const that = this;
				let jsonData = utils.toJson({ text: this.value });
				dataService.post(url, jsonData).then(function (result) {
					//that.trace.splice(0, that.trace.length);
					//console.dir(result);
					that.shown = false;
					that.value = '';
					//result.forEach((val) => {
						//that.trace.push(val);
					//});
				}).catch(function (result) {
					console.dir(result);
					that.$parent.$alert(that.source.alert);
					that.close();
					//alert('Щось пішло не так. Спробуйте ще через декілька хвилин');
				});

			}
		},
		watch: {
			visible(val) {
				if (!val) return;
				this.shown = true;
				this.value = '';
				// load my feedbacks
				this.loadfeedbacks();
			}
		},
		created() {
		}
	});
})();

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180821-7280
// components/doctitle.js*/

(function () {

	const documentTitle = {
		render() {
			return null;
		},
		props: ['page-title'],
		watch: {
			pageTitle(newValue) {
				this.setTitle();
			}
		},
		methods: {
			setTitle() {
				if (this.pageTitle)
					document.title = this.pageTitle;
			}
		},
		created() {
			this.setTitle();
		}
	};

	app.components['std:doctitle'] = documentTitle;

})();
// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

// 20200224-7635
// components/a2-span-sum.js*/

(function () {
	Vue.component('a2-span-sum', {
		props: {
			content: [String, Number],
			dir: Number
		},
		render(h, ctx) {
			let children = [];
			children.push(h('span', {
				domProps: { innerText: this.content }
			}));
			let dcls = 'span-sum ';
			if (this.dir > 0) {/* in */
				children.push(h('i', { 'class': 'ico ico-arrow-up-green' }));
				dcls += 'in';
			}
			else if (this.dir < 0) { /* out */
				children.push(h('i', { 'class': 'ico ico-arrow-down-red' }));
				dcls += 'out';
			}
			else if (this.dir === 0) { /* inout */
				children.push(h('i', { 'class': 'ico ico-arrow-sort' }));
				dcls += 'inout';
			}
			return h('span', { class: dcls}, children);
		}
	});
})();
// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200930-7708
// components/megamenu.js


(function () {

	const utils = require('std:utils');
	const menuTemplate =
`<div class="dropdown-menu menu" role="menu">
	<div class="super-menu" :class="cssClass" :style="cssStyle">
		<div v-for="(m, mx) of topMenu" :key="mx" class="menu-group">
			<div class="group-title" v-text="m.Name"></div>
			<template v-for="(itm, ix) in m.menu">
				<div class="divider" v-if=isDivider(itm) ></div>
				<slot name="item" :menuItem="itm" v-else></slot>
			</template>
		</div>
	</div>
</div>
`;

	Vue.component('mega-menu', {
		template: menuTemplate,
		props: {
			itemsSource: Array,
			groupBy: String,
			columns: Number,
			width: String
		},
		data() {
			return {

			};
		},
		computed: {
			cssClass() {
				let cls = 'cols-' + (this.columns || 1);
				if (this.width)
					cls += ' with-width';
				return cls;
			},
			cssStyle() {
				if (this.width)
					return { width: this.width };
				return undefined;
			},
			topMenu() {
				if (!this.itemsSource) return {};
				return this.itemsSource.reduce((acc, itm) => {
					let g = utils.simpleEval(itm, this.groupBy) || '';
					let ma = acc[g];
					if (ma)
						ma.menu.push(itm);
					else
						acc[g] = { Name: g, menu: [itm] };
					return acc;
				}, {});
			}
		},
		methods: {
			isDivider(itm) {
				return itm.Name === '-';
			}
		}
	});

})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180605-7327
// components/iframetarget.js*/

(function () {

	const eventBus = require('std:eventBus');

	Vue.component('a2-iframe-target', {
		template: `
<div class="frame-stack" v-if="visible">
	<iframe width="100%" height="100%" :src="iFrameUrl" frameborder="0" />
</div>
`,
		data() {
			return {
				iFrameUrl: ''
			};
		},
		computed: {
			visible() { return !!this.iFrameUrl; }
		},
		created() {
			eventBus.$on('openframe', (url) => {
				alert(url);
				this.iFrameUrl = url;
			});
		}
	});
})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190308-7461*/
/* directives/autosize.js */

Vue.directive('autoSize', {
	bind(el, binding, vnode) {
		if (!binding.value) return;

		el.style.overflowY = false;
		el._ops = {
			initHeight: -1,
			extraSpace: 0
		};

		el._autosize = function () {
			if (!el.offsetHeight)
				return;
			const ops = el._ops;
			if (ops.initHeight === -1) {
				ops.initHeight = el.offsetHeight;
			}
			el.style.height = ops.initHeight + "px";
			var needHeight = el.scrollHeight + ops.extraSpace;
			if (needHeight > ops.initHeight)
				el.style.height = needHeight + "px";
		};

		function onInput() {
			el._autosize();
		}

		function onAutoSize() {
			Vue.nextTick(() => el._autosize());
		}

		el.addEventListener("input", onInput);
		// Perhaps the value was set programmatically.
		el.addEventListener("autosize", onAutoSize);
	},

	inserted(el, binding) {
		if (!binding.value) return;
		let style = window.getComputedStyle(el);
		let es = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
		el._ops.extraSpace = es;
		setTimeout(() => el._autosize(), 1);
	}
});

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180212-7112*/
/* directives/disable.js */

Vue.directive('disable', {
    bind(el, binding, vnode) {

        function doDisable(event) {
            if (this.getAttribute('disabled')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
        }
        // with capture !!!
        el.addEventListener("click", doDisable, true);
    }
});


// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210209-7445*/
/* directives/dropdown.js */


Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		const popup = require('std:popup');
		let me = this;

		el._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');
		// el.focus(); // ???
		if (!el._btn) {
			console.error('DropDown does not have a toggle element');
		}

		popup.registerPopup(el);

		el._close = function (ev) {
			if (el._hide)
				el._hide();
			el.classList.remove('show');
		};

		el.addEventListener('click', function (event) {
			let trg = event.target;
			if (el._btn.disabled) return;
			while (trg) {
				if (trg === el._btn) break;
				if (trg === el) return;
				trg = trg.parentElement;
			}
			if (trg === el._btn) {
				event.preventDefault();
				event.stopPropagation();
				let isVisible = el.classList.contains('show');
				if (isVisible) {
					if (el._hide)
						el._hide();
					el.classList.remove('show');
				} else {
					// not nested popup
					let outer = popup.closest(el, '.popup-body');
					if (outer) {
						popup.closeInside(outer);
					} else {
						popup.closeAll();
					}
					if (el._show)
						el._show();
					el.classList.add('show');
				}
			}
		});
	},
	unbind(el) {
		const popup = require('std:popup');
		popup.unregisterPopup(el);
	}
});


// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190721-7507*/
/* directives/focus.js */

Vue.directive('focus', {

	bind(el, binding, vnode) {

		// selects all text on focus

		function doSelect(t) {
			if (!t.select) return;
			if (t._selectDone) return;
			t.select();
			t._selectDone = true;
		}

		el.addEventListener("focus", function (event) {
			// focus occurs before click!
			event.target.parentElement.classList.add('focus');
			if (el.__opts && el.__opts.mask) return;
			let target = event.target;
			target._selectDone = false;
			setTimeout(() => {
				doSelect(target);
			}, 0);
		}, false);

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = true;
			t.parentElement.classList.remove('focus');
		}, false);

		el.addEventListener("click", function (event) {
			if (el.__opts && el.__opts.mask) return;
			doSelect(event.target);
		}, false);
	},

	inserted(el) {
		el._selectDone = false;
		if (el.tabIndex === 1) {
			setTimeout(() => {
				if (el.focus) el.focus();
				if (el.select) el.select();
			}, 0);
		}
	}
});


Vue.directive('settabindex', {
	inserted(el) {
		if (el.tabIndex === 1) {
			setTimeout(() => {
				if (el.focus) el.focus();
			}, 0);
		}
	}
});

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* directives/lazy.js */

(function () {

	function updateLazy(arr) {
		if (arr && arr.$loadLazy) {
			arr.$loadLazy();
		}
	}

	Vue.directive('lazy', {
		componentUpdated(el, binding, vnode) {
			updateLazy(binding.value);
		},
		inserted(el, binding, vnode) {
			updateLazy(binding.value);
		}
	});
})();


// Copyright © 2018-2020 Alex Kukhtin. All rights reserved.

/*20200725-7693/
/* directives/pageorient.js */


(function () {

	const pageStyle = Symbol();

	let bindVal = null;
	let elemStyle = null;

	Vue.directive('page-orientation', {
		bind(el, binding) {
			bindVal = null;
			elemStyle = null;
			let style = document.createElement('style');
			style.innerHTML = `@page {size: A4 ${binding.value}; margin:1cm;}`;
			document.head.appendChild(style);
			el[pageStyle] = style;
		},

		unbind(el) {
			let style = el[pageStyle];
			if (style) {
				document.head.removeChild(style);
			}
		}
	});

	function resetScroll() {
		let el = document.getElementsByClassName("with-wrapper");
		if (el && el.length) {
			let spw = el[0];
			spw.scrollTo(0, 0);
		}
	}

	function createStyleText(zoom) {
		if (!bindVal) return null;
		let stv = `@media print {@page {size: ${bindVal.pageSize || 'A4'} ${bindVal.orientation}; margin:${bindVal.margin};}`;
		zoom = zoom || bindVal.zoom;
		if (zoom)
			stv += `.sheet-page > .sheet { zoom: ${zoom}; width: 1px;} .print-target {zoom: ${zoom}}`;
		stv += '}';
		return stv;
	}

	function calcPrintArea() {
		let div = document.createElement('div');
		div.classList.add('mm-100-100')
		document.body.appendChild(div);
		let rv = {
			w: (div.clientWidth - 5) / 100.0,
			h: (div.clientHeight - 5) / 100.0
		};
		document.body.removeChild(div);
		return rv;
	}

	function printEvent(ev) {
		// margin: 2cm;
		resetScroll();
		if (!bindVal) return;
		if (bindVal.zoom != 'auto') return;
		let ecls = document.getElementsByClassName('sheet');
		if (!ecls || !ecls.length) return;
		let tbl = ecls[0];
		let pageSize = { w: 210, h: 297 }; // A4
		let margin = { t: 10, r: 10, b: 10, l: 10 };
		if (bindVal.orientation === 'landscape')
			[pageSize.w, pageSize.h] = [pageSize.h, pageSize.w];
		let k = calcPrintArea();
		let wx = tbl.clientWidth / k.w;
		let hy = tbl.clientHeight / k.h;
		let zx = (pageSize.w - margin.l - margin.r - 5) / wx;
		let zy = (pageSize.h - margin.t - margin.b - 5) / hy;
		let z = Math.round(Math.min(zx, zy) * 1000) / 1000;
		elemStyle.innerHTML = createStyleText(z);
	}


	Vue.directive('print-page', {
		bind(el, binding) {
			let val = binding.value;
			bindVal = val;
			let stv = createStyleText();
			if (stv) {
				let style = document.createElement('style');
				style.innerHTML = stv;
				elemStyle = document.head.appendChild(style);
				el[pageStyle] = style;
			}
			window.addEventListener('beforeprint', printEvent);
		},

		unbind(el) {
			let style = el[pageStyle];
			if (style) {
				document.head.removeChild(style);
			}
			window.removeEventListener('beforeprint', printEvent);
		}
	});

})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190814-7522*/
/* directives/resize.js */

function findHandle(el) {
	for (let ch of el.childNodes) {
		if (ch.nodeType === Node.ELEMENT_NODE) {
			if (ch.classList.contains('drag-handle'))
				return ch;
		}
	}
	return null;
}

Vue.directive('resize', {
	unbind(el, binding, vnode) {
		let p = el._parts;
		if (p.mouseDown) {
			el.removeEventListener('mousedown', p.mouseDown, false);
		}
	},

	update(el) {

		const MIN_WIDTH = 20;

		if (!el._parts) return;
		let p = el._parts;
		if (p.init) return;
		p.init = true;

		let dataMinWidth = el.getAttribute('data-min-width');
		let secondMinWidth = el.getAttribute('second-min-width');
		let firstPaneWidth = el.getAttribute('first-pane-width');

		p.minWidth = getPixelWidth(p.grid, dataMinWidth);
		p.minWidth2 = getPixelWidth(p.grid, secondMinWidth);
		p.firstWidth = getPixelWidth(p.grid, firstPaneWidth);

		let p1w = Math.max(p.minWidth, p.firstWidth);
		p.grid.style.gridTemplateColumns = `${p1w}px ${p.handleWidth}px 1fr`;

		p.grid.style.visibility = 'visible';

		function getPixelWidth(grid, w) {
			w = w || '';
			if (w.indexOf('px') !== -1) {
				return Number.parseFloat(w);
			}
			let temp = document.createElement('div');
			temp.style.width = w;
			temp.style.position = 'absolute';
			temp.style.visibility = 'hidden';
			document.body.appendChild(temp);
			let cw = temp.clientWidth;
			temp.remove();
			if (!cw)
				return MIN_WIDTH;
			if (isNaN(cw))
				return MIN_WIDTH;
			return cw;
		}
	},

	inserted(el, binding, vnode) {

		const HANDLE_WIDTH = 6;

		let grid = el.parentElement;

		let parts = {
			handleWidth: HANDLE_WIDTH,
			grid: grid,
			handle: findHandle(grid),
			resizing: false,
			firstWidth: 0,
			minWidth: 0,
			minWidth2: 0,
			delta: 0,
			mouseDown: mouseDown,
			init: false,
			offsetX(event, useDx) {
				let dx = this.delta;
				let rc = this.grid.getBoundingClientRect();
				if (useDx) {
					let rt = event.target.getBoundingClientRect();
					dx = event.clientX - rt.left;
					this.delta = dx;
				}
				//console.dir(`x:${event.clientX}, rc.left:${rc.left}, rt.left:${rt.left}, dx:${dx}`);
				return event.clientX - rc.left - dx;
			},
			fitX(x) {
				if (x < this.minWidth)
					x = this.minWidth;
				let tcx = this.grid.clientWidth;
				if (x + this.handleWidth + this.minWidth2 > tcx)
					x = tcx - this.minWidth2 - this.handleWidth;
				return x;
			}
		};

		el._parts = parts;

		function mouseUp(event) {
			let p = el._parts;
			if (!p.resizing)
				return;
			event.preventDefault();
			p.handle.style.display = 'none';
			p.grid.style.cursor = 'default';
			let x = p.offsetX(event, false);
			x = p.fitX(x);
			p.grid.style.gridTemplateColumns = `${x}px ${p.handleWidth}px 1fr`;

			document.removeEventListener('mouseup', mouseUp);
			document.removeEventListener('mousemove', mouseMove);

			p.resizing = false;
		}

		function mouseMove(event) {
			let p = el._parts;
			if (!p.resizing)
				return;
			event.preventDefault();
			let x = p.offsetX(event, false);
			x = p.fitX(x);
			p.handle.style.left = x + 'px';
		}

		function mouseDown(event) {
			let p = el._parts;
			if (p.resizing)
				return;
			if (!p.handle)
				return;
			let t = event.target;
			if (!t.classList.contains('spl-handle')) {
				console.error('click out of splitter handle');
				return;
			}
			event.preventDefault();
			let x = p.offsetX(event, true);
			p.handle.style.left = x + 'px';
			p.handle.style.display = 'block';
			p.grid.style.cursor = 'w-resize';
			document.addEventListener('mouseup', mouseUp, false);
			document.addEventListener('mousemove', mouseMove, false);
			p.resizing = true;
		}

		el.addEventListener('mousedown', mouseDown, false);
	}
});


// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210220-7749*/
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

	const store = component('std:store');
	const documentTitle = component('std:doctitle', true /*no error*/);

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
				__testId__: null
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
				const root = this.$data;
				return root._exec_(cmd, arg, confirm, opts);
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
			$save(opts) {
				if (this.$data.$readOnly)
					return;
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
						self.$data.$setDirty(false);
						// data is a full model. Resolve requires only single element.
						let dataToResolve;
						let newId;
						for (let p in data) {
							// always first element in the result //TODO:check ????
							dataToResolve = data[p];
							newId = self.$data[p].$id; // new element
							if (dataToResolve)
								break;
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


			$invoke(cmd, data, base, opts) {
				let self = this;
				let root = window.$$rootUrl;
				const routing = require('std:routing');
				let url = `${root}/${routing.dataUrl()}/invoke`;
				let baseUrl = self.$indirectUrl || self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						if (utils.isObject(data))
							resolve(data);
						else if (utils.isString(data))
							resolve(data);
						else
							throw new Error('Invalid response type for $invoke');
					}).catch(function (msg) {
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
						self.$alertUi(msg);
					});
				});
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
				if (newWindow === true) {
					let nwin = window.open(url, "_blank");
					if (nwin)
						nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: url });
			},

			$navigateExternal(url, newWindow) {
				if (newWindow === true) {
					window.open(url, "_blank");
				}
				else
					window.location.assign(url);
			},

			$download(url) {
				const root = window.$$rootUrl;
				url = urltools.combine('/file', url.replace('.', '-'));
				window.location = root + url;
			},

			$file(url, arg, opts) {
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
					if (utils.isFunction(query)) {
						query = query();
					}
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
								} else {
									simpleMerge(arg, result);
								}
							});
						case 'edit-selected':
							if (argIsNotAnArray()) return;
							return __runDialog(url, arg.$selected, query, (result) => {
								arg.$selected.$merge(result);
								arg.__fireChange__('selected');
								if (opts && opts.reloadAfter) {
									that.$reload();
								}
							});
						case 'edit':
							if (argIsNotAnObject()) return;
							return __runDialog(url, arg, query, (result) => {
								if (result === 'reload')
									that.$reload();
								else if (arg.$merge && utils.isObjectExact(result))
									arg.$merge(result);
								else if (opts && opts.reloadAfter)
									that.$reload();
							});
						case 'copy':
							if (argIsNotAnObject()) return;
							let arr = arg.$parent;
							return __runDialog(url, arg, query, (result) => { arr.$append(result); });
						default: // simple show dialog
							return __runDialog(url, arg, query, (result) => {
								if (opts && opts.reloadAfter) {
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

				let cmd = 'show';
				let fmt = '';
				if (opts) {
					if (opts.export) {
						cmd = 'export';
						fmt = opts.format || '';
					} else if (opts.attach)
						cmd = 'attach';
					else if (opts.print)
						cmd = 'print';
				}

				const doReport = () => {
					let id = arg;
					if (arg && utils.isObject(arg))
						id = utils.getStringId(arg);
					const root = window.$$rootUrl;
					let url = `${root}/report/${cmd}/${id}`;
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
						}
						resolve(arr);
					}).catch(function (msg) {
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
				let nq = Object.assign({}, this.$baseQuery);
				for (let p in search) {
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
					$saveModified: this.$saveModified,
					$asyncValid: this.$asyncValid,
					$toast: this.$toast,
					$requery: this.$requery,
					$reload: this.$reload,
					$notifyOwner: this.$notifyOwner,
					$navigate: this.$navigate,
					$defer: platform.defer,
					$setFilter: this.$setFilter,
					$expand: this.$expand
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
// Copyright © 2020 Alex Kukhtin. All rights reserved.

/*20200604-7671*/
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
// Copyright © 2020 Alex Kukhtin. All rights reserved.

/*20200611-7672*/
/* controllers/navbar.js */

(function () {

	const locale = window.$$locale;
	const menu = component('std:navmenu');
	const eventBus = require('std:eventBus');
	const period = require('std:period');
	const store = component('std:store');
	const urlTools = require('std:url');
	const http = require('std:http');

	// a2-nav-bar
	const a2NavBar = {
		template: `
<ul class="nav-bar">
	<li v-for="(item, index) in menu" :key="index" :class="{active : isActive(item)}">
		<a :href="itemHref(item)" tabindex="-1" v-text="item.Name" @click.prevent="navigate(item)"></a>
	</li>
	<li class="aligner"/>
	<div class="nav-global-period" v-if="hasPeriod">
		<a2-period-picker class="drop-bottom-right pp-hyperlink pp-navbar" 
			display="namedate" :callback="periodChanged" prop="period" :item="that"/>
	</div>
	<li v-if="hasHelp()" :title="locale.$Help"><a :href="helpHref()" class="btn-help" rel="help" aria-label="Help" @click.prevent="showHelp()"><i class="ico ico-help"></i></a></li>
</ul>
`,
		props: {
			menu: Array,
			period: period.constructor,
			isNavbarMenu: Boolean
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			locale() { return locale; },
			hasPeriod() { return !!this.period; },
			that() { return this; }
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			isActive2(item) {
				return this.seg1 === item.Url;
			},
			itemHref: (item) => '/' + item.Url,
			navigate(item) {
				if (this.isActive(item))
					return;
				let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
				let savedUrl = localStorage.getItem(storageKey) || '';
				if (savedUrl && !menu.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menu.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			},
			showHelp() {
				window.open(this.helpHref(), "_blank");
			},
			helpHref() {
				let am = this.menu.find(x => this.isActive(x));
				if (am && am.Menu) {
					let am2 = am.Menu.find(x => this.isActive2(x));
					if (am2 && am2.Help)
						return urlTools.helpHref(am2.Help);
				}
				if (am && am.Help)
					return urlTools.helpHref(am.Help);
				return urlTools.helpHref('');
			},
			hasHelp() {
				if (!this.menu) return false;
				let am = this.menu.find(x => this.isActive(x));
				return am && am.Help;
			},
			periodChanged(period) {
				// post to shell
				http.post('/_application/setperiod', period.toJson())
					.then(() => {
						eventBus.$emit('globalPeriodChanged', period);
					})
					.catch((err) => {
						alert(err);
					});
			}
		}
	};

	// a2-nav-bar-page
	const a2NavBarPage = {
		template: `
<div class="menu-navbar-overlay" @click.stop=closeNavMenu>
<div class="menu-navbar" :class="{show:visible}">
<div class="menu-navbar-top">
	<a href='' class=menu-navbar-back @click.stop.prevent=closeNavMenu><i class="ico ico-grid2"></i></a>
	<h2 v-text=title></h2>
</div>
<ul class=menu-navbar-list>
	<li v-for="(item, index) in menu" :key=index>
		<a class="menu-navbar-link" :href="itemHref(item)" @click.prevent="navigate(item)" :class="{active : isActive(item)}">
			<i class="ico" :class=icoClass(item)></i>
			<span v-text="item.Name"></span>
		</a>
	</li>
</ul>
<div class="aligner"/>
<a class=powered-by-a2v10 href="https://a2v10.com" rel=noopener target=_blank><i class="ico ico-a2logo"></i> Powered by A2v10</a>
</div></div>
`,
		props: {
			menu: Array,
			isNavbarMenu: Boolean,
			title:String
		},
		data() {
			return {
				visible: false
			};
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			locale() { return locale; },
			that() { return this; }
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			isActive2(item) {
				return this.seg1 === item.Url;
			},
			itemHref: (item) => '/' + item.Url,
			icoClass(item) {
				return item.Icon ? 'ico-' + item.Icon : 'ico-empty';
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				this.closeNavMenu();
				let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
				let savedUrl = localStorage.getItem(storageKey) || '';
				if (savedUrl && !menu.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menu.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			},
			closeNavMenu() {
				this.visible = false;
				eventBus.$emit('clickNavMenu', false);
			}
		},
		mounted() {
			setTimeout(() => {
				this.visible = true;
			}, 5);
		}
	};

	app.components['std:navbar'] = {
		standardNavBar: a2NavBar,
		pageNavBar: a2NavBarPage
	};
})();	
// Copyright © 2020 Alex Kukhtin. All rights reserved.

/*20200611-7673*/
/* controllers/sidebar.js */

(function () {

	const menu = component('std:navmenu');
	const store = component('std:store');
	const urlTools = require('std:url');
	const htmlTools = require('std:html');

	const UNKNOWN_TITLE = 'unknown title';

	const sideBarBase = {
		props: {
			menu: Array,
			mode: String
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			sideMenu() {
				let top = this.topMenu;
				return top ? top.Menu : null;
			},
			topMenu() {
				let seg0 = this.seg0;
				return menu.findMenu(this.menu, (mi) => mi.Url === seg0);
			}
		},
		methods: {
			isActive(item) {
				let isActive = this.seg1 === item.Url;
				if (isActive)
					htmlTools.updateDocTitle(item.Name);
				return isActive;
			},
			isGroup(item) {
				if (!item.Params) return false;
				try {
					return JSON.parse(item.Params).group || false;
				} catch (err) {
					return false;
				}
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
			},
			itemHref(item) {
				let top = this.topMenu;
				if (top) {
					return urlTools.combine(top.Url, item.Url);
				}
				return undefined;
			},
			toggle() {
				this.$parent.sideBarCollapsed = !this.$parent.sideBarCollapsed;
				try {
					// avoid EDGE error QuotaExceeded
					localStorage.setItem('sideBarCollapsed', this.$parent.sideBarCollapsed);
				}
				catch (e) {
					// do nothing
				}
			}
		}
	};

	const a2SideBar = {
		//TODO: 
		// 1. various menu variants
		// 2. folderSelect as function 
		template: `
<div :class="cssClass">
	<a href role="button" class="ico collapse-handle" @click.prevent="toggle"></a>
	<div class="side-bar-body" v-if="bodyIsVisible">
		<tree-view :items="sideMenu" :is-active="isActive" :is-group="isGroup" :click="navigate" :get-href="itemHref"
			:options="{folderSelect: folderSelect, label: 'Name', title: 'Description',
			subitems: 'Menu', expandAll:true,
			icon:'Icon', wrapLabel: true, hasIcon: true}">
		</tree-view>
	</div>
	<div v-else class="side-bar-title" @click.prevent="toggle">
		<span class="side-bar-label" v-text="title"></span>
	</div>
</div>
`,
		mixins: [sideBarBase],
		computed: {
			bodyIsVisible() {
				return !this.$parent.sideBarCollapsed || this.compact;
			},
			compact() {
				return this.mode === 'Compact';
			},
			title() {
				let sm = this.sideMenu;
				if (!sm)
					return UNKNOWN_TITLE;
				let seg1 = this.seg1;
				let am = menu.findMenu(sm, (mi) => mi.Url === seg1);
				if (am)
					return am.Name || UNKNOWN_TITLE;
				return UNKNOWN_TITLE;
			},
			cssClass() {
				let cls = 'side-bar';
				if (this.compact)
					cls += '-compact';
				return cls + (this.$parent.sideBarCollapsed ? ' collapsed' : ' expanded');
			}
		},
		methods: {
			folderSelect(item) {
				return !!item.Url;
			}
		}
	};

	const a2TabSideBar = {
		template: `
<div class="side-bar-top">
	<div class="a2-tab-bar">
		<div v-for="mi in topMenu.Menu" class="a2-tab-bar-item">
			<a :href="itemHref(mi)" @click.stop.prevent="navigate(mi)" v-text=mi.Name class="a2-tab-button" :class="{active: isActive(mi)}"></a>
		</div>
	</div>
</div>
`,
		mixins: [sideBarBase],
		computed: {
		},
		methods: {
		}
	};


	app.components['std:sidebar'] = {
		standardSideBar: a2SideBar,
		compactSideBar: a2SideBar,
		tabSideBar: a2TabSideBar
	};
})();	
// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

/*20200516-7660*/
/* mobile/shell.js */


/*TODO:
3. AppKeyMobile
 */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const popup = require('std:popup');
	const urlTools = require('std:url');
	const period = require('std:period');
	const log = require('std:log');
	const utils = require('std:utils');
	const platform = require('std:platform');

	const UNKNOWN_TITLE = 'unknown title';

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
		let am = null;
		if (seg1)
			am = menu.find((mi) => mi.Url === seg1);
		if (!am) {
			// no segments - find first active menu
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

	const a2MobileMenu = {
		template: `
<div>
<transition name="fade">
	<div class="menu-overlay" @click.stop.prevent="hideMenu" v-if="visible">
	</div>
</transition>
<transition name="slide">
<div class="menu-container" v-if="visible">
	<ul class="menu-view">
		<li v-for="m in menu">
			<template v-if="m.Menu">
				<div class="menu-folder" v-text="m.Name"></div>
				<ul class="menu-view">
					<li v-for="sm in m.Menu">
						<a href="" :class="{active: isActive(m.Url, sm.Url)}" @click.stop.prevent="navigateMenu(m.Url, sm.Url)">
							<i class="ico" :class="'ico-'+sm.Icon"></i><span class="menu-text" v-text="sm.Name"></span>
						</a>
					</li>
				</ul>
			</template>
			<a v-else href=""  :class="{active: isActive(m.Url)}" @click.stop.prevent="navigateMenu(m.Url)">
				<i class="ico" :class="'ico-'+m.Icon"></i><span class="menu-text" v-text="m.Name"></span>
			</a>
		</li>
		<li class="group">
			<form id="logoutForm" method="post" action="/account/logoff">
				<a href="javascript:document.getElementById('logoutForm').submit()" tabindex="-1" class="dropdown-item"><i class="ico ico-exit"></i><span class=menu-text v-text="locale.$Quit"/></a>
			</form>
		</li>
	</ul>
</div>
</transition>
</div>
`,
		store,
		props: {
			menu: Array,
			visible: Boolean,
			hide: Function,
			navigate: Function
		},
		methods: {
			hideMenu() {
				if (this.hide)
					this.hide();
			},
			navigateMenu(s1, s2) {
				if (this.navigate)
					this.navigate(this.makeUrl(s1, s2));
			},
			makeUrl(s1, s2) {
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, s1);
				if (s2)
					url = urlTools.combine(root, s1, s2);
				return url;
			},
			isActive(s1, s2) {
				if (s2)
					return s1 === this.seg0 && s2 === this.seg1;
				else
					return s1 === this.seg0;
			}
		},
		computed: {
			seg0() {
				return this.$store.getters.seg0;
			},
			seg1() {
				return this.$store.getters.seg1;
			},
			locale() {
				return window.$$locale;
			}
		}
	};

	const contentView = {
		render(h) {
			return h('div', {
				attrs: {
					class: 'content-view'
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
		}
	};

	const a2MainViewMobile = {
		store,
		template: `
<div :class="cssClass" class="main-view">
	<a2-content-view></a2-content-view>
	<div class="load-indicator" v-show="pendingRequest"></div>
	<div class="modal-stack" v-if="hasModals">
		<div class="modal-wrapper modal-animation-frame" v-for="dlg in modals" :class="{show: dlg.wrap}">
			<a2-modal :dialog="dlg"></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-content-view': contentView,
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
			period: period.constructor
		},
		data() {
			return {
				menuVisible: false,
				requestsCount: 0,
				modals: [],
				modalRequeryUrl: ''
			};
		},
		computed: {
			route() {
				return this.$store.getters.route;
			},
			cssClass() {
				return undefined;
			},
			pendingRequest() { return !this.hasModals && this.requestsCount > 0; },
			hasModals() { return this.modals.length > 0; }
		},
		methods: {
			setupWrapper(dlg) {
				this.modalRequeryUrl = '';
				setTimeout(() => {
					dlg.wrap = true;
					//console.dir("wrap:" + dlg.wrap);
				}, 50); // same as modal
			}
		},
		created() {
			let me = this;
			eventBus.$on('beginRequest', function () {
				//if (me.hasModals)
				//return;
				me.requestsCount += 1;
			});
			eventBus.$on('endRequest', function () {
				//if (me.hasModals)
				//return;
				me.requestsCount -= 1;
			});

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				url = store.replaceUrlQuery(url, prms.query);
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap: false };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
				me.setupWrapper(dlg);
			});

			eventBus.$on('modaldirect', function (modal, prms) {
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal);
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap: false };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
				me.setupWrapper(dlg);
			});

			eventBus.$on('modalSetAttribites', function (attr, instance) {
				if (!me.modals.length || !attr || !instance)
					return;
				let dlg = me.modals[me.modals.length - 1];
				dlg.attrs = instance.__parseControllerAttributes(attr);
			});

			eventBus.$on('modalCreated', function (instance) {
				// include instance!
				if (!me.modals.length)
					return;
				let dlg = me.modals[me.modals.length - 1];
				dlg.instance = instance;
			});

			eventBus.$on('isModalRequery', function (arg) {
				if (arg.url && me.modalRequeryUrl && me.modalRequeryUrl === arg.url)
					arg.result = true;
			});

			eventBus.$on('modalRequery', function (baseUrl) {
				if (!me.modals.length)
					return;
				let dlg = me.modals[me.modals.length - 1];
				let inst = dlg.instance; // include instance
				if (inst && inst.modalRequery) {
					if (baseUrl)
						dlg.url = baseUrl;
					me.modalRequeryUrl = dlg.url;
					inst.modalRequery();
				}
			});

			eventBus.$on('modalSetBase', function (baseUrl) {
				if (!me.modals.length)
					return;
				let dlg = me.modals[me.modals.length - 1];
				dlg.url = baseUrl;
			});

			eventBus.$on('modalClose', function (result) {

				if (!me.modals.length) return;
				const dlg = me.modals[me.modals.length - 1];

				function closeImpl(closeResult) {
					let dlg = me.modals.pop();
					if (closeResult)
						dlg.resolve(closeResult);
				}

				if (!dlg.attrs) {
					closeImpl(result);
					return;
				}

				if (dlg.attrs.alwaysOk)
					result = true;

				if (dlg.attrs.canClose) {
					let canResult = dlg.attrs.canClose();
					//console.dir(canResult);
					if (canResult === true)
						closeImpl(result);
					else if (canResult.then) {
						result.then(function (innerResult) {
							if (innerResult === true)
								closeImpl(result);
							else if (innerResult) {
								closeImpl(innerResult);
							}
						});
					}
					else if (canResult)
						closeImpl(canResult);
				} else {
					closeImpl(result);
				}
			});

			eventBus.$on('modalCloseAll', function () {
				while (me.modals.length) {
					let dlg = me.modals.pop();
					dlg.resolve(false);
				}
			});

			eventBus.$on('confirm', function (prms) {
				let dlg = prms.data;
				dlg.wrap = false;
				dlg.promise = new Promise(function (resolve) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
				me.setupWrapper(dlg);
			});
		}
	};

	const shell = Vue.extend({
		components: {
			'a2-main-view-mobile': a2MainViewMobile,
			"a2-mobile-menu": a2MobileMenu
		},
		store,
		data() {
			return {
				menuVisible: false,
				requestsCount: 0,
				loadsCount: 0,
				debugShowTrace: false,
				debugShowModel: false,
				globalPeriod: null,
				dataCounter: 0,
				traceEnabled: log.traceEnabled()
			};
		},
		computed: {
			processing() { return !this.hasModals && this.requestsCount > 0; },
			modelStack() {
				return this.__dataStack__;
			},
			pageTitle() {
				let seg0 = this.$store.getters.seg0;
				let seg1 = this.$store.getters.seg1;
				for (let m of this.menu) {
					if (m.Url === seg0) {
						if (!seg1 || !m.Menu)
							return m.Name;
						for (let sm of m.Menu) {
							if (sm.Url === seg1)
								return `${m.Name} / ${sm.Name}`;
						}
					}
				}
				return '';
			}
		},
		watch: {
			traceEnabled(val) {
				log.enableTrace(val);
			}
		},
		methods: {
			about() {
				this.menuVisible = false;
				this.$store.commit('navigate', { url: '/app/about' });
			},
			appLink(lnk) {
				this.menuVisible = false;
				this.$store.commit('navigate', { url: lnk.url });
			},
			navigate(url) {
				this.$store.commit('navigate', { url: url });
			},
			showMenu() {
				this.menuVisible = true;
			},
			hideMenu() {
				this.menuVisible = false;
			},
			navigateMenu(url) {
				this.navigate(url);
				this.hideMenu();
			},
			root() {
				let opts = { title: null };
				let currentUrl = this.$store.getters.url;
				let menuUrl = makeMenuUrl(this.menu, '/', opts);
				if (currentUrl === menuUrl) {
					return; // already in root
				}
				this.$store.commit('navigate', { url: makeMenuUrl(this.menu, '/', opts), title: opts.title });
			},
			debugOptions() {
				alert('debug options');
			},
			debugTrace() {
				if (!window.$$debug) return;
				this.debugShowModel = false;
				this.debugShowTrace = !this.debugShowTrace;
			},
			debugModel() {
				if (!window.$$debug) return;
				this.debugShowTrace = false;
				this.debugShowModel = !this.debugShowModel;
			},
			debugClose() {
				this.debugShowModel = false;
				this.debugShowTrace = false;
			},
			$alert(msg, title, list) {
				let dlgData = {
					promise: null, data: {
						message: msg, title: title, style: 'alert', list: list
					}
				};
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			}
		},
		created() {
			let me = this;
			if (this.initialPeriod) {
				this.globalPeriod = new period.constructor(this.initialPeriod);
			}

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

			eventBus.$on('registerData', function (component, out) {
				me.dataCounter += 1;
				if (component) {
					if (me.__dataStack__.length > 0)
						out.caller = me.__dataStack__[0];
					me.__dataStack__.unshift(component);
				} else {
					me.__dataStack__.shift(component);
				}
			});


			popup.startService();

			eventBus.$on('beginRequest', () => {
				me.requestsCount += 1;
				window.__requestsCount__ = me.requestsCount;
			});
			eventBus.$on('endRequest', () => {
				me.requestsCount -= 1;
				window.__requestsCount__ = me.requestsCount;
			});

			eventBus.$on('beginLoad', () => {
				if (window.__loadsCount__ === undefined)
					window.__loadsCount__ = 0;
				me.loadsCount += 1;
				window.__loadsCount__ = me.loadsCount;
			});
			eventBus.$on('endLoad', () => {
				me.loadsCount -= 1;
				window.__loadsCount__ = me.loadsCount;
			});

			eventBus.$on('closeAllPopups', popup.closeAll);

			let opts = { title: null };
			let newUrl = makeMenuUrl(this.menu, urlTools.normalizeRoot(window.location.pathname), opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

			let firstUrl = {
				url: '',
				title: ''
			};

			firstUrl.url = makeMenuUrl(this.menu, '/', opts);
			firstUrl.title = opts.title;
			urlTools.firstUrl = firstUrl;
		}
	});

	app.components['std:shellController'] = shell;
})();	
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20181115-7578*/

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');

	let __lastInvokeResult = undefined;

	window.__tests__ = {
		$navigate: navigate,
		$isReady: function () {
			//console.dir('from isReady:' + window.__requestsCount__);
			return document.readyState === 'complete' &&
				window.__requestsCount__ + window.__loadsCount__ === 0;
		},
		$invoke: function (args) {
			if (args.target === 'shell') 
				invoke(args);
			else
				eventBus.$emit('invokeTest', args);
			return args.result;
		},
		$lastResult() {
			return __lastInvokeResult;
		}
	};

	function navigate(url) {
		store.commit('navigate', { url: url });
	}

	function invoke(args) {
		__lastInvokeResult = undefined;
		const http = require('std:http');
		const root = window.$$rootUrl;
		const routing = require('std:routing');
		const url = `${root}/${routing.dataUrl()}/invoke`;
		const data = {
			cmd: args.cmd,
			baseUrl: `/_page${args.path}/index/${args.id}`,
			data: null
		};
		http.post(url, JSON.stringify(data))
			.then(r => {
				args.result = `success:${r}`;
				__lastInvokeResult = args.result;
			})
			.catch(err => {
				args.result = `error:${err}`;
				__lastInvokeResult = args.result;
			});
	}

})();