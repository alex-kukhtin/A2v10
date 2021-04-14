// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210414-7765*/
/*components/textbox.js*/

/* password-- fake fields are a workaround for chrome autofill getting the wrong fields -->*/

(function () {

	const utils = require('std:utils');
	const mask = require('std:mask');

	let textBoxTemplate =
		`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<input v-if="password" type="text" class="fake-pwd-field" tabindex="-1"/>
		<input ref="input" :type="controlType" v-focus :autocomplete="autocompleteText"
			v-bind:value="modelValue" 
				v-on:change="onChange($event.target.value)" 
				v-on:input="onInput($event.target.value)"
				v-on:keypress="onKey($event)"
				:class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength" :spellcheck="spellCheck"/>
		<slot></slot>
		<a class="a2-hyperlink add-on a2-inline" tabindex="-1" href="" @click.stop.prevent="clear" v-if="clearVisible"><i class="ico ico-clear"></i></a>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let textAreaTemplate =
		`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group">
		<textarea ref="input" v-focus v-auto-size="autoSize" v-bind:value="modelValue2" :style="areaStyle"
			v-on:change="onChange($event.target.value)" 
			v-on:input="onInput($event.target.value)"
			v-on:keypress="onKey($event)"
			:rows="rows" :class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength" :spellcheck="spellCheck"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	let staticTemplate =
		`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/><slot name="link"></slot></label>
	<div class="input-group static">
		<span v-focus v-text="textProp" :class="inputClass" :tabindex="tabIndex" class="static-input"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;

	/*
	<span>{{ path }}</span>
		<button @click="test" >*</button >
	*/

	let baseControl = component('control');

	const textbox = {
		extends: baseControl,
		template: textBoxTemplate,
		props: {
			item: {
				type: [Object, Array], default() {
					return {};
				}
			},
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			password: Boolean,
			number: Boolean,
			spellCheck: { type: Boolean, default: undefined },
			enterCommand: Function,
			hasClear: Boolean
		},
		computed: {
			controlType() {
				return this.password ? 'password' : 'text';
			},
			autocompleteText() {
				return this.password ? 'new-password' : 'off';
			},
			clearVisible() {
				if (!this.hasClear) return false;
				return !!this.item[this.prop];
			}
		},
		methods: {
			updateValue(value) {
				if (this.mask)
					this.item[this.prop] = mask.getUnmasked(this.mask, value);
				else
					this.item[this.prop] = utils.parse(value, this.dataType);
				let mv = this.modelValue;
				if (this.$refs.input.value !== mv) {
					this.$refs.input.value = mv;
					this.$emit('change', this.item[this.prop]);
				}
			},
			onInput(value) {
				if (this.updateTrigger === 'input')
					this.updateValue(value);
			},
			onChange(value) {
				if (this.updateTrigger !== 'input')
					this.updateValue(value);
			},
			onKey(event) {
				if (this.number) {
					if ((event.charCode < 48 || event.charCode > 57) && event.charCode !== 45 /*minus*/) {
						event.preventDefault();
						event.stopPropagation();
					}
				}
				if (event.code === "Enter") {
					if (this.enterCommand) {
						this.enterCommand();
					}
				}
			},
			clear() {
				this.item[this.prop] = '';
			}
		}
	};

	Vue.component('textbox', textbox);
	app.components['textbox'] = textbox;

	const textarea = {
		extends: baseControl,
		template: textAreaTemplate,
		props: {
			item: {
				type: [Object, Array], default() {
					return {};
				}
			},
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			placeholder: String,
			autoSize: Boolean,
			rows: Number,
			spellCheck: { type: Boolean, default: undefined },
			enterCommand: Function,
			maxHeight: String
		},
		computed: {
			modelValue2() {
				if (!this.item) return null;
				return this.item[this.prop];
			},
			areaStyle() {
				if (this.maxHeight)
					return { 'max-height': this.maxHeight };
				return undefined;
			}
		},
		methods: {
			updateValue(value) {
				if (this.item[this.prop] === value) return;
				this.item[this.prop] = value;
				this.$emit('change', this.item[this.prop]);
			},
			onInput(value) {
				if (this.updateTrigger === 'input')
					this.updateValue(value);
			},
			onChange(value) {
				if (this.updateTrigger !== 'input')
					this.updateValue(value);
			},
			onKey(event) {
				if (event.code === "Enter" && event.ctrlKey) {
					if (this.enterCommand) {
						this.enterCommand();
					}
				}
			}
		},
		watch: {
			modelValue() {
				if (!this.autoSize) return;
				let inp = this.$refs.input;
				if (!inp) return;
				// send for auto size
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent('autosize', false, true);
				inp.dispatchEvent(evt);
			}
		}

	};

	const staticControl = {
		extends: baseControl,
		template: staticTemplate,
		props: {
			item: {
				type: [Object, Array], default() {
					return {};
				}
			},
			prop: String,
			itemToValidate: Object,
			propToValidate: String,
			text: [String, Number, Date]
		},
		computed: {
			textProp() {
				if (this.mask && this.text)
					return mask.getMasked(this.mask, this.text);
				return this.text;
			}
		}
	};


	Vue.component('textbox', textbox);
	app.components['textbox'] = textbox;

	Vue.component('a2-textarea', textarea);
	app.components['a2-textarea', textarea];

	Vue.component('static', staticControl);
	app.components['static', staticControl];

})();