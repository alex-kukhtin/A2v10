
// global variables!

function createElement(name, ...args) {
    if (name in this.elements) {
        return new this.elements[name](...args);
    }
    console.error(`__createElement. Element '${name}' not found`);
    return null;
}

var designer = {
    form: {
        elements: {},
        __createElement: createElement,
		__registerElement(ctor) {
			var name = ctor.prototype.type;
			this.elements[name] = ctor;
		},
    },
    solution: {
        elements: {},
        __createElement: createElement
    }
};


var app = {
};

Object.freeze(designer);
Object.freeze(app);
