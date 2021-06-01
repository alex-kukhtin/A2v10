// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210601-7778*/
/* controllers/mainview.js */

(function () {

	const store = component('std:store');
	const period = require('std:period');
	const eventBus = require('std:eventBus');

	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const utils = require('std:utils');

	const platform = require('std:platform');
	const navBar = component('std:navbar');
	const sideBar = component('std:sidebar');
	const urlTools = require('std:url');
	const menu = component('std:navmenu');
	const locale = window.$$locale;

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
				if (url === '/')
					return; // no views here
				let len = store.getters.len;
				if (len === 2 || len === 3)
					url += '/index/0';
				return urlTools.combine(root, '/_page', url) + store.getters.search;
			},
			cssClass() {
				let route = this.$store.getters.route;
				if (route.seg0 === 'app')
					return 'full-view';
				if (menu.isSeparatePage(this.pages, route.seg0))
					return 'full-view';
				return route.len === 3 ? 'partial-page' :
					route.len === 2 ? 'full-page' : 'full-view';
			}
		},
		props: {
			pages: String
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
<div :class=cssClass class=main-view>
	<component :is=navBarComponent :title=title :menu=menu v-if=isNavBarVisible 
		:period=period :is-navbar-menu=isNavBarMenu></component>
	<component :is=sideBarComponent v-if=sideBarVisible :menu=menu :mode=sideBarMode></component>
	<a2-content-view :pages=pages></a2-content-view>
	<div class=load-indicator v-show=pendingRequest></div>
	<div class=modal-stack v-if=hasModals>
		<div class="modal-wrapper modal-animation-frame" v-for="dlg in modals" :class="{show: dlg.wrap}">
			<a2-modal :dialog=dlg></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-nav-bar': navBar.standardNavBar,
			'a2-nav-bar-page': navBar.pageNavBar,
			'a2-side-bar': sideBar.standardSideBar,
			'a2-side-bar-compact': sideBar.compactSideBar,
			'a2-side-bar-tab': sideBar.tabSideBar,
			'a2-content-view': contentView,
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
			menu: Array,
			sideBarMode: String,
			navBarMode: String,
			period: period.constructor,
			pages: String,
			title: String
		},
		data() {
			return {
				sideBarCollapsed: false,
				showNavBar: true,
				requestsCount: 0,
				modals: [],
				modalRequeryUrl: ''
			};
		},
		computed: {
			navBarComponent() {
				return this.isNavBarMenu ? 'a2-nav-bar-page' : 'a2-nav-bar';
			},
			sideBarComponent() {
				if (this.sideBarMode === 'Compact')
					return 'a2-side-bar-compact';
				else if (this.sideBarMode === 'TabBar')
					return 'a2-side-bar-tab';
				return 'a2-side-bar';
			},
			isSideBarCompact() {
				return this.sideBarMode === 'Compact';
			},
			route() {
				return this.$store.getters.route;
			},
			sideBarInitialCollapsed() {
				let sb = localStorage.getItem('sideBarCollapsed');
				if (sb === 'true')
					return true;
				// auto collapse for tablet
				if (!window.matchMedia('(min-width:1025px)').matches)
					return true;
				return false;
			},
			isNavBarVisible() {
				if (!this.showNavBar) return false;
				if (this.isNavBarMenu) return true;
				let route = this.route;
				if (menu.isSeparatePage(this.pages, route.seg0)) return false;
				return route.seg0 !== 'app' && (route.len === 2 || route.len === 3);
			},
			sideBarVisible() {
				let route = this.route;
				return route.seg0 !== 'app' && route.len === 3;
			},
			isSideBarTop() {
				return this.sideBarMode === 'TabBar';
			},
			cssClass() {
				let cls = (this.isNavBarMenu ? 'nav-bar-menu ' : '') +
					'side-bar-position-' + (this.isSideBarTop ? 'top ' : 'left ');
				if (this.isSideBarTop)
					cls += !this.sideBarVisible ? 'side-bar-hidden' : '';
				else
					cls += this.sideBarCollapsed ? 'collapsed' : 'expanded';
				return cls;
			},
			pendingRequest() { return !this.hasModals && this.requestsCount > 0; },
			hasModals() { return this.modals.length > 0; },
			isNavBarMenu() { return this.navBarMode === 'Menu'; }
		},
		methods: {
			setupWrapper(dlg) {
				this.modalRequeryUrl = '';
				setTimeout(() => {
					dlg.wrap = true;
					//console.dir("wrap:" + dlg.wrap);
				}, 50); // same as modal
			},
			showNavMenu(bShow) {
				if (bShow)
					eventBus.$emit('closeAllPopups');
				this.showNavBar = bShow;
			}
		},
		created() {
			let me = this;
			if (this.isNavBarMenu)
				this.showNavBar = false;
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

			function findRealDialog() {
				// skip alerts, confirm, etc
				for (let i = me.modals.length - 1; i >= 0; --i) {
					let md = me.modals[i];
					if (md.rd) {
						return md;
					}
				}
				return null;
			}

			if (this.isNavBarMenu)
				eventBus.$on('clickNavMenu', this.showNavMenu);

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				url = store.replaceUrlQuery(url, prms.query);
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap: false, rd: prms.rd };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
				me.setupWrapper(dlg);
			});

			eventBus.$on('modaldirect', function (modal, prms) {
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal);
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap: false };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
				me.setupWrapper(dlg);
			});

			eventBus.$on('modalSetAttribites', function (attr, instance) {
				if (!attr || !instance) return;
				let dlg = findRealDialog();
				if (!dlg) return;
				dlg.attrs = instance.__parseControllerAttributes(attr);
			});

			eventBus.$on('modalCreated', function (instance) {
				// include instance!
				let dlg = findRealDialog();
				if (!dlg) return;
				dlg.instance = instance;
			});

			eventBus.$on('isModalRequery', function (arg) {
				if (arg.url && me.modalRequeryUrl && me.modalRequeryUrl === arg.url)
					arg.result = true;
			});

			eventBus.$on('modalRequery', function (baseUrl) {
				let dlg = findRealDialog();
				if (!dlg) return;
				let inst = dlg.instance; // include instance
				if (inst && inst.modalRequery) {
					if (baseUrl)
						dlg.url = baseUrl;
					me.modalRequeryUrl = dlg.url;
					inst.modalRequery();
				}
			});

			eventBus.$on('modalSetBase', function (baseUrl) {
				let dlg = findRealDialog();
				if (!dlg) return;
				dlg.url = baseUrl;
			});

			eventBus.$on('modalClose', function (result) {

				if (!me.modals.length) return;
				// not real! any.
				if (me.requestsCount > 0) return;

				const dlg = me.modals[me.modals.length - 1];

				function closeImpl(closeResult) {
					let dlg = me.modals.pop();
					if (closeResult)
						dlg.resolve(closeResult);
				}

				if (!dlg.attrs) {
					closeImpl(result);
					return;
				}

				if (dlg.attrs.alwaysOk)
					result = true;

				if (dlg.attrs.canClose) {
					let canResult = dlg.attrs.canClose();
					//console.dir(canResult);
					if (canResult === true)
						closeImpl(result);
					else if (canResult.then) {
						result.then(function (innerResult) {
							if (innerResult === true)
								closeImpl(result);
							else if (innerResult) {
								closeImpl(innerResult);
							}
						});
					}
					else if (canResult)
						closeImpl(canResult);
				} else {
					closeImpl(result);
				}
			});

			eventBus.$on('modalCloseAll', function () {
				while (me.modals.length) {
					let dlg = me.modals.pop();
					dlg.resolve(false);
				}
			});

			eventBus.$on('confirm', function (prms) {
				let dlg = prms.data;
				dlg.wrap = false;
				dlg.promise = new Promise(function (resolve) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
				me.setupWrapper(dlg);
			});
			
			if (!this.menu) {
				let dlgData = {
					promise: null, data: {
						message: locale.$AccessDenied, title: locale.$Error, style: 'alert'
					}
				};
				eventBus.$emit('confirm', dlgData);
				dlgData.promise.then(function () {
					let root = window.$$rootUrl;
					let url = urlTools.combine(root, '/account/login');
					window.location.assign(url);
				});
				return;
			}

			this.sideBarCollapsed = this.sideBarInitialCollapsed;

			let opts = { title: null, pages: this.pages };
			let menuPath = urlTools.normalizeRoot(window.location.pathname);
			// fix frequent error
			if (menuPath === '/home' && this.menu && !this.menu.find(v => v.Url.toLowerCase() === 'home')) {
				menuPath = '/';
			}
			let newUrl = menu.makeMenuUrl(this.menu, menuPath, opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

			let firstUrl = {
				url: '',
				title: ''
			};

			firstUrl.url = menu.makeMenuUrl(this.menu, '/', opts);

			firstUrl.title = opts.title;
			urlTools.firstUrl = firstUrl;

			function expand(elems) {
				if (!elems) return;
				for (let el of elems) {
					if ('Menu' in el) {
						platform.set(el, "$expanded", true);
						expand(el.Menu);
					}
				}
			}
			expand(this.menu);
		}
	};

	app.components['std:mainView'] = a2MainView;
})();	