﻿/* Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.*/

/*20250525-7986*/
// services/datamodel.js

/*
 * TODO: template & validate => /impl
 * treeImpl => /impl/tree
 */

(function () {

	"use strict";

	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
	const ERRORS = '_errors_';
	const ROWCOUNT = '$RowCount';

	const ERR_STR = '#err#';

	const FLAG_VIEW = 1;
	const FLAG_EDIT = 2;
	const FLAG_DELETE = 4;
	const FLAG_APPLY = 8;
	const FLAG_UNAPPLY = 16;
	const FLAG_CREATE = 32;
	const FLAG_64 = 64;
	const FLAG_128 = 128;
	const FLAG_256 = 256;

	const platform = require('std:platform');
	const validators = require('std:validators');
	const utils = require('std:utils');
	const log = require('std:log', true);
	const period = require('std:period');
	const mitool = require('std:modelInfo');
	const arrtool = require('std:impl:array');

	let __initialized__ = false;

	function loginfo(msg) {
		if (!log) return;
		log.info(msg);
	}

	function logtime(msg, time) {
		if (!log) return;
		log.time(msg, time);
	}

	function createPermissionObject(perm) {
		return Object.freeze({
			canView: !!(perm & FLAG_VIEW),
			canEdit: !!(perm & FLAG_EDIT),
			canDelete: !!(perm & FLAG_DELETE),
			canApply: !!(perm & FLAG_APPLY),
			canUnapply: !!(perm & FLAG_UNAPPLY),
			canCreate: !!(perm & FLAG_CREATE),
			canFlag64: !!(perm & FLAG_64),
			canFlag128: !!(perm & FLAG_128),
			canFlag256: !!(perm & FLAG_256)
		});
	}

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

	const defPropertyGet = utils.func.defPropertyGet;

	const propFromPath = utils.model.propFromPath;

	function defSource(trg, source, prop, parent) {

		let propCtor = trg._meta_.props[prop];
		if (propCtor.type) propCtor = propCtor.type;
		let pathdot = trg._path_ ? trg._path_ + '.' : '';
		let shadow = trg._src_;
		source = source || {};
		if (utils.isObjectExact(propCtor)) {
			//console.warn(`${prop}:${propCtor.len}`);
			if ("type" in propCtor)
				propCtor = propCtor.type;
			else
				throw new Error(`Invalid _meta_ for '${prop}'`);
		}
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
				shadow[prop] = srcval ? utils.date.fromServer(srcval) : utils.date.zero();
				break;
			case platform.File:
			case Object:
				shadow[prop] = null;
				break;
			case TMarker: // marker for dynamic property
				let mp = trg._meta_.markerProps[prop];
				if (utils.isDefined(mp.type) && utils.isDefined(mp.value))
					shadow[prop] = mp.value;
				else
					shadow[prop] = mp;
				break;
			case period.constructor:
				shadow[prop] = new propCtor(source[prop]);
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
				let eventWasFired = false;
				let skipDirty = prop.startsWith('$$');
				let ctor = this._meta_.props[prop];
				let isjson = false;
				if (ctor.type) {
					isjson = !!ctor.json;
					ctor = ctor.type;
				}
				if (!isjson) {
					val = utils.ensureType(ctor, val);
				}
				if (val === this._src_[prop])
					return;
				let oldVal = this._src_[prop];
				if (!this._lockEvents_) {
					let changingEvent = (this._path_ || 'Root') + '.' + prop + '.changing';
					let ret = this._root_.$emit(changingEvent, this, val, oldVal, prop);
					if (ret === false)
						return;
				}
				if (this._src_[prop] && this._src_[prop].$set) {
					// object
					this._src_[prop].$set(val);
					eventWasFired = true; // already fired
				} else {
					this._src_[prop] = val;
				}
				if (!skipDirty) // skip special properties
					this._root_.$setDirty(true, this._path_, prop);
				if (this._lockEvents_) return; // events locked
				if (eventWasFired) return; // was fired
				let eventName = (this._path_ || 'Root') + '.' + prop + '.change';
				this._root_.$emit(eventName, this, val, oldVal, prop);
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
				if (!propInfo) continue;
				if (utils.isPrimitiveCtor(propInfo)) {
					loginfo(`create scalar property: ${objname}.${p}`);
					elem._meta_.props[p] = propInfo;
				} else if (utils.isObjectExact(propInfo)) {
					if (!propInfo.get) { // plain object
						loginfo(`create object property: ${objname}.${p}`);
						elem._meta_.props[p] = TMarker;
						if (!elem._meta_.markerProps)
							elem._meta_.markerProps = {};
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
				if (!propInfo) continue;
				if (utils.isPrimitiveCtor(propInfo)) {
					continue;
				}
				else if (utils.isFunction(propInfo)) {
					loginfo(`create property: ${objname}.${p}`);
					Object.defineProperty(elem, p, {
						configurable: false,
						enumerable: true,
						get: propInfo
					});
				} else if (utils.isObjectExact(propInfo)) {
					if (propInfo.get) { // has get, maybe set
						loginfo(`create property: ${objname}.${p}`);
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

	function addTreeMethods(elem) {
		elem.$expand = function () {
			if (!this._meta_.$items) return null;
			if (this.$expanded) return null;
			let coll = this[this._meta_.$items];
			return this.$vm.$expand(this, this._meta_.$items, true);
		};
		elem.$findTreeRoot = function () {
			let p = this;
			let r = null;
			while (p && p !== this.$root) {
				if (p._meta_ && p._meta_.$items)
					r = p;
				p = p._parent_;
			}
			return r ? r._parent_ : null;
		};
		elem.$selectPath = async function (arr, cb) {
			if (!arr.length) return null;
			let itemsProp = this._meta_.$items;
			if (!itemsProp) return null;
			let current = null;
			if (cb(this, arr[0]))
				current = this;
			for (let i = 1 /*second*/; i < arr.length; i++) {
				if (!current) return null;
				await current.$expand();
				current = current[itemsProp].$find(itm => cb(itm, arr[i]));
			}
			return current;
		}
	}

	function createObject(elem, source, path, parent) {
		const ctorname = elem.constructor.name;
		let startTime = null;
		if (ctorname === 'TRoot')
			startTime = platform.performance.now();
		parent = parent || elem;
		defHidden(elem, SRC, {});
		defHidden(elem, PATH, path || '');
		defHidden(elem, ROOT, parent._root_ || parent);
		defHidden(elem, PARENT, parent);
		defHidden(elem, ERRORS, null, true);
		defHidden(elem, '_lockEvents_', 0, true);
		elem._uiprops_ = {}; // observable!

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

		if (path && path.endsWith(']'))
			elem.$selected = false;

		if (elem._meta_.$items) {
			let exp = false;
			let clps = false;
			if (elem._meta_.$expanded) {
				let val = source[elem._meta_.$expanded];
				exp = !!val;
				clps = !val;
			}
			elem.$expanded = exp; // tree elem
			elem.$collapsed = clps; // sheet elem
			elem.$level = 0;
			addTreeMethods(elem);
		}

		elem.$lockEvents = function () {
			this._lockEvents_ += 1;
		};

		elem.$unlockEvents = function () {
			this._lockEvents_ -= 1;
		};

		defHiddenGet(elem, '$eventsLocked', function () {
			return this._lockEvents_ > 0;
		});

		defPropertyGet(elem, '$valid', function () {
			if (this._root_._needValidate_)
				this._root_._validateAll_();
			if (this._errors_)
				return false;
			for (var x in this) {
				if (x[0] === '$' || x[0] === '_')
					continue;
				let sx = this[x];
				if (utils.isArray(sx)) {
					for (let i = 0; i < sx.length; i++) {
						let ax = sx[i];
						if (utils.isObject(ax) && '$valid' in ax) {
							if (!ax.$valid)
								return false;
						}
					}
				} else if (utils.isObject(sx) && '$valid' in sx) {
					if (!sx.$valid)
						return false;
				}
			}
			return true;
		});
		defPropertyGet(elem, "$invalid", function () {
			return !this.$valid;
		});

		elem.$errors = function (prop) {
			if (!this) return null;
			let root = this._root_;
			if (!root) return null;
			if (!root._validate_)
				return null;
			let path = `${this._path_}.${prop}`; 
			let arr = root._validate_(this, path, this[prop]);
			if (arr && arr.length === 0) return null;
			return arr;
		};
		
		if (elem._meta_.$group === true) {
			defPropertyGet(elem, "$groupName", function () {
				if (!utils.isDefined(this.$level))
					return ERR_STR;
				// !!! $level присваивается только в TreeSection!
				// this.constructor.name == objectType;
				const mi = this._root_.__modelInfo.Levels;
				if (mi) {
					const levs = mi[this.constructor.name];
					if (levs && this.$level <= levs.length) {
						let xv = this[levs[this.$level - 1]];
						if (!xv) return '';
						if (utils.isObjectExact(xv))
							return xv.$name;
						else if (utils.isDate(xv))
							return utils.format(xv, 'Date');
						return xv;
					}
				}
				console.error('invalid data for $groupName');
				return ERR_STR;
			});
		}

		if (elem._meta_.$itemType) {
			elem.$setProperty = function (prop, src) {
				let itmPath = path + '.' + prop;
				let ne = new elem._meta_.$itemType(src, itmPath, elem);
				platform.set(this, prop, ne);
				this._root_.$setDirty(true);
				return ne;
			};
		}

		function setDefaults(root) {
			if (!root.$template || !root.$template.defaults) return false;
			if (root.$isCopy) return false;
			let called;
			for (let p in root.$template.defaults) {
				let px = p.lastIndexOf('.');
				if (px === -1)
					continue;
				let path = p.substring(0, px);
				let prop = p.substring(px + 1);
				if (prop.endsWith('[]'))
					continue;
				let def = root.$template.defaults[p];
				let obj = utils.simpleEval(root, path);
				if (obj.$isNew) {
					called = true;
					if (utils.isFunction(def))
						platform.set(obj, prop, def.call(root, obj, prop));
					else
						platform.set(obj, prop, def);
				}
			}
			return called;
		}

		let constructEvent = ctorname + '.construct';
		let _lastCaller = null;
		let propForConstruct = path ? propFromPath(path) : '';
		elem._root_.$emit(constructEvent, elem, propForConstruct);

		if (elem._root_ === elem) {
			// root element
			elem._root_ctor_ = elem.constructor;
			elem.$dirty = false;
			elem._query_ = {};
			elem._allErrors_ = [];

			// rowcount implementation
			for (var m in elem._meta_.props) {
				let rcp = m + '.$RowCount';
				if (source && rcp in source) {
					let rcv = source[rcp] || 0;
					elem[m].$RowCount = rcv;
				}
			}
			mitool.setModelInfoForRoot(elem);

			elem._setRuntimeInfo_ = setRootRuntimeInfo;

			elem._saveSelections = saveSelections;
			elem._restoreSelections = restoreSelections;

			elem._enableValidate_ = true;
			elem._needValidate_ = false;

			elem._modelLoad_ = (caller) => {
				_lastCaller = caller;
				elem._setDefaults_();
				elem._fireLoad_();
				__initialized__ = true;
			};

			elem._setDefaults_ = () => {
				if (setDefaults(elem))
					elem.$emit('Model.defaults', elem);
			};

			elem._fireLoad_ = () => {
				platform.defer(() => {
					if (!elem.$vm) return;
					let isRequery = elem.$vm.__isModalRequery();
					elem.$emit('Model.load', elem, _lastCaller, isRequery);
					elem._root_.$setDirty(elem._root_.$isCopy ? true : false);
				});
			};
			elem._fireUnload_ = () => {
				elem.$emit('Model.unload', elem);
			};

			defHiddenGet(elem, '$readOnly', isReadOnly);
			defHiddenGet(elem, '$stateReadOnly', isStateReadOnly);
			defHiddenGet(elem, '$isCopy', isModelIsCopy);
			defHiddenGet(elem, '$mainObject', mainObject);

			elem._seal_ = seal;

			elem._fireGlobalPeriodChanged_ = (period) => {
				elem.$emit('GlobalPeriod.change', elem, period);
			};
			elem._fireGlobalAppEvent_ = (ev) => {
				elem.$emit(ev.event, ev.data);
			}
			elem._fireSignalAppEvent_ = (ev) => {
				elem.$emit("Signal." + ev.event, ev.data);
			}
		}
		if (startTime) {
			logtime('create root time:', startTime, false);
		}
		return elem;
	}

	function seal(elem) {
		Object.seal(elem);
		if (!elem._meta_) return;
		for (let p in elem._meta_.props) {
			let ctor = elem._meta_.props[p];
			if (ctor.type) ctor = ctor.type;
			if (utils.isPrimitiveCtor(ctor)) continue;
			if (ctor === period.constructor) continue;
			let val = elem[p];
			if (utils.isArray(val)) {
				val.forEach(itm => seal(itm));
			} else if (utils.isObjectExact(val)) {
				seal(val);
			}
		}
	}

	function isReadOnly() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.ReadOnly) && mi.ReadOnly)
				return true;
			if (utils.isDefined(mi.StateReadOnly) && mi.StateReadOnly)
				return true;
		}
		return false;
	}

	function isStateReadOnly() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.StateReadOnly) && mi.StateReadOnly)
				return true;
		}
		return false;
	}

	function mainObject() {
		if ('$main' in this._meta_) {
			let mainProp = this._meta_.$main;
			return this[mainProp];
		}
		return null;
	}

	function isModelIsCopy() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.Copy))
				return mi.Copy;
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

		defPropertyGet(arr, "$permissions", function () {
			let mi = arr.$ModelInfo;
			if (!mi || !utils.isDefined(mi.Permissions))
				return {};
			let perm = mi.Permissions;
			return createPermissionObject(perm);
		});

		if (ctor.prototype._meta_.$cross)
			defPropertyGet(arr, "$cross", function () {
				return ctor.prototype._meta_.$cross;
			});

		createObjProperties(arr, arrctor);

		let constructEvent = arrctor.name + '.construct';
		arr._root_.$emit(constructEvent, arr);

		if (!source)
			return arr;
		for (let i = 0; i < source.length; i++) {
			arr[i] = new arr._elem_(source[i], dotPath, arr);
			arr[i].__checked = false;
		}
		return arr;
	}

	function _BaseArray(length) {
		let arr = new Array(length || 0);
		addArrayProps(arr);
		return arr;
	}

	function addArrayProps(arr) {

		defineCommonProps(arr);
		arrtool.defineArray(arr);
		arr.__fireChange__ = function (opts) {
			let root = this.$root;
			let itm = this;
			if (opts === 'selected')
				itm = this.$selected;
			root.$emit(this._path_ + '[].change', this, itm);
		};
	}

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

		defHiddenGet(obj, "$ctrl", function () {
			if (this._root_ && this._root_._host_)
				return this._root_._host_.$ctrl;
			return null;
		});

		defHiddenGet(obj, "$ready", function () {
			if (!this.$vm) return true;
			return !this.$vm.$isLoading;
		});

		obj.$isValid = function (props) {
			return true;
		};
	}

	function defineObject(obj, meta, arrayItem) {
		defHidden(obj.prototype, META, meta);

		obj.prototype.$merge = merge;
		obj.prototype.$empty = empty;
		obj.prototype.$set = setElement;
		obj.prototype.$maxLength = getMaxLength;

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

		defHiddenGet(obj.prototype, "$id__", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				return undefined;
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

		if (arrayItem) 
			defArrayItem(obj);

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
		if (meta.$permissions) {
			defHiddenGet(obj.prototype, "$permissions", function () {
				let permName = this._meta_.$permissions;
				if (!permName) return undefined;
				var perm = this[permName];
				if (this.$isNew && perm === 0) {
					let mi = this.$ModelInfo;
					if (mi && utils.isDefined(mi.Permissions))
						perm = mi.Permissions;
				}
				return createPermissionObject(perm);
			});
		}
	}

	function defArrayItem(elem) {

		arrtool.defineArrayItemProto(elem);

		Object.defineProperty(elem.prototype, '$checked', {
			enumerable: true,
			configurable: true, /* needed */
			get() {
				return this.__checked;
			},
			set(val) {
				this.__checked = val;
				let arr = this.$parent;
				let checkEvent = arr._path_ + '[].check';
				arr._root_.$emit(checkEvent, arr/*array*/, this);
			}
		});
	}

	function emit(event, ...arr) {
		if (this._enableValidate_) {
			if (!this._needValidate_) {
				this._needValidate_ = true;
			}
		}
		loginfo('emit: ' + event);
		let templ = this.$template;
		if (!templ) return;
		let events = templ.events;
		if (!events) return;
		if (event in events) {
			// fire event
			loginfo('handle: ' + event);
			let func = events[event];
			let rv = func.call(this, ...arr);
			if (rv === false)
				loginfo(event + ' returns false');
			return rv;
		}
	}

	function getGlobalSaveEvent() {
		let tml = this.$template;
		if (!tml) return undefined;
		let opts = tml.options;
		if (!opts) return undefined;
		return opts.globalSaveEvent;

	}
	function getDelegate(name) {
		let tml = this.$template;
		if (!tml || !tml.delegates) {
			console.error('There are no delegates in the template');
			return null;
		}
		if (name in tml.delegates) {
			return tml.delegates[name].bind(this.$root);
		}
		console.error(`Delegate "${name}" not found in the template`);
	}

	function canExecuteCommand(cmd, arg, opts) {
		const tml = this.$template;
		if (!tml) return false;
		if (!tml.commands) return false;
		const cmdf = tml.commands[cmd];
		if (!cmdf) return false;

		const optsCheckValid = opts && opts.validRequired === true;
		const optsCheckRO = opts && opts.checkReadOnly === true;
		const optsCheckArg = opts && opts.checkArgument === true;

		if (optsCheckArg && !arg)
			return false;

		if (cmdf.checkReadOnly === true || optsCheckRO) {
			if (this.$root.$readOnly)
				return false;
		}
		if (cmdf.validRequired === true || optsCheckValid) {
			if (!this.$root.$valid)
				return false;
		}
		if (utils.isFunction(cmdf.canExec)) {
			return cmdf.canExec.call(this, arg);
		} else if (utils.isBoolean(cmdf.canExec)) {
			return cmdf.canExec; // for debugging purposes
		} else if (utils.isDefined(cmdf.canExec)) {
			console.error(`${cmd}.canExec should be a function`);
			return false;
		}
		return true;
	}

	function executeCommand(cmd, arg, confirm, opts) {
		try {
			this._root_._enableValidate_ = false;
			let vm = this.$vm;
			const tml = this.$template;
			if (!tml) return;
			if (!tml.commands) return;
			let cmdf = tml.commands[cmd];
			if (!cmdf) {
				console.error(`Command "${cmd}" not found`);
				return;
			}
			const optConfirm = cmdf.confirm || confirm;
			const optSaveRequired = cmdf.saveRequired || opts && opts.saveRequired;
			const optValidRequired = cmdf.validRequired || opts && opts.validRequired;

			if (optValidRequired && !vm.$data.$valid) return; // not valid

			if (utils.isFunction(cmdf.canExec)) {
				if (!cmdf.canExec.call(this, arg)) return;
			}

			let that = this;
			const doExec = function () {
				const realExec = function () {
					if (utils.isFunction(cmdf))
						return cmdf.call(that, arg);
					else if (utils.isFunction(cmdf.exec))
						return cmdf.exec.call(that, arg);
					else
						console.error($`There is no method 'exec' in command '${cmd}'`);
				};

				if (optConfirm) {
					vm.$confirm(optConfirm).then(realExec);
				} else {
					return realExec();
				}
			};

			if (optSaveRequired && vm.$isDirty)
				vm.$save().then(doExec);
			else
				return doExec();

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
		index = index || '';
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
				// elem.ix - array indexes
				// console.dir(elem.ix);
			}

		}
		return errs.length ? errs : null;
	}

	function revalidateItem(itm, valname) {
		this.$defer(() => {
			validators.revalidate(itm, valname, this.$template);
			this._needValidate_ = true;
			this._validateAll_(false);
		});
	}

	function forceValidateAll() {
		let me = this;
		me._needValidate_ = true;
		var retArr = me._validateAll_(false);
		me._validateAll_(true); // and validate async again
		return retArr;

	}

	function hasErrors(props) {
		if (!props || !props.length) return false;
		let errs = this._allErrors_;
		if (!errs.length) return false;
		for (let i = 0; i < errs.length; i++) {
			let e = errs[i];
			if (props.some(p => p === e.x))
				return true;
		}
		return false;
	}

	function collectErrors() {
	}

	function validateAll(force) {
		var me = this;
		if (!me._host_) return;
		if (!me._needValidate_) return;
		me._needValidate_ = false;
		if (force)
			validators.removeWeak();
		var startTime = platform.performance.now();
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
		logtime('validation time:', startTime);
		// merge allerrs into
		// sync arrays:
		// if me._allErrors_[i] not found in allerrs => remove it
		let i = me._allErrors_.length;
		while (i--) {
			let a = me._allErrors_[i];
			if (!allerrs.find(n => n.x === a.x))
				me._allErrors_.splice(i, 1);
		}
		// if allerrs[i] not found in me._allErrors_ => append it
		allerrs.forEach(n => {
			if (!me._allErrors_.find(a => a.x === n.x))
				me._allErrors_.push(n);
		});



		return allerrs;
		//console.dir(allerrs);
	}

	function setDirty(val, path, prop) {
		if (val === this.$dirty) return;
		if (this.$root.$readOnly)
			return;
		this.$root.$emit('Model.dirty.change', val, `${path}.${prop}`);
		if (this.$vm && this.$vm.isIndex)
			return;
		if (isNoDirty(this.$root))
			return;
		if (path && path.toLowerCase().startsWith('query'))
			return;
		if (path && prop && isSkipDirty(this.$root, `${path}.${prop}`))
			return;
		this.$dirty = val;
	}

	function empty() {
		this.$set({});
		return this;
	}

	function setElement(src) {
		if (this.$root.isReadOnly)
			return;
		this.$merge(src);
	}

	function getMaxLength(prop) {
		let m = this._meta_.props;
		if (!m) return undefined;
		let x = m[prop];
		if (utils.isObjectExact(x))
			return x.len;
		return undefined;
	}

	function isSkipMerge(root, prop) {
		let t = root.$template;
		let opts = t && t.options;
		let bo = opts && opts.bindOnce;
		if (!bo) return false;
		return bo.indexOf(prop) !== -1;
	}

	function isNoDirty(root) {
		let t = root.$template;
		let opts = t && t.options;
		return opts && opts.noDirty;
	}

	function isSkipDirty(root, path) {
		let t = root.$template;
		const opts = t && t.options;
		if (!opts) return false;
		const sd = opts.skipDirty;
		if (!sd || !utils.isArray(sd)) return false;
		return sd.indexOf(path) !== -1;
	}

	function saveSelections() {
		let root = this;
		let t = root.$template;
		let opts = t && t.options;
		if (!opts) return;
		let ps = opts.persistSelect;
		if (!ps || !ps.length) return;
		let result = {};
		for (let p of ps) {
			let arr = utils.simpleEval(root, p);
			if (utils.isObject(arr) && '$selected' in arr) {
				let sel = arr.$selected;
				if (sel)
					result[p] = sel.$id;
			}
		}
		return result;
	}


	function restoreSelections(sels) {
		if (!sels) return;
		let root = this;
		for (let p in sels) {
			let arr = utils.simpleEval(root, p);
			let selId = sels[p];
			if ('$find' in arr) {
				let se = arr.$find(x => x.$id === selId);
				if (se)
					se.$select();
			}
		}
	}

	function merge(src, checkBindOnce, existsOnly) {
		let oldId = this.$id__;
		try {
			if (src === null)
				src = {};
			this._root_._enableValidate_ = false;
			this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				if (prop.startsWith('$$')) continue; // always skip
				if (checkBindOnce && isSkipMerge(this._root_, prop)) continue;
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				let trg = this[prop];
				if (Array.isArray(trg)) {
					if (trg.$loaded)
						trg.$loaded = false; // may be lazy
					if ('$copy' in trg)
						trg.$copy(src[prop]);
					// copy rowCount
					if (ROWCOUNT in trg) {
						let rcProp = prop + '.$RowCount';
						if (rcProp in src)
							trg.$RowCount = src[rcProp] || 0;
						else
							trg.$RowCount = 0;
					}
					//TODO: try to select old value
				} else {
					if (utils.isDateCtor(ctor)) {
						let dt = src[prop];
						if (!dt)
							platform.set(this, prop, utils.date.zero());
						else {
							platform.set(this, prop, utils.date.fromServer(src[prop]));
						}
					} else if (utils.isPrimitiveCtor(ctor)) {
						platform.set(this, prop, src[prop]);
					} else {
						if (existsOnly && !(prop in src))
							continue; // no item in src
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
		if (this.$parent._lockEvents_) return this; // may be custom lock
		let newId = this.$id__;
		let fireChange = false;
		if (utils.isDefined(newId) && utils.isDefined(oldId))
			fireChange = newId !== oldId; // check id, no fire event
		if (fireChange) {
			// emit .change event for entire object
			let eventName = this._path_ + '.change';
			this._root_.$emit(eventName, this.$parent, this, this, propFromPath(this._path_));
		}
		return this;
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$defer = platform.defer;
		root.prototype.$merge = merge;
		root.prototype.$template = template;
		root.prototype._exec_ = executeCommand;
		root.prototype._canExec_ = canExecuteCommand;
		root.prototype._delegate_ = getDelegate;
		root.prototype._globalSaveEvent_ = getGlobalSaveEvent;
		root.prototype._validate_ = validate;
		root.prototype._validateAll_ = validateAll;
		root.prototype.$forceValidate = forceValidateAll;
		root.prototype.$revalidate = revalidateItem;
		root.prototype.$hasErrors = hasErrors;
		root.prototype.$destroy = destroyRoot;
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

	function setRootRuntimeInfo(runtime) {
		if (!runtime || !runtime.$cross) return;
		function ensureCrossSize(elem, cross) {
			if (!elem._elem_ || !elem.$cross) return;
			for (let crstp in cross) {
				if (elem._elem_.name !== crstp) continue;
				let t = elem.$cross;
				let s = cross[crstp];
				for (let p in t) {
					let ta = t[p];
					let sa = s[p];
					if (ta && sa)
						ta.splice(0, ta.length, ...sa);
					else if (ta && !sa)
						ta.splice(0, ta.length);
				}
			}
		}

		for (let p in this) {
			if (p.startsWith("$") || p.startsWith('_')) continue;
			let ta = this[p];
			ensureCrossSize(ta, runtime.$cross);
			if (ta._meta_ && ta._meta_.$items) {
				ta = ta[ta._meta_.$items];
				ensureCrossSize(ta, runtime.$cross);
			}
		}
	}

	function destroyRoot() {
		this._host_.$viewModel = null;
		this._host_ = null;
	}

	app.modules['std:datamodel'] = {
		createObject: createObject,
		createArray: createArray,
		defineObject: defineObject,
		implementRoot: implementRoot,
		setModelInfo: mitool.setModelInfo,
		enumData: enumData
	};
})();

