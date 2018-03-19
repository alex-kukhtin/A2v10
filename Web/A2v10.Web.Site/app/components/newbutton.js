// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180319-7135*/
/*components/newbutton.js*/

(function () {

	const store = component('std:store');
	const urltools = require('std:url');
	const eventBus = require('std:eventBus');

	const newButtonTemplate =
`<div class="dropdown dir-down a2-new-btn" v-dropdown v-if="isVisible">
	<button class="btn btn-success" toggle><i class="ico ico-plus"></i></button>
	<div class="dropdown-menu menu down-right">
		<div class="super-menu" :class="cssClass">
			<div v-for="(m, mx) in topMenu" :key="mx" class="menu-group">
				<div class="group-title" v-text="m.Name"></div>
				<template v-for="(itm, ix) in m.Menu">
					<div class="divider" v-if=isDivider(itm)></div>
					<a v-else @click.prevent='doCommand(itm.Url)' 
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
			menu: Array
		},
		computed: {
			isVisible() {
				return !!this.menu;
			},
			topMenu() {
				return this.menu ? this.menu[0].Menu : null;
			},
			columns() {
				let descr = this.menu ? this.menu[0].Description : '';
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
			doCommand(cmd) {
				cmd = cmd || '';
				if (cmd.startsWith('navigate:')) {
					this.navigate(cmd.substring(9));
				} else if (cmd.startsWith('dialog:')) {
					this.dialog(cmd.substring(7));
				} else {
					alert('invalid command:' + cmd);
				}
			},
			navigate(url) {
				let urlToNavigate = urltools.createUrlForNavigate(url);
				this.$store.commit('navigate', { url: urlToNavigate });
			},
			dialog(url) {
				const dlgData = { promise: null};
				eventBus.$emit('modal', url, dlgData);
				dlgData.promise.then(function (result) {
					// todo: resolve?
				});
			}
		}
	});
})();