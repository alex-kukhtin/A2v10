// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191115-7578*/
// templates.js
(function () {

	let textBoxTemplate =
`<div :class="cssClass()" :test-id="testId">
	<label v-if="hasLabel"><span v-text="label"/><slot name="hint"/></label>
	<div class="input-group">
		<input v-if="password" type="password" style="display:none" autocomplete="off"/>
		<input ref="input" :type="controlType" v-focus autocomplete="off"
			v-bind:value="modelValue" 
				v-on:change="onChange($event.target.value)" 
				v-on:input="onInput($event.target.value)"
				v-on:keypress="onKey($event)"
				:class="inputClass" :placeholder="placeholder" :disabled="disabled" :tabindex="tabIndex" :maxlength="maxLength" :spellcheck="spellCheck"/>
		<slot></slot>
		<validator :invalid="invalid" :errors="errors" :options="validatorOptions"></validator>
	</div>
	<slot name="popover"></slot>
	<span class="descr" v-if="hasDescr" v-text="description"></span>
</div>
`;



	app.modules['std:templates'] = {
		textBox: textBoxTemplate
	};

})();



