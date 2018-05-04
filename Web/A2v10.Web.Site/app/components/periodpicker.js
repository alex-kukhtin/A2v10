// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180327-7141
// components/periodpicker.js


(function () {

	const popup = require('std:popup');

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');

	const baseControl = component('control');
	const locale = window.$$locale;

	Vue.component('a2-period-picker', {
		extends: baseControl,
		template: `
<div class="control-group" @click.prevent="toggle">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		PERIOD HERE
		<div v-if="isOpen" class="calendar">
			popup text here
		</div>
	</div>
</div>
`,
		props: {
			item: Object,
			propFrom: String,
			propTo: String
		},
		data() {
			return {
				isOpen: false
			};
		},
		methods: {
			dummy() {
			},
			toggle(ev) {
				console.dir(this.item);
				this.item.From = new Date(2018, 4, 1);
				this.item.To = new Date(2018, 4, 15);
				//alert(1);
				if (!this.isOpen) {
					// close other popups
					eventBus.$emit('closeAllPopups');
				}
				this.isOpen = !this.isOpen;
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

