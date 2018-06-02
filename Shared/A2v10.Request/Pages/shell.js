
/*20180408-7152*/

(function () {

	const Shell = component('std:shellController');

	const menu = $(Menu);

	const shell = new Shell({
		el: '#shell',
		data: {
			version: '$(AppVersion)',
			menu: menu.Menu ? menu.Menu[0].Menu : null,
			newMenu: menu.NewMenu,
			title: menu.SysParams.AppTitle,
			subtitle: menu.SysParams.AppSubTitle,
			sideBarMode: menu.SysParams.SideBarMode,
			userIsAdmin: $(Admin),
			isDebug: $(Debug),
			appData: $(AppData)
		},
		computed: {
			appLinks() {
				return this.appData ? this.appData.links : null;
			}
		}

	});

	window.$$rootUrl = '';
	window.$$debug = $(Debug);
})();