// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {

	$(Utils)
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
			appLinks: $(AppLinks),
			appData: $(AppData)
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
			getReferUrl(url) {
				return getReferralUrl(url);
			}
		}
	});
})();