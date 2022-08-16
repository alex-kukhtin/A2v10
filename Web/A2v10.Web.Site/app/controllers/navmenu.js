// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

/*20220816-7880*/
/* controllers/navmenu.js */

(function () {

	const platform = require('std:platform');
	const urlTools = require('std:url');


	function isSeparatePage(pages, seg) {
		if (!seg || !pages) return false;
		return pages.indexOf(seg + ',') !== -1;
	}

	function findMenu(menu, func, parentMenu) {
		if (!menu)
			return null;
		for (let i = 0; i < menu.length; i++) {
			let itm = menu[i];
			if (func(itm))
				return itm;
			if (itm.Menu) {
				if (parentMenu)
					parentMenu.Url = itm.Url;
				let found = findMenu(itm.Menu, func);
				if (found) {
					platform.set(itm, '$expanded', true);
					return found;
				}
			}
		}
		return null;
	}

	function makeMenuUrl(menu, url, opts) {
		opts = opts || {};
		url = urlTools.combine(url).toLowerCase();
		let sUrl = url.split('/');
		if (sUrl.length >= 4)
			return url; // full qualified
		let routeLen = sUrl.length;
		let seg1 = sUrl[1];
		if (seg1 === 'app')
			return url; // app
		if (opts && isSeparatePage(opts.pages, seg1))
			return url; // separate page
		let am = null;
		if (seg1)
			am = menu.find((mi) => mi.Url === seg1);
		if (!am) {
			// no segments - find first active menu
			if (seg1)
				return url; // invalid segment -> invalid url
			let parentMenu = { Url: '' };
			am = findMenu(menu, (mi) => mi.Url && !mi.Menu, parentMenu);
			if (am) {
				opts.title = am.Name;
				return urlTools.combine(url, parentMenu.Url, am.Url);
			}
		} else if (am && !am.Menu) {
			opts.title = am.Name;
			return url; // no sub menu
		}
		url = urlTools.combine(seg1);
		let seg2 = sUrl[2];
		if (!seg2 && opts.seg2)
			seg2 = opts.seg2; // may be
		if (!seg2) {
			// find first active menu in am.Menu
			am = findMenu(am.Menu, (mi) => mi.Url && !mi.Menu);
		} else {
			// find current active menu in am.Menu
			am = findMenu(am.Menu, (mi) => mi.Url === seg2);
		}
		if (am) {
			opts.title = am.Name;
			return urlTools.combine(url, am.Url);
		}
		return url; //TODO: ????
	}



	app.components['std:navmenu'] = {
		findMenu,
		makeMenuUrl,
		isSeparatePage
	};
})();	