// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200526-7662
// components/waitcursor.js


(function () {
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