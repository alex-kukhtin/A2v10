
/*20200122-7619*/

(function () {

	const Shell = component('std:shellController');

	const menu = $(Menu);
	const companies = $(Companies);
	const initialPeriod = $(Period);

	const shell = new Shell({
		el: '#shell',
		data: {
			version: '$(AppVersion)',
			menu: menu.Menu ? menu.Menu[0].Menu : null,
			newMenu: menu.NewMenu,
			settingsMenu: menu.SettingsMenu,
			companies: companies,
			initialPeriod: initialPeriod,
			title: menu.SysParams ? menu.SysParams.AppTitle : '',
			subtitle: menu.SysParams ? menu.SysParams.AppSubTitle : '',
			sideBarMode: menu.SysParams ? menu.SysParams.SideBarMode : '',
			pages: menu.SysParams ? (menu.SysParams.Pages + ',') : '',
			userState: menu.UserState,
			userIsAdmin: $(Admin),
			userIsTenantAdmin: $(TenantAdmin),
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