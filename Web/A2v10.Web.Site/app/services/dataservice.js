// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180110-7094
// dataservice.js
(function () {

	let http = require('std:http');
	let utils = require('std:utils');

	function post(url, data) {
		return http.post(url, data);
    }

    function get(url) {
        return http.get(url);
    }

	app.modules['std:dataservice'] = {
        post: post,
        get: get
	};
})();



