// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180125-7098
// app.js

"use script";

(function () {

	window.app = {
        modules: {},
        components: {}
    };

    window.require = require;
    window.component = component;

    let rootElem = document.querySelector('meta[name=rootUrl]');
    window.$$rootUrl = rootElem ? rootElem.content || '' : '';

	function require(module) {
		if (module in app.modules) {
			let am = app.modules[module];
			if (typeof am === 'function') {
				am = am(); // always singleton
				app.modules[module] = am;
			}
			return am;
		}
        throw new Error('module "' + module + '" not found');
    }

    function component(name) {
        if (name in app.components)
            return app.components[name];
        throw new Error('component "' + name + '" not found');
    }
})();