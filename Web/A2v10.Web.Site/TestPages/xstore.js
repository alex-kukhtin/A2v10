
(function() {

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

	function normalizeUrl(url) {
		// home (1)
		// catalog/suppliers (2)
		// home/edit/0     (3)
		// catalog/suppliers/edit/0 (4)
	}

	/**
состояние приложения:
		route : '/edit/view'
		query: {
			dir:'asc',
			order: 'Name'
		}
		pageUrl: '_page/catalog/suppliers?dir=asc&Order=Name'

действия:
	navigate(route, query) -> переход по меню.
	setQuery(query) -> вызывается при изменении только search,
			без изменения route
		- поиск query в LocalStorage
	replaceUrl()

	изменение route ДОБАВЛЯЕТ history.state и pageUrl -> это
	приводит к перезагрузке текущей активной страницы

	изменение search ЗАМЕНЯЕТ history.state и меняет только объект search
	(и записывает его в LocalStorage)
	это обновляет UI на странице, но ничего не перезагружает

	navigate не занимается поиском в меню и не подставляет 
	*/

	const xstore = new Vuex.Store({
		state: {
			// todo:
			route: window.location.pathname,
			search: ''
		},
		getters: {
			route(state) {
				return state.route;
			},
			search(state) {
				return state.search;
			},
			pageUrl(state) {

			},
			segment0(state) {
				return state.route.split('/')[1];
			},
			segment1(state) {
				return state.route.split('/')[2];
			}
		},
		mutations: {
			navigate(state, url, query) {
				let fullUrl = url + makeQueryString(query);
				state.route = url;
				state.query = query;
				window.history.pushState(null, null, fullUrl);
			}
		},
		actions: {
			navigateMenu() {

			},
			setQuery() {

			}
		}
	});

	new Vue({
		el: '#app',
		store : xstore,
		computed: {
			route() {
				return this.$store.getters.route;
			},
			segment0() {
				return this.$store.getters.segment0;
			},
			segment1() {
				return this.$store.getters.segment1;
			},
			query() {
				return this.$store.getters.query;
			}
		},
		methods: {
			navigate() {
				this.$store.commit('navigate', '/catalog/suppliers', {x:5, text:'i am the text'});
			}
		}
	});
})();