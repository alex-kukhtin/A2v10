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

}());
(function() {

    /* TODO:
    1. changing event
    2. validators
    */
    const META = '_meta_';
    const PARENT = '_parent_';
    const SRC = '_src_';
    const PATH = '_path_';
    const ROOT = '_root_';

    const platform = require('platform');
    const utils = require('utils');

    function defHidden(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            writable: false,
            enumerable: false,
            configurable: false,
            value: value
        });
    }

    function defSource(trg, source, prop, parent) {
        let propCtor = trg._meta_[prop];
        let pathdot = trg._path_ ? trg._path_ + '.' : '';
        let shadow = trg._src_;
        source = source || {};
        switch (propCtor) {
            case Number:
                shadow[prop] = source[prop] || 0;
                break;
            case String:
                shadow[prop] = source[prop] || "";
                break;
            case Boolean:
                shadow[prop] = source[prop] || false;
                break;
            case Date:
                shadow[prop] = source[prop] || null;
                break;
            default:
                shadow[prop] = new propCtor(source[prop] || null, pathdot + prop, parent);
                break;
        }
        Object.defineProperty(trg, prop, {
            enumerable: true,
            configurable: true, /* needed */
            get() {
                return this._src_[prop];
            },
            set(val) {
                //TODO: handle changing event
                this._src_[prop] = val;
                if (!this._path_)
                    return;
                let eventName = this._path_ + '.' + prop + '.change';
                this._root_.$emit(eventName, this, val);
            }
        });
    }

    function createObjProperties(elem, ctor) {
        let templ = elem._root_.$template;
        if (!templ) return;
        let props = templ._props_;
        if (!props) return;
        let objname = ctor.name;
        if (objname in props) {
            for (let p in props[objname]) {
                Object.defineProperty(elem, p, {
                    configurable: false,
                    enumerable: true,
                    get: props[objname][p]
                });
            }
        }
    }

    function createObject(elem, source, path, parent) {
        parent = parent || elem;
        defHidden(elem, SRC, {});
        defHidden(elem, PATH, path);
        defHidden(elem, ROOT, parent._root_ || parent);
        defHidden(elem, PARENT, parent);
        for (let propName in elem._meta_) {
            defSource(elem, source, propName, parent);
        }
        createObjProperties(elem, elem.constructor);
        let ctorname = elem.constructor.name;
        let constructEvent = ctorname + '.construct';
        elem._root_.$emit(constructEvent, elem);
        return elem;
    }

    function createArray(source, path, ctor, arrctor, parent) {
        let arr = new _BaseArray(source.length);
        let dotPath = path + '[]'
        defHidden(arr, '_elem_', ctor);
        defHidden(arr, PATH, path);
        defHidden(arr, PARENT, parent);
        defHidden(arr, ROOT, parent._root_ || parent);

        createObjProperties(arr, arrctor);
        let constructEvent = arrctor.name + '.construct';
        arr._root_.$emit(constructEvent, arr);

        if (!source)
            return arr;
        for (let i = 0; i < source.length; i++) {
            arr[i] = new arr._elem_(source[i], dotPath, arr);
            arr[i].$checked = false;
        }
        return arr;
    }

    function _BaseArray(length) {
        return new Array(length || 0);
    }

    _BaseArray.prototype = Array.prototype;
    _BaseArray.prototype.$selected = null;

    _BaseArray.prototype.$append = function (src) {
        let newElem = new this._elem_(src || null, this._path_ + '[]', this);
        newElem.$checked = false;
        let len = this.push(newElem);
        let ne = this[len - 1]; // maybe newly created reactive element
        let eventName = this._path_ + '[].add';
        this._root_.$emit(eventName, this /*array*/, ne /*elem*/, len - 1 /*index*/);
        platform.set(this, "$selected", ne);
        return ne;
    };

    _BaseArray.prototype.$remove = function (item) {
        let index = this.indexOf(item);
        if (index === -1)
            return;
        this.splice(index, 1); // EVENT
        let eventName = this._path_ + '[].remove';
        this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);
        if (index >= this.length)
            index -= 1;
        if (this.length > index)
            platform.set(this, '$selected', this[index]);
    };

    function defineObject(obj, meta, arrayItem) {
        defHidden(obj.prototype, META, meta);
        if (arrayItem) {
            defArrayItem(obj);
        }
    }

    function defArrayItem(elem) {
        elem.prototype.$remove = function () {
            let arr = this._parent_;
            arr.$remove(this);
        };
        elem.prototype.$select = function () {
            let arr = this._parent_;
            platform.set(arr, "$selected", this);
        };
    }

    function emit(event, ...arr) {
        console.info('emit: ' + event);
        let templ = this.$template;
        if (!templ) return;
        let events = templ.events;
        if (!events) return;
        if (event in events) {
            // fire event
            console.info('handle: ' + event);
            let func = events[event];
            func(...arr);
        }
    }

    function executeCommand(cmd, ...args) {
        let tml = this.$template;
        if (tml && tml.commands) {
            let cmdf = tml.commands[cmd];
            if (typeof cmdf === 'function') {
                cmdf.apply(this, args);
                return;
            }
        }
        console.error(`command "${cmd}" not found`);
    }

    function validateItem(vals, item) {
        if (item.Amount < 500)
            return null;
        return [
            { msg: 'Введите значение', severity: 'error' },
            { msg: 'Введите еще одно значение', severity: 'error' }
        ];
    }

    function validate(item, path) {
        if (!item) return null;
        let tml = item._root_.$template;
        if (!tml) return null;
        var vals = tml.validators;
        if (!vals) return null;
        var elemvals = vals[path];
        if (!elemvals) return null;
        return validateItem(elemvals, item);
    }

    function implementRoot(root, template) {
        root.prototype.$emit = emit;
        root.prototype.$template = template;
        root.prototype._exec_ = executeCommand;
        root.prototype._validate_ = validate;
        // props cache
        let xProp = {};
        for (let p in template.properties) {
            let px = p.split('.'); // Type.Prop
            if (!(px[0] in xProp))
                xProp[px[0]] = {};
            let cx = xProp[px[0]];
            cx[px[1]] = template.properties[p];
        }
        template._props_ = xProp;
    }

    app.modules['datamodel'] = {
        createObject: createObject,
        createArray: createArray,
        defineObject: defineObject,
        implementRoot: implementRoot
    };
})();
(function () {
    function get(url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open();
    }

    function post(url, data, callback) {

    }

    app.modules['http'] = {
        get: get,
        post: post
    }
})();



(function() {

    function isFunction(value) { return typeof value === 'function'; }
    function isDefined(value) { return typeof value !== 'undefined'; }
    function isObject(value) { return value !== null && typeof value === 'object'; }
    function isDate(value) { return toString.call(value) === '[object Date]'; }
    function isString(value) { return typeof value === 'string'; }
    function isNumber(value) { return typeof value === 'number'; }

    app.modules['utils'] = {
        isArray: Array.isArray,
        isFunction: isFunction,
        isDefined: isDefined,
        isObject: isObject,
        isDate: isDate,
        isString: isString,
        isNumber : isNumber
    }
})();