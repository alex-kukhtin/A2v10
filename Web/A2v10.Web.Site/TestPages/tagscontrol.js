// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

// 20230122-7916
// components/tagscontrol.js*/

(function () {
	const template = `
<ul class=tags-control>
	<li v-for="(itm, ix) in items" :key="ix">
		<slot v-bind:item="itm"></slot>
	</li>
	<li class="tags-new-item">
		<input type=text class="tags-input">
	</li>
</ul>
`;
	Vue.component('a2-tags', {
		props: {
			items: Array,
			readOnly: Boolean
		},
		template,
		methods: {
			remove(itm) {
				alert(itm);
			}
		},
		mounted() {
		}
	});


	const colorPickerTemplate =
		`
<div class="color-picker">
	<div @click.stop.prevent="toggle">
		<div class="color-picker-wrapper">
			<span v-text="value"></span>
			<span class="caret"></span>
		</div>
		<select v-model="value" @keydown=keydown>
			<option v-for="(itm, ix) in items" :key="ix" v-text="itm"></option>
		</select>
	</div>
	<div class="color-picker-pane" v-if="isOpen">
		<ul class="color-picker-list">
			<li @mousedown.prevent="hit(itm)" :class="itmClass(itm)"
				v-for="(itm, ix) in items" :key="ix">ELEMENT</li>
		</ul>
	</div>
</div>
`;
	const colors = "default|green|orange|cyan|red|purple|pink|gold|blue|salmon|seagreen|tan|magenta|lightgray|olive|teal";

	const baseControl = component('control');

	Vue.component('a2-color-picker', {
		extends: baseControl,
		props: {
			value: String
		},
		data() {
			return {
				isOpen: false
			};
		},
		template: colorPickerTemplate,
		computed: {
			items() { return ["red", "green", "blue", "tan"]; }
		},
		methods: {
			keydown() {
				alert('keydown');
			},
			toggle() { 
				this.isOpen = !this.isOpen;
			},
			hit(itm) {
				this.value = itm;
				this.isOpen = false;
			},
			itmClass(itm) {
				return false;
			}			
		}
	});


})();