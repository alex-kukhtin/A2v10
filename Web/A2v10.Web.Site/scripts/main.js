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




/*20170918-7034*/
/* services/url.js */

app.modules['std:url'] = function () {

	return {
		combine: combine,
		makeQueryString: makeQueryString,
        parseQueryString: parseQueryString,
        normalizeRoot: normalizeRoot,
        idChangedOnly: idChangedOnly
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
        // TODO: TEST
        let ns = (newUrl || '').split('/');
        let os = (oldUrl || '').split('/');
        if (ns.length !== os.length)
            return false;
        if (os[os.length - 1] === 'new' && ns[ns.length - 1] !== 'new') {
            if (ns.slice(ns.length - 1).join('/') === os.slice(os.length -1).join('/'))
                return true;
        }
        return false;
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


    app.modules['platform'] = {
		set: set,
		defer: defer
    };

	app.modules['std:eventBus'] = new Vue({});

})();

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
/*20170928-7039*/
/* services/utils.js */

app.modules['utils'] = function () {

	const dateLocale = 'uk-UA';

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
        format: format,
		toNumber: toNumber,
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
				return obj.toLocaleDateString(dateLocale) + ' ' + obj.toLocaleTimeString(dateLocale);
			case "Date":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return obj.toLocaleDateString(dateLocale);
			case "Time":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return obj.toLocaleTimeString(dateLocale);
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




app.modules['std:log'] = function () {

	let _traceEnabled = false;

	return {
		info: info,
		warn: warning,
		error: error,
		time: countTime,
		traceEnabled() {
			return _traceEnabled;
		},
		enableTrace(val) {
			_traceEnabled = val;
			console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
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

	function countTime(msg, start) {
		if (!_traceEnabled) return;
		console.warn(msg + ' ' + (performance.now() - start).toFixed(2) + ' ms');
	}
};

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





/*20170824-7019*/
/*validators.js*/
app.modules['std:validators'] = function() {

    const utils = require('utils');
    const ERROR = 'error';

	return {
		validate: validateItem
	};

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
                    retval.push({ msg: rule.msg, severity: rule.severity || ERROR });
            } else if (utils.isFunction(rule.valid)) {
                let vr = rule.valid(item, val);
                if (utils.isString(vr))
                    retval.push({ msg: vr, severity: rule.severity || ERROR });
                else if (!vr)
                    retval.push({ msg: rule.msg, severity: rule.severity || ERROR });
            } else {
                console.error('invalid valid element type for rule');
            }
        });
        return retval;
    }

    function validateItem(rules, item, val) {
        //console.warn(item);
        let arr = [];
        if (utils.isArray(rules))
            arr = rules;
        else if (utils.isObject(rules))
            arr.push(rules);
        else if (utils.isString(rules))
            arr.push({ valid: 'notBlank', msg: rules });
        let err = validateImpl(arr, item, val);
        if (!err.length)
            return null;
        return err;
    }
};



/*20171006-7041*/
/* services/datamodel.js */
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

	const platform = require('platform');
	const validators = require('std:validators');
	const utils = require('utils');
	const log = require('std:log');

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
			default:
				shadow[prop] = new propCtor(source[prop] || null, pathdot + prop, parent);
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
				this._src_[prop] = val;
				this._root_.$setDirty(true);
				if (!this._path_)
					return;
				let eventName = this._path_ + '.' + prop + '.change';
				this._root_.$emit(eventName, this, val);
			}
		});
	}

	function createObjProperties(elem, ctor) {
		let templ = elem._root_.$template;
		if (!templ) return;
		let props = templ._props_;
		if (!props) return;
		let objname = ctor.name;
		if (objname in props) {
			for (let p in props[objname]) {
				Object.defineProperty(elem, p, {
					configurable: false,
					enumerable: true,
					get: props[objname][p]
				});
			}
		}
	}

	function initRootElement(elem) {
		// object already created
		elem._root_.$emit('Model.load', elem);
	}

	function createObject(elem, source, path, parent) {
		let ctorname = elem.constructor.name;
		let startTime = null;
		if (ctorname === 'TRoot')
			startTime = performance.now();
		parent = parent || elem;
		defHidden(elem, SRC, {});
		defHidden(elem, PATH, path);
		defHidden(elem, ROOT, parent._root_ || parent);
		defHidden(elem, PARENT, parent);
		defHidden(elem, ERRORS, null, true);



		for (let propName in elem._meta_.props) {
			defSource(elem, source, propName, parent);
		}
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
				if (utils.isObject(sx) && ('$valid' in sx)) {
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
					let rcv = source[rcp];
					elem[m].$RowCount = rcv;
				}
			}
			elem._enableValidate_ = true;
			elem._needValidate_ = true;
			initRootElement(elem);
		}
		if (startTime)
			log.time('create root time:', startTime);
		return elem;
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

	_BaseArray.prototype.$new = function (src) {
		let newElem = new this._elem_(src || null, this._path_ + '[]', this);
		newElem.$checked = false;
		return newElem;
	};

	defPropertyGet(_BaseArray.prototype, "Count", function () {
		return this.length;
	});

	_BaseArray.prototype.$append = function (src) {
		let newElem = this.$new(src);
		let len = this.push(newElem);
		let ne = this[len - 1]; // maybe newly created reactive element
		let eventName = this._path_ + '[].add';
		this._root_.$setDirty(true);
		this._root_.$emit(eventName, this /*array*/, ne /*elem*/, len - 1 /*index*/);
		platform.set(this, "$selected", ne);
		// set RowNumber
		if ('$rowNo' in newElem._meta_) {
			let rowNoProp = newElem._meta_.$rowNo;
			newElem[rowNoProp] = len; // 1-based
		}
		return ne;
	};

	_BaseArray.prototype.$empty = function () {
		this.splice(0, this.length);
		return this;
	};

	_BaseArray.prototype.$clearSelected = function () {
		platform.set(this, '$selected', null);
	}

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
		if (this.length > index)
			platform.set(this, '$selected', this[index]);
		// renumber rows
		if ('$rowNo' in item._meta_) {
			let rowNoProp = item._meta_.$rowNo;
			for (let i = 0; i < this.length; i++) {
				this[i][rowNoProp] = i + 1; // 1-based
			}
		}
	};

	_BaseArray.prototype.$copy = function (src) {
		this.$empty();
		if (utils.isArray(src)) {
			for (let i = 0; i < src.length; i++) {
				this.push(this.$new(src[i]));
			}
		}
		return this;
	};

	function defineObject(obj, meta, arrayItem) {
		defHidden(obj.prototype, META, meta);
		obj.prototype.$merge = merge;

		defHiddenGet(obj.prototype, "$host", function () {
			return this._root_._host_;
		});

		defHiddenGet(obj.prototype, "$root", function () {
			return this._root_;
		});

		defHiddenGet(obj.prototype, "$parent", function () {
			return this._parent_;
		});

		defHiddenGet(obj.prototype, "$vm", function () {
			return this._root_._host_.$viewModel;
		});

		defHiddenGet(obj.prototype, "$isNew", function () {
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
			func.call(undefined, ...arr);
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

	function executeCommand(cmd, ...args) {
		try {
			this._root_._enableValidate_ = false;
			let tml = this.$template;
			if (tml && tml.commands) {
				let cmdf = tml.commands[cmd];
				if (typeof cmdf === 'function') {
					cmdf.apply(this, args);
					return;
				}
			}
			console.error(`command "${cmd}" not found`);
		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
		}
	}

	function validateImpl(item, path, val) {
		if (!item) return null;
		let tml = item._root_.$template;
		if (!tml) return null;
		var vals = tml.validators;
		if (!vals) return null;
		var elemvals = vals[path];
		if (!elemvals) return null;
		return validators.validate(elemvals, item, val);
	}

	function saveErrors(item, path, errors) {
		if (!item._errors_ && !errors)
			return; // already null
		else if (!item._errors_ && errors)
			item._errors_ = {}; // new empty object
		if (errors)
			item._errors_[path] = errors;
		else if (path in item._errors_)
			delete item._errors_[path];
		if (utils.isEmptyObject(item._errors_))
			item._errors_ = null;
		return errors;
	}

	function validate(item, path, val) {
		if (!item._root_._needValidate_) {
			// already done
			if (!item._errors_)
				return null;
			if (path in item._errors_)
				return item._errors_[path];
			return null;
		}
		let res = validateImpl(item, path, val);
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
				if (!(prop in root)) {
					console.error(`Invalid Validator key. property '${prop}' not found in '${root.constructor.name}'`);
				}
				let objto = root[prop];
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
		console.dir(allerrs);
	}

	function setDirty(val) {
		this.$dirty = val;
	}

	function merge(src) {
		try {
			this._root_._enableValidate_ = false;
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
							trg.$RowCount = src[rcProp];
						else
							trg.$RowCount = 0;
					}
					// try to select old value
				} else {
					if (utils.isPrimitiveCtor(ctor))
						platform.set(this, prop, src[prop]);
					else {
						let newsrc = new ctor(src[prop], prop, this);
						platform.set(this, prop, newsrc);
					}
				}
			}
		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
		}
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$merge = merge;
		root.prototype.$template = template;
		root.prototype._exec_ = executeCommand;
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
	}

	function setModelInfo(root, info) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: 20
		};
	}

	app.modules['datamodel'] = {
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
	let utils = require('utils');

	function post(url, data) {
		return http.post(url, data);
	}

	app.modules['std:dataservice'] = {
		post: post
	};
})();




/*20170829-7022*/
/* services/popup.js */

app.modules['std:popup'] = function () {

	const __dropDowns__ = [];
	let __started = false;

	const __error = 'Perhaps you forgot to create a _click function for popup element';


	return {
		startService: startService,
		registerPopup: registerPopup,
		unregisterPopup: unregisterPopup,
		closeAll: closeAllPopups
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

	function closePopups(ev) {
		if (__dropDowns__.length === 0)
			return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (closest(ev.target, '.dropdown-item') ||
				ev.target.hasAttribute('close-dropdown') ||
				closest(ev.target, '[dropdown-top]') !== el) {
				if (!el._close)
					throw new Error(__error);
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
(function () {

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean
		},
        computed: {
			path() {
                return this.item._path_ + '.' + this.prop;
            },
            valid() {
                return !this.invalid;
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
            cssClass() {
				let cls = 'control-group' + (this.invalid ? ' invalid' : ' valid');
				if (this.required) cls += ' required';
				if (this.disabled) cls += ' disabled';
                return cls;
            },
            inputClass() {
                let cls = '';
                if (this.align !== 'left')
                    cls += 'text-' + this.align;
                return cls;
			},
			hasLabel() {
				return !!this.label;
			},
			hasDescr() {
				return !!this.description;
			}
        },
        methods: {
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
        props: ['invalid', 'errors'],
        template: '<div v-if="invalid" class="validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
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
(function() {

    const utlis = require('utils');

    let textBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model.lazy="item[prop]" :class="inputClass" :placeholder="placeholder" :disabled="disabled"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let textAreaTemplate =
        `<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<textarea v-focus v-model.lazy="item[prop]" :rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let staticTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group static">
		<span v-text="text" :class="inputClass"/>
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
            placeholder: String
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
            text: [String, Number, Date]
        }
    });

})();
/*20171006-7041*/
/*components/combobox.js*/

(function () {


    const utils = require('utils');

    let comboBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<select v-model="cmbValue" :class="inputClass">
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
				type: Array, default() { return []; } }
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
(function () {

	const popup = require('std:popup');

	const utils = require('utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');

	Vue.component('a2-date-picker', {
		extends: baseControl,
		template: `
<div  :class="cssClass">
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
						this.modelDate = utils.date.today();
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
				else if (w == 0) w = 7;
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

/*20171006-7041*/
/*components/datagrid.js*/
(function () {

 /*TODO:
2. size (compact, large ??)
6. select (выбирается правильно, но теряет фокус при выборе редактора)
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


	const utils = require('utils');
	const log = require('std:log');

    const dataGridTemplate = `
<div class="data-grid-container">
    <table :class="cssClass">
        <colgroup>
            <col v-if="isMarkCell"/>
			<col v-if="isGrouping" class="fit"/>
            <col v-bind:class="columnClass(col)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
        </colgroup>
        <thead>
            <tr>
                <th v-if="isMarkCell" class="marker"></th>
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
	<slot name="pager"></slot>
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

    const dataGridColumnTemplate = `
<th :class="cssClass" @click.prevent="doSort">
	<div class="h-holder">
		<i :class="\'fa fa-\' + icon" v-if="icon"></i>
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
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined },
			mark: String,
			controlType: String,
			width: String,
			fit: Boolean,
			command: Object
        },
        created() {
			this.$parent.$addColumn(this);
        },
		computed: {
            dir() {
				return this.$parent.sortDir(this.content);
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
				if (editable)
					cssClass += ' cell-editable';
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
				'class': col.cellCssClass(row, col.editable)
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

			if (!col.content) {
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

            if (col.editable) {
                /* editable content */
                let child = {
                    props: ['row', 'col', 'align'],
                    /*TODO: control type */
                    template: '<textbox :item="row" :prop="col.content" :align="col.align" ></textbox>'
				};
                return h(tag, cellProps, [h(child, childProps)]);
			} else if (col.command) {
				// column command -> hyperlink
				let arg1 = col.command.arg1 || '';
				if (arg1 === 'this') arg1 = row;
				if (arg1.startsWith('{')) {
					arg1 = arg1.substring(1, arg1.length - 1);
					let narg = row[arg1];
					if (!narg)
						throw new Error(`Property '${arg1}' not found in ${row.constructor.name} object`);
					arg1 = narg;
				}
				let arg2 = col.command.arg2 || '';
				if (arg2 === 'this') arg2 = row; else arg2 = utils.eval(row, arg2, col.dataType);
				let child = {
					props: ['row', 'col'],
					/*prevent*/
					template: '<a @click.prevent="doCommand" :href="getHref()" v-text="eval(row, col.content, col.dataType)"></a>',
					methods: {
						doCommand() {
							col.command.cmd(arg1, arg2);
						},
						eval: utils.eval,
						getHref() {
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

			let content = utils.eval(row, col.content, col.dataType);
            let chElems = [content];
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
                if (!this.$parent.dblclick)
                    return;
                window.getSelection().removeAllRanges();
                this.$parent.dblclick();
            }
        }
    };

	Vue.component('data-grid', {
		props: {
			'items-source': [Object, Array],
			border: Boolean,
			grid: String,
			striped: Boolean,
			hover: { type: Boolean, default: false },
			sort: Boolean,
			routeQuery: Object,
			mark: String,
			filterFields: String,
			markStyle: String,
			dblclick: Function,
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
			cssClass() {
				let cssClass = 'data-grid';
				if (this.border) cssClass += ' border';
				if (this.grid) cssClass += ' grid-' + this.grid.toLowerCase();
				if (this.striped) cssClass += ' striped';
				if (this.hover) cssClass += ' hover';
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
/*20170823-7018*/
/*components/pager.js*/

Vue.component('a2-pager', {
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
`,
	props: {
		source: Object
	},
	computed: {
		middleButtons() {
			let ba = [];
			ba.push(1);
			ba.push(2);
			return ba;
		},
		disabledFirst() {
			return this.source.offset === 0;
		},
		disabledPrev() {
			return this.source.offset === 0;
		}
	},
	methods: {
		page(no) {

		}
	}
});


/*20170918-7034*/
/*components/popover.js*/

Vue.component('popover', {
	template: `
<div v-dropdown class="popover-wrapper">
	<span toggle class="popover-title"><i v-if="hasIcon" :class="iconClass"></i> <span v-text="title"></span></span>
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
		title: String
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

/* 20170919-7035 */
/*components/treeview.js*/

(function () {

    const utils = require('utils');

    /*TODO:
        4. select first item
    */
    const treeItemComponent = {
        name: 'tree-item',
        template: `
<li @click.stop.prevent="doClick(item)" :title="item[options.title]"
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

/*20171006-7041*/
/*components/collectionview.js*/

/*
TODO:
8. правильный pager
11. GroupBy
*/

(function () {

	/**
	<code>
		collection-view: source-count={{sourceCount}}, page-size={{pageSize}}
		offset:{{offset}}, pages={{pages}}, dir={{dir}}, order={{order}}, filter={{filter}}
	</code>
	 */

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
				let s = performance.now();
				let arr = [].concat(this.ItemsSource);

				if (this.filterDelegate) {
					arr = arr.filter((item) => this.filterDelegate(item, this.filter));
				} else {
					// filter (TODO: // правильная фильтрация)
					if (this.filter && this.filter.Filter)
						arr = arr.filter((v) => v.Id.toString().indexOf(this.filter.Filter) !== -1);
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
				arr = arr.slice(this.offset, this.offset + this.pageSize);
				arr.$origin = this.ItemsSource;
				arr.$origin.$clearSelected();
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
					this.$root.$emit('localQueryChange', this.$store.makeQueryString(this.localQuery));
				} else if (this.runAt === 'serverurl')
					this.$store.commit('setquery', { offset: offset });
				else
					this.localQuery.offset = offset;

			},
			first() {
				this.$setOffset(0);
			},
			prev() {
				let no = this.offset;
				if (no > 0)
					no -= this.pageSize;
				this.$setOffset(no);
			},
			next() {
				let no = this.offset + this.pageSize;
				this.$setOffset(no);
			},
			last() {
				//TODO
				this.$setOffset(1000);
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				let nq = { dir: this.dir, order: this.order };
				if (nq.order === order)
					nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
				}
				if (this.runAt === 'server') {
					this.localQuery.dir = nq.dir;
					this.localQuery.order = nq.order;
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
			filterChanged() {
				// for server only
				let nq = {};
				for (let x in this.filter) {
					let fVal = this.filter[x];
					if (fVal)
						nq[x] = fVal;
				}
				if (this.runAt === 'server') {
					// for this BaseController only
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
            <li :class="tab.tabCssClass" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click.stop.prevent="select(tab)">
                <i v-if="tab.hasIcon" :class="tab.iconCss" ></i>
                <span v-text="tab.header"></span>
            </li>
        </ul>
        <slot name="title" />
        <div class="tab-content" :class="contentCssClass">
            <slot />
        </div>
    </template>
    <template v-else>
        <ul class="tab-header">
            <li :class="{active: isActiveTab(item)}" v-for="(item, tabIndex) in items" :key="tabIndex" @click.stop.prevent="select(item)">
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
			icon: String,
			tabStyle: String
        },
        computed: {
            hasIcon() {
                return !!this.icon;
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

/*20171006-7041*/
/* components/modal.js */

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
/*20170921-7037*/
/* services/image.js */

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


Vue.component("a2-taskpad", {
	template:
`<div :class="cssClass">
	<a class="ico collapse-handle" @click.stop="toggle"></a>
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
			__savedCols: '',
		}
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


/*20171006-7041*/
/* directives/dropdown.js */

Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		//console.warn('bind drop down');

		const popup = require('std:popup');
		let me = this;

		el._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');
		// el.focus();
		if (!el._btn) {
			console.error('DropDown does not have a toggle element');
		}

		popup.registerPopup(el);

		el._close = function (ev) {
			if (el._hide)
				el._hide();
			el.classList.remove('show');
		};

		/*
		el.addEventListener('blur', function (event) {
			if (el._close) el._close(event);
		}, true);
		*/

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
					popup.closeAll();
					if (el._show)
						el._show();
					el.classList.add("show");
				}
			}
		});
	},
	unbind(el) {
		//console.warn('unbind drop down');
		const popup = require('std:popup');
		popup.unregisterPopup(el);
	}
});


/*20170906-7027*/
/* directives/focus.js */

Vue.directive('focus', {
	bind(el, binding, vnode) {

		el.addEventListener("focus", function (event) {
			event.target.parentElement.classList.add('focus');
		});

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = false;
			event.target.parentElement.classList.remove('focus');
		});

		el.addEventListener("click", function (event) {
			let t = event.target;
			if (t._selectDone)
				return;
			t._selectDone = true;
			if (t.select) t.select();
			//event.stopImmediatePropagation();
		}, true);
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


/*20170926-7038*/
/*controllers/base.js*/
(function () {

    const eventBus = require('std:eventBus');
    const utils = require('utils');
    const dataservice = require('std:dataservice');
	const store = component('std:store');
	const urltools = require('std:url');
	const log = require('std:log');

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
			$exec(cmd, arg, confirm) {
				let root = this.$data;
				if (!confirm)
					root._exec_(cmd, arg);
				else
					this.$confirm(confirm).then(() => root._exec_(cmd, arg));
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

			$save() {
				let self = this;
                let root = window.$$rootUrl;
				let url = root + '/_data/save';
				return new Promise(function (resolve, reject) {
                    let jsonData = utils.toJson({ baseUrl: self.$baseUrl, data: self.$data });
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
				let baseUrl = self.$baseUrl;
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
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},

			$navigate(url, data) {
				let dataToNavigate = data || 'new';
                if (utils.isObjectExact(dataToNavigate))
					dataToNavigate = dataToNavigate.$id;
				let urlToNavigate = urltools.combine(url, dataToNavigate);
				this.$store.commit('navigate', { url: urlToNavigate });
			},

            $dbRemoveSelected(arr, confirm) {
                let sel = arr.$selected;
                if (!sel)
                    return;
                let id = sel.$id;
                let self = this;
                let root = window.$$rootUrl;

                function dbRemove() {
                    let postUrl = root + '/_data/dbRemove';
                    let jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: id });

                    dataservice.post(postUrl, jsonData).then(function (data) {
                        sel.$remove(); // without confirm
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
			$openSelected(url, arr) {
				// TODO: переделать
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
				if (url.startsWith('{')) {
					url = url.substring(1, url.length - 1);
					let nUrl = sel[url];
					if (!nUrl)
						throw new Error(`Property '${url}' not found in ${sel.constructor.name} object`);
					url = nUrl;
				}
				this.$navigate(url, sel.$id);
			},

			$hasSelected(arr) {
				return !!arr.$selected;
			},

			$confirm(prms) {
				if (utils.isString(prms))
                    prms = { message: prms };
                prms.style = 'confirm';
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

			$dialog(command, url, data, query) {
				return new Promise(function (resolve, reject) {
					// sent a single object
                    if (command === 'edit-selected') {
                        if (!utils.isArray(data)) {
                            console.error('$dialog.editSelected. The argument is not an array');
                        }
                        data = data.$selected;
                    }
                    let dataToSent = data;
					if (command === 'add') {
						if (!utils.isArray(data)) {
							console.error('$dialog.add. The argument is not an array');
						}
						dataToSent = null;
					}
					let dlgData = { promise: null, data: dataToSent, query: query };
					eventBus.$emit('modal', url, dlgData);
                    if (command === 'edit' || command === 'edit-selected' || command === 'browse') {
                        dlgData.promise.then(function (result) {
                            if (!utils.isObject(data)) {
                                console.error(`$dialog.${command}. The argument is not an object`);
                                return;
                            }
                            // result is raw data
                            data.$merge(result);
                            resolve(result);
                        });
					} else if (command === 'add') {
						// append to array
						dlgData.promise.then(function (result) {
							// result is raw data
							data.$append(result);
							resolve(result);
						});
					} else {
						dlgData.promise.then(function (result) {
							resolve(result);
						});
					}
				});
			},

			$modalSaveAndClose(result) {
				if (this.$isDirty)
					this.$save().then((result) => eventBus.$emit('modalClose', result));
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
						{ text: "Save", result: "save" },
						{ text: "Don't save", result: "close" },
						{ text: "Cancel", result: false }
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

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
				// TODO: get delegate from template
				return function (item, filter) {
					console.warn('filter:' + item.Id + " filter:" + filter.Filter);
					return true;
				}
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
			}
		},
		created() {
			eventBus.$emit('registerData', this);

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
		},
		destroyed() {
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			this.$off('localQueryChange', this.__queryChange);
		},
		beforeUpdate() {
			this.__updateStartTime = performance.now();
		},
		updated() {
			log.time('update time:', this.__updateStartTime);
		}
    });
    
	app.components['baseController'] = base;
})();
/*20170925-7038*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const popup = require('std:popup');
	const urlTools = require('std:url');
	const log = require('std:log');

	const UNKNOWN_TITLE = 'unknown title';

	function findMenu(menu, func, parentMenu) {
		if (!menu)
			return null;
		for (let i = 0; i < menu.length; i++) {
			let itm = menu[i];
			if (func(itm))
				return itm;
            if (itm.menu) {
                if (parentMenu)
                    parentMenu.url = itm.url;
				let found = findMenu(itm.menu, func);
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
		let am = null;
		if (seg1)
			am = menu.find((mi) => mi.url === seg1);
        if (!am) {
            // no segments - find first active menu
            let parentMenu = { url: '' };
            am = findMenu(menu, (mi) => mi.url && !mi.menu, parentMenu);
			if (am) {
				opts.title = am.title;
				return urlTools.combine(url, parentMenu.url, am.url);
			}
		} else if (am && !am.menu) {
			opts.title = am.title;
			return url; // no sub menu
		}
		url = urlTools.combine(seg1);
		let seg2 = sUrl[2];
		if (!seg2 && opts.seg2)
			seg2 = opts.seg2; // may be
		if (!seg2) {
			// find first active menu in am.menu
			am = findMenu(am.menu, (mi) => mi.url && !mi.menu);
		} else {
			// find current active menu in am.menu
			am = findMenu(am.menu, (mi) => mi.url === seg2);
		}
		if (am) {
			opts.title = am.title;
			return urlTools.combine(url, am.url);
		}
		return url; // TODO: ????
	}

	const a2NavBar = {
		template: `
<ul class="nav-bar">
    <li v-for="(item, index) in menu" :key="index" :class="{active : isActive(item)}">
        <a :href="itemHref(item)" v-text="item.title" @click.prevent="navigate(item)"></a>
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
				return this.seg0 === item.url;
			},
			itemHref: (item) => '/' + item.url,
			navigate(item) {
				if (this.isActive(item))
                    return;
                let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.url);
                let savedUrl = localStorage.getItem(storageKey) || '';
                if (savedUrl && !findMenu(item.menu, (mi) => mi.url === savedUrl)) {
                    // saved segment not found in current menu
                    savedUrl = '';
                }
				let opts = { title: null, seg2: savedUrl };
                let url = makeMenuUrl(this.menu, item.url, opts);
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
            :options="{folderSelect: folderSelect, label: 'title', title: 'title',
                subitems: 'menu',
                icon:'icon', wrapLabel: true, hasIcon: true}">
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
				let am = findMenu(sm, (mi) => mi.url === seg1);
				if (am)
					return am.title || UNKNOWN_TITLE;
				return UNKNOWN_TITLE;
			},
			sideMenu() {
				let top = this.topMenu;
				return top ? top.menu : null;
			},
			topMenu() {
				let seg0 = this.seg0;
				return findMenu(this.menu, (mi) => mi.url === seg0);
			}
		},
		methods: {
			isActive(item) {
				return this.seg1 === item.url;
            },
            folderSelect(item) {
                return !!item.url;
            },
			navigate(item) {
				if (this.isActive(item))
					return;
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.url, item.url);
					if (item.url.indexOf('/') === -1) {
                        // save only simple path
                        localStorage.setItem('menu:' + urlTools.combine(window.$$rootUrl, top.url), item.url);
					}
					this.$store.commit('navigate', { url: url, title: item.title });
				}
				else
					console.error('no top menu found');
			},
			itemHref(item) {
				let top = this.topMenu;
				if (top) {
					return urlTools.combine(top.url, item.url);
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
                let id = '0';
                let root = window.$$rootUrl;
				if (prms && prms.data && prms.data.$id) {
					// TODO: get correct ID
					id = prms.data.$id;
				}
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
				requestsCount: 0
			};
		},
		computed: {
			processing() { return this.requestsCount > 0; },
			traceEnabled: {
				get() { return log.traceEnabled(); },
				set(value) { log.enableTrace(value); }
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
				alert('debug trace');
			},
			debugModel() {
				alert('debug model');
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

			eventBus.$on('registerData', function (component) {
				if (component)
					me.__dataStack__.push(component);
				else
					me.__dataStack__.pop(component);
			});


			popup.startService();

			eventBus.$on('beginRequest', () => me.requestsCount += 1);
			eventBus.$on('endRequest', () => me.requestsCount -= 1);

			eventBus.$on('closeAllPopups', popup.closeAll);

		}
    });

    app.components['std:shellController'] = shell;
})();