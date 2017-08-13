/*20170813-7005*/
/*app.js*/
(function () {

	window.app = {
        modules: {}
    };

    window.require = require;

	function require(module) {
		if (module in app.modules)
            return app.modules[module];
        throw new Error('module "' + module + '" not found');
    }
})();