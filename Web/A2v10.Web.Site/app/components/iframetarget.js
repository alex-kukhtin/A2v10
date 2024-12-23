// Copyright © 2015-2018 Oleksandr Kukhtin. All rights reserved.

// 20180605-7327
// components/iframetarget.js*/

(function () {

	const eventBus = require('std:eventBus');

	Vue.component('a2-iframe-target', {
		template: `
<div class="frame-stack" v-if="visible">
	<iframe width="100%" height="100%" :src="iFrameUrl" frameborder="0" />
</div>
`,
		data() {
			return {
				iFrameUrl: ''
			};
		},
		computed: {
			visible() { return !!this.iFrameUrl; }
		},
		created() {
			eventBus.$on('openframe', (url) => {
				alert(url);
				this.iFrameUrl = url;
			});
		}
	});
})();