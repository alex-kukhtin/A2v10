// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210604-7780*/
/* bootstrap/sidebar.js */

(function () {
	const store = component('std:store');
	const urlTools = require('std:url');
	const menuTools = component('std:navmenu');
	const htmlTools = require('std:html');

	const sideBar = {
		props: {
			menu: Array,
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			topMenu() {
				let seg0 = this.seg0;
				return menuTools.findMenu(this.menu, (mi) => mi.Url === seg0);
			},
			sideMenu() {
				let top = this.topMenu;
				return top ? top.Menu : null;
			}
		},
		methods: {
			isActive(item) {
				let isActive = this.seg1 === item.Url;
				if (isActive)
					htmlTools.updateDocTitle(item.Name);
				return isActive;
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				if (!item.Url) return;
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.Url, item.Url);
					if (item.Url.indexOf('/') === -1) {
						// save only simple path
						try {
							// avoid EDGE error QuotaExceeded
							localStorage.setItem('menu:' + urlTools.combine(window.$$rootUrl, top.Url), item.Url);
						}
						catch (e) {
							// do nothing
						}
					}
					this.$store.commit('navigate', { url: url, title: item.Name });
				}
				else
					console.error('no top menu found');
			}
		}
	}



	app.components['std:sideBarBase'] = sideBar;
})();
