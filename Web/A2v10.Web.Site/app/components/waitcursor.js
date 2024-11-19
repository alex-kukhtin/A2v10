// Copyright © 2015-2020 Oleksandr Kukhtin. All rights reserved.

// 20200819-7703
// components/waitcursor.js


(function () {
	/* doesn't work without load-indicator for some reason */
	const waitCursor = {
		template: `<div class="wait-cursor" v-if="visible()"><div class="spinner"/></div>`,
		props: {
			ready: Boolean
		},
		methods: {
			visible() {
				return !this.ready;
			}
		}
	};

	Vue.component("wait-cursor", waitCursor);
})();