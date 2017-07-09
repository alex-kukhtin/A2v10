(function() {

    const META = '_meta_';
    const PARENT = '_parent_';

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
            get: function () {
                return this._src_[prop];
            },
            set: function (val) {
                this._src_[prop] = val;
                //TODO: fire datamodel event
                console.warn(this._path_ + '.' + prop + '.change');
            }
        });
    }

    function createObject(elem, source, path) {
        defHidden(elem, '_src_', {});
        defHidden(elem, '_path_', path);
        for (var propName in elem._meta_) {
            defSource(elem, source, propName);
        }
    }

    function createArray(source, path, ctor) {
        var arr = new _BaseArray(source.length);
        defHidden(arr, '_elem_', ctor);
        defHidden(arr, '_path_', path);
        var dotPath = path + '[]'
        if (!source)
            return arr;
        for (var i = 0; i < source.length; i++) {
            arr[i] = new arr._elem_(source[i], dotPath);
            defHidden(arr[i], PARENT, arr);
        }
        return arr;
    }

    function _BaseArray(length) {
        return new Array(length || 0);
    }

    _BaseArray.prototype = Array.prototype;


    app.modules['datamodel'] = {
        defHidden: defHidden,
        createObject: createObject
    }
})();