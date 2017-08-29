(function() {


    let textBoxTemplate =
`<div :class="cssClass">
	<div class="input-group">
		<input v-model.lazy="item[prop]" :class="inputClass"/>
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