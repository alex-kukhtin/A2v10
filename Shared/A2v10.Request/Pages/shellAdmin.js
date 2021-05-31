// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210529-7776*/

(function () {

	const Shell = component('std:shellController');
	const locale = window.$$locale;

	const AppHeader = component('std:appHeader');
	const MainView = component('std:mainView');


	const menu = $(Menu);
	const menucomp = component('std:navmenu');

	const shell = new Shell({
		el: '#shell',
		components: {
			'a2-app-header': AppHeader,
			'a2-main-view': MainView
		},
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