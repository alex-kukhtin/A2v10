// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

/*20200516-7660*/
/* mobile/shell.js */


/*TODO:
3. AppKeyMobile
 */

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
	const platform = require('std:platform');

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

	const a2MobileMenu = {
		template: `
<div>
<transition name="fade">
	<div class="menu-overlay" @click.stop.prevent="hideMenu" v-if="visible">
	</div>
</transition>
<transition name="slide">
<div class="menu-container" v-if="visible">
	<ul class="menu-view">
		<li v-for="m in menu">
			<template v-if="m.Menu">
				<div class="menu-folder" v-text="m.Name"></div>
				<ul class="menu-view">
					<li v-for="sm in m.Menu">
						<a href="" :class="{active: isActive(m.Url, sm.Url)}" @click.stop.prevent="navigateMenu(m.Url, sm.Url)">
							<i class="ico" :class="'ico-'+sm.Icon"></i><span class="menu-text" v-text="sm.Name"></span>
						</a>
					</li>
				</ul>
			</template>
			<a v-else href=""  :class="{active: isActive(m.Url)}" @click.stop.prevent="navigateMenu(m.Url)">
				<i class="ico" :class="'ico-'+m.Icon"></i><span class="menu-text" v-text="m.Name"></span>
			</a>
		</li>
		<li class="group">
			<form id="logoutForm" method="post" action="/account/logoff">
				<a href="javascript:document.getElementById('logoutForm').submit()" tabindex="-1" class="dropdown-item"><i class="ico ico-exit"></i><span class=menu-text v-text="locale.$Quit"/></a>
			</form>
		</li>
	</ul>
</div>
</transition>
</div>
`,
		store,
		props: {
			menu: Array,
			visible: Boolean,
			hide: Function,
			navigate: Function
		},
		methods: {
			hideMenu() {
				if (this.hide)
					this.hide();
			},
			navigateMenu(s1, s2) {
				if (this.navigate)
					this.navigate(this.makeUrl(s1, s2));
			},
			makeUrl(s1, s2) {
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, s1);
				if (s2)
					url = urlTools.combine(root, s1, s2);
				return url;
			},
			isActive(s1, s2) {
				if (s2)
					return s1 === this.seg0 && s2 === this.seg1;
				else
					return s1 === this.seg0;
			}
		},
		computed: {
			seg0() {
				return this.$store.getters.seg0;
			},
			seg1() {
				return this.$store.getters.seg1;
			},
			locale() {
				return window.$$locale;
			}
		}
	};

	const contentView = {
		render(h) {
			return h('div', {
				attrs: {
					class: 'content-view'
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

	const a2MainViewMobile = {
		store,
		template: `
<div :class="cssClass" class="main-view">
	<a2-content-view></a2-content-view>
	<div class="load-indicator" v-show="pendingRequest"></div>
	<div class="modal-stack" v-if="hasModals">
		<div class="modal-wrapper modal-animation-frame" v-for="dlg in modals" :class="{show: dlg.wrap}">
			<a2-modal :dialog="dlg"></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-content-view': contentView,
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
			period: period.constructor
		},
		data() {
			return {
				menuVisible: false,
				requestsCount: 0,
				modals: [],
				modalRequeryUrl: ''
			};
		},
		computed: {
			route() {
				return this.$store.getters.route;
			},
			cssClass() {
				return undefined;
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
				let dlg = { title: "dialog", url: url, prms: prms.data, wrap: false };
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
				let dlg = me.modals[me.modals.length - 1];
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
		}
	};

	const shell = Vue.extend({
		components: {
			'a2-main-view-mobile': a2MainViewMobile,
			"a2-mobile-menu": a2MobileMenu
		},
		store,
		data() {
			return {
				menuVisible: false,
				requestsCount: 0,
				loadsCount: 0,
				debugShowTrace: false,
				debugShowModel: false,
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
			pageTitle() {
				let seg0 = this.$store.getters.seg0;
				let seg1 = this.$store.getters.seg1;
				for (let m of this.menu) {
					if (m.Url === seg0) {
						if (!seg1 || !m.Menu)
							return m.Name;
						for (let sm of m.Menu) {
							if (sm.Url === seg1)
								return `${m.Name} / ${sm.Name}`;
						}
					}
				}
				return '';
			}
		},
		watch: {
			traceEnabled(val) {
				log.enableTrace(val);
			}
		},
		methods: {
			about() {
				this.menuVisible = false;
				this.$store.commit('navigate', { url: '/app/about' });
			},
			appLink(lnk) {
				this.menuVisible = false;
				this.$store.commit('navigate', { url: lnk.url });
			},
			navigate(url) {
				this.$store.commit('navigate', { url: url });
			},
			showMenu() {
				this.menuVisible = true;
			},
			hideMenu() {
				this.menuVisible = false;
			},
			navigateMenu(url) {
				this.navigate(url);
				this.hideMenu();
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
				this.debugShowTrace = !this.debugShowTrace;
			},
			debugModel() {
				if (!window.$$debug) return;
				this.debugShowTrace = false;
				this.debugShowModel = !this.debugShowModel;
			},
			debugClose() {
				this.debugShowModel = false;
				this.debugShowTrace = false;
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
		}
	});

	app.components['std:shellController'] = shell;
})();	