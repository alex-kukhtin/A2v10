// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

(function () {

	$(Utils)
	$(Locale)

	const vm = new Vue({
		el: "#app",
		data: {
			info: $(PageData),
			appLinks: $(AppLinks),
			appData: $(AppData),
			processing: false
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