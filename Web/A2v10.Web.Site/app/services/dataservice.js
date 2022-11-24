// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

// 20221124-7907
// dataservice.js
(function () {

	let http = require('std:http');

	function post(url, data, raw, hideIndicator) {
		return http.post(url, data, raw, hideIndicator);
	}

	function get(url) {
		return http.get(url);
	}

	app.modules['std:dataservice'] = {
		post: post,
		get: get
	};
})();



