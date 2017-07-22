(function () {
    function get(url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open();
    }

    function post(url, data, callback) {

    }

    app.modules['http'] = {
        get: get,
        post: post
    }
})();


