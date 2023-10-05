// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

// 20230517-7933
/* platform/routplain.js */

(function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	function replaceUrlSearch(url, search) {
		let parts = url.split('?');
		return parts[0] + (search || '');
	}

	function replaceUrlQuery(url, query) {
		return replaceUrlSearch(url, urlTools.makeQueryString(query));
	}

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
		let path = '/';
		return urlTools.normalizeRoot(path);
	}

	class StoreClass {
		constructor(elem) {
			this.root = elem;
			this.parseQueryString = urlTools.parseQueryString;
			this.makeQueryString = urlTools.makeQueryString;
			this.replaceUrlSearch = replaceUrlSearch;
			this.replaceUrlQuery = replaceUrlQuery;
			this.makeBackUrl = makeBackUrl;
			this.route = '';
			this.query = {}
		}

		commit(name, state) {
			this[name](state);
		}

		setroute(url) {
			this.route = url;
		}

		navigate(url) {
			this.route = url;
			eventBus.$emit('closeAllPopups');
			eventBus.$emit('modalCloseAll');
			eventBus.$emit('showSidePane', null);
			eventBus.$emit('navigateto', url);
		}

		close() {
			eventBus.$emit('closePlain', { root: this.root });
		}

		setnewid(to) {
			let oldRoute = this.route;
			let newRoute = urlTools.replaceSegment(oldRoute, to.id, to.action);
			this.route = newRoute;
			eventBus.$emit('setnewid', { from: oldRoute, to: newRoute });
		}
	};

	const store = {
		create(elem) {
			return new StoreClass(elem);
		}
	};

	let storeOld = {
		state: {
			route: normalizedRoute(),
			query: urlTools.parseQueryString('')
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
			query: function (state, query) {
				// changes all query
				let root = window.$$rootUrl;
				state.query = Object.assign({}, query);
				let newUrl = root + state.route + urlTools.makeQueryString(state.query);
			},
			setquery: function (state, query) {
				// TODO: replaceUrl: boolean
				// changes some fields or query
				let root = window.$$rootUrl;
				let oldUrl = root + this.getters.baseUrl;
				state.query = Object.assign({}, state.query, query);
				let newUrl = root + this.getters.baseUrl;
				if (newUrl === oldUrl) return;
				eventBus.$emit('queryChange', state.query);
			},
			setstate: function (state, to) { // to: {url, title}
				state.route = normalizedRoute();
				state.query = urlTools.parseQueryString('');
				setTitle(to);
			},
			setnewid: function (state, to) {
				let oldRoute = state.route;
				let newRoute = urlTools.replaceSegment(oldRoute, to.id, to.action);
				state.route = newRoute;
				eventBus.$emit('setnewid', { from: oldRoute, to: newRoute });
			},
			close: function (state) {
				eventBus.$emit('closePlain', { root: this.root });
			}
		}
	};

	function replaceBrowseUrl(newUrl) {
		// do nothing
	}

	store.parseQueryString = urlTools.parseQueryString;
	store.makeQueryString = urlTools.makeQueryString;
	store.replaceUrlSearch = replaceUrlSearch;
	store.replaceUrlQuery = replaceUrlQuery;
	store.makeBackUrl = makeBackUrl;
	store.replaceBrowseUrl = replaceBrowseUrl;

	app.components['std:store'] = store;
})();