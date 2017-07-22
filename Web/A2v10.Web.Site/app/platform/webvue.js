(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
    }


    app.modules['platform'] = {
        set: set
    }
})();
