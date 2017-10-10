/*20171010-7043*/

(function () {

    const Shell = component('std:shellController');

	const menu = $(Menu);

    const shell = new Shell({
        el: '#shell',
        data: {
            version: '$(AppVersion)',
			menu: menu.Menu[0].Menu,
			title: menu.SysParams.AppTitle,
			subtitle: menu.SysParams.AppSubTitle
        }
    });

	window.$rootUrl = '';

})();