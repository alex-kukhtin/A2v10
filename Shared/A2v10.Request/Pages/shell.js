// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

/*20221123-7907*/

(function () {

	const Shell = component('std:shellController');

	const AppHeader = component('std:appHeader');
	const MainView = component('std:mainView');

	const menu = $(Menu);
	const companies = $(Companies);
	const initialPeriod = $(Period);

	const sp = menu.SysParams || {};

	const shell = new Shell({
		el: '#shell',
		components: {
			'a2-app-header': AppHeader,
			'a2-main-view': MainView
		},
		data: {
			version: '$(AppVersion)',
			menu: menu.Menu ? menu.Menu[0].Menu : null,
			newMenu: menu.NewMenu,
			settingsMenu: menu.SettingsMenu,
			companies: companies,
			initialPeriod: initialPeriod,
			title: sp.AppTitle || '',
			subtitle: sp.AppSubTitle || '',
			sideBarMode: sp.SideBarMode || '',
			navBarMode: sp.NavBarMode || '',
			pages: menu.SysParams ? (menu.SysParams.Pages + ',') : '',
			userState: menu.UserState,
			userIsAdmin: $(Admin),
			userIsTenantAdmin: $(TenantAdmin),
			userIsExternal: $(ExternalUser),
			isDebug: $(Debug),
			appData: $(AppData)
		},
		computed: {
			appLinks() {
				return this.appData ? this.appData.links : null;
			},
			hasFeedback() {
				return this.appData && this.appData.feedback;
			},
			feedback() {
				return this.appData ? this.appData.feedback : null;
			}
		},
		methods: {
		}
	});

	window.$$rootUrl = '';
	window.$$debug = $(Debug);

})();