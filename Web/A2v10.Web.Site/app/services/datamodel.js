(function() {

    /** TODO:
     * Element.construct event
     */
    const META = '_meta_';
    const PARENT = '_parent_';
    const SRC = '_src_';
    const PATH = '_path_';

    const platform = require('platform');

    function defHidden(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            writable: false,
            enumerable: false,
            configurable: false,
            value: value
        });
    }

    function defSource(trg, source, prop) {
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
                shadow[prop] = new propCtor(source[prop] || null, pathdot + prop);
                defHidden(shadow[prop], PARENT, trg);
                break;
        }
        Object.defineProperty(trg, prop, {
            enumerable: true,
            configurable: true, /*required for vue*/
            get() {
                return this._src_[prop];
            },
            set(val) {
                //TODO: handle changing event
                this._src_[prop] = val;
                if (!this._path_)
                    return;
                //TODO: fire datamodel event
                let eventName = this._path_ + '.' + prop + '.change';
                console.warn(eventName);
            }
        });
    }

    function createObject(elem, source, path) {
        defHidden(elem, SRC, {});
        defHidden(elem, PATH, path);
        for (let propName in elem._meta_) {
            defSource(elem, source, propName);
        }
        let ctorname = elem.constructor.name;
        let constructEvent = ctorname + '.construct';
        // TODO: fire datamodel event
        console.warn(constructEvent);
        return elem;
    }

    function createArray(source, path, ctor) {
        let arr = new _BaseArray(source.length);
        let dotPath = path + '[]'
        defHidden(arr, '_elem_', ctor);
        defHidden(arr, PATH, path);
        if (!source)
            return arr;
        for (let i = 0; i < source.length; i++) {
            arr[i] = new arr._elem_(source[i], dotPath);
            defHidden(arr[i], PARENT, arr);
            arr[i].$checked = false;
            // TODO: move to template!!
            Object.defineProperty(arr[i], "Sum", {
                enumerable: true,
                configurable: false,
                get() {
                    return this.Amount * 2.0;
                }

            });
        }
        return arr;
    }

    function _BaseArray(length) {
        return new Array(length || 0);
    }

    _BaseArray.prototype = Array.prototype;
    _BaseArray.prototype.$selected = null;

    _BaseArray.prototype.$append = function (src) {
        let newElem = new this._elem_(src || null, this._path_ + '[]');
        defHidden(newElem, PARENT, this);
        let len = this.push(newElem);
        console.warn(this._path_ + '[].add'); // EVENT
        let ne = this[len - 1]; // maybe newly created reactive element
        platform.set(this, "$selected", ne);
        return ne;
    };

    _BaseArray.prototype.$remove = function (item) {
        let index = this.indexOf(item);
        if (index == -1)
            return;
        this.splice(index, 1); // EVENT
        console.warn(this._path_ + '[].remove');
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

    app.modules['datamodel'] = {
        createObject: createObject,
        createArray: createArray,
        defineObject: defineObject
    }
})();