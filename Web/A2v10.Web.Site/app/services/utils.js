/*20170829-7021*/
/* services/utils.js */

app.modules['utils'] = function () {

	return {
		isArray: Array.isArray,
		isFunction: isFunction,
		isDefined: isDefined,
		isObject: isObject,
		isDate: isDate,
		isString: isString,
		isNumber: isNumber,
		toString: toString,
		notBlank: notBlank,
		toJson: toJson,
		isPrimitiveCtor: isPrimitiveCtor,
		isEmptyObject: isEmptyObject
	};

	function isFunction(value) { return typeof value === 'function'; }
	function isDefined(value) { return typeof value !== 'undefined'; }
	function isObject(value) { return value !== null && typeof value === 'object'; }
	function isDate(value) { return toString.call(value) === '[object Date]'; }
	function isString(value) { return typeof value === 'string'; }
	function isNumber(value) { return typeof value === 'number'; }

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
};


