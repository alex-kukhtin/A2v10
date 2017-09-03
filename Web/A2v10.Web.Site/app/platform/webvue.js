/*20170903-7024*/
/* platform/webvue.js */

(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
	}

	function defer(func) {
		Vue.nextTick(func);
	}


    app.modules['platform'] = {
		set: set,
		defer: defer
    };

	app.modules['std:eventBus'] = new Vue({});

})();
