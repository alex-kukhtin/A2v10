/*20170813-7001*/
/* platform/webvue.js */
(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
    }


    app.modules['platform'] = {
        set: set
    }

    app.modules['eventBus'] = new Vue();
})();
