/*20170819-7016*/
/* dataservice.js */
(function () {

	let http = require('std:http');
	let utils = require('utils');

	function post(url, data) {
		return http.post(url, data);
	}

	app.modules['std:dataservice'] = {
		post: post
	};
})();



