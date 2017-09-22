/*20170918-7034*/
/* services/url.js */

app.modules['std:url'] = function () {

	return {
		combine: combine,
		makeQueryString: makeQueryString,
        parseQueryString: parseQueryString,
        normalizeRoot: normalizeRoot,
        idChangedOnly: idChangedOnly
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

	function makeQueryString(obj) {
		if (!obj)
			return '';
		let esc = encodeURIComponent;
		// skip special (starts with '_')
		let query = Object.keys(obj)
			.filter(k => k.startsWith('_') ? null : obj[k])
			.map(k => esc(k) + '=' + esc(obj[k]))
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
        // TODO: TEST
        let ns = (newUrl || '').split('/');
        let os = (oldUrl || '').split('/');
        if (ns.length !== os.length)
            return false;
        if (os[os.length - 1] === 'new' && ns[ns.length - 1] !== 'new') {
            if (ns.slice(ns.length - 1).join('/') === os.slice(os.length -1).join('/'))
                return true;
        }
        return false;
    }
};





