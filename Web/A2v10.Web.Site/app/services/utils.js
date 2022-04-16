// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20220416-7838
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
			commands: assign(src.commands, tml.commands)
		});
	}
};
