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
/*20170818-7015*/
/* platform/webvue.js */
(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
    }

    const store = new Vue({
    });


    app.modules['platform'] = {
        set: set
    };

    app.modules['store'] = store;

})();

/*20170824-7019*/
/* platform/route.js */
(function () {

    const SEARCH_PREFIX = "search:";
    const MENU_PREFIX = "menu:";
    const ENABLE_SAVE_SEARCH = true;

    function parseQueryString(str) {
        var obj = {};
        str.replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    }

    function makeQueryString(obj) {
        if (!obj)
            return '';
        let esc = encodeURIComponent;
        let query = Object.keys(obj)
            .filter(k => obj[k])
            .map(k => esc(k) + '=' + esc(obj[k]))
            .join('&');
        return query ? '?' + query : '';
    }

    function saveSearchToStorage() {
        if (!ENABLE_SAVE_SEARCH)
            return;
        let stg = window.localStorage;
        if (!stg)
            return;
        let loc = window.location;
        let key = SEARCH_PREFIX + loc.pathname;
        loc.search ? stg.setItem(key, loc.search) : stg.removeItem(key);
        //console.info(`store key='${key}', value='${loc.search}'`);
    }

    function getSearchFromStorage(url) {
        if (!ENABLE_SAVE_SEARCH)
            return '';
        let stg = window.localStorage;
        if (!stg)
            return '';
        let key = SEARCH_PREFIX + url;
        let res = stg.getItem(key) || '';
        //console.info(`get key='${key}', value='${res}'`);
        return res;
    }

    function Location() {
        this.path = window.location.pathname;
        this.wl = this.path.split('/');
        this.search = window.location.search.substring(1);
    }

    // static
    Location.current = function () {
        return new Location();
    };

    Location.getSavedMenu = function (segment) {
        let stg = window.localStorage;
        if (!stg)
            return '';
        let key = MENU_PREFIX + segment;
        let res = stg.getItem(key) || '';
        return res;
    };

    Location.prototype.routeLength = function () {
        return this.wl.length;
    };

    Location.prototype.segment = function (no) {
        let wl = this.wl;
        return wl.length > no ? wl[no].toLowerCase() : '';
    };
    Location.prototype.fullPath = function () {
        return this.path + (this.search ? '?' + this.search : '');
    };

    Location.prototype.saveMenuUrl = function () {
        let stg = window.localStorage;
        if (!stg)
            return;
        let s1 = this.segment(1);
        let s2 = this.segment(2);
        let search = this.search;
        if (s1) {
            let keym = MENU_PREFIX + s1;
            s2 ? stg.setItem(keym, s2) : stg.removeItem(keym);
        }
        return this;
    };

    const route = new Vue({
        data: {
            search: {}
        },
        computed: {
            query: {
                get() {
                    let wls = window.location.search.substring(1); // skip '?'
                    let qs = parseQueryString(wls);
                    Vue.set(this, 'search', qs);
                    //console.warn('get route.query:' + wls);
                    return this.search;
                },
                set(value) {
                    Vue.set(this, 'search', value);
                    let newUrl = window.location.pathname;
                    newUrl += makeQueryString(this.search);
                    // replace, do not push!
                    window.history.replaceState(null, null, newUrl);
                    saveSearchToStorage();
                    //console.warn('set route.query:' + makeQueryString(this.search));
                }
            }
        },
        methods: {
            location() {
                return Location.current();
            },

            replaceUrlSearch(url) {
                // replace search part url to current
                let search = window.location.search;
                let parts = url.split('?');
                if (parts.length !== 2)
                    return url;
                return parts[0] + search;
            },

            queryFromUrl(url) {
                if (!url)
                    return {};
                let parts = url.split('?');
                if (parts.length === 2)
                    return parseQueryString(parts[1]);
                return {};
            },

            replaceUrlQuery(url, qry) {
                if (!url)
                    return;
                let parts = url.split('?');
                if (parts.length > 0)
                    return parts[0] + makeQueryString(qry);
                return url;
            },

            savedMenu: Location.getSavedMenu,

            navigateMenu(url, query, title) {
                //console.warn('navigate menu:' + url);
                let srch = getSearchFromStorage(url);
                if (!srch)
                    url += query ? '?' + query : '';
                else
                    url += srch;
                if (query)
                    Vue.set(this, 'search', parseQueryString(query));
                console.info('navigate to:' + url);
                this.setTitle(title);
                window.history.pushState(null, null, url);
                let loc = this.location();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },

            navigateCurrent() {
                let loc = this.location();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },

            navigate(url, title) {
                let loc = this.location();
                console.info('navigate to:' + url);
                let oldUrl = loc.fullPath();
                // push/pop state feature. Replace the current state and push new one.
                this.setTitle(title);
                window.history.replaceState(oldUrl, null, oldUrl);
                window.history.pushState(oldUrl, null, url);
                loc = this.location(); // get new instance
                this.$emit('route', loc);
            },
            setTitle(title) {
                if (title)
                    document.title = title;
            },
            setState(url, title) {
                this.setTitle(title);
                window.history.replaceState(null, null, url);
            },
            updateSearch() {
                //return;
                let wls = window.location.search.substring(1); // skip '?'
                let qs = parseQueryString(wls);
                //console.warn('update search:' + wls);
                Vue.set(this, 'search', qs);
                saveSearchToStorage();
            },
            close() {
                window.history.back();
            }
        }
    });


    app.modules['route'] = route;
})();

/*20170824-7019*/
/* utils.js */
(function () {

    function isFunction(value) { return typeof value === 'function'; }
    function isDefined(value) { return typeof value !== 'undefined'; }
    function isObject(value) { return value !== null && typeof value === 'object'; }
    function isDate(value) { return toString.call(value) === '[object Date]'; }
    function isString(value) { return typeof value === 'string'; }
    function isNumber(value) { return typeof value === 'number'; }

    function isPrimitiveCtor(ctor) {
        return ctor === String || ctor === Number || ctor === Boolean;
    }
    function isEmptyObject(obj) {
        return !obj || Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    function notBlank(val) {
        if (!val)
            return false;
        switch (typeof val) {
            case 'string':
                return val !== '';
        }
        return (val || '') !== '';
    }

    function toJson(data) {
        return JSON.stringify(data, function (key, value) {
            return key[0] === '$' || key[0] === '_' ? undefined : value;
        }, 2);
    }

    function toString(obj) {
        if (!isDefined(obj))
            return '';
        else if (obj === null)
            return '';
        else if (isObject(obj))
            return toJson(obj);
        return obj + '';
    }

    app.modules['utils'] = {
        isArray: Array.isArray,
        isFunction: isFunction,
        isDefined: isDefined,
        isObject: isObject,
        isDate: isDate,
        isString: isString,
        isNumber: isNumber,
        toString: toString,
        notBlank: notBlank,
        toJson: toJson,
        isPrimitiveCtor: isPrimitiveCtor,
        isEmptyObject: isEmptyObject
    };
})();

(function() {

    app.modules['log'] = {

    };

})();
/*20170819-7016*/
/* http.js */
(function () {

    let store = require('store');

    function doRequest(method, url, data) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            
            xhr.onload = function (response) {
                store.$emit('endRequest', url);
                if (xhr.status === 200) {
                    let ct = xhr.getResponseHeader('content-type');
                    let xhrResult = xhr.responseText;
                    if (ct.indexOf('application/json') !== -1)
                        xhrResult = JSON.parse(xhr.responseText);
                    resolve(xhrResult);
                }
                else if (xhr.status === 255) {
                    reject(xhr.responseText || xhr.statusText);
                }
                else
                    reject(xhr.statusText);
            };
            xhr.onerror = function (response) {
                store.$emit('endRequest', url);
                reject(xhr.statusText);
            };
            xhr.open(method, url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Accept', 'application/json, text/html');
            store.$emit('beginRequest', url);
            xhr.send(data);
        });
    }

    function get(url) {
        return doRequest('GET', url);
    }

    function post(url, data) {
        return doRequest('POST', url, data);
    }

    function load(url, selector) {
        return new Promise(function (resolve, reject) {
            doRequest('GET', url)
                .then(function (html) {
                    if (selector.firstChild && selector.firstChild.__vue__)
                        selector.firstChild.__vue__.$destroy();
                    let dp = new DOMParser();
                    let rdoc = dp.parseFromString(html, 'text/html');
                    // first element from fragment body
                    let srcElem = rdoc.body.firstElementChild;
                    selector.innerHTML = srcElem ? srcElem.outerHTML : '';
                    for (let i = 0; i < rdoc.scripts.length; i++) {
                        let s = rdoc.scripts[i];
                        if (s.type === 'text/javascript') {
                            let newScript = document.createElement("script");
                            newScript.text = s.text;
                            document.body.appendChild(newScript).parentNode.removeChild(newScript);
                        }
                    }
                    if (selector.firstChild && selector.firstChild.__vue__) {
                        let ve = selector.firstChild.__vue__;
                        ve.$data.__baseUrl__ = url;
                    }
                    resolve(true);
                })
                .catch(function (error) {
                    alert(error);
                    resolve(false);
                });
        });
    }

    app.modules['http'] = {
        get: get,
        post: post,
        load: load
    };
})();



/*20170824-7019*/
/*validators.js*/
(function () {

    const utils = require('utils');

    const ERROR = 'error';

    function validateStd(rule, val) {
        switch (rule) {
            case 'notBlank':
                return utils.notBlank(val);
        }
        console.error(`invalid std rule: '${rule}'`);
        return true;
    }

    function validateImpl(rules, item, val) {
        let retval = [];
        rules.forEach(function (rule) {
            if (utils.isString(rule)) {
                if (!validateStd('notBlank', val))
                    retval.push({ msg: rule, severity: ERROR });
            } else if (utils.isString(rule.valid)) {
                if (!validateStd(rule.valid, val))
                    retval.push({ msg: rule.msg, severity: rule.severity || ERROR });
            } else if (utils.isFunction(rule.valid)) {
                let vr = rule.valid(item, val);
                if (utils.isString(vr))
                    retval.push({ msg: vr, severity: rule.severity || ERROR });
                else if (!vr)
                    retval.push({ msg: rule.msg, severity: rule.severity || ERROR });
            } else {
                console.error('invalid valid element type for rule');
            }
        });
        return retval;
    }

    function validateItem(rules, item, val) {
        // console.warn(item);
        let arr = [];
        if (utils.isArray(rules))
            arr = rules;
        else if (utils.isObject(rules))
            arr.push(rules);
        else if (utils.isString(rules))
            arr.push({ valid: 'notBlank', msg: rules });
        let err = validateImpl(arr, item, val);
        if (!err.length)
            return null;
        return err;
    }


    app.modules['validators'] = {
        validate: validateItem
    };
})();


/*20170824-7019*/
/* services/datamodel.js */
(function() {

    /* TODO:
    1. changing event
    4. add plain properties
    */
    const META = '_meta_';
    const PARENT = '_parent_';
    const SRC = '_src_';
    const PATH = '_path_';
    const ROOT = '_root_';
    const ERRORS = '_errors_'

    const platform = require('platform');
    const validators = require('validators');
    const utils = require('utils');

    function defHidden(obj, prop, value, writable) {
        Object.defineProperty(obj, prop, {
            writable: writable || false,
            enumerable: false,
            configurable: false,
            value: value
        });
    }

    function defHiddenGet(obj, prop, get) {
        Object.defineProperty(obj, prop, {
            enumerable: false,
            configurable: false,
            get: get
        });
    }

    function defPropertyGet(trg, prop, get) {
        Object.defineProperty(trg, prop, {
            enumerable: true,
            configurable: true, /* needed */
            get: get
        });
    }

    function ensureType(type, val) {
        if (type === Number)
            return isFinite(val) ? + val : 0;
        return val;
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
                //TODO: emit and handle changing event
                val = ensureType(this._meta_[prop], val);
                if (val === this._src_[prop])
                    return;
                this._src_[prop] = val;
                this._root_.$setDirty(true);
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
        defHidden(elem, ERRORS, null, true);
        for (let propName in elem._meta_) {
            defSource(elem, source, propName, parent);
        }
        createObjProperties(elem, elem.constructor);

        defPropertyGet(elem, "$valid", function () {
            if (this._root_._needValidate_)
                this._root_._validateAll_();
            return !this._errors_;
        });
        defPropertyGet(elem, "$invalid", function () {
            return !this.$valid;
        });

        let ctorname = elem.constructor.name;
        let constructEvent = ctorname + '.construct';
        elem._root_.$emit(constructEvent, elem);
        if (elem._root_ === elem) {
            // root element
            elem._root_ctor_ = elem.constructor;
            elem.$dirty = false;
            elem._query_ = {};
            // rowcount implementation
            for (var m in elem._meta_) {
                let rcp = m + '.$RowCount';
                if (source && rcp in source) {
                    let rcv = source[rcp];
                    elem[m].$RowCount = rcv;
                }
            }
        }
        return elem;
    }

    function createArray(source, path, ctor, arrctor, parent) {
        let arr = new _BaseArray(source ? source.length : 0);
        let dotPath = path + '[]';
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

    _BaseArray.prototype.$new = function (src) {
        let newElem = new this._elem_(src || null, this._path_ + '[]', this);
        newElem.$checked = false;
        return newElem;
    };

    _BaseArray.prototype.$append = function (src) {
        let newElem = this.$new(src);
        let len = this.push(newElem);
        let ne = this[len - 1]; // maybe newly created reactive element
        let eventName = this._path_ + '[].add';
        this._root_.$setDirty(true);
        this._root_.$emit(eventName, this /*array*/, ne /*elem*/, len - 1 /*index*/);
        platform.set(this, "$selected", ne);
        return ne;
    };

    _BaseArray.prototype.$empty = function () {
        this.splice(0, this.length);
        return this;
    };

    _BaseArray.prototype.$remove = function (item) {
        let index = this.indexOf(item);
        if (index === -1)
            return;
        this.splice(index, 1); // EVENT
        let eventName = this._path_ + '[].remove';
        this._root_.$setDirty(true);
        this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);
        if (index >= this.length)
            index -= 1;
        if (this.length > index)
            platform.set(this, '$selected', this[index]);
    };

    _BaseArray.prototype.$copy = function (src) {
        this.$empty();
        if (utils.isArray(src)) {
            for (let i = 0; i < src.length; i++) {
                this.push(this.$new(src[i]));
            }
        }
        return this;
    };

    function defineObject(obj, meta, arrayItem) {
        defHidden(obj.prototype, META, meta);
        obj.prototype.$merge = merge;

        defHiddenGet(obj.prototype, "$host", function () {
            return this._root_._host_;
        });

        defHiddenGet(obj.prototype, "$root", function () {
            return this._root_;
        });

        defHiddenGet(obj.prototype, "$vm", function () {
            return this._root_._host_.$viewModel;
        });

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
        this._needValidate_ = true;
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

    function validateImpl(item, path, val) {
        if (!item) return null;
        let tml = item._root_.$template;
        if (!tml) return null;
        var vals = tml.validators;
        if (!vals) return null;
        var elemvals = vals[path];
        if (!elemvals) return null;
        return validators.validate(elemvals, item, val);
    }

    function saveErrors(item, path, errors)
    {
        if (!item._errors_ && !errors)
            return; // already null
        else if (!item._errors_ && errors)
            item._errors_ = {}; // new empty object
        if (errors)
            item._errors_[path] = errors;
        else if (path in item._errors_)
            delete item._errors_[path];
        if (utils.isEmptyObject(item._errors_))
            item._errors_ = null;
        return errors;
    }

    function validate(item, path, val) {
        if (!item._root_._needValidate_) {
            // already done
            if (!item._errors_)
                return null;
            if (path in item._errors_)
                return item._errors_[path];
            return null;
        }
        //console.warn('validate self element:' + path);
        let res = validateImpl(item, path, val);
        return saveErrors(item, path, res);
    }

    function* enumData(root, path, name) {
        if (!path) {
            // scalar value in root
            yield { item: root, val: root[name] };
            return;
        }
        let sp = path.split('.');
        let currentData = root;
        for (let i = 0; i < sp.length; i++) {
            let last = i === sp.length - 1;
            let prop = sp[i];
            if (prop.endsWith('[]')) {
                // is array
                let pname = prop.substring(0, prop.length - 2);
                let objto = root[pname];
                if (!objto)
                    continue;
                for (let j = 0; j < objto.length; j++) {
                    let arrItem = objto[j];
                    if (last)
                        yield { item: arrItem, val: arrItem[name] };
                    else {
                        let newpath = sp.slice(1).join('.');
                        for (var y of enumData(arrItem, newpath, name))
                            yield { item: y.item, val: y.val };
                    }
                }
            } else {
                // simple element
                let objto = root[prop];
                if (objto) {
                    yield { item: root[prop], val: objto[name] };
                }
            }
        }
    }

    // enumerate all data (recursive)
    function* dataForVal(root, path) {
        let ld = path.lastIndexOf('.');
        let dp = '';
        let dn = path;
        if (ld !== -1) {
            dp = path.substring(0, ld);
            dn = path.substring(ld + 1);
        }
        for (val of enumData(root, dp, dn))
            yield val;
    }

    function validateOneElement(root, path, vals) {
        if (!vals)
            return;
        for (let elem of dataForVal(root, path)) {
            //console.warn(elem);
            let res = validators.validate(vals, elem.item, elem.val);
            saveErrors(elem.item, path, res);
        }
    }

    function validateAll() {
        var me = this;
        if (!me._needValidate_)
            return;
        //console.warn('call validate all');
        me._needValidate_ = false;
        let tml = me.$template;
        if (!tml) return;
        let vals = tml.validators;
        if (!vals) return;
        for (var val in vals) {
            validateOneElement(me, val, vals[val])
        }
    }

    function setDirty(val) {
        this.$dirty = val;
    }

    function merge(src) {
        for (var prop in this._meta_) {
            let ctor = this._meta_[prop];
            let trg = this[prop];
            if (Array.isArray(trg)) {
                platform.set(trg, "$selected", null);
                trg.$copy(src[prop]);
                // copy rowCount
                if ('$RowCount' in trg) {
                    let rcProp = prop + '.$RowCount';
                    if (rcProp in src)
                        trg.$RowCount = src[rcProp];
                    else
                        trg.$RowCount = 0;
                }
            } else {
                if (utils.isPrimitiveCtor(ctor))
                    platform.set(this, prop, src[prop]);
                else {
                    let newsrc = new ctor(src[prop], prop, this);
                    platform.set(this, prop, newsrc);
                }
            }
        }
    }

    function implementRoot(root, template, ctors) {
        root.prototype.$emit = emit;
        root.prototype.$setDirty = setDirty;
        root.prototype.$merge = merge;
        root.prototype.$template = template;
        root.prototype._exec_ = executeCommand;
        root.prototype._validate_ = validate;
        root.prototype._validateAll_ = validateAll;
        // props cache for t.construct
        let xProp = {};
        if (template) {
            for (let p in template.properties) {
                let px = p.split('.'); // Type.Prop
                if (px.length !== 2) {
                    console.error(`invalid propery name '${p}'`);
                    continue;
                }
                let typeName = px[0];
                let propName = px[1];
                let pv = template.properties[p]; // property value
                if (!(typeName in xProp))
                    xProp[typeName] = {};
                xProp[typeName][propName] = pv;
            }
            template._props_ = xProp;
        }
    }

    app.modules['datamodel'] = {
        createObject: createObject,
        createArray: createArray,
        defineObject: defineObject,
        implementRoot: implementRoot,
        enumData: enumData
    };
})();
/*20170819-7016*/
/* dataservice.js */
(function () {

    let http = require('http');
    let utils = require('utils');

    function post(url, data) {
        return http.post(url, data);
    }

    app.modules['std:dataservice'] = {
        post: post
    };
})();




/*20170824-7019*/
/*components/include.js*/

(function () {

    const http = require('http');

    Vue.component('include', {
        template: '<div :class="implClass"></div>',
        props: {
            src: String,
            cssClass: String,
            needReload: Boolean
        },
        data() {
            return {
                loading: true,
                currentUrl: '',
                _needReload: true
            };
        },
        methods: {
            loaded(ok) {
                this.loading = false;
            },
            requery() {
                if (this.currentUrl) {
                    // Do not set loading. Avoid blinking
                    http.load(this.currentUrl, this.$el).then(this.loaded);
                }
            }
        },
        computed: {
            implClass() {
                return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
            }
        },
        mounted() {
            if (this.src) {
                this.currentUrl = this.src;
                http.load(this.src, this.$el).then(this.loaded);
            }
        },
        destroyed() {
            let fc = this.$el.firstElementChild;
            if (fc && fc.__vue__)
                fc.__vue__.$destroy();
        },
        watch: {
            src: function (newUrl, oldUrl) {
                this.loading = true; // hides the current view
                this.currentUrl = newUrl;
                http.load(newUrl, this.$el).then(this.loaded);
            },
            needReload(val) {
                // works like a trigger
                if (val) this.requery();
            }
        }
    });
})();
(function () {

    Vue.component('validator', {
        props: ['invalid', 'errors'],
        template: '<span v-if="invalid" class="validator"><ul><li v-for="err in errors" v-text="err.msg" :class="err.severity"></li></ul></span>',
    });

})();
(function () {

    const control = {
        computed: {
            path() {
                return this.item._path_ + '.' + this.prop;
            },
            valid() {
                return !this.invalid;
            },
            invalid() {
                let err = this.errors;
                return err && err.length > 0;
            },
            errors() {
                if (!this.item) return null;
                let root = this.item._root_;
                return root._validate_(this.item, this.path, this.item[this.prop]);
            },
            cssClass() {
                let cls = 'control' + (this.invalid ? ' invalid' : ' valid');
                return cls;
            },
            inputClass() {
                let cls = '';
                if (this.align !== 'left')
                    cls += 'text-' + this.align;
                return cls;
            }
        },
        methods: {
            test() {
                alert('from base control');
            }
        }
    };

    app.components['control'] = control;

})();
(function() {


    let textBoxTemplate =
`<div :class="cssClass">
    <input v-model.lazy="item[prop]" :class="inputClass"/>
    <validator :invalid="invalid" :errors="errors"></validator>
    <span>{{path}}</span>
    <button @click="test">*</button>
</div>
`;
    let baseControl = component('control');

    Vue.component('textbox', {
        extends: baseControl,
        template: textBoxTemplate,
        props: {
            item: Object,
            prop: String,
            align: { type: String, default: 'left' }
        }
    });
})();
/*20170824-7019*/
/*components/datagrid.js*/
(function () {

 /*TODO:
2. size (compact, large ??)
5. grouping (multiply)
6. select (выбирается правильно, но теряет фокус при выборе редактора)
7. Доделать checked
8. pager - (client/server)
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

    const utils = require('utils');

    const dataGridTemplate = `
<div class="data-grid-container">
    <slot name="toolbar" :query="dgQuery" />
    <table :class="cssClass">
        <colgroup>
            <col v-if="isMarkCell"/>
            <col :class="columnClass(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
        </colgroup>
        <thead>
            <tr>
                <th v-if="isMarkCell" class="marker"></th>
                <slot></slot>
            </tr>
        </thead>
        <tbody>
            <data-grid-row :cols="columns" v-for="(item, rowIndex) in $items" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
        </tbody>
    </table>
    <slot name="pager" :query="dgQuery" :sort="sort"/>
</div>
`;

    const dataGridRowTemplate = `
<tr @mouseup.stop.prevent="row.$select()" :class="rowClass" v-on:dblclick.capture.stop.prevent="dblClick">
    <td v-if="isMarkCell" class="marker">
        <div :class="markClass"></div>
    </td>
    <data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index">
    </data-grid-cell>
</tr>`;

    const dataGridColumnTemplate = `
<th :class="cssClass" @click.stop.prevent="doSort">
    <i :class="\'fa fa-\' + icon" v-if="icon"></i>
    <slot>{{header || content}}</slot>
</th>
`;

    const dataGridColumn = {
        name: 'data-grid-column',
        template: dataGridColumnTemplate,
        props: {
            header: String,
            content: String,
            icon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined },
            mark: String
        },
        created() {
            this.$parent.$addColumn(this);
        },
        computed: {
            dir() {
                var q = this.$parent.dgQuery;
                if (!q)
                    return '';
                if (q.order === this.content) {
                    return (q.dir || '').toLowerCase();
                }
                return null;
            },
            isSortable() {
                if (!this.content)
                    return false;
                return typeof this.sort === 'undefined' ? this.$parent.isGridSortable : this.sort;
            },
            isUpdateUrl() {
                return !this.$root.inDialog;
            },
            template() {
                return this.id ? this.$parent.$scopedSlots[this.id] : null;
            },
            cssClass() {
                let cssClass = this.classAlign;
                if (this.isSortable) {
                    cssClass += ' sort';
                    if (this.dir)
                        cssClass += ' ' + this.dir;
                }
                return cssClass;
            },
            classAlign() {
                return this.align !== 'left' ? (' text-' + this.align).toLowerCase() : '';
            }
        },
        methods: {
            doSort() {
                if (!this.isSortable)
                    return;
                let q = this.$parent.dgQuery;
                let qdir = (q.dir || 'asc').toLowerCase();
                if (q.order === this.content) {
                    qdir = qdir === 'asc' ? 'desc' : 'asc';
                }
                let nq = Object.assign({}, q, { order: this.content, dir: qdir });
                Vue.set(this.$parent, 'dgQuery', nq);
            },
            cellCssClass(row) {
                let cssClass = this.classAlign;
                if (this.mark) {
                    let mark = row[this.mark];
                    if (mark)
                        cssClass += ' ' + mark;
                }
                return cssClass.trim();
            }
        }
    };
    Vue.component('data-grid-column', dataGridColumn);

    const dataGridCell = {
        functional: true,
        name: 'data-grid-cell',
        props: {
            row: Object,
            col: Object,
            index: Number
        },
        render(h, ctx) {
            //console.warn('render cell');
            let tag = 'td';
            let row = ctx.props.row;
            let col = ctx.props.col;
            let ix = ctx.props.index;

            let cellProps = {
                'class': col.cellCssClass(row)
            };

            let childProps = {
                props: {
                    row: row,
                    col: col
                }
            };
            if (col.template) {
                let vNode = col.template(childProps.props);
                return h(tag, cellProps, [vNode]);
            }

            if (!col.content) {
                return h(tag, cellProps);
            }

            let validator = {
                props: ['path', 'item'],
                template: '<validator :path="path" :item="item"></validator>'
            };

            let validatorProps = {
                props: {
                    path: col.validate,
                    item: row
                }
            };

            if (col.editable) {
                /* editable content */
                let child = {
                    props: ['row', 'col', 'align'],
                    /*TODO: control type */
                    template: '<textbox :item="row" :prop="col.content" :align="col.align" ></textbox>'
                };
                return h(tag, cellProps, [h(child, childProps)]);
            }
            /* simple content */
            if (col.content === '$index')
                return h(tag, cellProps, [ix + 1]);

            // Warning: toString() is required.
            let content = utils.toString(row[col.content]);
            let chElems = [content];
            /*TODO: validate ???? */
            if (col.validate) {
                chElems.push(h(validator, validatorProps));
            }
            return h(tag, cellProps, chElems);
        }
    };

    const dataGridRow = {
        name: 'data-grid-row',
        template: dataGridRowTemplate,
        components: {
            'data-grid-cell': dataGridCell
        },
        props: {
            row: Object,
            cols: Array,
            index: Number,
            mark: String
        },
        computed: {
            active() {
                return this.row === this.$parent.selected;
                //return this === this.$parent.rowSelected;
            },
            rowClass() {
                let cssClass = '';
                if (this.active)
                    cssClass += 'active';
                if (this.isMarkRow && this.mark)
                    cssClass += ' ' + this.row[this.mark];
                return cssClass.trim();
            },
            isMarkCell() {
                return this.$parent.isMarkCell;
            },
            markClass() {
               return this.mark ? this.row[this.mark] : '';
            }
        },
        methods: {
            rowSelect() {
                throw new Error("do not call");
                //this.$parent.rowSelected = this;
            },
            dblClick($event) {
                if ($event.target.tagName !== 'TD') {
                    alert('double click return:' + $event.target.tagName);
                    return;
                }
                alert('double click:' + $event.target.tagName);
            }
        }
    };

    Vue.component('data-grid', {
        props: {
            'items-source': [Object, Array],
            border: Boolean,
            grid: String,
            striped: Boolean,
            hover: { type: Boolean, default: false },
            sort: String,
            routeQuery: Object,
            mark: String,
            filterFields: String,
            markStyle: String
        },
        template: dataGridTemplate,
        components: {
            'data-grid-row': dataGridRow
        },
        data() {
            return {
                columns: [],
                clientItems: null,
                dgQuery: {
                    // predefined for sorting and pagination
                    dir: undefined,
                    order: undefined,
                    offset: undefined
                }
            };
        },
        watch: {
            dgQuery: {
                handler(nq, oq) {
                    this.queryChange();
                },
                deep:true
            }
        },
        computed: {
            $items() {
                return this.clientItems ? this.clientItems : this.itemsSource;
            },
            isMarkCell() {
                return this.markStyle === 'marker' || this.markStyle === 'both';
            },
            isMarkRow() {
                return this.markStyle === 'row' || this.markStyle === 'both';
            },
            cssClass() {
                let cssClass = 'data-grid';
                if (this.border) cssClass += ' border';
                if (this.grid) cssClass += ' grid-' + this.grid;
                if (this.striped) cssClass += ' striped';
                if (this.hover) cssClass += ' hover';
                return cssClass;
            },
            selected() {
                return this.itemsSource.$selected;
            },
            isGridSortable() {
                return !!this.sort;
            }
        },
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            },
            columnClass(column) {
                return {
                    sorted: !!column.dir
                };
            },
            queryChange()
            {
                let nq = this.dgQuery;
                if (this.sort === 'server') {
                    this.$root.$emit('queryChange', nq);
                    return;
                }
                let rev = nq.dir === 'desc';
                let sortProp = nq.order;
                let arr = [].concat(this.itemsSource);
                if (nq.filter) {
                    let sv = nq.filter.toUpperCase();
                    // TODO: add $contains to element
                    arr = arr.filter((itm) => itm.Name.toUpperCase().indexOf(sv) !== -1);
                }
                arr.sort((a, b) => {
                    let av = a[sortProp];
                    let bv = b[sortProp];
                    if (av === bv)
                        return 0;
                    else if (av < bv)
                        return rev ? 1 : -1;
                    else
                        return rev ? -1 : 1;
                });
                if (nq.offset !== undefined) {
                    //TODO: pageSize
                    arr = arr.slice(+nq.offset, +nq.offset + 3);
                }
                this.clientItems = arr;
            }
        },
        created() {
            let q = this.dgQuery;
            let nq = {};

            if (this.filterFields) {
            // make all filter fields (for reactivity)
                this.filterFields.split(',').forEach(v => {
                    let f = v.trim();
                    nq[v.trim()] = undefined;
                });
            }
            let xq = {};
            if (this.sort === 'server') {
                // from route
                xq = this.routeQuery;
            }
            nq = Object.assign({}, q, nq, xq);
            Vue.set(this, 'dgQuery', nq);
        }
    });

})();
/*20170823-7018*/
/*components/pager.js*/

/*
TODO: pageSize
*/

(function () {

    const pagerTemplate = `
    <div class="data-grid-pager">
        <button @click.stop.prevent="prev" :disabled="isFirstPage">prev</button>
        <button @click.stop.prevent="next" :disabled="isLastPage">next</button>
        <label v-text="query"></label>
        <span>length: {{length}} sort:{{sort}}</span>
    </div>
`;


    Vue.component('a2-pager', {
        template: pagerTemplate,
        props: {
            itemsSource: Array,
            query: Object,
            sort: String,
            pageSize: {
                type: Number,
                default: 3 //TODO: default page size
            }
        },
        computed: {
            offset() {
                return +this.query.offset || 0;
            },
            length() {
                if (this.sort === 'server')
                    return this.itemsSource.$RowCount;
                else
                    return this.itemsSource.length;
            },
            isLastPage() {
                return this.offset + this.pageSize >= this.length;
            },
            isFirstPage() {
                return +this.offset === 0;
            }
        },
        methods: {
            next() {
                if (this.isLastPage)
                    return;
                var cv = this.offset + this.pageSize;
                this.query.offset = cv;
            },
            prev() {
                if (this.isFirstPage)
                    return;
                let cv = this.offset - this.pageSize;
                this.query.offset = cv;
            }
        }
    });
})();


/* 20170816-7014 */
/*components/treeview.js*/

(function () {

    /*TODO:
        3. folder/item
    */
    Vue.component('tree-item', {
        template: `
<li @click.stop.prevent="doClick(item)" :title="item[title]"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
    <div class="overlay">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-else class="toggle"></span>
        <i v-if="hasIcon" :class="iconClass"></i>
        <a v-if="hasLink" :href="dataHref" v-text="item[label]" :class="{'no-wrap':!wrapLabel }"></a>
        <span v-else v-text="item[label]" :class="{'tv-folder':true, 'no-wrap':!wrapLabel}"></span>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[subitems]" 
            :key="index" :item="itm" :click="click" :get-href="getHref" :is-active="isActive" :has-icon="hasIcon" :folder-select="folderSelect"
            :label="label" :wrap-label="wrapLabel" :icon="icon" :subitems="subitems" :title="title"></tree-item>
    </ul>   
</li>
`,
        props: {
            item: Object,
            /* attrs */
            hasIcon: Boolean,
            wrapLabel: Boolean,
            folderSelect: Boolean,
            /* prop names */
            label: String,
            icon: String,
            title: String,
            subitems: String,
            /* callbacks */
            click: Function,
            isActive: Function,
            getHref: Function
        },
        data() {
            return {
                open: true
            };
        },
        methods: {
            doClick(item) {
                if (this.isFolder && !this.folderSelect)
                    this.toggle();
                else
                    this.click(item);
            },
            toggle() {
                if (!this.isFolder)
                    return;
                this.open = !this.open;
            }
        },
        computed: {
            isFolder: function () {
                let ch = this.item[this.subitems];
                return ch && ch.length;
            },
            hasLink() {
                return !this.isFolder || this.folderSelect;
            },
            isExpanded: function () {
                return this.isFolder && this.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.open;
            },
            isItemSelected: function () {
                return this.isActive(this.item);
            },
            iconClass: function () {
                return this.icon ? "ico ico-" + (this.item[this.icon] || 'empty') : '';
            },
            dataHref() {
                return this.getHref ? this.getHref(this.item) : '';
            }
        }
    });

})();

(function () {


/**
TODO: may be icon for confirm ????
*/

    const modalTemplate = `
<div class="modal-window">
    <include v-if="isInclude" class="modal-content" :src="dialog.url"></include>
    <div v-else class="modal-content">
        <div class="modal-header"><span v-text="title"></span><button @click.stop.prevent="modalClose(false)">x</button></div>
        <div class="modal-body">
            <p v-text="dialog.message"></p>            
        </div>
        <div class="modal-footer">
            <button v-for="(btn, index) in buttons"  :key="index" @click="modalClose(btn.result)" v-text="btn.text"></button>
        </div>
    </div>
</div>        
`;
    const store = require('store');

    const modalComponent = {
        template: modalTemplate,
        props: {
            dialog: Object
        },
        data() {
            // always need a new instance of function (modal stack)
            return {
                keyUpHandler: function () {
                    // escape
                    if (event.which === 27) {
                        store.$emit('modalClose', false);
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            };
        },
        methods: {
            modalClose(result) {
                store.$emit('modalClose', result);
            }
        },
        computed: {
            isInclude: function () {
                return !!this.dialog.url;
            },
            title: function () {
                return this.dialog.title || 'Error';
            }, 
            buttons: function () {
                console.warn(this.dialog.style);
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                else if (this.dialog.style === 'alert')
                    return [{ text: 'OK', result: false }];
                return [
                    { text: 'OK', result: true },
                    { text: 'Cancel', result: false }
                ];
            }
        },
        created() {
            document.addEventListener('keyup', this.keyUpHandler);
        },
        destroyed() {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
    };

    app.components['modal'] = modalComponent;
})();
/*20170824-7019*/
/*controllers/base.js*/
(function () {

    const store = require('store');
    const utils = require('utils');
    const dataservice = require('std:dataservice');
    const route = require('route');

    const base = Vue.extend({
        // inDialog: bool (in derived class)
        data() {
            return {
                __init__: true,
                __baseUrl__: ''
            };
        },

        computed: {
            $baseUrl() {
                return this.$data.__baseUrl__;  
            },
            $query() {
                return this.$data._query_;
            },
            $isDirty() {
                return this.$data.$dirty;
            },
            $isPristine() {
                return !this.$data.$dirty;
            }
        },
        watch: {
            $baseUrl: function (newUrl) {
                if (!this.$data.__init__)
                    return;
                if (this.inDialog)
                    this.$data._query_ = route.queryFromUrl(newUrl);
                else
                    this.$data._query = route.query;
                Vue.nextTick(() => { this.$data.__init__ = false; });
            },
            "$query": {
                handler: function (newVal, oldVal) {
                    //console.warn('query watched');
                    if (this.$data.__init__)
                        return;
                    if (this.inDialog) {
                        this.$data.__baseUrl__ = route.replaceUrlQuery(this.$baseUrl, newVal);
                        this.$reload();
                    } else {
                        route.query = newVal;
                        this.$searchChange();
                    }
                },
                deep: true
            }
        },
        methods: {
            $exec(cmd, ...args) {
                let root = this.$data;
                root._exec_(cmd, ...args);
            },

            $save() {
                var self = this;
                var url = '/_data/save';
                return new Promise(function (resolve, reject) {
                    var jsonData = utils.toJson({ baseUrl: self.$baseUrl, data: self.$data });
                    dataservice.post(url, jsonData).then(function (data) {
                        self.$data.$merge(data);
                        self.$data.$setDirty(false);
                        // data is full model. Resolve requires single element
                        let dataToResolve;
                        for (let p in data) {
                            dataToResolve = data[p];
                        }
                        resolve(dataToResolve); // single element (raw data)
                    }).catch(function (msg) {
                        self.$alertUi(msg);
                    });
                });
            },

            $invoke(cmd, base, data) {
                alert('TODO: call invoke command');
                let self = this;
                let url = '/_data/invoke';
                let baseUrl = base || self.$baseUrl;
                return new Promise(function (resolve, reject) {
                    dataservice.post(url).then(function (data) {
                    }).catch(function (msg) {
                        self.$alertUi(msg);
                    });
                });
            },

            $reload() {
                var self = this;
                let url = '/_data/reload';
                let dat = self.$data;
                return new Promise(function (resolve, reject) {
                    var jsonData = utils.toJson({ baseUrl: self.$baseUrl });
                    dataservice.post(url, jsonData).then(function (data) {
                        if (utils.isObject(data)) {
                            dat.$merge(data);
                            dat.$setDirty(false);
                        } else {
                            throw new Error('Invalid response type for $reload');
                        }
                    }).catch(function (msg) {
                        self.$alertUi(msg);
                    });
                });
            },

            $requery() {
                store.$emit('requery');
            },

            $navigate(url, data) {
                // TODO: make correct URL
                let urlToNavigate = '/' + url + '/' + data;
                route.navigate(urlToNavigate);
            },
            $confirm(prms) {
                if (utils.isString(prms))
                    prms = { message: prms };
                let dlgData = { promise: null, data: prms };
                store.$emit('confirm', dlgData);
                return dlgData.promise;
            },
            $alert(msg, title) {
                let dlgData = {
                    promise: null, data: {
                        message: msg, title: title, style: 'alert'
                    }
                };
                store.$emit('confirm', dlgData);
                return dlgData.promise;
            },

            $alertUi(msg) {
                if (msg instanceof Error) {
                    alert(msg.message);
                    return;
                }
                if (msg.indexOf('UI:') === 0)
                    this.$alert(msg.substring(3));

                else
                    alert(msg);
            },

            $dialog(command, url, data, query) {
                return new Promise(function (resolve, reject) {
                    // sent a single object
                    let dataToSent = data;
                    if (command === 'add') {
                        if (!utils.isArray(data)) {
                            console.error('$dialog.add. The argument is not an array');
                        }
                        dataToSent = null;
                    }
                    let dlgData = { promise: null, data: dataToSent, query: query };
                    store.$emit('modal', url, dlgData);
                    if (command === 'edit' || command === 'browse') {
                        dlgData.promise.then(function (result) {
                            if (!utils.isObject(data)) {
                                console.error(`$dialog.${command}. The argument is not an object`);
                                return;
                            }
                            // result is raw data
                            data.$merge(result);
                            resolve(result);
                        });
                    } else if (command === 'add') {
                        // append to array
                        dlgData.promise.then(function (result) {
                            // result is raw data
                            data.$append(result);
                            resolve(result);
                        });
                    } else {
                        dlgData.promise.then(function (result) {
                            resolve(result);
                        });
                    }
                });
            },

            $modalSaveAndClose(result) {
                if (this.$isDirty)
                    this.$save().then((result) => store.$emit('modalClose', result));
                else
                    store.$emit('modalClose', result);
            },

            $modalClose(result) {
                store.$emit('modalClose', result);
            },

            $saveAndClose() {
                if (this.$isDirty)
                    this.$save().then(() => route.close());
                else
                    route.close();
            },

            $close() {
                if (this.$saveModified())
                    route.close();
            },

            $searchChange() {
                let newUrl = route.replaceUrlSearch(this.$baseUrl);
                this.$data.__baseUrl__ = newUrl;
                this.$reload();
            },

            $saveModified() {
                if (!this.$isDirty)
                    return true;
                let self = this;
                // TODO: localize!!!
                let dlg = {
                    message: "Element was modified. Save changes?",
                    title: "Confirm close",
                    buttons: [
                        { text: "Save", result: "save" },
                        { text: "Don't save", result: "close" },
                        { text: "Cancel", result: false }
                    ]
                };
                this.$confirm(dlg).then(function (result) {
                    if (result === 'close') {
                        // close without saving
                        self.$data.$setDirty(false);
                        self.$close();
                    } else if (result === 'save') {
                        // save then close
                        self.$save().then(function () {
                            self.$close();
                        });
                    }
                });
                return false;
            }
        },
        created() {
            store.$emit('registerData', this);
            if (!this.inDialog)
                this.$data._query_ = route.query;
            this.$on('queryChange', function (val) {
                this.$data._query_ = val;
            });
        },
        destroyed() {
            store.$emit('registerData', null);
        }
    });
    
    app.components['baseController'] = base;

})();
/*20170824-7019*/
/* controllers/shell.js */

(function () {

    /* TODO: 
    1. find first active item
    */
    const route = require('route');
    const store = require('store');
    const modal = component('modal');


    function findMenu(menu, func) {
        if (!menu)
            return null;
        for (let i = 0; i < menu.length; i++) {
            let itm = menu[i];
            if (func(itm))
                return itm;
            if (itm.menu) {
                let found = findMenu(itm.menu, func);
                if (found)
                    return found;
            }
        }
        return null;
    }

    function activateMenu(activeItem, loc) {
        let seg2 = loc.segment(2);
        if (!seg2) {
            let url = activeItem.url;
            let fa = findMenu(activeItem.menu, (mi) => mi.url && !mi.menu);
            if (fa) {
                url = '/' + url + '/' + fa.url;
                route.setState(url, fa.title);
            }
        }
    }

    const navBar = {

        props: {
            menu: Array
        },

        template: `
<ul class="nav-bar">
    <li v-for="item in menu" :key="item.url" :class="{active : isActive(item)}">
        <a :href="itemHref(item)" v-text="item.title" @click.stop.prevent="navigate(item)"></a>
    </li>
</ul>
`,

        data: function () {
            return {
                activeItem: null,
                isAppMode: false
            };
        },

        created: function () {
            var me = this;
            me.__dataStack__ = [];

            function findCurrent() {
                let loc = route.location();
                let seg1 = loc.segment(1);
                let seg2 = loc.segment(2);
                let len = loc.routeLength();
                if (seg1 === 'app') {
                    me.isAppMode = true;
                    return null;
                }
                let ai = me.menu.find(itm => itm.url === seg1);
                me.activeItem = ai;
                return loc;
            }

            window.addEventListener('popstate', function (event, a, b) {
                if (me.__dataStack__.length > 0) {
                    let comp = me.__dataStack__[0];
                    let oldUrl = event.state;
                    //console.warn('pop state: ' + oldUrl);
                    if (!comp.$saveModified()) {
                        // disable navigate
                        oldUrl = comp.__baseUrl__.replace('/_page', '');
                        //console.warn('return url: ' + oldUrl);
                        window.history.pushState(oldUrl, null, oldUrl);
                        return;
                    }
                }
                route.updateSearch();
                findCurrent();
                route.navigateCurrent();
            });

            let loc = findCurrent();

            if (me.activeItem && me.activeItem.menu)
            {
                activateMenu(me.activeItem, loc);
            }

            if (!me.activeItem && !this.isAppMode) {
                me.activeItem = me.menu[0];
                activateMenu(me.activeItem, loc);
            }


            store.$on('registerData', function (component) {
                if (component)
                    me.__dataStack__.push(component);
                else
                    me.__dataStack__.pop(component);
            });

            this.$root.$on('navigateTop', function (top) {
                me.navigate(top);
            });
        },

        methods: {
            isActive: function (item) {
                return item === this.activeItem;
            },
            itemHref(item) {
                // for 'open in new window' command
                let url = '/' + item.url;
                let activeItem = findMenu(item.menu, (itm) => itm.url && !!item.menu);
                if (activeItem)
                    url = url + '/' + activeItem.url;
                return url;
            },
            navigate: function (item) {
                // nav bar
                this.activeItem = item;
                let url = '/' + item.url;
                let query = null;
                let title = null;
                let savedUrl = route.savedMenu(item.url);
                let activeItem = null;
                if (savedUrl) {
                    // find active side menu item
                    activeItem = findMenu(item.menu, (itm) => itm.url === savedUrl);
                } else {
                    activeItem = findMenu(item.menu, (itm) => itm.url && !!item.menu);
                }
                if (activeItem) {
                    url = url + '/' + activeItem.url;
                    query = activeItem.query;
                    title = activeItem.title;
                }
                route.navigateMenu(url, query, title);
            }
        }
    };

    const sideBar = {
        // TODO: разные варианты меню
        template: `
<div :class="cssClass">
    <a href role="button" class="ico collapse-handle" @click.stop.prevent="toggle"></a>
    <div class="side-bar-body" v-if="bodyIsVisible">
        <ul class="tree-view">
            <tree-item v-for="(itm, index) in sideMenu" :folder-select="!!itm.url"
                :item="itm" :key="index" label="title" icon="icon" title="title"
                :subitems="'menu'" :click="navigate" :get-href="itemHref" :is-active="isActive" :has-icon="true" :wrap-label="true">
            </tree-item>
        </ul>
    </div>
    <div v-else class="side-bar-title" @click.stop.prevent="toggle">
        <span class="side-bar-label" v-text="title"></span>
    </div>
</div>
`,
        props: {
            menu: Array
        },
        data: function () {
            return {
                sideMenu: null,
                topUrl: null,
                activeItem: null
            };
        },
        computed: {
            cssClass: function () {
                return 'side-bar ' + (this.$parent.sideBarCollapsed ? 'collapsed' : 'expanded');
            },
            bodyIsVisible() {
                return !this.$parent.sideBarCollapsed;
            },
            title() {
                return this.activeItem ? this.activeItem.title : 'Меню';
            }
        },
        methods: {
            isActive: function (itm) {
                return itm === this.activeItem;
            },
            itemUrl(itm)
            {
                return `/${this.topUrl}/${itm.url}`;
            },
            itemHref(itm) {
                // for 'open in new window' command
                let url = this.itemUrl(itm);
                if (itm.query)
                    url += '?' + itm.query;
                return url;
            },
            navigate: function (itm) {
                if (!itm.url)
                    return; // no url. is folder?
                let newUrl = this.itemUrl(itm);
                route.navigateMenu(newUrl, itm.query, itm.title);
            },
            toggle() {
                this.$parent.sideBarCollapsed = !this.$parent.sideBarCollapsed;
            }
        },
        created: function () {
            var me = this;
            route.$on('route', function (loc) {
                let s1 = loc.segment(1);
                let s2 = loc.segment(2);
                let m1 = me.menu.find(itm => itm.url === s1);
                if (!m1) {
                    me.topUrl = null;
                    me.sideMenu = null;
                } else {
                    me.topUrl = m1.url;
                    me.sideMenu = m1.menu || null;
                    if (me.sideMenu)
                        me.activeItem = findMenu(me.sideMenu, (itm) => itm.url === s2);
                }
                if (me.activeItem)
                    route.setTitle(me.activeItem.title);
            });
        }
    };

    const contentView = {
        render(h) {
            return h('div', {
                attrs: {
                    class: 'content-view ' + this.cssClass
                }
            }, [h('include', {
                props: {
                    src: this.currentView,
                    needReload: this.needReload
                }
            })]);
        },
        data() {
            return {
                currentView: null,
                needReload: false,
                cssClass: ''
            };
        },
        created() {
            var me = this;
            route.$on('route', function (loc) {
                let len = loc.routeLength();
                //TODO: // find menu and get location from it ???
                let tail = '';
                switch (len) {
                    case 2: tail = '/index/0'; break;
                    case 3: tail = '/index/0'; break;
                }
                let url = "/_page" + window.location.pathname + tail;
                let search = window.location.search;
                url += search;
                me.currentView = url;
                me.cssClass =
                    len === 2 ? 'full-page' :
                    len === 3 ? 'partial-page' :
                                'full-view';
            });

            store.$on('requery', function () {
                // just trigger
                me.needReload = true;
                Vue.nextTick(() => me.needReload = false);
            });
        }
    };

    // important: use v-show instead v-if to ensure components created only once
    const a2MainView = {
        template: `
<div :class="cssClass">
    <a2-nav-bar :menu="menu" v-show="navBarVisible"></a2-nav-bar>
    <a2-side-bar :menu="menu" v-show="sideBarVisible"></a2-side-bar>
    <a2-content-view></a2-content-view>
    <div class="load-indicator" v-show="pendingRequest"></div>
    <div class="modal-stack" v-if="hasModals" @keyup.esc='closeModal'>
        <div class="modal-wrapper" v-for="dlg in modals">
            <a2-modal :dialog="dlg"></a2-modal>
        </div>
    </div>
</div>`,
        components: {
            'a2-nav-bar': navBar,
            'a2-side-bar': sideBar,
            'a2-content-view': contentView,
            'a2-modal': modal
        },
        props: {
            menu: Array
        },
        data() {
            return {
                navBarVisible: false,
                sideBarVisible: true,
                sideBarCollapsed: false,
                requestsCount: 0,
                modals: []
            };
        },
        computed: {
            cssClass: function () {
                return 'main-view ' + (this.sideBarCollapsed ? 'side-bar-collapsed' : 'side-bar-expanded');
            },
            hasModals: function () {
                return this.modals.length > 0;
            },
            pendingRequest: function () {
                return this.requestsCount > 0;
            }
        },
        mounted() {
            // first time created
            route.navigateCurrent();
        },
        methods: {
            closeModal() {
                route.$emit('modalClose');
            }
        },
        created() {
            let me = this;
            route.$on('route', function (loc) {
                let len = loc.routeLength();
                let seg1 = loc.segment(1);
                if (seg1 === 'app') {
                    me.navBarVisible = false;
                    me.sideBarVisible = false;
                }
                else {
                    me.navBarVisible = len === 2 || len === 3;
                    me.sideBarVisible = len === 3;
                }
                // close all modals
                me.modals.splice(0, me.modals.length);
            });
            store.$on('beginRequest', function () {
                me.requestsCount += 1;
            });
            store.$on('endRequest', function () {
                me.requestsCount -= 1;
            });
            store.$on('modal', function (modal, prms) {
                // TODO: Path.combine
                let id = '0';
                if (prms && prms.data && prms.data.Id) {
                    id = prms.data.Id;
                    // TODO: get correct ID
                }
                let url = '/_dialog/' + modal + '/' + id;
                url = route.replaceUrlQuery(url, prms.query);
                let dlg = { title: "dialog", url: url, prms: prms.data };
                dlg.promise = new Promise(function (resolve, reject) {
                    dlg.resolve = resolve;
                });
                prms.promise = dlg.promise;
                me.modals.push(dlg);
            });
            store.$on('modalClose', function (result) {
                let dlg = me.modals.pop();
                if (result)
                    dlg.resolve(result);
            });
            store.$on('confirm', function (prms) {
                let dlg = prms.data;
                dlg.promise = new Promise(function (resolve) {
                    dlg.resolve = resolve;
                });
                prms.promise = dlg.promise;
                me.modals.push(dlg);
            });
        }
    };




    const shell = Vue.extend({
        components: {
            'a2-main-view': a2MainView
        },
        methods: {
            about() {
                // TODO: localization
                route.navigateMenu('/app/about', null, "О программе");
            },
            root() {
                // first menu element
                this.$emit('navigateTop', this.menu[0]);
            }
        }
    });

    app.components['std:shellController'] = shell;

})();