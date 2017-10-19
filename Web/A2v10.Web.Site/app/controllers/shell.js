/*20171019-7051*/
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
		let am = null;
		if (seg1)
			am = menu.find((mi) => mi.Url === seg1);
        if (!am) {
            // no segments - find first active menu
            let parentMenu = { Url: '' };
            am = findMenu(menu, (mi) => mi.Url && !mi.Menu, parentMenu);
			if (am) {
				opts.title = am.Title;
				return urlTools.combine(url, parentMenu.Url, am.Url);
			}
		} else if (am && !am.Menu) {
			opts.title = am.Title;
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
			opts.title = am.Title;
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
					this.$store.commit('navigate', { url: url, title: item.Title });
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
            log.loadSession();
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

			eventBus.$on('registerData', function (component, out) {
                if (component) {
                    if (me.__dataStack__.length > 0)
                        out.caller = me.__dataStack__[0];
                    me.__dataStack__.push(component);
                } else
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