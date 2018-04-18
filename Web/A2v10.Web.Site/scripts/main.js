// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180226-7120
// app.js

"use strict";

(function () {

	window.app = {
		modules: {},
		components: {}
	};

	window.require = require;
	window.component = component;

	let rootElem = document.querySelector('meta[name=rootUrl]');
	window.$$rootUrl = rootElem ? rootElem.content || '' : '';

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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180110-7088
// services/datamodel.js


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




// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180417-7159
// services/utils.js

app.modules['std:utils'] = function () {

	const locale = window.$$locale;
	const dateLocale = locale.$Locale;
	const _2digit = '2-digit';

	const dateOptsDate = { timeZone: 'UTC', year: 'numeric', month: _2digit, day: _2digit };
	const dateOptsTime = { timeZone: 'UTC', hour: _2digit, minute: _2digit };

	const formatDate = new Intl.DateTimeFormat(dateLocale, dateOptsDate).format;
	const formatTime = new Intl.DateTimeFormat(dateLocale, dateOptsTime).format;

	const currencyFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, useGrouping: true }).format;
	const numberFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, useGrouping: true }).format;

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
		defaultValue: defaultValue,
		notBlank: notBlank,
		toJson: toJson,
		fromJson: JSON.parse,
		isPrimitiveCtor: isPrimitiveCtor,
		isDateCtor: isDateCtor,
		isEmptyObject: isEmptyObject,
		defineProperty: defProperty,
		eval: evaluate,
		format: format,
		toNumber: toNumber,
		parse: parse,
		getStringId: getStringId,
		date: {
			today: dateToday,
			zero: dateZero,
			parse: dateParse,
			equal: dateEqual,
			isZero: dateIsZero,
			formatDate: formatDate,
			add: dateAdd,
			compare: dateCompare,
			endOfMonth: endOfMonth
		},
		text: {
			contains: textContains,
			containsText: textContainsText
		},
		debounce: debounce
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
				break;
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

	function defaultValue(type) {
		switch (type) {
			case undefined: return undefined;
			case Number: return 0;
			case String: return '';
			case Boolean: return false;
			case Date: return dateZero();
			case Object: return null;
			default:
				if (typeof type === 'function')
					return null; // complex object
				throw new Error(`There is no default value for type ${type}`);
		}
	}

	function evaluate(obj, path, dataType, hideZeros, skipFormat) {
		if (!path)
			return '';
		let ps = (path || '').split('.');
		let r = obj;
		for (let i = 0; i < ps.length; i++) {
			let pi = ps[i];
			if (!(pi in r))
				throw new Error(`Property '${pi}' not found in ${r.constructor.name} object`);
			r = r[ps[i]];
		}
		if (skipFormat) return r;
		if (isDate(r))
			return format(r, dataType, hideZeros);
		else if (isObject(r))
			return toJson(r);
		else if (format)
			return format(r, dataType, hideZeros);
		return r;
	}

	function pad2(num) {
		if (num < 10)
			return '0' + num;
		return '' + num;
	}

	function parse(obj, dataType) {
		switch (dataType) {
			case 'Currency':
			case 'Number':
				return toNumber(obj);
			case 'Date':
				return dateParse(obj);
		}
		return obj;
	}

	function format(obj, dataType, hideZeros) {
		if (!dataType)
			return obj;
		if (!isDefined(obj))
			return '';
		switch (dataType) {
			case "DateTime":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatDate(obj) + ' ' + formatTime(obj);
			case "Date":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatDate(obj);
			case "DateUrl":
				if (dateIsZero(obj))
					return '';
				return '' + obj.getFullYear() + pad2(obj.getMonth() + 1) + pad2(obj.getDate());
			case "Time":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatTime(obj);
			case "Currency":
				if (!isNumber(obj)) {
					console.error(`Invalid Currency for utils.format (${obj})`);
					return obj;
				}
				if (hideZeros && obj === 0)
					return '';
				return currencyFormat(obj);
			case "Number":
				if (!isNumber(obj)) {
					console.error(`Invalid Number for utils.format (${obj})`);
					return obj;
				}
				if (hideZeros && obj === 0)
					return '';
				return numberFormat(obj);
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
		if (seg.length === 1) {
			seg.push('' + (today.getMonth() + 1));
			seg.push('' + today.getFullYear());
		} else if (seg.length === 2) {
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

	function endOfMonth(dt) {
		return new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
	}

	function dateAdd(dt, nm, unit) {
		if (!isDate(dt))
			return null;
		var du = 0;
		switch (unit) {
			case 'year':
				// TODO: check getTimezone
				return new Date(dt.getFullYear() + nm, dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
			case 'month':
				// save day of month
				let newMonth = dt.getMonth() + nm;
				let day = dt.getDate();
				var ldm = new Date(dt.getFullYear(), newMonth + 1, 0).getDate();
				if (day > ldm)
					day = ldm;
				var dtx = new Date(dt.getFullYear(), newMonth, day);
				return dtx;
				break;
			case 'day':
				du = 1000 * 60 * 60 * 24;
				break;
			case 'hour':
				du = 1000 * 60 * 60;
				break;
			case 'minute':
				du = 1000 * 60;
				break;
			case 'second':
				du = 1000;
				break;
			default:
				throw new Error('Invalid unit value for utils.date.add');
		}
		return new Date(dt.getTime() + nm * du);
	}

	function dateCompare(d1, d2) {
		if (!isDate(d1) || !isDate(d2)) return null;
		let t1 = d1.getTime();
		let t2 = d2.getTime();
		return t1 - t2;
	}


	function textContains(text, probe) {
		if (!probe)
			return true;
		if (!text)
			return false;
		return (text || '').toString().toLowerCase().indexOf(probe.toLowerCase()) !== -1;
	}

	function textContainsText(obj, props, probe) {
		if (!probe) return true;
		if (!obj)
			return false;
		for (let v of props.split(',')) {
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

	function debounce(fn, timeout) {
		let timerId = null;
		return function () {
			clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn.call();
			}, timeout);
		};
	}

};



// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180411-7155*/
/* services/url.js */

app.modules['std:url'] = function () {

	const utils = require('std:utils');

	return {
		combine,
		makeQueryString,
		parseQueryString,
		normalizeRoot,
		idChangedOnly,
		makeBaseUrl,
		parseUrlAndQuery,
		replaceUrlQuery,
		createUrlForNavigate,
		firstUrl: '',
		encodeUrl: encodeURIComponent,
		helpHref
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

	function normalizeRoot(path) {
		let root = window.$$rootUrl;
		if (root && path.startsWith(root))
			return path.substring(root.length);
		return path;
	}

	function combine(...args) {
		return '/' + args.map(normalize).filter(x => !!x).join('/');
	}

	function toUrl(obj) {
		if (!utils.isDefined(obj)) return '';
		if (utils.isDate(obj)) {
			return utils.format(obj, "DateUrl");
		} else if (utils.isObjectExact(obj)) {
			if (obj.constructor.name === 'Object') {
				if (!utils.isDefined(obj.Id))
					console.error('Id is not defined for Filter object');
				return '' + (obj.Id || '');
			} else if (!utils.isDefined(obj.$id)) {
				console.error(`$id is not defined for ${obj.constructor.name}`);
			}
			return '' + (obj.$id || '0');
		}
		return '' + obj;
	}

	function isEmptyForUrl(obj) {
		if (!obj) return true;
		let objUrl = toUrl(obj);
		if (!objUrl) return true;
		if (objUrl === '0') return true;
		return false;
	}

	function makeQueryString(obj) {
		if (!obj) return '';
		if (!utils.isObjectExact(obj)) return '';

		let esc = encodeURIComponent;

		// skip special (starts with '_' or '$')
		let query = Object.keys(obj)
			.filter(k => !k.startsWith('_') && !k.startsWith('$') && !isEmptyForUrl(obj[k]))
			.map(k => esc(k) + '=' + esc(toUrl(obj[k])))
			.join('&');
		return query ? '?' + query : '';
	}

	function parseQueryString(str) {
		var obj = {};
		str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
			obj[decodeURIComponent(key)] = '' + decodeURIComponent(value);
		});
		return obj;
	}

	function idChangedOnly(newUrl, oldUrl) {
		let n1 = (newUrl || '').split('?')[0];
		let o1 = (oldUrl || '').split('?')[0];
		let ns = n1.split('/');
		let os = o1.split('/');
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

	function parseUrlAndQuery(url, querySrc) {
		let query = {};
		for (let p in querySrc)
			query[p] = toUrl(querySrc[p]); // all values are string
		let rv = { url: url, query: query };
		if (url.indexOf('?') !== -1) {
			let a = url.split('?');
			rv.url = a[0];
			// first from url then from query
			rv.query = Object.assign({}, parseQueryString(a[1]), query);
		}
		return rv;
	}
	function replaceUrlQuery(url, query) {
		if (!url)
			url = window.location.pathname + window.location.search;
		let pu = parseUrlAndQuery(url, query);
		return pu.url + makeQueryString(pu.query);
	}

	function createUrlForNavigate(url, data) {
		let urlId = data || 'new';
		let qs = '';
		if (utils.isDefined(urlId.$id))
			urlId = urlId.$id;
		else if (utils.isObjectExact(urlId)) {
			urlId = data.Id;
			delete data['Id'];
			qs = makeQueryString(data);
			if (!utils.isDefined(urlId))
				urlId = 'new';
		}
		if (url.endsWith('new') && urlId === 'new')
			urlId = '';
		return combine(url, urlId) + qs;
	}

	function helpHref(path) {
		let helpUrlElem = document.querySelector('meta[name=helpUrl]');
		if (!helpUrlElem || !helpUrlElem.content)
			console.error('help url is not specified');
		return helpUrlElem.content + (path || '');
	}

	function replaceId(url, newId) {
		alert('todo::replaceId');
	}
};






// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180319-7135
/* services/http.js */

app.modules['std:http'] = function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	let fc = null;

	return {
		get: get,
		post: post,
		load: load,
		upload: upload
	};

	function doRequest(method, url, data, raw) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					if (raw) {
						resolve(xhr.response);
						return;
					}
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
			if (raw)
				xhr.responseType = "blob";
			eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function get(url) {
		return doRequest('GET', url);
	}

	function post(url, data, raw) {
		return doRequest('POST', url, data, raw);
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
		let fc = selector ? selector.firstElementChild : null;
		if (fc && fc.__vue__) {
			fc.__vue__.$destroy();
		};
		return new Promise(function (resolve, reject) {
			doRequest('GET', url)
				.then(function (html) {
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
					if (selector.firstElementChild && selector.firstElementChild.__vue__) {
						let ve = selector.firstElementChild.__vue__;
						ve.$data.__baseUrl__ = urlTools.normalizeRoot(url);
						// save initial search
						ve.$data.__baseQuery__ = urlTools.parseUrlAndQuery(url).query;
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





// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180227-7121
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

	function normalizedRoute() {
		let path = window.location.pathname;
		return urlTools.normalizeRoot(path);
	}

	const store = new Vuex.Store({
		strict: true,
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
			navigate: function (state, to) { // to: {url, query, title}
				let root = window.$$rootUrl;
				let oldUrl = root + state.route + urlTools.makeQueryString(state.query);
				state.route = to.url;
				state.query = Object.assign({}, to.query);
				let newUrl = root + state.route + urlTools.makeQueryString(to.query);
				let h = window.history;
				setTitle(to);
				// push/pop state feature. Replace the current state and push new one.
				h.replaceState(oldUrl, null, oldUrl);
				h.pushState(oldUrl, null, newUrl);
			},
			query: function (state, query) {
				// changes all query
				let root = window.$$rootUrl;
				state.query = Object.assign({}, query);
				let newUrl = root + state.route + urlTools.makeQueryString(state.query);
				//console.warn('set query: ' + newUrl);
				window.history.replaceState(null, null, newUrl);
			},
			setquery: function (state, query) {
				// TODO: replaceUrl: boolean
				// changes some fields or query
				let root = window.$$rootUrl;
				let oldUrl = root + this.getters.baseUrl;
				state.query = Object.assign({}, state.query, query);
				let newUrl = root + this.getters.baseUrl;
				if (newUrl === oldUrl) return;
				window.history.replaceState(null, null, newUrl);
				eventBus.$emit('queryChange', state.query);
			},
			popstate: function (state) {
				state.route = normalizedRoute();
				state.query = urlTools.parseQueryString(window.location.search);
				if (state.route in titleStore) {
					document.title = titleStore[state.route];
				}
			},
			setstate: function (state, to) { // to: {url, title}
				window.history.replaceState(null, null, window.$$rootUrl + to.url);
				state.route = normalizedRoute();
				state.query = urlTools.parseQueryString(window.location.search);
				setTitle(to);
			},
			setnewid: function (state, to) {
				let root = window.$$rootUrl;
				let oldRoute = state.route;
				let newRoute = oldRoute.replace('/new', '/' + to.id);
				state.route = newRoute;
				let newUrl = root + newRoute + urlTools.makeQueryString(state.query);
				window.history.replaceState(null, null, newUrl);
			},
			close: function (state) {

				function navigateBack() {
					// TODO: ??? 
					window.close();
					/*
					let url = makeBackUrl(state.route);
					if (url === state.route) {
						let firstUrl = urlTools.firstUrl;
						store.commit('navigate', { url: firstUrl.url, title: firstUrl.title });
					} else {
						store.commit('navigate', { url: url });
					}
					*/
				}

				if (window.history.length > 1) {
					let oldUrl = window.location.pathname;
					window.history.back();
					// it is done?
					setTimeout(() => {
						if (window.location.pathname === oldUrl) {
							navigateBack();
						}
					}, 300);
				} else
					navigateBack();
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
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
		traceEnabled: function () {
			if (!_sessionLoaded)
				loadSession();
			return _traceEnabled;
		},
		enableTrace: function (val) {
			if (!window.$$debug) return;
			_traceEnabled = val;
			console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
			try {
				window.sessionStorage.setItem(traceEnabledKey, val);
			}
			catch (err) {
				// do nothing
			}
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/*validators.js*/

app.modules['std:validators'] = function () {

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
			if (utils.isFunction(rule.applyIf)) {
				if (!rule.applyIf(item, val)) return;
			}
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



// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180417-7159
// services/datamodel.js

(function () {

	"use strict";

    /* TODO:
    1. changing event
    */

	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
	const ERRORS = '_errors_';

	const ERR_STR = '#err#';

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
		if (!utils.isDefined(val))
			val = utils.defaultValue(type);
		if (type === Number) {
			return utils.toNumber(val);
		}
		return val;
	}

	function defSource(trg, source, prop, parent) {
		let propCtor = trg._meta_.props[prop];
		if (propCtor.type) propCtor = propCtor.type;
		let pathdot = trg._path_ ? trg._path_ + '.' : '';
		let shadow = trg._src_;
		source = source || {};
		if (utils.isObjectExact(propCtor)) {
			//console.warn(`${prop}:${propCtor.len}`);
			if ("type" in propCtor)
				propCtor = propCtor.type;
			else
				throw new Error(`Invalid _meta_ for '${prop}'`);
		}
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
				let eventWasFired = false;
				//TODO: emit and handle changing event
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				val = ensureType(ctor, val);
				if (val === this._src_[prop])
					return;
				if (this._src_[prop] && this._src_[prop].$set) {
					// object
					this._src_[prop].$set(val);
					eventWasFired = true; // already fired
				} else {
					this._src_[prop] = val;
				}
				if (!prop.startsWith('$$')) // skip special properties
					this._root_.$setDirty(true);
				if (this._lockEvents_) return; // events locked
				if (eventWasFired) return; // was fired
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
		elem._uiprops_ = {};

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

		if (path && path.endsWith(']'))
			elem.$selected = false;

		defPropertyGet(elem, '$valid', function () {
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

		if (elem._meta_.$group === true) {
			defPropertyGet(elem, "$groupName", function () {
				if (!utils.isDefined(this.$level))
					return ERR_STR;
				// this.constructor.name == objectType;
				const mi = this._root_.__modelInfo.Levels;
				if (mi) {
					const levs = mi[this.constructor.name];
					if (levs && this.$level <= levs.length)
						return this[levs[this.$level - 1]];
				}
				console.error('invalid data for $groupName');
				return ERR_STR;
			});
		}

		let constructEvent = ctorname + '.construct';
		let _lastCaller = null;
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
			elem._setModelInfo_ = setRootModelInfo;
			elem._enableValidate_ = true;
			elem._needValidate_ = false;
			elem._modelLoad_ = (caller) => {
				_lastCaller = caller;
				elem._fireLoad_();
				__initialized__ = true;
			};
			elem._fireLoad_ = () => {
				elem.$emit('Model.load', elem, _lastCaller);
				elem._root_.$setDirty(false);
			};
			defHiddenGet(elem, '$readOnly', isReadOnly);
			elem._seal_ = seal;
		}
		if (startTime) {
			log.time('create root time:', startTime, false);
		}
		return elem;
	}

	function seal(elem) {
		Object.seal(elem);
		for (let p in elem._meta_.props) {
			let ctor = elem._meta_.props[p];
			if (ctor.type) ctor = ctor.type;
			if (utils.isPrimitiveCtor(ctor)) continue;
			let val = elem[p];
			if (utils.isArray(val)) {
				val.forEach(itm => seal(itm));
			} else if (utils.isObjectExact(val)) {
				seal(val);
			}
		}
	}

	function setRootModelInfo(item, data) {
		if (!data.$ModelInfo) return;
		let elem = item;
		for (let p in data.$ModelInfo) {
			if (!elem) elem = this[p];
			elem.$ModelInfo = data.$ModelInfo[p];
			return; // first element only
		}
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
		let arr = new Array(length || 0);
		addArrayProps(arr);
		return arr;
	}

	//_BaseArray.prototype = Array.prototype;

	function addArrayProps(arr) {

		defineCommonProps(arr);

		arr.$new = function (src) {
			let newElem = new this._elem_(src || null, this._path_ + '[]', this);
			newElem.$checked = false;
			return newElem;
		};

		defPropertyGet(arr, "$selected", function () {
			for (let x of this.$elements) {
				if (x.$selected) {
					return x;
				}
			}
			return undefined;
		});

		defPropertyGet(arr, "$elements", function () {
			function* elems(arr) {
				for (let i = 0; i < arr.length; i++) {
					let val = arr[i];
					yield val;
					if (val.$items) {
						yield* elems(val.$items);
					}
				}
			}
			return elems(this);
		});

		defPropertyGet(arr, "Count", function () {
			return this.length;
		});

		defPropertyGet(arr, "$isEmpty", function () {
			return !this.length;
		});

		defPropertyGet(arr, "$checked", function () {
			return this.filter((el) => el.$checked);
		});

		defPropertyGet(arr, "$hasSelected", function () {
			return !!this.$selected;
		});

		arr.Selected = function (propName) {
			let sel = this.$selected;
			return sel ? sel[propName] : null;
		};

		arr.$isLazy = function () {
			const meta = this.$parent._meta_;
			if (!meta.$lazy) return false;
			let propIx = this._path_.lastIndexOf('.');
			let prop = this._path_.substring(propIx + 1);
			return meta.$lazy.indexOf(prop) !== -1;
		};

		arr.$load = function () {
			if (!this.$isLazy()) return;
			platform.defer(() => this.$loadLazy());
		};

		arr.$loadLazy = function () {
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
		};

		arr.$append = function (src) {
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
				if ('$RowCount' in that) that.$RowCount += 1;
				let eventName = that._path_ + '[].add';
				that._root_.$setDirty(true);
				that._root_.$emit(eventName, that /*array*/, ne /*elem*/, len - 1 /*index*/);
				if (select) {
					ne.$select();
					emitSelect(that, ne);
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
					ra.push(lastElem);
				});
				if (lastElem) {
					// last added element
					lastElem.$select();
				}
				return ra;
			} else
				return append(src, true);

		};

		arr.$empty = function () {
			if (this.$root.isReadOnly)
				return;
			this.splice(0, this.length);
			if ('$RowCount' in this) this.$RowCount = 0;
			return this;
		};

		arr.$clearSelected = function () {
			let sel = this.$selected;
			if (!sel) return; // already null
			sel.$selected = false;
			emitSelect(this, null);
		};

		arr.$remove = function (item) {
			if (this.$root.isReadOnly)
				return;
			if (!item)
				return;
			let index = this.indexOf(item);
			if (index === -1)
				return;
			this.splice(index, 1);
			if ('$RowCount' in this) this.$RowCount -= 1;
			// EVENT
			let eventName = this._path_ + '[].remove';
			this._root_.$setDirty(true);
			this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);
			if (!this.length) return;
			if (index >= this.length)
				index -= 1;
			if (this.length > index) {
				this[index].$select();
			}
			// renumber rows
			if ('$rowNo' in item._meta_) {
				let rowNoProp = item._meta_.$rowNo;
				for (let i = 0; i < this.length; i++) {
					this[i][rowNoProp] = i + 1; // 1-based
				}
			}
		};

		arr.$copy = function (src) {
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
	}

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
		obj.prototype.$maxLength = getMaxLength;

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

		defHiddenGet(obj.prototype, "$id__", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				return undefined;
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

	function emitSelect(arr, item) {
		let selectEvent = arr._path_ + '[].select';
		let er = arr._root_.$emit(selectEvent, arr/*array*/, item);
	}

	function defArrayItem(elem) {

		elem.prototype.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};
		elem.prototype.$select = function (root) {
			let arr = root || this._parent_;
			let sel = arr.$selected;
			if (sel === this) return;
			if (sel) sel.$selected = false;
			this.$selected = true;
			emitSelect(arr, this);
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

	function canExecuteCommand(cmd, arg, opts) {
		const tml = this.$template;
		if (!tml) return false;
		if (!tml.commands) return false;
		const cmdf = tml.commands[cmd];
		if (!cmdf) return false;

		const optsCheckValid = opts && opts.validRequired === true;
		const optsCheckRO = opts && opts.checkReadOnly === true;

		if (cmdf.checkReadOnly === true || optsCheckRO) {
			if (this.$root.$readOnly)
				return false;
		}
		if (cmdf.validRequired === true || optsCheckValid) {
			if (!this.$root.$valid)
				return false;
		}
		if (utils.isFunction(cmdf.canExec)) {
			return cmdf.canExec.call(this, arg);
		} else if (utils.isBoolean(cmdf.canExec)) {
			return cmdf.canExec; // for debugging purposes
		} else if (utils.isDefined(cmdf.canExec)) {
			console.error(`${cmd}.canExec should be a function`);
			return false;
		}
		return true;
	}

	function executeCommand(cmd, arg, confirm, opts) {
		try {
			this._root_._enableValidate_ = false;
			let vm = this.$vm;
			const tml = this.$template;
			if (!tml) return;
			if (!tml.commands) return;
			let cmdf = tml.commands[cmd];
			if (!cmdf) {
				console.error(`Command "${cmd}" not found`);
				return;
			}
			const optConfirm = cmdf.confirm || confirm;
			const optSaveRequired = cmdf.saveRequired || opts && opts.saveRequired;
			const optValidRequired = cmdf.validRequired || opts && opts.validRequired;

			if (optValidRequired && !vm.$data.$valid) return; // not valid

			if (utils.isFunction(cmdf.canExec)) {
				if (!cmdf.canExec.call(this, arg)) return;
			}

			let that = this;
			const doExec = function () {
				const realExec = function () {
					if (utils.isFunction(cmdf))
						cmdf.call(that, arg);
					else if (utils.isFunction(cmdf.exec))
						cmdf.exec.call(that, arg);
					else
						console.error($`There is no method 'exec' in command '${cmd}'`);
				};

				if (optConfirm) {
					vm.$confirm(optConfirm).then(realExec);
				} else {
					realExec();
				}
			};

			if (optSaveRequired && vm.$isDirty)
				vm.$save().then(doExec);
			else
				doExec();


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
		index = index || '';
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
				// elem.ix - array indexes
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
		this.$set({});
	}

	function setElement(src) {
		if (this.$root.isReadOnly)
			return;
		this.$merge(src);
	}

	function getMaxLength(prop) {
		let m = this._meta_.props;
		if (!m) return undefined;
		let x = m[prop];
		if (utils.isObjectExact(x))
			return x.len;
		return undefined;
	}

	function merge(src) {
		let oldId = this.$id__;
		try {
			if (src === null)
				src = {};
			this._root_._enableValidate_ = false;
			this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				if (prop.startsWith('$$')) continue; // skip special properties (saved)
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				let trg = this[prop];
				if (Array.isArray(trg)) {
					trg.$copy(src[prop]);
					// copy rowCount
					if ('$RowCount' in trg) {
						let rcProp = prop + '.$RowCount';
						if (rcProp in src)
							trg.$RowCount = src[rcProp] || 0;
						else
							trg.$RowCount = 0;
					}
					//TODO: try to select old value
				} else {
					if (utils.isDateCtor(ctor)) {
						let dt = src[prop];
						if (!dt)
							platform.set(this, prop, utils.date.zero());
						else
							platform.set(this, prop, new Date(src[prop]));
					} else if (utils.isPrimitiveCtor(ctor)) {
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
		let newId = this.$id__;
		let fireChange = false;
		if (utils.isDefined(newId) && utils.isDefined(oldId))
			fireChange =  newId !== oldId; // check id, no fire event
		if (fireChange) {
			//console.warn(`fire change. old:${oldId}, new:${newId}`);
			// emit .change event for all object
			let eventName = this._path_ + '.change';
			this._root_.$emit(eventName, this.$parent, this);
		}
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$defer = platform.defer;
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

	function setModelInfo(root, info, rawData) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: 20
		};
		let mi = rawData.$ModelInfo;
		if (!mi) return;
		for (let p in mi) {
			root[p].$ModelInfo = mi[p];
		}
		//console.dir(rawData.$ModelInfo);
		//root._setModelInfo_()
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180319-7135
// dataservice.js
(function () {

	let http = require('std:http');
	let utils = require('std:utils');

	function post(url, data, raw) {
		return http.post(url, data, raw);
	}

	function get(url) {
		return http.get(url);
	}

	app.modules['std:dataservice'] = {
		post: post,
		get: get
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


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180326-7140
/*components/include.js*/

(function () {

	const http = require('std:http');
	const urlTools = require('std:url');

	function _destroyElement(el) {
		let fc = el.firstElementChild;
		if (!fc) return;
		let vue = fc.__vue__;
		// Maybe collectionView created the wrapper!
		if (vue && !vue.$marker)
			vue = vue.$parent;
		if (vue && vue.$marker()) {
			vue.$destroy();
		}
	}

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
					this.__destroy();
					http.load(this.currentUrl, this.$el).then(this.loaded);
				}
			},
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			}
		},
		computed: {
			implClass() {
				return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
			}
		},
		mounted() {
			//console.warn('include has been mounted');
			if (this.src) {
				this.currentUrl = this.src;
				http.load(this.src, this.$el).then(this.loaded);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
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
					this.__destroy();
					http.load(newUrl, this.$el).then(this.loaded);
				}
			},
			needReload(val) {
				// works like a trigger
				if (val) this.requery();
			}
		}
	});


	Vue.component('a2-include', {
		template: '<div class="a2-include"></div>',
		props: {
			source: String,
			arg: undefined
		},
		data() {
			return {
				needLoad: 0
			};
		},
		methods: {
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			loaded() {

			},
			makeUrl() {
				let arg = this.arg || '0';
				return urlTools.combine('_page', this.source, arg);
			},
			load() {
				let url = this.makeUrl();
				this.__destroy();
				http.load(url, this.$el).then(this.loaded);
			}
		},
		watch: {
			source(newVal, oldVal) {
				//console.warn(`source changed ${newVal}, ${oldVal}`);
				this.needLoad += 1;
			},
			arg(newVal, oldVal) {
				//console.warn(`arg changed ${newVal}, ${oldVal}`);
				this.needLoad += 1;
			},
			needLoad() {
				//console.warn(`load iteration: ${this.needLoad}`);
				this.load();
			}
		},
		mounted() {
			if (this.source) {
				this.currentUrl = this.makeUrl(this.source);
				http.load(this.currentUrl, this.$el).then(this.loaded);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		}
	});
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180406-7150
// components/control.js

(function () {

	const utils = require('std:utils');

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean,
			tabIndex: Number,
			dataType: String,
			validatorOptions: Object,
			updateTrigger: String
		},
		computed: {
			path() {
				return this.item._path_ + '.' + this.prop;
			},
			pathToValidate() {
				return this.itemToValidate._path_ + '.' + this.propToValidate;
			},
			modelValue() {
				if (!this.item) return null;
				let val = this.item[this.prop];
				if (this.dataType)
					return utils.format(val, this.dataType);
				return val;
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
					err = root._validate_(this.item, this.path, this.modelValue, this.deferUpdate);
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
					if (this.item && this.modelValue < 0)
						return true;
				return false;
			},
			hasLabel() {
				return !!this.label;
			},
			hasDescr() {
				return !!this.description;
			},
			maxLength() {
				if (!this.item) return undefined;
				if (!this.item.$maxLength) return undefined;
				return this.item.$maxLength(this.prop);
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180106-7085*/
/*components/validator.js*/

Vue.component('validator', {
    props: {
        invalid: Function,
        errors: Array,
        options: Object
    },
    template: '<div v-if="invalid()" class="validator" :class="cssClass" :style="cssStyle"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
    computed: {
        cssStyle() {
            let r = {};
            if (this.options && this.options.width)
                r.width = this.options.width;
            return r;
        },
        cssClass() {
            let r = {};
            if (this.options && this.options.placement)
                r[this.options.placement] = true;
            return r;
        }
    }
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180114-7091*/
/*components/textbox.js*/

(function () {

	const utils = require('std:utils');

	let textBoxTemplate =
		`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input ref="input" :type="controlType" v-focus 
			v-bind:value="modelValue" 
					v-on:change="onChange($event.target.value)" 
					v-on:input="onInput($event.target.value)"
				:class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let textAreaTemplate =
		`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<textarea v-focus v-auto-size="autoSize" v-bind:value="modelValue2" 
			v-on:change="onChange($event.target.value)" 
			v-on:input="onInput($event.target.value)"
			:rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
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
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
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
		},
		methods: {
			updateValue(value) {
				this.item[this.prop] = utils.parse(value, this.dataType);
				if (this.$refs.input.value !== this.modelValue) {
					this.$refs.input.value = this.modelValue;
					this.$emit('change', this.item[this.prop]);
				}
			},
			onInput(value) {
				if (this.updateTrigger === 'input')
					this.updateValue(value);
			},
			onChange(value) {
				if (this.updateTrigger !== 'input')
					this.updateValue(value);
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
			autoSize: Boolean,
			rows: Number
		},
		computed: {
			modelValue2() {
				if (!this.item) return null;
				return this.item[this.prop];
			}
		},
		methods: {
			updateValue(value) {
				if (this.item[this.prop] === value) return;
				this.item[this.prop] = value;
				this.$emit('change', this.item[this.prop]);
			},
			onInput(value) {
				if (this.updateTrigger === 'input')
					this.updateValue(value);
			},
			onChange(value) {
				if (this.updateTrigger !== 'input')
					this.updateValue(value);
			}
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180328-7142*/
/*components/combobox.js*/

(function () {


	const utils = require('std:utils');

	let comboBoxTemplate =
`<div :class="cssClass()" v-lazy="itemsSource">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<select v-focus v-model="cmbValue" :class="inputClass" :disabled="disabled" :tabindex="tabIndex">
			<slot>
				<option v-for="(cmb, cmbIndex) in itemsSource" :key="cmbIndex" 
					v-text="getName(cmb)" :value="getValue(cmb)"></option>
			</slot>
		</select>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
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
				type: Object, default() { return {}; }
			},
			itemsSource: {
				type: Array, default() { return []; }
			},
			itemToValidate: Object,
			propToValidate: String,
			nameProp: String,
			valueProp: String
		},
		computed: {
			cmbValue: {
				get() {
					let val = this.item ? this.item[this.prop] : null;
					if (!utils.isObjectExact(val))
						return val;
					let vProp = this.valueProp || '$id';
					if (!(vProp in val))
						return val;
					if (this.itemsSource.indexOf(val) !== -1) {
						return val;
					}
					// always return value from ItemsSource
					return this.itemsSource.find((x) => x[vProp] === val[vProp]);
				},
				set(value) {
					if (this.item) this.item[this.prop] = value;
				}
			}
		},
		methods: {
			getName(itm) {
				let n = this.nameProp ? utils.eval(itm, this.nameProp) : itm.$name;
				return n;
			},
			getValue(itm) {
				let v = this.valueProp ? utils.eval(itm, this.valueProp) : itm;
				return v;
			}
		}
	});
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180327-7141
// components/datepicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;

	Vue.component('a2-date-picker', {
		extends: baseControl,
		template: `
<div :class="cssClass2()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model.lazy="model" :class="inputClass" :disabled="disabled" />
		<a href @click.stop.prevent="toggle($event)"><i class="ico ico-calendar"></i></a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
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
				<tfoot><tr><td colspan="7"><a class="today" @click.stop.prevent='today' v-text='todayText'></a></td></tr></tfoot>
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
				return dt.toLocaleString(locale.$Locale, { weekday: "short" });
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
				// todo: localize
				return day.toLocaleString(locale.$Locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen)
					cx += ' open'
				return cx;
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		computed: {
			modelDate() {
				return this.item[this.prop];
			},
			todayText() {
				return locale.$Today;
			},
			model: {
				get() {
					if (utils.date.isZero(this.modelDate))
						return '';
					return this.modelDate.toLocaleString(locale.$Locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
				},
				set(str) {
					let md = utils.date.parse(str);
					this.item[this.prop] = md;
					if (utils.date.isZero(md))
						this.isOpen = false;
				}
			},
			title() {
				let mn = this.modelDate.toLocaleString(locale.$Locale, { month: "long", year: 'numeric' });
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
						let xd = new Date(dt);
						xd.setHours(0, -xd.getTimezoneOffset(), 0, 0);
						row.push(new Date(xd));
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180330-7144
// components/selector.js

/* TODO:
    7. create element text and command
    8. scrollIntoView for template (table)
    9. blur/cancel
*/

(function () {
	const popup = require('std:popup');
	const utils = require('std:utils');
	const platform = require('std:platform');
	const locale = window.$$locale;

	const baseControl = component('control');

	const DEFAULT_DELAY = 300;

	Vue.component('a2-selector', {
		extends: baseControl,
		template: `
<div :class="cssClass2()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model="query" :class="inputClass" :placeholder="placeholder"
			@input="debouncedUpdate"
			@blur.stop="cancel"
			@keydown.stop="keyUp"
			:disabled="disabled" />
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="selector-pane" v-if="isOpen" ref="pane" :style="paneStyle">
			<slot name="pane" :items="items" :is-item-active="isItemActive" :item-name="itemName" :hit="hit">
				<ul class="selector-pane" :style="listStyle">
					<li @mousedown.prevent="hit(itm)" :class="{active: isItemActive(itmIndex)}"
						v-for="(itm, itmIndex) in items" :key="itmIndex" v-text="itemName(itm)">}</li>
				</ul>
				<a v-if='canNew' class="create-elem a2-hyperlink a2-inline" @mousedown.stop.prevent="doNew()"><i class="ico ico-plus"/> <span v-text="newText"></span></a>
			</slot>
		</div>
		<div class="selector-pane" v-if="isOpenNew" @click.stop.prevent="dummy">
			<slot name="new-pane"></slot>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			display: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			delay: Number,
			minChars: Number,
			fetch: Function,
			listWidth: String,
			listHeight: String,
			createNew: Function
		},
		data() {
			return {
				isOpen: false,
				isOpenNew: false,
				loading: false,
				items: [],
				query: '',
				filter: '',
				current: -1
			};
		},
		computed: {
			$displayProp() {
				return this.display;
			},
			valueText() {
				return this.item ? this.item[this.prop][this.$displayProp] : '';
			},
			canNew() {
				return !!this.createNew;
			},
			newText() {
				return `${locale.$CreateLC} "${this.query}"`;
			},
			pane() {
				return {
					items: this.items,
					isItemActive: this.isItemActive,
					itemName: this.itemName,
					hit: this.hit
				};
			},
			paneStyle() {
				if (this.listWidth)
					return { width: this.listWidth, minWidth: this.listWidth };
				return null;
			},
			listStyle() {
				if (this.listHeight)
					return { maxHeight: this.listHeight };
				return null;
			},
			debouncedUpdate() {
				let delay = this.delay || DEFAULT_DELAY;
				return utils.debounce(() => {
					this.current = -1;
					this.filter = this.query;
					this.update();
				}, delay);
			}
		},
		watch: {
			valueText(newVal) {
				this.query = this.valueText;
			}
		},
		methods: {
			dummy() {

			},
			__clickOutside() {
				this.isOpen = false;
				this.isOpenNew = false;
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen || this.isOpenNew)
					cx += ' open';
				return cx;
			},
			isItemActive(ix) {
				return ix === this.current;
			},
			itemName(itm) {
				return itm ? itm[this.$displayProp] : '';
			},
			cancel() {
				this.query = this.valueText;
				this.isOpen = false;
			},
			keyUp(event) {
				if (!this.isOpen) return;
				switch (event.which) {
					case 27: // esc
						this.cancel();
						break;
					case 13: // enter
						if (this.current === -1) return;
						this.hit(this.items[this.current]);
						break;
					case 40: // down
						event.preventDefault();
						this.current += 1;
						if (this.current >= this.items.length)
							this.current = 0;
						this.query = this.itemName(this.items[this.current]);
						this.scrollIntoView();
						break;
					case 38: // up
						event.preventDefault();
						this.current -= 1;
						if (this.current < 0)
							this.current = this.items.length - 1;
						this.query = this.itemName(this.items[this.current]);
						this.scrollIntoView();
						break;
					default:
						return;
				}
			},
			hit(itm) {
				this.item[this.prop].$merge(itm, true /*fire*/);
				this.query = this.valueText;
				this.isOpen = false;
				this.isOpenNew = false;
			},
			clear() {
				this.item[this.prop].$empty();
				this.query = '';
				this.isOpen = false;
				this.isOpenNew = false;
			},
			scrollIntoView() {
				this.$nextTick(() => {
					let pane = this.$refs['pane'];
					if (!pane) return;
					let elem = pane.querySelector('.active');
					if (!elem) return;
					let pe = elem.parentElement;
					let t = elem.offsetTop;
					let b = t + elem.offsetHeight;
					let pt = pe.scrollTop;
					let pb = pt + pe.clientHeight;
					if (t < pt)
						pe.scrollTop = t;
					if (b > pb)
						pe.scrollTop = b - pe.clientHeight;
					//console.warn(`t:${t}, b:${b}, pt:${pt}, pb:${pb}`);
				});
			},
			update() {
				let text = this.query || '';
				let chars = +(this.minChars || 0);
				if (chars && text.length < chars) return;
				this.items = [];
				this.isOpen = true;
				this.isOpenNew = false;
				if (text === '') {
					this.clear();
					return;
				}
				this.loading = true;
				this.fetchData(text).then((result) => {
					this.loading = false;
					// first property from result
					let prop = Object.keys(result)[0];
					this.items = result[prop];
				});
			},
			fetchData(text) {
				let elem = this.item[this.prop];
				return this.fetch.call(elem, elem, text);
			},
			doNew() {
				//console.dir(this.createNew);
				this.isOpen = false;
				if (this.createNew) {
					this.createNew(this.query);
				}
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.query = this.valueText;
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180417-7159
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

	/* group marker
				<th v-if="isGrouping" class="group-cell" style="display:none">
					<div class="h-group">
						<a @click.prevent="expandGroups(gi)" v-for="gi in $groupCount" v-text='gi' /><a
							@click.prevent="expandGroups($groupCount + 1)" v-text='$groupCount + 1' />
					</div>
				</th>
			<col v-if="isGrouping" class="fit"/>
	 */

	const dataGridTemplate = `
<div v-lazy="itemsSource" :class="{'data-grid-container':true, 'fixed-header': fixedHeader, 'bordered': border}">
	<div :class="{'data-grid-body': true, 'fixed-header': fixedHeader}">
	<table :class="cssClass">
		<colgroup>
			<col v-if="isMarkCell" class="fit"/>
			<col v-if="isRowDetailsCell" class="fit" />
			<col v-bind:class="columnClass(col)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
		</colgroup>
		<thead>
			<tr v-show="isHeaderVisible">
				<th v-if="isMarkCell" class="marker"><div v-if="fixedHeader" class="h-holder">&#160;</div></th>
				<th v-if="isRowDetailsCell" class="details-marker"><div v-if="fixedHeader" class="h-holder">&#160;</div></th>
				<slot></slot>
			</tr>
		</thead>
		<template v-if="isGrouping">
			<tbody>
				<template v-for="(g, gIndex) of $groups">
					<tr v-if="isGroupGroupVisible(g)" :class="'group lev-' + g.level" :key="gIndex">
						<td @click.prevent='toggleGroup(g)' :colspan="groupColumns">
						<span :class="{expmark: true, expanded: g.expanded}" />
						<span class="grtitle" v-text="groupTitle(g)" />
						<span v-if="g.source.count" class="grcount" v-text="g.count" /></td>
					</tr>
					<template v-for="(row, rowIndex) in g.items">
						<data-grid-row v-show="isGroupBodyVisible(g)" :group="true" :level="g.level" :cols="columns" :row="row" :key="gIndex + ':' + rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
						<data-grid-row-details v-if="rowDetails" :cols="columns.length" :row="row" :key="'rd:' + gIndex + ':' + rowIndex" :mark="mark">
							<slot name="row-details" :row="row"></slot>
						</data-grid-row-details>
					</template>
				</template>
			</tbody>
		</template>
		<template v-else>
			<tbody>
				<template v-for="(item, rowIndex) in $items">
					<data-grid-row :cols="columns" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark" />
					<data-grid-row-details v-if="rowDetails" :cols="columns.length" :row="item" :key="'rd:' + rowIndex" :mark="mark">
						<slot name="row-details" :row="item"></slot>
					</data-grid-row-details>
				</template>
			</tbody>
		</template>
		<slot name="footer"></slot>
	</table>
	</div>
</div>
`;

	/* @click.prevent disables checkboxes & other controls in cells 
	<td class="group-marker" v-if="group"></td>
	 */
	const dataGridRowTemplate = `
<tr @click="rowSelect(row)" :class="rowClass()" v-on:dblclick.prevent="doDblClick">
	<td v-if="isMarkCell" class="marker">
		<div :class="markClass"></div>
	</td>
	<td v-if="detailsMarker" class="details-marker" @click.prevent="toggleDetails">
		<i v-if="detailsIcon" class="ico" :class="detailsExpandClass" />
	</td>
	<data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index" />
</tr>`;

	const dataGridRowDetailsTemplate = `
<tr v-if="visible()" class="row-details">
	<td v-if="isMarkCell" class="marker">
		<div :class="markClass"></div>
	</td>
	<td :colspan='totalCols' class="details-cell">
		<div class="details-wrapper"><slot></slot></div>
	</td>
</tr>
`;
    /**
        icon on header!!!
		<i :class="\'ico ico-\' + icon" v-if="icon"></i>
     */
	const dataGridColumnTemplate = `
<th :class="cssClass" @click.prevent="doSort">
	<div class="h-fill" v-if="fixedHeader" v-text="headerText">
	</div><div class="h-holder">
		<slot>{{headerText}}</slot>
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
			hideZeros: Boolean,
			icon: String,
			bindIcon: String,
			id: String,
			align: { type: String, default: 'left' },
			editable: { type: Boolean, default: false },
			noPadding: { type: Boolean, default: false },
			validate: String,
			sort: { type: Boolean, default: undefined },
			sortProp: String,
			small: { type: Boolean, default: undefined },
			bold: { type: Boolean, default: undefined },
			mark: String,
			controlType: String,
			width: String,
			fit: Boolean,
			wrap: String,
			command: Object
		},
		created() {
			this.$parent.$addColumn(this);
		},
		computed: {
			sortProperty() {
				return this.sortProp || this.content;
			},
			dir() {
				return this.$parent.sortDir(this.sortProperty);
			},
			fixedHeader() {
				return this.$parent.fixedHeader;
			},
			isSortable() {
				if (!this.sortProperty)
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
			},
			headerText() {
				return this.header || '\xa0';
			}
		},
		methods: {
			doSort() {
				if (!this.isSortable)
					return;
				this.$parent.doSort(this.sortProperty);
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
				if (this.small)
					cssClass += ' ' + 'small';
				if (this.bold)
					cssClass += ' ' + 'bold';
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

			function normalizeArg(arg, doEval) {
				if (utils.isBoolean(arg) || utils.isNumber(arg))
					return arg;
				arg = arg || '';
				if (arg === 'this')
					arg = row;
				else if (arg.startsWith('{')) {
					arg = arg.substring(1, arg.length - 1);
					if (arg.indexOf('.') !== -1)
						arg = utils.eval(row, arg);
					else {
						if (!(arg in row))
							throw new Error(`Property '${arg}' not found in ${row.constructor.name} object`);
						arg = row[arg];
					}
				} else if (arg && doEval) {
					arg = utils.eval(row, arg, col.dataType, col.hideZeros);
				}
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
					/*@click.prevent, no stop*/
					template: '<a @click.prevent="doCommand($event)" :href="getHref()"><i v-if="hasIcon" :class="iconClass" class="ico"></i><span v-text="eval(row, col.content, col.dataType, col.hideZeros)"></span></a>',
					computed: {
						hasIcon() { return col.icon || col.bindIcon; },
						iconClass() {
							if (col.bindIcon)
								return 'ico-' + utils.eval(row, col.bindIcon);
							else if (col.icon)
								return 'ico-' + col.icon;
							return null;
						}
					},
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
							if (col.command && col.command.isDialog)
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
				if (col.dataType === 'Number' || col.dataType === 'Currency') {
					let val = utils.eval(row, col.content, col.dataType, col.hideZeros, true /*skip format*/);
					if (val < 0)
						return true;
				}
				return false;
			}

			let content = utils.eval(row, col.content, col.dataType, col.hideZeros);
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
			level: Number
		},
		computed: {
			isMarkCell() {
				return this.$parent.isMarkCell;
			},
			detailsMarker() {
				return this.$parent.isRowDetailsCell;
			},
			detailsIcon() {
				if (!this.detailsMarker)
					return false;
				let prdv = this.$parent.rowDetailsVisible;
				if (prdv === false) return true; // property not specified
				return prdv && this.row[prdv];
			},
			detailsExpandClass() {
				return this.row._uiprops_.$details ? "ico-minus-circle" : "ico-plus-circle";
			},
			totalColumns() {
				console.error('implement me');
			},
			markClass() {
				return this.mark ? this.row[this.mark] : '';
			}
		},
		methods: {
			rowClass() {
				let cssClass = '';
				const isActive = this.row.$selected; //this.row == this.$parent.selected();
				if (isActive) cssClass += 'active';
				if (this.$parent.isMarkRow && this.mark) {
					cssClass += ' ' + this.row[this.mark];
				}
				if ((this.index + 1) % 2)
					cssClass += ' even';
				if (this.$parent.rowBold && this.row[this.$parent.rowBold])
					cssClass += ' bold';
				if (this.level)
					cssClass += ' lev-' + this.level;
				return cssClass.trim();
			},
			rowSelect(row) {
				row.$select();
			},
			doDblClick($event) {
				// deselect text
				$event.stopImmediatePropagation();
				if (!this.$parent.doubleclick)
					return;
				window.getSelection().removeAllRanges();
				this.$parent.doubleclick();
			},
			toggleDetails($event) {
				//$event.stopImmediatePropagation();
				if (!this.detailsIcon) return;
				Vue.set(this.row._uiprops_, "$details", !this.row._uiprops_.$details);
			}
		}
	};

	const dataGridRowDetails = {
		name: 'data-grid-row-details',
		template: dataGridRowDetailsTemplate,
		props: {
			cols: Number,
			row: Object,
			mark: String
		},
		computed: {
			isMarkCell() {
				return this.$parent.isMarkCell;
			},
			markClass() {
				return this.mark ? this.row[this.mark] : '';
			},
			detailsMarker() {
				return this.$parent.isRowDetailsCell;
			},
			totalCols() {
				return this.cols +
					(this.isMarkCell ? 1 : 0) +
					(this.detailsMarker ? 1 : 0);
			}
		},
		methods: {
			visible() {
				if (this.$parent.isRowDetailsCell)
					return this.row._uiprops_.$details ? true : false;
				return this.row === this.$parent.selected();
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
			groupBy: [Array, Object],
			rowDetails: Boolean,
			rowDetailsActivate: String,
			rowDetailsVisible: [String /*path*/, Boolean]
		},
		template: dataGridTemplate,
		components: {
			'data-grid-row': dataGridRow,
			'data-grid-row-details': dataGridRowDetails
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
			isRowDetailsCell() {
				return this.rowDetails && this.rowDetailsActivate === 'cell';
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
			isGridSortable() {
				return !!this.sort;
			},
			isLocal() {
				return !this.$parent.sortDir;
			},
			isGrouping() {
				return this.groupBy;
			},
			groupColumns() {
				return this.columns.length + //1 +
					(this.isMarkCell ? 1 : 0) +
					(this.isRowDetailsCell ? 1 : 0);
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
				//console.dir(this.clientGroups);
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
						let key = utils.eval(itm, gr.prop);
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
			selected() {
				let src = this.itemsSource;
				if (src.$origin) {
					src = src.$origin;
				}
				return src.$selected;
			},
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
			doSortLocally() {
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180315-7131
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
const locale = window.$$locale;

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
				return locale.$NoElements;
			return `${locale.$PagerElements}: <b>${this.offset + 1}</b>-<b>${lastNo}</b> ${locale.$Of} <b>${this.count}</b>`;
		},
		offset() {
			return +this.source.offset;
		},
		count() {
			return +this.source.sourceCount;
		}
	},
	methods: {
		setOffset(offset) {
			offset = +offset;
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
			let offset = (page - 1) * this.source.pageSize;
			this.setOffset(offset);
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


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

//20170913-7046
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180225-7119*/
// components/treeview.js


/*
1. Check to delete isDynamic!
*/

(function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

    /**
     * .stop for toggle is required!
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
        <a v-if="hasLink(item)" :href="dataHref" tabindex="-1" v-text="item[options.label]" :class="{'no-wrap':!options.wrapLabel }"/>
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
				eventBus.$emit('closeAllPopups');
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
				// toggle with stop!
				eventBus.$emit('closeAllPopups');
				if (!this.isFolder)
					return;
				this.open = !this.open;
				if (this.options.isDynamic) {
					this.expand(this.item, this.options.subitems);
				}
			},
			openElem() {
				if (!this.isFolder)
					return;
				this.open = true;
				if (this.isDynamic)
					this.expand(this.item, this.options.subitems);
			}
		},
		computed: {
			isFolder: function () {
				if (this.options.isDynamic && utils.isDefined(this.item.$hasChildren) && this.item.$hasChildren)
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
					return this.item.$selected; //$isSelected(this.rootItems);
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
		watch: {
			isFolder(newVal) {
				// TODO: auto expand???
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
			getHref: Function,
			expandFirstItem: Boolean
		},
		computed: {
			isSelectFirstItem() {
				return this.autoSelect === 'first-item';
			}
		},
		watch: {
			items: function () {
				this.doExpandFirst();
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
			},
			doExpandFirst() {
				if (!this.expandFirstItem)
					return;
				this.$nextTick(() => {
					if (!this.$children)
						return;
					this.$children.forEach((val) => {
						if (val && val.openElem) {
							val.openElem();
						}
					});
				});
			}
		},
		created() {
			this.selectFirstItem();
			this.doExpandFirst();
		},
		updated() {
			if (this.options.isDynamic && this.isSelectFirstItem && !this.items.$selected) {
				this.selectFirstItem();
			}
		}
	});
})();

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180414-7157
// components/collectionview.js

/*
TODO:
11. GroupBy
*/

(function () {


	const log = require('std:log');
	const utils = require('std:utils');

	const DEFAULT_PAGE_SIZE = 20;

	function getModelInfoProp(src, propName) {
		if (!src) return undefined;
		let mi = src.$ModelInfo;
		if (!mi) return undefined;
		return mi[propName];
	}

	function setModelInfoProp(src, propName, value) {
		if (!src) return;
		let mi = src.$ModelInfo;
		if (!mi) return;
		mi[propName] = value;
	}

	function makeNewQueryFunc(that) {
		let nq = { dir: that.dir, order: that.order, offset: that.offset };
		for (let x in that.filter) {
			let fVal = that.filter[x];
			if (utils.isObjectExact(fVal)) {
				if (!('Id' in fVal)) {
					console.error('The object in the Filter does not have Id property');
				}
				nq[x] = fVal.Id;
			}
			else if (fVal)
				nq[x] = fVal;
			else {
				nq[x] = undefined;
			}
		}
		return nq;
	}

	// client collection

	Vue.component('collection-view', {
		//store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialPageSize: Number,
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
		computed: {
			pageSize() {
				if (this.initialPageSize > 0)
					return this.initialPageSize;
				return DEFAULT_PAGE_SIZE;
			},
			dir() {
				return this.localQuery.dir;
			},
			offset() {
				return this.localQuery.offset;
			},
			order() {
				return this.localQuery.order;
			},
			pagedSource() {
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
				if (arr.indexOf(arr.$origin.$selected) === -1) {
					// not found in target array
					arr.$origin.$clearSelected();
				}
				log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
				return this.ItemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages() {
				let cnt = this.filteredCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			$setOffset(offset) {
				this.localQuery.offset = offset;
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
				// local
				this.localQuery.dir = nq.dir;
				this.localQuery.order = nq.order;
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			copyQueryToLocal(q) {
				for (let x in q) {
					let fVal = q[x];
					if (x === 'offset')
						this.localQuery[x] = q[x];
					else
						this.localQuery[x] = fVal ? fVal : undefined;
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


	// server collection view
	Vue.component('collection-view-server', {
		//store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialFilter: Object
		},

		data() {
			return {
				filter: this.initialFilter,
				lockChange: true
			};
		},

		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},

		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			thisPager() {
				return this;
			},
			pageSize() {
				return getModelInfoProp(this.ItemsSource, 'PageSize');
			},
			dir() {
				return  getModelInfoProp(this.ItemsSource, 'SortDir');
			},
			order() {
				return getModelInfoProp(this.ItemsSource, 'SortOrder');
			},
			offset() {
				return getModelInfoProp(this.ItemsSource, 'Offset');
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			}
		},
		methods: {
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, 'Offset', offset);
				this.reload();
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				if (order === this.order) {
					let dir = this.dir === 'asc' ? 'desc' : 'asc';
					setModelInfoProp(this.ItemsSource, 'SortDir', dir);
				} else {
					setModelInfoProp(this.ItemsSource, 'SortOrder', order);
					setModelInfoProp(this.ItemsSource, 'SortDir', 'asc');
				}
				this.reload();
			},
			filterChanged() {
				if (this.lockChange) return;
				let mi = this.ItemsSource.$ModelInfo;
				if (!mi) {
					mi = { Filter: this.filter };
					this.ItemsSource.$ModelInfo = mi;
				}
				else {
					this.ItemsSource.$ModelInfo.Filter = this.filter;
				}
				if ('Offset' in mi)
					setModelInfoProp(this.ItemsSource, 'Offset', 0);
				this.reload();
			},
			reload() {
				this.$root.$emit('cwChange', this.ItemsSource);
			}
		},
		created() {
			// get filter values from modelInfo
			let mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
			if (mi) {
				let q = mi.Filter;
				if (q) {
					for (let x in this.filter) {
						if (x in q) this.filter[x] = q[x];
					}
				}
			}
			this.$nextTick(() => {
				this.lockChange = false;
			});
			// from datagrid, etc
			this.$on('sort', this.doSort);
		}
	});

	// server url collection view
	Vue.component('collection-view-server-url', {
		store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter" :GroupBy="groupBy">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialFilter: Object
		},
		data() {
			return {
				filter: this.initialFilter,
				groupBy: null,
				lockChange: true
			};
		},
		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},
		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			pageSize() {
				let ps = getModelInfoProp(this.ItemsSource, 'PageSize');
				return ps ? ps : DEFAULT_PAGE_SIZE;
			},
			dir() {
				let dir = this.$store.getters.query.dir;
				if (!dir) dir = getModelInfoProp(this.ItemsSource, 'SortDir');
				return dir;
			},
			offset() {
				let ofs = this.$store.getters.query.offset;
				if (!utils.isDefined(ofs))
					ofs = getModelInfoProp(this.ItemsSource, 'Offset');
				return ofs || 0;
			},
			order() {
				return getModelInfoProp(this.ItemsSource,'SortOrder');
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			},
			thisPager() {
				return this;
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			commit(query) {
				//console.dir(this.$root.$store);
				this.$store.commit('setquery', query);
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, "Offset", offset);
				this.commit({ offset: offset });
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
				this.commit(nq);
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			filterChanged() {
				if (this.lockChange) return;
				// for server only
				let nq = this.makeNewQuery();
				nq.offset = 0;
				if (!nq.order) nq.dir = undefined;
				//console.warn('filter changed');
				this.commit(nq);
			}
		},
		created() {
			// get filter values from modelInfo and then from query
			let mi = this.ItemsSource.$ModelInfo;
			if (mi) {
				let q = mi.Filter;
				if (q) {
					for (let x in this.filter) {
						if (x in q) this.filter[x] = q[x];
					}
				}
			}
			// then query from url
			let q = this.$store.getters.query;
			for (let x in this.filter) {
				if (x in q) this.filter[x] = q[x];
			}
			this.$nextTick(() => {
				this.lockChange = false;
			});
			this.$on('sort', this.doSort);
		}
	});

})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180405-7149
// components/upload.js



(function () {

	var url = require('std:url');
	var http = require('std:http');

	Vue.component("a2-upload", {
        /* TODO:
         1. Accept for images/upload - may be accept property ???
         4. ControllerName (_image ???)
        */
		template: `
<label :class="cssClass" @dragover="dragOver" @dragleave="dragLeave">
	<input v-if='canUpload' type="file" @change="uploadImage" v-bind:multiple="isMultiple" accept="image/*" />
	<i class="ico ico-image"></i>
	<span class="upload-tip" v-text="tip" v-if="tip"></span>
</label>
		`,
		props: {
			item: Object,
			prop: String,
			base: String,
			newItem: Boolean,
			tip: String,
			readOnly: Boolean
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
			},
			canUpload() {
				return !this.readOnly;
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180122-7095
// components/list.js

/* TODO:
*/

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
            mark: String,
            command: Function
        },
        computed: {
            isSelectFirstItem() {
                return this.autoSelect === 'first-item';
            },
            selectedSource() {
                // method! not cached
                let src = this.itemsSource;
                if (!src) return null;
                if (src.$origin)
                    src = src.$origin;
                return src.$selected;
            }
        },
        methods: {
            cssClass(item) {
                let cls = item.$selected ? 'active' : '';
                if (this.mark) {
                    let clsmrk = utils.eval(item, this.mark);
                    if (clsmrk) cls += ' ' + clsmrk;
                }
                return cls;
            },
            select(item) {
                if (item.$select) item.$select();
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
                    case 13: // Enter
                        if (utils.isFunction(this.command)) {
                            // TODO:
                            this.command();
                        }
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

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180410-7153
// components/modal.js


(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const modalTemplate = `
<div class="modal-window" @keydown.tab="tabPress">
	<include v-if="isInclude" class="modal-body" :src="dialog.url"></include>
	<div v-else class="modal-body">
		<div class="modal-header" v-drag-window><span v-text="title"></span><button class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
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

	const dragDialogDirective = {
		inserted(el, binding) {

			const mw = el.closest('.modal-window');
			if (!mw)
				return;
			const opts = {
				down: false,
				init: { x: 0, y: 0, cx: 0, cy: 0 },
				offset: { x: 0, y: 0 }
			};

			function onMouseDown(event) {
				opts.down = true;
				opts.offset.x = event.pageX;
				opts.offset.y = event.pageY;
				const cs = window.getComputedStyle(mw);
				opts.init.x = Number.parseFloat(cs.marginLeft);
				opts.init.y = Number.parseFloat(cs.marginTop);
				opts.init.cx = Number.parseFloat(cs.width);
				opts.init.cy = Number.parseFloat(cs.height);
				document.addEventListener('mouseup', onRelease, false);
				document.addEventListener('mousemove', onMouseMove, false);
			};

			function onRelease(event) {
				opts.down = false;
				document.removeEventListener('mouseup', onRelease);
				document.removeEventListener('mousemove', onMouseMove);
			}

			function onMouseMove(event) {
				if (!opts.down)
					return;
				let dx = event.pageX - opts.offset.x;
				let dy = event.pageY - opts.offset.y;
				let mx = opts.init.x + dx;
				let my = opts.init.y + dy;
				// fit
				let maxX = window.innerWidth - opts.init.cx;
				let maxY = window.innerHeight - opts.init.cy;
				if (my < 0) my = 0;
				if (mx < 0) mx = 0;
				if (mx > maxX) mx = maxX;
				//if (my > maxY) my = maxY; // any value available
				//console.warn(`dx:${dx}, dy:${dy}, mx:${mx}, my:${my}, cx:${opts.init.cx}`);
				mw.style.marginLeft = mx + 'px';
				mw.style.marginTop = my + 'px';
			}

			el.addEventListener('mousedown', onMouseDown, false);
		}
	};

	Vue.directive('drag-window', dragDialogDirective);

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
			},
			tabPress(event) {
				function createThisElems() {
					let qs = document.querySelectorAll('.modal-body [tabindex]');
					let ea = [];
					for (let i = 0; i < qs.length; i++) {
						//TODO: check visibilty!
						ea.push({ el: qs[i], ti: +qs[i].getAttribute('tabindex') });
					}
					ea = ea.sort((a, b) => a.ti > b.ti);
					//console.dir(ea);
					return ea;
				};


				if (this._tabElems === undefined) {
					this._tabElems = createThisElems();
				}
				if (!this._tabElems || !this._tabElems.length)
					return;
				let back = event.shiftKey;
				let lastItm = this._tabElems.length - 1;
				let maxIndex = this._tabElems[lastItm].ti;
				let aElem = document.activeElement;
				let ti = +aElem.getAttribute("tabindex");
				//console.warn(`ti: ${ti}, maxIndex: ${maxIndex}, back: ${back}`);
				if (ti == 0) {
					event.preventDefault();
					return;
				}
				if (back) {
					if (ti === 1) {
						event.preventDefault();
						this._tabElems[lastItm].el.focus();
					}
				} else {
					if (ti === maxIndex) {
						event.preventDefault();
						this._tabElems[0].el.focus();
					}
				}
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
				// todo localization
				let defTitle = this.dialog.style === 'confirm' ? locale.$Confirm : locale.$Error;
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
				let okText = this.dialog.okText || locale.$Ok;
				let cancelText = this.dialog.cancelText || locale.$Cancel;
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
		mounted() {
		},
		destroyed() {
			document.removeEventListener('keyup', this.keyUpHandler);
		}
	};

	app.components['std:modal'] = modalComponent;
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180416-7158
// components/toastr.js


(function () {

	const locale = window.$$locale;
	const eventBus = require('std:eventBus');

	const toastTemplate = `
<li class="toast" :class="toast.style">
	<i class="ico" :class="icoCssClass"></i>
	<span v-text="toast.text" />
</li>
`;

	const toastrTemplate = `
<div class="toastr-stack" >
	<transition-group name="list" tag="ul">
		<a2-toast v-for="(t,k) in items" :key="k" :toast="t"></a2-toast>
	</transition-group>
</div>
`;

	/*
	{{toast}}
		<li class="toast success">
			<i class="ico ico-check"></i><span>i am the toast 1 (11)</span>
		</li>
		<li class="toast warning">
			<i class="ico ico-warning-outline"></i><span>i am the toast warning (test for bundle)</span>
		</li>
		<li class="toast info">
			<i class="ico ico-info-outline"></i><span>Документ сохранен успешно и записан в базу данных!</span>
		</li>
		<li class="toast danger">
			<i class="ico ico-error-outline-nocolor"></i><span>Документ сохранен c ошибкой. Проверьте все, что можно</span>
		</li>
	 */

	const toastComponent = {
		template: toastTemplate,
		props: {
			toast: Object
		},
		computed: {
			icoCssClass() {
				switch (this.toast.style) {
					case 'success' : return 'ico-check';
					case 'danger':
					case 'error':
						return 'ico-error-outline-nocolor';
					case 'warning': return 'ico-warning-outline';
					case 'info': return 'ico-info-outline';
				}
				return 'ico-dot';
			}
		}
	};

	const toastrComponent = {
		template: toastrTemplate,
		components: {
			'a2-toast': toastComponent
		},
		props: {
		},
		data() {
			return {
				items: [],
				currentIndex: 0
			};
		},
		methods: {
			showToast(toast) {
				toast.$index = ++this.currentIndex;
				this.items.unshift(toast);

				setTimeout(() => {
					this.removeToast(toast.$index);
				}, 2000);
			},
			removeToast(tstIndex) {
				let ix = this.items.findIndex(x => x.$index === tstIndex);
				if (ix === -1) return;
				this.items.splice(ix, 1);
			}
		},
		created() {
			eventBus.$on('toast', this.showToast)
		}
	};

	app.components['std:toastr'] = toastrComponent;
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180405-7149
// components/image.js

(function () {

    /**
     TODO:
    2. if/else - image/upload
    3. Photo, Base for list
    4. multiple for list
    5. css
    <span v-text="href"></span>
    <span>{{newElem}}</span>
     */

	var url = require('std:url');
	const locale = window.$$locale;

	Vue.component('a2-image', {
		template: `
<div class="a2-image">
	<img v-if="hasImage" :src="href" :style="cssStyle" @click.prevent="clickOnImage"/>
	<a class="remove-image" v-if="hasRemove" @click.prevent="removeImage">&#x2715;</a>
	<a2-upload v-if="isUploadVisible" :style="uploadStyle" :item="itemForUpload" :base="base" :prop="prop" :new-item="newItem" :tip="tip" :read-only='readOnly'/>
</div>
`,
		props: {
			base: String,
			item: Object,
			prop: String,
			newItem: Boolean,
			inArray: Boolean,
			source: Array,
			width: String,
			height: String,
			readOnly: Boolean
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
				if (!id) return undefined;
				return url.combine(root, '_image', this.base, this.prop, id);
			},
			tip() {
				if (this.readOnly) return '';
				return locale.$ClickToDownloadPicture;
			},
			cssStyle() {
				return { width: this.width, height: this.height };
			},
			uploadStyle() {
				let w = { width: this.width, height: this.height };
				if (!w.width) w.width = w.height;
				if (!w.height) w.height = w.width;
				return w;
			},
			hasImage() {
				return !!this.href;
			},
			hasRemove() {
				if (this.readOnly) return false;
				return this.hasImage;
			},
			isUploadVisible: function () {
				if (this.newItem) return true;
				if (this.readOnly) return false;
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
				//alert('click on image');
			}
		},
		created() {
			if (this.newItem && this.source && this.source.$new) {
				this.newElem = this.source.$new();
			}
		}
	});

	Vue.component('a2-static-image', {
		template: '<img :src="href" :alt="alt"/>',
		props: {
			url: String,
			alt: String
		},
		computed: {
			href: function () {
				let root = window.$rootUrl;
				return url.combine(root, '_static_image', this.url.replace(/\./g, '-'));
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
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171219-7079
// components/sheet.js

(function () {

    const sheetTemplate = `
<table class="sheet">
    <thead>
        <slot name="header"></slot>
    </thead>
    <slot name="body"></slot>
    <tfoot>
        <slot name="footer"></slot>
    </tfoot>    
</table>
`;

    const sheetSectionTemplate = `
<tbody>
    <slot></slot>
</tbody>
`;

    function* traverse(item, prop, lev) {
        if (prop in item) {
            let arr = item[prop];
            for (let i = 0; i < arr.length; i++) {
                let elem = arr[i];
                elem.$level = lev;
                yield elem;
                if (!elem.$collapsed)
                    yield* traverse(elem, prop, lev + 1);
            };
        }
    }

    Vue.component('a2-sheet', {
        template: sheetTemplate
    });

    Vue.component("a2-sheet-section", {
        template: sheetSectionTemplate
    });

    Vue.component('a2-sheet-section-tree', {
        functional: true,
        name: 'a2-sheet-section',
        props: {
            itemsSource: Object,
            propName: String
        },
        render(h, ctx) {
            const prop = ctx.props.propName;
            const source = ctx.props.itemsSource;
            if (!source) return;
            if (!prop) return;

            function toggle() {
                let clpsed = this.item.$collapsed || false;
                Vue.set(this.item, "$collapsed", !clpsed);
            }

            function cssClass() {
                let cls = '';
                if (this.hasChildren())
                    cls += 'has-children';
                if (this.item.$collapsed)
                    cls += ' collapsed';
                cls += ' lev-' + this.item.$level;
                return cls;
            }

            function rowCssClass() {
                let cls = ''
                if (this.hasChildren())
                    cls += ' group';
                if (this.item.$collapsed)
                    cls += ' collapsed';
                return cls;
            }

            function indentCssClass() {
                return 'indent lev-' + this.item.$level;
            }

            function hasChildren() {
                let chElems = this.item[prop];
                return chElems && chElems.length > 0;
            }

            const slot = ctx.data.scopedSlots.default;

            let compArr = [];

            for (let v of traverse(source, prop, 1)) {
                let slotElem = slot({ item: v, toggle, cssClass, hasChildren, rowCssClass, indentCssClass })[0];
                compArr.push(h(slotElem.tag, slotElem.data, slotElem.children));
            }
            return h('tbody', {}, compArr);
        }
    });
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180319-7135*/
/*components/newbutton.js*/

(function () {

	const store = component('std:store');
	const urltools = require('std:url');
	const eventBus = require('std:eventBus');

	const newButtonTemplate =
`<div class="dropdown dir-down a2-new-btn" v-dropdown v-if="isVisible">
	<button class="btn btn-success" toggle><i class="ico ico-plus"></i></button>
	<div class="dropdown-menu menu down-right">
		<div class="super-menu" :class="cssClass">
			<div v-for="(m, mx) in topMenu" :key="mx" class="menu-group">
				<div class="group-title" v-text="m.Name"></div>
				<template v-for="(itm, ix) in m.Menu">
					<div class="divider" v-if=isDivider(itm)></div>
					<a v-else @click.prevent='doCommand(itm.Url)' 
						class="dropdown-item" tabindex="-1"><i class="ico" :class="'ico-' + itm.Icon"></i><span v-text="itm.Name"></span></a>
				</template>
			</div>
		</div>
	</div>
</div>
`;

	Vue.component('a2-new-button', {
		template: newButtonTemplate,
		store: store,
		props: {
			menu: Array
		},
		computed: {
			isVisible() {
				return !!this.menu;
			},
			topMenu() {
				return this.menu ? this.menu[0].Menu : null;
			},
			columns() {
				let descr = this.menu ? this.menu[0].Description : '';
				try {
					return +JSON.parse(descr).columns || 1;
				} catch (err) {
					return 1;
				}
			},
			cssClass() {
				return 'cols-' + this.columns;
			}
		},
		created() {
		},
		methods: {
			isDivider(itm) {
				return itm.Name === '-';
			},
			doCommand(cmd) {
				cmd = cmd || '';
				if (cmd.startsWith('navigate:')) {
					this.navigate(cmd.substring(9));
				} else if (cmd.startsWith('dialog:')) {
					this.dialog(cmd.substring(7));
				} else {
					alert('invalid command:' + cmd);
				}
			},
			navigate(url) {
				//let urlToNavigate = urltools.createUrlForNavigate(url);
				this.$store.commit('navigate', { url: url });
			},
			dialog(url) {
				const dlgData = { promise: null};
				eventBus.$emit('modal', url, dlgData);
				dlgData.promise.then(function (result) {
					// todo: resolve?
				});
			}
		}
	});
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180206-7105
// components/graphics.js

/* TODO:
*/

(function () {

    Vue.component("a2-graphics", {
        template:
        `<div :id="id" class="a2-graphics"></div>`,
        props: {
            id: String,
            render: Function
        },
        computed: {
            controller() {
                return this.$root;
            }
        },
        methods: {
        },
        mounted() {
            const chart = d3.select('#' + this.id);
            this.render.call(this.controller.$data, chart);
        }
    });
})();

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20171120-7094
// components/debug.js*/

(function () {

    /**
     * TODO
    1. Trace window
    2. Dock right/left
    6.
     */

	const dataService = require('std:dataservice');
	const urlTools = require('std:url');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const specKeys = {
		'$vm': null,
		'$host': null,
		'$root': null,
		'$parent': null
	};

	function toJsonDebug(data) {
		return JSON.stringify(data, function (key, value) {
			if (key[0] === '$')
				return !(key in specKeys) ? value : undefined;
			else if (key[0] === '_')
				return undefined;
			return value;
		}, 2);
	}

	const traceItem = {
		name: 'a2-trace-item',
		template: `
<div v-if="hasElem" class="trace-item-body">
    <span class="title" v-text="name"/><span class="badge" v-text="elem.length"/>
    <ul class="a2-debug-trace-item">
        <li v-for="itm in elem">
            
            <div class="rq-title"><span class="elapsed" v-text="itm.elapsed + ' ms'"/> <span v-text="itm.text"/></div>
        </li>
    </ul>
</div>
`,
		props: {
			name: String,
			elem: Array
		},
		computed: {
			hasElem() {
				return this.elem && this.elem.length;
			}
		}
	};

	Vue.component('a2-debug', {
		template: `
<div class="debug-panel" v-if="paneVisible">
    <div class="debug-pane-header">
        <span class="debug-pane-title" v-text="title"></span>
        <a class="btn btn-close" @click.prevent="close">&#x2715</a>
    </div>
    <div class="toolbar">
        <button class="btn btn-tb" @click.prevent="refresh"><i class="ico ico-reload"></i> {{text('$Refresh')}}</button>
    </div>
    <div class="debug-model debug-body" v-if="modelVisible">
        <pre class="a2-code" v-text="modelJson()"></pre>
    </div>
    <div class="debug-trace debug-body" v-if="traceVisible">
        <ul class="a2-debug-trace">
            <li v-for="r in trace">
                <div class="rq-title"><span class="elapsed" v-text="r.elapsed + ' ms'"/> <span v-text="r.url" /></div>
                <a2-trace-item name="Sql" :elem="r.items.Sql"></a2-trace-item>
                <a2-trace-item name="Render" :elem="r.items.Render"></a2-trace-item>
                <a2-trace-item name="Workflow" :elem="r.items.Workflow"></a2-trace-item>
                <a2-trace-item class="exception" name="Exceptions" :elem="r.items.Exception"></a2-trace-item>
            </li>
        </ul>
    </div>
</div>
`,
		components: {
			'a2-trace-item': traceItem
		},
		props: {
			modelVisible: Boolean,
			traceVisible: Boolean,
			modelStack: Array,
			counter: Number,
			close: Function
		},
		data() {
			return {
				trace: []
			};
		},
		computed: {
			refreshCount() {
				return this.counter;
			},
			paneVisible() {
				return this.modelVisible || this.traceVisible;
			},
			title() {
				return this.modelVisible ? locale.$DataModel
					: this.traceVisible ? locale.$Profiling
						: '';
			},
			traceView() {
				return this.traceVisible;
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
				if (this.modelVisible)
					this.$forceUpdate();
				else if (this.traceVisible)
					this.loadTrace()
			},
			loadTrace() {
				const root = window.$$rootUrl;
				const url = urlTools.combine(root, 'shell/trace');
				const that = this;
				dataService.post(url).then(function (result) {
					that.trace.splice(0, that.trace.length);
					if (!result) return;
					result.forEach((val) => {
						that.trace.push(val);
					});
				});
			},
			text(key) {
				return locale[key];
			}
		},
		watch: {
			refreshCount() {
				// dataModel stack changed
				this.$forceUpdate();
			},
			traceView(newVal) {
				if (newVal)
					this.loadTrace();
			}
		},
		created() {
			eventBus.$on('endRequest', (url) => {
				if (url.indexOf('/shell/trace') != -1) return;
				if (!this.traceVisible) return;
				this.loadTrace();
			});
		}
	});
})();

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20171118-7093
// components/doctitle.js*/

(function () {

    const documentTitle = {
        render() {
            return null;
        },
        props: ['page-title'],
        watch: {
            pageTitle(newValue) {
                this.setTitle();
            }
        },
        methods: {
            setTitle() {
                if (this.pageTitle)
                    document.title = this.pageTitle;
            }
        },
        created() {
            this.setTitle();
        },
    };

    app.components['std:doctitle'] = documentTitle;

})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180122-7095*/
/* directives/autosize.js */

Vue.directive('autoSize', {
    bind(el, binding, vnode) {
        if (!binding.value) return;

        el.style.overflowY = false;
        el._ops = {
            initHeight: -1,
            extraSpace: 0
        };

        el._autosize = function () {
            if (!el.offsetHeight)
                return;
            const ops = el._ops;
            if (ops.initHeight === -1) {
                ops.initHeight = el.offsetHeight;
            }
            el.style.height = ops.initHeight + "px";
            var needHeight = el.scrollHeight + ops.extraSpace;
            if (needHeight > ops.initHeight)
                el.style.height = needHeight + "px";
        };

        function onInput(event) {
            el._autosize();
        }

        el.addEventListener("input", onInput);
    },
    inserted(el, binding) {
        if (!binding.value) return;
        let style = window.getComputedStyle(el);
        let es = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        el._ops.extraSpace = es;
        setTimeout(() => el._autosize(), 1);
    }
});

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180212-7112*/
/* directives/disable.js */

Vue.directive('disable', {
    bind(el, binding, vnode) {

        function doDisable(event) {
            if (this.getAttribute('disabled')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
        }
        // with capture !!!
        el.addEventListener("click", doDisable, true);
    }
});


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


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180114-7091*/
/* directives/focus.js */

Vue.directive('focus', {
	bind(el, binding, vnode) {

        function doSelect(event) {
            let t = event.target;
            if (t._selectDone)
                return;
            t._selectDone = true;
            if (t.select) t.select();
        }

		el.addEventListener("focus", function (event) {
            event.target.parentElement.classList.add('focus');
            setTimeout(() => {
                doSelect(event);
            }, 0);
		}, false);

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = false;
			event.target.parentElement.classList.remove('focus');
		}, false);

        el.addEventListener("click", function (event) {
            doSelect(event);
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


Vue.directive('settabindex', {
    inserted(el) {
        if (el.tabIndex === 1) {
            setTimeout(() => {
                if (el.focus) el.focus();
            }, 0);
        }
    }
});

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* directives/lazy.js */

(function () {

	function updateLazy(arr) {
		if (arr && arr.$loadLazy) {
			arr.$loadLazy();
		}
	}

	Vue.directive('lazy', {
		componentUpdated(el, binding, vnode) {
			updateLazy(binding.value);
		},
		inserted(el, binding, vnode) {
			updateLazy(binding.value);
		}
	});
})();


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20171224-7080*/
/* directives/mask.js */

(function () {
    Vue.directive('mask', {
        componentUpdated(el, binding, vnode) {
        },
        inserted(el, binding, vnode) {
        }
    });
})();


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180314-7131*/
/* directives/resize.js */

Vue.directive('resize', {
	unbind(el, binding, vnode) {
		let p = el._parts;
		if (p.mouseDown) {
			el.removeEventListener('mousedown', p.mouseDown, false);
		}
	},
	bind(el, binding, vnode) {

		Vue.nextTick(function () {

			const minWidth = 20;
			const handleWidth = 6;

			function findHandle(el) {
				for (let ch of el.childNodes) {
					if (ch.nodeType === Node.ELEMENT_NODE) {
						if (ch.classList.contains('drag-handle'))
							return ch;
					}
				}
				return null;
			}

			let grid = el.parentElement;

			let minPaneWidth = Number.parseFloat(el.getAttribute('data-min-width'));
			let minSecondPaneWidth = Number.parseFloat(el.getAttribute('second-min-width'));
			if (isNaN(minPaneWidth))
				minPaneWidth = minWidth;
			if (isNaN(minSecondPaneWidth))
				minSecondPaneWidth = minWidth;


			let parts = {
				grid: grid,
				handle: findHandle(grid),
				resizing: false,
				minWidth: minPaneWidth,
				minWidth2: minSecondPaneWidth,
				mouseDown: mouseDown,
				offsetX(event) {
					let rc = this.grid.getBoundingClientRect();
					return event.clientX - rc.left;
				},
				fitX(x) {
					if (x < this.minWidth)
						x = this.minWidth;
					let tcx = this.grid.clientWidth;
					if (x + handleWidth + this.minWidth2 > tcx)
						x = tcx - this.minWidth2 - handleWidth;
					return x;
				}
			};

			if (!parts.handle) {
				console.error('Resize handle not found');
				return;
			}

			el._parts = parts;

			function mouseUp(event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				event.preventDefault();
				p.handle.style.display = 'none';
				p.grid.style.cursor = 'default';
				let x = p.offsetX(event);
				x = p.fitX(x);
				p.grid.style.gridTemplateColumns = `${x}px ${handleWidth}px 1fr`;

				document.removeEventListener('mouseup', mouseUp);
				document.removeEventListener('mousemove', mouseMove);

				p.resizing = false;
			}

			function mouseMove(event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				event.preventDefault();
				let x = p.offsetX(event);
				x = p.fitX(x);
				p.handle.style.left = x + 'px';
			}

			function mouseDown(event) {
				let p = el._parts;
				if (p.resizing)
					return;
				let t = event.target;
				if (!t.classList.contains('spl-handle')) {
					console.error('click out of splitter handle');
					return;
				}
				event.preventDefault();
				let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
				document.addEventListener('mouseup', mouseUp, false);
				document.addEventListener('mousemove', mouseMove, false);
				p.resizing = true;
			}
			el.addEventListener('mousedown', mouseDown, false);

		});
	}
});


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180413-7156
// controllers/base.js

(function () {


	// TODO: delete this.__queryChange

	const eventBus = require('std:eventBus');
	const utils = require('std:utils');
	const dataservice = require('std:dataservice');
	const urltools = require('std:url');
	const log = require('std:log');
	const locale = window.$$locale;

	const store = component('std:store');
	const documentTitle = component("std:doctitle");

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

	function getPagerInfo(mi) {
		if (!mi) return undefined;
		let x = { PageSize: mi.PageSize, Offset: mi.Offset, Dir: mi.SortDir, Order: mi.SortOrder };
		if (mi.Filter)
			for (let p in mi.Filter) {
				let fVal = mi.Filter[p];
				if (!fVal) continue; // empty value, skip it
				x[p] = fVal;
			}
		return x;
	}

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
				__baseQuery__: {},
				__requestsCount__: 0
			};
		},

		computed: {
			$baseUrl() {
				return this.$data.__baseUrl__;
			},
			$baseQuery() {
				return this.$data.__baseQuery__;
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
			},
			$canSave() {
				return this.$isDirty && !this.$isLoading;
			}
		},
		methods: {
			$marker() {
				return true;
			},
			$exec(cmd, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				const root = this.$data;
				root._exec_(cmd, arg, confirm, opts);
				return;
                /*
                const doExec = () => {
                    let root = this.$data;
                    if (!confirm)
                        root._exec_(cmd, arg, confirm, opts);
                    else
                        this.$confirm(confirm).then(() => root._exec_(cmd, arg));
                }

                if (opts && opts.saveRequired && this.$isDirty) {
                    this.$save().then(() => doExec());
                } else {
                    doExec();
                }
                */
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
				return root._canExec_(cmd, arg, opts);
			},
			$save(opts) {
				if (this.$data.$readOnly)
					return;
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/_data/save';
				let urlToSave = this.$indirectUrl || this.$baseUrl;
				return new Promise(function (resolve, reject) {
					let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
					let wasNew = self.$baseUrl.indexOf('/new') !== -1;
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
						if (opts && opts.toast)
							self.$toast(opts.toast);
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
					});
				});
			},

			$reload(args) {
				//console.dir('$reload was called for' + this.$baseUrl);
				let self = this;
				if (utils.isArray(args) && args.$isLazy()) {
					// reload lazy
					let propIx = args._path_.lastIndexOf('.');
					let prop = args._path_.substring(propIx + 1);
					args.$loaded = false; // reload
					return self.$loadLazy(args.$parent, prop);
				}
				let root = window.$$rootUrl;
				let url = root + '/_data/reload';
				let dat = self.$data;
				let mi = args ? getPagerInfo(args.$ModelInfo) : null;
				return new Promise(function (resolve, reject) {
					let dataToQuery = { baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi) };
					if (utils.isDefined(dat.Query)) {
						// special element -> use url
						dataToQuery.baseUrl = urltools.replaceUrlQuery(self.$baseUrl, dat.Query);
						let newUrl = urltools.replaceUrlQuery(null/*current*/, dat.Query);
						window.history.replaceState(null, null, newUrl);
					}
					let jsonData = utils.toJson(dataToQuery);
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat._setModelInfo_(undefined, data);
							dat._fireLoad_();
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
				if (this.$data.$readOnly)
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
				if (this.$data.$readOnly)
					return;
				let item = arr.$selected;
				if (!item)
					return;
				this.$remove(item, confirm);
			},
			$mailto(arg, subject) {
				let href = 'mailto:' + arg;
				if (subject)
					href += '?subject=' + urltools.encodeUrl(subject);
				return href;
			},
			$href(url, data) {
				let dataToHref = data;
				if (utils.isObjectExact(dataToHref))
					dataToHref = dataToHref.$id;
				let retUrl = urltools.combine(url, dataToHref);
				return retUrl;
			},
			$navigate(url, data, newWindow) {
				let urlToNavigate = urltools.createUrlForNavigate(url, data);
				if (newWindow === true) {
					window.open(urlToNavigate, "_blank");
				}
				else
					this.$store.commit('navigate', { url: urlToNavigate });
			},

			$replaceId(newId) {
				this.$store.commit('setnewid', { id: newId });
				// and in the __baseUrl__
				//urlTools.replace()
				this.$data.__baseUrl__ = self.$data.__baseUrl__.replace('/new', '/' + newId);
			},

			$dbRemove(elem, confirm) {
				if (!elem)
					return;
				let id = elem.$id;
				let lazy = elem.$parent.$isLazy ? elem.$parent.$isLazy() : false;
				let root = window.$$rootUrl;
				const self = this;

				function lastProperty(path) {
					let pos = path.lastIndexOf('.');
					if (pos === -1)
						return undefined;
					return path.substring(pos + 1);
				}

				function dbRemove() {
					let postUrl = root + '/_data/dbRemove';
					let jsonObj = { baseUrl: self.$baseUrl, id: id };
					if (lazy) {
						jsonObj.prop = lastProperty(elem.$parent._path_);
					}
					let jsonData = utils.toJson(jsonObj);
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
				this.$dbRemove(sel, confirm);
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
					this.$alert(msg.substring(3).replace('\\n', '\n'));

				else
					alert(msg);
			},

			$toast(toast) {
				if (!toast) return;
				eventBus.$emit('toast', toast);
			},

			$showDialog(url, arg, query, opts) {
				return this.$dialog('show', url, arg, query, opts);
			},


			$dialog(command, url, arg, query, opts) {
				if (this.$isReadOnly(opts))
					return;
				const that = this;
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

				function simpleMerge(target, src) {
					for (let p in target) {
						if (p in src) 
							target[p] = src[p];
						else
							target[p] = undefined;
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
							return __runDialog(url, arg, query, (result) => {
								if (arg.$merge) {
									arg.$merge(result);
								} else {
									simpleMerge(arg, result);
								}
							});
						case 'edit-selected':
							if (argIsNotAnArray()) return;
							return __runDialog(url, arg.$selected, query, (result) => { arg.$selected.$merge(result); });
						case 'edit':
							if (argIsNotAnObject()) return;
							return __runDialog(url, arg, query, (result) => { arg.$merge(result); });
						default: // simple show dialog
							return __runDialog(url, arg, query, () => { });
					}
				}

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				if (opts && opts.saveRequired && this.$isDirty) {
					let dlgResult = null;
					this.$save().then(() => { dlgResult = doDialog(); });
					return dlgResult;
				}
				return doDialog();
			},

			$export() {
				const self = this;
				const root = window.$$rootUrl;
				let url = self.$baseUrl;
				url = url.replace('/_page/', '/_export/');
				window.location = root + url;
			},

			$report(rep, arg, opts) {
				if (this.$isReadOnly(opts)) return;

				let cmd = opts.export ? 'export' : 'show';

				const doReport = () => {
					let id = arg;
					if (arg && utils.isObject(arg))
						id = arg.$id;
					const root = window.$$rootUrl;
					let url = `${root}/report/${cmd}/${id}`;
					let reportUrl = this.$indirectUrl || this.$baseUrl;
					let baseUrl = urltools.makeBaseUrl(reportUrl);
					let qry = { base: baseUrl, rep: rep };
					url = url + urltools.makeQueryString(qry);
					// open in new window
					if (opts.export)
						window.location = url;
					else
						window.open(url, '_blank');
				};

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				if (opts && opts.saveRequired && this.$isDirty) {
					this.$save().then(() => doReport());
				} else {
					doReport();
				}
			},

			$modalSaveAndClose(result, opts) {
				if (this.$isDirty) {
					const root = this.$data;
					if (opts && opts.validRequired && root.$invalid) {
						this.$alert(locale.$MakeValidFirst);
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

			$saveAndClose(opts) {
				if (this.$isDirty)
					this.$save(opts).then(() => this.$close());
				else
					this.$close();
			},

			$close() {
				if (this.$saveModified())
					this.$store.commit("close");
			},

			$showHelp(path) {
				window.open(this.$helpHref(path), "_blank");
			},

			$helpHref(path) {
				return urltools.helpHref(path);
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
				let dlg = {
					message: locale.$ElementWasChanged,
					title: locale.$ConfirmClose,
					buttons: [
						{ text: locale.$Save, result: "save" },
						{ text: locale.$NotSave, result: "close" },
						{ text: locale.$Cancel, result: false }
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

			$format(value, dataType, format, options) {
				if (!format && !dataType)
					return value;
				if (dataType)
					value = utils.format(value, dataType, options && options.hideZeros);
				if (format && format.indexOf('{0}') !== -1)
					return format.replace('{0}', value);
				return value;
			},

			$expand(elem, propName) {
				let arr = elem[propName];
				if (arr.$loaded)
					return;
				if (!utils.isDefined(elem.$hasChildren))
					return; // no $hasChildren property - static expand
				let self = this,
					root = window.$$rootUrl,
					url = root + '/_data/expand',
					jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id });

				dataservice.post(url, jsonData).then(function (data) {
					let srcArray = data[propName];
					arr.$empty();
					for (let el of srcArray)
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
					selfMi = elem[propName].$ModelInfo,
					parentMi = elem.$parent.$ModelInfo;

				// HACK. inherit filter from parent
				/*
				if (parentMi && parentMi.Filter) {
					if (!selfMi)
						selfMi = parentMi;
					else
						selfMi.Filter = parentMi.Filter;
				}
				*/

				let mi = getPagerInfo(selfMi);
				let xQuery = urltools.parseUrlAndQuery(self.$baseUrl, mi);
				let newUrl = xQuery.url + urltools.makeQueryString(mi);
				//console.dir(newUrl);
				//let jsonData = utils.toJson({ baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi), id: elem.$id, prop: propName });
				let jsonData = utils.toJson({ baseUrl: newUrl, id: elem.$id, prop: propName });

				return new Promise(function (resolve, reject) {
					let arr = elem[propName];
					if (arr.$loaded) {
						resolve(arr);
						return;
					}
					dataservice.post(url, jsonData).then(function (data) {
						if (propName in data) {
							arr.$empty();
							for (let el of data[propName])
								arr.push(arr.$new(el));
							let rcName = propName + '.$RowCount';
							if (rcName in data) {
								arr.$RowCount = data[rcName];
							}
							arr._root_._setModelInfo_(arr, data);
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
			},

			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__cwChange(source) {
				this.$reload(source);
			},
			__queryChange(search, source) {
				// preserve $baseQuery (without data from search)
				if (!utils.isObjectExact(search)) {
					console.error('base.__queryChange. invalid argument type');
				}
				let nq = Object.assign({}, this.$baseQuery);
				for (let p in search) {
					if (search[p]) {
						// replace from search
						nq[p] = search[p];
					}
					else {
						// undefined element, delete from query
						delete nq[p];
					}
				}
				this.$data.__baseUrl__ = this.$store.replaceUrlSearch(this.$baseUrl, urltools.makeQueryString(nq));
				this.$reload(source);
			},
			__doInit__() {
				const root = this.$data;
				if (!root._modelLoad_) return;
				let caller = null;
				if (this.$caller)
					caller = this.$caller.$data;
				root._modelLoad_(caller);
				root._seal_(root);
			}
		},
		created() {
			let out = { caller: null };
			eventBus.$emit('registerData', this, out);
			this.$caller = out.caller;

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);
			eventBus.$on('queryChange', this.__queryChange);

			// TODO: delete this.__queryChange
			this.$on('localQueryChange', this.__queryChange);
			this.$on('cwChange', this.__cwChange);
			this.__asyncCache__ = {};
			log.time('create time:', __createStartTime, false);
		},
		beforeDestroy() {
		},
		destroyed() {
			//console.dir('base.js has been destroyed');
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			this.$off('localQueryChange', this.__queryChange);
			this.$off('cwChange', this.__cwChange);
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
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180408-7152*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const popup = require('std:popup');
	const urlTools = require('std:url');
	const log = require('std:log');
	const utils = require('std:utils');
	const locale = window.$$locale;

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
		if (sUrl.length >= 4)
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
		<a :href="itemHref(item)" tabindex="-1" v-text="item.Name" @click.prevent="navigate(item)"></a>
	</li>
	<li class="aligner"></li>
	<li :title="locale.$Help"><a :href="helpHref()" class="btn-help" @click.prevent="showHelp()"><i class="ico ico-help"></i></a></li>
</ul>
`,
		props: {
			menu: Array
		},
		computed:
		{
			seg0: () => store.getters.seg0,
			locale() { return locale }
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
				this.$store.commit('navigate', { url: url, title: opts.title });
			},
			showHelp() {
				window.open(this.helpHref(), "_blank");
			},
			helpHref() {
				let am = this.menu.find(x => this.isActive(x));
				if (am && am.Help)
					return urlTools.helpHref(am.Help);
				return urlTools.helpHref('');
			}
		}
	};


	const sideBarBase = {
		props: {
			menu: Array
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			cssClass() {
				return this.$parent.sideBarCollapsed ? 'collapsed' : 'expanded';
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
			navigate(item) {
				if (this.isActive(item))
					return;
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.Url, item.Url);
					if (item.Url.indexOf('/') === -1) {
						// save only simple path
						try {
							// avoid EDGE error QuotaExceeded
							localStorage.setItem('menu:' + urlTools.combine(window.$$rootUrl, top.Url), item.Url);
						}
						catch (e) {
							// do nothing
						}
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
				try {
					// avoid EDGE error QuotaExceeded
					localStorage.setItem('sideBarCollapsed', this.$parent.sideBarCollapsed);
				}
				catch (e) {
					// do nothing
				}
			}
		}
	};

	const a2SideBarCompact = {
		template: `
<div class='side-bar-compact' :class="cssClass">
	<a href role="button" class="collapse-button" @click.prevent="toggle"></a>
	<ul class='side-menu'>
		<li v-for='(itm, itmIx) in sideMenu' :class="{active: isActive(itm)}" :key="itmIx">
			<a :href="itemHref(itm)" :title="itm.Name" @click.prevent='navigate(itm)'><i :class="'ico ico-' + itm.Icon"></i> <span v-text='itm.Name'></span></a>
		</li>
	</ul>
</div>
`,
		mixins: [sideBarBase],
		computed: {
		},
		methods: {
		}
	};

	const a2SideBar = {
		// TODO: 
		// 1. разные варианты меню
		// 2. folderSelect как функция 
		template: `
<div class="side-bar" :class="cssClass">
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
		mixins: [sideBarBase],
		computed: {
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
			}
		},
		methods: {
			folderSelect(item) {
				return !!item.Url;
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
<div :class="cssClass" class="main-view">
	<a2-nav-bar :menu="menu" v-show="navBarVisible"></a2-nav-bar>
	<component :is="sideBarComponent" :menu="menu" v-show="sideBarVisible"></component>
	<a2-content-view></a2-content-view>
	<div class="load-indicator" v-show="pendingRequest"></div>
	<div class="modal-stack" v-if="hasModals">
		<div class="modal-wrapper" v-for="dlg in modals">
			<a2-modal :dialog="dlg"></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-nav-bar': a2NavBar,
			'a2-side-bar': a2SideBar,
			'a2-side-bar-compact': a2SideBarCompact,
			'a2-content-view': contentView,
			'a2-modal': modal,
			'a2-toastr' : toastr
		},
		props: {
			menu: Array,
			sideBarMode: String
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
			isSideBarCompact() {
				return this.sideBarMode === 'Compact';
			},
			sideBarInitialCollapsed() {
				let sb = localStorage.getItem('sideBarCollapsed');
				if (sb === 'true')
					return true;
				return false;
			},
			sideBarComponent() {
				return this.isSideBarCompact ? 'a2-side-bar-compact' : 'a2-side-bar';
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
				let clpscls = this.isSideBarCompact ? 'side-bar-compact-' : 'side-bar-';
				return clpscls + (this.sideBarCollapsed ? 'collapsed' : 'expanded');
			},
			pendingRequest() { return this.requestsCount > 0; },
			hasModals() { return this.modals.length > 0; }
		},
		created() {
			if (!this.menu) {
				alert('access denied');
				//window.location.assign('/account/login');
				return;
			}
			this.sideBarCollapsed = this.sideBarInitialCollapsed;
			let opts = { title: null };
			let newUrl = makeMenuUrl(this.menu, urlTools.normalizeRoot(window.location.pathname), opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

			let firstUrl = {
				url: '',
				title: ''
			};

			firstUrl.url = makeMenuUrl(this.menu, '/', opts);
			firstUrl.title = opts.title;
			urlTools.firstUrl = firstUrl;

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
				dataCounter: 0,
				traceEnabled: log.traceEnabled()
			};
		},
		computed: {
			processing() { return this.requestsCount > 0; },
			modelStack() {
				return this.__dataStack__;
			}
		},
		watch: {
			traceEnabled(val) {
				log.enableTrace(val);
			}
		},
		methods: {
			about() {
				this.$store.commit('navigate', { url: '/app/about' });
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
				if (!window.$$debug) return;
				this.debugShowModel = false;

				this.debugShowTrace = !this.debugShowTrace;
			},
			debugModel() {
				if (!window.$$debug) return;
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
			},
			changePassword() {
				const dlgData = {
					promise: null, data: { Id: -1 }
				};
				eventBus.$emit('modal', '/app/changePassword', dlgData);
				dlgData.promise.then(function (result) {
					if (result === false)
						return;
					//alert(result);
					//console.dir(result);
				});
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