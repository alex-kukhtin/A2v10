// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

// 20230122-7916
// components/tagscontrol.js*/

(function () {
	const template = `
<ul class=tags-control>
	<li v-for="(itm, ix) in itemsSource" :key="ix">
		<span v-text="text(itm)" :class="cssClass(itm)"></span>
		<span class="tag-remove">×</span>
	</li>
	<li>
		
	</li>
</ul>
`;
	Vue.component('a2-tags', {
		props: {
			itemsSource: Array,
			contentProperty: String,
			colorProperty: String,
			readOnly: Boolean
		},
		template,
		methods: {
			remove(itm) {
				alert(itm);
			}
		}
	});
})();