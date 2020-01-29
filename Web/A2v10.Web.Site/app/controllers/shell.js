// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200129-7623*/
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
	const htmlTools = require('std:html');
	const http = require('std:http');

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
				if (found) {
					platform.set(itm, '$expanded', true);
					return found;
				}
			}
		}
		return null;
	}

	function isSeparatePage(pages, seg) {
		if (!seg || !pages) return false;
		return pages.indexOf(seg + ',') !== -1;
	}

	function makeMenuUrl(menu, url, opts) {
		opts = opts || {};
		url = urlTools.combine(url).toLowerCase();
		let sUrl = url.split('/');
		if (sUrl.length >= 4)
			return url; // full qualified
		let routeLen = sUrl.length;
		let seg1 = sUrl[1];
		if (seg1 === 'app')
			return url; // app
		if (opts && isSeparatePage(opts.pages, seg1))
			return url; // separate page
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
		return url; //TODO: ????
	}


	const a2AppHeader = {
		template: `
<header class="header">
	<div class="h-block">
		<!--<i class="ico-user"></i>-->
		<a class="app-title" href='/' @click.prevent="root" v-text="title" tabindex="-1"></a>
		<span class="app-subtitle" v-text="subtitle"></span>
	</div>
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
			changePassword: Function
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
				let menuUrl = this.isSinglePage ? ('/' + this.singlePage) : makeMenuUrl(this.menu, '/', opts);
				if (currentUrl === menuUrl) {
					return; // already in root
				}
				this.$store.commit('navigate', { url: menuUrl, title: opts.title });
			},
			doProfileMenu(itm) {
				store.commit('navigate', { url: itm.url });
			}
		}
	};

	const a2NavBar = {
		template: `
<ul class="nav-bar">
	<li v-for="(item, index) in menu" :key="index" :class="{active : isActive(item)}">
		<a :href="itemHref(item)" tabindex="-1" v-text="item.Name" @click.prevent="navigate(item)"></a>
	</li>
	<li class="aligner"/>
	<div class="nav-global-period" v-if="hasPeriod">
		<a2-period-picker class="drop-bottom-right pp-hyperlink pp-navbar" 
			display="namedate" :callback="periodChanged" prop="period" :item="that"/>
	</div>
	<li v-if="hasHelp()" :title="locale.$Help"><a :href="helpHref()" class="btn-help" rel="help" aria-label="Help" @click.prevent="showHelp()"><i class="ico ico-help"></i></a></li>
</ul>
`,
		props: {
			menu: Array,
			period: period.constructor
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			locale() { return locale; },
			hasPeriod() { return !!this.period; },
			that() { return this; }
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			isActive2(item) {
				return this.seg1 === item.Url;
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
				if (am && am.Menu) {
					let am2 = am.Menu.find(x => this.isActive2(x));
					if (am2 && am2.Help)
						return urlTools.helpHref(am2.Help);
				}
				if (am && am.Help)
					return urlTools.helpHref(am.Help);
				return urlTools.helpHref('');
			},
			hasHelp() {
				if (!this.menu) return false;
				let am = this.menu.find(x => this.isActive(x));
				return am && am.Help;
			},
			periodChanged(period) {
				// post to shell
				http.post('/_application/setperiod', period.toJson())
					.then(() => {
						eventBus.$emit('globalPeriodChanged', period);
					})
					.catch((err) => {
						alert(err);
					});
			}
		}
	};


	const sideBarBase = {
		props: {
			menu: Array,
			compact: Boolean
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			cssClass() {
				let cls = 'side-bar';
				if (this.compact)
					cls += '-compact';
				return cls + (this.$parent.sideBarCollapsed ? ' collapsed' : ' expanded');
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
				let isActive = this.seg1 === item.Url;
				if (isActive)
					htmlTools.updateDocTitle(item.Name);
				return isActive;
			},
			isGroup(item) {
				if (!item.Params) return false;
				try {
					return JSON.parse(item.Params).group || false;
				} catch (err) {
					return false;
				}
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

	const a2SideBar = {
		//TODO: 
		// 1. various menu variants
		// 2. folderSelect as function 
		template: `
<div :class="cssClass">
	<a href role="button" class="ico collapse-handle" @click.prevent="toggle"></a>
	<div class="side-bar-body" v-if="bodyIsVisible">
		<tree-view :items="sideMenu" :is-active="isActive" :is-group="isGroup" :click="navigate" :get-href="itemHref"
			:options="{folderSelect: folderSelect, label: 'Name', title: 'Description',
			subitems: 'Menu', expandAll:true,
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
				return !this.$parent.sideBarCollapsed || this.compact;
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
				if (isSeparatePage(this.pages, route.seg0))
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
<div :class="cssClass" class="main-view">
	<a2-nav-bar :menu="menu" v-show="navBarVisible" :period="period"></a2-nav-bar>
	<a2-side-bar :menu="menu" v-show="sideBarVisible" :compact='isSideBarCompact'></a2-side-bar>
	<a2-content-view :pages="pages"></a2-content-view>
	<div class="load-indicator" v-show="pendingRequest"></div>
	<div class="modal-stack" v-if="hasModals">
		<div class="modal-wrapper modal-animation-frame" v-for="dlg in modals" :class="{show: dlg.wrap}">
			<a2-modal :dialog="dlg"></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-nav-bar': a2NavBar,
			'a2-side-bar': a2SideBar,
			'a2-content-view': contentView,
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
			menu: Array,
			sideBarMode: String,
			period: period.constructor,
			pages: String
		},
		data() {
			return {
				sideBarCollapsed: false,
				requestsCount: 0,
				modals: [],
				modalRequeryUrl: ''
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
				// auto collapse for tablet
				if (!window.matchMedia('(min-width:1025px)').matches)
					return true;
				return false;
			},
			navBarVisible() {
				let route = this.route;
				if (isSeparatePage(this.pages, route.seg0)) return false;
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
			pendingRequest() { return !this.hasModals && this.requestsCount > 0; },
			hasModals() { return this.modals.length > 0; }
		},
		methods: {
			setupWrapper(dlg) {
				this.modalRequeryUrl = '';
				setTimeout(() => {
					dlg.wrap = true;
					//console.dir("wrap:" + dlg.wrap);
				}, 50); // same as modal
			}
		},
		created() {
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
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap:false };
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
				if (!me.modals.length || !attr || !instance)
					return;
				let dlg = me.modals[me.modals.length - 1];
				dlg.attrs = instance.__parseControllerAttributes(attr);
			});

			eventBus.$on('modalCreated', function (instance) {
				// include instance!
				if (!me.modals.length)
					return;
				let dlg = me.modals[me.modals.length - 1];
				dlg.instance = instance;
			});

			eventBus.$on('isModalRequery', function (arg) {
				if (arg.url && me.modalRequeryUrl && me.modalRequeryUrl === arg.url)
					arg.result = true;
			});

			eventBus.$on('modalRequery', function (baseUrl) {
				if (!me.modals.length)
					return;
				let dlg = null;
				// skip alerts, confirm, etc
				for (let i = me.modals.length - 1; i >= 0; --i) {
					let md = me.modals[i];
					if (md.instance) {
						dlg = md;
					}
				}
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
				if (!me.modals.length)
					return;
				let dlg = me.modals[me.modals.length - 1];
				dlg.url = baseUrl;
			});

			eventBus.$on('modalClose', function (result) {

				if (!me.modals.length) return;
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
			let newUrl = makeMenuUrl(this.menu, menuPath, opts);
			newUrl = newUrl + window.location.search;
			this.$store.commit('setstate', { url: newUrl, title: opts.title });

			let firstUrl = {
				url: '',
				title: ''
			};

			firstUrl.url = makeMenuUrl(this.menu, '/', opts);

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
				if (isSeparatePage(this.pages, seg0))
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