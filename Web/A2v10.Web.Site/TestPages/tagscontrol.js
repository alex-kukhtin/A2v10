// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

// 20230122-7916
// components/tagscontrol.js*/

(function () {
	const template = `
<div class="tags-control" :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group" :class="{focus: isOpen}" @click.stop.prevent="toggle">
		<ul class="tags-items" v-if="hasItems">
			<li v-for="(itm, ix) in value" :key="ix" class="tags-item tag-label" :class="tagColor(itm)">
				<span v-text="tagName(itm)"/>
				<button @click.stop.prevent="itm.$remove()" class="btn-close">×</button>
			</li>
		</ul>
		<div class="tags-placeholder" v-else v-text="placeholder"></div>
		<button v-if="!readOnly" @click.stop.prevent="toggle" class="btn-open">▽</button>
	</div>
	<div class="tags-pane" v-if=isOpen>
		<ul class="tags-pane-items">
			<li v-for="(itm, ix) in actualItemsSource" :key="ix" class="tag-label" :class="tagColor(itm)">
				<span v-text="tagName(itm)" 
					@click.stop.prevent="addTag(itm)"/>
			</li>
		</ul>
		<div class="tags-settings" v-if="!readOnly">
			<button class="btn-settings" v-text="settingsText" @click.stop.prevent=doSettings></button>
		</div>
	</div>
</div>
`;

	const baseControl = component('control');
	const popup = require('std:popup');


	Vue.component('a2-tags', {
		extends: baseControl,
		props: {
			item: {
				type: Object, default() { return {}; }
			},
			valueProp: String,
			itemsSource: Array,
			contentProp: { type: String, default: 'Name' },
			colorProp: { type: String, default: 'Color' },
			readOnly: Boolean,
			settingsText: String,
			placeholder: String,
			settingsFunc: Function
		},
		data() { 
			return {
				isOpen: false
			};
		},
		template,
		computed: {
			value() {
				return this.item[this.valueProp];
			},
			hasItems() {
				return this.value.length > 0;
			},
			actualItemsSource() {
				let val = this.value;
				return this.itemsSource.filter(x => !val.find(ix => x.$id === ix.$id));
			}
		},
		methods: {
			tagName(itm) {
				return itm[this.contentProp];
			},
			tagColor(itm) {
				return itm[this.colorProp];
			},
			addTag(itm) {
				let val = this.value;
				if (val.$find(x => x.$id === itm.$id))
					return; // already added
				this.item[this.valueProp].$append(itm);
			},
			toggle() {
				this.isOpen = !this.isOpen;
			},
			doSettings() {
				console.dir(this.item.$root);
				if (this.settingsFunc)
					this.settingsFunc.call(this.item.$root, this.itemsSource);
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

