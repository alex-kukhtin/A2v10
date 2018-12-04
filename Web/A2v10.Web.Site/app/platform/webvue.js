// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181204-7382*/
/* platform/webvue.js */

(function () {

	function set(target, prop, value) {
		Vue.set(target, prop, value);
	}

	function defer(func) {
		Vue.nextTick(func);
	}


	app.modules['std:platform'] = {
		set: set,
		defer: defer,
		File: File, /*file ctor*/
		performance: performance
	};

	app.modules['std:eventBus'] = new Vue({});

})();
