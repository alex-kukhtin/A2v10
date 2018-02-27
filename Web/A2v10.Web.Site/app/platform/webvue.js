// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
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
		defer: defer
	};

	app.modules['std:eventBus'] = new Vue({});

})();
