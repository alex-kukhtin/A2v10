/*20170813-7001*/
/* utils.js */
(function () {

    const toString = Object.prototype.toString;

    function isFunction(value) { return typeof value === 'function'; }
    function isDefined(value) { return typeof value !== 'undefined'; }
    function isObject(value) { return value !== null && typeof value === 'object'; }
    function isDate(value) { return toString.call(value) === '[object Date]'; }
    function isString(value) { return typeof value === 'string'; }
    function isNumber(value) { return typeof value === 'number'; }

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
            return (key[0] === '$' || key[0] === '_') ? undefined : value;
        }, 2);
    }


    app.modules['utils'] = {
        isArray: Array.isArray,
        isFunction: isFunction,
        isDefined: isDefined,
        isObject: isObject,
        isDate: isDate,
        isString: isString,
        isNumber: isNumber,
        toString: toString,
        notBlank: notBlank,
        toJson: toJson
    };
})();
