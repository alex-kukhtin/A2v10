// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180605-7210
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
        <span class="feedback-pane-title">Зворотній зв'язок</span>
        <a class="btn btn-close" @click.prevent="close">&#x2715</a>
    </div>
    <div class="feedback-body">
		<template v-if="shown">
			<div>Дякуємо, що знайшли час та натхнення, щоб повідомити нам про ваші враження від нашого сервісу.</div>
			<div style="margin-bottom:20px" />
			<div class="control-group" style="">
				<label>Чи подобається вам наш сервіс</label> 
				<div class="input-group">
					<textarea rows="3" maxlength="255" v-model="value" style="height: 55px;" v-auto-size="true"></textarea>  
				</div>
			</div>
			<button class="btn btn-primary" :disabled="noValue" @click.prevent="submit">Відправити пропозицію</button>
		</template>
		<template v-else>
			<div class="thanks">
				Дякуємо, що ви знайшли час для допомоги нам в покращенні сервісу. 
				<br/></br>Ми опрацюємо ваші пропозиції найближчим часом. 
				В разі виникнення додаткових питань - зв'яжемося з вами.
			</div>
			<button class="btn btn-primary" @click.prevent="close">Закрити</button>
		</template>
	</div>
</div>
`,
		components: {
		},
		props: {
			visible: Boolean,
			modelStack: Array,
			close: Function
		},
		data() {
			return {
				value: "",
				shown: true
			};
		},
		computed: {
			noValue() { return !this.value;}
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
				const url = urlTools.combine(root, 'shell/savefeedback');
				const that = this;
				let jsonData = utils.toJson({ text: this.value });
				dataService.post(url, jsonData).then(function (result) {
					//that.trace.splice(0, that.trace.length);
					console.dir(result);
					that.shown = false;
					//result.forEach((val) => {
						//that.trace.push(val);
					//});
				}).catch(function (result) {
					console.dir(result);
					alert('Щось пішло не так. Спробуйте ще через декілька хвилин');
				});

			}
		},
		watch: {
			visible(val) {
				if (!val) return;
				this.shown = true;
				// load my feedbacks
				this.loadfeedbacks();
			}
		},
		created() {
		}
	});
})();
