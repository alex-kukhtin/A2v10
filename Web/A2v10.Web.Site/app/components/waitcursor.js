// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20191010-7567
// components/waitcursor.js


(function () {
	const waitCursor = {
		template: `<div class="wait-cursor" v-if="visible"><div class="spinner"/></div>`,
		props: {
			ready: Boolean
		},
		computed: {
			visible() {
				return !this.ready;
			}
		}
	};

	Vue.component("wait-cursor", waitCursor);
})();