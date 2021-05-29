// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210529-7776
// app.js

"use strict";

(function () {

	window.app = {
		modules: {},
		components: {},
		templates: {},
		nextToken: nextToken
	};

	window.require = require;
	window.component = component;
	window.template = template;

	// amd typescript support
	window.define = define;

	let rootElem = document.querySelector('meta[name=rootUrl]');
	window.$$rootUrl = rootElem ? rootElem.content || '' : '';

	function require(module, noerror) {
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
	}

	function component(name, noerror) {
		if (name in app.components)
			return app.components[name];
		if (noerror)
			return {};
		throw new Error('component "' + name + '" not found');
	}

	function template(name, noerror) {
		if (name in app.templates)
			return app.templates[name];
		if (noerror)
			return {};
		throw new Error('template "' + name + '" not found');
	}

	let currentToken = 1603;

	function nextToken() {
		return '' + currentToken++;
	}

	function define(args, factory) {
		let exports = {
			default: undefined
		};
		factory(require, exports);
		return exports.default;
	}

})();