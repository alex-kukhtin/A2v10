// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190403-7478*/
/*components/combobox.js*/

(function () {


	const utils = require('std:utils');

	let comboBoxTemplate =
`<div :class="cssClass()" v-lazy="itemsSource">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<div class="select-wrapper">
			<div v-text="getWrapText()" class="select-text" ref="wrap" :class="wrapClass"/>
			<span class="caret"/>
		</div>
		<select v-focus v-model="cmbValue" :disabled="disabled" :tabindex="tabIndex" ref="sel" :title="getWrapText()" :id="testId">
			<slot>
				<option v-for="(cmb, cmbIndex) in itemsSource" :key="cmbIndex" 
					v-text="getName(cmb, true)" :value="getValue(cmb)"></option>
			</slot>
		</select>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let baseControl = component('control');

	const defaultObj = {
		_validate_() {
			return true;
		}
	};

	Vue.component('combobox', {
		extends: baseControl,
		template: comboBoxTemplate,
		props: {
			prop: String,
			item: {
				type: Object, default() { return {}; }
			},
			itemsSource: {
				type: Array, default() { return []; }
			},
			itemToValidate: Object,
			propToValidate: String,
			nameProp: String,
			valueProp: String,
			showvalue: Boolean,
			align: String
		},
		computed: {
			cmbValue: {
				get() {
					return this.getComboValue();
				},
				set(value) {
					if (this.item) this.item[this.prop] = value;
				}
			},
			wrapClass() {
				let cls = '';
				if (this.align && this.align !== 'left')
					cls += 'text-' + this.align;
				return cls;
			}
		},
		methods: {
			getName(itm, trim) {
				let n = this.nameProp ? utils.eval(itm, this.nameProp) : itm.$name;
				return n;
			},
			getValue(itm) {
				let v = this.valueProp ? utils.eval(itm, this.valueProp) : itm;
				return v;
			},
			getWrapText() {
				return this.showvalue ? this.getComboValue() : this.getText();
			},
			getComboValue() {
				let val = this.item ? this.item[this.prop] : null;
				if (!utils.isObjectExact(val))
					return val;
				let vProp = this.valueProp || '$id';
				if (!(vProp in val))
					return val;
				if (this.itemsSource.indexOf(val) !== -1) {
					return val;
				}
				// always return value from ItemsSource
				return this.itemsSource.find(x => x[vProp] === val[vProp]);
			},
			getText() {
				let cv = this.getComboValue();
				if (utils.isObjectExact(cv))
					return this.getName(cv);
				if (this.itemsSource && this.itemsSource.length) {
					let vProp = this.valueProp || '$id';
					let ob = this.itemsSource.find(x => x[vProp] === cv);
					return ob ? this.getName(ob) : '';
				} else {
					return this.getOptionsText(cv);
				}
			},
			getOptionsText(cv) {
					// get text from select directly.
				let sel = this.$refs.sel;
				if (!sel) return '';
				let ops = sel.options;
				for (let i = 0; i < ops.length; i++) {
					if (''+ ops[i].value === '' + cv)
						return ops[i].text;
				}
				let si = sel.selectedIndex;
				if (si < 0 || si >= ops.length) return '';
				return ops[si].text;
			}
		},
		mounted() {
			// litle hack. $refs are unavailable during init.
			let t = this.getText();
			if (t)
				this.$refs.wrap.innerText = t;
		}
	});
})();