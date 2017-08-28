/*20170818-7015*/
/* platform/webvue.js */

(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
    }


    app.modules['platform'] = {
        set: set
    };

	app.modules['std:eventBus'] = new Vue({});

})();
