// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {

	'use strict';

	const eventBus = require('std:eventBus');

	const store = component('std:store');
	const documentTitle = component("std:doctitle");


	const vm = new Vue({
		el: "#$(PageGuid)",
		store: store,
		data: {
		},
		components: {
			'a2-document-title': documentTitle
		},
		computed: {
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