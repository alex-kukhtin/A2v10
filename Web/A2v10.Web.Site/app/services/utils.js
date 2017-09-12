/*20170912-7031*/
/* services/utils.js */

app.modules['utils'] = function () {

	return {
		isArray: Array.isArray,
		isFunction: isFunction,
		isDefined: isDefined,
		isObject: isObject,
		isObjectExact: isObjectExact,
		isDate: isDate,
		isString: isString,
		isNumber: isNumber,
		toString: toString,
		notBlank: notBlank,
		toJson: toJson,
		isPrimitiveCtor: isPrimitiveCtor,
		isEmptyObject: isEmptyObject,
		eval: eval,
		format: format
	};

	function isFunction(value) { return typeof value === 'function'; }
	function isDefined(value) { return typeof value !== 'undefined'; }
	function isObject(value) { return value !== null && typeof value === 'object'; }
	function isDate(value) { return value instanceof Date; }
	function isString(value) { return typeof value === 'string'; }
	function isNumber(value) { return typeof value === 'number'; }
	function isObjectExact(value) { return isObject(value) && !Array.isArray(value); }

	function isPrimitiveCtor(ctor) {
		return ctor === String || ctor === Number || ctor === Boolean;
	}
	function isEmptyObject(obj) {
		return !obj || Object.keys(obj).length === 0 && obj.constructor === Object;
	}

	function notBlank(val) {
		if (!val)
			return false;
		switch (typeof val) {
			case 'string':
				return val !== '';
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

	function eval(obj, path) {
		let ps = (path || '').split('.');
		let r = obj;
		for (let i = 0; i < ps.length; i++) {
			let pi = ps[i];
			if (!(pi in r))
				throw new Error(`Property '${pi}' not found in ${r.constructor.name} object `)
			r = r[ps[i]];
		}
		if (isObject(r))
			return toJson(r);
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
				return obj.toLocaleDateString() + ' ' + obj.toLocaleTimeString();
			case "Date":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				return obj.toLocaleDateString();
			case "Time":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				return obj.toLocaleTimeString();
			case "Currency":
				if (!isNumber(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				return obj.toLocaleString(undefined, { minimumFractionDigits:2, useGrouping:true });
			default:
				console.error(`Invalid DataType for utils.format (${dataType})`);
		}
		return obj;
	}
};


