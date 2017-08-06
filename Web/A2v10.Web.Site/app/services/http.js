(function () {


    function doRequest(method, url, data) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (response) {
                if (xhr.readyState !== 4)
                    return;
                if (xhr.status === 200)
                    resolve(xhr.responseText);
                else
                    reject(xhr.error);
            };
            xhr.open(method, url, data);
            xhr.send();
        }
    }

    function get(url, data) {
        return doRequest('GET', url, data);
    }

    function post(url, data) {
        return doRequest('POST', url, data);
    }

    function load(url, data, selector) {
        doRequest('GET', url, data)
            .then(function (html) {

            })
            .catch(function (error) {
            });
    }

    app.modules['http'] = {
        get: get,
        post: post,
        load: load
    }
})();


