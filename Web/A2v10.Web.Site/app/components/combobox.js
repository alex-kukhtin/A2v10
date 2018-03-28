// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180328-7142*/
/*components/combobox.js*/

(function () {


	const utils = require('std:utils');

	let comboBoxTemplate =
`<div :class="cssClass()" v-lazy="itemsSource">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<select v-focus v-model="cmbValue" :class="inputClass" :disabled="disabled" :tabindex="tabIndex">
			<slot>
				<option v-for="(cmb, cmbIndex) in itemsSource" :key="cmbIndex" 
					v-text="getName(cmb)" :value="getValue(cmb)"></option>
			</slot>
		</select>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
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
			valueProp: String
		},
		computed: {
			cmbValue: {
				get() {
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
					return this.itemsSource.find((x) => x[vProp] === val[vProp]);
				},
				set(value) {
					if (this.item) this.item[this.prop] = value;
				}
			}
		},
		methods: {
			getName(itm) {
				let n = this.nameProp ? utils.eval(itm, this.nameProp) : itm.$name;
				return n;
			},
			getValue(itm) {
				let v = this.valueProp ? utils.eval(itm, this.valueProp) : itm;
				return v;
			}
		}
	});
})();