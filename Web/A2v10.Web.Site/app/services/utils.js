// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171103-7065
// services/utils.js

app.modules['std:utils'] = function () {

    const dateLocale = 'uk-UA';
    const dateOpts = {timeZone: 'UTC'};

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
		notBlank: notBlank,
		toJson: toJson,
		isPrimitiveCtor: isPrimitiveCtor,
		isEmptyObject: isEmptyObject,
		eval: eval,
        format: format,
        toNumber: toNumber,
        getStringId: getStringId,
		date: {
			today: dateToday,
			zero: dateZero,
			parse: dateParse,
			equal: dateEqual,
			isZero: dateIsZero
		}
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
		return ctor === String || ctor === Number || ctor === Boolean || ctor === Date;
	}
	function isEmptyObject(obj) {
		return !obj || Object.keys(obj).length === 0 && obj.constructor === Object;
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
		}
		return (val || '') !== '';
	}

	function toJson(data) {
		return JSON.stringify(data, function (key, value) {
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

    function eval(obj, path, dataType) {
        if (!path)
            return '';
		let ps = (path || '').split('.');
		let r = obj;
		for (let i = 0; i < ps.length; i++) {
			let pi = ps[i];
			if (!(pi in r))
				throw new Error(`Property '${pi}' not found in ${r.constructor.name} object `)
			r = r[ps[i]];
		}
		if (isDate(r))
			return format(r, dataType);
		else if (isObject(r))
			return toJson(r);
		else if (format)
			return format(r, dataType);
		return r;
	}

	function format(obj, dataType) {
		if (!dataType)
            return obj;
		switch (dataType) {
			case "DateTime":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
                return obj.toLocaleDateString(dateLocale, dateOpts) + ' ' + obj.toLocaleTimeString(dateLocale, dateOpts);
			case "Date":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
                return obj.toLocaleDateString(dateLocale, dateOpts);
			case "Time":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
                return obj.toLocaleTimeString(dateLocale, dateOpts);
			case "Currency":
				if (!isNumber(obj)) {
					console.error(`Invalid Currency for utils.format (${obj})`);
					return obj;
				}
                return obj.toLocaleString(undefined, { minimumFractionDigits: 2, useGrouping: true });
            case "Number":
                if (!isNumber(obj)) {
                    console.error(`Invalid Number for utils.format (${obj})`);
                    return obj;
                }
                return obj.toLocaleString(undefined, { minimumFractionDigits: 0, useGrouping: true });
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
        else if (isObjectExact(obj))
            return obj.$id || 0;
        return '0';
    }

    function toNumber(val) {
        if (isString(val))
            val = val.replace(/\s/g, '').replace(',', '.');
        return isFinite(val) ? +val : 0;
	}

	function dateToday() {
		let td = new Date();
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateZero() {
		let td = new Date(0, 0, 1);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateParse(str) {
		str = str || '';
		if (!str) return dateZero();
		let today = dateToday();
		let seg = str.split('.');
		if (seg.length == 1) {
			seg.push('' + (today.getMonth() + 1));
			seg.push('' + today.getFullYear());
		} else if (seg.length == 2) {
			seg.push('' + today.getFullYear());
		}
		let td = new Date(+seg[2], +seg[1] - 1, +seg[0], 0, 0, 0, 0);
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
		return dateEqual(d1, dateZero());
	}
};


