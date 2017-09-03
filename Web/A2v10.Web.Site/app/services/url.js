/*20170903-7024*/
/* services/url.js */

app.modules['std:url'] = function () {

	return {
		combine: combine,
		makeQueryString: makeQueryString,
		parseQueryString: parseQueryString
	};

	function normalize(elem) {
		elem = '' + elem || '';
		elem = elem.replace(/\\/g, '/');
		if (elem.startsWith('/'))
			elem = elem.substring(1);
		if (elem.endsWith('/'))
			elem = elem.substring(0, elem.length - 1);
		return elem;
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
		var obj = {};
		str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
			obj[decodeURIComponent(key)] = decodeURIComponent(value);
		});
		return obj;
	}

};





