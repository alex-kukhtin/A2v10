/*
global elements for context
*/

(function () {
    // this = global context

    let g = this;
    const modules = {};

    g.require = function (module) {
        if (!(module in modules))
            modules[module] = __require(module, g.__context._dir_);
        return modules[module];
    };

    g.__context = {
        _file_: null,
        _dir_: null
    };
})();
