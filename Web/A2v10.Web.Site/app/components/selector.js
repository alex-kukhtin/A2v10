// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180522-7192

// components/selector.js

/*TODO*/

(function () {
	const popup = require('std:popup');
	const utils = require('std:utils');
	const platform = require('std:platform');
	const locale = window.$$locale;

	const baseControl = component('control');

	const DEFAULT_DELAY = 300;

	Vue.component('a2-selector', {
		extends: baseControl,
		template: `
<div :class="cssClass2()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model="query" :class="inputClass" :placeholder="placeholder"
			@input="debouncedUpdate"
			@blur.stop="cancel"
			@keyup.stop="keyUp"
			:disabled="disabled" />
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="selector-pane" v-if="isOpen" ref="pane" :class="paneClass">
			<div class="selector-body" :style="bodyStyle">
				<slot name="pane" :items="items" :is-item-active="isItemActive" :item-name="itemName" :hit="hit" :slotStyle="slotStyle">
					<ul class="selector-ul">
						<li @mousedown.prevent="hit(itm)" :class="{active: isItemActive(itmIndex)}"
							v-for="(itm, itmIndex) in items" :key="itmIndex" v-text="itemName(itm)">}</li>
					</ul>
				</slot>
			</div>
			<a v-if='canNew' class="create-elem a2-hyperlink a2-inline" @mousedown.stop.prevent="doNew()"><i class="ico ico-plus"/> <span v-text="newText"></span></a>
		</div>
		<div class="selector-pane" v-if="isOpenNew" @click.stop.prevent="dummy">
			<slot name="new-pane"></slot>
		</div>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`,
		props: {
			item: Object,
			prop: String,
			display: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			delay: Number,
			minChars: Number,
			fetch: Function,
			listWidth: String,
			listHeight: String,
			createNew: Function,
			placement: String
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
				return this.item ? utils.simpleEval(this.item[this.prop], this.display) : '';
			},
			canNew() {
				return !!this.createNew;
			},
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
			}
		},
		watch: {
			valueText(newVal) {
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
				return cx;
			},
			isItemActive(ix) {
				return ix === this.current;
			},
			itemName(itm) {
				return utils.simpleEval(itm, this.display);
			},
			cancel() {
				this.query = this.valueText;
				this.isOpen = false;
			},
			keyUp(event) {
				if (!this.isOpen) return;
				switch (event.which) {
					case 27: // esc
						event.stopImmediatePropagation();
						event.preventDefault();
						this.cancel();
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
					default:
						return;
				}
			},
			hit(itm) {
				let obj = this.item[this.prop];
				this.query = this.valueText;
				this.isOpen = false;
				this.isOpenNew = false;
				this.$nextTick(() => {
					if (obj.$merge)
						obj.$merge(itm, true /*fire*/);
					else
						platform.set(this.item, this.prop, itm);
				});
			},
			clear() {
				this.query = '';
				this.isOpen = false;
				this.isOpenNew = false;
				let obj = this.item[this.prop];
				if (obj.$empty)
					obj.$empty();
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
				this.loading = true;
				this.fetchData(text).then((result) => {
					this.loading = false;
					// first property from result
					let prop = Object.keys(result)[0];
					this.items = result[prop];
				}).catch(() => {
					this.items = [];
				});
			},
			fetchData(text) {
				let elem = this.item[this.prop];
				return this.fetch.call(elem, elem, text);
			},
			doNew() {
				//console.dir(this.createNew);
				this.isOpen = false;
				if (this.createNew) {
					this.createNew(this.query);
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