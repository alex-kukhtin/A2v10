
(function () {


    const utils = require('utils');

    let comboBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<select v-model="cmbValue" :class="inputClass">
			<slot>
				<option v-for="(cmb, cmbIndex) in itemsSource" :key="cmbIndex" 
					v-text="cmb.$name" :value="cmb"></option>
			</slot>
		</select>
		<validator :invalid="invalid" :errors="errors"></validator>
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
				type: Object, default() { return {}; } },
			itemsSource: {
				type: Array, default() { return []; } }
		},
		computed: {
			cmbValue: {
                get() {
                    let val = this.item ? this.item[this.prop] : null;
                    if (!utils.isObjectExact(val))
                        return val;
                    if (this.itemsSource.indexOf(val) !== -1) {
                        return val;
                    }
                    // always return value from ItemsSource
                    return this.itemsSource.find((x) => x.$id === val.$id);
                },
				set(value) {
					if (this.item) this.item[this.prop] = value;
				}
            },
        }
    });
})();