/* platform mock */

(function () {

    function set(target, prop, value) {
        target[prop] = value;
    }


    app.modules['platform'] = {
        set: set
    }
})();