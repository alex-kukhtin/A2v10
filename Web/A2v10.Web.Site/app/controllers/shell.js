// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

/*20220912-7888*/
/* controllers/shell.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const popup = require('std:popup');
	const period = require('std:period');
	const log = require('std:log');
	const locale = window.$$locale;
	const menu = component('std:navmenu');

	const shell = Vue.extend({
		components: {
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
			},
			changePassword() {
				if (this.userIsExternal)
					return undefined;
				return this.doChangePassword;
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
				if (lnk.url.startsWith("http"))
					window.open(lnk.url, "_blank");
				else
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
			doChangePassword() {
				if (this.userIsExternal)
					return undefined;
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