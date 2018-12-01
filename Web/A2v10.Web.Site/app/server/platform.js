// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* server/platform.js */

(function () {

	function set(target, prop, value) {
		target[prop] = value;
	}

	function defer(func) {
		func();
	}


	app.modules['std:platform'] = {
		set: set,
		defer: defer,
		File: function () {
			return this;
		},
		performance: {
			now: function () {
				return 0;
			}
		}
	};

	app.modules['std:eventBus'] = {
	};
})();
