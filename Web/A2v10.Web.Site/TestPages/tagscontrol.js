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


	const filterTemplate = `
<div class="tags-filter">
	<span v-for="(itm, ix) in itemsSource" :key="ix" class="tags-filter-item"
		:class="tagClass(itm)" @click.stop.prevent="toggle(itm)">
		<i class="ico" :class="icoClass(itm)"/>
		<span v-text="tagName(itm)"/>
	</span>
</div>
`

	Vue.component("a2-tags-filter", {
		template: filterTemplate,
		props: {
			itemsSource: Array,
			item: {
				type: Object, default() { return {}; }
			},
			prop: String,
			contentProp: { type: String, default: 'Name' },
			colorProp: { type: String, default: 'Color' },
		},
		computed: {
			valueArray() {
				let v = this.item[this.prop];
				return v ? v.split(',') : [];
			}
		},
		methods: {
			tagName(itm) {
				return itm[this.contentProp];
			},
			tagClass(itm) {
				let activeClass = this.isActive(itm) ? ' active' : '';
				return itm[this.colorProp] + activeClass;
			},
			icoClass(itm) {
				return this.isActive(itm) ? 'ico-checkbox-checked' : 'ico-checkbox';
			},
			isActive(itm) {
				return this.valueArray.some(x => x == itm.$id);
			},
			toggle(itm) {
				if (this.isActive(itm)) {
					// remove
					this.item[this.prop] = this.valueArray.filter(x => x != itm.$id).join(',');
				} else {
					// add
					this.item[this.prop] = this.valueArray.concat([itm.$id]).join(',');
				}
			}
		}
	});
})();

