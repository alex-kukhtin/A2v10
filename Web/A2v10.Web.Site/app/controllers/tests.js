// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20180813-7521*/

(function () {

	const store = component('std:store');

	window.__tests__ = {
		$navigate: navigate,
		$isReady: function () {
			console.dir('from isReady:' + window.__requestsCount__);
			return document.readyState === 'complete' &&
				window.__requestsCount__ + window.__loadsCount__ === 0;
		}
	};


	function navigate(url) {
		store.commit('navigate', { url: url });
	}
})();