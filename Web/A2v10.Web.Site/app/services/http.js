(function () {
    function get(url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open();
    }

    function post(url, data, callback) {

    }

    app.modules['datamodel'] = {
        get: get,
        post: post
    }
})();


