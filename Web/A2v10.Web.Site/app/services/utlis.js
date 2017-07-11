(function() {

    function isFunction(value) { return typeof value === 'function'; }
    function isDefined(value) { return typeof value !== 'undefined'; }
    function isObject(value) { return value !== null && typeof value === 'object'; }
    function isDate(value) { return toString.call(value) === '[object Date]'; }
    function isString(value) { return typeof value === 'string'; }
    function isNumber(value) { return typeof value === 'number'; }

    app.modules['utils'] = {
        isArray: Array.isArray,
        isFunction: isFunction,
        isDefined: isDefined,
        isObject: isObject,
        isDate: isDate,
        isString: isString,
        isNumber : isNumber
    }
})();
