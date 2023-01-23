// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

// 20230122-7916
// components/colorpicker.js*/

(function () {

	const popup = require('std:popup');
	const eventBus = require('std:eventBus');

	const colorPickerTemplate =
`<div class="color-picker" :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<div v-focus tabindex="0" @click.stop.prevent="toggle"
				@keydown="keydown" class="color-picker-wrapper">
			<span class="tag-label" :class="cmbValue" v-text="text"/>
			<span class="caret"/>
		</div>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
		<div class="color-picker-pane" v-show="isOpen">
			<div class="color-picker-list">
				<span class="tag-label" :class="itm" @mousedown.prevent="hit(itm)"
					v-for="(itm, ix) in items" :key="ix" v-text="text">
				</span>
			</div>
		</div>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	const colors = "default|green|orange|cyan|red|purple|pink|gold|blue|salmon|seagreen|tan|magenta|lightgray|olive|teal";

	const baseControl = component('control');

	Vue.component('a2-color-picker', {
		extends: baseControl,
		props: {
			item: {
				type: Object, default() { return {}; }
			},
			prop: String,
			text: String
		},
		data() {
			return {
				isOpen: false
			};
		},
		template: colorPickerTemplate,
		computed: {
			cmbValue: {
				get() {
					return this.item[this.prop];
				},
				set(val) {
					this.item[this.prop] = val;
				}
			},
			items() { return colors.split('|'); }
		},
		methods: {
			keydown(event) {
				event.stopPropagation();
				let items = this.items;
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
				if (!this.isOpen) {
					eventBus.$emit('closeAllPopups');
				}
				this.isOpen = !this.isOpen;
			},
			hit(itm) {
				this.item[this.prop] = itm;
				this.isOpen = false;
			},
			__clickOutside() {
				this.isOpen = false;
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