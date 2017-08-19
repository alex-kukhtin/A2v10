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

/*20170818-7015*/
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
        let query = Object.keys(obj).map(k => esc(k) + '=' + esc(obj[k])).join('&');
        return '?' + query;
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
    }

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

    var route = new Vue({
        data: {
            search: {}
        },
        computed: {
            query: {
                get() {
                    let wls = window.location.search.substring(1); // skip '?'
                    let qs = parseQueryString(wls);
                    Vue.set(this, 'search', qs);
                    return this.search;
                },
                set(value) {
                    Vue.set(this, 'search', value);
                    let newUrl = window.location.pathname;
                    newUrl += makeQueryString(this.search);
                    window.history.pushState(null, null, newUrl);
                    saveSearchToStorage();
                    //TODO: hashChanged - reload
                    //this.$emit('route', this.location());
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
            savedMenu: Location.getSavedMenu,
            navigateMenu(url, query) {
                let srch = getSearchFromStorage(url);
                if (!srch)
                    url += query ? '?' + query : '';
                else
                    url += srch;
                if (query)
                    Vue.set(this, 'search', parseQueryString(query));
                console.info('navigate:' + url);
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
            navigate(url) {
                let loc = this.location();
                console.info('navigate:' + url);
                let oldUrl = loc.fullPath();
                // push/pop state feature. Replace the current state and push new one.
                window.history.replaceState(oldUrl, null, oldUrl);
                window.history.pushState(oldUrl, null, url);
                loc = this.location(); // get new instance
                this.$emit('route', loc);
            },
            close() {
                window.history.back();
            }
        }
    });


    app.modules['route'] = route;
})();

/*20170813-7001*/
/* utils.js */
(function () {

    const toString = Object.prototype.toString;

    function isFunction(value) { return typeof value === 'function'; }
    function isDefined(value) { return typeof value !== 'undefined'; }
    function isObject(value) { return value !== null && typeof value === 'object'; }
    function isDate(value) { return toString.call(value) === '[object Date]'; }
    function isString(value) { return typeof value === 'string'; }
    function isNumber(value) { return typeof value === 'number'; }
    function isPrimitiveCtor(ctor) {
        return ctor === String || ctor === Number || ctor === Boolean;
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
            return (key[0] === '$' || key[0] === '_') ? undefined : value;
        }, 2);
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
        isPrimitiveCtor: isPrimitiveCtor
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
                    if (selector.firstChild && selector.firstChild.__vue__)
                        selector.firstChild.__vue__.__baseUrl__ = url;
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



/*20170813-7005*/
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


/*20170814-7012*/
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

    const platform = require('platform');
    const validators = require('validators');
    const utils = require('utils');

    function defHidden(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            writable: false,
            enumerable: false,
            configurable: false,
            value: value
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
        for (let propName in elem._meta_) {
            defSource(elem, source, propName, parent);
        }
        createObjProperties(elem, elem.constructor);
        let ctorname = elem.constructor.name;
        let constructEvent = ctorname + '.construct';
        elem._root_.$emit(constructEvent, elem);
        if (elem._root_ === elem) {
            // root element
            elem._root_ctor_ = elem.constructor;
            elem.$dirty = false;
        }
        return elem;
    }

    function createArray(source, path, ctor, arrctor, parent) {
        let arr = new _BaseArray(source.length);
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
        for (let i = 0; i < src.length; i++) {
            this.push(this.$new(src[i]));
        }
        return this;
    };

    function defineObject(obj, meta, arrayItem) {
        defHidden(obj.prototype, META, meta);
        obj.prototype.$merge = merge;
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

    function validate(item, path, val) {
        if (!item) return null;
        let tml = item._root_.$template;
        if (!tml) return null;
        var vals = tml.validators;
        if (!vals) return null;
        var elemvals = vals[path];
        if (!elemvals) return null;
        return validators.validate(elemvals, item, val);
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
        implementRoot: implementRoot
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




/*20170818-7015*/
/*components/include.js*/

(function () {

    const http = require('http');

    Vue.component('include', {
        template: '<div :class="implClass"></div>',
        props: {
            src: String,
            cssClass: String
        },
        data() {
            return {
                loading: true
            };
        },
        methods: {
            loaded(ok) {
                this.loading = false;
            }
        },
        computed: {
            implClass() {
                return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
            }
        },
        mounted() {
            if (this.src) {
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
                this.loading = true;
                http.load(newUrl, this.$el).then(this.loaded);
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
/*20170814-7012*/
/*components/datagrid.js*/
(function () {

 /*TODO:
2. size (compact, large ??)
3. contextual
5. grouping
6. select (выбирается правильно, но теряет фокус при выборе редактора)
7. Доделать checked
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

    const route = require('route');

    const dataGridTemplate = `
<table :class="cssClass">
    <thead>
        <tr>
            <slot></slot>
        </tr>
    </thead>
    <tbody>
        <data-grid-row :cols="columns" v-for="(item, rowIndex) in itemsSource" :row="item" :key="rowIndex" :index="rowIndex"></data-grid-row>
    </tbody>
</table>
`;

    const dataGridRowTemplate =
        '<tr @mouseup.stop.prevent="row.$select()" :class="{active : active}" ><data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index"></data-grid-cell></tr>';

    const dataGridColumn = {
        name: 'data-grid-column',
        template: '<th :class="cssClass" @click.stop.prevent="doSort"><i :class="\'fa fa-\' + icon" v-if="icon"></i> <slot>{{header || content}}</slot></th>',
        props: {
            header: String,
            content: String,
            icon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined }
        },
        data() {
            return {
                dirClient: null
            };
        },
        created() {
            this.$parent.$addColumn(this);
        },
        computed: {
            dir() {
                // TODO: client/server
                let q = route.query;
                //console.dir(q);
                if (q.order === this.content) {
                    return (q.dir || '').toLowerCase();
                }
                return null;
            },
            isSortable() {
                if (!this.content)
                    return false;
                return typeof this.sort === 'undefined' ? this.$parent.sort : this.sort;
            },
            template() {
                return this.id ? this.$parent.$scopedSlots[this.id] : null;
            },
            cssClass() {
                let cssClass = '';
                if (this.align !== 'left')
                    cssClass += (' text-' + this.align).toLowerCase();
                if (this.isSortable) {
                    cssClass += ' sort';
                    if (this.dir)
                        cssClass += ' ' + this.dir;
                }
                cssClass = cssClass.trim();
                return cssClass === '' ? null : cssClass;
            }
        },
        methods: {
            doSort() {
                if (!this.isSortable)
                    return;
                // TODO: client/server
                let q = route.query;
                let qdir = (q.dir || 'asc').toLowerCase();
                if (q.order === this.content) {
                    qdir = qdir === 'asc' ? 'desc' : 'asc';
                }
                route.query = { order: this.content, dir: qdir };
                if (this.$parent.searchChange)
                    this.$parent.searchChange();
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
                'class': col.cssClass
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
            let chElems = [row[col.content].toString()];
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
            index: Number
        },
        computed: {
            active() {
                return this.row === this.$parent.selected;
                //return this === this.$parent.rowSelected;
            }
        },
        methods: {
            rowSelect() {
                throw new Error("do not call");
                //this.$parent.rowSelected = this;
            }
        }
    };

    Vue.component('data-grid', {
        props: {
            'items-source': [Object, Array],
            bordered: Boolean,
            striped: Boolean,
            hover: { type: Boolean, default: false },
            sort: { type: Boolean, default: false },
            // callbacks
            searchChange: Function
        },
        template: dataGridTemplate,
        components: {
            'data-grid-row': dataGridRow
        },
        data() {
            return {
                columns: []
                //rowSelected: null
            };
        },
        computed: {
            cssClass() {
                let cssClass = 'data-grid';
                if (this.bordered) cssClass += ' bordered';
                if (this.striped) cssClass += ' striped';
                if (this.hover) cssClass += ' hover';
                return cssClass;
            },
            selected() {
                return this.itemsSource.$selected;
            }
        },
        methods: {
            $addColumn(column) {
                this.columns.push(column);
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
<li @click.stop.prevent="click(item)" :title="item[title]"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
    <div class="overlay">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-if="!isFolder" class="toggle"></span>
        <i v-if="hasIcon" :class="iconClass"></i>
        <a href v-text="item[label]" :class="{'no-wrap':!wrapLabel }"></a>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[subitems]" 
            :key="index" :item="itm" :click="click" :is-active="isActive" :has-icon="hasIcon"
            :label="label" :wrap-label="wrapLabel" :icon="icon" :subitems="subitems" :title="title"></tree-item>
    </ul>   
</li>
`,
        props: {
            item: Object,
            /* attrs */
            hasIcon: Boolean,
            wrapLabel: Boolean,
            /* prop names */
            label: String,
            icon: String,
            title: String,
            subitems: String,
            /* functions */
            click: Function,
            isActive: Function
        },
        data() {
            return {
                open: true
            };
        },
        methods: {
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
        <div class="modal-header"><span v-text="title"></span><button @click.stop.prevent="closeModal(false)">x</button></div>
        <div class="modal-body">
            <p v-text="dialog.message"></p>            
        </div>
        <div class="modal-footer">
            <button v-for="(btn, index) in buttons"  :key="index" @click="closeModal(btn.result)" v-text="btn.text"></button>
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
            closeModal(result) {
                store.$emit('modalClose', result);
            }
        },
        computed: {
            isInclude: function () {
                return !!this.dialog.url
            },
            title: function () {
                return this.dialog.title || 'error';
            }, 
            buttons: function () {
                if (this.dialog.buttons)
                    return this.dialog.buttons;
                return [
                    { text: "OK", result: true },
                    { text: "Cancel", result: false }
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
/*20170819-7016*/
/*controllers/base.js*/
(function () {

    const store = require('store');
    const utils = require('utils');
    const dataservice = require('std:dataservice');
    const route = require('route');

    const base = Vue.extend({
        __baseUrl__: '',
        computed: {

            $isDirty() {
                return this.$data.$dirty;
            },

            $isPristine() {
                return !this.$data.$dirty;
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
                    var jsonData = utils.toJson({ baseUrl: self.__baseUrl__, data: self.$data });
                    dataservice.post(url, jsonData).then(function (data) {
                        self.$data.$merge(data);
                        self.$data.$setDirty(false);
                        // data is full model. Resolve requires single element
                        let dataToResolve;
                        for (let p in data) {
                            dataToResolve = data[p];
                        }
                        resolve(dataToResolve); // single element (raw data)
                    }).catch(function (result) {
                        alert('save error:' + result);
                    });
                });
            },

            $reload() {
                var self = this;
                var url = '/_data/reload';
                let dat = self.$data;
                return new Promise(function (resolve, reject) {
                    var jsonData = utils.toJson({ baseUrl: self.__baseUrl__ });
                    dataservice.post(url, jsonData).then(function (data) {
                        if (utils.isObject(data)) {
                            dat.$merge(data);
                            dat.$setDirty(false);
                        } else {
                            throw new Error('invalid response type for $reload');
                        }
                    }).catch(function (error) {
                        alert('reload error:' + error);
                    });
                });
            },
            $requery() {
                alert('requery here');
            },

            $navigate(url, data) {
                // TODO: make correct URL
                let urlToNavigate = '/' + url + '/' + data;
                route.navigate(urlToNavigate);
            },
            $confirm(prms) {
                let dlgData = { promise: null, data: prms };
                store.$emit('confirm', dlgData);
                return dlgData.promise;
            },
            $dialog(command, url, data) {
                return new Promise(function (resolve, reject) {
                    // sent a single object
                    let dataToSent = data;
                    if (command === 'add') {
                        if (!utils.isArray(data)) {
                            console.error('$dialog.add. The argument is not an array');
                        }
                        dataToSent = null;
                    }
                    let dlgData = { promise: null, data: dataToSent };
                    store.$emit('modal', url, dlgData);
                    if (command === 'edit' || command === 'browse') {
                        dlgData.promise.then(function (result) {
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

            $saveAndClose(result) {
                this.$save().then(function (result) {
                    store.$emit('modalClose', result);
                });
            },

            $closeModal(result) {
                store.$emit('modalClose', result);
            },

            $close() {
                if (this.$saveModified())
                    route.close();
            },

            $searchChange() {
                let newUrl = route.replaceUrlSearch(this.__baseUrl__);
                this.__baseUrl__ = newUrl;
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
                    if (result == 'close') {
                        // close without saving
                        self.$data.$setDirty(false);
                        self.$close();
                    } else if (result === 'save') {
                        // save then close
                        self.$save().then(function () {
                            self.$close();
                        })
                    }
                });
                return false;
            }
        },
        created() {
            store.$emit('registerData', this);
        },
        destroyed() {
            store.$emit('registerData', null);
        }
    });
    
    app.components['baseController'] = base;

})();