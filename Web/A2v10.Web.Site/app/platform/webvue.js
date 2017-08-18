/*20170818-7015*/
/* platform/webvue.js */
(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
    }

    const store = new Vue({
    });


    app.modules['platform'] = {
        set: set
    };

    app.modules['store'] = store;

})();
