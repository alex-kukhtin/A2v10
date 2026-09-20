// Copyright © 2026 Oleksandr Kukhtin. All rights reserved.

// 20260911-7954
// components/report.js

(function () {


	const url = require('std:url');
	const utils = require('std:utils');

	const locale = window.$$locale;

	Vue.component('a2-pdfreport-viewer', {
		template: `
<div class="a2-pdfreport-viewer">
	<object type="application/pdf" :data="source" width="100%" height="100%"/>
</div>
`,
		props: {
			url: String,
			argument: Object,
			report: String
		},
		computed: {
			source: function () {
				let root = window.$$rootUrl;
				let arg = this.argument || 0;
				if (utils.isObjectExact(this.argument)) {
					arg = this.argument.$id || 0;
				}
				return url.combine(root, 'report/show', arg) + url.makeQueryString({ base: this.url, rep: this.report });
			}
		}
	});

})();