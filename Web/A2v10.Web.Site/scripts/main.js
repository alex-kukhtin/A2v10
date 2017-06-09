(function () {
	window.app = {
		modules: {},
		require: require
	};

	function require(module) {
		if (module in app.modules)
			return app.modules[module];
	}

	alert(1);
}());