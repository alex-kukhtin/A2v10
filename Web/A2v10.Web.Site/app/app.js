/*20170814-7013*/
/*app.js*/
(function () {

	window.app = {
        modules: {},
        components: {}
    };

    window.require = require;
    window.component = component;

	function require(module) {
		if (module in app.modules)
            return app.modules[module];
        throw new Error('module "' + module + '" not found');
    }

    function component(name) {
        if (name in app.components)
            return app.components[name];
        throw new Error('component "' + name + '" not found');
    }
})();