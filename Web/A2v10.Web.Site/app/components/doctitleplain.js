// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

// 20230511-7933
// components/doctitleplain.js*/

(function () {

	const eventBus = require('std:eventBus');

	const documentTitle = {
		render() {
			return null;
		},
		props: ['page-title'],
		watch: {
			pageTitle(newValue) {
				this.setTitle();
			}
		},
		methods: {
			setTitle() {
				eventBus.$emit('setdoctitle', this.pageTitle);
			}
		},
		created() {
			this.setTitle();
		}
	};

	app.components['std:doctitle'] = documentTitle;

})();