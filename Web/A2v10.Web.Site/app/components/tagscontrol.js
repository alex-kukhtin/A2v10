// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

// 20230122-7918
// components/tagscontrol.js*/

(function () {
	const template = `
<div class="tags-control" :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group" @click.stop.prevent="toggle">
		<ul class="tags-items" v-if="hasItems">
			<li v-for="(itm, ix) in value" :key="ix" class="tag-body tag-md-close" :class="tagColor(itm)">
				<span v-text="tagName(itm)"/>
				<button @click.stop.prevent="itm.$remove()" class="btn-close">×</button>
			</li>
		</ul>
		<div class="tags-placeholder" v-else v-text="placeholder"></div>
		<div class="tags-pane" v-if=isOpen>
			<ul class="tags-pane-items">
				<li v-for="(itm, ix) in actualItemsSource" :key="ix" class="tag-body tag-md" :class="tagColor(itm)">
					<span v-text="tagName(itm)" 
						@click.stop.prevent="addTag(itm)"/>
				</li>
			</ul>
			<div class="tags-settings" v-if="!disabled">
				<button class="btn-settings" v-text="settingsText" @click.stop.prevent=doSettings></button>
			</div>
		</div>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	const templateList = `
<div class="tags-list" :test-id="testId">
	<span v-for="(itm, ix) in itemsSource" :key="ix" class="tag-body tag-sm" :class="tagColor(itm)" v-text="tagName(itm)"/>
</div>
`;

	const templateFilter = `
<div class="tags-control" :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group" @click.stop.prevent="toggle">
		<ul class="tags-items" v-if="hasItems">
			<li v-for="(itm, ix) in valueList" :key="ix" class="tag-body tag-md-close" :class="tagColor(itm)">
				<span v-text="tagName(itm)"/>
				<button @click.stop.prevent="removeTag(itm)" class="btn-close">×</button>
			</li>
		</ul>
		<div class="tags-placeholder" v-else v-text="placeholder"></div>
		<div class="tags-pane" v-if=isOpen>
			<ul class="tags-pane-items">
				<li v-for="(itm, ix) in actualItemsSource" :key="ix" class="tag-body tag-md" :class="tagColor(itm)">
					<span v-text="tagName(itm)" 
						@click.stop.prevent="addTag(itm)"/>
				</li>
			</ul>
		</div>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	const baseControl = component('control');
	const popup = require('std:popup');
	const eventBus = require('std:eventBus');


	Vue.component('a2-tags', {
		extends: baseControl,
		props: {
			item: {
				type: Object, default() { return {}; }
			},
			prop: String,
			itemsSource: Array,
			contentProp: { type: String, default: 'Name' },
			colorProp: { type: String, default: 'Color' },
			disabled: Boolean,
			settingsText: { type: String, default: "Settings" },
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
				return this.item[this.prop];
			},
			hasItems() {
				return this.value.length > 0;
			},
			actualItemsSource() {
				let val = this.value;
				return this.itemsSource.filter(x => !val.some(ix => x.$id === ix.$id));
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
				if (this.disabled)
					return;
				let val = this.value;
				if (val.some(x => x.$id === itm.$id))
					return; // already added
				this.item[this.prop].$append(itm);
			},
			toggle() {
				if (this.disabled)
					return;
				if (!this.isOpen) {
					eventBus.$emit('closeAllPopups');
				}
				this.isOpen = !this.isOpen;
			},
			doSettings() {
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

	Vue.component("a2-tags-list", {
		template: templateList,
		props: {
			testId: String,
			itemsSource: Array,
			contentProp: { type: String, default: 'Name' },
			colorProp: { type: String, default: 'Color' },
		},
		methods: {
			tagName(itm) {
				return itm[this.contentProp];
			},
			tagColor(itm) {
				return itm[this.colorProp];
			}
		}
	});

	Vue.component('a2-tags-filter', {
		extends: baseControl,
		props: {
			item: {
				type: Object, default() { return {}; }
			},
			prop: String,
			itemsSource: Array,
			contentProp: { type: String, default: 'Name' },
			colorProp: { type: String, default: 'Color' },
			placeholder: String
		},
		data() {
			return {
				isOpen: false
			};
		},
		template: templateFilter,
		computed: {
			value() {
				return this.item[this.prop];
			},
			valueArray() {
				let v = this.value;
				return v ? v.split('-') : [];
			},
			valueList() {
				var va = this.valueArray;
				return this.itemsSource.filter(tag => va.indexOf('' + tag.$id) >= 0);
			},
			actualItemsSource() {
				var va = this.valueArray;
				return this.itemsSource.filter(tag => va.indexOf('' + tag.$id) < 0);
			},
			hasItems() {
				return !!this.value;
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
				if (this.disabled)
					return;
				let va = this.valueArray;
				if (va.indexOf('' + itm.$id) >= 0)
					return; // already added
				this.item[this.prop] = va.concat([itm.$id]).join('-');
			},
			removeTag(itm) {
				let va = this.valueArray.filter(x => x != itm.$id);
				this.item[this.prop] = va.join('-');
			},
			toggle() {
				if (this.disabled)
					return;
				if (!this.isOpen) {
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

