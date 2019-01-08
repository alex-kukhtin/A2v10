// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180428-7171
// /server/app.js
// Global scope!!!!

"use strict";


var app = {
	modules: {}
};

if (typeof window === 'undefined') {
	var window = {

	};
} else {
	window.$$locale = {
		$Locale: 'uk-UA'
	};
}

var require = function require(module, noerror) {
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
};


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181201-7379
// server/locale.js

app.modules['std:locale'] = function () {
	return {
		$Locale: 'uk-UA'
	};
};

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* server/platform.js */

(function () {

	function set(target, prop, value) {
		target[prop] = value;
	}

	function defer(func) {
		func();
	}


	app.modules['std:platform'] = {
		set: set,
		defer: defer,
		File: function () {
			return this;
		},
		performance: {
			now: function () {
				return 0;
			}
		}
	};

	app.modules['std:eventBus'] = {
	};
})();

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190108-7407
// services/utils.js

app.modules['std:utils'] = function () {

	const locale = require('std:locale');
	const platform = require('std:platform');
	const dateLocale = locale.$Locale;
	const _2digit = '2-digit';

	const dateOptsDate = { timeZone: 'UTC', year: 'numeric', month: _2digit, day: _2digit };
	const dateOptsTime = { timeZone: 'UTC', hour: _2digit, minute: _2digit };

	const formatDate = new Intl.DateTimeFormat(dateLocale, dateOptsDate).format;
	const formatTime = new Intl.DateTimeFormat(dateLocale, dateOptsTime).format;

	const currencyFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6, useGrouping: true }).format;
	const numberFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6, useGrouping: true }).format;


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
			fromDays: fromDays
		},
		text: {
			contains: textContains,
			containsText: textContainsText,
			sanitize,
			splitPath
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
		if (isDate(o1) && isDate(o2))
			return o1.getTime() === o2.getTime();
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
		return obj + '';
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

	function evaluate(obj, path, dataType, hideZeros, skipFormat) {
		let r = simpleEval(obj, path);
		if (skipFormat) return r;
		if (isDate(r))
			return format(r, dataType, hideZeros);
		else if (isObject(r))
			return toJson(r);
		else if (format)
			return format(r, dataType, hideZeros);
		return r;
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

	function format(obj, dataType, hideZeros) {
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
				return formatDate(obj) + ' ' + formatTime(obj);
			case "Date":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatDate(obj);
			case "DateUrl":
				if (dateIsZero(obj))
					return '';
				return '' + obj.getFullYear() + pad2(obj.getMonth() + 1) + pad2(obj.getDate());
			case "Time":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatTime(obj);
			case "Period":
				if (!obj.format) {
					console.error(`Invalid Period for utils.format (${obj})`);
					return obj;
				}
				return obj.format('Date');
			case "Currency":
				if (!isNumber(obj)) {
					console.error(`Invalid Currency for utils.format (${obj})`);
					return obj;
				}
				if (hideZeros && obj === 0)
					return '';
				return currencyFormat(obj);
			case "Number":
				if (!isNumber(obj)) {
					console.error(`Invalid Number for utils.format (${obj})`);
					return obj;
				}
				if (hideZeros && obj === 0)
					return '';
				return numberFormat(obj);
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
		td.setHours(0, 0, 0, 0);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateZero() {
		let td = new Date(0, 0, 1, 0, 0, 0, 0);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateTryParse(str) {
		if (!str) return dateZero();
		if (isDate(str)) return str;
		let dt;
		if (str.length === 8) {
			dt = new Date(+str.substring(0, 4), +str.substring(4, 6) - 1, +str.substring(6, 8), 0, 0, 0, 0);
		} else if (str.startsWith('\"\\/\"')) {
			dt = new Date(str.substring(4, str.length - 4));
		} else {
			dt = new Date(str);
		}
		if (!isNaN(dt.getTime())) {
			dt.setHours(0, 0, 0, 0);
			dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
			return dt;
		}
		return str;
	}

	function dateParse(str) {
		str = str || '';
		if (!str) return dateZero();
		let today = dateToday();
		let seg = str.split(/[^\d]/);
		if (seg.length === 1) {
			seg.push('' + (today.getMonth() + 1));
			seg.push('' + today.getFullYear());
		} else if (seg.length === 2) {
			seg.push('' + today.getFullYear());
		}
		let normalizeYear = function (y) {
			y = '' + y;
			switch (y.length) {
				case 2: y = '20' + y; break;
				case 4: break;
				default: y = today.getFullYear(); break;
			}
			return +y;
		};
		let td = new Date(+normalizeYear(seg[2]), +((seg[1] ? seg[1] : 1) - 1), +seg[0], 0, 0, 0, 0);
		if (isNaN(td.getDate()))
			return dateZero();
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
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

	function endOfMonth(dt) {
		var dte = new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 0, 0, 0);
		dte.setHours(0, -dte.getTimezoneOffset(), 0, 0);
		return dte;
	}

	function dateCreate(year, month, day) {
		let dt = new Date(year, month - 1, day, 0, 0, 0, 0);
		dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
		return dt;
	}

	function dateDiff(unit, d1, d2) {
		if (d1.getTime() > d2.getTime())
			[d1, d2] = [d2, d1];
		switch (unit) {
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
			case 'year':
				var dd = new Date(d1.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds(), d2.getMilliseconds());
				return d2.getFullYear() - d1.getFullYear() + (dd < d1 ? (d2 > d1 ? -1 : 0) : (d2 < d1 ? 1 : 0));
		}
		throw new Error('Invalid unit value for utils.date.diff');
	}

	function fromDays(days) {
		let dt = new Date(1900, 0, days, 0, 0, 0, 0);
		dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
		return dt;
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
				var ldm = new Date(dt.getFullYear(), newMonth + 1, 0).getDate();
				if (day > ldm)
					day = ldm;
				var dtx = new Date(dt.getFullYear(), newMonth, day);
				dtx.setHours(0, -dtx.getTimezoneOffset(), 0, 0);
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
		digits = digits || 2;
		let m = false;
		if (n < 0) {
			n = -n;
			m = true;
		}
		let r = Number(Math.round(n + `e${digits}`) + `e-${digits}`);
		return m ? -r : r;
	}
};


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181024-7328
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
			return 'Довільно';
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


	function isPeriod(value) { return value instanceof TPeriod; }

	return {
		isPeriod,
		constructor: TPeriod,
		zero: zeroPeriod,
		all: allDataPeriod,
		create: createPeriod,
		predefined: predefined
	};

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
			{ name: locale.$Last30Days, key: 'last30' },
			//{ name: locale.$MonthToDate, key: 'startMonth' },
			{ name: locale.$CurrMonth, key: 'currMonth' },
			{ name: locale.$PrevMonth, key: 'prevMonth' },
			//{ name: locale.$QuartToDate, key: 'startQuart' },
			{ name: locale.$CurrQuart, key: 'currQuart' },
			{ name: locale.$PrevQuart, key: 'prevQuart' },
			//{ name: locale.$YearToDate, key: 'startYear' }
			{name: locale.$CurrYear, key: 'currYear'}
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180705-7241*/
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
		switch (rule) {
			case 'notBlank':
				return utils.notBlank(val);
			case "email":
				return validEmail(val);
			case "url":
				return validUrl(val);
			case "isTrue":
				return val === true;
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
				if (!validateStd('notBlank', val))
					retval.push({ msg: rule, severity: ERROR });
			} else if (utils.isFunction(rule)) {
				let vr = rule(item, val);
				if (utils.isString(vr) && vr) {
					retval.push({ msg: vr, severity: sev });
				} else if (utils.isObject(vr)) {
					retval.push({ msg: vr.msg, severity: vr.severity || sev });
				}
			} else if (utils.isString(rule.valid)) {
				if (!validateStd(rule.valid, val))
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


	function validEmail(addr) {
		return addr === '' || EMAIL_REGEXP.test(addr);
	}

	function validUrl(url) {
		return url === '' || URL_REGEXP.test(url);
	}
};



/*! Copyright © 2015-2019 Alex Kukhtin. All rights reserved.*/

// 20190105-7402
// services/datamodel.js

(function () {

	"use strict";

	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
	const ERRORS = '_errors_';

	const ERR_STR = '#err#';

	const FLAG_VIEW = 1;
	const FLAG_EDIT = 2;
	const FLAG_DELETE = 4;

	const platform = require('std:platform');
	const validators = require('std:validators');
	const utils = require('std:utils');
	const log = require('std:log', true);
	const period = require('std:period');

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
		if (type === Number) {
			return utils.toNumber(val);
		}
		return val;
	}

	function propFromPath(path) {
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
				if (ctor.type) ctor = ctor.type;
				val = ensureType(ctor, val);
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
					this._root_.$setDirty(true, this._path_);
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
		elem._uiprops_ = {};

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

		if (elem._meta_.$items)
			elem.$expanded = false; // tree elem

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

		let constructEvent = ctorname + '.construct';
		let _lastCaller = null;
		elem._root_.$emit(constructEvent, elem);
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
			elem._setModelInfo_ = setRootModelInfo;
			elem._findRootModelInfo = findRootModelInfo;
			elem._enableValidate_ = true;
			elem._needValidate_ = false;
			elem._modelLoad_ = (caller) => {
				_lastCaller = caller;
				elem._fireLoad_();
				__initialized__ = true;
			};
			elem._fireLoad_ = () => {
				platform.defer(() => {
					elem.$emit('Model.load', elem, _lastCaller);
					elem._root_.$setDirty(false);
				});
			};
			defHiddenGet(elem, '$readOnly', isReadOnly);
			defHiddenGet(elem, '$stateReadOnly', isStateReadOnly);
			defHiddenGet(elem, '$isCopy', isModelIsCopy);
			elem._seal_ = seal;
		}
		if (startTime) {
			logtime('create root time:', startTime, false);
		}
		return elem;
	}

	function seal(elem) {
		Object.seal(elem);
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

	function setRootModelInfo(item, data) {
		if (!data.$ModelInfo) return;
		let elem = item;
		for (let p in data.$ModelInfo) {
			if (!elem) elem = this[p];
			elem.$ModelInfo = data.$ModelInfo[p];
			return; // first element only
		}
	}

	function findRootModelInfo() {
		for (let p in this._meta_.props) {
			let x = this[p];
			if (x.$ModelInfo)
				return x.$ModelInfo;
		}
		return null;
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

		createObjProperties(arr, arrctor);

		let constructEvent = arrctor.name + '.construct';
		arr._root_.$emit(constructEvent, arr);

		if (!source)
			return arr;
		for (let i = 0; i < source.length; i++) {
			arr[i] = new arr._elem_(source[i], dotPath, arr);
			arr[i].$checked = false;
		}
		return arr;
	}

	function _BaseArray(length) {
		let arr = new Array(length || 0);
		addArrayProps(arr);
		return arr;
	}

	//_BaseArray.prototype = Array.prototype;

	function addArrayProps(arr) {

		defineCommonProps(arr);

		arr.$new = function (src) {
			let newElem = new this._elem_(src || null, this._path_ + '[]', this);
			newElem.$checked = false;
			return newElem;
		};

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

		arr.$loadLazy = function () {
			return new Promise((resolve, reject) => {
				if (this.$loaded) { resolve(this); return; }
				if (!this.$parent) { resolve(this); return; }
				const meta = this.$parent._meta_;
				if (!meta.$lazy) { resolve(this); return; }
				let prop = propFromPath(this._path_);
				if (!meta.$lazy.indexOf(prop) === -1) { resolve(this); return; }
				this.$vm.$loadLazy(this.$parent, prop).then(() => resolve(this));
			});
		};

		arr.$append = function (src) {
			return this.$insert(src, 'end');
		};

		arr.$prepend = function (src) {
			return this.$insert(src, 'start');
		};

		arr.$insert = function (src, to) {
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

		arr.$empty = function () {
			if (this.$root.isReadOnly)
				return this;
			this.splice(0, this.length);
			if ('$RowCount' in this) this.$RowCount = 0;
			return this;
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

		arr.$sort = function (compare) {
			this.sort(compare);
			this.$renumberRows();
			return this;
		};

		arr.$clearSelected = function () {
			let sel = this.$selected;
			if (!sel) return; // already null
			sel.$selected = false;
			emitSelect(this, null);
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
			if (!this.length) return this;
			if (index >= this.length)
				index -= 1;
			this.$renumberRows();
			if (this.length > index) {
				this[index].$select();
			}
			return this;
		};

		arr.$copy = function (src) {
			if (this.$root.isReadOnly)
				return;
			this.$empty();
			if (utils.isArray(src)) {
				for (let i = 0; i < src.length; i++) {
					this.push(this.$new(src[i]));
				}
			}
			return this;
		};

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

		if (arrayItem) {
			defArrayItem(obj);
		}

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
	}

	function emitSelect(arr, item) {
		let selectEvent = arr._path_ + '[].select';
		let er = arr._root_.$emit(selectEvent, arr/*array*/, item);
	}

	function defArrayItem(elem) {

		elem.prototype.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};
		elem.prototype.$select = function (root) {
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
					p.$expanded = true;
					p = p._parent_._parent_;
					if (!p || p === this.$root)
						break;
				}
			}
		};
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
		if (!tml.delegates) {
			console.error('There are no delegates in the template');
			return null;
		}
		if (name in tml.delegates) {
			return tml.delegates[name];
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

	function setDirty(val, path) {
		if (this.$root.$readOnly)
			return;
		if (path && path.toLowerCase().startsWith('query'))
			return;
		if (isNoDirty(this.$root))
			return;
		// TODO: template.options.skipDirty
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

	function merge(src, afterSave, existsOnly) {
		let oldId = this.$id__;
		try {
			if (src === null)
				src = {};
			this._root_._enableValidate_ = false;
			this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				if (prop.startsWith('$$')) continue; // always skip
				if (afterSave && isSkipMerge(this._root_, prop)) continue;
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				let trg = this[prop];
				if (Array.isArray(trg)) {
					if (trg.$loaded)
						trg.$loaded = false; // may be lazy
					trg.$copy(src[prop]);
					// copy rowCount
					if ('$RowCount' in trg) {
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
		let newId = this.$id__;
		let fireChange = false;
		if (utils.isDefined(newId) && utils.isDefined(oldId))
			fireChange = newId !== oldId; // check id, no fire event
		if (fireChange) {
			// emit .change event for entire object
			let eventName = this._path_ + '.change';
			this._root_.$emit(eventName, this.$parent, this, this, propFromPath(this._path_));
		}
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

	function setModelInfo(root, info, rawData) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: 20
		};
		let mi = rawData.$ModelInfo;
		if (!mi) return;
		for (let p in mi) {
			root[p].$ModelInfo = mi[p];
		}
		//console.dir(rawData.$ModelInfo);
		//root._setModelInfo_()
	}

	app.modules['std:datamodel'] = {
		createObject: createObject,
		createArray: createArray,
		defineObject: defineObject,
		implementRoot: implementRoot,
		setModelInfo: setModelInfo,
		enumData: enumData
	};
})();



(function () {

	let dm = require('std:datamodel');

	app.modules['server:validate'] = {
		validate
	};

	function validate(datamodel, template) {
		console.dir(datamodel);
	}

});