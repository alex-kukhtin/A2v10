
// global variables!

var designer = (function () {

    function createElement(name, ...args) {
        if (name in this.elements) {
            return new this.elements[name](...args);
        }
        console.log(`__createElement. Element '${name}' not found`);
        return null;
    }

    let designer = {
        form: {
            elements: {},
            __createElement: createElement,
            __registerElement(ctor) {
                var name = ctor.prototype.type;
                //console.log('register: ' + name);
                this.elements[name] = ctor;
            }
        },
        solution: {
            _root_: null,
            elements: {},
            __createElement: createElement,
            __loadSolution: null
        }
    };
    Object.freeze(designer);
    return designer;
})();


var app = (function ()
{
    let app = {

    };
    Object.freeze(app);
    return app;
})();

