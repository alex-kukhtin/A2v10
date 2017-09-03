(function() {


    let textBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model.lazy="item[prop]" :class="inputClass"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
</div>
`;

	/*
	<span>{{ path }}</span>
		<button @click="test" >*</button >
	*/

    let baseControl = component('control');

    Vue.component('textbox', {
        extends: baseControl,
        template: textBoxTemplate,
        props: {
            item: Object,
            prop: String,
            align: { type: String, default: 'left' }
		}		
    });
})();