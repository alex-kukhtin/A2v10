/*20171027-7057*/
/*components/textbox.js*/

(function () {

    const utlis = require('std:utils');

    let textBoxTemplate =
`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<input :type="controlType" v-focus v-model.lazy="item[prop]" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let textAreaTemplate =
        `<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group">
		<textarea v-focus v-model.lazy="item[prop]" :rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors"></validator>
	</div>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

    let staticTemplate =
`<div :class="cssClass()">
	<label v-if="hasLabel" v-text="label" />
	<div class="input-group static">
		<span v-focus v-text="text" :class="inputClass" :tabindex="tabIndex"/>
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
            itemToValidate: Object,
            propToValidate: String,
            placeholder: String,
            password: Boolean
        },
        computed: {
            controlType() {
                return this.password ? "password" : "text";
            }
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
            itemToValidate: Object,
            propToValidate: String,
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
            itemToValidate: Object,
            propToValidate: String,
            text: [String, Number, Date]
        }
    });

})();