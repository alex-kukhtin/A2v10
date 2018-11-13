// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181112-7353*/
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
	<li v-if="hasHelp()" :title="locale.$Help"><a :href="helpHref()" class="btn-help" aria-label="Help" @click.prevent="showHelp()"><i class="ico ico-help"></i></a></li>
</ul>
`,
		props: {
			menu: Array
		},
		computed: {
			seg0: () => store.getters.seg0,
			locale() { return locale; }
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
			},
			hasHelp() {
				let am = this.menu.find(x => this.isActive(x));
				return am && am.Help;
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
	<a href role="button" aria-label="Expand/Collapse Side bar" class="collapse-button" @click.prevent="toggle"></a>
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
			'a2-toastr': toastr
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
				//if (me.hasModals)
					//return;
				me.requestsCount += 1;
			});
			eventBus.$on('endRequest', function () {
				//if (me.hasModals)
					//return;
				me.requestsCount -= 1;
			});

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				url = store.replaceUrlQuery(url, prms.query);
				let dlg = { title: "dialog", url: url, prms: prms.data };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});

			eventBus.$on('modaldirect', function (modal, prms) {
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal);
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
				feedbackVisible: false,
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
			appLink(lnk) {
				this.$store.commit('navigate', { url: lnk.url });
			},
			navigate(url) {
				this.$store.commit('navigate', { url: url });
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
				this.feedbackVisible = false;
				this.debugShowTrace = !this.debugShowTrace;
			},
			debugModel() {
				if (!window.$$debug) return;
				this.debugShowTrace = false;
				this.feedbackVisible = false;
				this.debugShowModel = !this.debugShowModel;
			},
			debugClose() {
				this.debugShowModel = false;
				this.debugShowTrace = false;
				this.feedbackVisible = false;
			},
			showFeedback() {
				this.debugShowModel = false;
				this.debugShowTrace = false;
				this.feedbackVisible = !this.feedbackVisible;
			},
			feedbackClose() {
				this.feedbackVisible = false;
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
					eventBus.$emit('toast', {
						text: locale.$ChangePasswordSuccess, style: 'success'
					});

				});
			},
			$alert(msg, title, list) {
				let dlgData = {
					promise: null, data: {
						message: msg, title: title, style: 'alert', list: list
					}
				};
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
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