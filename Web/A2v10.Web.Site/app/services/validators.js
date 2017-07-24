(function () {

    const utils = require('utils');

    const ERROR = 'error';

    function validateStd(rule, val) {
        switch (rule) {
            case 'notBlank':
                return utils.notBlank(val);
        }
        console.error(`invalid std rule: '${rule}'`);
        return true;
    }

    function validateImpl(rules, item, val) {
        let retval = [];
        rules.forEach(function (rule) {
            if (utils.isString(rule)) {
                if (!validateStd('notBlank', val))
                    retval.push({ msg: rule, severity: ERROR });
            } else if (utils.isString(rule.valid)) {
                if (!validateStd(rule.valid, val))
                    retval.push({ msg: rule.msg, severity: ERROR });
            } else if (utils.isFunction(rule.valid)) {
                if (!rule.valid(item, val))
                    retval.push({ msg: rule.msg, severity: rule.severity || ERROR });
            } else {
                console.error('invalid valid element type for rule');
            }
        });
        return retval;
    }


    function validateItem(vals, item, val) {
        let arr = [];
        if (utils.isArray(vals))
            arr = vals;
        else if (utils.isObject(vals))
            arr.push(vals);
        else if (utils.isString(vals))
            arr.push({ valid: 'notBlank', msg: vals });
        let err = validateImpl(arr, item, val);
        if (!err.length)
            return null;
        return err;
    }


    app.modules['validators'] = {
        validate: validateItem
    };

})();

