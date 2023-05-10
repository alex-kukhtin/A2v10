// Copyright © 2015-2018 Oleksandr Kukhtin. All rights reserved.

/*20180702-7237*/
/* services/tools.js */

app.modules['std:tools'] = function () {

	const eventBus = require('std:eventBus');

	return {
		alert
	};

	function alert(msg, title, list) {
		let dlgData = {
			promise: null, data: {
				message: msg, title: title, style: 'alert', list: list
			}
		};
		eventBus.$emit('confirm', dlgData);
		return dlgData.promise;
	}
};
