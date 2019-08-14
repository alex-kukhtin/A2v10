// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20180814-7522*/

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');

	window.__tests__ = {
		$navigate: navigate,
		$isReady: function () {
			console.dir('from isReady:' + window.__requestsCount__);
			return document.readyState === 'complete' &&
				window.__requestsCount__ + window.__loadsCount__ === 0;
		},
		$invoke: function (args) {
			eventBus.$emit('invokeTest', args);
			return args.result;
		}
	};


	function navigate(url) {
		store.commit('navigate', { url: url });
	}
})();