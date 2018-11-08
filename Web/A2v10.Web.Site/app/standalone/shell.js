// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181108-7350
// standalone/shell.js

(function () {

	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const urlTools = require('std:url');
	const utils = require('std:utils');
	const locale = window.$$locale;


	const a2MainView = {
		template: `
<div class="main-view">
	<div class="modal-wrapper" v-for="dlg in modals">
		<a2-modal :dialog="dlg"></a2-modal>
	</div>
	<div class="fade" :class="{show: hasModals, 'modal-backdrop': hasModals}"/>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
		},
		data() {
			return {
				requestsCount: 0,
				modals: []
			};
		},
		computed: {
			hasModals() { return this.modals.length > 0; }
		},
		created() {

			let me = this;
			eventBus.$on('beginRequest', function () {
				if (me.hasModals)
					return;
				me.requestsCount += 1;
			});
			eventBus.$on('endRequest', function () {
				if (me.hasModals)
					return;
				me.requestsCount -= 1;
			});

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/data/dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				//url = store.replaceUrlQuery(url, prms.query);  // TODO: убрать store????
				let dlg = { title: "dialog", url: url, prms: prms.data };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});


			eventBus.$on('modalClose', function (result) {
				let dlg = me.modals.pop();
				if (result)
					dlg.resolve(result);
			});

			eventBus.$on('modalCloseAll', function () {
				while (me.modals.length) {
					let dlg = me.modals.pop();
					dlg.resolve(false);
				}
			});

			eventBus.$on('confirm', function (prms) {
				let dlg = prms.data;
				dlg.promise = new Promise(function (resolve) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});

		}
	};

	new Vue({
		el: "#shell",
		components: {
			'a2-main-view': a2MainView
		},
		data() {
			return {
			};
		},
		created() {
		}
	});
})();