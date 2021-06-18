// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210618-7785
/*components/include.js*/

(function () {

	const http = require('std:http');
	const urlTools = require('std:url');
	const eventBus = require('std:eventBus');
	const utils = require('std:utils');

	function _destroyElement(el) {
		let fc = el.firstElementChild;
		if (!fc) return;
		let vue = fc.__vue__;
		// Maybe collectionView created the wrapper!
		if (vue && !vue.$marker)
			vue = vue.$parent;
		if (vue && vue.$marker()) {
			vue.$destroy();
		}
		el.__vue__ = null;
	}

	Vue.component('include', {
		template: '<div :class="implClass"></div>',
		props: {
			src: String,
			cssClass: String,
			needReload: Boolean,
			insideDialog: Boolean,
			done: Function
		},
		data() {
			return {
				loading: true,
				currentUrl: '',
				_needReload: true
			};
		},
		methods: {
			loaded(ok) {
				this.loading = false;
				if (this.insideDialog)
					eventBus.$emit('modalCreated', this);
				if (this.done)
					this.done();
			},
			requery() {
				if (this.currentUrl) {
					// Do not set loading. Avoid blinking
					this.__destroy();
					http.load(this.currentUrl, this.$el)
						.then(this.loaded)
						.catch(this.error);
				}
			},
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			modalRequery() {
				if (!this.insideDialog) return;
				setTimeout(() => {
					this.requery();
				}, 1);
			},
			error(msg) {
				if (msg instanceof Error)
					msg = msg.message;
				else
					msg = msg || '';
				if (this.insideDialog)
					eventBus.$emit('modalClose', false);
				if (msg.indexOf('UI:') === 0) {
					let dlgData = {
						promise: null, data: {
							message: msg.substring(3).replace('\\n', '\n'),
							style: 'alert'
						}
					};
					eventBus.$emit('confirm', dlgData);
				} else
					alert(msg);
			}
		},
		computed: {
			implClass() {
				return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
			}
		},
		mounted() {
			//console.warn('include has been mounted');
			if (this.src) {
				this.currentUrl = this.src;
				http.load(this.src, this.$el)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		},
		watch: {
			src: function (newUrl, oldUrl) {
				if (this.insideDialog) {
					// Dialog. No need to reload always.
					this.currentUrl = newUrl;
				}
				else if (newUrl.split('?')[0] === oldUrl.split('?')[0]) {
					// Only the search has changed. No need to reload.
					this.currentUrl = newUrl;
				}
				else if (urlTools.idChangedOnly(newUrl, oldUrl)) {
					// Id has changed after save. No need to reload.
					this.currentUrl = newUrl;
				} else if (urlTools.idOrCopyChanged(newUrl, oldUrl)) {
					// Id has changed after save. No need to reload.
					this.currentUrl = newUrl;
				}
				else {
					this.loading = true; // hides the current view
					this.currentUrl = newUrl;
					this.__destroy();
					http.load(newUrl, this.$el)
						.then(this.loaded)
						.catch(this.error);
				}
			},
			needReload(val) {
				// works like a trigger
				if (val) this.requery();
			}
		}
	});


	Vue.component('a2-include', {
		template: '<div class="a2-include"></div>',
		props: {
			source: String,
			arg: undefined,
			dat: undefined
		},
		data() {
			return {
				needLoad: 0
			};
		},
		methods: {
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			loaded() {
			},
			makeUrl() {
				let arg = this.arg || '0';
				let url = urlTools.combine('_page', this.source, arg);
				if (this.dat)
					url += urlTools.makeQueryString(this.dat);
				return url;
			},
			load() {
				let url = this.makeUrl();
				this.__destroy();
				http.load(url, this.$el)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		watch: {
			source(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			arg(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			dat(newVal, oldVal) {
				if (utils.isEqual(newVal, oldVal)) return;
				this.needLoad += 1;
			},
			needLoad() {
				this.load();
			}
		},
		mounted() {
			if (this.source) {
				this.currentUrl = this.makeUrl(this.source);
				http.load(this.currentUrl, this.$el)
					.then(this.loaded)
					.catch(this.error);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		}
	});
})();