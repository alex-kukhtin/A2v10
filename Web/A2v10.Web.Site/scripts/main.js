/*20170814-7013*/
/*app.js*/
(function () {

	window.app = {
        modules: {},
        components: {}
    };

    window.require = require;
    window.component = component;

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




/*20170903-7024*/
/* services/url.js */

app.modules['std:url'] = function () {

	return {
		combine: combine,
		makeQueryString: makeQueryString,
		parseQueryString: parseQueryString
	};

	function normalize(elem) {
		elem = '' + elem || '';
		elem = elem.replace(/\\/g, '/');
		if (elem.startsWith('/'))
			elem = elem.substring(1);
		if (elem.endsWith('/'))
			elem = elem.substring(0, elem.length - 1);
		return elem;
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
		var obj = {};
		str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
			obj[decodeURIComponent(key)] = decodeURIComponent(value);
		});
		return obj;
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

/*20170824-7019*/
/* platform/route.js */
(function () {

    const SEARCH_PREFIX = "search:";
    const MENU_PREFIX = "menu:";
    const ENABLE_SAVE_SEARCH = true;

    function parseQueryString(str) {
        var obj = {};
        str.replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    }

    function makeQueryString(obj) {
        if (!obj)
            return '';
        let esc = encodeURIComponent;
        let query = Object.keys(obj)
            .filter(k => obj[k])
            .map(k => esc(k) + '=' + esc(obj[k]))
            .join('&');
        return query ? '?' + query : '';
    }

    function saveSearchToStorage() {
        if (!ENABLE_SAVE_SEARCH)
            return;
        let stg = window.localStorage;
        if (!stg)
            return;
        let loc = window.location;
        let key = SEARCH_PREFIX + loc.pathname;
        loc.search ? stg.setItem(key, loc.search) : stg.removeItem(key);
        //console.info(`store key='${key}', value='${loc.search}'`);
    }

    function getSearchFromStorage(url) {
        if (!ENABLE_SAVE_SEARCH)
            return '';
        let stg = window.localStorage;
        if (!stg)
            return '';
        let key = SEARCH_PREFIX + url;
        let res = stg.getItem(key) || '';
        //console.info(`get key='${key}', value='${res}'`);
        return res;
    }

    function Location() {
        this.path = window.location.pathname;
        this.wl = this.path.split('/');
        this.search = window.location.search.substring(1);
    }

    // static
    Location.current = function () {
        return new Location();
    };

    Location.getSavedMenu = function (segment) {
        let stg = window.localStorage;
        if (!stg)
            return '';
        let key = MENU_PREFIX + segment;
        let res = stg.getItem(key) || '';
        return res;
    };

    Location.prototype.routeLength = function () {
        return this.wl.length;
    };

    Location.prototype.segment = function (no) {
        let wl = this.wl;
        return wl.length > no ? wl[no].toLowerCase() : '';
    };
    Location.prototype.fullPath = function () {
        return this.path + (this.search ? '?' + this.search : '');
    };

    Location.prototype.saveMenuUrl = function () {
        let stg = window.localStorage;
        if (!stg)
            return;
        let s1 = this.segment(1);
        let s2 = this.segment(2);
        let search = this.search;
        if (s1) {
            let keym = MENU_PREFIX + s1;
            s2 ? stg.setItem(keym, s2) : stg.removeItem(keym);
        }
        return this;
    };

    const route = new Vue({
        data: {
            search: {}
        },
        computed: {
            query: {
                get() {
                    let wls = window.location.search.substring(1); // skip '?'
                    let qs = parseQueryString(wls);
                    Vue.set(this, 'search', qs);
                    //console.warn('get route.query:' + wls);
                    return this.search;
                },
				set(value) {
                    Vue.set(this, 'search', value);
                    let newUrl = window.location.pathname;
                    newUrl += makeQueryString(this.search);
                    // replace, do not push!
                    window.history.replaceState(null, null, newUrl);
                    saveSearchToStorage();
                    //console.warn('set route.query:' + makeQueryString(this.search));
                }
            }
        },
        methods: {
            location() {
                return Location.current();
            },

            replaceUrlSearch(url) {
                // replace search part url to current
                let search = window.location.search;
                let parts = url.split('?');
                if (parts.length !== 2)
                    return url;
                return parts[0] + search;
            },

            queryFromUrl(url) {
                if (!url)
                    return {};
                let parts = url.split('?');
                if (parts.length === 2)
                    return parseQueryString(parts[1]);
                return {};
            },

            replaceUrlQuery(url, qry) {
                if (!url)
                    return;
                let parts = url.split('?');
                if (parts.length > 0)
                    return parts[0] + makeQueryString(qry);
                return url;
            },

            savedMenu: Location.getSavedMenu,

            navigateMenu(url, query, title) {
                let srch = getSearchFromStorage(url);
                if (!srch)
                    url += query ? '?' + query : '';
                else
                    url += srch;
                if (query)
                    Vue.set(this, 'search', parseQueryString(query));
                else if (srch) {
                    Vue.set(this, 'search', parseQueryString(srch.substring(1)));
                }
                console.info('navigate to:' + url);
                this.setTitle(title);
                window.history.pushState(null, null, url);
                let loc = this.location();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },

            navigateCurrent() {
                let loc = this.location();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },

            navigate(url, title) {
                let loc = this.location();
                console.info('navigate to:' + url);
                let oldUrl = loc.fullPath();
                // push/pop state feature. Replace the current state and push new one.
				this.setTitle(title);
                window.history.replaceState(oldUrl, null, oldUrl);
                window.history.pushState(oldUrl, null, url);
                loc = this.location(); // get new instance
                this.$emit('route', loc);
            },
            setTitle(title) {
                if (title)
                    document.title = title;
            },
            setState(url, title, query) {
                this.setTitle(title);
                if (query)
                    url += '?' + query;
                else {
                    let search = getSearchFromStorage(url);
                    url += search || '';
                }
                window.history.replaceState(null, null, url);
            },
            updateSearch() {
                //return;
                let wls = window.location.search.substring(1); // skip '?'
                let qs = parseQueryString(wls);
                //console.warn('update search:' + wls);
                Vue.set(this, 'search', qs);
                saveSearchToStorage();
            },
            close() {
                window.history.back();
            }
        }
    });


    app.modules['route'] = route;
})();

/*20170902-7023*/
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

	const store = new Vuex.Store({
		state: {
			route: window.location.pathname,
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
				let oldUrl = state.route + urlTools.makeQueryString(state.query);
				state.route = to.url;
				state.query = Object.assign({}, to.query);
				let newUrl = state.route + urlTools.makeQueryString(to.query);
				let h = window.history;
				setTitle(to);
				// push/pop state feature. Replace the current state and push new one.
				h.replaceState(oldUrl, null, oldUrl);
				h.pushState(oldUrl, null, newUrl);
			},
			query(state, query) {
				// changes all query
				state.query = Object.assign({}, query);
				let newUrl = state.route + urlTools.makeQueryString(state.query);
				//console.warn('set query: ' + newUrl);
				window.history.replaceState(null, null, newUrl);
			},
			setquery(state, query) {
				// changes some fields or query
				state.query = Object.assign({}, state.query, query);
				let newUrl = state.route + urlTools.makeQueryString(state.query);
				// TODO: replaceUrl: boolean
				//console.warn('set setquery: ' + newUrl);
				window.history.replaceState(null, null, newUrl);
				eventBus.$emit('queryChange', urlTools.makeQueryString(state.query));
			},
			popstate(state) {
				state.route = window.location.pathname;
				state.query = urlTools.parseQueryString(window.location.search);
				if (state.route in titleStore) {
					document.title = titleStore[state.route];
				}
			},
			setstate(state, to ){ // to: {url, title}
				//console.warn('set setstate: ' + url);
				window.history.replaceState(null, null, to.url);
				state.route = window.location.pathname;
				state.query = urlTools.parseQueryString(window.location.search);
				setTitle(to);
			},
			close(state) {
				if (window.history.length)
					window.history.back();
				else
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




app.modules['std:log'] = function () {
	return {
		info: info,
		time: countTime
	};

	function info(msg) {
		/*TODO: слишком долго, нужно режим debug/release*/
		//console.info(msg);
	}

	function countTime(msg, start) {
		console.warn(msg + (performance.now() - start).toFixed(2) + ' ms');
	}
};

/*20170828-7021*/
/* services/http.js */

app.modules['std:http'] = function () {

	let eventBus = require('std:eventBus');

	return {
		get: get,
		post: post,
		load: load
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

    function load(url, selector) {
        return new Promise(function (resolve, reject) {
            doRequest('GET', url)
                .then(function (html) {
                    if (selector.firstChild && selector.firstChild.__vue__)
                        selector.firstChild.__vue__.$destroy();
                    let dp = new DOMParser();
                    let rdoc = dp.parseFromString(html, 'text/html');
                    // first element from fragment body
                    let srcElem = rdoc.body.firstElementChild;
                    selector.innerHTML = srcElem ? srcElem.outerHTML : '';
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
                        ve.$data.__baseUrl__ = url;
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



/*20170905-7025*/
/* services/datamodel.js */
(function() {

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
        if (type === Number)
            return isFinite(val) ? + val : 0;
        return val;
    }

    function defSource(trg, source, prop, parent) {
        let propCtor = trg._meta_[prop];
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
                shadow[prop] = source[prop] || null;
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
                val = ensureType(this._meta_[prop], val);
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
        for (let propName in elem._meta_) {
            defSource(elem, source, propName, parent);
        }
        createObjProperties(elem, elem.constructor);

        defPropertyGet(elem, "$valid", function () {
            if (this._root_._needValidate_)
                this._root_._validateAll_();
            return !this._errors_;
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
            for (var m in elem._meta_) {
                let rcp = m + '.$RowCount';
                if (source && rcp in source) {
                    let rcv = source[rcp];
                    elem[m].$RowCount = rcv;
                }
			}
			elem._enableValidate_ = true;
			elem._needValidate_ = true;

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

	defPropertyGet(_BaseArray.prototype, "Count", function() {
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
        return ne;
    };

    _BaseArray.prototype.$empty = function () {
        this.splice(0, this.length);
        return this;
    };

    _BaseArray.prototype.$remove = function (item) {
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

        defHiddenGet(obj.prototype, "$vm", function () {
            return this._root_._host_.$viewModel;
        });

        if (arrayItem) {
            defArrayItem(obj);
        }
    }

    function defArrayItem(elem) {
        elem.prototype.$remove = function () {
            let arr = this._parent_;
            arr.$remove(this);
        };
        elem.prototype.$select = function () {
            let arr = this._parent_;
            platform.set(arr, "$selected", this);
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
            func(...arr);
        }
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

    function saveErrors(item, path, errors)
    {
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
        //console.warn('validate self element:' + path);
        let res = validateImpl(item, path, val);
        return saveErrors(item, path, res);
    }

    function* enumData(root, path, name) {
        if (!path) {
            // scalar value in root
            yield { item: root, val: root[name] };
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
				let objto = currentData[pname];
                if (!objto) continue;
                for (let j = 0; j < objto.length; j++) {
                    let arrItem = objto[j];
                    if (last)
                        yield { item: arrItem, val: arrItem[name] };
                    else {
                        let newpath = sp.slice(1).join('.');
						yield* enumData(arrItem, newpath, name);
                    }
                }
            } else {
                // simple element
                let objto = root[prop];
				if (objto) yield { item: root[prop], val: objto[name] };
				currentData = objto;
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
		yield* enumData(root, dp, dn);
    }

    function validateOneElement(root, path, vals) {
        if (!vals)
			return;
        for (let elem of dataForVal(root, path)) {
            let res = validators.validate(vals, elem.item, elem.val);
            saveErrors(elem.item, path, res);
        }
    }

    function validateAll() {
        var me = this;
        if (!me._needValidate_)
			return;
		me._needValidate_ = false;
		var startTime = performance.now();
        let tml = me.$template;
        if (!tml) return;
        let vals = tml.validators;
        if (!vals) return;
        for (var val in vals) {
            validateOneElement(me, val, vals[val])
		}
		var e = performance.now();
		log.time('validation time:', startTime);
    }

    function setDirty(val) {
        this.$dirty = val;
    }

	function merge(src) {
		try {
			this._root_._enableValidate_ = false;
			for (var prop in this._meta_) {
				let ctor = this._meta_[prop];
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
        root.prototype._validate_ = validate;
        root.prototype._validateAll_ = validateAll;
        // props cache for t.construct
        let xProp = {};
        if (template) {
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
		unregisterPopup: unregisterPopup
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
            if (fc && fc.__vue__)
                fc.__vue__.$destroy();
        },
        watch: {
			src: function (newUrl, oldUrl) {
				if (newUrl.split('?')[0] === oldUrl.split('?')[0]) {
					// Only the search has changed. No need to reload
					this.currentUrl = newUrl;
				} else {
					this.loading = true; // hides the current view
					this.currentUrl = newUrl;
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

    Vue.component('validator', {
        props: ['invalid', 'errors'],
        template: '<div v-if="invalid" class="validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
    });

})();
(function () {

	const control = {
		props: {
			label: String,
			required: Boolean,
            align: { type: String, default: 'left' }
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
                return root._validate_(this.item, this.path, this.item[this.prop]);
            },
            cssClass() {
				let cls = 'control-group' + (this.invalid ? ' invalid' : ' valid');
				if (this.required)
					cls += ' required';
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
(function() {


    let textBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model.lazy="item[prop]" :class="inputClass"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
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
            item: Object,
            prop: String
		}		
    });
})();
/*20170902-7023*/
/*components/datagrid.js*/
(function () {

 /*TODO:
2. size (compact, large ??)
5. grouping (multiply)
6. select (выбирается правильно, но теряет фокус при выборе редактора)
7. Доделать checked
8. pager - (client/server)
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

    const utils = require('utils');

    const dataGridTemplate = `
<div class="data-grid-container">
    <slot name="toolbar" />
    <table :class="cssClass">
        <colgroup>
            <col v-if="isMarkCell"/>
            <col v-bind:class="columnClass(col)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
        </colgroup>
        <thead>
            <tr>
                <th v-if="isMarkCell" class="marker"></th>
                <slot></slot>
            </tr>
        </thead>
        <tbody>
            <data-grid-row :cols="columns" v-for="(item, rowIndex) in $items" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
        </tbody>
		<slot name="footer"></slot>
    </table>
	<slot name="pager"></slot>
</div>
`;

    const dataGridRowTemplate = `
<tr @mouseup.stop.prevent="row.$select()" :class="rowClass" v-on:dblclick.prevent="doDblClick">
    <td v-if="isMarkCell" class="marker">
        <div :class="markClass"></div>
    </td>
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
            icon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined },
            mark: String,
            width: String
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
            }
            /* simple content */
            if (col.content === '$index')
                return h(tag, cellProps, [ix + 1]);

            // Warning: toString() is required.
			// TODO: calc chain f.i. Document.Rows
			let content = utils.toString(row[col.content]);
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
            mark: String
        },
        computed: {
            active() {
                return this.row === this.$parent.selected;
                //return this === this.$parent.rowSelected;
            },
            rowClass() {
                let cssClass = '';
                if (this.active)
                    cssClass += 'active';
                if (this.isMarkRow && this.mark)
                    cssClass += ' ' + this.row[this.mark];
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
			dblclick: Function
		},
		template: dataGridTemplate,
		components: {
			'data-grid-row': dataGridRow
		},
		data() {
			return {
				columns: [],
				clientItems: null,
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
				return this.itemsSource.$selected;
			},
			isGridSortable() {
				return !!this.sort;
			},
			isLocal() {
				return !this.$parent.sortDir;
			}
		},
		watch: {
			localSort: {
				handler() {
					this.doSortLocally();
				},
				deep: true
			}
		},
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            },
            columnClass(column) {
                if (utils.isDefined(column.dir))
                    return {
                        sorted: !!column.dir
                    };
                else
                    return undefined;
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
            doSortLocally(order)
			{
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
                this.clientItems = arr;
            }
        }
    });

})();
/*20170823-7018*/
/*components/pager.js*/

Vue.component('a2-pager', {
	template: `
<div class="pager">
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}}</code>
	<a href @click.stop.prevent="source.first">first</a>
	<a href @click.stop.prevent="source.prev">prev</a>
	<a href @click.stop.prevent="source.next">next</a>
</div>
`,
	props: {
		source: Object
	}
});


/* 20170816-7014 */
/*components/treeview.js*/

(function () {

    /*TODO:
        3. folder/item
    */
    Vue.component('tree-item', {
        template: `
<li @click.stop.prevent="doClick(item)" :title="item[title]"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
    <div class="overlay">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-else class="toggle"></span>
        <i v-if="hasIcon" :class="iconClass"></i>
        <a v-if="hasLink" :href="dataHref" v-text="item[label]" :class="{'no-wrap':!wrapLabel }"></a>
        <span v-else v-text="item[label]" :class="{'tv-folder':true, 'no-wrap':!wrapLabel}"></span>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[subitems]" 
            :key="index" :item="itm" :click="click" :get-href="getHref" :is-active="isActive" :has-icon="hasIcon" :folder-select="folderSelect"
            :label="label" :wrap-label="wrapLabel" :icon="icon" :subitems="subitems" :title="title"></tree-item>
    </ul>   
</li>
`,
        props: {
            item: Object,
            /* attrs */
            hasIcon: Boolean,
            wrapLabel: Boolean,
            folderSelect: Boolean,
            /* prop names */
            label: String,
            icon: String,
            title: String,
            subitems: String,
            /* callbacks */
            click: Function,
            isActive: Function,
            getHref: Function
        },
        data() {
            return {
                open: true
            };
        },
        methods: {
            doClick(item) {
                if (this.isFolder && !this.folderSelect)
                    this.toggle();
                else
                    this.click(item);
            },
            toggle() {
                if (!this.isFolder)
                    return;
                this.open = !this.open;
            }
        },
        computed: {
            isFolder: function () {
                let ch = this.item[this.subitems];
                return ch && ch.length;
            },
            hasLink() {
                return !this.isFolder || this.folderSelect;
            },
            isExpanded: function () {
                return this.isFolder && this.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.open;
            },
            isItemSelected: function () {
                return this.isActive(this.item);
            },
            iconClass: function () {
                return this.icon ? "ico ico-" + (this.item[this.icon] || 'empty') : '';
            },
            dataHref() {
                return this.getHref ? this.getHref(this.item) : '';
            }
        }
    });

})();

/*20170902-7023*/
/*components/collectionview.js*/

/*
TODO:
7. доделать фильтры
*/


Vue.component('collection-view', {
	store: component('std:store'),
	template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" 
		:filter="filter">
	</slot>
	<code>
		collection-view: source-count={{sourceCount}}, page-size={{pageSize}}
		offset:{{offset}}, pages={{pages}}, dir={{dir}}, order={{order}}, filter={{filter}}
	</code>
</div>
`,
	props: {
		ItemsSource: Array,
		pageSize: Number,
		initialFilter: Object,
		runAt: String
	},
	data() {
		// TODO: Initial sorting, filters
		return {
			filter: this.initialFilter,
			filteredCount: 0,
			localQuery: {
				offset: 0,
				dir: 'asc',
				order: ''
			}
		};
	},
	watch: {
		dir() {
			// можно отслеживать вычисляемые свойства
			//alert('dir changed');
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
			// filter (TODO: // правильная фильтрация)
			if (this.filter && this.filter.Text)
				arr = arr.filter((v) => v.Id.toString().indexOf(this.filter.Text) !== -1);
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
			console.warn('get paged source:' + (performance.now() - s).toFixed(2) + ' ms');
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
				this.$store.commit('setquery', { offset: offset});
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
		sortDir(order) {
			return order === this.order ? this.dir : undefined;
		},
		doSort(order) {
			let nq = { dir: this.dir, order: this.order};
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
		}
	},
	created() {
		this.$on('sort', this.doSort);
	}
});

/* 20170816-7014 */
/*components/tab.js*/

/*
TODO:

2. isActive with location hash
3. css
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
            <li :class="{active: tab.isActive}" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click.stop.prevent="select(tab)">
                <a href>
                    <i v-if="tab.hasIcon" :class="tab.iconCss" ></i>
                    <span v-text="tab.header"></span>
                </a>
            </li>
        </ul>
        <div class="tab-content">
            <slot />
        </div>
    </template>
    <template v-else>
        <ul class="tab-header">
            <li :class="{active: isActiveTab(item)}" v-for="(item, tabIndex) in items" :key="tabIndex" @click.stop.prevent="select(item)">
				<slot name="header" :item="item" :index="tabIndex">
					<a href>
						TODO: default tab header
						<span v-text="tabHeader(item, tabIndex)"></span> 
						<span>{{isActiveTab(item)}}</span>
					</a>
				</slot>
            </li>
        </ul>
        <div class="tab-content">
            <div class="tab-item" v-if="isActiveTab(item)" v-for="(item, tabIndex) in items" :key="tabIndex">
                <slot name="items" :item="item" :index="tabIndex" />
            </div>
        </div>
    </template>
</div>
`;

	//<span>{{ item }}</span>

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
			icon: String
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
			}
		},
		watch: {
			'items.length'(newVal, oldVal) {
				let tabs = this.items;
				if (newVal < oldVal) {
					// tab has been removed
					if (this._index >= tabs.length)
						this._index = tabs.length - 1;
					this.select(tabs[this._index]);
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
                return item == this.activeTab;
            },
            tabHeader(item, index) {
                return item[this.header] + ':' + index;
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

/*20170828-7021*/
/* components/modal.js */

(function () {


/**
TODO: may be icon for confirm ????
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-body" :src="dialog.url"></include>
    <div v-else class="modal-body">
        <div class="modal-header"><span v-text="title"></span><button class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
        <div class="modal-body">
            <p v-text="dialog.message"></p>            
        </div>
        <div class="modal-footer">
            <button class="btn" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"></button>
        </div>
    </div>
</div>        
`;
    const eventBus = require('std:eventBus');

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
            title: function () {
                return this.dialog.title || 'Error';
            }, 
            buttons: function () {
                console.warn(this.dialog.style);
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                else if (this.dialog.style === 'alert')
                    return [{ text: 'OK', result: false }];
                return [
                    { text: 'OK', result: true },
                    { text: 'Cancel', result: false }
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
/*20170902-7023*/
/* directives/dropdown.js */

Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		//console.warn('bind drop down');

		const popup = require('std:popup');
		let me = this;

		el._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');

		popup.registerPopup(el);

		el._close = function (ev) {
			el.classList.remove('show');
		};

		el.addEventListener('click', function (event) {
			if (event.target === el._btn) {
				event.preventDefault();
				let isVisible = el.classList.contains('show');
				if (isVisible)
					el.classList.remove('show');
				else {
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


/*20170109-7022*/
/* directives/focus.js */

Vue.directive('focus', {
	bind(el, binding, vnode) {

		el.addEventListener("focus", function (event) {
			event.target.parentElement.classList.add('focus');
		});

		el.addEventListener("blur", function (event) {
			event.target.parentElement.classList.remove('focus');
		});
	}
});


/*20170904-7025*/
/*controllers/base.js*/
(function () {

    const eventBus = require('std:eventBus');
    const utils = require('utils');
    const dataservice = require('std:dataservice');
    const route = require('route');
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
		/*
		watch: {
            $baseUrl2: function (newUrl) {
                if (!this.$data.__init__)
                    return;
                if (this.inDialog)
                    this.$data._query_ = route.queryFromUrl(newUrl);
                else
                    this.$data._query = route.query;
                Vue.nextTick(() => { this.$data.__init__ = false; });
            },
            "$query2": {
                handler: function (newVal, oldVal) {
                    //console.warn('query watched');
                    if (this.$data.__init__)
                        return;
                    if (this.inDialog) {
                        this.$data.__baseUrl__ = route.replaceUrlQuery(this.$baseUrl, newVal);
                        this.$reload();
                    } else {
                        route.query = newVal;
                        this.$searchChange();
                    }
                },
                deep: true
            }
        },
		*/
		methods: {
			$exec(cmd, ...args) {
				let root = this.$data;
				root._exec_(cmd, ...args);
			},

			$save() {
				var self = this;
				var url = '/_data/save';
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ baseUrl: self.$baseUrl, data: self.$data });
					dataservice.post(url, jsonData).then(function (data) {
						self.$data.$merge(data);
						self.$data.$setDirty(false);
						// data is full model. Resolve requires single element
						let dataToResolve;
						for (let p in data) {
							dataToResolve = data[p];
						}
						resolve(dataToResolve); // single element (raw data)
					}).catch(function (msg) {
						self.$alertUi(msg);
					});
				});
			},

			$invoke(cmd, base, data) {
				alert('TODO: call invoke command');
				let self = this;
				let url = '/_data/invoke';
				let baseUrl = base || self.$baseUrl;
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl });
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
				var self = this;
				let url = '/_data/reload';
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
				let urlToNavigate = urltools.combine(url, data);
				this.$store.commit('navigate', { url: urlToNavigate });
			},

			$openSelected(url, arr) {
				// TODO: переделать
				let sel = arr.$selected;
				if (!sel)
					return;
				// TODO: $id property
				this.$navigate(url, sel.Id);
			},

			$hasSelected(arr) {
				return !!arr.$selected;
			},

			$confirm(prms) {
				if (utils.isString(prms))
					prms = { message: prms };
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
					let dataToSent = data;
					if (command === 'add') {
						if (!utils.isArray(data)) {
							console.error('$dialog.add. The argument is not an array');
						}
						dataToSent = null;
					}
					let dlgData = { promise: null, data: dataToSent, query: query };
					eventBus.$emit('modal', url, dlgData);
					if (command === 'edit' || command === 'browse') {
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
				let newUrl = route.replaceUrlSearch(this.$baseUrl);
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

			$format(value, format) {
				if (!format)
					return value;
				if (format.indexOf('{0}') !== -1)
					return format.replace('{0}', value);
				// TODO: format dates, numbers, etc
				return value;
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

			if (!this.inDialog) {
				this.$data._query_ = route.query;
				///console.dir(this);
			}
			//alert(this.$data._needValidate_);
			//this.$data._needValidate_ = true;
			/*
			store.$on('queryChange', function (url) {
				alert('query change');
                //this.$data._query_ = val;
            });
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
			log.time('update time: ', this.__updateStartTime);
		}
    });
    
	app.components['baseController'] = base;
})();
/*20170903-7024*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const popup = require('std:popup');
	const urlTools = require('std:url');

	const UNKNOWN_TITLE = 'unknown title';

	function findMenu(menu, func) {
		if (!menu)
			return null;
		for (let i = 0; i < menu.length; i++) {
			let itm = menu[i];
			if (func(itm))
				return itm;
			if (itm.menu) {
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
			am = findMenu(menu, (mi) => mi.url && !mi.menu);
			if (am) {
				opts.title = am.title;
				return urlTools.combine(url, am.url);
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
        <a :href="itemHref(item)" v-text="item.title" @click.stop.prevent="navigate(item)"></a>
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
				let storageKey = "menu:" + item.url;
				let savedUrl = localStorage.getItem("menu:" + item.url);
				let opts = { title: null, seg2: savedUrl };
				let url = makeMenuUrl(this.menu, item.url, opts);
				this.$store.commit('navigate', { url: url, title:  opts.title});
			}
		}
	};


	const a2SideBar = {
		// TODO: разные варианты меню
		template: `
<div :class="cssClass">
    <a href role="button" class="ico collapse-handle" @click.stop.prevent="toggle"></a>
    <div class="side-bar-body" v-if="bodyIsVisible">
        <ul class="tree-view">
            <tree-item v-for="(itm, index) in sideMenu" :folder-select="!!itm.url"
                :item="itm" :key="index" label="title" icon="icon" title="title"
                :subitems="'menu'" :click="navigate" :get-href="itemHref" :is-active="isActive" :has-icon="true" :wrap-label="true">
            </tree-item>
        </ul>
    </div>
    <div v-else class="side-bar-title" @click.stop.prevent="toggle">
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
			navigate(item) {
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.url, item.url);
					if (item.url.indexOf('/') === -1) {
						// save only simple path
						localStorage.setItem('menu:' + top.url, item.url);
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
				let url = store.getters.url;
				let len = store.getters.len;
				if (len === 2 || len === 3)
					url += '/index/0';
				return urlTools.combine('/_page', url) + store.getters.search;
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
    <div class="modal-stack" v-if="hasModals" @keyup.esc='closeModal'>
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
			let newUrl = makeMenuUrl(this.menu, window.location.pathname, opts);
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
				if (prms && prms.data && prms.data.Id) {
					// TODO: get correct ID
					id = prms.data.Id;
				}
				let url = urlTools.combine('/_dialog', modal, id);
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
			processing() { return this.requestsCount > 0; }
		},
        methods: {
            about() {
				// TODO: localization
				this.$store.commit('navigate', { url: '/app/about', title: 'Про програму' }); // TODO 
            },
			root() {
				let opts = { title: null };
				this.$store.commit('navigate', { url: makeMenuUrl(this.menu, '/', opts), title: opts.title });
            }
		},
		created() {
			let me = this;

			me.__dataStack__ = [];
	
			window.addEventListener('popstate', function (event, a, b) {
				if (me.__dataStack__.length > 0) {
					let comp = me.__dataStack__[0];
					let oldUrl = event.state;
					//console.warn('pop state: ' + oldUrl);
					if (!comp.$saveModified()) {
						// disable navigate
						oldUrl = comp.__baseUrl__.replace('/_page', '');
						//console.warn('return url: ' + oldUrl);
						window.history.pushState(oldUrl, null, oldUrl);
						return;
					}
				}

				me.$store.commit('popstate');
			});

			popup.startService();

			eventBus.$on('beginRequest', () => me.requestsCount += 1);
			eventBus.$on('endRequest', () => me.requestsCount -= 1);
		}
    });

    app.components['std:shellController'] = shell;
})();