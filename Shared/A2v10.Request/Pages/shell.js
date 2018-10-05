
/*20181005-7312*/

(function () {

	const Shell = component('std:shellController');

	const menu = $(Menu);

	const shell = new Shell({
		el: '#shell',
		data: {
			version: '$(AppVersion)',
			menu: menu.Menu ? menu.Menu[0].Menu : null,
			newMenu: menu.NewMenu,
			settingsMenu: menu.SettingsMenu,
			title: menu.SysParams ? menu.SysParams.AppTitle : '',
			subtitle: menu.SysParams ? menu.SysParams.AppSubTitle : '',
			sideBarMode: menu.SysParams ? menu.SysParams.SideBarMode : '',
			userIsAdmin: $(Admin),
			isDebug: $(Debug),
			appData: $(AppData)
		},
		computed: {
			appLinks() {
				return this.appData ? this.appData.links : null;
			},
			feedback() {
				return this.appData ? this.appData.feedback : null;
			},
			hasFeedback() {
				return this.appData && this.appData.feedback;
			},
			profileItems() {
				return this.appData ? this.appData.profileMenu : null;
			}
		},
		methods: {
			doProfileMenu(itm) {
				//console.dir(this);
				this.navigate(itm.url);
			}
		}
	});

	window.$$rootUrl = '';
	window.$$debug = $(Debug);
})();