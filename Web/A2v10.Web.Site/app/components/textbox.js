(function() {

    const utlis = require('std:utils');

    let textBoxTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input v-focus v-model.lazy="item[prop]" :class="inputClass" :placeholder="placeholder" :disabled="disabled"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let textAreaTemplate =
        `<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<textarea v-focus v-model.lazy="item[prop]" :rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let staticTemplate =
`<div :class="cssClass">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group static">
		<span v-text="text" :class="inputClass"/>
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

    Vue.component('textbox', {
        extends: baseControl,
        template: textBoxTemplate,
		props: {
			item: {
				type: Object, default() {
					return {};
				}
			},
            prop: String,
            placeholder: String
        }
    });

    Vue.component('a2-textarea', {
        extends: baseControl,
        template: textAreaTemplate,
        props: {
            item: {
                type: Object, default() {
                    return {};
                }
            },
            prop: String,
            placeholder: String,
            rows:Number
        }
    });

    Vue.component('static', {
        extends: baseControl,
        template: staticTemplate,
        props: {
            item: {
                type: Object, default() {
                    return {};
                }
            },
            prop: String,
            text: [String, Number, Date]
        }
    });

})();