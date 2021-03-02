// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210302-7752
// dataservice.js
(function () {

	let http = require('std:http');

	function post(url, data, raw) {
		return http.post(url, data, raw);
	}

	function get(url) {
		return http.get(url);
	}

	app.modules['std:dataservice'] = {
		post: post,
		get: get
	};
})();



