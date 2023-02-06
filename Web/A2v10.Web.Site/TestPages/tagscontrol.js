// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

// 20230122-7916
// components/tagscontrol.js*/

(function () {
	const template = `
<div class="tags-control" :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group" :class="{focus: isOpen}" @click.stop.prevent="toggle">
		<ul class="tags-items">
			<li v-for="(itm, ix) in value" :key="ix" class="tags-item tag-label" :class="tagColor(itm)">
				<span v-text="tagName(itm)"/>
				<button @click.stop.prevent="itm.$remove()" class="btn-close">×</button>
			</li>
		</ul>
		<button v-if="!readOnly" @click.stop.prevent="toggle" class="btn-open">▽</button>
	</div>
	<div class="tags-pane" v-if=isOpen>
		<ul class="tags-pane-items">
			<li v-for="(itm, ix) in itemsSource" :key="ix" class="tag-label" :class="tagColor(itm)">
				<span v-text="tagName(itm)" 
					@click.stop.prevent="addTag(itm)"/>
			</li>
		</ul>
		<button>tag settings</button>
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
			readOnly: Boolean
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

