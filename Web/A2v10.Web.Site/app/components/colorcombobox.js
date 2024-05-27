// Copyright © 2019-2024 Oleksandr Kukhtin. All rights reserved.

// 20240527-7967
// components/colorcombobox.js*/

(function () {

	const popup = require('std:popup');
	const eventBus = require('std:eventBus');
	const platform = require('std:platform');
	const utils = require('std:utils');

	const colorComboboxTemplate =
`<div class="color-picker" :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<div v-focus tabindex="0" @click.stop.prevent="toggle"
				@keydown="keydown" class="color-picker-wrapper">
			<span class="tag-label" :class="color" v-text="text"/>
			<span class="caret"/>
		</div>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="color-picker-pane" v-show="isOpen">
			<div class="color-picker-list">
				<span class="tag-label" :class="itemClass(itm)" @mousedown.prevent="hit(itm)"
					v-for="(itm, ix) in itemsSource" :key="ix" v-text="itemText(itm)">
				</span>
			</div>
		</div>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	const baseControl = component('control');

	Vue.component('a2-color-combobox', {
		extends: baseControl,
		props: {
			item: {
				type: Object, default() { return {}; }
			},
			itemsSource: Array,
			prop: String,
			nameProp: String,
			colorProp: String,
			valueProp: String,
			outline: Boolean
		},
		data() {
			return {
				isOpen: false
			};
		},
		template: colorComboboxTemplate,
		computed: {
			text() {
				let cv = this.cmbValue;
				return cv ? cv[this.nameProp] : '';
			},
			color() {
				let cv = this.cmbValue;
				let clr = cv ? (cv[this.colorProp] || 'default') : 'transparent';
				if (this.outline)
					clr += ' outline';
				return clr;
			},
			cmbValue: {
				get() {
					let v = this.item[this.prop];
					if (utils.isObjectExact(v))
						return v;
					return this.itemsSource.find(s => s.$id === v);
				},
				set(val) {
					let v = this.item[this.prop];
					if (utils.isObjectExact(v))
						platform.set(this.item, this.prop, val);
					else
						this.item[this.prop] = val[this.valueProp];
				}
			}
		},
		methods: {
			itemText(itm) {
				return itm[this.nameProp];
			},
			itemClass(itm) {
				return itm[this.colorProp] + (this.outline ? ' outline': '');
			},
			keydown(event) {
				event.stopPropagation();
				if (this.disabled) return;
				let items = this.itemsSource;
				switch (event.which) {
					case 40: // down
						event.preventDefault();
						var ix = items.indexOf(this.cmbValue);
						if (ix < items.length - 1)
							this.cmbValue = items[ix + 1];
						else
							this.cmbValue = items[0];
						break;
					case 38: // up
						event.preventDefault();
						var ix = items.indexOf(this.cmbValue);
						if (ix > 0)
							this.cmbValue = items[ix - 1];
						else
							this.cmbValue = items[items.length - 1];
						break;
				}
			},
			toggle() {
				if (this.disabled) return;
				if (!this.isOpen) {
					eventBus.$emit('closeAllPopups');
				}
				this.isOpen = !this.isOpen;
			},
			hit(itm) {
				this.cmbValue = itm;
				this.isOpen = false;
			},
			__clickOutside() {
				this.isOpen = false;
			}
		},
		mounted() {
			popup.registerPopup(this.$el);
			this.$el._close = this.__clickOutside;
		},
		beforeDestroy() {
			popup.unregisterPopup(this.$el);
		}
	});
})();