// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181005-7312*/

(function () {

	const Shell = component('std:shellController');
	const locale = window.$$locale;

	const menu = $(Menu);

	const shell = new Shell({
		el: '#shell',
		data: {
			title: menu.SysParams ? menu.SysParams.AppTitle : '',
			subtitle: locale.$Admin,
			version: '$(AppVersion)',
			menu: menu.Menu[0].Menu
		}
	});

	window.$$rootUrl = '/admin';
	window.$$debug = $(Debug);

})();