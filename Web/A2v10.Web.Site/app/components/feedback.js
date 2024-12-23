// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20220906-7884
// components/feedback.js*/

(function () {

    /**
     * TODO
    1. Trace window
    2. Dock right/left
    6.
     */

	const dataService = require('std:dataservice');
	const urlTools = require('std:url');
	const locale = window.$$locale;
	const utils = require('std:utils');

	Vue.component('a2-feedback', {
		template: `
<div class="feedback-panel" v-if="visible">
    <div class="feedback-pane-header">
        <span class="feedback-pane-title" v-text="source.title"></span>
        <a class="btn btn-close" @click.prevent="close">&#x2715</a>
    </div>
    <div class="feedback-body">
		<template v-if="shown">
			<div v-html="source.promptText"></div>
			<div v-if="!source.skipForm">
				<div style="margin-bottom:20px" />
				<div class="control-group" style="">
					<label v-html="source.labelText" /> 
					<div class="input-group">
						<textarea rows="5" maxlength="2048" v-model="value" style="height: 92px;max-height:400px" v-auto-size="true" />
					</div>
				</div>
				<button class="btn btn-primary" :disabled="noValue" @click.prevent="submit" v-text="source.buttonText" />
			</div>
			<include v-if="source.externalFragment" :src="source.externalFragment"/>
			
		</template>
		<template v-else>
			<div class="thanks" v-html="source.thanks" />
			<button class="btn btn-primary" @click.prevent="close" v-text="closeText" />
		</template>
	</div>
</div>
`,
		components: {
		},
		props: {
			visible: Boolean,
			modelStack: Array,
			close: Function,
			source: Object
		},
		data() {
			return {
				value: "",
				shown: true
			};
		},
		computed: {
			noValue() { return !this.value; },
			closeText() { return locale.$Close; }
		},
		methods: {
			text(key) {
				return locale[key];
			},
			refresh() {
			},
			loadfeedbacks() {

			},
			submit() {
				const root = window.$$rootUrl;
				const url = urlTools.combine(root, '_shell/savefeedback');
				const that = this;
				let jsonData = utils.toJson({ text: this.value });
				dataService.post(url, jsonData).then(function (result) {
					//that.trace.splice(0, that.trace.length);
					//console.dir(result);
					that.shown = false;
					that.value = '';
					//result.forEach((val) => {
						//that.trace.push(val);
					//});
				}).catch(function (result) {
					console.dir(result);
					that.$parent.$alert(that.source.alert);
					that.close();
					//alert('Щось пішло не так. Спробуйте ще через декілька хвилин');
				});

			}
		},
		watch: {
			visible(val) {
				if (!val) return;
				this.shown = true;
				this.value = '';
				// load my feedbacks
				this.loadfeedbacks();
			}
		},
		created() {
		}
	});
})();
