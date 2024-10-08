﻿// Copyright © 2015-2021 Oleksandr Kukhtin. All rights reserved.

/*20210914-7803*/
/*components/newbutton.js*/

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');

	const newButtonTemplate =
`<div class="dropdown dir-down a2-new-btn separate" v-dropdown v-if="isVisible">
	<button class="btn btn-icon" :class="btnClass" toggle aria-label="New"><i class="ico" :class="iconClass"></i></button>
	<div class="dropdown-menu menu down-left">
		<div class="super-menu" :class="cssClass">
			<div v-for="(m, mx) in topMenu" :key="mx" class="menu-group">
				<div class="group-title" v-text="m.Name"></div>
				<template v-for="(itm, ix) in m.Menu">
					<div class="divider" v-if=isDivider(itm)></div>
					<a v-else @click.prevent='doCommand(itm.Url, itm.Params)' 
						class="dropdown-item" tabindex="-1"><i class="ico" :class="'ico-' + itm.Icon"></i><span v-text="itm.Name"></span></a>
				</template>
			</div>
		</div>
	</div>
</div>
`;

	Vue.component('a2-new-button', {
		template: newButtonTemplate,
		store: store,
		props: {
			menu: Array,
			icon: String,
			btnStyle: String
		},
		computed: {
			isVisible() {
				return !!this.menu;
			},
			topMenu() {
				return this.menu ? this.menu[0].Menu : null;
			},
			iconClass() {
				return this.icon ? 'ico-' + this.icon : '';
			},
			btnClass() {
				return this.btnStyle ? 'btn-' + this.btnStyle : '';
			},
			columns() {
				let descr = this.menu ? this.menu[0].Params : '';
				if (!descr) return 1;
				try {
					return +JSON.parse(descr).columns || 1;
				} catch (err) {
					return 1;
				}
			},
			cssClass() {
				return 'cols-' + this.columns;
			}
		},
		created() {
		},
		methods: {
			isDivider(itm) {
				return itm.Name === '-';
			},
			doCommand(cmd, strOpts) {
				let requeryAfter = false;
				if (strOpts) {
					try {
						requeryAfter = JSON.parse(strOpts).requeryAfter;
					} catch (err) {
						requeryAfter = false;
					}
				}
				cmd = cmd || '';
				if (cmd.startsWith('navigate:'))
					this.navigate(cmd.substring(9));
				else if (cmd.startsWith('dialog:'))
					this.dialog(cmd.substring(7), requeryAfter);
				else if (cmd.startsWith('external:'))
					window.open(cmd.substring(9), '_blank');
				else
					alert('invalid command:' + cmd);
			},
			navigate(url) {
				this.$store.commit('navigate', { url: url });
			},
			dialog(url, requeryAfter) {
				const dlgData = { promise: null};
				eventBus.$emit('modaldirect', url, dlgData);
				dlgData.promise.then(function (result) {
					// todo: resolve?
					if (requeryAfter) {
						eventBus.$emit('requery', url, dlgData);
					}
				});
			}
		}
	});
})();