// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

/*20250421-7982*/
// components/selector.js

(function selector_component() {
	const popup = require('std:popup');
	const utils = require('std:utils');
	const platform = require('std:platform');
	const locale = window.$$locale;
	const eventBus = require('std:eventBus');

	const baseControl = component('control');

	const DEFAULT_DELAY = 300;

	Vue.component('a2-selector', {
		extends: baseControl,
		template: `
<div :class="cssClass2()"  :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<div v-if="isCombo" class="selector-combo" @click.stop.prevent="open"><span tabindex="-1" class="select-text" v-text="valueText" @keydown="keyDown" ref="xcombo"/></div>
		<input v-focus v-model="query" :class="inputClass" :placeholder="placeholder" v-else
			@input="debouncedUpdate" @blur.stop="blur" @keydown="keyDown" @keyup="keyUp" ref="input" 
			:readonly="disabled" @click="clickInput($event)" :tabindex="tabIndex"/>
		<slot></slot>
		<a class="selector-open" href="" @click.stop.prevent="open" v-if="caret"><span class="caret"></span></a>
		<a class="selector-clear" href="" @click.stop.prevent="clear" v-if="clearVisible" tabindex="-1">&#x2715</a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="selector-pane" v-if="isOpen" ref="pane" :class="paneClass">
			<div class="selector-body" :style="bodyStyle">
				<slot name="pane" :items="items" :is-item-active="isItemActive" :item-name="itemName" :hit="hit" :max-chars="maxChars" :line-clamp="lineClamp" :slotStyle="slotStyle">
					<ul class="selector-ul">
						<li @mousedown.prevent="hit(itm)" :class="{'active': isItemActive(itmIndex)}"
							v-for="(itm, itmIndex) in items" :key="itmIndex">
							<span :style="itemStyle(itm)" :class="itemClass(itm, itmIndex)" :title="itemTitle(itm)" v-text="itemName(itm)"></span>
						</li>
					</ul>
				</slot>
			</div>
			<a v-if='canNew' class="create-elem a2-hyperlink a2-inline" @mousedown.stop.prevent="doNew()"><i class="ico ico-plus"/> <span v-text="newText"></span></a>
		</div>
		<div class="selector-pane" v-if="isOpenNew" @click.stop.prevent="dummy">
			<slot name="new-pane"></slot>
		</div>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			itemsSource: Array,
			textItem: Object,
			textProp: String,
			display: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			delay: Number,
			minChars: Number,
			fetch: Function,
			hitfunc: Function,
			listWidth: String,
			listHeight: String,
			createNew: Function,
			placement: String,
			caret: Boolean,
			hasClear: Boolean,
			useAll: Boolean,
			mode: String,
			fetchCommand: String,
			fetchCommandData: Object,
			maxChars: Number,
			lineClamp: Number
		},
		data() {
			return {
				isOpen: false,
				isOpenNew: false,
				loading: false,
				items: [],
				query: '',
				filter: '',
				current: -1
			};
		},
		computed: {
			valueText() {
				if (!this.item) return '';
				if (this.hasText) {
					let el = this.item[this.prop];
					if (el.$isEmpty)
						return this.textItem[this.textProp];
				}
				let el = this.item[this.prop];
				if (utils.isNumber(el) && this.itemsSource) {
					el = this.itemsSource.find(x => x.$id === el);
					if (!el) return '';
				}
				return utils.simpleEval(el, this.display);
			},
			hasValue() {
				if (!this.item) return false;
				let el = this.item[this.prop];
				if (utils.isObjectExact(el) && el.Id)
					return true;
			},
			canNew() {
				return !!this.createNew;
			},
			clearVisible() {
				if (!this.hasClear) return false;
				let to = this.item[this.prop];
				if (!to) return false;
				if (this.useAll && to.Id === -1) return false;
				if (utils.isDefined(to.$isEmpty))
					return !to.$isEmpty;
				return !utils.isPlainObjectEmpty(to);
			},
			hasText() { return !!this.textProp; },
			newText() {
				return `${locale.$CreateLC} "${this.query}"`;
			},
			pane() {
				return {
					items: this.items,
					isItemActive: this.isItemActive,
					itemName: this.itemName,
					hit: this.hit
				};
			},
			paneClass() {
				if (this.placement)
					return "panel-" + this.placement;
			},
			bodyStyle() {
				let s = {};
				if (this.listWidth) {
					s.minWidth = this.listWidth;
				}
				if (this.listHeight)
					s.maxHeight = this.listHeight;
				return s;
			},
			slotStyle() {
				let r = {};
				if (this.listWidth) {
					r.width = this.listWidth;
					r.minWidth = this.listWidth;
				}
				if (this.listHeight)
					r.maxHeight = this.maxHeight;
				return r;
			},
			debouncedUpdate() {
				let delay = this.delay || DEFAULT_DELAY;
				return utils.debounce(() => {
					this.current = -1;
					this.filter = this.query;
					this.update();
				}, delay);
			},
			isCombo() {
				return this.mode === 'combo-box' || this.mode === 'hyperlink';
			}
		},
		watch: {
			valueText(newVal) {
				if (this.hasText) {
					let el = this.item[this.prop];
					if (!el.$isEmpty)
						this.textItem[this.textProp] = ''; // clear text
				}
				this.query = this.valueText;
			}
		},
		methods: {
			dummy() {

			},
			__clickOutside() {
				this.isOpen = false;
				this.isOpenNew = false;
			},
			cssClass2() {
				let cx = this.cssClass();
				if (this.isOpen || this.isOpenNew)
					cx += ' open';
				if (this.mode === 'hyperlink')
					cx += ' selector-hyperlink';
				else if (this.mode === 'combo-box')
					cx += ' selector-combobox';
				if (this.hasValue)
					cx += ' has-value';
				return cx;
			},
			isItemActive(ix) {
				return ix === this.current;
			},
			itemName(itm) {
				let v = utils.simpleEval(itm, this.display);
				if (this.maxChars)
					return utils.text.maxChars(v, this.maxChars);
				return v;
			},
			blur() {
				let text = this.query;
				if (this.hasText && text !== this.valueText) {
					let to = this.item[this.prop];
					if (to && to.$empty)
						to.$empty();
					this.textItem[this.textProp] = text;
				}
				this.cancel();
			},
			open() {
				if (!this.isOpen) {
					eventBus.$emit('closeAllPopups');
					if (this.current != -1)
						this.$nextTick(() => this.scrollIntoView());
						//setTimeout(, 0);
					this.doFetch(this.valueText, true);
					if (this.isCombo) {
						let combo = this.$refs['xcombo'];
						if (combo)
							combo.focus();
					} else {
						let input = this.$refs['input'];
						if (input)
							input.focus();
					}
				}
				this.isOpen = !this.isOpen;
			},
			cancel() {
				this.query = this.valueText;
				this.isOpen = false;
			},
			keyUp(event) {
				if (this.isOpen && event.which === 27) {
					event.preventDefault();
					event.stopPropagation();
					this.cancel();
				} else if (event.which === 13) {
					if (this.hasText)
						this.blur();
				}
			},
			clickInput(event) {
				if (this.caret && !this.isOpen) {
					event.stopPropagation();
					event.preventDefault();
					this.open();
				}
			},
			keyDown(event) {
				if (!this.isOpen) {
					if (event.which === 115)
						this.open();
					return;
				}
				event.stopPropagation();
				switch (event.which) {
					case 27: // esc
						event.preventDefault();
						break;
					case 13: // enter
						if (this.current === -1) return;
						this.hit(this.items[this.current]);
						break;
					case 40: // down
						event.preventDefault();
						this.current += 1;
						if (this.current >= this.items.length)
							this.current = 0;
						this.query = this.itemName(this.items[this.current]);
						this.scrollIntoView();
						break;
					case 38: // up
						event.preventDefault();
						this.current -= 1;
						if (this.current < 0)
							this.current = this.items.length - 1;
						this.query = this.itemName(this.items[this.current]);
						this.scrollIntoView();
						break;
					case 115: // F4
						this.cancel();
						break;
					default:
						return;
				}
			},
			itemTitle(itm) {
				if (this.lineClamp > 0)
					return this.itemName(itm)
				return '';
			},
			itemStyle(itm) {
				if (this.lineClamp > 0)
					return { '-webkit-line-clamp': this.lineClamp };
				return undefined;
			},
			itemClass(itm, itmIndex) {
				let cls = '';
				if (this.lineClamp > 0)
					cls += ' line-clamp';
				return cls;
			},
			hit(itm) {
				let obj = this.item[this.prop];
				this.query = this.valueText;
				this.isOpen = false;
				this.isOpenNew = false;
				this.current = this.items.indexOf(itm);
				this.$nextTick(() => {
					if (this.hitfunc) {
						this.hitfunc.call(this.item.$root, itm, this.item, this.prop);
						return;
					}
					if (obj && obj.$merge)
						obj.$merge(itm, true /*fire*/);
					else if (utils.isNumber(obj))
						this.item[this.prop] = itm.$id;
					else
						platform.set(this.item, this.prop, itm);
				});
			},
			clear() {
				this.query = '';
				this.isOpen = false;
				this.isOpenNew = false;
				let obj = this.item[this.prop];
				if (!obj) return;
				if (this.useAll) {
					obj.Id = -1;
					obj.Name = '';
					return;
				} 
				if (obj.$empty)
					obj.$empty();
				else if (utils.isObjectExact(obj))
					utils.clearObject(obj);
			},
			scrollIntoView() {
				this.$nextTick(() => {
					let pane = this.$refs['pane'];
					if (!pane) return;
					let elem = pane.querySelector('.active');
					if (!elem) return;
					elem.scrollIntoView(false);
				});
			},
			update() {
				let text = this.query || '';
				let chars = +(this.minChars || 0);
				if (chars && text.length < chars) return;
				//this.items = [];
				this.isOpen = true;
				this.isOpenNew = false;
				if (text === '') {
					this.clear();
					return;
				}
				this.doFetch(text, false);
			},
			doFetch(text, all) {
				if (this.itemsSource) {
					if (!this.items.length)
						this.items = this.itemsSource;
					let fi = -1;
					let el = this.item[this.prop];
					if (utils.isNumber(el))
						fi = this.items.findIndex(x => x.Id === el);
					else
						fi = this.items.indexOf(el);
					if (fi !== -1) {
						this.current = fi;
						setTimeout(() => this.scrollIntoView(), 10);
					}
					return;
				}
				this.loading = true;
				let fData = this.fetchData(text, all);
				if (fData.then) {
					// promise
					fData.then((result) => {
						this.loading = false;
						// first property from result
						let prop = Object.keys(result)[0];
						this.items = result[prop];
						if (this.items.length)
							this.current = 0;
					}).catch(() => {
						this.items = [];
					});
				} else {
					if (utils.isArray(fData)) {
						if (this.items != fData) {
							if (this.items.length != fData.length)
								this.current = -1; // reset current element
							this.items = fData;
						}
					}
				}
			},
			fetchData(text, all) {
				all = all || false;
				let elem = this.item[this.prop];
				if (elem && !('$vm' in elem)) {
					// plain object hack
					Object.defineProperty(elem, '$vm', { value: this.$root, writable: false, enumerable: false });
				}
				if (this.fetch) {
					return this.fetch.call(this.item.$root, elem, text, all);
				} else if (this.fetchCommand) {
					if (!text) return [];
					let fc = this.fetchCommand.split('/');
					let action = fc.pop();
					let invokeArg = Object.assign({}, { Text: text }, this.fetchCommandData);
					return elem.$vm.$invoke(action, invokeArg, fc.join('/'));
				}
				console.error('Selector. Fetch or Delegate not defined');
			},
			doNew() {
				this.isOpen = false;
				if (this.createNew) {
					let elem = this.item[this.prop];
					let arg = {
						elem: elem,
						text: this.query
					};
					this.createNew(arg);
				}
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.query = this.valueText;
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();