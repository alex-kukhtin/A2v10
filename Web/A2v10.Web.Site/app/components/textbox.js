(function() {


    let textBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model.lazy="item[prop]" :class="inputClass"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	/*
	<span>{{ path }}</span>
		<button @click="test" >*</button >
	*/

    let baseControl = component('control');

	const defaultObj = {
		_validate_() {
			return true;
		}
	};

    Vue.component('textbox', {
        extends: baseControl,
        template: textBoxTemplate,
		props: {
			item: {
				type: Object, default: {}
			},
            prop: String
		}		
    });
})();