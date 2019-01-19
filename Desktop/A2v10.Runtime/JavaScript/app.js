// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// global variables!

var designer = (function () {

	function createElement(name, ...args) {
		if (name in this.elements) {
			return new this.elements[name](...args);
		}
		console.log(`__createElement. Element '${name}' not found`);
		return null;
	}

	function registerElement(ctor) {
		var name = ctor.prototype.type;
		//console.log('register: ' + name);
		this.elements[name] = ctor;
	}

	let designer = {
		form: {
			elements: {},
			__createElement: createElement,
			__registerElement: registerElement
		},
		solution: {
			_root_: null,
			elements: {},
			__createElement: createElement,
			__registerElement: registerElement,
			__loadSolution: null,
			__createSolution: null
		}
	};
	Object.freeze(designer);
	return designer;
})();


var app = (function () {
	let app = {

	};
	Object.freeze(app);
	return app;
})();

