"use strict";

// global!

var designer = {
	form: {
		__createElement: function () {
			console.log('create element here');
			return null;
		},
		__registerElement: function (ctor) {
			var name = ctor.prototype.type;
			this.elements[name] = ctor;
		},
		elements: {

		}
	}
};


var app = {
};

Object.freeze(designer);
Object.freeze(app);
