/*20171224-7080*/
/* services/url.js */

app.modules['std:url'] = function () {

    const utils = require('std:utils');

    return {
        combine: combine,
        makeQueryString,
        parseQueryString: parseQueryString,
        normalizeRoot: normalizeRoot,
        idChangedOnly: idChangedOnly,
        makeBaseUrl,
        parseUrlAndQuery,
        replaceUrlQuery,
        createUrlForNavigate
    };

    function normalize(elem) {
        // TODO: TEST
        elem = '' + elem || '';
        elem = elem.replace(/\\/g, '/');
        if (elem.startsWith('/'))
            elem = elem.substring(1);
        if (elem.endsWith('/'))
            elem = elem.substring(0, elem.length - 1);
        return elem;
    }

    function normalizeRoot(path) {
        let root = window.$$rootUrl;
        if (root && path.startsWith(root))
            return path.substring(root.length);
        return path;
    }

    function combine(...args) {
        return '/' + args.map(normalize).filter(x => !!x).join('/');
    }

    function toUrl(obj) {
        if (utils.isDate(obj)) {
            return utils.format(obj, "DateUrl");
        } else if (utils.isObjectExact(obj)) {
            return ('' + obj.$id) || '0'
        }
        return obj;
    }

    function makeQueryString(obj) {
        if (!obj)
            return '';
        let esc = encodeURIComponent;
        // skip special (starts with '_' or '$')
        let query = Object.keys(obj)
            .filter(k => k.startsWith('_') || k.startsWith('$') ? null : obj[k])
            .map(k => esc(k) + '=' + esc(toUrl(obj[k])))
            .join('&');
        return query ? '?' + query : '';
    }

    function parseQueryString(str) {
        //TODO: TEST
        var obj = {};
        str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    }

    function idChangedOnly(newUrl, oldUrl) {
        let ns = (newUrl || '').split('/');
        let os = (oldUrl || '').split('/');
        if (ns.length !== os.length)
            return false;
        if (os[os.length - 1] === 'new' && ns[ns.length - 1] !== 'new') {
            if (ns.slice(0, ns.length - 1).join('/') === os.slice(0, os.length - 1).join('/'))
                return true;
        }
        return false;
    }

    function makeBaseUrl(url) {
        let x = (url || '').split('/');
        if (x.length === 6)
            return x.slice(2, 4).join('/');
        return url;
    }

    function parseUrlAndQuery(url, query) {
        let rv = { url: url, query: query };
        if (url.indexOf('?') !== -1) {
            let a = url.split('?');
            rv.url = a[0];
            // from url then from query
            rv.query = Object.assign({}, parseQueryString(a[1]), query);
        }
        return rv;
    }
    function replaceUrlQuery(url, query) {
        if (!url)
            url = window.location.pathname + window.location.search;
        let pu = parseUrlAndQuery(url, query)
        return pu.url + makeQueryString(pu.query);
    }

    function createUrlForNavigate(url, data) {
        let urlId = data || 'new';
        let qs = '';
        if (utils.isDefined(urlId.$id))
            urlId = urlId.$id;
        else if (utils.isObjectExact(urlId)) {
            urlId = data.Id;
            delete data['Id'];
            qs = makeQueryString(data);
        }
        return combine(url, urlId) + qs;
    }

    function replaceId(url, newId) {
        alert('todo::replaceId')
    }
};





