
(function () {

	let dm = require('std:datamodel');

	app.modules['server:validate'] = {
		validate
	};

	function validate(datamodel, template) {
		console.dir(datamodel);
	}

})();
