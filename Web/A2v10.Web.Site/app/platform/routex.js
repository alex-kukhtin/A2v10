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
				let newRoute = urlTools.replaceSegment(oldRoute, to.id, to.action);
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