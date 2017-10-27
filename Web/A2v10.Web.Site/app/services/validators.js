/*20171027-7057*/
/*validators.js*/
app.modules['std:validators'] = function() {

    const utils = require('std:utils');
    const ERROR = 'error';

    /* from angular.js !!! */
    const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
    const URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+\])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;

	return {
		validate: validateItem
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

    function validateImpl(rules, item, val, ff) {
        let retval = [];
        rules.forEach(function (rule) {
            const sev = rule.severity || ERROR;
            if (utils.isString(rule)) {
                if (!validateStd('notBlank', val))
                    retval.push({ msg: rule, severity: ERROR });
            } else if (utils.isString(rule.valid)) {
                if (!validateStd(rule.valid, val))
                    retval.push({ msg: rule.msg, severity: sev });
            } else if (utils.isFunction(rule.valid)) {
                let vr = rule.valid(item, val);
                if (vr && vr.then) {
                    vr.then((result) => {
                        let dm = { severity: sev, msg: rule.msg };
                        let nu = false;
                        if (utils.isString(result)) {
                            dm.msg = result;
                            retval.push(dm);
                            nu = true;
                        } else if (!result) {
                            retval.push(dm);
                            nu = true;
                        }
                        // need to update the validators
                        item._root_._needValidate_ = true;
                        if (nu && ff) ff();
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


