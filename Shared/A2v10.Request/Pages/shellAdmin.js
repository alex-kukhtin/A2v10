// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20201111-7721*/

(function () {

	const Shell = component('std:shellController');
	const locale = window.$$locale;

	const menu = $(Menu);
	const menucomp = component('std:navmenu');

	const shell = new Shell({
		el: '#shell',
		data: {
			title: menu.SysParams ? menu.SysParams.AppTitle : '',
			subtitle: locale.$Admin,
			version: '$(AppVersion)',
			menu: menu.Menu[0].Menu
		},
		methods: {
			root() {
				let opts = { title: null };
				let currentUrl = this.$store.getters.url;
				let menuUrl = menucomp.makeMenuUrl(this.menu, '/', opts);
				if (currentUrl === menuUrl) {
					return; // already in root
				}
				this.$store.commit('navigate', { url: menuUrl, title: opts.title });
			}
		}
	});

	window.$$rootUrl = '/admin';
	window.$$debug = $(Debug);

})();