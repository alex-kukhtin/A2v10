// Copyright © 2015-2020 Oleksandr Kukhtin. All rights reserved.

// 20200930-7708
// components/megamenu.js


(function () {

	const utils = require('std:utils');
	const menuTemplate =
`<div class="dropdown-menu menu" role="menu">
	<div class="super-menu" :class="cssClass" :style="cssStyle">
		<div v-for="(m, mx) of topMenu" :key="mx" class="menu-group">
			<div class="group-title" v-text="m.Name"></div>
			<template v-for="(itm, ix) in m.menu">
				<div class="divider" v-if=isDivider(itm) ></div>
				<slot name="item" :menuItem="itm" v-else></slot>
			</template>
		</div>
	</div>
</div>
`;

	Vue.component('mega-menu', {
		template: menuTemplate,
		props: {
			itemsSource: Array,
			groupBy: String,
			columns: Number,
			width: String
		},
		data() {
			return {

			};
		},
		computed: {
			cssClass() {
				let cls = 'cols-' + (this.columns || 1);
				if (this.width)
					cls += ' with-width';
				return cls;
			},
			cssStyle() {
				if (this.width)
					return { width: this.width };
				return undefined;
			},
			topMenu() {
				if (!this.itemsSource) return {};
				return this.itemsSource.reduce((acc, itm) => {
					let g = utils.simpleEval(itm, this.groupBy) || '';
					let ma = acc[g];
					if (ma)
						ma.menu.push(itm);
					else
						acc[g] = { Name: g, menu: [itm] };
					return acc;
				}, {});
			}
		},
		methods: {
			isDivider(itm) {
				return itm.Name === '-';
			}
		}
	});

})();