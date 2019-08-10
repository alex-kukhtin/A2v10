(function () {

	const store = component('std:store');

	window.__tests__ = {
		$navigate: navigate
	};

	function navigate(url) {
		store.commit('navigate', { url: url });
	}
})();