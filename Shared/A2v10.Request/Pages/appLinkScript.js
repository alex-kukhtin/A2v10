// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {

	$(Locale)

	const vm = new Vue({
		el: "#app",
		components: {
			"a2-document-title": {
				props: {
					pageTitle: String
				},
				created() {
					if (this.pageTitle)
						document.title = this.pageTitle;
				}
			}
		},
		data: {
			info: $(PageData),
			processing: false,
			appLinks: $(AppLinks)
		},
		computed: {
			locale() {
				return window.$$locale;
			}
		}
	});
})();