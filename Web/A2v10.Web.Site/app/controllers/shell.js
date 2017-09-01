/*20170901-7022*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const popup = require('std:popup');

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

	function combineUrl(u1, u2)
	{
		u2 = u2 || '';
		let rv = u1 || '/';
		if (rv.endsWith('/'))
			rv += u2;
		else
			rv += '/' + u2;
		return rv;
	}

	function makeMenuUrl(menu, url, opts) {
		opts = opts || {};
		if (!url.startsWith('/'))
			url = '/' + url;
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
				return combineUrl(url, am.url);
			}
		} else if (am && !am.menu) {
			opts.title = am.title;
			return url; // no sub menu
		}
		url = combineUrl('/', seg1);
		let seg2 = sUrl[2];
		if (!seg2) {
			// find first active menu in am.menu
			am = findMenu(am.menu, (mi) => mi.url && !mi.menu);
		} else {
			// find current active menu in am.menu
			am = findMenu(am.menu, (mi) => mi.url === seg2);
		}
		if (am) {
			opts.title = am.title;
			return combineUrl(url, am.url);
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
			itemHref: (item) => '/', // TODO: findHref
			navigate(item) {
				let opts = { title: null };
				this.$store.commit('navigate', { url: makeMenuUrl(this.menu, item.url, opts), title:  opts.title});
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
					let url = '/' + top.url + '/' + item.url;
					this.$store.commit('navigate', { url: url, title: item.title });
				}
				else
					console.error('no top menu found');
			},
			itemHref(item) {
				// TODO:
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
				return '/_page' + url + store.getters.search;
			},
			cssClass() {
				let route = this.$store.getters.route;
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
			// todo: find first URL
			// pathname, not route
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
				// TODO: Path.combine
				let id = '0';
				if (prms && prms.data && prms.data.Id) {
					id = prms.data.Id;
					// TODO: get correct ID
				}
				let url = '/_dialog/' + modal + '/' + id;
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