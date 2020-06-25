// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200624-7676*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const popup = require('std:popup');
	const urlTools = require('std:url');
	const period = require('std:period');
	const log = require('std:log');
	const utils = require('std:utils');
	const locale = window.$$locale;
	const platform = require('std:platform');
	const navBar = component('std:navbar');
	const sideBar = component('std:sidebar');
	const menu = component('std:navmenu');

	const a2AppHeader = {
		template: `
<header class="header">
	<div class=h-menu v-if=isNavBarMenu @click.stop.prevent=clickMenu><i class="ico ico-grid2"></i></div>
	<div class=h-block v-if='!isNavBarMenu'>
		<!--<i class="ico-user"></i>-->
		<a class=app-title href='/' @click.prevent="root" v-text="title" tabindex="-1"></a>
		<span class=app-subtitle v-text="subtitle"></span>
	</div>
	<div v-if=isNavBarMenu class=h-menu-title v-text=seg0text></div>
	<div class="aligner"></div>
	<span class="title-notify" v-if="notifyText" v-text="notifyText" :title="notifyText" :class="notifyClass"></span>
	<div class="aligner"></div>
	<template v-if="!isSinglePage ">
		<a2-new-button :menu="newMenu" icon="plus" btn-style="success"></a2-new-button>
		<slot></slot>
		<a2-new-button :menu="settingsMenu" icon="gear-outline" :title="locale.$Settings"></a2-new-button>
		<a class="nav-admin middle" v-if="hasFeedback" tabindex="-1" @click.prevent="showFeedback" :title="locale.$Feedback" :class="{open: feedbackVisible}"><i class="ico ico-comment-outline"></i></a>
		<a class="nav-admin" v-if="userIsAdmin" href="/admin/" tabindex="-1"><i class="ico ico-gear-outline"></i></a>
	</template>
	<div class="dropdown dir-down separate" v-dropdown>
		<button class="btn user-name" toggle :title="personName"><i class="ico ico-user"></i> <span id="layout-person-name" class="person-name" v-text="personName"></span><span class="caret"></span></button>
		<div class="dropdown-menu menu down-left">
			<a v-if="!isSinglePage " v-for="(itm, itmIndex) in profileItems" @click.prevent="doProfileMenu(itm)" class="dropdown-item" tabindex="-1"><i class="ico" :class="'ico-' + itm.icon"></i> <span v-text="itm.title" :key="itmIndex"></span></a>
			<a @click.prevent="changePassword" class="dropdown-item" tabindex="-1"><i class="ico ico-access"></i> <span v-text="locale.$ChangePassword"></span></a>
			<div class="divider"></div>
			<form id="logoutForm" method="post" action="/account/logoff">
				<a href="javascript:document.getElementById('logoutForm').submit()" tabindex="-1" class="dropdown-item"><i class="ico ico-exit"></i> <span v-text="locale.$Quit"></span></a>
			</form>
		</div>
	</div>
</header>
`,
		props: {
			title: String,
			subtitle: String,
			userState: Object,
			personName: String,
			userIsAdmin: Boolean,
			menu: Array,
			newMenu: Array,
			settingsMenu: Array,
			appData: Object,
			showFeedback: Function,
			feedbackVisible: Boolean,
			singlePage: String,
			changePassword: Function,
			navBarMode: String
		},
		computed: {
			isSinglePage() {
				return !!this.singlePage;
			},
			locale() { return locale; },
			notifyText() {
				return this.getNotify(2);
			},
			notifyClass() {
				return this.getNotify(1).toLowerCase();
			},
			feedback() {
				return this.appData ? this.appData.feedback : null;
			},
			hasFeedback() {
				return this.appData && this.appData.feedback;
			},
			profileItems() {
				return this.appData ? this.appData.profileMenu : null;
			},
			isNavBarMenu() {
				return this.navBarMode === 'Menu';
			},
			seg0text() {
				let seg0 = this.$store.getters.seg0;
				let mx = this.menu.find(x => x.Url === seg0);
				return mx ? mx.Name : '';
			}
		},
		methods: {
			getNotify(ix) {
				let n = this.userState ? this.userState.Notify : null;
				if (!n) return '';
				let m = n.match(/\((.*)\)(.*)/);
				if (m && m.length > ix)
					return m[ix];
				return '';
			},
			root() {
				let opts = { title: null };
				let currentUrl = this.$store.getters.url;
				let menuUrl = this.isSinglePage ? ('/' + this.singlePage) : menu.makeMenuUrl(this.menu, '/', opts);
				if (currentUrl === menuUrl) {
					return; // already in root
				}
				this.$store.commit('navigate', { url: menuUrl, title: opts.title });
			},
			doProfileMenu(itm) {
				store.commit('navigate', { url: itm.url });
			},
			clickMenu() {
				if (this.isNavBarMenu)
					eventBus.$emit('clickNavMenu', true);
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
			isNavBarMenu() {return this.navBarMode === 'Menu';}
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
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap:false, rd: prms.rd };
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
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap:false };
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

	const shell = Vue.extend({
		components: {
			'a2-main-view': a2MainView,
			'a2-app-header': a2AppHeader
		},
		store,
		data() {
			return {
				requestsCount: 0,
				loadsCount:0,
				debugShowTrace: false,
				debugShowModel: false,
				feedbackVisible: false,
				globalPeriod: null,
				dataCounter: 0,
				traceEnabled: log.traceEnabled()
			};
		},
		computed: {
			processing() { return !this.hasModals && this.requestsCount > 0; },
			modelStack() {
				return this.__dataStack__;
			},
			singlePage() {
				let seg0 = this.$store.getters.seg0;
				if (menu.isSeparatePage(this.pages, seg0))
					return seg0;
				return undefined;
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
				if (window.cefHost) {
					this.$alert(locale.$DesktopNotSupported);
					return;
				}

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
			if (this.initialPeriod) {
				this.globalPeriod = new period.constructor(this.initialPeriod);
			}

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

			eventBus.$on('beginRequest', () => {
				me.requestsCount += 1;
				window.__requestsCount__ = me.requestsCount;
			});
			eventBus.$on('endRequest', () => {
				me.requestsCount -= 1;
				window.__requestsCount__ = me.requestsCount;
			});

			eventBus.$on('beginLoad', () => {
				if (window.__loadsCount__ === undefined)
					window.__loadsCount__ = 0;
				me.loadsCount += 1;
				window.__loadsCount__ = me.loadsCount;
			});
			eventBus.$on('endLoad', () => {
				me.loadsCount -= 1;
				window.__loadsCount__ = me.loadsCount;
			});

			eventBus.$on('closeAllPopups', popup.closeAll);
		}
	});

	app.components['std:shellController'] = shell;
})();