// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250121-7976
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
// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250421-7976
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

	let td = new Date(0, 0, 1, 0, 0, 0, 0);

	date.isZero = date.isZero || function () {
		return this.getTime() === td.getTime();
	};

	date.toJSON = function (key) {
		// we need local time as UTC+0
		// sv locale is used to get ISO format
		return this.toLocaleString('sv').replace(' ', 'T') + '.000';
	};

})(Date.prototype);


// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

/*20231005-7950*/
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

// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250822-7982
// services/utils.js

app.modules['std:utils'] = function () {

	const locale = require('std:locale');
	const platform = require('std:platform');
	const dateLocale = locale.$DateLocale || locale.$Locale;
	const numLocale = locale.$NumberLocale || locale.$Locale;

	const _2digit = '2-digit';

	const dateOptsDate = { year: 'numeric', month: _2digit, day: _2digit };
	const dateOptsTime = { hour: _2digit, minute: _2digit };
	const dateOptsTime2 = { hour: _2digit, minute: _2digit, second: _2digit };
	
	const formatDate = new Intl.DateTimeFormat(dateLocale, dateOptsDate).format;
	const formatTime = new Intl.DateTimeFormat(dateLocale, dateOptsTime).format;
	const formatTime2 = new Intl.DateTimeFormat(dateLocale, dateOptsTime2).format;

	const currencyFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 2, maximumFractionDigits: 6, useGrouping: true }).format;
	const nf = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 6, useGrouping: true });
	const numberFormat = nf.format;

	const parts = nf.formatToParts(1000.5);
	const decimalSymbol = parts[3].value;
	const groupingSymbol = parts[1].value;

	const utcdatRegEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?$/;

	let numFormatCache = {};

	const zeroDate = new Date(0, 0, 1, 0, 0, 0, 0);

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
		isPrimitiveCtor,
		isDateCtor,
		isEmptyObject,
		defineProperty: defProperty,
		eval: evaluate,
		simpleEval,
		format: format,
		convertToString,
		toNumber,
		parse,
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
			format: formatDateWithFormat,
			add: dateAdd,
			diff: dateDiff,
			create: dateCreate,
			createTime: dateCreateTime,
			compare: dateCompare,
			endOfMonth: endOfMonth,
			minDate: dateCreate(1901, 1, 1),
			maxDate: dateCreate(2999, 12, 31),
			fromDays: fromDays,
			parseTime: timeParse,
			fromServer: dateFromServer,
			int2time,
			time2int
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
		mergeTemplate,
		mapTagColor
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
				case 'boolean':
					obj[key] = false;
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
				return '';
			r = r[ps[i]];
		}
		return r;
	}

	function evaluate(obj, path, dataType, opts, skipFormat) {
		let r = simpleEval(obj, path);
		if (skipFormat) return r;
		if (isDate(r))
			return format(r, dataType, opts);
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
			case 'Percent':
				return toNumber(obj) / 100.0;
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

	function formatDateFormat2(date, format) {
		if (!date) return '';
		const parts = {
			yyyy: date.getFullYear(),
			yy: ('' + date.getFullYear()).substring(2),
			MM: pad2(date.getMonth() + 1),
			dd: pad2(date.getDate()),
			HH: pad2(date.getHours()),
			hh: pad2(date.getHours() > 12 ? date.getHours() - 12 : date.getHours()),
			mm: pad2(date.getMinutes()),
			ss: pad2(date.getSeconds()),
			tt: date.getHours() < 12 ? 'AM' : 'PM'
		};
		return format.replace(/yyyy|yy|MM|dd|HH|hh|mm|ss|tt/g, (match) => parts[match]);
	}

	function formatDateWithFormat(date, format) {
		if (!format)
			return formatDate(date);
		switch (format) {
			case 'dd.MM':
				return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`;
			case 'ddMMyyyy':
				return '' + pad2(date.getDate()) + pad2(date.getMonth() + 1) + date.getFullYear();
			case 'dd.MM.yyyy HH:mm:ss':
				return `${formatDate(date)}  ${formatTime2(date)}`;
			case 'MM.yyyy':
				return `${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
			case 'MMMM yyyy':
				return capitalize(date.toLocaleDateString(locale.$Locale, { month: 'long', year: 'numeric' }));
			default:
				return formatDateFormat2(date, format);
		}
		return formatDate(date);
	}

	function convertToString(obj) {
		if (!obj)
			return '';
		if (isObjectExact(obj) && 'Name' in obj)
			return obj.Name;
		else if (isDate(obj))
			return formatDate(obj);
		return '' + val;
	}

	function format(obj, dataType, opts) {
		opts = opts || {};
		if (!dataType)
			return obj;
		if (!isDefined(obj))
			return '';
		switch (dataType) {
			case "DateTime":
			case "DateTime2":
				if (!obj) return '';
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				if (opts.format)
					return formatDateWithFormat(obj, opts.format);
				let fnTime = dataType === "DateTime2" ? formatTime2 : formatTime;
				return `${formatDate(obj)} ${fnTime(obj)}`;
			case "Date":
				if (!obj) return '';
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
					return obj.toJSON();
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
			case 'Percent':
				if (!isNumber(obj))
					obj = toNumber(obj);
				if (opts.hideZeros && obj === 0)
					return '';
				return formatNumber((+obj) * 100, opts.format) + '%';
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
		if (isString(val)) {
			val = val.replaceAll(groupingSymbol, '');
			val = val.replace(/\s|%/g, '').replace(',', '.');
		}
		return isFinite(val) ? +val : 0;
	}

	function dateToday() {
		let td = new Date();
		td.setHours(0, 0, 0, 0);
		return td;
	}

	function dateNow(second) {
		let td = new Date();
		let sec = second ? td.getSeconds() : 0;
		return new Date(td.getFullYear(), td.getMonth(), td.getDate(), td.getHours(), td.getMinutes(), sec, 0);
	}

	function dateZero() {
		return zeroDate;
	}

	function dateTryParse(str) {
		if (!str) return dateZero();
		if (isDate(str)) return str;

		if (utcdatRegEx.test(str)) {
			return dateFromServer(str);
		}

		let dt;
		if (str.length === 8) {
			dt = new Date(+str.substring(0, 4), +str.substring(4, 6) - 1, +str.substring(6, 8), 0, 0, 0, 0);
		} else if (str.startsWith('\"\\/\"')) {
			dt = dateFromServer(str.substring(4, str.length - 4));
		} else {
			dt = dateFromServer(str);
		}
		if (!isNaN(dt.getTime())) {
			return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
		}
		return str;
	}

	function string2Date(str) {
		try {
			let dt = new Date(str);
			dt.setHours(0, 0, 0, 0);
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
		let td = new Date(+normalizeYear(seg[2]), +((seg[1] ? seg[1] : 1) - 1), +seg[0], 0, 0, 0, 0);
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
		if (d1 === null) return true;
		if (!isDate(d1)) return false;
		return dateEqual(d1, dateZero());
	}

	function dateHasTime(d1) {
		if (!isDate(d1)) return false;
		return d1.getHours() !== 0 || d1.getMinutes() !== 0 && d1.getSeconds() !== 0;
	}

	function endOfMonth(dt) {
		var dte = new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 0, 0, 0);
		return dte;
	}

	function dateCreate(year, month, day) {
		let dt = new Date(year, month - 1, day, 0, 0, 0, 0);
		return dt;
	}

	function dateCreateTime(year, month, day, hour, min, sec) {
		let dt = new Date(year, month - 1, day, hour || 0, min || 0, sec || 0, 0);
		return dt;
	}

	function dateFromServer(src) {
		if (isDate(src))
			return src;
		let dx = new Date(src);
		return dx;
	}

	function dateDiff(unit, d1, d2) {
		if (d1.getTime() > d2.getTime())
			[d1, d2] = [d2, d1];
		let tz1 = d1.getTimezoneOffset();
		let tz2 = d2.getTimezoneOffset();
		let timezoneDiff = (tz1 - tz2) * 60 * 1000;
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
				return Math.floor((d2 - d1 + timezoneDiff) / du);
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
		return new Date(1900, 0, days, 0, 0, 0, 0);
	}

	function dateAdd(dt, nm, unit) {
		if (!isDate(dt))
			return null;
		var du = 0;
		switch (unit) {
			case 'year':
				return new Date(dt.getFullYear() + nm, dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
			case 'month':
				// save day of month
				let newMonth = dt.getMonth() + nm;
				let day = dt.getDate();
				var ldm = new Date(dt.getFullYear(), newMonth + 1, 0, 0, 0).getDate();
				if (day > ldm)
					day = ldm;
				var dtx = new Date(dt.getFullYear(), newMonth, day, 0, 0, 0);
				return dtx;
			case 'day':
				// Daylight time!!!
				return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + nm, 0, 0, 0, 0);
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
		if (!text) return text;
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
		return function (arg) {
			clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn.call(undefined, arg);
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
			return NaN;
		if (!isDefined(digits))
			digits = 2;
		let m = false;
		if (n < 0) {
			n = -n;
			m = true;
		}
		// avoid js rounding error
		const exp = Math.floor(Math.log2(n));
		const eps = Math.pow(2, exp - 52);
		n += eps; 
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
			delegates: assign(src.delegates, tml.delegates),
			options: assign(src.options, tml.options)
		});
	}

	function mapTagColor(style) {
		let tagColors = {
			'cyan': '#60bbe5',
			'green': '#5db750',
			'olive': '#b5cc18',
			'white': '#ffffff',
			'teal': '#00b5ad',
			'tan': '#d2b48c',      // tan,
			'red': '#da533f',
			'blue': '#6495ed',     //cornflowerblue
			'orange': '#ffb74d',
			'seagreen': '#8fbc8f', // darkseagreen
			'null': '#8f94b0',
			'gold': '#eac500',
			'salmon': '#fa8072',   //salmon
			'purple': '#9370db',   // mediumpurple
			'pink': '#ff69b4',     // hotpink
			'magenta': '#8b008b',  // darkmagenta
			'lightgray': '#cccccc'
		};
		return tagColors[style || 'null'] || '#8f94b0';
	}

	function int2time(val) {
		if (!val) return '';
		let h = Math.floor(val / 60), m = val % 60;
		if (m < 10)
			m = '0' + m;
		return (h || m) ? `${h}:${m}` : '';
	}

	function time2int(val) {
		let v = (val || '').split(':');
		let h = v[0], m = 0;
		if (v.length > 1)
			m = v[1];
		return +h * 60 + (+m);
	}
};

// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

/*20250913-7983*/
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
		} else if (Array.isArray(obj)) {
			return obj.map(x => x.Id).join(',');
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






// Copyright © 2015-2021 Oleksandr Kukhtin. All rights reserved.

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


// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250627-7982
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
				let fv = mi.Filter[p];
				if (fv && fv.call)
					fv = fv.call(this);
				x[p] = fv;
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
		Object.keys(f).filter(k => k.startsWith('Period')).forEach(k => {
			let p = f[k];
			if (period.like(p))
				f[k] = new period.constructor(p);
			return obj;
		});
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


// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20240705-7969
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
		let appver = '';
		let modulever = '';
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
			appver = response.headers.get("app-version") || '';
			modulever = response.headers.get("module-version") || '';
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
			if (!skipEvents) {
				eventBus.$emit('endRequest', url);
				if (appver || modulever)
					eventBus.$emit('checkVersion', { app: appver, module: modulever });
			}
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
						resolve(false, null);
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
					let ve = null;
					if (fec && fec.__vue__) {
						ve = fec.__vue__;
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
					resolve(ve);
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





// Copyright © 2015-2021 Oleksandr Kukhtin. All rights reserved.

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
// Copyright © 2015-2021 Oleksandr Kukhtin. All rights reserved.

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
		removeWeak,
		revalidate
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

	function revalidate(item, key, templ) {
		if (!validateMap || !key || !templ || !templ.validators) return;
		let rule = templ.validators[key];
		if (!rule) return;

		function doIt(rule) {
			let elem = validateMap.get(rule);
			if (!elem)
				return;
			if (elem.has(item)) {
				let xval = elem.get(item);
				if (xval) {
					xval.val = undefined;
					xval.result = null;
				}
			}
		}

		if (utils.isArray(rule)) {
			rule.forEach(r => {
				if (utils.isObject(r) && validateMap.has(r)) {
					doIt(r);
				}
			});
		} else if (utils.isObject(rule) && validateMap.has(rule)) {
			doIt(rule);
		}
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
							if (result) {
								dm.msg = result;
								valRes.result = dm;
								retval.push(dm);
								nu = true;
							}
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



// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180813-7271
// components/collectionview.js

/*
TODO:
11. GroupBy
*/

(function () {


	const log = require('std:log');
	const utils = require('std:utils');
	const period = require('std:period');

	const DEFAULT_PAGE_SIZE = 20;

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
		let nq = { dir: that.dir, order: that.order, offset: that.offset };
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
				else {
					filter[x] = q[x];
				}
			}
		}
	}

	// client collection

	Vue.component('collection-view', {
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
					let d = this.dir === 'asc';
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
				log.time('get paged source:', s);
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
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				let nq = this.makeNewQuery();
				if (nq.order === order)
					nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
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
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialFilter: Object
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
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				if (order === this.order) {
					let dir = this.dir === 'asc' ? 'desc' : 'asc';
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
				if ('Offset' in mi)
					setModelInfoProp(this.ItemsSource, 'Offset', 0);
				this.reload();
			},
			reload() {
				this.$root.$emit('cwChange', this.ItemsSource);
			},
			updateFilter() {
				let mi = this.ItemsSource.$ModelInfo;
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
		},
		updated() {
			this.updateFilter();
		}
	});
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180426-7166
/*statdalony/pager.js*/

Vue.component('a2-pager', {
	props: {
		source: Object,
		noElements: String,
		elements: String
	},
	computed: {
		pages() {
			return Math.ceil(this.count / this.source.pageSize);
		},
		currentPage() {
			return Math.ceil(this.offset / this.source.pageSize) + 1;
		},
		title() {
			let lastNo = Math.min(this.count, this.offset + this.source.pageSize);
			if (!this.count)
				return this.noElements;
			return `${this.elements}: <b>${this.offset + 1}</b>-<b>${lastNo}</b> з <b>${this.count}</b>`;
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
			this.source.$setOffset(offset);
		},
		isActive(page) {
			return page === this.currentPage;
		},
		click(arg, $ev) {
			$ev.preventDefault();
			switch (arg) {
				case 'prev':
					if (this.offset === 0) return;
					this.setOffset(this.offset - this.source.pageSize);
					break;
				case 'next':
					if (this.currentPage >= this.pages) return;
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
			class: 'pagination pagination-sm'
		};
		let children = [];
		const dotsClass = { 'class': 'pagination-dots' };
		const renderBtn = (page) => {
			return h('li', { class: { active: this.isActive(page) }},
				[h('a', {
					domProps: { innerText: page },
					on: { click: ($ev) => this.goto(page, $ev) },
					attrs: { href:"#" }
				})]
			);
		};
		// prev
		children.push(h('li', { class: { disabled: this.offset === 0 } },
			[h('a', {
				on: { click: ($ev) => this.click('prev', $ev) },
				attrs: { 'aria-label': 'Previous', href: '#' },
				domProps: { innerHTML: '&laquo;' }
			})]
		));
		// first
		if (this.pages > 0)
			children.push(renderBtn(1));
		if (this.pages > 1)
			children.push(renderBtn(2));
		// middle
		let ms = Math.max(this.currentPage - 2, 3);
		let me = Math.min(ms + 5, this.pages - 1);
		if (me - ms < 5)
			ms = Math.max(me - 5, 3);
		if (ms > 3)
			children.push(h('li', dotsClass, [h('span', null, '...')]));
		for (let mi = ms; mi < me; ++mi) {
			children.push(renderBtn(mi));
		}
		if (me < this.pages - 1)
			children.push(h('li', dotsClass, [h('span', null, '...')]));
		// last
		if (this.pages > 3)
			children.push(renderBtn(this.pages - 1));
		if (this.pages > 2)
			children.push(renderBtn(this.pages));
		// next
		children.push(h('li', {
			class: { disabled: this.currentPage >= this.pages }
		}, [h('a', {
			on: { click: ($ev) => this.click('next', $ev) },
			attrs: { 'aria-label': 'Previous', href: '#' },
			domProps: { innerHTML: '&raquo;' }
		})]
		));

		/*
		children.push(h('span', { class: 'a2-pager-divider' }));
		children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
		*/
		return h('ul', contProps, children);
	}
});


// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

/*20250914-7984*/
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

		/* generator */
		arr.$allItems = function* () {
			for (let i = 0; i < this.length; i++) {
				let el = this[i];
				yield el;
				if ('$items' in el)
					yield* el.$items.$allItems();
			}
		};

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

		arr.$move = function (el, dir) {
			if (!el) return;
			let rowNoProp = el._meta_.$rowNo;
			if (!rowNoProp) return;
			let ix1 = this.indexOf(el);
			let ix2 = 0;
			if (dir === 'up') {
				if (ix1 <= 0) return;
				ix2 = ix1;
				ix1 = ix2 - 1;
			}
			else if (dir === 'down') {
				if (ix1 >= this.length - 1) return;
				ix2 = ix1 + 1;
			} else
				return;
			// swap ix1-ix2
			let t = [this[ix1], this[ix2]];
			this.splice(ix1, 2, t[1], t[0]);
			this.$renumberRows();
		}

		arr.$canMove = function (el, dir) {
			if (dir === 'up')
				return this.indexOf(el) > 0;
			else if (dir === 'down')
				return this.indexOf(el) < this.length - 1;
			return false;
		}
	}

	function addResize(arr) {

		arr.__empty__ = function () {
			// without dirty
			this.splice(0, this.length);
			if ('$RowCount' in this)
				this.$RowCount = 0;
			return this;
		}

		arr.$empty = function () {
			if (this.$root.isReadOnly)
				return this;
			this._root_.$setDirty(true);
			return this.__empty__();
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
			return !!(this.$checked && this.$checked.length);
		});

		defPropertyGet(arr, "$names", function () {
			return this.map(x => x.Name).join(', ');
		});

		defPropertyGet(arr, "$ids", function () {
			return this.map(x => x.Id).join(',');
		});
	}

	function defineArrayItemProto(elem) {

		let proto = elem.prototype;

		proto.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};

		proto.$select = function (root) {
			if (!root && this.$findTreeRoot)
				root = this.$findTreeRoot();
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

		proto.$canMove = function (dir) {
			let arr = this._parent_;
			if (arr.length < 2) return;
			let i1 = arr.indexOf(this);
			if (dir === 'up')
				return i1 >= 1;
			else if (dir === 'down')
				return i1 < arr.length - 1;
			return false;
		}

		proto.$move = function(dir) {
			let arr = this._parent_;
			if (arr.length < 2) return;
			let i1 = arr.indexOf(this);
			let i2 = i1;
			if (dir === 'up') {
				if (i1 < 1) return;
				i1 -= 1;
			} else if (dir === 'down') {
				if (i1 >= arr.length - 1) return;
				i2 += 1;
			}
			arr.splice(i1, 2, arr[i2], arr[i1]);
			arr.$renumberRows();
			return this;
		}
	}
};

/* Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.*/

/*20250525-7986*/
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
	const FLAG_CREATE = 32;
	const FLAG_64 = 64;
	const FLAG_128 = 128;
	const FLAG_256 = 256;

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

	function createPermissionObject(perm) {
		return Object.freeze({
			canView: !!(perm & FLAG_VIEW),
			canEdit: !!(perm & FLAG_EDIT),
			canDelete: !!(perm & FLAG_DELETE),
			canApply: !!(perm & FLAG_APPLY),
			canUnapply: !!(perm & FLAG_UNAPPLY),
			canCreate: !!(perm & FLAG_CREATE),
			canFlag64: !!(perm & FLAG_64),
			canFlag128: !!(perm & FLAG_128),
			canFlag256: !!(perm & FLAG_256)
		});
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
				shadow[prop] = srcval ? utils.date.fromServer(srcval) : utils.date.zero();
				break;
			case platform.File:
			case Object:
				shadow[prop] = null;
				break;
			case TMarker: // marker for dynamic property
				let mp = trg._meta_.markerProps[prop];
				if (utils.isDefined(mp.type) && utils.isDefined(mp.value))
					shadow[prop] = mp.value;
				else
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
				if (!propInfo) continue;
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
				if (!propInfo) continue;
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
		elem.$findTreeRoot = function () {
			let p = this;
			let r = null;
			while (p && p !== this.$root) {
				if (p._meta_ && p._meta_.$items)
					r = p;
				p = p._parent_;
			}
			return r ? r._parent_ : null;
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
				// !!! $level присваивается только в TreeSection!
				// this.constructor.name == objectType;
				const mi = this._root_.__modelInfo.Levels;
				if (mi) {
					const levs = mi[this.constructor.name];
					if (levs && this.$level <= levs.length) {
						let xv = this[levs[this.$level - 1]];
						if (!xv) return '';
						if (utils.isObjectExact(xv))
							return xv.$name;
						else if (utils.isDate(xv))
							return utils.format(xv, 'Date');
						return xv;
					}
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
			if (!root.$template || !root.$template.defaults) return false;
			if (root.$isCopy) return false;
			let called;
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
					called = true;
					if (utils.isFunction(def))
						platform.set(obj, prop, def.call(root, obj, prop));
					else
						platform.set(obj, prop, def);
				}
			}
			return called;
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
			elem._allErrors_ = [];

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
				elem._setDefaults_();
				elem._fireLoad_();
				__initialized__ = true;
			};

			elem._setDefaults_ = () => {
				if (setDefaults(elem))
					elem.$emit('Model.defaults', elem);
			};

			elem._fireLoad_ = () => {
				platform.defer(() => {
					if (!elem.$vm) return;
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
			elem._fireGlobalAppEvent_ = (ev) => {
				elem.$emit(ev.event, ev.data);
			}
			elem._fireSignalAppEvent_ = (ev) => {
				elem.$emit("Signal." + ev.event, ev.data);
			}
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

		defPropertyGet(arr, "$permissions", function () {
			let mi = arr.$ModelInfo;
			if (!mi || !utils.isDefined(mi.Permissions))
				return {};
			let perm = mi.Permissions;
			return createPermissionObject(perm);
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
				return createPermissionObject(perm);
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

	function getGlobalSaveEvent() {
		let tml = this.$template;
		if (!tml) return undefined;
		let opts = tml.options;
		if (!opts) return undefined;
		return opts.globalSaveEvent;

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

	function revalidateItem(itm, valname) {
		this.$defer(() => {
			validators.revalidate(itm, valname, this.$template);
			this._needValidate_ = true;
			this._validateAll_(false);
		});
	}

	function forceValidateAll() {
		let me = this;
		me._needValidate_ = true;
		var retArr = me._validateAll_(false);
		me._validateAll_(true); // and validate async again
		return retArr;

	}

	function hasErrors(props) {
		if (!props || !props.length) return false;
		let errs = this._allErrors_;
		if (!errs.length) return false;
		for (let i = 0; i < errs.length; i++) {
			let e = errs[i];
			if (props.some(p => p === e.x))
				return true;
		}
		return false;
	}

	function collectErrors() {
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
		// merge allerrs into
		// sync arrays:
		// if me._allErrors_[i] not found in allerrs => remove it
		let i = me._allErrors_.length;
		while (i--) {
			let a = me._allErrors_[i];
			if (!allerrs.find(n => n.x === a.x))
				me._allErrors_.splice(i, 1);
		}
		// if allerrs[i] not found in me._allErrors_ => append it
		allerrs.forEach(n => {
			if (!me._allErrors_.find(a => a.x === n.x))
				me._allErrors_.push(n);
		});



		return allerrs;
		//console.dir(allerrs);
	}

	function setDirty(val, path, prop) {
		if (val === this.$dirty) return;
		if (this.$root.$readOnly)
			return;
		this.$root.$emit('Model.dirty.change', val, `${path}.${prop}`);
		if (this.$vm && this.$vm.isIndex)
			return;
		if (isNoDirty(this.$root))
			return;
		if (path && path.toLowerCase().startsWith('query'))
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
			if (utils.isObject(arr) && '$selected' in arr) {
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
					if ('$copy' in trg)
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
						else {
							platform.set(this, prop, utils.date.fromServer(src[prop]));
						}
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
		root.prototype._globalSaveEvent_ = getGlobalSaveEvent;
		root.prototype._validate_ = validate;
		root.prototype._validateAll_ = validateAll;
		root.prototype.$forceValidate = forceValidateAll;
		root.prototype.$revalidate = revalidateItem;
		root.prototype.$hasErrors = hasErrors;
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
// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221002-7894
// components/modal.js


(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;
	const utils = require('std:utils');

	const modalTemplate = `
<div class="modal-window modal-animation-window" @keydown.tab="tabPress" :class="mwClass" ref=dialog>
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

	const modalPlacementComponent = {
		inserted(el, binding) {
			if (!binding.value)
				return;
			let mw = el.closest('.modal-window');
			if (!mw || !mw.__vue__)
				return;
			if (mw.__vue__.$data)
				mw.__vue__.$data.placement = ' with-placement ' + binding.value;
			let mf = mw.closest('.modal-wrapper')
			if (mf)
				mf.setAttribute('data-placement', binding.value);
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
				// flex centered window
				let dx = (event.pageX - opts.offset.x);
				let dy = (event.pageY - opts.offset.y);
				let mx = opts.init.x + dx;
				let my = opts.init.y + dy;
				// fit
				let maxX = window.innerWidth - opts.init.cx;
				//let maxY = window.innerHeight - opts.init.cy - 24 /*footer height*/;
				//if (my < 0) my = 0;
				if (mx < 0) mx = 0;
				if (mx > maxX) mx = maxX;
				if (my < 0) my = 0;
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

	Vue.directive("modal-placement", modalPlacementComponent)

	const modalComponent = {
		template: modalTemplate,
		props: {
			dialog: Object
		},
		data() {
			// always need a new instance of function (modal stack)
			return {
				modalCreated: false,
				placement: '',
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
				const dialog = this.$refs.dialog;
				const activeInput = document.activeElement;
				let elems = Array.from(dialog.querySelectorAll('input:enabled, button:enabled, textarea:enabled, select:enabled, a:not([disabled])'));
				elems = elems
					.filter(el => el && (el.offsetLeft || el.offsetTop || el.offsetWidth || el.offsetHeight))
					.map(el => { return { elem: el, ti: +el.getAttribute('tabindex') || 0, active: el == activeInput }; })
					.filter(el => el.ti !== -1)
					.sort((e1, e2) => e1.ti == e2.ti ? 0 : e1.ti < e2.ti ? -1 : 1);
				if (!elems.length) return;
				const d = event.shiftKey ? -1 : 1;
				let ai = elems.findIndex(x => x.active);
				let ni = ai + d;
				if (ni < 0)
					ni = elems.length - 1;
				else if (ni >= elems.length)
					ni = 0;
				elems[ni].elem.focus();
				event.preventDefault();
			},
			__modalRequery() {
				alert('requery yet not implemented');
			}
		},
		computed: {
			isInclude: function () {
				return !!this.dialog.url;
			},
			mwClass() {
				return this.placement + (this.modalCreated ? ' loaded' : '');
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
			this.savedFocus = document.activeElement;
			if (this.savedFocus && this.savedFocus.blur) {
				this.savedFocus.blur();
			}
		},
		mounted() {
			setTimeout(() => {
				this.modalCreated = true;
			}, 50); // same as shell
		},
		destroyed() {
			if (this.savedFocus && this.savedFocus.focus)
				this.savedFocus.focus();
			document.removeEventListener('keyup', this.keyUpHandler);
		}
	};

	app.components['std:modal'] = modalComponent;
})();
// Copyright © 2015-2020 Oleksandr Kukhtin. All rights reserved.

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
// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20240201-7959
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
				}, toast.time || 2000);
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181108-7350
// standalone/controller.js

(function () {

	const eventBus = require('std:eventBus');
	const utils = require('std:utils');
	const dataservice = require('std:dataservice');
	const urltools = require('std:url');
	const log = require('std:log');
	const locale = window.$$locale;
	const modelInfo = require('std:modelInfo');

	let __updateStartTime = 0;
	let __createStartTime = 0;

	function makeErrors(errs) {
		let ra = [];
		for (let x of errs) {
			for (let y of x.e) {
				ra.push(y.msg);
			}
		}
		return ra.length ? ra : null;
	}

	function __runDialog(url, arg, query, cb) {
		return new Promise(function (resolve, reject) {
			const dlgData = { promise: null, data: arg, query: query };
			eventBus.$emit('modal', url, dlgData);
			dlgData.promise.then(function (result) {
				if (cb)
					cb(result);
				resolve(result);
			});
		});
	}

	const standalone = Vue.extend({
		// inDialog: Boolean (in derived class)
		// pageTitle: String (in derived class)
		data() {
			return {
				__init__: true,
				__baseUrl__: '',
				__baseQuery__: {},
				__requestsCount__: 0,
				$$currentTab: '' /*for bootstrap tab*/
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
		methods: {
			$exec(cmd, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				const root = this.$data;
				root._exec_(cmd, arg, confirm, opts);
			},

			$isReadOnly(opts) {
				return opts && opts.checkReadOnly && this.$data.$readOnly;
			},

			$canExecute(cmd, arg, opts) {
				if (this.$isReadOnly(opts))
					return false;
				let root = this.$data;
				return root._canExec_(cmd, arg, opts);
			},

			$format(value, dataType, hideZeros) {
				if (!dataType) return value;
				return utils.format(value, dataType, { hideZeros: hideZeros });
			},

			$save(opts) {
				if (this.$data.$readOnly)
					return;
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/data/save';
				let urlToSave = this.$indirectUrl || this.$baseUrl;
				const isCopy = this.$data.$isCopy;
				return new Promise(function (resolve, reject) {
					let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
					let wasNew = self.$baseUrl.indexOf('/new') !== -1;
					dataservice.post(url, jsonData).then(function (data) {
						self.$data.$merge(data, true);
						self.$data.$emit('Model.saved', self.$data);
						self.$data.$setDirty(false);
						// data is a full model. Resolve requires only single element.
						let dataToResolve;
						let newId;
						for (let p in data) {
							// always first element in the result
							dataToResolve = data[p];
							newId = self.$data[p].$id; // new element
							if (dataToResolve)
								break;
						}
						if (wasNew && newId) {
							// assign the new id to the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId);
						} else if (isCopy) {
							// and in the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId, 'edit');
						}
						resolve(dataToResolve); // single element (raw data)
					}).catch(function (msg) {
						alert(msg);
					});
				});
			},

			$invoke(cmd, data, base) {
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/data/invoke';
				let baseUrl = self.$indirectUrl || self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							resolve(data);
						} else {
							throw new Error('Invalid response type for $invoke');
						}
					}).catch(function (msg) {
						alert(msg);
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
					Vue.nextTick(() => {
						vm.$invoke(cmd, data).then((result) => {
							val.result = result.Result.Value;
							resolve(val.result);
						});
					});
				});
			},

			$load(id) {
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/data/load';
				let dat = self.$data;
				return new Promise(function (resolve, reject) {
					let dataToQuery = { baseUrl: urltools.combine(self.$baseUrl, id) };
					let jsonData = utils.toJson(dataToQuery);
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat._setModelInfo_(undefined, data);
							dat._fireLoad_();
							resolve(dat);
						} else {
							throw new Error('Invalid response type for load');
						}
					}).catch(function (msg) {
						alert(msg);
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
				let url = root + '/data/reload';
				let dat = self.$data;

				let mi = args ? modelInfo.get.call(this.$data, args.$ModelInfo) : null;
				if (!args && !mi) {
					// try to get first $ModelInfo
					let modInfo = this.$data._findRootModelInfo();
					if (modInfo) {
						mi = modelInfo.get.call(this.$data, modInfo);
					}
				}

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
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat._setModelInfo_(undefined, data);
							dat._fireLoad_();
							resolve(dat);
						} else {
							throw new Error('Invalid response type for $reload');
						}
					}).catch(function (msg) {
						alert(msg);
					});
				});
			},

			$remove(item, confirm) {
				if (this.$data.$readOnly)
					return;
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},


			$dbRemove(elem, confirm) {
				if (!elem)
					return;
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
					let postUrl = root + '/data/dbRemove';
					let jsonObj = { baseUrl: self.$baseUrl, id: id };
					if (lazy) {
						jsonObj.prop = lastProperty(elem.$parent._path_);
					}
					let jsonData = utils.toJson(jsonObj);
					dataservice.post(postUrl, jsonData).then(function (data) {
						elem.$remove(); // without confirm
					}).catch(function (msg) {
						alert(msg);
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


			$loadLazy(elem, propName) {
				let self = this,
					root = window.$$rootUrl,
					url = root + '/data/loadlazy',
					selfMi = elem[propName].$ModelInfo,
					parentMi = elem.$parent.$ModelInfo;

				// HACK. inherit filter from parent
				/*
				if (parentMi && parentMi.Filter) {
					if (!selfMi)
						selfMi = parentMi;
					else
						selfMi.Filter = parentMi.Filter;
				}
				*/

				let mi = modelInfo.get.call(self.$data, selfMi);
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
						if (propName in data) {
							arr.$empty();
							for (let el of data[propName])
								arr.push(arr.$new(el));
							let rcName = propName + '.$RowCount';
							if (rcName in data) {
								arr.$RowCount = data[rcName];
							}
							arr._root_._setModelInfo_(arr, data);
						}
						resolve(arr);
					}).catch(function (msg) {
						alert(msg);
					});
					arr.$loaded = true;
				});
			},

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
			},

			$attachment(url, arg, opts) {
				const root = window.$$rootUrl;
				let cmd = opts && opts.export ? 'export' : 'show';
				let id = arg;
				if (arg && utils.isObject(arg))
					id = utils.getStringId(arg);
				let attUrl = urltools.combine(root, 'attachment', cmd, id);
				let qry = { base: url };
				attUrl = attUrl + urltools.makeQueryString(qry);
				if (opts && opts.newWindow)
					window.open(attUrl, '_blank');
				else
					window.location.assign(attUrl);
			},

			$showDialog(url, arg, query) {
				return __runDialog(url, arg, query);
			},

			$modalClose(result) {
				eventBus.$emit('modalClose', result);
			},

			$modalSaveAndClose(result, opts) {
				if (this.$isDirty) {
					const root = this.$data;
					if (opts && opts.validRequired && root.$invalid) {
						let errs = makeErrors(root.$forceValidate());
						//console.dir(errs);
						alert(locale.$MakeValidFirst, undefined, errs);
						return;
					}
					this.$save().then((result) => eventBus.$emit('modalClose', result));
				}
				else
					eventBus.$emit('modalClose', result);
			},


			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__doInit__() {
				const root = this.$data;
				if (!root._modelLoad_) return;
				root._modelLoad_();
				root._seal_(root);
			},
			_cwChange(args) {
				this.$reload(args);
			}
		},
		created() {
			let out = { caller: null };
			eventBus.$emit('registerData', this, out);

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);

			this.__asyncCache__ = {};
			this.__currentToken__ = window.app.nextToken();
			log.time('create time:', __createStartTime, false);

			this.$on('cwChange', this._cwChange);
		},
		beforeDestroy() {
		},
		destroyed() {
			//console.dir('base.js has been destroyed');
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
		},
		beforeUpdate() {
			__updateStartTime = performance.now();
		},
		beforeCreate() {
			__createStartTime = performance.now();
		},
		updated() {
			log.time('update time:', __updateStartTime, false);
		}
	});

	standalone.init = function (vm, baseUrl, callback) {
		vm.$data.__baseUrl__ = urltools.combine('_page', baseUrl);

		vm.$data._host_ = {
			$viewModel: vm
		};

		vm.__doInit__();

		if (callback)
			callback.call(vm);
	};

	app.components['standaloneController'] = standalone;
})();
// Copyright © 2020-2022 Oleksandr Kukhtin. All rights reserved.

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
// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

/*20220320-7830*/
/* controllers/navbar.js */

(function () {

	const locale = window.$$locale;
	const menuTools = component('std:navmenu');
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
				if (savedUrl && !menuTools.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menuTools.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			},
			showHelp() {
				window.open(this.helpHref(), "_blank");
			},
			_findHelp() {
				if (!this.menu) return null;
				let am = this.menu.find(x => this.isActive(x));
				if (am && am.Menu) {
					// find recursive!
					let am2 = menuTools.findMenu(am.Menu, x => this.isActive2(x));
					if (am2 && am2.Help)
						return am2.Help;
				}
				return am ? am.Help : null;
			},
			helpHref() {
				let helpUrl = this._findHelp() || '';
				return urlTools.helpHref(helpUrl);
			},
			hasHelp() {
				return !!this._findHelp();
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
	<li v-for="(item, index) in menu" :key=index :class='item.ClassName' >
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
				if (savedUrl && !menuTools.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menuTools.makeMenuUrl(this.menu, item.Url, opts);
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
// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

/*20230412-7926*/
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
				if (!item.Url)
					return undefined
				let top = this.topMenu;
				return top ? urlTools.combine(top.Url, item.Url) : undefined;
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
	<div class="side-bar-body advance" v-if="bodyIsVisible">
		<tree-view :items="sideMenu" :is-active="isActive" :is-group="isGroup" :click="navigate" :get-href="itemHref"
			:options="{folderSelect: folderSelect, label: 'Name', title: 'Description',
			subitems: 'Menu', expandAll:true, xtraClass:'ClassName',
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
// Copyright © 2021-2022 Oleksandr Kukhtin. All rights reserved.

/*20221123-7907*/
/* controllers/appheader.js */

(function () {

	const locale = window.$$locale;
	const eventBus = require('std:eventBus');
	const menuTools = component('std:navmenu');

	const a2AppHeader = {
		template: `
<header class="header">
	<div class=h-menu v-if=isNavBarMenu @click.stop.prevent=clickMenu><i class="ico ico-grid2"></i></div>
	<a class=h-block v-if='!isNavBarMenu' @click.stop.prevent=root href='/'  tabindex="-1">
		<!--<i class="ico-user"></i>-->
		<span class="app-logo" v-if=hasLogo>
			<img :src="logoSrc" />
		</span>
		<span class=app-title v-text="title"></span>
		<span class=app-subtitle v-text="subtitle"></span>
	</a>
	<div v-if=isNavBarMenu class=h-menu-title v-text=seg0text></div>
	<div class="aligner"></div>
	<span class="title-notify" v-if="notifyText" v-text="notifyText" :title="notifyText" :class="notifyClass"></span>
	<div class="aligner"></div>
	<template v-if="!isSinglePage ">
		<a2-new-button :menu="newMenu" icon="plus" btn-style="success"></a2-new-button>
		<slot></slot>
		<a2-new-button :menu="settingsMenu" icon="gear-outline" :title="locale.$Settings"></a2-new-button>
		<a class="nav-admin middle" v-if="hasFeedback" tabindex="-1" @click.prevent="showFeedback" :title="locale.$Feedback" :class="{open: feedbackVisible}"><i class="ico ico-comment-outline"></i></a>
		<a class="nav-admin" v-if="userIsAdmin" href="/admin/" tabindex="-1"><i class="ico ico-gear-outline"></i></a>
	</template>
	<div class="dropdown dir-down separate" v-dropdown>
		<button class="btn user-name" toggle :title="personName"><i class="ico ico-user"></i> 
			<span id="layout-person-name" class="person-name" v-text="personName"></span>
			<span id="layout-client-id" class="client-id" v-if="clientId"> [<span v-text="clientId" ></span>]</span>
			<span class="caret"></span>
		</button>
		<div class="dropdown-menu menu down-left">
			<template v-if="!isSinglePage " v-for="(itm, itmIndex) in profileItems">
				<div class="divider" v-if="itm.type === 'separator'"></div>
				<a v-else @click.prevent="doProfileMenu(itm)" class="dropdown-item" tabindex="-1"><i class="ico" :class="'ico-' + itm.icon"></i> <span v-text="itm.title" :key="itmIndex"></span></a>
			</template>
			<a v-if="isChangePasswordEnabled" @click.prevent="changePassword" class="dropdown-item" tabindex="-1"><i class="ico ico-access"></i> <span v-text="locale.$ChangePassword"></span></a>
			<div class="divider"></div>
			<form id="logoutForm" method="post" action="/account/logoff">
				<a href="javascript:document.getElementById('logoutForm').submit()" tabindex="-1" class="dropdown-item"><i class="ico ico-exit"></i> <span v-text="locale.$Quit"></span></a>
			</form>
		</div>
	</div>
</header>
`,
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
			showFeedback: Function,
			feedbackVisible: Boolean,
			singlePage: String,
			changePassword: Function,
			navBarMode: String,
			logo: String
		},
		computed: {
			isSinglePage() {
				return !!this.singlePage;
			},
			isChangePasswordEnabled() {
				return this.changePassword != undefined;
			},
			locale() { return locale; },
			notifyText() {
				return this.getNotify(2);
			},
			notifyClass() {
				return this.getNotify(1).toLowerCase();
			},
			feedback() {
				return this.appData ? this.appData.feedback : null;
			},
			hasFeedback() {
				return this.appData && this.appData.feedback;
			},
			hasLogo() {
				return this.appData && this.appData.appLogo;
			},
			logoSrc() {
				return this.hasLogo ? this.appData.appLogo : '';
			},
			profileItems() {
				return this.appData ? this.appData.profileMenu : null;
			},
			isNavBarMenu() {
				return this.navBarMode === 'Menu';
			},
			seg0text() {
				let seg0 = this.$store.getters.seg0;
				let mx = this.menu.find(x => x.Url === seg0);
				return mx ? mx.Name : '';
			}
		},
		methods: {
			getNotify(ix) {
				let n = this.userState ? this.userState.Notify : null;
				if (!n) return '';
				let m = n.match(/\((.*)\)(.*)/);
				if (m && m.length > ix)
					return m[ix];
				return '';
			},
			root() {
				let opts = { title: null };
				let currentUrl = this.$store.getters.url;
				let menuUrl = this.isSinglePage ? ('/' + this.singlePage) : menuTools.makeMenuUrl(this.menu, '/', opts);
				if (currentUrl === menuUrl) {
					return; // already in root
				}
				this.$store.commit('navigate', { url: menuUrl, title: opts.title });
			},
			doProfileMenu(itm) {
				switch (itm.type || '') {
					case '':
					case 'page':
						this.$store.commit('navigate', { url: itm.url });
						break;
					case 'dialog':
						this.dialog(itm.url);
						break;
					case 'external':
						window.open(itm.url, '_blank');
						break;
					default:
						alert('Unknown profile item type');
				}
			},
			clickMenu() {
				if (this.isNavBarMenu) {
					eventBus.$emit('clickNavMenu', true);
				}
			},
			dialog(url) {
				const dlgData = { promise: null };
				eventBus.$emit('modaldirect', url, dlgData);
				dlgData.promise.then(function (r) {
				});
			}
		}
	};

	app.components['std:appHeader'] = a2AppHeader;
})();	
// Copyright © 2021-2024 Oleksandr Kukhtin. All rights reserved.

/*20240201-7959*/
/* controllers/mainview.js */

(function () {

	const store = component('std:store');
	const period = require('std:period');
	const eventBus = require('std:eventBus');

	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const utils = require('std:utils');

	const platform = require('std:platform');
	const navBar = component('std:navbar');
	const sideBar = component('std:sidebar');
	const urlTools = require('std:url');
	const menu = component('std:navmenu');
	const locale = window.$$locale;

	const contentView = {
		render(h) {
			return h('div', {
				attrs: {
					class: 'content-view ' + this.cssClass
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
			},
			cssClass() {
				let route = this.$store.getters.route;
				if (route.seg0 === 'app')
					return 'full-view';
				if (menu.isSeparatePage(this.pages, route.seg0))
					return 'full-view';
				return route.len === 3 ? 'partial-page' :
					route.len === 2 ? 'full-page' : 'full-view';
			}
		},
		props: {
			pages: String
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


	const a2MainView = {
		store,
		template: `
<div :class=cssClass class=main-view>
	<component :is=navBarComponent :menu=menu v-if=isNavBarVisible 
		:period=period :is-navbar-menu=isNavBarMenu></component>
	<component :is=sideBarComponent v-if=sideBarVisible :menu=menu :mode=sideBarMode></component>
	<a2-content-view :pages=pages></a2-content-view>
	<div class=load-indicator v-show=pendingRequest></div>
	<div class=modal-stack v-if=hasModals>
		<div class="modal-wrapper modal-animation-frame" v-for="dlg in modals" :class="{show: dlg.wrap}">
			<a2-modal :dialog=dlg></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-nav-bar': navBar.standardNavBar,
			'a2-nav-bar-page': navBar.pageNavBar,
			'a2-side-bar': sideBar.standardSideBar,
			'a2-side-bar-compact': sideBar.compactSideBar,
			'a2-side-bar-tab': sideBar.tabSideBar,
			'a2-content-view': contentView,
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
			menu: Array,
			sideBarMode: String,
			navBarMode: String,
			period: period.constructor,
			pages: String,
			title: String
		},
		data() {
			return {
				sideBarCollapsed: false,
				showNavBar: true,
				requestsCount: 0,
				modals: [],
				modalRequeryUrl: ''
			};
		},
		computed: {
			navBarComponent() {
				return this.isNavBarMenu ? 'a2-nav-bar-page' : 'a2-nav-bar';
			},
			sideBarComponent() {
				if (this.sideBarMode === 'Compact')
					return 'a2-side-bar-compact';
				else if (this.sideBarMode === 'TabBar')
					return 'a2-side-bar-tab';
				return 'a2-side-bar';
			},
			isSideBarCompact() {
				return this.sideBarMode === 'Compact';
			},
			route() {
				return this.$store.getters.route;
			},
			sideBarInitialCollapsed() {
				let sb = localStorage.getItem('sideBarCollapsed');
				if (sb === 'true')
					return true;
				// auto collapse for tablet
				if (!window.matchMedia('(min-width:1025px)').matches)
					return true;
				return false;
			},
			isNavBarVisible() {
				if (!this.showNavBar) return false;
				if (this.isNavBarMenu) return true;
				let route = this.route;
				if (menu.isSeparatePage(this.pages, route.seg0)) return false;
				return route.seg0 !== 'app' && (route.len === 2 || route.len === 3);
			},
			sideBarVisible() {
				let route = this.route;
				return route.seg0 !== 'app' && route.len === 3;
			},
			isSideBarTop() {
				return this.sideBarMode === 'TabBar';
			},
			cssClass() {
				let cls = (this.isNavBarMenu ? 'nav-bar-menu ' : '') +
					'side-bar-position-' + (this.isSideBarTop ? 'top ' : 'left ');
				if (this.isSideBarCompact)
					cls += 'compact-side-bar ';
				if (this.isSideBarTop)
					cls += !this.sideBarVisible ? 'side-bar-hidden' : '';
				else
					cls += this.sideBarCollapsed ? 'collapsed' : 'expanded';
				return cls;
			},
			pendingRequest() { return !this.hasModals && this.requestsCount > 0; },
			hasModals() { return this.modals.length > 0; },
			isNavBarMenu() { return this.navBarMode === 'Menu'; }
		},
		methods: {
			setupWrapper(dlg) {
				this.modalRequeryUrl = '';
				setTimeout(() => {
					dlg.wrap = true;
					//console.dir("wrap:" + dlg.wrap);
				}, 50); // same as modal
			},
			showNavMenu(bShow) {
				if (bShow)
					eventBus.$emit('closeAllPopups');
				this.showNavBar = bShow;
			}
		},
		created() {
			let me = this;
			if (this.isNavBarMenu)
				this.showNavBar = false;
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

			function findRealDialog() {
				// skip alerts, confirm, etc
				for (let i = me.modals.length - 1; i >= 0; --i) {
					let md = me.modals[i];
					if (md.rd) {
						return md;
					}
				}
				return null;
			}

			if (this.isNavBarMenu)
				eventBus.$on('clickNavMenu', this.showNavMenu);

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				url = store.replaceUrlQuery(url, prms.query);
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap: false, rd: prms.rd };
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
				if (!attr || !instance) return;
				let dlg = findRealDialog();
				if (!dlg) return;
				dlg.attrs = instance.__parseControllerAttributes(attr);
			});

			eventBus.$on('modalCreated', function (instance) {
				// include instance!
				let dlg = findRealDialog();
				if (!dlg) return;
				dlg.instance = instance;
			});

			eventBus.$on('isModalRequery', function (arg) {
				if (arg.url && me.modalRequeryUrl && me.modalRequeryUrl === arg.url)
					arg.result = true;
			});

			eventBus.$on('modalRequery', function (baseUrl) {
				let dlg = findRealDialog();
				if (!dlg) return;
				let inst = dlg.instance; // include instance
				if (inst && inst.modalRequery) {
					if (baseUrl)
						dlg.url = baseUrl;
					me.modalRequeryUrl = dlg.url;
					inst.modalRequery();
				}
			});

			eventBus.$on('modalSetBase', function (baseUrl) {
				let dlg = findRealDialog();
				if (!dlg) return;
				dlg.url = baseUrl;
			});

			eventBus.$on('modalClose', function (result) {

				if (!me.modals.length) return;
				// not real! any.
				if (me.requestsCount > 0) return;

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
			
			if (!this.menu) {
				let dlgData = {
					promise: null, data: {
						message: locale.$AccessDenied, title: locale.$Error, style: 'alert'
					}
				};
				eventBus.$emit('confirm', dlgData);
				dlgData.promise.then(function () {
					let root = window.$$rootUrl;
					let url = urlTools.combine(root, '/account/login');
					window.location.assign(url);
				});
				return;
			}

			this.sideBarCollapsed = this.sideBarInitialCollapsed;

			let opts = { title: null, pages: this.pages };
			let menuPath = urlTools.normalizeRoot(window.location.pathname);
			// fix frequent error
			if (menuPath === '/home' && this.menu && !this.menu.find(v => v.Url.toLowerCase() === 'home')) {
				menuPath = '/';
			}
			let newUrl = menu.makeMenuUrl(this.menu, menuPath, opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

			let firstUrl = {
				url: '',
				title: ''
			};

			firstUrl.url = menu.makeMenuUrl(this.menu, '/', opts);

			firstUrl.title = opts.title;
			urlTools.firstUrl = firstUrl;

			function expand(elems) {
				if (!elems) return;
				for (let el of elems) {
					if ('Menu' in el) {
						platform.set(el, "$expanded", true);
						expand(el.Menu);
					}
				}
			}
			expand(this.menu);
		}
	};

	app.components['std:mainView'] = a2MainView;
})();	
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181108-7350
// standalone/shell.js

(function () {

	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const urlTools = require('std:url');
	const utils = require('std:utils');
	const locale = window.$$locale;


	const a2MainView = {
		template: `
<div class="main-view">
	<div class="modal-wrapper" v-for="dlg in modals">
		<a2-modal :dialog="dlg"></a2-modal>
	</div>
	<div class="fade" :class="{show: hasModals, 'modal-backdrop': hasModals}"/>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
		},
		data() {
			return {
				requestsCount: 0,
				modals: []
			};
		},
		computed: {
			hasModals() { return this.modals.length > 0; }
		},
		created() {

			let me = this;
			eventBus.$on('beginRequest', function () {
				if (me.hasModals)
					return;
				me.requestsCount += 1;
			});
			eventBus.$on('endRequest', function () {
				if (me.hasModals)
					return;
				me.requestsCount -= 1;
			});

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/model/dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				//url = store.replaceUrlQuery(url, prms.query);  // TODO: убрать store????
				let dlg = { title: "dialog", url: url, prms: prms.data };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});


			eventBus.$on('modalClose', function (result) {
				let dlg = me.modals.pop();
				if (result)
					dlg.resolve(result);
			});

			eventBus.$on('modalCloseAll', function () {
				while (me.modals.length) {
					let dlg = me.modals.pop();
					dlg.resolve(false);
				}
			});

			eventBus.$on('confirm', function (prms) {
				let dlg = prms.data;
				dlg.promise = new Promise(function (resolve) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});

		}
	};

	new Vue({
		el: "#shell",
		components: {
			'a2-main-view': a2MainView
		},
		data() {
			return {
			};
		},
		created() {
		}
	});
})();