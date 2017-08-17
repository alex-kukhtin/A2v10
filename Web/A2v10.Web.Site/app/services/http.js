/*20170814-7012*/
/* http.js */
(function () {

    let store = require('store');

    function doRequest(method, url, data) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            
            xhr.onload = function (response) {
                store.$emit('endRequest', url);
                if (xhr.status === 200)
                    resolve(xhr.responseText);
                else
                    reject(xhr.statusText);
            };
            xhr.onerror = function (response) {
                store.$emit('endRequest', url);
                reject(xhr.statusText);
            };
            xhr.open(method, url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Accept', 'application/json, text/html');
            store.$emit('beginRequest', url);
            xhr.send(data);
        });
    }

    function get(url) {
        return doRequest('GET', url);
    }

    function post(url, data) {
        return doRequest('POST', url, data);
    }

    function load(url, selector) {
        doRequest('GET', url)
            .then(function (html) {
                if (selector.firstChild && selector.firstChild.__vue__)
                    selector.firstChild.__vue__.$destroy();
                let dp = new DOMParser();
                let rdoc = dp.parseFromString(html, 'text/html');
                // first element from fragment body
                let srcElem = rdoc.body.firstElementChild;
                selector.innerHTML = srcElem ? srcElem.outerHTML : '';
                for (let i = 0; i < rdoc.scripts.length; i++) {
                    let s = rdoc.scripts[i];
                    if (s.type === 'text/javascript') {
                        let newScript = document.createElement("script");
                        newScript.text = s.text;
                        document.body.appendChild(newScript).parentNode.removeChild(newScript);
                    }
                }
            })
            .catch(function (error) {
                alert(error);
            });
    }

    app.modules['http'] = {
        get: get,
        post: post,
        load: load
    };
})();


