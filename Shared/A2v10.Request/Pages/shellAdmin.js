// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180810-7269*/

(function () {

	const Shell = component('std:shellController');

	const menu = $(Menu);

	const shell = new Shell({
		el: '#shell',
		data: {
			title: menu.SysParams.AppTitle,
			subtitle: 'администратор',
			version: '$(AppVersion)',
			menu: menu.Menu[0].Menu
		}
	});

	window.$$rootUrl = '/admin';
	window.$$debug = $(Debug);

})();