/*20170814-7013*/
/*app.js*/

"use script";

(function () {

	window.app = {
        modules: {},
        components: {}
    };

    window.require = require;
    window.component = component;
    window.$$rootUrl = document.querySelector('meta[name=rootUrl]').content || '';

	function require(module) {
		if (module in app.modules) {
			let am = app.modules[module];
			if (typeof am === 'function') {
				am = am(); // always singleton
				app.modules[module] = am;
			}
			return am;
		}
        throw new Error('module "' + module + '" not found');
    }

    function component(name) {
        if (name in app.components)
            return app.components[name];
        throw new Error('component "' + name + '" not found');
    }
})();


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
	}
})(Element.prototype);




/*20171026-7054*/
/* services/url.js */

app.modules['std:url'] = function () {

    return {
        combine: combine,
        makeQueryString: makeQueryString,
        parseQueryString: parseQueryString,
        normalizeRoot: normalizeRoot,
        idChangedOnly: idChangedOnly,
        makeBaseUrl,
        parseUrlAndQuery,
        replaceId
    };

    function normalize(elem) {
        // TODO: TEST
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

    function combine(...args) {
        return '/' + args.map(normalize).filter(x => !!x).join('/');
    }

    function makeQueryString(obj) {
        if (!obj)
            return '';
        let esc = encodeURIComponent;
        // skip special (starts with '_')
        let query = Object.keys(obj)
            .filter(k => k.startsWith('_') ? null : obj[k])
            .map(k => esc(k) + '=' + esc(obj[k]))
            .join('&');
        return query ? '?' + query : '';
    }

    function parseQueryString(str) {
        //TODO: TEST
        var obj = {};
        str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    }

    function idChangedOnly(newUrl, oldUrl) {
        let ns = (newUrl || '').split('/');
        let os = (oldUrl || '').split('/');
        if (ns.length !== os.length)
            return false;
        if (os[os.length - 1] === 'new' && ns[ns.length - 1] !== 'new') {
            if (ns.slice(0, ns.length - 1).join('/') === os.slice(0, os.length - 1).join('/'))
                return true;
        }
        return false;
    }

    function makeBaseUrl(url) {
        let x = (url || '').split('/');
        if (x.length === 6)
            return x.slice(2, 4).join('/');
        return url;
    }

    function parseUrlAndQuery(url, query) {
        let rv = { url: url, query: query };
        if (url.indexOf('?') !== -1) {
            let a = url.split('?');
            rv.url = a[0];
            rv.query = Object.assign({}, query, parseQueryString(a[1]));
        }
        return rv;
    }

    function replaceId(url, newId) {
        alert('todo::replaceId')
    }
};






/*20170903-7024*/
/* platform/webvue.js */

(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
	}

	function defer(func) {
		Vue.nextTick(func);
	}


    app.modules['std:platform'] = {
		set: set,
		defer: defer
    };

	app.modules['std:eventBus'] = new Vue({});

})();

/*20171006-7041*/
/* services/http.js */

app.modules['std:http'] = function () {

    const eventBus = require('std:eventBus');
    const urlTools = require('std:url');

	return {
		get: get,
		post: post,
        load: load,
        upload: upload
	};

    function doRequest(method, url, data) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            
            xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
                if (xhr.status === 200) {
                    let ct = xhr.getResponseHeader('content-type');
                    let xhrResult = xhr.responseText;
                    if (ct.indexOf('application/json') !== -1)
                        xhrResult = JSON.parse(xhr.responseText);
                    resolve(xhrResult);
                }
                else if (xhr.status === 255) {
                    reject(xhr.responseText || xhr.statusText);
                }
                else
                    reject(xhr.statusText);
            };
            xhr.onerror = function (response) {
				eventBus.$emit('endRequest', url);
                reject(xhr.statusText);
            };
            xhr.open(method, url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Accept', 'application/json, text/html');
			eventBus.$emit('beginRequest', url);
            xhr.send(data);
        });
    }

    function get(url) {
        return doRequest('GET', url);
    }

    function post(url, data) {
        return doRequest('POST', url, data);
    }

    function upload(url, data) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.onload = function (response) {
                if (xhr.status === 200) {
                    let xhrResult = JSON.parse(xhr.responseText);
                    resolve(xhrResult);
                } else if (xhr.status === 255) {
                    alert(xhr.responseText || xhr.statusText);
                }
            };
            xhr.onerror = function (response) {
                alert('Error');
            };
            xhr.open("POST", url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(data);
        });
    }

    function load(url, selector) {
        return new Promise(function (resolve, reject) {
            doRequest('GET', url)
                .then(function (html) {
					if (selector.firstChild && selector.firstChild.__vue__) {
						//console.warn('destroy component');
						selector.firstChild.__vue__.$destroy();
					}
                    let dp = new DOMParser();
                    let rdoc = dp.parseFromString(html, 'text/html');
                    // first element from fragment body
					let srcElem = rdoc.body.firstElementChild;
					let elemId = srcElem.id || null;
					selector.innerHTML = srcElem ? srcElem.outerHTML : '';
					if (elemId && !document.getElementById(elemId)) {
						selector.innerHTML = '';
						resolve(false);
						return;
					}
                    for (let i = 0; i < rdoc.scripts.length; i++) {
                        let s = rdoc.scripts[i];
                        if (s.type === 'text/javascript') {
                            let newScript = document.createElement("script");
                            newScript.text = s.text;
                            document.body.appendChild(newScript).parentNode.removeChild(newScript);
                        }
                    }
                    if (selector.firstChild && selector.firstChild.__vue__) {
                        let ve = selector.firstChild.__vue__;
                        ve.$data.__baseUrl__ = urlTools.normalizeRoot(url);
                    }
                    resolve(true);
                })
                .catch(function (error) {
                    alert(error);
                    resolve(false);
                });
		});
	}
};





/*20170915-7033*/
/* platform/routex.js */

(function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	// TODO:

	// 1: save/restore query (localStorage)

	const titleStore = {};

    function setTitle(to) {
		if (to.title) {
			document.title = to.title;
			titleStore[to.url] = to.title;
		}
	}

	function makeBackUrl(url) {
		let urlArr = url.split('/');
		if (urlArr.length === 5)
			return urlArr.slice(0, 3).join('/');
		else if (url.length === 4)
			return urlArr.slice(0, 2).join('/');
		return url;
    }

    function normalizedRoute()
    {
        let path = window.location.pathname;
        return urlTools.normalizeRoot(path);
    }

	const store = new Vuex.Store({
		state: {
            route: normalizedRoute(),
			query: urlTools.parseQueryString(window.location.search)
		},
		getters: {
			seg0: (state) => state.route.split('/')[1],
			seg1: (state) => state.route.split('/')[2],
			len: (state) => state.route.split('/').length,
			url: (state) => state.route,
			query: (state) => state.query,
			route: (state) => {
				let sr = state.route.split('/');
				return {
					len: sr.length,
					seg0: sr[1],
					seg1: sr[2]
				};
			},
			baseUrl: (state) => {
				return state.route + urlTools.makeQueryString(state.query);
			},
			search: (state) => {
				return urlTools.makeQueryString(state.query);
			}		
		},
		mutations: {
            navigate(state, to) { // to: {url, query, title}
                let root = window.$$rootUrl;
				let oldUrl =  root + state.route + urlTools.makeQueryString(state.query);
				state.route = to.url;
				state.query = Object.assign({}, to.query);
				let newUrl = root + state.route + urlTools.makeQueryString(to.query);
				let h = window.history;
				setTitle(to);
				// push/pop state feature. Replace the current state and push new one.
				h.replaceState(oldUrl, null, oldUrl);
				h.pushState(oldUrl, null, newUrl);
			},
			query(state, query) {
				// changes all query
                let root = window.$$rootUrl;
				state.query = Object.assign({}, query);
				let newUrl = root + state.route + urlTools.makeQueryString(state.query);
				//console.warn('set query: ' + newUrl);
				window.history.replaceState(null, null, newUrl);
			},
			setquery(state, query) {
				// changes some fields or query
                let root = window.$$rootUrl;
				state.query = Object.assign({}, state.query, query);
				let newUrl = root + state.route + urlTools.makeQueryString(state.query);
				// TODO: replaceUrl: boolean
				//console.warn('set setquery: ' + newUrl);
				window.history.replaceState(null, null, newUrl);
				eventBus.$emit('queryChange', urlTools.makeQueryString(state.query));
			},
			popstate(state) {
                state.route = normalizedRoute();
				state.query = urlTools.parseQueryString(window.location.search);
				if (state.route in titleStore) {
					document.title = titleStore[state.route];
				}
			},
            setstate(state, to) { // to: {url, title}
                window.history.replaceState(null, null, window.$$rootUrl + to.url);
                state.route = normalizedRoute();
				state.query = urlTools.parseQueryString(window.location.search);
				setTitle(to);
            },
            setnewid(state, to) {
                let root = window.$$rootUrl;
                let oldRoute = state.route;
				let newRoute = oldRoute.replace('/new', '/' + to.id);
				state.route = newRoute;
				let newUrl = root + newRoute + urlTools.makeQueryString(state.query);
				window.history.replaceState(null, null, newUrl);
            },
			close(state) {
				if (window.history.length > 1) {
					let oldUrl = window.location.pathname;
					window.history.back();
					// it is done?
					setTimeout(() => {
						if (window.location.pathname === oldUrl) {
							store.commit('navigate', { url: makeBackUrl(state.route) });
						}
					}, 300);
				} else
					store.commit('navigate', { url: makeBackUrl(state.route) });
			}
		}
	});

	function replaceUrlSearch(url, search) {
		let parts = url.split('?');
		return parts[0] + (search || '');
	}

	function replaceUrlQuery(url, query) {
		return replaceUrlSearch(url, urlTools.makeQueryString(query));
	}

	store.parseQueryString = urlTools.parseQueryString;
	store.makeQueryString = urlTools.makeQueryString;
	store.replaceUrlSearch = replaceUrlSearch;
	store.replaceUrlQuery = replaceUrlQuery;
	store.makeBackUrl = makeBackUrl;

	app.components['std:store'] = store;
})();
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171204-7075
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
        isDateCtor: isDateCtor,
        isEmptyObject: isEmptyObject,
        defineProperty: defProperty,
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
        },
        text: {
            contains: textContains,
            containsText: textContainsText
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

    function isDateCtor(ctor) {
        return ctor === Date;
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

    function textContains(text, probe) {
        if (!probe)
            return true;
        if (!text)
            return false;
        return (text || '').toString().toLowerCase().indexOf(probe.toLowerCase()) != -1;
    }

    function textContainsText(obj, props, probe) {
        if (!probe) return true;
        if (!obj)
            return false;
        for (v of props.split(',')) {
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

};



/*20171029-7060*/
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
        traceEnabled() {
            if (!_sessionLoaded)
                loadSession();
			return _traceEnabled;
		},
		enableTrace(val) {
			_traceEnabled = val;
            console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
            window.sessionStorage.setItem(traceEnabledKey, val);
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



// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171203-7075
// services/datamodel.js

(function () {

	"use strict";
    /* TODO:
    1. changing event
    4. add plain properties
    */
	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
    const ERRORS = '_errors_';

    const FLAG_VIEW = 1;
    const FLAG_EDIT = 2;
    const FLAG_DELETE = 4;

	const platform = require('std:platform');
	const validators = require('std:validators');
	const utils = require('std:utils');
    const log = require('std:log');

    let __initialized__ = false;

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
		if (type === Number) {
			return utils.toNumber(val);
        }
		return val;
	}

	function defSource(trg, source, prop, parent) {
		let propCtor = trg._meta_.props[prop];
		let pathdot = trg._path_ ? trg._path_ + '.' : '';
		let shadow = trg._src_;
		source = source || {};
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
            case TMarker: // marker for dynamic property
                let mp = trg._meta_.markerProps[prop];
                shadow[prop] = mp;
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
				//TODO: emit and handle changing event
				val = ensureType(this._meta_.props[prop], val);
				if (val === this._src_[prop])
                    return;
                if (this._src_[prop].$set && !val.$set) {
                    // plain element to reactive
                    this._src_[prop].$merge(val, false);
                } else {
                    this._src_[prop] = val;
                }
                this._root_.$setDirty(true);
                if (this._lockEvents_)
                    return; // events locked
				if (!this._path_)
					return;
				let eventName = this._path_ + '.' + prop + '.change';
				this._root_.$emit(eventName, this, val);
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
                    log.info(`create scalar property: ${objname}.${p}`);
                    elem._meta_.props[p] = propInfo;
                } else if (utils.isObjectExact(propInfo)) {
                    if (!propInfo.get) { // plain object
                        log.info(`create object property: ${objname}.${p}`);
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
                    log.info(`create property: ${objname}.${p}`);
                    Object.defineProperty(elem, p, {
                        configurable: false,
                        enumerable: true,
                        get: propInfo
                    });
                } else if (utils.isObjectExact(propInfo)) {
                    if (propInfo.get) { // has get, maybe set
                        log.info(`create property: ${objname}.${p}`);
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
			startTime = performance.now();
		parent = parent || elem;
		defHidden(elem, SRC, {});
		defHidden(elem, PATH, path);
		defHidden(elem, ROOT, parent._root_ || parent);
		defHidden(elem, PARENT, parent);
		defHidden(elem, ERRORS, null, true);
        defHidden(elem, '_lockEvents_', 0, true);

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

		defPropertyGet(elem, "$valid", function () {
			if (this._root_._needValidate_)
                this._root_._validateAll_();
			if (this._errors_)
				return false;
			for (var x in this) {
				if (x[0] === '$' || x[0] === '_')
					continue;
				let sx = this[x];
				if (utils.isObject(sx) && '$valid' in sx) {
					let sx = this[x];
					if (!sx.$valid)
						return false;
				}
			}
			return true;
		});
		defPropertyGet(elem, "$invalid", function () {
			return !this.$valid;
        });

		let constructEvent = ctorname + '.construct';
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
			elem._enableValidate_ = true;
            elem._needValidate_ = false;
            elem._modelLoad_ = (caller) => {
                elem.$emit('Model.load', elem, caller);
                elem._root_.$setDirty(false);
                __initialized__ = true;
            };
            defHiddenGet(elem, '$readOnly', isReadOnly);
		}
        if (startTime) {
            log.time('create root time:', startTime, false);
        }
		return elem;
    }

    function isReadOnly() {
        if ('__modelInfo' in this) {
            let mi = this.__modelInfo;
            if (utils.isDefined(mi.ReadOnly))
                return mi.ReadOnly;
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
		return new Array(length || 0);
	}

    _BaseArray.prototype = Array.prototype;
    _BaseArray.prototype.$selected = null;

	defineCommonProps(_BaseArray.prototype);

	_BaseArray.prototype.$new = function (src) {
		let newElem = new this._elem_(src || null, this._path_ + '[]', this);
		newElem.$checked = false;
		return newElem;
	};


	defPropertyGet(_BaseArray.prototype, "Count", function () {
		return this.length;
	});

    defPropertyGet(_BaseArray.prototype, "$isEmpty", function () {
        return !this.length;
    });

    defPropertyGet(_BaseArray.prototype, "$checked", function () {
        return this.filter((el) => el.$checked);
    });

    _BaseArray.prototype.Selected = function (propName) {
        return this.$selected ? this.$selected[propName] : null;
    };

    _BaseArray.prototype.$loadLazy = function () {
        return new Promise((resolve, reject) => {
            if (this.$loaded) { resolve(self); return; }
            if (!this.$parent) { resolve(this); return; }
            const meta = this.$parent._meta_;
            if (!meta.$lazy) { resolve(this); return; }
            let propIx = this._path_.lastIndexOf('.');
            let prop = this._path_.substring(propIx + 1);
            if (!meta.$lazy.indexOf(prop) === -1) { resolve(this); return; }
            this.$vm.$loadLazy(this.$parent, prop).then(() => resolve(this));
        });
    }

    _BaseArray.prototype.$append = function (src) {
        const that = this;
        function append(src, select) {
            let addingEvent = that._path_ + '[].adding';
            let newElem = that.$new(src);
            // TODO: emit adding and check result
            let er = that._root_.$emit(addingEvent, that/*array*/, newElem/*elem*/);
            if (er === false)
                return; // disabled
            let len = that.push(newElem);
            let ne = that[len - 1]; // maybe newly created reactive element
            let eventName = that._path_ + '[].add';
            that._root_.$setDirty(true);
            that._root_.$emit(eventName, that /*array*/, ne /*elem*/, len - 1 /*index*/);
            if (select) {
                platform.set(that, "$selected", ne);
                emitSelect(that);
            }
            // set RowNumber
            if ('$rowNo' in newElem._meta_) {
                let rowNoProp = newElem._meta_.$rowNo;
                newElem[rowNoProp] = len; // 1-based
            }
            return ne;
        }
        if (utils.isArray(src)) {
            let ra = [];
            let lastElem = null;
            src.forEach(function (elem) {
                lastElem = append(elem, false);
                ra.push(append(elem, false));
            });
            if (lastElem) {
                // last added element
                platform.set(that, "$selected", lastElem);
                emitSelect(that);
            }
            return ra;
        } else
            return append(src, true);

	};

    _BaseArray.prototype.$empty = function () {
        if (this.$root.isReadOnly)
            return;
		this.splice(0, this.length);
		return this;
	};

    _BaseArray.prototype.$clearSelected = function () {
        let sel = this.$selected;
        if (!sel) return; // already null
        platform.set(this, '$selected', null);
        emitSelect(this);
    };

	_BaseArray.prototype.$remove = function (item) {
		if (!item)
			return;
		let index = this.indexOf(item);
		if (index === -1)
			return;
		this.splice(index, 1); // EVENT
		let eventName = this._path_ + '[].remove';
		this._root_.$setDirty(true);
		this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);
		if (index >= this.length)
			index -= 1;
        if (this.length > index) {
            platform.set(this, '$selected', this[index]);
            emitSelect(this);
        }
		// renumber rows
		if ('$rowNo' in item._meta_) {
			let rowNoProp = item._meta_.$rowNo;
			for (let i = 0; i < this.length; i++) {
				this[i][rowNoProp] = i + 1; // 1-based
			}
		}
	};

	_BaseArray.prototype.$copy = function (src) {
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
	}

	function defineObject(obj, meta, arrayItem) {
		defHidden(obj.prototype, META, meta);

        obj.prototype.$merge = merge;
        obj.prototype.$empty = empty;
        obj.prototype.$set = setElement;

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

    function emitSelect(arr) {
        let selectEvent = arr._path_ + '[].select';
        let er = arr._root_.$emit(selectEvent, arr/*array*/, arr.$selected /*item*/);
    }

	function defArrayItem(elem) {
		elem.prototype.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
        };
		elem.prototype.$select = function (root) {
			let arr = root || this._parent_;
			if (arr.$selected === this)
				return;
            platform.set(arr, "$selected", this);
            emitSelect(arr);
		};

		elem.prototype.$isSelected = function (root) {
			let arr = root || this._parent_;
			return arr.$selected === this;

		};
	}

	function emit(event, ...arr) {
		if (this._enableValidate_) {
			if (!this._needValidate_) {
				this._needValidate_ = true;
			}
		}
		log.info('emit: ' + event);
		let templ = this.$template;
		if (!templ) return;
		let events = templ.events;
		if (!events) return;
		if (event in events) {
			// fire event
			log.info('handle: ' + event);
			let func = events[event];
			let rv = func.call(undefined, ...arr);
			if (rv === false)
				log.info(event + ' returns false');
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

    function canExecuteCommand(cmd, ...args) {
        let tml = this.$template;
        if (tml && tml.commands) {
            let cmdf = tml.commands[cmd];
            if (!cmdf)
                return false;
            if (cmdf.checkReadOnly === true) {
                if (this.$root.$readOnly)
                    return false;
            }
            if (utils.isFunction(cmdf.canExec)) {
                return cmdf.canExec.apply(this, args);
            } else if (utils.isBoolean(cmdf.canExec)) {
                return cmdf.canExec; // for debugging purposes
            } else if (utils.isDefined(cmdf.canExec)) {
                console.error(`${cmd}.canExec should be a function`);
                return false;
            }
            return true;
        }
        return false;
    }

	function executeCommand(cmd, ...args) {
		try {
			this._root_._enableValidate_ = false;
			let tml = this.$template;
			if (tml && tml.commands) {
				let cmdf = tml.commands[cmd];
				if (typeof cmdf === 'function') {
					cmdf.apply(this, args);
                    return;
                } else if (utils.isObjectExact(cmdf)) {
                    if (utils.isFunction(cmdf.canExec))
                        if (!cmdf.canExec.apply(this, args))
                            return;
                    if (cmdf.saveRequired)
                        alert('to implement: exec.saveRequired');
                    if (cmdf.confirm) {
                        let vm = this.$vm;
                        vm.$confirm(cmdf.confirm)
                            .then(() => cmdf.exec.apply(this, args));
                    } else {
                        cmdf.exec.apply(this, args);
                    }
                    return;
                }
			}
			console.error(`command "${cmd}" not found`);
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
				// elem.ix - индексы в массивах, по которым мы прохoдили
				// console.dir(elem.ix);
			}

		}
		return errs.length ? errs : null;
	}

	function validateAll() {
		var me = this;
        if (!me._host_) return;
        if (!me._needValidate_) return;
        me._needValidate_ = false;
		var startTime = performance.now();
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
		var e = performance.now();
		log.time('validation time:', startTime);
		//console.dir(allerrs);
	}

    function setDirty(val) {
        if (this.$root.$readOnly)
            return;
		this.$dirty = val;
	}

    function empty() {
        if (this.$root.isReadOnly)
            return;
        // ctor(source path parent)
        let newElem = new this.constructor({}, '', this._parent_);
        this.$merge(newElem, true); // with event
    }

    function setElement(src) {
        this.$merge(src, true);
    }

    function merge(src, fireChange) {
		try {
            this._root_._enableValidate_ = false;
            this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				let ctor = this._meta_.props[prop];
				let trg = this[prop];
				if (Array.isArray(trg)) {
					platform.set(trg, "$selected", null);
					trg.$copy(src[prop]);
					// copy rowCount
                    if ('$RowCount' in trg) {
						let rcProp = prop + '.$RowCount';
						if (rcProp in src)
							trg.$RowCount = src[rcProp] || 0;
						else
							trg.$RowCount = 0;
					}
					// try to select old value
                } else {
                    if (utils.isDateCtor(ctor))
                        platform.set(this, prop, new Date(src[prop]));
                    else if (utils.isPrimitiveCtor(ctor)) {
                        platform.set(this, prop, src[prop]);
                    } else {
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
        if (fireChange) {
            // emit .change event for all object
            let eventName = this._path_ + '.change';
            this._root_.$emit(eventName, this.$parent, this);
        }
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$merge = merge;
		root.prototype.$template = template;
        root.prototype._exec_ = executeCommand;
        root.prototype._canExec_ = canExecuteCommand;
		root.prototype._delegate_ = getDelegate;
		root.prototype._validate_ = validate;
		root.prototype._validateAll_ = validateAll;
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

	function setModelInfo(root, info) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: 20
		};
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
/*20170819-7016*/
/* dataservice.js */
(function () {

	let http = require('std:http');
	let utils = require('std:utils');

	function post(url, data) {
		return http.post(url, data);
	}

	app.modules['std:dataservice'] = {
		post: post
	};
})();




/*20171029-7060*/
/* services/popup.js */

app.modules['std:popup'] = function () {

	const __dropDowns__ = [];
	let __started = false;

    const __error = 'Perhaps you forgot to create a _close function for popup element';


	return {
		startService: startService,
		registerPopup: registerPopup,
		unregisterPopup: unregisterPopup,
        closeAll: closeAllPopups,
        closest: closest,
        closeInside: closeInside
	};

    function registerPopup(el) {
		__dropDowns__.push(el);
	}

	function unregisterPopup(el) {
		let ix = __dropDowns__.indexOf(el);
		if (ix !== -1)
			__dropDowns__.splice(ix, 1);
		delete el._close;
	}

	function startService() {
		if (__started)
			return;

		__started = true;

		document.body.addEventListener('click', closePopups);
		document.body.addEventListener('contextmenu', closePopups);  
		document.body.addEventListener('keydown', closeOnEsc);
	}


	function closest(node, css) {
		if (node) return node.closest(css);
		return null;
	} 

	function closeAllPopups() {
		__dropDowns__.forEach((el) => {
			if (el._close)
				el._close(document);
		});
    }

    function closeInside(el) {
        if (!el) return;
        // inside el only
        let ch = el.querySelectorAll('.popover-wrapper');
        for (let i = 0; i < ch.length; i++) {
            let chel = ch[i];
            if (chel._close) {
                chel._close();
            }
        }
    }

	function closePopups(ev) {
		if (__dropDowns__.length === 0)
            return;
		for (let i = 0; i < __dropDowns__.length; i++) {
            let el = __dropDowns__[i];
			if (closest(ev.target, '.dropdown-item') ||
				ev.target.hasAttribute('close-dropdown') ||
				closest(ev.target, '[dropdown-top]') !== el) {
                if (!el._close) {
                    throw new Error(__error);
                }
				el._close(ev.target);
			}
		}
	}

	// close on esc
	function closeOnEsc(ev) {
		if (ev.which !== 27) return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (!el._close)
				throw new Error(__error);
			el._close(ev.target);
		}
	}
};


/*20170824-7019*/
/*components/include.js*/

(function () {

    const http = require('std:http');
    const urlTools = require('std:url');

    Vue.component('include', {
        template: '<div :class="implClass"></div>',
        props: {
            src: String,
            cssClass: String,
            needReload: Boolean
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
            },
            requery() {
				if (this.currentUrl) {
                    // Do not set loading. Avoid blinking
                    http.load(this.currentUrl, this.$el).then(this.loaded);
                }
            }
        },
        computed: {
            implClass() {
                return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
            }
		},
        mounted() {
            if (this.src) {
				this.currentUrl = this.src;
                http.load(this.src, this.$el).then(this.loaded);
            }
        },
        destroyed() {
            let fc = this.$el.firstElementChild;
			if (fc && fc.__vue__) {
				//console.warn('desroy component');
				fc.__vue__.$destroy();
			}
        },
        watch: {
			src: function (newUrl, oldUrl) {
                if (newUrl.split('?')[0] === oldUrl.split('?')[0]) {
                    // Only the search has changed. No need to reload.
                    this.currentUrl = newUrl;
                }
                else if (urlTools.idChangedOnly(newUrl, oldUrl)) {
                    // Id has changed after save. No need to reload.
                    this.currentUrl = newUrl;
                }
				else {
					this.loading = true; // hides the current view
					this.currentUrl = newUrl;
                    //console.warn('src was changed. load');
					http.load(newUrl, this.$el).then(this.loaded);
				}
            },
            needReload(val) {
                // works like a trigger
                if (val) this.requery();
            }
        }
    });
})();
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171105-7067
// components/control.js

(function () {

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean,
            tabIndex: Number,
            dataType: String
        },
        computed: {
			path() {
                return this.item._path_ + '.' + this.prop;
            },
            pathToValidate() {
                return this.itemToValidate._path_ + '.' + this.propToValidate;
            },
            errors() {
                if (!this.item) return null;
				let root = this.item._root_;
				if (!root) return null;
				if (!root._validate_)
                    return null;
                let err;
                if (this.itemToValidate)
                    err = root._validate_(this.itemToValidate, this.pathToValidate, this.itemToValidate[this.propToValidate], this.deferUpdate);
                else
                    err = root._validate_(this.item, this.path, this.item[this.prop], this.deferUpdate);
                return err;
            },
            inputClass() {
                let cls = '';
                if (this.align !== 'left')
                    cls += 'text-' + this.align;
                if (this.isNegative) cls += ' negative-red';
                return cls;
            },
            isNegative() {
                if (this.dataType === 'Number' || this.dataType === 'Currency')
                    if (this.item && this.item[this.prop] < 0)
                        return true;
                return false;
            },
			hasLabel() {
				return !!this.label;
			},
			hasDescr() {
				return !!this.description;
			}
        },
        methods: {
            valid() {
                // method! no cache!
                return !this.invalid();
            },
            invalid() {
                // method! no cache!
                let err = this.errors;
                if (!err) return false;
                return err.length > 0;
            },
            cssClass() {
                // method! no cached!!!
                let cls = 'control-group' + (this.invalid() ? ' invalid' : ' valid');
                if (this.required) cls += ' required';
                if (this.disabled) cls += ' disabled';
                return cls;
            },
            deferUpdate() {
                this.$children.forEach((val) => val.$forceUpdate());
                this.$forceUpdate();
            },
            test() {
                alert('from base control');
            }
        }
    };

    app.components['control'] = control;

})();
/* 20170919-7035 */
/*components/validator.js*/

Vue.component('validator', {
    props: {
        'invalid': Function,
        'errors': Array
    },
    template: '<div v-if="invalid()" class="validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
});


/*
TODO: нужно, чтобы добавлялся invalid для родительского элемента.
Vue.component('validator-control', {
    template: '<validator :invalid="invalid" :errors="errors"></validator></div>',
    props: {
        item: {
            type: Object, default() {
                return {};
            }
        },
        prop: String
    },
    created() {
        alert(this.errors);
    },
    computed: {
        path() {
            return this.item._path_ + '.' + this.prop;
        },
        invalid() {
            let err = this.errors;
            return err && err.length > 0;
        },
        errors() {
            if (!this.item) return null;
            let root = this.item._root_;
            if (!root) return null;
            if (!root._validate_)
                return null;
            return root._validate_(this.item, this.path, this.item[this.prop]);
        },
    }
});
*/
/*20171027-7057*/
/*components/textbox.js*/

(function () {

    const utlis = require('std:utils');

    let textBoxTemplate =
`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input :type="controlType" v-focus v-model.lazy="item[prop]" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let textAreaTemplate =
        `<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<textarea v-focus v-model.lazy="item[prop]" :rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let staticTemplate =
`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group static">
		<span v-focus v-text="text" :class="inputClass" :tabindex="tabIndex"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	/*
	<span>{{ path }}</span>
		<button @click="test" >*</button >
	*/

    let baseControl = component('control');

    Vue.component('textbox', {
        extends: baseControl,
        template: textBoxTemplate,
		props: {
			item: {
				type: Object, default() {
					return {};
				}
			},
            prop: String,
            itemToValidate: Object,
            propToValidate: String,
            placeholder: String,
            password: Boolean
        },
        computed: {
            controlType() {
                return this.password ? "password" : "text";
            }
        }
    });

    Vue.component('a2-textarea', {
        extends: baseControl,
        template: textAreaTemplate,
        props: {
            item: {
                type: Object, default() {
                    return {};
                }
            },
            prop: String,
            itemToValidate: Object,
            propToValidate: String,
            placeholder: String,
            rows:Number
        }
    });

    Vue.component('static', {
        extends: baseControl,
        template: staticTemplate,
        props: {
            item: {
                type: Object, default() {
                    return {};
                }
            },
            prop: String,
            itemToValidate: Object,
            propToValidate: String,
            text: [String, Number, Date]
        }
    });

})();
/*20171027-7057*/
/*components/combobox.js*/

(function () {


    const utils = require('std:utils');

    let comboBoxTemplate =
`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<select v-focus v-model="cmbValue" :class="inputClass" :disabled="disabled" :tabindex="tabIndex">
			<slot>
				<option v-for="(cmb, cmbIndex) in itemsSource" :key="cmbIndex" 
					v-text="cmb.$name" :value="cmb"></option>
			</slot>
		</select>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let baseControl = component('control');

	const defaultObj = {
		_validate_() {
			return true;
		}
	};

    Vue.component('combobox', {
        extends: baseControl,
		template: comboBoxTemplate,
		props: {
			prop: String,
			item: {
				type: Object, default() { return {}; } },
			itemsSource: {
				type: Array, default() { return []; } },
            itemToValidate: Object,
            propToValidate: String
		},
		computed: {
			cmbValue: {
                get() {
                    let val = this.item ? this.item[this.prop] : null;
                    if (!utils.isObjectExact(val))
						return val;
					if (!('$id' in val))
						return val;
                    if (this.itemsSource.indexOf(val) !== -1) {
                        return val;
                    }
                    // always return value from ItemsSource
                    return this.itemsSource.find((x) => x.$id === val.$id);
                },
				set(value) {
					if (this.item) this.item[this.prop] = value;
				}
            },
        }
    });
})();
/*20170927-7057*/
/* components/datepicker.js */


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');

	Vue.component('a2-date-picker', {
		extends: baseControl,
		template: `
<div  :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
    <div class="input-group">
        <input v-focus v-model.lazy="model" :class="inputClass" />
        <a href @click.stop.prevent="toggle($event)"><i class="ico ico-calendar"></i></a>
		<validator :invalid="invalid" :errors="errors"></validator>
		<div class="calendar" v-if="isOpen" @click.stop.prevent="dummy">
			<table>
				<thead><tr>
						<th><a @click.stop.prevent='prevMonth'><i class="ico ico-triangle-left"></i></a></th>
						<th colspan="5"><span v-text="title"></span></th>
						<th><a @click.stop.prevent='nextMonth'><i class="ico ico-triangle-right"></i></a></th>					
					</tr>
					<tr class="weekdays"><th v-for="d in 7" v-text="wdTitle(d)">Пн</th></tr>
				</thead>
				<tbody>
					<tr v-for="row in days">
						<td v-for="day in row" :class="dayClass(day)"><a @click.stop.prevent="selectDay(day)" v-text="day.getDate()" :title="dayTitle(day)"/></td>
					</tr>
				</tbody>
				<tfoot><tr><td colspan="7"><a @click.stop.prevent='today'>cьогодні</a></td></tr></tfoot>
			</table>
		</div>
    </div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
            itemToValidate: Object,
            propToValidate: String,
			// override control.align (default value)
			align: { type: String, default: 'center' }
		},
		data() {
			return {
				isOpen: false
			};
		},
		methods: {
			dummy() {
			},
			toggle(ev) {
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
					if (utils.date.isZero(this.modelDate))
						this.item[this.prop] = utils.date.today();
				}
				this.isOpen = !this.isOpen;
			},
			today() {
				this.selectDay(utils.date.today());
			},
			prevMonth() {
				let dt = new Date(this.modelDate);
				dt.setMonth(dt.getMonth() - 1);
				this.item[this.prop] = dt;
			},
			nextMonth() {
				let dt = new Date(this.modelDate);
				dt.setMonth(dt.getMonth() + 1);
				this.item[this.prop] = dt;
			},
			selectDay(day) {
				this.item[this.prop] = day;
				this.isOpen = false;
			},
			wdTitle(d) {
				let dt = this.days[0][d - 1];
				return dt.toLocaleString("uk-UA", { weekday: "short" });
			},
			dayClass(day) {
				let cls = '';
				let tls = utils.date;
				if (tls.equal(day, tls.today()))
					cls += ' today';
				if (tls.equal(day, this.modelDate))
					cls += ' active';
				if (day.getMonth() !== this.modelDate.getMonth())
					cls += " other";
				return cls;
			},
			dayTitle(day) {
				return day.toLocaleString("uk-UA", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		computed: {
			modelDate() {
				return this.item[this.prop];
			},
			model: {
				get() {
					if (utils.date.isZero(this.modelDate))
						return '';
					return this.modelDate.toLocaleString("uk-UA", { year: 'numeric', month: '2-digit', day: '2-digit' });
				},
				set(str) {
					let md = utils.date.parse(str);
					this.item[this.prop] = md;
					if (utils.date.isZero(md))
						this.isOpen = false;
				}
			},
			title() {
				let mn = this.modelDate.toLocaleString("uk-UA", { month: "long", year: 'numeric' });
				return mn.charAt(0).toUpperCase() + mn.slice(1);
			},
			days() {
				let dt = new Date(this.modelDate);
				dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
				let d = dt.getDate();
				dt.setDate(1); // 1-st day of month
				let w = dt.getDay() - 1; // weekday
				if (w === -1) w = 6;
				else if (w === 0) w = 7;
				dt.setDate(-w + 1);
				let arr = [];
				for (let r = 0; r < 6; r++) {
					let row = [];
					for (let c = 0; c < 7; c++) {
						row.push(new Date(dt));
						dt.setDate(dt.getDate() + 1);
					}
					arr.push(row);
				}
				return arr;
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171116-7069
// components/datagrid.js*/

(function () {

 /*TODO:
7. Доделать checked
10.
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

	/**
	 * группировки. v-show на строке гораздо быстрее, чем v-if на всем шаблоне
	 */

	/*
		{{g.group}} level:{{g.level}} expanded:{{g.expanded}} source:{{g.source}} count:
	 */


	const utils = require('std:utils');
	const log = require('std:log');

    const dataGridTemplate = `
<div v-lazy="itemsSource" :class="{'data-grid-container':true, 'fixed-header': fixedHeader, 'bordered': border}">
    <div :class="{'data-grid-body': true, 'fixed-header': fixedHeader}">
    <table :class="cssClass">
        <colgroup>
            <col v-if="isMarkCell"/>
			<col v-if="isGrouping" class="fit"/>
            <col v-bind:class="columnClass(col)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
        </colgroup>
        <thead>
            <tr v-show="isHeaderVisible">
                <th v-if="isMarkCell" class="marker"><div v-if="fixedHeader" class="h-holder"></div></th>
				<th v-if="isGrouping" class="group-cell">
					<a @click.prevent="expandGroups(gi)" v-for="gi in $groupCount" v-text='gi' /><a 
						@click.prevent="expandGroups($groupCount + 1)" v-text='$groupCount + 1' />
				</th>
                <slot></slot>
            </tr>
        </thead>
		<template v-if="isGrouping">
			<tbody>
				<template v-for="(g, gIndex) of $groups">
					<tr v-if="isGroupGroupVisible(g)" :class="'group lev-' + g.level" :key="gIndex">
						<td @click.prevent='toggleGroup(g)' :colspan="columns.length + 1">
						<span :class="{expmark: true, expanded: g.expanded}" />
						<span class="grtitle" v-text="groupTitle(g)" />
						<span v-if="g.source.count" class="grcount" v-text="g.count" /></td>
					</tr>
					<template>
						<data-grid-row v-show="isGroupBodyVisible(g)" :group="true" :level="g.level" :cols="columns" v-for="(row, rowIndex) in g.items" :row="row" :key="gIndex + ':' + rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
					</template>
				</template>
			</tbody>
		</template>
		<template v-else>
			<tbody>
				<data-grid-row :cols="columns" v-for="(item, rowIndex) in $items" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
			</tbody>
		</template>
		<slot name="footer"></slot>
    </table>
    </div>
</div>
`;

	/* @click.prevent disables checkboxes & other controls in cells */
    const dataGridRowTemplate = `
<tr @click="row.$select()" :class="rowClass" v-on:dblclick.prevent="doDblClick">
    <td v-if="isMarkCell" class="marker">
        <div :class="markClass"></div>
    </td>
	<td class="group-marker" v-if="group"></td>
    <data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index" />
</tr>`;

    /**
        icon on header!!!
		<i :class="\'ico ico-\' + icon" v-if="icon"></i>
     */
    const dataGridColumnTemplate = `
<th :class="cssClass" @click.prevent="doSort">
    <div class="h-fill" v-if="fixedHeader">
        {{header || content}}
    </div><div class="h-holder">
		<slot>{{header || content}}</slot>
	</div>
</th>
`;

    const dataGridColumn = {
        name: 'data-grid-column',
        template: dataGridColumnTemplate,
        props: {
            header: String,
			content: String,
			dataType: String,
            icon: String,
            bindIcon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            noPadding: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined },
			mark: String,
			controlType: String,
			width: String,
            fit: Boolean,
            wrap: String,
            command: Object,
        },
        created() {
			this.$parent.$addColumn(this);
        },
		computed: {
            dir() {
				return this.$parent.sortDir(this.content);
            },
            fixedHeader() {
                return this.$parent.fixedHeader;
            },
            isSortable() {
                if (!this.content)
                    return false;
                return typeof this.sort === 'undefined' ? this.$parent.isGridSortable : this.sort;
            },
            isUpdateUrl() {
                return !this.$root.inDialog;
            },
			template() {
				return this.id ? this.$parent.$scopedSlots[this.id] : null;
			},
			classAlign() {
				return this.align !== 'left' ? (' text-' + this.align).toLowerCase() : '';
			},
            cssClass() {
                let cssClass = this.classAlign;
                if (this.isSortable) {
                    cssClass += ' sort';
                    if (this.dir)
                        cssClass += ' ' + this.dir;
                }
                return cssClass;
            }
        },
		methods: {
            doSort() {
                if (!this.isSortable)
					return;
				this.$parent.doSort(this.content);
            },
            cellCssClass(row, editable) {
                let cssClass = this.classAlign;
                if (this.mark) {
                    let mark = row[this.mark];
                    if (mark)
                        cssClass += ' ' + mark;
                }
                if (editable && this.controlType !== 'checkbox')
                    cssClass += ' cell-editable';
                if (this.wrap)
                    cssClass += ' ' + this.wrap;
                return cssClass.trim();
            }
        }
	};

    Vue.component('data-grid-column', dataGridColumn);

    const dataGridCell = {
        functional: true,
        name: 'data-grid-cell',
        props: {
            row: Object,
            col: Object,
            index: Number
        },
        render(h, ctx) {
            //console.warn('render cell');
            let tag = 'td';
            let row = ctx.props.row;
            let col = ctx.props.col;
			let ix = ctx.props.index;
            let cellProps = {
                'class': col.cellCssClass(row, col.editable || col.noPadding)
            };

            let childProps = {
                props: {
                    row: row,
                    col: col
                }
            };
            if (col.template) {
                let vNode = col.template(childProps.props);
                return h(tag, cellProps, [vNode]);
            }

			if (col.controlType === 'validator') {
				let cellValid = {
					props: ['item', 'col'],
					template: '<span><i v-if="item.$invalid" class="ico ico-error"></i></span>'
				};
				cellProps.class = { 'cell-validator': true };
				return h(tag, cellProps, [h(cellValid, { props: { item: row, col: col } })]);
			}

            if (!col.content && !col.icon && !col.bindIcon) {
                return h(tag, cellProps);
            }

            let validator = {
                props: ['path', 'item'],
                template: '<validator :path="path" :item="item"></validator>'
            };

            let validatorProps = {
                props: {
                    path: col.validate,
                    item: row
                }
            };

			function normalizeArg(arg, eval) {
				arg = arg || '';
				if (arg === 'this')
					arg = row;
				else if (arg.startsWith('{')) {
					arg = arg.substring(1, arg.length - 1);
					if  (!(arg in row))
						throw new Error(`Property '${arg1}' not found in ${row.constructor.name} object`);
					arg = row[arg];
				} else if (arg && eval)
					arg = utils.eval(row, arg, col.dataType);
				return arg;
			}

			if (col.command) {
				// column command -> hyperlink
				// arg1. command
				let arg1 = normalizeArg(col.command.arg1, false);
				let arg2 = normalizeArg(col.command.arg2, col.command.eval);
                let arg3 = normalizeArg(col.command.arg3, false);
                let ev = col.command.$ev;
				let child = {
					props: ['row', 'col'],
					/*prevent*/
					template: '<a @click.prevent="doCommand($event)" :href="getHref()" v-text="eval(row, col.content, col.dataType)"></a>',
					methods: {
                        doCommand(ev) {
                            if (ev) {
                                // ??? lock double click ???
                                //ev.stopImmediatePropagation();
                                //ev.preventDefault();
                            }
							col.command.cmd(arg1, arg2, arg3);
						},
						eval: utils.eval,
						getHref() {
							if (arg1 == '$dialog')
								return null;
							let id = arg2;
							if (utils.isObjectExact(arg2))
								id = arg2.$id;
							return arg1 + '/' + id;
						}
					}
				};
				return h(tag, cellProps, [h(child, childProps)]);
			}
            /* simple content */
            if (col.content === '$index')
                return h(tag, cellProps, [ix + 1]);

            function isNegativeRed(col) {
                if (col.dataType === 'Number' || col.dataType === 'Currency')
                    if (utils.eval(row, col.content) < 0)
                        return true;
                return false;
            }

			let content = utils.eval(row, col.content, col.dataType);
            let chElems = [h('span', { 'class': { 'negative-red': isNegativeRed(col) } }, content)];
            let icoSingle = !col.content ? ' ico-single' : '';
            if (col.icon)
                chElems.unshift(h('i', { 'class': 'ico ico-' + col.icon + icoSingle }));
            else if (col.bindIcon)
                chElems.unshift(h('i', { 'class': 'ico ico-' + utils.eval(row, col.bindIcon) + icoSingle }));
            /*TODO: validate ???? */
			if (col.validate) {
                chElems.push(h(validator, validatorProps));
            }
            return h(tag, cellProps, chElems);
		}
    };

    const dataGridRow = {
        name: 'data-grid-row',
        template: dataGridRowTemplate,
        components: {
            'data-grid-cell': dataGridCell
        },
        props: {
            row: Object,
            cols: Array,
            index: Number,
			mark: String,
			group: Boolean,
			level : Number
        },
        computed: {
			active() {
				return this.row == this.$parent.selected;
            },
            rowClass() {
                let cssClass = '';
				if (this.active) cssClass += 'active';
				if (this.$parent.isMarkRow && this.mark) {
					cssClass += ' ' + this.row[this.mark];
                }
                if (this.$parent.rowBold && this.row[this.$parent.rowBold])
                    cssClass += ' bold';
				if (this.level)
					cssClass += ' lev-' + this.level;
                return cssClass.trim();
            },
            isMarkCell() {
                return this.$parent.isMarkCell;
            },
            markClass() {
               return this.mark ? this.row[this.mark] : '';
            }
        },
        methods: {
            rowSelect() {
                throw new Error("do not call");
                //this.$parent.rowSelected = this;
            },
            doDblClick($event) {
				// deselect text
				$event.stopImmediatePropagation();
				if (!this.$parent.doubleclick)
					return;
                window.getSelection().removeAllRanges();
				this.$parent.doubleclick();
            }
        }
    };

	Vue.component('data-grid', {
		props: {
			'items-source': [Object, Array],
			border: Boolean,
			grid: String,
			striped: Boolean,
            fixedHeader: Boolean,
            hideHeader: Boolean,
            hover: { type: Boolean, default: false },
            compact: Boolean,
			sort: Boolean,
			routeQuery: Object,
			mark: String,
			filterFields: String,
            markStyle: String,
            rowBold: String,
			doubleclick: Function,
            groupBy: [Array, Object]
		},
		template: dataGridTemplate,
		components: {
			'data-grid-row': dataGridRow
		},
		data() {
			return {
				columns: [],
				clientItems: null,
				clientGroups: null,
				localSort: {
					dir: 'asc',
					order: ''
				}
			};
		},
		computed: {
			$items() {
				return this.clientItems ? this.clientItems : this.itemsSource;
			},
			isMarkCell() {
				return this.markStyle === 'marker' || this.markStyle === 'both';
			},
			isMarkRow() {
				return this.markStyle === 'row' || this.markStyle === 'both';
            },
            isHeaderVisible() {
                return !this.hideHeader;
            },
			cssClass() {
				let cssClass = 'data-grid';
				if (this.grid) cssClass += ' grid-' + this.grid.toLowerCase();
				if (this.striped) cssClass += ' striped';
                if (this.hover) cssClass += ' hover';
                if (this.compact) cssClass += ' compact';
				return cssClass;
			},
			selected() {
				// reactive!!!
				let src = this.itemsSource;
				if (src.$origin) {
					src = src.$origin;
				}
				return src.$selected;
			},
			isGridSortable() {
				return !!this.sort;
			},
			isLocal() {
				return !this.$parent.sortDir;
			},
			isGrouping() {
				return this.groupBy;
			},
			$groupCount() {
				if (utils.isObjectExact(this.groupBy))
					return 1;
				else
					return this.groupBy.length;
			},
			$groups() {
				function* enumGroups(src, p0, lev, cnt) {
					for (let grKey in src) {
						if (grKey === 'items') continue;
						let srcElem = src[grKey];
						let count = srcElem.items ? srcElem.items.length : 0;
						if (cnt)
							cnt.c += count;
						let pElem = {
							group: grKey,
							p0: p0,
							expanded: true,
							level: lev,
							items: srcElem.items || null,
							count: count
						};
						yield pElem;
						if (!src.items) {
							let cnt = { c: 0 };
							yield* enumGroups(srcElem, pElem, lev + 1, cnt);
							pElem.count += cnt.c;
						}
					}
				}
				this.doSortLocally();
				// classic tree
				let startTime = performance.now(); 
				let grmap = {};
				let grBy = this.groupBy;
				if (utils.isObjectExact(grBy))
					grBy = [grBy];
				for (let itm of this.$items) {
					let root = grmap;
					for (let gr of grBy) {
						let key = itm[gr.prop];
						if (!utils.isDefined(key)) key = '';
						if (key === '') key = "Unknown";
						if (!(key in root)) root[key] = {};
						root = root[key];
					}
					if (!root.items)
						root.items = [];
					root.items.push(itm);
				}
				// tree to plain array
				let grArray = [];
				for (let el of enumGroups(grmap, null, 1)) {
					el.source = grBy[el.level - 1];
					if (el.source.expanded === false)
						el.expanded = false;
					grArray.push(el);
				}
				this.clientGroups = grArray;
				log.time('datagrid grouping time:', startTime);
				return this.clientGroups;
			}
		},
		watch: {
			localSort: {
				handler() {
					this.handleSort();
				},
				deep: true
			},
			'itemsSource.length'() {
				this.handleSort();
			}
		},
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            },
			columnClass(column) {
				let cls = '';
				if (column.fit || (column.controlType === 'validator'))
					cls += 'fit';
				if (utils.isDefined(column.dir))
					cls += ' sorted';
                return cls;
            },
            columnStyle(column) {
                return {
                    width: utils.isDefined(column.width) ? column.width : undefined
                };
			},
			doSort(order) {
				// TODO: // collectionView || locally
				if (this.isLocal) {
					if (this.localSort.order === order)
						this.localSort.dir = this.localSort.dir === 'asc' ? 'desc' : 'asc';
					else {
						this.localSort = { order: order, dir: 'asc' };
					}
				} else {
					this.$parent.$emit('sort', order);
				}
			},
			sortDir(order) {
				// TODO: 
				if (this.isLocal)
					return this.localSort.order === order ? this.localSort.dir : undefined;
				else
					return this.$parent.sortDir(order);
			},
            doSortLocally()
			{
				if (!this.isLocal) return;
				if (!this.localSort.order) return;
				let startTime = performance.now(); 
				let rev = this.localSort.dir === 'desc';
				let sortProp = this.localSort.order;
                let arr = [].concat(this.itemsSource);
                arr.sort((a, b) => {
                    let av = a[sortProp];
                    let bv = b[sortProp];
                    if (av === bv)
                        return 0;
                    else if (av < bv)
                        return rev ? 1 : -1;
                    else
                        return rev ? -1 : 1;
				});
				log.time('datagrid sorting time:', startTime);
                this.clientItems = arr;
			},
			handleSort() {
				if (this.isGrouping)
					this.clientGroups = null;
				else
					this.doSortLocally();
			},
			toggleGroup(g) {
				g.expanded = !g.expanded;
			},
			isGroupGroupVisible(g) {
				if (!g.group)
					return false;
				if (!g.p0)
					return true;
				let cg = g.p0;
				while (cg) {
					if (!cg.expanded) return false;
					cg = cg.p0;
				}
				return true;
			},
			isGroupBodyVisible(g) {
				if (!g.expanded) return false;
				let cg = g.p0;
				while (cg) {
					if (!cg.expanded) return false;
					cg = cg.p0;
				}
				return true;
			},
			groupTitle(g) {
				if (g.source && g.source.title)
					return g.source.title
						.replace('{Value}', g.group)
						.replace('{Count}', g.count);
				return g.group;
			},
			expandGroups(lev) {
				// lev 1-based
				for (var gr of this.$groups)
					gr.expanded = gr.level < lev;
			}
        }
    });
})();
/*20171020-7053*/
/*components/pager.js*/

/*
template: `
<div class="pager">
	<a href @click.prevent="source.first" :disabled="disabledFirst"><i class="ico ico-chevron-left-end"/></a>
	<a href @click.prevent="source.prev" :disabled="disabledPrev"><i class="ico ico-chevron-left"/></a>

	<a href v-for="b in middleButtons " @click.prevent="page(b)"><span v-text="b"></span></a>

	<a href @click.prevent="source.next"><i class="ico ico-chevron-right"/></a>
	<a href @click.prevent="source.last"><i class="ico ico-chevron-right-end"/></a>
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}} count={{source.sourceCount}}</code>
</div>
*/

Vue.component('a2-pager', {
	props: {
		source: Object
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
                return 'нет элементов';
            return `элементы: <b>${this.offset + 1}</b>-<b>${lastNo}</b> из <b>${this.count}</b>`;
        },
        offset() {
            return this.source.offset;
        },
        count() {
            return this.source.sourceCount;
        }
	},
    methods: {
        setOffset(offset) {
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
                    this.setOffset(this.offset - this.source.pageSize);
                    break;
                case 'next':
                    this.setOffset(this.offset + this.source.pageSize);
                    break;
            }
        },
        goto(page, $ev) {
            $ev.preventDefault();
            this.setOffset((page - 1) * this.source.pageSize);
        }
	},
    render(h, ctx) {
        let contProps = {
            class: 'a2-pager'
        };
        let children = [];
        const dotsClass = { 'class': 'a2-pager-dots' };
        const renderBtn = (page) => {
            return h('button', {
                domProps: { innerText: page },
                on: { click: ($ev) => this.goto(page, $ev) },
                class: { active: this.isActive(page) }
            });
        };
        // prev
        children.push(h('button', {
            on: { click: ($ev) => this.click('prev', $ev) },
            attrs: { disabled: this.offset === 0 }
        }, [h('i', { 'class': 'ico ico-chevron-left' })]
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
            children.push(h('span', dotsClass, '...'));
        for (let mi = ms; mi < me; ++mi) {
            children.push(renderBtn(mi));
        }
        if (me < this.pages - 1)
            children.push(h('span', dotsClass, '...'));
        // last
        if (this.pages > 3)
            children.push(renderBtn(this.pages - 1));
        if (this.pages > 2)
            children.push(renderBtn(this.pages));
        // next
        children.push(h('button', {
            on: { click: ($ev) => this.click('next', $ev) },
            attrs: { disabled: this.currentPage >= this.pages }
        },
            [h('i', { 'class': 'ico ico-chevron-right' })]
        ));

        children.push(h('span', { class: 'a2-pager-divider' }));
        children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
        return h('div', contProps, children);
    }
});


/*20170913-7046*/
/*components/popover.js*/

Vue.component('popover', {
	template: `
<div v-dropdown class="popover-wrapper">
	<span toggle class="popover-title"><i v-if="hasIcon" :class="iconClass"></i> <span :title="title" v-text="content"></span></span>
	<div class="popup-body">
		<div class="arrow" />
		<div v-if="visible">
			<include :src="popoverUrl"/>
		</div>
		<slot />
	</div>	
</div>
`,
	/*
	1. Если добавить tabindex="-1" для toggle, то можно сделать закрытие по blur
	2. можно добавить кнопку закрытия. Любой элемент с атрибутом close-dropdown
	<span class="close" close-dropdown style="float:right">x</span >
	*/

	data() {
		return {
			state: 'hidden',
			popoverUrl: ''
		};
	},
	props: {
		icon: String,
		url: String,
		content: String,
		title:String
	},
    computed: {
        hasIcon() {
            return !!this.icon;
        },
        iconClass() {
            let cls = "ico po-ico";
            if (this.icon)
                cls += ' ico-' + this.icon;
            return cls;
		},
		visible() {
			return this.url && this.state === 'shown';
		}
	},
	mounted() {
		this.$el._show = () => {
			this.state = 'shown';
			if (this.url)
				this.popoverUrl = '/_popup' + this.url;
		};
		this.$el._hide = () => {
			this.state = 'hidden';
			this.popoverUrl = '';
		};
		//this.state = 'shown';
	}
});

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171116-7069
// components/treeview.js

(function () {

    const utils = require('std:utils');

    /*TODO:
        4. select first item
    */
    const treeItemComponent = {
        name: 'tree-item',
        template: `
<li @click.stop.prevent="doClick(item)" :title="title"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
    <div :class="{overlay:true, 'no-icons': !options.hasIcon}">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-else class="toggle"/>
        <i v-if="options.hasIcon" :class="iconClass"/>
        <a v-if="hasLink(item)" :href="dataHref" v-text="item[options.label]" :class="{'no-wrap':!options.wrapLabel }"/>
        <span v-else v-text="item[options.label]" :class="{'tv-folder':true, 'no-wrap':!options.wrapLabel}"/>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[options.subitems]" :options="options"
            :key="index" :item="itm" :click="click" :get-href="getHref" :is-active="isActive" :expand="expand" :root-items="rootItems"/>
    </ul>   
</li>
`,
        props: {
            item: Object,
            options: Object,
            rootItems: Array,
            /* callbacks */
            click: Function,
            expand: Function,
            isActive: Function,
            getHref: Function
        },
        data() {
            return {
                open: !this.options.isDynamic
            };
        },
        methods: {
            isFolderSelect(item) {
                let fs = this.options.folderSelect;
                if (utils.isFunction(fs))
                    return fs(item);
                return !!this.options.folderSelect;
            },
            doClick(item) {
                if (this.isFolder && !this.isFolderSelect(item))
                    this.toggle();
                else {
                    if (this.options.isDynamic) {
                        item.$select(this.rootItems);
                    } else {
                        this.click(item);
                    }
                }
            },
            hasLink(item) {
                return !this.isFolder || this.isFolderSelect(item);
            },
            toggle() {
                if (!this.isFolder)
                    return;
                if (this.options.isDynamic) {
                    this.open = !this.open;
                    this.expand(this.item, this.options.subitems);
                } else {
                    this.open = !this.open;
                }
            }
        },
        computed: {
            isFolder: function () {
                if (this.options.isDynamic && this.item.$hasChildren)
                    return true;
                let ch = this.item[this.options.subitems];
                return ch && ch.length;
            },
            isExpanded: function () {
                return this.isFolder && this.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.open;
			},
			title() {
				var t = this.item[this.options.title];
				if (!t)
					t = this.item[this.options.label];
				return t;
			},
            isItemSelected: function () {
                if (this.options.isDynamic)
                    return this.item.$isSelected(this.rootItems);
                if (!this.isActive)
                    return false;
                return this.isActive && this.isActive(this.item);
            },
            iconClass: function () {
                let icons = this.options.staticIcons;
                if (icons)
                    return "ico ico-" + (this.isFolder ? icons[0] : icons[1]);
                if (this.options.icon) {
                    let icon = this.item[this.options.icon];
                    return icon ? "ico ico-" + (icon || 'empty') : '';
                }
                return undefined;
            },
			dataHref() {
                return this.getHref ? this.getHref(this.item) : '';
            }
        },
        updated(x) {
            // close expanded when reloaded
            if (this.options.isDynamic && this.open) {
                if (this.item.$hasChildren) {
                    let arr = this.item[this.options.subitems];
                    if (!arr.$loaded)
                        this.open = false;
                }
            }
        }
    };

    /*
    options: {
        // property names
        title: String,
        icon: String,
        label: String,
        subitems: String,
        // options
        staticIcons: [String, String], //[Folder, Item]
        folderSelect: Boolean || Function,
        wrapLabel: Boolean,
        hasIcon: Boolean,
        isDynamic: Boolean        
    }
    */

    Vue.component('tree-view', {
        components: {
            'tree-item': treeItemComponent
        },
        template: `
<ul class="tree-view">
    <tree-item v-for="(itm, index) in items" :options="options" :get-href="getHref"
        :item="itm" :key="index"
        :click="click" :is-active="isActive" :expand="expand" :root-items="items">
    </tree-item>
</ul>
        `,
        props: {
            options: Object,
            items: Array,
            isActive: Function,
            click: Function,
            expand: Function,
			autoSelect: String,
			getHref: Function
        },
        computed: {
            isSelectFirstItem() {
                return this.autoSelect === 'first-item';
            }
        },
        methods: {
            selectFirstItem() {
                if (!this.isSelectFirstItem)
                    return;
                let itms = this.items;
                if (!itms.length)
                    return;
                let fe = itms[0];
                if (fe.$select)
                    fe.$select(this.items);
            }
        },
        created() {
            this.selectFirstItem();
        },
        updated() {
            if (this.options.isDynamic && this.isSelectFirstItem && !this.items.$selected) {
                // after reload
                this.selectFirstItem();
            }
        }
    });
})();

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171117-7069
// components/collectionview.js

/*
TODO:
11. GroupBy
*/

(function () {


	const log = require('std:log');

	Vue.component('collection-view', {
		store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			pageSize: Number,
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
		watch: {
			dir() {
				// можно отслеживать вычисляемые свойства
				//alert('dir changed');
			},
			filter: {
				handler() {
					if (this.isServer)
						this.filterChanged();
				},
				deep:true
			}
		},
		computed: {
			isServer() {
				return this.runAt === 'serverurl' || this.runAt === 'server';
			},
			isQueryUrl() {
				// use window hash
				return this.runAt === 'serverurl';
			},
			dir() {
				if (this.isQueryUrl)
					return this.$store.getters.query.dir;
				return this.localQuery.dir;
			},
			offset() {
				if (this.isQueryUrl)
					return this.$store.getters.query.offset || 0;
				return this.localQuery.offset;
			},
			order() {
				if (this.isQueryUrl)
					return this.$store.getters.query.order;
				return this.localQuery.order;
			},
			pagedSource() {
				if (this.isServer)
                    return this.ItemsSource;
                if (!this.ItemsSource)
                    return null;
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
                if (arr.indexOf(arr.$origin.$selected) == -1) {
                    // not found in target array
                    arr.$origin.$clearSelected();
                }
				log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
				if (this.isServer)
                    return this.ItemsSource.$RowCount;
				return this.ItemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages() {
				let cnt = this.filteredCount;
				if (this.isServer)
					cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
            $setOffset(offset) {
                if (this.runAt === 'server') {
                    this.localQuery.offset = offset;
                    // for this BaseController only
                    if (!this.localQuery.order) this.localQuery.dir = undefined;
                    this.$root.$emit('localQueryChange', this.$store.makeQueryString(this.localQuery));
                } else if (this.runAt === 'serverurl') {
                    this.$store.commit('setquery', { offset: offset });
                } else {
                    this.localQuery.offset = offset;
                }
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
                if (this.runAt === 'server') {
                    this.copyQueryToLocal(nq);
					// for this BaseController only
					this.$root.$emit('localQueryChange', this.$store.makeQueryString(nq));
				}
				else if (this.runAt === 'serverurl') {
					this.$store.commit('setquery', nq);
				} else {
					// local
					this.localQuery.dir = nq.dir;
					this.localQuery.order = nq.order;
				}
            },
            makeNewQuery() {
                let nq = { dir: this.dir, order: this.order, offset: this.offset };
                for (let x in this.filter) {
                    let fVal = this.filter[x];
                    if (fVal)
                        nq[x] = fVal;
                    else {
                        nq[x] = undefined;
                    }
                }
                return nq;
            },
            copyQueryToLocal(q) {
                for (let x in q) {
                    let fVal = q[x];
                    if (x === 'offset')
                        this.localQuery[x] = q[x];
                    else
                        this.localQuery[x] = fVal ? fVal : undefined;
                }
            },
			filterChanged() {
                // for server only
                let nq = this.makeNewQuery();
                nq.offset = 0;
                if (!nq.order) nq.dir = undefined;
				if (this.runAt === 'server') {
                    // for this BaseController only
                    this.copyQueryToLocal(nq);
                    // console.dir(this.localQuery);
					this.$root.$emit('localQueryChange', this.$store.makeQueryString(nq));
				}
				else if (this.runAt === 'serverurl') {
					this.$store.commit('setquery', nq);
				}
			}
		},
		created() {
			if (this.initialSort) {
				this.localQuery.order = this.initialSort.order;
				this.localQuery.dir = this.initialSort.dir;
			}
			if (this.isQueryUrl) {
				// get filter values from query
				let q = this.$store.getters.query;
				for (let x in this.filter) {
					if (x in q) this.filter[x] = q[x];
				}
			}
			this.$on('sort', this.doSort);
		}
	});

})();
/*20170923-7038*/
/* services/upload.js */


(function() {

    var url = require('std:url');
    var http = require('std:http');

    Vue.component("a2-upload", {
        /* TODO:
         1. Accept for images/upload - may be accept property ???
         4. ControllerName (_image ???)
        */
        template: `
            <label :class="cssClass" @dragover="dragOver" @dragleave="dragLeave">
                <input type="file" @change="uploadImage" v-bind:multiple="isMultiple" accept="image/*" />
            </label>
        `,
        props: {
            item: Object,
            prop: String,
            base: String,
            newItem: Boolean
        },
        data: function () {
            return {
                hover: false
            };
        },
        computed: {
            cssClass() {
                return 'file-upload' + (this.hover ? ' hover' : '');
            },
            isMultiple() {
                return !!this.newItem;
            }
        },
        methods: {
            dragOver(ev) {
                this.hover = true;
                ev.preventDefault();
            },
            dragLeave(ev) {
                this.hover = false;
                ev.preventDefault();
            },
            uploadImage(ev) {
                let root = window.$rootUrl;
                let id = this.item[this.prop];
                let imgUrl = url.combine(root, '_image', this.base, this.prop, id);
                var fd = new FormData();
                for (let file of ev.target.files) {
                    fd.append('file', file, file.name);
                }
                http.upload(imgUrl, fd).then((result) => {                    
                    // result = {status: '', ids:[]}
                    ev.target.value = ''; // clear current selection
                    if (result.status === 'OK') {
                        // TODO: // multiple
                        if (this.newItem) {
                            let p0 = this.item.$parent;
                            for (let id of result.ids) {
                                let ni = p0.$append();
                                ni[this.prop] = id;
                            }
                        } else {
                            this.item[this.prop] = result.ids[0];
                        }
                    }
                });
            }
        }
    });

})();

/* 20170906-7027 */
/*components/tab.js*/

/*
TODO:

2. isActive with location hash
5. enable/disable tabs
7. много табов - добавить стрелки ?
10. default header for dynamic tab
*/

(function () {

    /*
    <ul class="tab-header">
        <li v-for="(itm, index) in tabs" :key="index">
            <span v-text="itm.header"></span>
        </li>
    </ul >
    */

    const tabPanelTemplate = `
<div class="tab-panel">
    <template v-if="static">
        <ul class="tab-header">
            <li :class="tab.tabCssClass" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click.prevent="select(tab)">
                <i v-if="tab.hasIcon" :class="tab.iconCss" ></i>
                <span v-text="tab.header"></span><span class="badge" v-if="tab.hasBadge" v-text="tab.badge"></span>				
            </li>
        </ul>
        <slot name="title" />
        <div class="tab-content" :class="contentCssClass">
            <slot />
        </div>
    </template>
    <template v-else>
        <ul class="tab-header">
            <li :class="{active: isActiveTab(item)}" v-for="(item, tabIndex) in items" :key="tabIndex" @click.prevent="select(item)">
				<slot name="header" :item="item" :index="tabIndex" :number="tabIndex + 1">
					<span v-text="defaultTabHeader(item, tabIndex)"></span> 
				</slot>
            </li>
        </ul>
		<slot name="title" />
        <div class="tab-content">
            <div class="tab-item" v-if="isActiveTab(item)" v-for="(item, tabIndex) in items" :key="tabIndex">
                <slot name="items" :item="item" :index="tabIndex" />
            </div>
        </div>
    </template>
</div>
`;

    const tabItemTemplate = `
<div class="tab-item" v-if="isActive">
    <slot />
</div>
`;


    Vue.component('a2-tab-item', {
        name:'a2-tab-item',
        template: tabItemTemplate,
        props: {
			header: String,
			badge: [String, Number, Object],
			icon: String,
			tabStyle: String
        },
        computed: {
            hasIcon() {
                return !!this.icon;
			},
			hasBadge() {
				return !!this.badge;
			},
            iconCss() {
                return this.icon ? ("ico ico-" + this.icon) : '';
            },
            isActive() {
                return this === this.$parent.activeTab;
			},
			tabCssClass() {
				return (this.isActive ? 'active ' : '') + (this.tabStyle || '');
			}
        },
        created() {
			this.$parent.$addTab(this);
        }
    });


    Vue.component('a2-tab-panel', {
        template: tabPanelTemplate,
        props: {
            items: Array,
            header: String
        },
        data() {
            return {
                tabs: [],
				activeTab: null
            };
        },
        computed: {
            static() {
                return !this.items;
			},
			contentCssClass() {
				return this.activeTab ? this.activeTab.tabStyle : '';
			}
		},
		watch: {
			items(newVal, oldVal) {
				let tabs = this.items;
				if (newVal.length < oldVal.length) {
					// tab has been removed
					if (this._index >= tabs.length)
						this._index = tabs.length - 1;
					this.select(tabs[this._index]);
				} else if (newVal.length === oldVal.length) {
					// may be reloaded
					if (tabs.length > 0) this.select(tabs[0]);
				} else {
					// tab has been added
					this.select(tabs[tabs.length - 1]);
				}
			}
		},
        methods: {
            select(item) {
				this.activeTab = item;
				if (this.items)
					this._index = this.items.indexOf(item);
            },
			isActiveTab(item) {
                return item === this.activeTab;
            },
            defaultTabHeader(item, index) {
                return 'Tab ' + (index + 1);
            },
            $addTab(tab) {
                this.tabs.push(tab);
            }
        },
		mounted() {
            if (this.tabs.length > 0)
                this.activeTab = this.tabs[0]; // no tab, reactive item
            else if (this.items && this.items.length)
                this.activeTab = this.items[0];
			this._index = 0;
        }
    });

})();
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171118-7070
// components/list.js

(function() {

    const utils = require('std:utils');

    Vue.component("a2-list", {
        template:
`<ul class="a2-list" v-lazy="itemsSource">
    <template v-if="itemsSource">
	    <li class="a2-list-item" tabindex="1" :class="cssClass(listItem)" v-for="(listItem, listItemIndex) in itemsSource" :key="listItemIndex" @click.prevent="select(listItem)" @keydown="keyDown">
            <slot name="items" :item="listItem" />
	    </li>
    </template>
    <template v-else>
        <slot />
    </template>
</ul>
`,
        props: {
            itemsSource: Array,
            autoSelect: String,
            mark: String
        },
        computed: {
            isSelectFirstItem() {
                return this.autoSelect === 'first-item';
            },
            selectedSource() {
                let src = this.itemsSource;
                if (!src) return null;
                if (src.$origin)
                    src = src.$origin;
                return src.$selected;
            }
        },
        methods: {
            cssClass(item) {
                let cls = item === this.selectedSource ? 'active' : '';
                if (this.mark) {
                    let clsmrk = utils.eval(item, this.mark);
                    if (clsmrk) cls += ' ' + clsmrk;
                }
                return cls;
            },
            select(item) {
                if (item.$select)
                    item.$select();
            },
            selectStatic() {
                alert('yet not implemented');
                console.dir(this);
            },
            selectFirstItem() {
                if (!this.isSelectFirstItem)
                    return;
                // from source (not $origin!)
                let src = this.itemsSource;
                if (!src.length)
                    return;
                let fe = src[0];
                this.select(fe);
            },
            keyDown(e) {
                const next = (delta) => {
                    let index;
                    index = this.itemsSource.indexOf(this.selectedSource);
                    if (index == -1)
                        return;
                    index += delta;
                    if (index == -1)
                        return;
                    if (index < this.itemsSource.length)
                        this.select(this.itemsSource[index]);
                };
                switch (e.which) {
                    case 38: // up
                        next(-1);
                        break;
                    case 40: // down
                        next(1);
                        break;
                    case 36: // home
                        //this.selected = this.itemsSource[0];
                        break;
                    case 35: // end
                        //this.selected = this.itemsSource[this.itemsSource.length - 1];
                        break;
                    case 33: // pgUp
                        break;
                    case 34: // pgDn
                        break;
                    default:
                        return;
                }
                e.preventDefault();
                e.stopPropagation();
            }
        },
        created() {
            this.selectFirstItem();
        },
        updated() {
            if (!this.selectedSource && this.isSelectFirstItem) {
                this.selectFirstItem();
            }
        }
    });
})();

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171118-7070
// components/modal.js


(function () {

    const eventBus = require('std:eventBus');

/**
TODO:
    4. Large, Small
    5. Set width v-modal-width=""
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-body" :src="dialog.url"></include>
    <div v-else class="modal-body">
        <div class="modal-header"><span v-text="title"></span><button class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
        <div :class="bodyClass">
            <i v-if="hasIcon" :class="iconClass" />
            <div v-text="dialog.message" />
        </div>
        <div class="modal-footer">
            <button class="btn btn-default" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"></button>
        </div>
    </div>
</div>        
`;

	const setWidthComponent = {
		inserted(el, binding) {
			// TODO: width or cssClass???
			//alert('set width-created:' + binding.value);
			// alert(binding.value.cssClass);
			let mw = el.closest('.modal-window');
			if (mw) {
                if (binding.value.width)
				    mw.style.width = binding.value.width;
                if (binding.value.cssClass)
                    mw.classList.add(binding.value.cssClass);
            }
			//alert(el.closest('.modal-window'));
		}
	};

	Vue.directive('modal-width', setWidthComponent);

    const modalComponent = {
		template: modalTemplate,
        props: {
            dialog: Object
        },
        data() {
            // always need a new instance of function (modal stack)
            return {
                keyUpHandler: function () {
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
            }
        },
        computed: {
            isInclude: function () {
                return !!this.dialog.url;
            },
            hasIcon() {
                return !!this.dialog.style;
            },
            title: function () {
                // todo
                let defTitle = this.dialog.style === 'confirm' ? "Підтверження" : "Помилка";
                return this.dialog.title || defTitle;
            }, 
            bodyClass() {
                return 'modal-body ' + (this.dialog.style || '');
            },
            iconClass() {
                return "ico ico-" + this.dialog.style;
            },
            buttons: function () {
                //console.warn(this.dialog.style);
                let okText = this.dialog.okText || 'OK';
                let cancelText = this.dialog.cancelText || 'Cancel';
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                else if (this.dialog.style === 'alert')
                    return [{ text: okText, result: false }];
                return [
                    { text: okText, result: true },
                    { text: cancelText, result: false }
                ];
            }
        },
        created() {
            document.addEventListener('keyup', this.keyUpHandler);
        },
        destroyed() {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
    };

    app.components['std:modal'] = modalComponent;
})();
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171118-7070
// components/image.js

(function () {

    /**
     TODO:
    2. if/else - image/upload
    3. Photo, Base for list
    4. multiple for list
    5. css
     */

    var url = require('std:url');

    Vue.component('a2-image', {
        template: `
<div>
    <span v-text="href"></span>
    <span>{{newElem}}</span>
    <img v-if="isImageVisible" :src="href" style="width:auto;height:auto;max-width:300px" @click.prevent="clickOnImage"/>
    <a @click.prevent="removeImage">x</a>
    <a2-upload v-if="isUploadVisible" :item="itemForUpload" :base="base" :prop="prop" :new-item="newItem"/>
</div>
`,
        props: {
            base: String,
            item: Object,
            prop: String,
            newItem: Boolean,
            inArray: Boolean,
            source: Array
        },
        data() {
            return {
                newElem: {}
            };
        },
        computed: {
            href: function () {
                if (this.newItem)
                    return undefined;
                let root = window.$rootUrl;
                let id = this.item[this.prop];
                return url.combine(root, '_image', this.base, this.prop, id);
            },
            isImageVisible() {
                return !this.newItem;
            },
            isUploadVisible: function () {
                if (this.newItem)
                    return true;
                return !this.inArray && !this.item[this.prop];
            },
            itemForUpload() {
                return this.newItem ? this.newElem : this.item;
            }
        },
        methods: {
            removeImage: function () {
                if (this.inArray)
                    this.item.$remove();
                else
                    this.item[this.prop] = undefined;
            },
            clickOnImage: function () {
                alert('click on image');
            }
        },
        created() {
            if (this.newItem && this.source && this.source.$new) {
                this.newElem = this.source.$new();
            }
        }
    });

})();
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171116-7069
// components/taskpad.js

Vue.component("a2-taskpad", {
	template:
`<div :class="cssClass">
	<a class="ico taskpad-collapse-handle" @click.stop="toggle"></a>
	<div v-if="expanded" class="taskpad-body">
		<slot>
		</slot>
	</div>
	<div v-else class="taskpad-title" @click.prevent="toggle">
		<span class="taskpad-label">Задачи</span>
	</div>
</div>
`,
	data() {
        return {
            expanded: true,
            __savedCols: ''
        };
	},
	computed: {
		cssClass() {
			let cls = "taskpad";
			if (this.expanded) cls += ' expanded'; else cls += ' collapsed';
			return cls;
		}
	},
	methods: {
		toggle() {
			// HACK
			let topStyle = this.$el.parentElement.style;
			this.expanded = !this.expanded;
			if (this.expanded)
				topStyle.gridTemplateColumns = this.__savedCols;
			else
				topStyle.gridTemplateColumns = "1fr 20px";
		}
	},
	mounted() {
		let topStyle = this.$el.parentElement.style;
		this.__savedCols = topStyle.gridTemplateColumns;
	}
});


// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171031-7064
// components/panel.js

Vue.component('a2-panel', {
    template:
`<div :class="cssClass">
    <div class="panel-header" @click.prevent="toggle" v-if="!noHeader">
        <slot name='header'></slot>
	    <span v-if="collapsible" class="ico panel-collapse-handle"></span>
    </div>
    <slot v-if="expanded"></slot>
</div>
`,
    props: {
        initialCollapsed: Boolean,
        collapsible: Boolean,
        panelStyle: String,
        noHeader: Boolean
    },
    data() {
        return {
            collapsed: this.initialCollapsed
        };
    },
    computed: {
        cssClass() {
            let cls = "panel";
            if (this.collapsed) cls += ' collapsed'; else cls += ' expanded';
            if (this.panelStyle) {
                switch (this.panelStyle.toLowerCase()) {
                    case "red":
                    case "danger":
                    case "error":
                        cls += ' panel-red';
                        break;
                    case "info":
                    case "cyan":
                        cls += ' panel-cyan';
                        break;
                    case "green":
                    case "success":
                        cls += ' panel-green';
                        break;
                    case "warning":
                    case "yellow":
                        cls += ' panel-yellow';
                        break;
                }
            }
            return cls;
        },
        expanded() {
            return !this.collapsed;
        }
    },
    methods: {
        toggle() {
            if (!this.collapsible)
                return;
            this.collapsed = !this.collapsed;
        }
    }
});
/*20171031-7063*/
/*components/debug.js*/

(function () {

    /**
     * TODO
    1. Trace window
    2. Dock right/left
    6.
     */

    const specKeys = {
        '$vm': null,
        '$host': null,
        '$root': null,
        '$parent': null
    };

    function isSpecialKey(key) {
    }

    function toJsonDebug(data) {
        return JSON.stringify(data, function (key, value) {
            if (key[0] === '$')
                return !(key in specKeys) ? value : undefined;
            else if (key[0] === '_')
                return undefined;
            return value;
        }, 2);
    }

    Vue.component('a2-debug', {
        template: `
<div class="debug-panel" v-if="paneVisible">
    <div class="debug-pane-header">
        <span class="debug-pane-title" v-text="title"></span>
        <a class="btn btn-close" @click.prevent="close">&#x2715</a>
    </div>
    <div class="toolbar">
        <button class="btn btn-tb" @click.prevent="refresh"><i class="ico ico-reload"></i> Обновить</button>
    </div>
    <div class="debug-model debug-body" v-if="modelVisible">
        <pre class="a2-code" v-text="modelJson()"></pre>
    </div>
    <div class="debug-trace debug-body" v-if="traceVisible">
        pane for tracing
    </div>
</div>
`,
        props: {
            modelVisible: Boolean,
            traceVisible: Boolean,
            modelStack: Array,
            counter: Number,
            close: Function
        },
        computed: {
            refreshCount() {
                return this.counter;
            },
            paneVisible() {
                return this.modelVisible || this.traceVisible;
            },
            title() {
                return this.modelVisible ? 'Модель данных'
                    : this.traceVisible ? 'Трассировка'
                    : '';
            }
        },
        methods: {
            modelJson() {
                // method. not cached
                if (!this.modelVisible)
                    return;
                if (this.modelStack.length) {
                    return toJsonDebug(this.modelStack[0].$data);
                }
                return '';
            },
            refresh() {
                if (!this.modelVisible)
                    return;
                this.$forceUpdate();
            }
        },
        watch: {
            refreshCount() {
                this.refresh();
            }
        }
    });
})();

/*20171029-7060*/
/* directives/dropdown.js */


Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		const popup = require('std:popup');
		let me = this;

		el._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');
		// el.focus(); // ???
		if (!el._btn) {
			console.error('DropDown does not have a toggle element');
		}

		popup.registerPopup(el);

		el._close = function (ev) {
			if (el._hide)
				el._hide();
            el.classList.remove('show');
		};

		el.addEventListener('click', function (event) {
			let trg = event.target;
			while (trg) {
				if (trg === el._btn) break;
				if (trg === el) return;
				trg = trg.parentElement;
			}
			if (trg === el._btn) {
				event.preventDefault();
                event.stopPropagation();
				let isVisible = el.classList.contains('show');
				if (isVisible) {
					if (el._hide)
						el._hide();
                    el.classList.remove('show');
                } else {
                    // not nested popup
                    let outer = popup.closest(el, '.popup-body');
                    if (outer) {
                        popup.closeInside(outer);
                    } else {
                        popup.closeAll();
                    }
					if (el._show)
						el._show();
                    el.classList.add('show');
				}
			}
		});
	},
	unbind(el) {
		const popup = require('std:popup');
		popup.unregisterPopup(el);
	}
});


/*20171029-7060*/
/* directives/focus.js */

Vue.directive('focus', {
	bind(el, binding, vnode) {

		el.addEventListener("focus", function (event) {
			event.target.parentElement.classList.add('focus');
		}, false);

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = false;
			event.target.parentElement.classList.remove('focus');
		}, false);

		el.addEventListener("click", function (event) {
			let t = event.target;
			if (t._selectDone)
				return;
			t._selectDone = true;
			if (t.select) t.select();
        }, false);
    },
    inserted(el) {
        if (el.tabIndex === 1) {
            setTimeout(() => {
                if (el.focus) el.focus();
                if (el.select) el.select();
            }, 0);
        }
    }
});


/*20171117-7069*/
/* directives/lazy.js */

Vue.directive('lazy', {
    componentUpdated(el, binding, vnode) {
        let arr = binding.value;
        if (arr && arr.$loadLazy)
            arr.$loadLazy();
    }
});


/*20170912-7031*/
/* directives/resize.js */

Vue.directive('resize', {
	bind(el, binding, vnode) {

		Vue.nextTick(function () {
			const minWidth = 20;
			function findHandle(el) {
				for (ch of el.childNodes) {
					if (ch.nodeType === Node.ELEMENT_NODE) {
						if (ch.classList.contains('drag-handle'))
							return ch;
					}
				}
				return null;
			}

			let grid = el.parentElement;

			let parts = {
				grid: grid,
				handle: findHandle(grid),
				resizing: false,
				offsetX(event) {
					let rc = this.grid.getBoundingClientRect();
					return event.clientX - rc.left;
				}
			};

			if (!parts.handle) {
				console.error('Resize handle not found');
				return;
			}

			el._parts = parts;

			grid.addEventListener('mouseup', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				p.resizing = false;
				event.preventDefault();
				p.handle.style.display = 'none';
				p.grid.style.cursor = 'default';
				let x = p.offsetX(event);
				if (x < minWidth) x = minWidth;
				p.grid.style.gridTemplateColumns = x + 'px 6px 1fr';
			}, false);

			grid.addEventListener('mousemove', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				event.preventDefault();
				let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
			}, false);

			el.addEventListener('mousedown', function (event) {
				let p = el._parts;
				if (p.resizing)
					return;
				event.preventDefault();
				p.resizing = true;
				let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
			}, false);
		});
		/*
		Vue.nextTick(function () {

			const minWidth = 20;

			function findHandle(el) {
				for (ch of el.childNodes) {
					if (ch.nodeType === Node.ELEMENT_NODE) {
						if (ch.classList.contains('drag-handle'))
							return ch;
					}
				}
				return null;
			}

			let grid = el.parentElement;

			let parts = {
				grid: grid,
				handle: findHandle(grid),
				resizing: false
			};

			if (!parts.handle) {
				console.error('Resize handle not found');
				return;
			}

			el._parts = parts;

			el._parts.grid.addEventListener('mouseup', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				p.resizing = false;
				event.preventDefault();
				p.handle.style.display = 'none';
				p.grid.style.cursor = 'default';
				let rc = p.getBoundingClientRect();
				let x = event.clientX - rc.left;
				if (x < minWidth) x = minWidth;
				p.grid.style.gridTemplateColumns = x + 'px 6px 1fr';
			}, false);

			el._parts.grid.addEventListener('mousemove', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				let rc = p.grid.getBoundingClientRect();
				event.preventDefault();
				let x = event.clientX - rc.left;
				p.handle.style.left = x + 'px';
			}, false);

			el.addEventListener('mousedown', function (event) {
				let p = el._parts;
				if (p.resizing)
					return;
				event.preventDefault();
				p.resizing = true;
				let rc = p.grid.getBoundingClientRect();
				let x = event.offsetX + event.target.offsetLeft;
				let x = event.clientX - rc.left;
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
			}, false);
		});

		*/
	}
});


// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171203-7075
// controllers/base.js

(function () {

    const eventBus = require('std:eventBus');
    const utils = require('std:utils');
    const dataservice = require('std:dataservice');
	const store = component('std:store');
	const urltools = require('std:url');
	const log = require('std:log');

    let __updateStartTime = 0;
    let __createStartTime = 0;

    function __runDialog(url, arg, query, cb) {
        return new Promise(function (resolve, reject) {
            const dlgData = { promise: null, data: arg, query: query };
            eventBus.$emit('modal', url, dlgData);
            dlgData.promise.then(function (result) {
                cb(result);
                resolve(result);
            });
        });
    }

	const documentTitle = {
		render() {
			return null;
		},
		props: ['page-title'],
		watch: {
			pageTitle(newValue) {
				if (this.pageTitle)
					document.title = this.pageTitle;
			}
		},
		created() {
			if (this.pageTitle)
				document.title = this.pageTitle;
		}
	};

	const base = Vue.extend({
		// inDialog: Boolean (in derived class)
		// pageTitle: String (in derived class)
		store: store,
		components: {
			'a2-document-title': documentTitle
		},
		data() {
			return {
				__init__: true,
				__baseUrl__: '',
				__requestsCount__: 0
			};
		},

		computed: {
			$baseUrl() {
				return this.$data.__baseUrl__;
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
            }
		},
        methods: {
            $exec(cmd, arg, confirm, opts) {
                if (this.$isReadOnly(opts)) return;

                const doExec = () => {
                    let root = this.$data;
                    if (!confirm)
                        root._exec_(cmd, arg);
                    else
                        this.$confirm(confirm).then(() => root._exec_(cmd, arg));
                }

                if (opts && opts.saveRequired && this.$isDirty) {
                    this.$save().then(() => doExec());
                } else {
                    doExec();
                }
            },

            $isReadOnly(opts) {
                return opts && opts.checkReadOnly && this.$data.$readOnly;
            },

			$execSelected(cmd, arg, confirm) {
				let root = this.$data;
				if (!utils.isArray(arg)) {
					console.error('Invalid argument for $execSelected');
					return;
				}
				if (!confirm)
					root._exec_(cmd, arg.$selected);
				else
					this.$confirm(confirm).then(() => root._exec_(cmd, arg.$selected));
            },
            $canExecute(cmd, arg, opts) {
                if (this.$isReadOnly(opts))
                    return false;
                let root = this.$data;
                return root._canExec_(cmd, arg);
            },
			$save() {
                if (this.$data.$isReadOnly)
                    return;
                let self = this;
                let root = window.$$rootUrl;
                let url = root + '/_data/save';
                let urlToSave = this.$indirectUrl || this.$baseUrl;
                return new Promise(function (resolve, reject) {
                    let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
                    let wasNew = self.$baseUrl.endsWith('/new');
					dataservice.post(url, jsonData).then(function (data) {
						self.$data.$merge(data);
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
                            // assign the new id to the route
                            self.$store.commit('setnewid', { id: newId });
                            // and in the __baseUrl__
                            self.$data.__baseUrl__ = self.$data.__baseUrl__.replace('/new', '/' + newId);
                        }
						resolve(dataToResolve); // single element (raw data)
					}).catch(function (msg) {
						self.$alertUi(msg);
					});
				});
			},

			$invoke(cmd, data, base) {
				let self = this;
                let root = window.$$rootUrl;
                let url = root + '/_data/invoke';
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
						self.$alertUi(msg);
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
                    })
                });
            },

			$reload() {
                let self = this;
                let root = window.$$rootUrl;
				let url = root + '/_data/reload';
				let dat = self.$data;
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ baseUrl: self.$baseUrl });
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat.$setDirty(false);
						} else {
							throw new Error('Invalid response type for $reload');
						}
					}).catch(function (msg) {
						self.$alertUi(msg);
					});
				});
			},

			$requery() {
				if (this.inDialog)
					alert('$requery command is not supported in dialogs');
				else
					eventBus.$emit('requery');
			},

            $remove(item, confirm) {
                if (this.$data.$isReadOnly)
                    return;
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},

			$removeSelected(arr, confirm) {
				if (!utils.isArray(arr)) {
					console.error('$removeSelected. The argument is not an array');
				}
				let item = arr.$selected;
				if (!item)
					return;
                if (this.$data.$isReadOnly)
                    return;
				this.$remove(item, confirm);
			},

            $navigate(url, data) {
				let dataToNavigate = data || 'new';
                if (utils.isObjectExact(dataToNavigate))
					dataToNavigate = dataToNavigate.$id;
				let urlToNavigate = urltools.combine(url, dataToNavigate);
				this.$store.commit('navigate', { url: urlToNavigate });
            },

            $replaceId(newId) {
                this.$store.commit('setnewid', { id: newId });
                // and in the __baseUrl__
                urlTools.replace()
                this.$data.__baseUrl__ = self.$data.__baseUrl__.replace('/new', '/' + newId);
            },

            $dbRemove(elem, confirm) {
                if (!elem)
                    return;
                let id = elem.$id;
                let root = window.$$rootUrl;
                const self = this;
                function dbRemove() {
                    let postUrl = root + '/_data/dbRemove';
                    let jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: id });
                    dataservice.post(postUrl, jsonData).then(function (data) {
                        elem.$remove(); // without confirm
                    }).catch(function (msg) {
                        self.$alertUi(msg);
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

            $dbRemoveSelected(arr, confirm) {
                let sel = arr.$selected;
                if (!sel)
                    return;
                this.$dbRemove(sel, confirm)
            },

			$openSelected(url, arr) {
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
                if (url.startsWith('{')) { // decorated. defer evaluate
					url = url.substring(1, url.length - 1);
                    let nUrl = utils.eval(sel, url);
					if (!nUrl)
						throw new Error(`Property '${url}' not found in ${sel.constructor.name} object`);
					url = nUrl;
                }
				this.$navigate(url, sel.$id);
			},

			$hasSelected(arr) {
				return arr && !!arr.$selected;
			},

            $hasChecked(arr) {
                return arr && arr.$checked && arr.$checked.length;
            },

			$confirm(prms) {
				if (utils.isString(prms))
                    prms = { message: prms };
                prms.style = 'confirm';
                prms.message = prms.message || prms.msg; // message or msg
				let dlgData = { promise: null, data: prms };
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$alert(msg, title) {
				let dlgData = {
					promise: null, data: {
						message: msg, title: title, style: 'alert'
					}
				};
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$alertUi(msg) {
				if (msg instanceof Error) {
					alert(msg.message);
					return;
				}
				if (msg.indexOf('UI:') === 0)
					this.$alert(msg.substring(3));

				else
					alert(msg);
			},

            $showDialog(url, arg, query, opts) {
                return this.$dialog('show', url, arg, query, opts);
            },


            $dialog(command, url, arg, query, opts) {
                if (this.$isReadOnly(opts))
                    return;
                function argIsNotAnArray() {
                    if (!utils.isArray(arg)) {
                        console.error(`$dialog.${command}. The argument is not an array`);
                        return true;
                    }
                }
                function argIsNotAnObject() {
                    if (!utils.isObjectExact(arg)) {
                        console.error(`$dialog.${command}. The argument is not an object`);
                        return true;
                    }
                }
                function doDialog() {
                    // result always is raw data
                    switch (command) {
                        case 'append':
                            if (argIsNotAnArray()) return;
                            return __runDialog(url, 0, query, (result) => { arg.$append(result); });
                        case 'browse':
                            if (!utils.isObject(arg)) {
                                console.error(`$dialog.${command}. The argument is not an object`);
                                return;
                            }
                            return __runDialog(url, arg, query, (result) => { arg.$merge(result, true /*fire*/); });
                        case 'edit-selected':
                            if (argIsNotAnArray()) return;
                            return __runDialog(url, arg.$selected, query, (result) => { arg.$selected.$merge(result, false /*fire*/); });
                        case 'edit':
                            if (argIsNotAnObject()) return;
                            return __runDialog(url, arg, query, (result) => { arg.$merge(result, false /*fire*/); });
                        default: // simple show dialog
                            return __runDialog(url, arg, query, () => { });
                            break;
                    }
                }
                if (opts && opts.saveRequired && this.$isDirty) {
                    let dlgResult = null;
                    this.$save().then(() => { dlgResult = doDialog() });
                    return dlgResult;
                }
                return doDialog();
            },

            $report(rep, arg, opts) {
                if (this.$isReadOnly(opts)) return;
                doReport = () => {
                    let id = arg;
                    if (arg && utils.isObject(arg))
                        id = arg.$id;
                    const root = window.$$rootUrl;
                    let url = root + '/report/show/' + id;
                    let reportUrl = this.$indirectUrl || this.$baseUrl;
                    let baseUrl = urltools.makeBaseUrl(reportUrl);
                    url = url + urltools.makeQueryString({ base: baseUrl, rep: rep });
                    // open in new window
                    window.open(url, "_blank");
                };

                if (opts && opts.saveRequired && this.$isDirty) {
                    this.$save().then(() => doReport());
                    return;
                }
                doReport();
            },

			$modalSaveAndClose(result, opts) {
                if (this.$isDirty) {
                    const root = this.$data;
                    if (opts && opts.validRequired && root.$invalid) {
                        this.$alert('Спочатку виправте помилки');
                        return;
                    }
                    this.$save().then((result) => eventBus.$emit('modalClose', result));
                }
				else
					eventBus.$emit('modalClose', result);
			},

			$modalClose(result) {
				eventBus.$emit('modalClose', result);
			},

            $modalSelect(array) {
                if (!('$selected' in array)) {
                    console.error('invalid array for $modalSelect');
                    return;
                }
                this.$modalClose(array.$selected);
            },

            $modalSelectChecked(array) {
                if (!('$checked' in array)) {
                    console.error('invalid array for $modalSelectChecked');
                    return;
                }
                let chArray = array.$checked;
                if (chArray.length > 0)
                    this.$modalClose(chArray);
            },

			$saveAndClose() {
				if (this.$isDirty)
					this.$save().then(() => this.$close());
				else
					this.$close();
			},

			$close() {
				if (this.$saveModified())
					this.$store.commit("close");
			},

			$searchChange() {
				let newUrl = this.$store.replaceUrlSearch(this.$baseUrl);
				this.$data.__baseUrl__ = newUrl;
				this.$reload();
			},

			$saveModified() {
				if (!this.$isDirty)
					return true;
				let self = this;
				// TODO: localize!!!
				let dlg = {
					message: "Element was modified. Save changes?",
					title: "Confirm close",
					buttons: [
						{ text: "Сохранить", result: "save" },
						{ text: "Don't save", result: "close" },
						{ text: "Отмена", result: false }
					]
				};
				this.$confirm(dlg).then(function (result) {
					if (result === 'close') {
						// close without saving
						self.$data.$setDirty(false);
						self.$close();
					} else if (result === 'save') {
						// save then close
						self.$save().then(function () {
							self.$close();
						});
					}
				});
				return false;
			},

			$format(value, dataType, format) {
				if (!format && !dataType)
					return value;
				if (dataType)
					value = utils.format(value, dataType);
				if (format && format.indexOf('{0}') !== -1)
					return format.replace('{0}', value);
				return value;
            },

            $expand(elem, propName) {
                let arr = elem[propName];
                if (arr.$loaded)
                    return;

                let self = this,
                    root = window.$$rootUrl,
                    url = root + '/_data/expand',
                    jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id });

                dataservice.post(url, jsonData).then(function (data) {
                    for (let el of data[propName])
                        arr.push(arr.$new(el));
                }).catch(function (msg) {
                    self.$alertUi(msg);
                 });

                arr.$loaded = true;
			},

            $loadLazy(elem, propName) {
                let self = this,
                    root = window.$$rootUrl,
                    url = root + '/_data/loadlazy',
                    jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id, prop: propName });

                return new Promise(function (resolve, reject) {
                    let arr = elem[propName];
                    if (arr.$loaded) {
                        resolve(arr);
                        return;
                    }
                    dataservice.post(url, jsonData).then(function (data) {
                        if (propName in data) {
                            for (let el of data[propName])
                                arr.push(arr.$new(el));
                        }
                        resolve(arr);
                    }).catch(function (msg) {
                        self.$alertUi(msg);
                    });
                    arr.$loaded = true;
                });
            },

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
				// TODO: get delegate from template
                return function (item, filter) {
                    console.warn('filter:' + item.Id + " filter:" + filter.Filter);
                    return true;
                };
			},

			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__queryChange(search) {
                this.$data.__baseUrl__ = this.$store.replaceUrlSearch(this.$baseUrl, search);
				this.$reload();
            },
            __doInit__() {
                const root = this.$data;
                let caller = null;
                if (this.$caller)
                    caller = this.$caller.$data;
                root._modelLoad_(caller);
            }
		},
		created() {
            let out = { caller: null };
            eventBus.$emit('registerData', this, out);
            this.$caller = out.caller;
			/*
			TODO: а зачем это было ???
			if (!this.inDialog) {
				//alert(this.$data._query_);
				//this.$data._query_ = route.query;
			}
			*/

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);
			eventBus.$on('queryChange', this.__queryChange);

            this.$on('localQueryChange', this.__queryChange);
            this.__asyncCache__ = {};
            log.time('create time:', __createStartTime, false);
		},
		destroyed() {
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			this.$off('localQueryChange', this.__queryChange);
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
    
	app.components['baseController'] = base;
})();
/*20171031-7063*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const popup = require('std:popup');
	const urlTools = require('std:url');
    const log = require('std:log');
    const utils = require('std:utils');

	const UNKNOWN_TITLE = 'unknown title';

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
				if (found)
					return found;
			}
		}
		return null;
    }

	function makeMenuUrl(menu, url, opts) {
		opts = opts || {};
		url = urlTools.combine(url);
		let sUrl = url.split('/');
		if (sUrl.length === 5 || sUrl.length === 4)
            return url; // full qualified
		let routeLen = sUrl.length;
        let seg1 = sUrl[1];
        if (seg1 === 'app')
            return url; // app
		let am = null;
		if (seg1)
			am = menu.find((mi) => mi.Url === seg1);
        if (!am) {
            // no segments - find first active menu
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
		return url; // TODO: ????
	}

	const a2NavBar = {
		template: `
<ul class="nav-bar">
    <li v-for="(item, index) in menu" :key="index" :class="{active : isActive(item)}">
        <a :href="itemHref(item)" v-text="item.Name" @click.prevent="navigate(item)"></a>
    </li>
</ul>
`,
		props: {
			menu: Array
		},
		computed:
		{
			seg0: () => store.getters.seg0
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			itemHref: (item) => '/' + item.Url,
			navigate(item) {
				if (this.isActive(item))
                    return;
                let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
                let savedUrl = localStorage.getItem(storageKey) || '';
                if (savedUrl && !findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
                    // saved segment not found in current menu
                    savedUrl = '';
                }
				let opts = { title: null, seg2: savedUrl };
                let url = makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title:  opts.title});
			}
		}
	};


	const a2SideBar = {
        // TODO: 
        // 1. разные варианты меню
        // 2. folderSelect как функция 
		template: `
<div :class="cssClass">
    <a href role="button" class="ico collapse-handle" @click.prevent="toggle"></a>
    <div class="side-bar-body" v-if="bodyIsVisible">
        <tree-view :items="sideMenu" :is-active="isActive" :click="navigate" :get-href="itemHref"
            :options="{folderSelect: folderSelect, label: 'Name', title: 'Description',
                subitems: 'Menu',
                icon:'Icon', wrapLabel: true, hasIcon: true}">
        </tree-view>
    </div>
    <div v-else class="side-bar-title" @click.prevent="toggle">
        <span class="side-bar-label" v-text="title"></span>
    </div>
</div>
`,
		props: {
			menu: Array
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			cssClass() {
				return 'side-bar ' + (this.$parent.sideBarCollapsed ? 'collapsed' : 'expanded');
			},
			bodyIsVisible() {
				return !this.$parent.sideBarCollapsed;
			},
			title() {
				let sm = this.sideMenu;
				if (!sm)
					return UNKNOWN_TITLE;
				let seg1 = this.seg1;
				let am = findMenu(sm, (mi) => mi.Url === seg1);
				if (am)
					return am.Name || UNKNOWN_TITLE;
				return UNKNOWN_TITLE;
			},
			sideMenu() {
				let top = this.topMenu;
				return top ? top.Menu : null;
			},
			topMenu() {
				let seg0 = this.seg0;
				return findMenu(this.menu, (mi) => mi.Url === seg0);
			}
		},
		methods: {
			isActive(item) {
				return this.seg1 === item.Url;
            },
            folderSelect(item) {
                return !!item.Url;
            },
			navigate(item) {
				if (this.isActive(item))
					return;
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.Url, item.Url);
					if (item.Url.indexOf('/') === -1) {
                        // save only simple path
                        localStorage.setItem('menu:' + urlTools.combine(window.$$rootUrl, top.Url), item.Url);
					}
					this.$store.commit('navigate', { url: url, title: item.Name });
				}
				else
					console.error('no top menu found');
			},
			itemHref(item) {
				let top = this.topMenu;
				if (top) {
					return urlTools.combine(top.Url, item.Url);
				}
				return undefined;
			},
            toggle() {
				this.$parent.sideBarCollapsed = !this.$parent.sideBarCollapsed;
			}
		}
	};

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
				// TODO: compact
                let root = window.$$rootUrl;
				let url = store.getters.url;
				let len = store.getters.len;
				if (len === 2 || len === 3)
					url += '/index/0';
				return urlTools.combine(root, '/_page', url) + store.getters.search;
			},
			cssClass() {
				let route = this.$store.getters.route;
				if (route.seg0 === 'app')
					return 'full-view';
				return route.len === 3 ? 'partial-page' :
					route.len === 2 ? 'full-page' : 'full-view';
			}
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
<div :class="cssClass">
    <a2-nav-bar :menu="menu" v-show="navBarVisible"></a2-nav-bar>
    <a2-side-bar :menu="menu" v-show="sideBarVisible"></a2-side-bar>
    <a2-content-view></a2-content-view>
    <div class="load-indicator" v-show="pendingRequest"></div>
    <div class="modal-stack" v-if="hasModals">
        <div class="modal-wrapper" v-for="dlg in modals">
            <a2-modal :dialog="dlg"></a2-modal>
        </div>
    </div>
</div>`,
		components: {
			'a2-nav-bar': a2NavBar,
			'a2-side-bar': a2SideBar,
            'a2-content-view': contentView,
            'a2-modal': modal
		},
		props: {
			menu: Array
		},
		data() {
			return {
				sideBarCollapsed: false,
				requestsCount: 0,
				modals: []
			};
		},
		computed: {
			route() {
				return this.$store.getters.route;
			},
			navBarVisible() {
				let route = this.route;
				return route.seg0 !== 'app' && (route.len === 2 || route.len === 3);
			},
			sideBarVisible() {
				let route = this.route;
				return route.seg0 !== 'app' && route.len === 3;
			},
			cssClass() {
				return 'main-view ' + (this.sideBarCollapsed ? 'side-bar-collapsed' : 'side-bar-expanded');
			},
			pendingRequest() { return this.requestsCount > 0; },
            hasModals() { return this.modals.length > 0; }
		},
		created() {
			let opts = { title: null };
            let newUrl = makeMenuUrl(this.menu, urlTools.normalizeRoot(window.location.pathname), opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

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
                let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal, id);
				url = store.replaceUrlQuery(url, prms.query);
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

    const shell = Vue.extend({
        components: {
            'a2-main-view': a2MainView
		},
		store,
		data() {
			return {
                requestsCount: 0,
                debugShowTrace: false,
                debugShowModel: false,
                dataCounter: 0
			};
		},
		computed: {
			processing() { return this.requestsCount > 0; },
			traceEnabled: {
				get() { return log.traceEnabled(); },
				set(value) { log.enableTrace(value); }
			},
	        modelStack() {
                return this.__dataStack__;
            }
    	},
        methods: {
            about() {
				// TODO: localization
				this.$store.commit('navigate', { url: '/app/about', title: 'Про програму...' }); // TODO 
            },
			root() {
                let opts = { title: null };
                let currentUrl = this.$store.getters.url;
                let menuUrl = makeMenuUrl(this.menu, '/', opts);
                if (currentUrl === menuUrl) {
                    return; // already in root
                }
				this.$store.commit('navigate', { url: makeMenuUrl(this.menu, '/', opts), title: opts.title });
			},
			debugOptions() {
				alert('debug options');
			},
			debugTrace() {
                this.debugShowModel = false;
                this.debugShowTrace = !this.debugShowTrace;
			},
            debugModel() {
                this.debugShowTrace = false;
                this.debugShowModel = !this.debugShowModel;
            },
            debugClose() {
                this.debugShowModel = false;
                this.debugShowTrace = false;
            },
			profile() {
				alert('user profile');
			},
			changeUser() {
				alert('change user');
			}
		},
		created() {
			let me = this;

			me.__dataStack__ = [];
	
            window.addEventListener('popstate', function (event, a, b) {
				eventBus.$emit('modalCloseAll');
				if (me.__dataStack__.length > 0) {
					let comp = me.__dataStack__[0];
					let oldUrl = event.state;
					if (!comp.$saveModified()) {
						// disable navigate
						oldUrl = comp.$data.__baseUrl__.replace('/_page', '');
						window.history.pushState(oldUrl, null, oldUrl);
						return;
					}
				}

				me.$store.commit('popstate');
			});

            eventBus.$on('registerData', function (component, out) {
                me.dataCounter += 1;
                if (component) {
                    if (me.__dataStack__.length > 0)
                        out.caller = me.__dataStack__[0];
                    me.__dataStack__.unshift(component);
                } else {
                    me.__dataStack__.shift(component);
                }
			});


			popup.startService();

			eventBus.$on('beginRequest', () => me.requestsCount += 1);
			eventBus.$on('endRequest', () => me.requestsCount -= 1);

			eventBus.$on('closeAllPopups', popup.closeAll);

		}
    });

    app.components['std:shellController'] = shell;
})();