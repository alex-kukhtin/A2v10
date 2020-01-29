// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200129-7623*/
/* controllers/iframe.js */

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const urlTools = require('std:url');
	const utils = require('std:utils');
	const popup = require('std:popup');

	const a2IFrameView = {
		template: `
<div class="main-view">
	<div class="modal-stack" v-if="hasModals">
		<div class="modal-wrapper modal-animation-frame" v-for="dlg in modals">
			<a2-modal :dialog="dlg"></a2-modal>
		</div>
	</div>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		data() {
			return {
				modals: []
			};
		},
		computed: {
			hasModals() { return this.modals.length > 0; }
		},
		created() {

			let me = this;

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/_dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				url = store.replaceUrlQuery(url, prms.query); // TODO: убрать store????
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
		el: "#iframe-app",
		components: {
			'a2-iframe-view': a2IFrameView
		},
		created() {
			popup.startService();
			eventBus.$on('closeAllPopups', popup.closeAll);
		}
	});

})();