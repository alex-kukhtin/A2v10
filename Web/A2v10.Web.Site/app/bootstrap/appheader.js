// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210606-7781*/
/* bootstrap/appheader.js */

(function () {

	const locale = window.$$locale;
	const urlTools = require('std:url');
	const menuTools = component('std:navmenu');

	const a2AppHeader = {
		props: {
			title: String,
			subtitle: String,
			userState: Object,
			personName: String,
			clientId: String,
			userIsAdmin: Boolean,
			menu: Array,
			newMenu: Array,
			settingsMenu: Array,
			appData: Object,
		},
		computed: {
			locale() { return locale; },
			seg0: () => this.$store.getters.seg0
		},
		methods: {
			isActive(item) {
				return this.seg0 === item.Url;
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				let storageKey = 'menu:' + urlTools.combine(window.$$rootUrl, item.Url);
				let savedUrl = localStorage.getItem(storageKey) || '';
				if (savedUrl && !menuTools.findMenu(item.Menu, (mi) => mi.Url === savedUrl)) {
					// saved segment not found in current menu
					savedUrl = '';
				}
				let opts = { title: null, seg2: savedUrl };
				let url = menuTools.makeMenuUrl(this.menu, item.Url, opts);
				this.$store.commit('navigate', { url: url, title: opts.title });
			}
		}
	};

	app.components['std:appHeaderBase'] = a2AppHeader;

})();

