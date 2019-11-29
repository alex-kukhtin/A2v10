// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180428-7171
// /server/app.js
// Global scope!!!!

"use strict";


var app = {
	modules: {}
};

if (typeof window === 'undefined') {
	var window = {

	};
} else {
	window.$$locale = {
		$Locale: 'uk-UA'
	};
}

var require = function require(module, noerror) {
	if (module in app.modules) {
		let am = app.modules[module];
		if (typeof am === 'function') {
			am = am(); // always singleton
			app.modules[module] = am;
		}
		return am;
	}
	if (noerror)
		return null;
	throw new Error('module "' + module + '" not found');
};
