// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200718-7690*/
/* platform/webvue.js */

(function () {

	function set(target, prop, value) {
		Vue.set(target, prop, value);
	}

	function defer(func) {
		Vue.nextTick(func);
	}

	function print() {
		window.print();
	}


	app.modules['std:platform'] = {
		set: set,
		defer: defer,
		print: print,
		File: File, /*file ctor*/
		performance: performance
	};

	app.modules['std:eventBus'] = new Vue({});

})();
