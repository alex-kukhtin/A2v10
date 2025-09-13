﻿// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

/*20250913-7983*/
/* services/url.js */

app.modules['std:url'] = function () {

	const utils = require('std:utils');
	const period = require('std:period');

	return {
		combine,
		makeQueryString,
		parseQueryString,
		normalizeRoot,
		idChangedOnly,
		idOrCopyChanged,
		makeBaseUrl,
		parseUrlAndQuery,
		replaceUrlQuery,
		createUrlForNavigate,
		firstUrl: '',
		encodeUrl: encodeURIComponent,
		helpHref,
		replaceSegment,
		removeFirstSlash,
		isNewPath,
		splitCommand
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

	function removeFirstSlash(url) {
		if (url && url.startsWith && url.startsWith('/'))
			return url.substring(1);
		return url;
	}
	function combine(...args) {
		return '/' + args.map(normalize).filter(x => !!x).join('/');
	}

	function toUrl(obj) {
		if (!utils.isDefined(obj) || obj === null) return '';
		if (utils.isDate(obj)) {
			return utils.format(obj, "DateUrl");
		} else if (period.isPeriod(obj)) {
			return obj.format('DateUrl');
		} else if (Array.isArray(obj)) {
			return obj.map(x => x.Id).join(',');
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

		function isNewPathArr(arr) {
			let ai = arr[arr.length - 1];
			return ai === 'new' || ai === '0';
		}

		if (isNewPathArr(os) && !isNewPathArr(ns)) {
			if (ns.slice(0, ns.length - 1).join('/') === os.slice(0, os.length - 1).join('/'))
				return true;
		}

		return false;
	}

	function idOrCopyChanged(newUrl, oldUrl) {
		let n1 = (newUrl || '').split('?')[0];
		let o1 = (oldUrl || '').split('?')[0];
		let ns = n1.split('/');
		let os = o1.split('/');
		if (ns.length !== os.length)
			return false;
		// remove id
		ns.pop();
		os.pop();
		if (ns.pop() === 'edit' && os.pop() === 'copy') {
			return ns.join('/') === os.join('/');
		}
		return false;
	}

	function makeBaseUrl(url) {
		let x = (url || '').split('/');
		let len = x.length;
		if (len >= 6)
			return x.slice(2, len - 2).join('/');
		return url;
	}

	function parseUrlAndQuery(url, querySrc) {
		let query = {};
		for (let p in querySrc) {
			if (p.startsWith('_') || p.startsWith('$')) continue;
			query[p] = toUrl(querySrc[p]); // all values are string
		}
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
		// special behaviour for main menu urls
		if (url.split('/').length === 3 && urlId === 'new')
			urlId = '';
		return combine(url, urlId) + qs;
	}

	function helpHref(path) {
		let helpUrlElem = document.querySelector('meta[name=helpUrl]');
		if (!helpUrlElem || !helpUrlElem.content) {
			console.warn('help url is not specified');
			return '';
		}
		return helpUrlElem.content + (path || '');
	}

	function replaceId(url, newId) {
		alert('todo::replaceId');
	}

	function isDialogPath(url) {
		return url.startsWith('/_dialog/');
	}

	function replaceSegment(url, id, action) {
		let parts = url.split('/');
		if (isDialogPath(url)) {
			parts.pop();
			if (id)
				parts.push(id);
		} else {
			if (action) parts.pop();
			if (id) parts.pop();
			if (action) parts.push(action);
			if (id) parts.push(id);
		}
		return parts.join('/');
	}

	function isNewPath(url) {
		url = url.split('?')[0]; // first segment
		if (!url) return false;
		if (url.indexOf('/new') !== -1)
			return true;
		if (isDialogPath(url) && url.endsWith('/0'))
			return true;
		return false;
	}

	function splitCommand(url) {
		let seg = url.split('/');
		let action = seg.pop();
		return {
			action,
			url: seg.join('/')
		};
	}
};





