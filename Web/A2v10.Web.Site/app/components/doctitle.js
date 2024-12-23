// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20180821-7280
// components/doctitle.js*/

(function () {

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
				if (this.pageTitle)
					document.title = this.pageTitle;
			}
		},
		created() {
			this.setTitle();
		}
	};

	app.components['std:doctitle'] = documentTitle;

})();