
(function () {

	Vue.component('property-grid-item', {
		template: `
<tr>
	<td class="prop" v-text="name"></td>
	<td class="val">
		<span v-text="formatedValue"></span>
		<slot></slot>
	</td>
</tr>
`,
		props: {
			name: String,
			value: undefined,
			format: String
		},
		computed: {
			formatedValue() {
				if (!this.format)
					return this.value;
				return this.value.toLocaleDateString();
			}
		}
	});

	Vue.component('property-grid', {
		template: `
<table class="prop-grid">
	<colgroup>
		<col style="width:1px"/>
		<col style="width:130px"/>
	</colgroup>
	<tbody>
		<property-grid-item v-for="(item, propIndex) in itemsSource" 
			:key="propIndex" :name="item[nameProp]" :value="item[valueProp]" :format="item[formatProp]">
		</property-grid-item>
		<slot>
		</slot>
	</tbody>
</table>
`,
		props: {
			itemsSource: Array,
			nameProp: String,
			valueProp: String,
			formatProp: String
		},
		computed: {
		}
	});

})();

