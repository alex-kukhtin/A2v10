// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

(function () {

	'use strict';

	const eventBus = require('std:eventBus');

	const store = component('std:store');
	const documentTitle = component("std:doctitle");


	const vm = new Vue({
		el: "#$(PageGuid)",
		store: store,
		data: {
			appData: $(AppData)
		},
		components: {
			'a2-document-title': documentTitle
		},
		computed: {
			hasLogo() {
				return this.appData && this.appData.appLogo;
			},
			logoSrc() {
				return this.appData.appLogo;
			},
			locale() {
				return window.$$locale;
			}
		},
		methods: {
			$close() {
				this.$store.commit("close");
			},
			$requery() {
				eventBus.$emit('requery');
			}
		},
		destroyed() {
		}
	});

})();