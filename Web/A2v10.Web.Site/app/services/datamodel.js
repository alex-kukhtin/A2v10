/*20171029-7060*/
/* services/datamodel.js */
(function () {

	"use strict";
    /* TODO:
    1. changing event
    4. add plain properties
    */
	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
    const ERRORS = '_errors_';

    const FLAG_VIEW = 1;
    const FLAG_EDIT = 2;
    const FLAG_DELETE = 4;

	const platform = require('std:platform');
	const validators = require('std:validators');
	const utils = require('std:utils');
	const log = require('std:log');

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
		if (type === Number) {
			return utils.toNumber(val);
		}
		return val;
	}

	function defSource(trg, source, prop, parent) {
		let propCtor = trg._meta_.props[prop];
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
                let srcval = source[prop] || null;
				shadow[prop] = srcval ? new Date(srcval) : utils.date.zero();
                break; 
            case TMarker: // marker for dynamic property
                let mp = trg._meta_.markerProps[prop];
                shadow[prop] = mp;
                break;
            default:
				shadow[prop] = new propCtor(source[prop] || null, pathdot + prop, trg);
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
				val = ensureType(this._meta_.props[prop], val);
				if (val === this._src_[prop])
					return;
				this._src_[prop] = val;
                this._root_.$setDirty(true);
                if (this._lockEvents_)
                    return; // events locked
				if (!this._path_)
					return;
				let eventName = this._path_ + '.' + prop + '.change';
				this._root_.$emit(eventName, this, val);
			}
		});
	}

    function TMarker() { }

    function createPrimitiveProperties(elem, ctor) {
        const templ = elem._root_.$template;
        if (!templ) return;
        const props = templ._props_;
        if (!props) return;
        let objname = ctor.name;
        if (objname in props) {
            for (let p in props[objname]) {
                let propInfo = props[objname][p];
                if (utils.isPrimitiveCtor(propInfo)) {
                    log.info(`create scalar property: ${objname}.${p}`);
                    elem._meta_.props[p] = propInfo;
                } else if (utils.isObjectExact(propInfo)) {
                    if (!propInfo.get) { // plain object
                        log.info(`create object property: ${objname}.${p}`);
                        elem._meta_.props[p] = TMarker;
                        if (!elem._meta_.markerProps)
                            elem._meta_.markerProps = {}
                        elem._meta_.markerProps[p] = propInfo;
                    }
                }
            }
        }
    }

	function createObjProperties(elem, ctor) {
		let templ = elem._root_.$template;
		if (!templ) return;
		let props = templ._props_;
		if (!props) return;
		let objname = ctor.name;
        if (objname in props) {
			for (let p in props[objname]) {
                let propInfo = props[objname][p];
                if (utils.isPrimitiveCtor(propInfo)) {
                    continue;
                }
                else if (utils.isFunction(propInfo)) {
                    log.info(`create property: ${objname}.${p}`);
                    Object.defineProperty(elem, p, {
                        configurable: false,
                        enumerable: true,
                        get: propInfo
                    });
                } else if (utils.isObjectExact(propInfo)) {
                    if (propInfo.get) { // has get, maybe set
                        log.info(`create property: ${objname}.${p}`);
                        Object.defineProperty(elem, p, {
                            configurable: false,
                            enumerable: true,
                            get: propInfo.get,
                            set: propInfo.set
                        });
                    }
                } else {
                    alert('todo: invalid property type');
                }
			}
		}
	}

	function createObject(elem, source, path, parent) {
		const ctorname = elem.constructor.name;
		let startTime = null;
		if (ctorname === 'TRoot')
			startTime = performance.now();
		parent = parent || elem;
		defHidden(elem, SRC, {});
		defHidden(elem, PATH, path);
		defHidden(elem, ROOT, parent._root_ || parent);
		defHidden(elem, PARENT, parent);
		defHidden(elem, ERRORS, null, true);
        defHidden(elem, '_lockEvents_', 0, true);

        let hasTemplProps = false;
        const templ = elem._root_.$template;
        if (templ && !utils.isEmptyObject(templ._props_))
            hasTemplProps = true;

        if (hasTemplProps)
            createPrimitiveProperties(elem, elem.constructor);

		for (let propName in elem._meta_.props) {
			defSource(elem, source, propName, parent);
        }

        if (hasTemplProps)
            createObjProperties(elem, elem.constructor);

		defPropertyGet(elem, "$valid", function () {
			if (this._root_._needValidate_)
                this._root_._validateAll_();
			if (this._errors_)
				return false;
			for (var x in this) {
				if (x[0] === '$' || x[0] === '_')
					continue;
				let sx = this[x];
				if (utils.isObject(sx) && '$valid' in sx) {
					let sx = this[x];
					if (!sx.$valid)
						return false;
				}
			}
			return true;
		});
		defPropertyGet(elem, "$invalid", function () {
			return !this.$valid;
        });

		let constructEvent = ctorname + '.construct';
		elem._root_.$emit(constructEvent, elem);
		if (elem._root_ === elem) {
			// root element
			elem._root_ctor_ = elem.constructor;
			elem.$dirty = false;
			elem._query_ = {};
			// rowcount implementation
			for (var m in elem._meta_.props) {
                let rcp = m + '.$RowCount';
				if (source && rcp in source) {
					let rcv = source[rcp] || 0;
					elem[m].$RowCount = rcv;
				}
			}
			elem._enableValidate_ = true;
            elem._needValidate_ = false;
            elem._modelLoad_ = (caller) => {
                elem.$emit('Model.load', elem, caller);
                elem._root_.$setDirty(false);
            };
            defHiddenGet(elem, '$readOnly', isReadOnly);
		}
        if (startTime) {
            log.time('create root time:', startTime, false);
        }
		return elem;
    }

    function isReadOnly() {
        if ('__modelInfo' in this) {
            let mi = this.__modelInfo;
            if (utils.isDefined(mi.Permissions))
                return mi.Permissions & FLAG_EDIT ? false : true;
        }
        return false;
    }

	function createArray(source, path, ctor, arrctor, parent) {
        let arr = new _BaseArray(source ? source.length : 0);
		let dotPath = path + '[]';
		defHidden(arr, '_elem_', ctor);
		defHidden(arr, PATH, path);
		defHidden(arr, PARENT, parent);
		defHidden(arr, ROOT, parent._root_ || parent);

		defPropertyGet(arr, "$valid", function () {
			if (this._errors_)
				return false;
			for (var x of this) {
				if (x._errors_)
					return false;
			}
			return true;
		});
		defPropertyGet(arr, "$invalid", function () {
			return !this.$valid;
		});


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

	defineCommonProps(_BaseArray.prototype);

	_BaseArray.prototype.$new = function (src) {
		let newElem = new this._elem_(src || null, this._path_ + '[]', this);
		newElem.$checked = false;
		return newElem;
	};

	defPropertyGet(_BaseArray.prototype, "Count", function () {
		return this.length;
	});

    defPropertyGet(_BaseArray.prototype, "$isEmpty", function () {
        return !this.length;
    });

    defPropertyGet(_BaseArray.prototype, "$checked", function () {
        return this.filter((el) => el.$checked);
    });

	_BaseArray.prototype.$append = function (src) {
		let addingEvent = this._path_ + '[].adding';
		let newElem = this.$new(src);
		// TODO: emit adding and check result
		let er = this._root_.$emit(addingEvent, this/*array*/, newElem/*elem*/);
		if (er === false)
			return; // disabled
		let len = this.push(newElem);
		let ne = this[len - 1]; // maybe newly created reactive element
		let eventName = this._path_ + '[].add';
		this._root_.$setDirty(true);
		this._root_.$emit(eventName, this /*array*/, ne /*elem*/, len - 1 /*index*/);
		platform.set(this, "$selected", ne);
		// set RowNumber
		if ('$rowNo' in newElem._meta_) {
			let rowNoProp = newElem._meta_.$rowNo;
			newElem[rowNoProp] = len; // 1-based
		}
		return ne;
	};

    _BaseArray.prototype.$empty = function () {
        if (this.$root.isReadOnly)
            return;
		this.splice(0, this.length);
		return this;
	};

    _BaseArray.prototype.$clearSelected = function () {
        platform.set(this, '$selected', null);
    };

	_BaseArray.prototype.$remove = function (item) {
		if (!item)
			return;
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
		// renumber rows
		if ('$rowNo' in item._meta_) {
			let rowNoProp = item._meta_.$rowNo;
			for (let i = 0; i < this.length; i++) {
				this[i][rowNoProp] = i + 1; // 1-based
			}
		}
	};

	_BaseArray.prototype.$copy = function (src) {
        if (this.$root.isReadOnly)
            return;
		this.$empty();
		if (utils.isArray(src)) {
			for (let i = 0; i < src.length; i++) {
				this.push(this.$new(src[i]));
			}
		}
		return this;
	};

	function defineCommonProps(obj) {
		defHiddenGet(obj, "$host", function () {
			return this._root_._host_;
		});

		defHiddenGet(obj, "$root", function () {
			return this._root_;
		});

		defHiddenGet(obj, "$parent", function () {
			return this._parent_;
		});

        defHiddenGet(obj, "$vm", function () {
            if (this._root_ && this._root_._host_)
                return this._root_._host_.$viewModel;
            return null;
		});
	}

	function defineObject(obj, meta, arrayItem) {
		defHidden(obj.prototype, META, meta);

        obj.prototype.$merge = merge;
        obj.prototype.$empty = empty;

		defineCommonProps(obj.prototype);

		defHiddenGet(obj.prototype, "$isNew", function () {
			return !this.$id;
		});

        defHiddenGet(obj.prototype, "$isEmpty", function () {
            return !this.$id;
        });

		defHiddenGet(obj.prototype, "$id", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				let tpname = this.constructor.name;
				throw new Error(tpname + ' object does not have an Id property');
			}
			return this[idName];
		});

		defHiddenGet(obj.prototype, "$name", function () {
			let nameName = this._meta_.$name;
			if (!nameName) {
				let tpname = this.constructor.name;
				throw new Error(tpname + ' object does not have a Name property');
			}
			return this[nameName];
		});

		if (arrayItem) {
			defArrayItem(obj);
		}

		if (meta.$hasChildren) {
			defHiddenGet(obj.prototype, "$hasChildren", function () {
				let hcName = this._meta_.$hasChildren;
				if (!hcName) return undefined;
				return this[hcName];
			});
		}
		if (meta.$items) {
			defHiddenGet(obj.prototype, "$items", function () {
				let itmsName = this._meta_.$items;
				if (!itmsName) return undefined;
				return this[itmsName];
			});
		}
	}

	function defArrayItem(elem) {
		elem.prototype.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};
		elem.prototype.$select = function (root) {
			let arr = root || this._parent_;
			if (arr.$selected === this)
				return;
			platform.set(arr, "$selected", this);
		};

		elem.prototype.$isSelected = function (root) {
			let arr = root || this._parent_;
			return arr.$selected === this;

		};
	}

	function emit(event, ...arr) {
		if (this._enableValidate_) {
			if (!this._needValidate_) {
				this._needValidate_ = true;
			}
		}
		log.info('emit: ' + event);
		let templ = this.$template;
		if (!templ) return;
		let events = templ.events;
		if (!events) return;
		if (event in events) {
			// fire event
			log.info('handle: ' + event);
			let func = events[event];
			let rv = func.call(undefined, ...arr);
			if (rv === false)
				log.info(event + ' returns false');
			return rv;
		}
	}

	function getDelegate(name) {
		let tml = this.$template;
		if (!tml.delegates) {
			console.error('There are no delegates in the template');
			return null;
		}
		if (name in tml.delegates) {
			return tml.delegates[name];
		}
		console.error(`Delegate "${name}" not found in the template`);
	}

    function canExecuteCommand(cmd, ...args) {
        let tml = this.$template;
        if (tml && tml.commands) {
            let cmdf = tml.commands[cmd];
            if (cmdf && utils.isFunction(cmdf.canExec)) {
                return cmdf.canExec.apply(this, args);
            }
            return true;
        }
        return false;
    }

	function executeCommand(cmd, ...args) {
		try {
			this._root_._enableValidate_ = false;
			let tml = this.$template;
			if (tml && tml.commands) {
				let cmdf = tml.commands[cmd];
				if (typeof cmdf === 'function') {
					cmdf.apply(this, args);
                    return;
                } else if (utils.isObjectExact(cmdf)) {
                    if (utils.isFunction(cmdf.canExec))
                        if (!cmdf.canExec.apply(this, args))
                            return;
                    if (cmdf.confirm) {
                        let vm = this.$vm;
                        vm.$confirm(cmdf.confirm)
                            .then(() => cmdf.exec.apply(this, args));
                    } else {
                        cmdf.exec.apply(this, args);
                    }
                    return;
                }
			}
			console.error(`command "${cmd}" not found`);
		} finally {
			this._root_._enableValidate_ = true;
            this._root_._needValidate_ = true;
		}
	}

    function validateImpl(item, path, val, du) {
		if (!item) return null;
		let tml = item._root_.$template;
		if (!tml) return null;
		var vals = tml.validators;
		if (!vals) return null;
		var elemvals = vals[path];
		if (!elemvals) return null;
		return validators.validate(elemvals, item, val, du);
	}

    function saveErrors(item, path, errors) {
		if (!item._errors_ && !errors)
			return; // already null
		else if (!item._errors_ && errors)
            item._errors_ = {}; // new empty object
        if (errors && errors.length > 0)
			item._errors_[path] = errors;
		else if (path in item._errors_)
            delete item._errors_[path];
		if (utils.isEmptyObject(item._errors_))
			item._errors_ = null;
		return errors;
	}

	function validate(item, path, val, ff) {
		if (!item._root_._needValidate_) {
			// already done
			if (!item._errors_)
				return null;
			if (path in item._errors_)
				return item._errors_[path];
			return null;
        }
		let res = validateImpl(item, path, val, ff);
		return saveErrors(item, path, res);
	}

	function* enumData(root, path, name, index) {
		if (!path) {
			// scalar value in root
			yield { item: root, val: root[name], ix: index };
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
				if (!(pname in currentData)) {
					console.error(`Invalid validator key. Property '${pname}' not found in '${currentData.constructor.name}'`);
				}
				let objto = currentData[pname];
				if (!objto) continue;
				for (let j = 0; j < objto.length; j++) {
					let arrItem = objto[j];
					if (last) {
						yield { item: arrItem, val: arrItem[name], ix: index + ':' + j };
					} else {
						let newpath = sp.slice(i + 1).join('.');
						yield* enumData(arrItem, newpath, name, index + ':' + j);
					}
				}
				return;
			} else {
                // simple element
                if (!(prop in currentData)) {
                    console.error(`Invalid Validator key. property '${prop}' not found in '${currentData.constructor.name}'`);
                }
                let objto = currentData[prop];
				if (last) {
					if (objto)
						yield { item: objto, val: objto[name], ix: index };
					return;
				}
				else {
					currentData = objto;
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
		yield* enumData(root, dp, dn, '');
	}

	function validateOneElement(root, path, vals) {
		if (!vals)
			return;
		let errs = [];
		for (let elem of dataForVal(root, path)) {
			let res = validators.validate(vals, elem.item, elem.val);
			saveErrors(elem.item, path, res);
			if (res && res.length) {
				errs.push(...res);
				// elem.ix - индексы в массивах, по которым мы прохoдили
				// console.dir(elem.ix);
			}

		}
		return errs.length ? errs : null;
	}

	function validateAll() {
		var me = this;
        if (!me._host_) return;
        if (!me._needValidate_) return;
        me._needValidate_ = false;
		var startTime = performance.now();
		let tml = me.$template;
		if (!tml) return;
		let vals = tml.validators;
		if (!vals) return;
		let allerrs = [];
		for (var val in vals) {
			let err1 = validateOneElement(me, val, vals[val]);
			if (err1) {
				allerrs.push({ x: val, e: err1 });
			}
		}
		var e = performance.now();
		log.time('validation time:', startTime);
		//console.dir(allerrs);
	}

    function setDirty(val) {
        if (this.$root.$readOnly)
            return;
		this.$dirty = val;
	}

    function empty() {
        if (this.$root.isReadOnly)
            return;
        // ctor(source path parent)
        let newElem = new this.constructor({}, '', this._parent_);
        this.$merge(newElem, true); // with event
    }

	function merge(src, fireChange) {
		try {
            this._root_._enableValidate_ = false;
            this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				let ctor = this._meta_.props[prop];
				let trg = this[prop];
				if (Array.isArray(trg)) {
					platform.set(trg, "$selected", null);
					trg.$copy(src[prop]);
					// copy rowCount
                    if ('$RowCount' in trg) {
						let rcProp = prop + '.$RowCount';
						if (rcProp in src)
							trg.$RowCount = src[rcProp] || 0;
						else
							trg.$RowCount = 0;
					}
					// try to select old value
				} else {
					if (utils.isPrimitiveCtor(ctor))
						platform.set(this, prop, src[prop]);
					else {
						let newsrc = new ctor(src[prop], prop, this);
						platform.set(this, prop, newsrc);
					}
				}
			}
		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
            this._lockEvents_ -= 1;
        }
        if (fireChange) {
            // emit .change event for all object
            let eventName = this._path_ + '.change';
            this._root_.$emit(eventName, this.$parent, this);
        }
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$merge = merge;
		root.prototype.$template = template;
        root.prototype._exec_ = executeCommand;
        root.prototype._canExec_ = canExecuteCommand;
		root.prototype._delegate_ = getDelegate;
		root.prototype._validate_ = validate;
		root.prototype._validateAll_ = validateAll;
		// props cache for t.construct
		if (!template) return;
		let xProp = {};
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

	function setModelInfo(root, info) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: 20
		};
	}

	app.modules['datamodel'] = {
		createObject: createObject,
		createArray: createArray,
		defineObject: defineObject,
		implementRoot: implementRoot,
		setModelInfo: setModelInfo,
		enumData: enumData
	};
})();