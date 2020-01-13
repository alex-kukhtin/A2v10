
/*20200113-7612*/

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
			feedback() {
				return this.appData ? this.appData.feedback : null;
			},
			hasFeedback() {
				return this.appData && this.appData.feedback;
			},
			profileItems() {
				return this.appData ? this.appData.profileMenu : null;
			},
			notifyText() {
				return this.getNotify(2);
			},
			notifyClass() {
				return this.getNotify(1).toLowerCase();
			}

		},
		methods: {
			doProfileMenu(itm) {
				this.navigate(itm.url);
			},
			getNotify(ix) {
				let n = this.userState ? this.userState.Notify : null;
				if (!n) return '';
				let m = n.match(/\((.*)\)(.*)/);
				if (m && m.length > ix)
					return m[ix];
				return '';
			}
		}
	});

	window.$$rootUrl = '';
	window.$$debug = $(Debug);

})();