// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

/*20221127-7908*/
// controllers/base.js

(function () {

	const eventBus = require('std:eventBus');
	const utils = require('std:utils');
	const dataservice = require('std:dataservice');
	const urltools = require('std:url');
	const log = require('std:log', true /*no error*/);
	const locale = window.$$locale;
	const mask = require('std:mask');
	const modelInfo = require('std:modelInfo');
	const platform = require('std:platform');
	const htmlTools = require('std:html', true /*no error*/);
	const httpTools = require('std:http');

	const store = component('std:store');
	const documentTitle = component('std:doctitle', true /*no error*/);

	const __blank__ = "__blank__";

	let __updateStartTime = 0;
	let __createStartTime = 0;

	function __runDialog(url, arg, query, cb) {
		return new Promise(function (resolve, reject) {
			const dlgData = { promise: null, data: arg, query: query, rd:true };
			eventBus.$emit('modal', url, dlgData);
			dlgData.promise.then(function (result) {
				cb(result);
				resolve(result);
			});
		});
	}

	function makeErrors(errs) {
		let ra = [];
		for (let x of errs) {
			for (let y of x.e) {
				ra.push(y.msg);
			}
		}
		return ra.length ? ra : null;
	}

	function treeNormalPath(path) {
		if (!path) return;
		path = '' + path;
		return [... new Set(path.split('.'))].join('.');
	}

	function isPermissionsDisabled(opts, arg) {
		if (opts && opts.checkPermission) {
			if (utils.isObjectExact(arg)) {
				if (arg.$permissions) {
					let perm = arg.$permissions;
					let prop = opts.checkPermission;
					if (prop in perm) {
						if (!perm[prop])
							return true;
					} else {
						console.error(`invalid permssion name: '${prop}'`);
					}
				}
			}
		}
		return false;
	}

	const base = Vue.extend({
		// inDialog: Boolean (in derived class)
		// pageTitle: String (in derived class)
		store: store,
		components: {
			'a2-document-title': documentTitle
		},
		data() {
			return {
				__init__: true,
				__baseUrl__: '',
				__baseQuery__: {},
				__requestsCount__: 0,
				__lockQuery__: true,
				__testId__: null,
				__saveEvent__: null
			};
		},

		computed: {
			$baseUrl() {
				return this.$data.__baseUrl__;
			},
			$baseQuery() {
				return this.$data.__baseQuery__;
			},
			$indirectUrl() {
				return this.$data.__modelInfo.__indirectUrl__ || '';
			},
			$query() {
				return this.$data._query_;
			},
			$jsonQuery() {
				return utils.toJson(this.$data.Query);
			},
			$isDirty() {
				return this.$data.$dirty;
			},
			$isPristine() {
				return !this.$data.$dirty;
			},
			$isLoading() {
				return this.$data.__requestsCount__ > 0;
			},
			$modelInfo() {
				return this.$data.__modelInfo;
			},
			$canSave() {
				return this.$isDirty && !this.$isLoading;
			}
		},
		watch: {
			$jsonQuery(newData, oldData) {
				//console.warn(newData);
				this.$nextTick(() => this.$reload());
			}
		},
		methods: {
			$marker() {
				return true;
			},
			$exec(cmd, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				if (this.$isLoading) return;

				if (isPermissionsDisabled(opts, arg)) {
					this.$alert(locale.$PermissionDenied);
					return;
				}
				eventBus.$emit('closeAllPopups');
				const root = this.$data;
				return root._exec_(cmd, arg, confirm, opts);
			},

			async $invokeServer(url, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				const root = this.$data;
				if (confirm)
					await this.$confirm(confirm);
				if (opts && opts.saveRequired && this.$isDirty)
					await this.$save();
				if (opts && opts.validRequired && root.$invalid) { 
					this.$alert(locale.$MakeValidFirst);
					return;
				}
				let data = { Id: arg.$id };
				let cmd = urltools.splitCommand(url);
				await this.$invoke(cmd.action, data, cmd.url);
				if (opts && opts.requeryAfter)
					await this.$requery();
				else if (opts && opts.reloadAfter)
					await this.$reload();
			},

			$toJson(data) {
				return utils.toJson(data);
			},
			$maxChars(text, length) {
				return utils.text.maxChars(text, length);
			},
			$isReadOnly(opts) {
				return opts && opts.checkReadOnly && this.$data.$readOnly;
			},

			$execSelected(cmd, arg, confirm) {
				if (this.$isLoading) return;
				let root = this.$data;
				if (!utils.isArray(arg)) {
					console.error('Invalid argument for $execSelected');
					return;
				}
				eventBus.$emit('closeAllPopups');
				if (!confirm)
					root._exec_(cmd, arg.$selected);
				else
					this.$confirm(confirm).then(() => root._exec_(cmd, arg.$selected));
			},
			$canExecute(cmd, arg, opts) {
				//if (this.$isLoading) return false; // do not check here. avoid blinking
				if (this.$isReadOnly(opts))
					return false;
				let root = this.$data;
				return root._canExec_(cmd, arg, opts);
			},
			$setCurrentUrl(url) {
				if (this.inDialog)
					url = urltools.combine('_dialog', url);
				this.$data.__baseUrl__ = url;
				eventBus.$emit('modalSetBase', url);
			},
			$emitSaveEvent() {
				if (this.__saveEvent__)
					this.$caller.$data.$emit(this.__saveEvent__, this.$data);
			},
			$emitCaller(event, ...arr) {
				if (this.$caller)
					this.$caller.$data.$emit(event, ...arr);
				else
					log.error('There is no caller here');
			},
			$save(opts) {
				if (this.$data.$readOnly)
					return;
				if (!this.$data.$dirty)
					return;
				eventBus.$emit('closeAllPopups');
				let mainObjectName = this.$data._meta_.$main;
				let self = this;
				let root = window.$$rootUrl;
				const routing = require('std:routing'); // defer loading
				let url = `${root}/${routing.dataUrl()}/save`;
				let urlToSave = this.$indirectUrl || this.$baseUrl;
				const isCopy = this.$data.$isCopy;
				const validRequired = !!opts && opts.options && opts.options.validRequired;
				if (validRequired && this.$data.$invalid) {
					let errs = makeErrors(this.$data.$forceValidate());
					this.$alert(locale.$MakeValidFirst, undefined, errs);
					return;
				}
				self.$data.$emit('Model.beforeSave', self.$data);

				let saveSels = self.$data._saveSelections();

				return new Promise(function (resolve, reject) {
					let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
					let wasNew = urltools.isNewPath(self.$baseUrl);
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						self.$data.$merge(data, true, true /*only exists*/);
						self.$data.$emit('Model.saved', self.$data);
						if (self.__saveEvent__)
							self.$caller.$data.$emit(self.__saveEvent__, self.$data);
						self.$data.$setDirty(false);
						// data is a full model. Resolve requires only single element.
						let dataToResolve;
						let newId;
						if (mainObjectName) {
							dataToResolve = data[mainObjectName];
							newId = self.$data[mainObjectName].$id; // new element
						}
						else {
							// mainObject not defined. Use first element in the result
							for (let p in data) {
								dataToResolve = data[p];
								newId = self.$data[p].$id; // new element
								if (dataToResolve)
									break;
							}
						}
						if (wasNew && newId) {
							// assign the new id to the route
							if (!self.inDialog)
								self.$store.commit('setnewid', { id: newId });
							// and in the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId);
						} else if (isCopy) {
							// TODO: get action ????
							if (!self.inDialog)
								self.$store.commit('setnewid', { id: newId, action: 'edit' });
							// and in the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId, 'edit');
						}
						self.$data._restoreSelections(saveSels);
						resolve(dataToResolve); // single element (raw data)
						let toast = opts && opts.toast ? opts.toast : null;
						if (toast)
							self.$toast(toast);
						self.$notifyOwner(newId, toast);
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
					});
				});
			},
			$notifyOwner(id, toast) {
				if (!window.opener) return;
				if (!window.$$token) return;
				let rq = window.opener.require;
				if (!rq) return;
				const bus = rq('std:eventBus');
				if (!bus) return;
				let dat = {
					token: window.$$token.token,
					update: window.$$token.update,
					toast: toast || null,
					id: id
				};
				bus.$emit('childrenSaved', dat);
			},

			$showSidePane(url, arg, data) {
				let newurl = urltools.combine('_navpane', url, arg || '0') + urltools.makeQueryString(data);
				eventBus.$emit('showSidePane', newurl);
			},

			$invoke(cmd, data, base, opts) {
				let self = this;
				let root = window.$$rootUrl;
				const routing = require('std:routing');
				let url = `${root}/${routing.dataUrl()}/invoke`;
				let baseUrl = self.$indirectUrl || self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				let hideIndicator = opts && opts.hideIndicator || false;
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData, false, hideIndicator).then(function (data) {
						if (self.__destroyed__) return;
						if (utils.isObject(data))
							resolve(data);
						else if (utils.isString(data))
							resolve(data);
						else
							throw new Error('Invalid response type for $invoke');
					}).catch(function (msg) {
						if (msg === __blank__)
							return; // already done
						if (opts && opts.catchError) {
							reject(msg);
						} else {
							self.$alertUi(msg);
						}
					});
				});
			},

			$asyncValid(cmd, data) {
				const vm = this;
				const cache = vm.__asyncCache__;
				const djson = JSON.stringify(data);
				let val = cache[cmd];
				if (!val) {
					val = { data: '', result: null };
					cache[cmd] = val;
				}
				if (val.data === djson) {
					return val.result;
				}
				val.data = djson;
				return new Promise(function (resolve, reject) {
					if (vm.__destroyed__) return;
					Vue.nextTick(() => {
						vm.$invoke(cmd, data).then((result) => {
							if (vm.__destroyed__) return;
							val.result = result.Result.Value;
							resolve(val.result);
						});
					});
				});
			},

			$reload(args) {
				//console.dir('$reload was called for' + this.$baseUrl);
				eventBus.$emit('closeAllPopups');
				let self = this;
				if (utils.isArray(args) && args.$isLazy()) {
					// reload lazy
					let propIx = args._path_.lastIndexOf('.');
					let prop = args._path_.substring(propIx + 1);
					args.$loaded = false; // reload
					return self.$loadLazy(args.$parent, prop);
				}
				let root = window.$$rootUrl;
				const routing = require('std:routing'); // defer loading
				let url = `${root}/${routing.dataUrl()}/reload`;
				let dat = self.$data;

				let mi = args ? modelInfo.get(args.$ModelInfo) : null;
				if (!args && !mi) {
					// try to get first $ModelInfo
					let modInfo = this.$data._findRootModelInfo();
					if (modInfo) {
						mi = modelInfo.get(modInfo);
					}
				}

				let saveSels = dat._saveSelections();

				return new Promise(function (resolve, reject) {
					let dataToQuery = { baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi) };
					if (utils.isDefined(dat.Query)) {
						// special element -> use url
						dataToQuery.baseUrl = urltools.replaceUrlQuery(self.$baseUrl, dat.Query);
						let newUrl = urltools.replaceUrlQuery(null/*current*/, dat.Query);
						window.history.replaceState(null, null, newUrl);
					}
					let jsonData = utils.toJson(dataToQuery);
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						if (utils.isObject(data)) {
							dat.$merge(data, true/*checkBindOnce*/);
							modelInfo.reconcileAll(data.$ModelInfo);
							dat._setModelInfo_(undefined, data);
							dat._setRuntimeInfo_(data.$runtime);
							dat._fireLoad_();
							dat._restoreSelections(saveSels);
							resolve(dat);
						} else {
							throw new Error('Invalid response type for $reload');
						}
					}).catch(function (msg) {
						if (msg === __blank__)
							return; // already done
						self.$alertUi(msg);
					});
				});
			},
			async $nodirty(callback) {
				let wasDirty = this.$data.$dirty;
				await callback();
				this.$defer(() => this.$data.$setDirty(wasDirty));
			},
			$requery() {
				if (this.inDialog)
					eventBus.$emit('modalRequery', this.$baseUrl);
				else
					eventBus.$emit('requery');
			},

			$remove(item, confirm) {
				if (this.$data.$readOnly) return;
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},

			$removeSelected(arr, confirm) {
				if (!utils.isArray(arr)) {
					console.error('$removeSelected. The argument is not an array');
				}
				if (this.$data.$readOnly)
					return;
				let item = arr.$selected;
				if (!item)
					return;
				this.$remove(item, confirm);
			},
			$mailto(arg, subject) {
				let href = 'mailto:' + arg;
				if (subject)
					href += '?subject=' + urltools.encodeUrl(subject);
				return href;
			},
			$callphone(phone) {
				return `tel:${phone}`;
			},
			$href(url, data) {
				return urltools.createUrlForNavigate(url, data);
			},
			$navigate(url, data, newWindow, update, opts) {
				if (this.$isReadOnly(opts)) return;
				eventBus.$emit('closeAllPopups');
				let urlToNavigate = urltools.createUrlForNavigate(url, data);
				if (newWindow === true) {
					let nwin = window.open(urlToNavigate, "_blank");
					if (nwin)
						nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: urlToNavigate });
			},
			$navigateSimple(url, newWindow, update) {
				eventBus.$emit('closeAllPopups');
				if (newWindow === true) {
					let nwin = window.open(url, "_blank");
					if (nwin)
						nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: url });
			},

			$navigateExternal(url, newWindow) {
				eventBus.$emit('closeAllPopups');
				if (newWindow === true) {
					window.open(url, "_blank");
				}
				else
					window.location.assign(url);
			},

			$download(url) {
				eventBus.$emit('closeAllPopups');
				const root = window.$$rootUrl;
				url = urltools.combine('/file', url.replace('.', '-'));
				window.location = root + url;
			},

			async $upload(url, accept, data, opts) {
				eventBus.$emit('closeAllPopups');
				let root = window.$$rootUrl;
				try {
					let file = await htmlTools.uploadFile(accept, url);
					var dat = new FormData();
					dat.append('file', file, file.name);
					if (data)
						dat.append('Key', data.Key || null);
					let uploadUrl = urltools.combine(root, '_file', url);
					uploadUrl = urltools.createUrlForNavigate(uploadUrl, data);
					return await httpTools.upload(uploadUrl, dat);
				} catch (err) {
					err = err || 'unknown error';
					if (opts && opts.catchError)
						throw err;
					else if (err.indexOf('UI:') === 0)
						this.$alert(err);
					else
						alert(err);
				}
			},

			$file(url, arg, opts) {
				eventBus.$emit('closeAllPopups');
				const root = window.$$rootUrl;
				let id = arg;
				let token = undefined;
				if (arg && utils.isObject(arg)) {
					id = utils.getStringId(arg);
					if (arg._meta_ && arg._meta_.$token)
						token = arg[arg._meta_.$token];
				}
				let fileUrl = urltools.combine(root, '_file', url, id);
				let qry = {};
				let action = (opts || {}).action;
				if (token)
					qry.token = token;
				if (action == 'download')
					qry.export = 1;
				fileUrl += urltools.makeQueryString(qry);
				switch (action) {
					case 'download':
						htmlTools.downloadUrl(fileUrl);
						break;
					case 'print':
						htmlTools.printDirect(fileUrl);
						break;
					default:
						window.open(fileUrl, '_blank');
				}
			},

			$attachment(url, arg, opts) {
				eventBus.$emit('closeAllPopups');
				const root = window.$$rootUrl;
				let cmd = opts && opts.export ? 'export' : 'show';
				let id = arg;
				let token = undefined;
				if (arg && utils.isObject(arg)) {
					id = utils.getStringId(arg);
					if (arg._meta_ && arg._meta_.$token)
						token = arg[arg._meta_.$token];
				}
				let attUrl = urltools.combine(root, 'attachment', cmd, id);
				let qry = { base: url };
				if (token)
					qry.token = token;
				attUrl = attUrl + urltools.makeQueryString(qry);
				if (opts && opts.newWindow)
					window.open(attUrl, '_blank');
				else if (opts && opts.print)
					htmlTools.printDirect(attUrl);
				else
					window.location.assign(attUrl);
			},

			$eusign(baseurl, arg) {
				// id => attachment id
				// open dialog with eu-sign frame
				function rawDialog(url) {
					return new Promise(function (resolve, reject) {
						const dlgData = {
							promise: null, data: arg, query: { base: baseurl }, raw: true
						};
						eventBus.$emit('modal', url, dlgData);
						dlgData.promise.then(function (result) {
							cb(result);
							resolve(result);
						});
					});
				}
				const root = window.$$rootUrl;
				rawDialog('/eusign/index').then(function (resolve, reject) {
					alert('promise resolved');
				});
			},

			$dbRemove(elem, confirm, opts) {
				if (!elem)
					return;

				if (isPermissionsDisabled(opts, elem)) {
					this.$alert(locale.$PermissionDenied);
					return;
				}
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');

				let id = elem.$id;
				let lazy = elem.$parent.$isLazy ? elem.$parent.$isLazy() : false;
				let root = window.$$rootUrl;
				const self = this;

				function lastProperty(path) {
					let pos = path.lastIndexOf('.');
					if (pos === -1)
						return undefined;
					return path.substring(pos + 1);
				}

				function dbRemove() {
					let postUrl = root + '/_data/dbRemove';
					let jsonObj = { baseUrl: self.$baseUrl, id: id };
					if (lazy) {
						jsonObj.prop = lastProperty(elem.$parent._path_);
					}
					let jsonData = utils.toJson(jsonObj);
					dataservice.post(postUrl, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						elem.$remove(); // without confirm
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
					});
				}
				if (confirm) {
					this.$confirm(confirm).then(function () {
						dbRemove();
					});
				} else {
					dbRemove();
				}
			},

			$dbRemoveSelected(arr, confirm, opts) {
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				let sel = arr.$selected;
				if (!sel)
					return;
				this.$dbRemove(sel, confirm, opts);
			},

			$openSelectedFrame(url, arr) {
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
				let urlToNavigate = urltools.createUrlForNavigate(url, sel.$id);
				eventBus.$emit('openframe', urlToNavigate);
			},

			$openSelected(url, arr, newwin, update) {
				eventBus.$emit('closeAllPopups');
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
				if (url.startsWith('{')) { // decorated. defer evaluate
					url = url.substring(1, url.length - 1);
					let nUrl = utils.eval(sel, url);
					if (!nUrl)
						throw new Error(`Property '${url}' not found in ${sel.constructor.name} object`);
					url = nUrl;
				}
				this.$navigate(url, sel.$id, newwin, update);
			},

			$hasSelected(arr, opts) {
				if (opts && opts.validRequired) {
					let root = this.$data;
					if (!root.$valid) return false;
				}
				return arr && !!arr.$selected;
			},

			$hasChecked(arr) {
				return arr && arr.$checked && arr.$checked.length;
			},

			$sanitize(text) {
				return utils.text.sanitize(text);
			},

			$confirm(prms) {
				// TODO: tools
				if (utils.isString(prms))
					prms = { message: prms };
				prms.style = prms.style || 'confirm';
				prms.message = prms.message || prms.msg; // message or msg
				let dlgData = { promise: null, data: prms };
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$focus(htmlid) {
				let elem = document.querySelector('#' + htmlid);
				if (!elem) return;
				let ch = elem.querySelector('input, textarea, button, select');
				this.$defer(() => {
					if (ch && ch.focus)
						ch.focus();
					else if (elem.focus)
						elem.focus();
				});
			},

			$msg(msg, title, style) {
				let prms = { message: msg, title: title || locale.$Message, style: style || 'info' };
				return this.$confirm(prms);
			},

			$alert(msg, title, list) {
				// TODO: tools
				if (utils.isObject(msg) && !title && !list) {
					let prms = msg;
					msg = prms.message || prms.msg;
					title = prms.title;
					list = prms.list;
				}
				let dlgData = {
					promise: null, data: {
						message: msg, title: title, style: 'alert', list: list
					}
				};
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$alertUi(msg) {
				if (msg instanceof Error) {
					alert(msg.message);
					return;
				}
				if (msg.indexOf('UI:') === 0)
					this.$alert(msg.substring(3).replace('\\n', '\n'));

				else
					alert(msg);
			},

			$toast(toast, style) {
				if (!toast) return;
				if (utils.isString(toast))
					toast = { text: toast, style: style || 'success' };
				eventBus.$emit('toast', toast);
			},

			$showDialog(url, arg, query, opts) {
				return this.$dialog('show', url, arg, query, opts);
			},

			$inlineOpen(id) {
				eventBus.$emit('inlineDialog', { cmd: 'open', id: id});
			},

			$inlineClose(id, result) {
				eventBus.$emit('inlineDialog', { cmd: 'close', id: id, result: result });
			},

			$inlineDepth() {
				let opts = { count: 0 };
				eventBus.$emit('inlineDialogCount', opts);
				return opts.count;
			},

			$closeAllPopups() {
				eventBus.$emit('closeAllPopups');
			},

			$dialog(command, url, arg, query, opts) {
				if (this.$isReadOnly(opts))
					return;
				const that = this;
				eventBus.$emit('closeAllPopups');
				function argIsNotAnArray() {
					if (!utils.isArray(arg)) {
						console.error(`$dialog.${command}. The argument is not an array`);
						return true;
					}
				}
				function argIsNotAnObject() {
					if (!utils.isObjectExact(arg)) {
						console.error(`$dialog.${command}. The argument is not an object`);
						return true;
					}
				}

				function simpleMerge(target, src) {
					for (let p in target) {
						if (p in src)
							target[p] = src[p];
						else
							target[p] = undefined;
					}
				}

				function doDialog() {
					// result always is raw data
					if (isPermissionsDisabled(opts, arg)) {
						that.$alert(locale.$PermissionDenied);
						return;
					}
					if (utils.isFunction(query))
						query = query();
					let reloadAfter = opts && opts.reloadAfter;
					switch (command) {
						case 'new':
							if (argIsNotAnArray()) return;
							return __runDialog(url, 0, query, (result) => {
								let sel = arg.$selected;
								if (sel)
									sel.$merge(result);
							});
						case 'append':
							if (argIsNotAnArray()) return;
							return __runDialog(url, 0, query, (result) => { arg.$append(result); });
						case 'browse':
							if (!utils.isObject(arg)) {
								console.error(`$dialog.${command}. The argument is not an object`);
								return;
							}
							return __runDialog(url, arg, query, (result) => {
								if (arg.$merge) {
									arg.$merge(result);
								} else if (result !== false) {
									simpleMerge(arg, result);
								}
							});
						case 'edit-selected':
							if (argIsNotAnArray()) return;
							if (!arg.$selected) return;
							return __runDialog(url, arg.$selected, query, (result) => {
								arg.$selected.$merge(result);
								arg.__fireChange__('selected');
								if (reloadAfter) 
									that.$reload();
							});
						case 'show-selected': 
							if (argIsNotAnArray()) return;
							if (!arg.$selected) return;
							return __runDialog(url, arg.$selected, query, (result) => {
								if (result === 'reload' || reloadAfter)
									that.$reload();
							});
						case 'edit':
							if (argIsNotAnObject()) return;
							return __runDialog(url, arg, query, (result) => {
								if (result === 'reload')
									that.$reload();
								else if (arg.$merge && utils.isObjectExact(result)) {
									arg.$merge(result);
									if (reloadAfter)
										that.$reload();
								}
							});
						case 'copy':
							if (argIsNotAnObject()) return;
							let arr = arg.$parent;
							return __runDialog(url, arg, query, (result) => {
								arr.$append(result);
								if (reloadAfter) {
									that.$reload();
								}
							});
						default: // simple show dialog
							return __runDialog(url, arg, query, (r) => {
								if (reloadAfter) {
									that.$reload();
								}
							});
					}
				}

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				let mo = this.$data.$mainObject;
				if (opts && opts.saveRequired && (this.$isDirty || mo && mo.$isNew)) {
					let dlgResult = null;
					this.$save().then(() => { dlgResult = doDialog(); });
					return dlgResult;
				}
				return doDialog();
			},

			$export(arg, url, dat, opts) {
				if (this.$isLoading) return;
				const doExport = () => {
					let id = arg || '0';
					if (arg && utils.isObject(arg))
						id = utils.getStringId(arg);
					const self = this;
					const root = window.$$rootUrl;
					let newurl = url ? urltools.combine('/_export', url, id) : self.$baseUrl.replace('/_page/', '/_export/');
					newurl = urltools.combine(root, newurl) + urltools.makeQueryString(dat);
					window.location = newurl; // to display errors
				};

				if (opts && opts.saveRequired && this.$isDirty) {
					this.$save().then(() => {
						doExport();
					});
				}
				else {
					doExport();
				}
			},

			$exportTo(format, fileName) {
				const root = window.$$rootUrl;
				let elem = this.$el.getElementsByClassName('sheet-page');
				if (!elem.length) {
					console.error('element not found (.sheet-page)');
					return;
				}
				let table = elem[0];
				var tbl = table.getElementsByTagName('table');
				if (tbl.length == 0) {
					console.error('element not found (.sheet-page table)');
					return;
				}
				tbl = tbl[0];
				if (htmlTools) {
					htmlTools.getColumnsWidth(tbl);
					// attention! from css!
					let padding = tbl.classList.contains('compact') ? 4 : 12;
					htmlTools.getRowHeight(tbl, padding);
				}
				let html = '<table>' + tbl.innerHTML + '</table>';
				let data = { format, html, fileName, zoom: +(window.devicePixelRatio).toFixed(2) };
				const routing = require('std:routing');
				let url = `${root}/${routing.dataUrl()}/exportTo`;
				dataservice.post(url, utils.toJson(data), true).then(function (blob) {
					if (htmlTools)
						htmlTools.downloadBlob(blob, fileName, format);
				}).catch(function (error) {
					alert(error);
				});
			},

			$report(rep, arg, opts, repBaseUrl, data) {
				if (this.$isReadOnly(opts)) return;
				if (this.$isLoading) return;
				eventBus.$emit('closeAllPopups');
				let cmd = 'show';
				let fmt = '';
				let viewer = 'report';
				if (opts) {
					if (opts.export) {
						cmd = 'export';
						fmt = opts.format || '';
					} else if (opts.attach)
						cmd = 'attach';
					else if (opts.print)
						cmd = 'print';
					if (opts.viewer && cmd === 'show')
						viewer = opts.viewer;
				}

				const doReport = () => {
					let id = arg;
					if (arg && utils.isObject(arg))
						id = utils.getStringId(arg);
					const root = window.$$rootUrl;
					let url = `${root}/${viewer}/${cmd}/${id}`;
					let reportUrl = urltools.removeFirstSlash(repBaseUrl) || this.$indirectUrl || this.$baseUrl;
					let baseUrl = urltools.makeBaseUrl(reportUrl);
					let qry = Object.assign({}, { base: baseUrl, rep: rep }, data);
					if (fmt)
						qry.format = fmt;
					url = url + urltools.makeQueryString(qry);
					// open in new window
					if (!opts) {
						window.open(url, '_blank');
						return;
					}
					if (opts.export)
						window.location = url;
					else if (opts.print)
						htmlTools.printDirect(url);
					else if (opts.attach)
						return; // do nothing
					else
						window.open(url, '_blank');
				};

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				if (opts && opts.saveRequired && this.$isDirty) {
					this.$save().then(() => {
						doReport();
					});
				} else {
					doReport();
				}
			},

			$modalSaveAndClose(result, opts) {
				if (this.$isDirty) {
					const root = this.$data;
					if (opts && opts.validRequired && root.$invalid) {
						let errs = makeErrors(root.$forceValidate());
						//console.dir(errs);
						this.$alert(locale.$MakeValidFirst, undefined, errs);
						return;
					}
					this.$save().then((result) => eventBus.$emit('modalClose', result));
				}
				else
					eventBus.$emit('modalClose', result);
			},

			$modalClose(result) {
				eventBus.$emit('modalClose', result);
			},

			$setFilter(obj, prop, val) {
				eventBus.$emit('setFilter', { source: obj, prop: prop, value: val });
			},

			$clearFilter(obj) {
				eventBus.$emit('clearFilter', {source: obj});
			},
			$modalSelect(array, opts) {
				if (!('$selected' in array)) {
					console.error('Invalid array for $modalSelect');
					return;
				}
				if (opts && opts.validRequired) {
					let root = this.$data;
					if (!root.$valid) return;
				}
				this.$modalClose(array.$selected);
			},

			$modalSelectChecked(array) {
				if (!('$checked' in array)) {
					console.error('invalid array for $modalSelectChecked');
					return;
				}
				let chArray = array.$checked;
				if (chArray.length > 0)
					this.$modalClose(chArray);
			},

			$saveAndClose(opts) {
				if (this.$isDirty)
					this.$save(opts).then(() => this.$close());
				else
					this.$close();
			},

			$close() {
				if (this.$saveModified()) {
					this.$store.commit("close");
				}
			},

			$showHelp(path) {
				window.open(this.$helpHref(path), "_blank");
			},

			$helpHref(path) {
				return urltools.helpHref(path);
			},

			$searchChange() {
				let newUrl = this.$store.replaceUrlSearch(this.$baseUrl);
				this.$data.__baseUrl__ = newUrl;
				this.$reload();
			},

			$saveModified(message, title) {
				if (!this.$isDirty)
					return true;
				if (this.isIndex)
					return true;
				let self = this;
				let dlg = {
					message: message || locale.$ElementWasChanged,
					title: title || locale.$ConfirmClose,
					buttons: [
						{ text: locale.$Save, result: "save" },
						{ text: locale.$NotSave, result: "close" },
						{ text: locale.$Cancel, result: false }
					]
				};
				function closeImpl(result) {
					if (self.inDialog)
						eventBus.$emit('modalClose', result);
					else
						self.$close();
				}

				this.$confirm(dlg).then(function (result) {
					if (result === 'close') {
						// close without saving
						self.$data.$setDirty(false);
						closeImpl(false);
					} else if (result === 'save') {
						// save then close
						self.$save().then(function (saveResult) {
							//console.dir(saveResult);
							closeImpl(saveResult);
						});
					}
				});
				return false;
			},

			$format(value, opts) {
				if (!opts) return value;
				if (utils.isString(opts))
					opts = { dataType: opts };
				if (!opts.format && !opts.dataType && !opts.mask)
					return value;
				if (opts.mask)
					return value ? mask.getMasked(opts.mask, value) : value;
				if (opts.dataType)
					return utils.format(value, opts.dataType, { hideZeros: opts.hideZeros, format: opts.format });
				if (opts.format && opts.format.indexOf('{0}') !== -1)
					return opts.format.replace('{0}', value);
				if (utils.isDate(value) && opts.format)
					return utils.format(value, 'DateTime', { format: opts.format });
				return value;
			},

			$getNegativeRedClass(value) {
				if (utils.isNumber(value))
					return value < 0 ? 'negative-red' : '';
				return '';
			},

			$expand(elem, propName, expval) {
				let self = this,
					root = window.$$rootUrl,
					url = root + '/_data/expand';

				return new Promise(function (resolve, reject) {
					let arr = elem[propName];
					if (utils.isDefined(expval)) {
						if (elem.$expanded == expval) {
							resolve(arr);
							return;
						} else {
							platform.set(elem, '$expanded', expval);
						}
					}
					if (arr.$loaded) {
						resolve(arr);
						return;
					}
					if (!utils.isDefined(elem.$hasChildren)) {
						resolve(arr);
						return; // no $hasChildren property - static expand
					}
					if (!elem.$hasChildren) {
						// try to expand empty array
						arr.$loaded = true;
						resolve(arr);
						return;
					}
					let jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id });
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						let srcArray = data[propName];
						arr.$empty();
						if (srcArray) {
							for (let el of srcArray)
								arr.push(arr.$new(el));
						}
						resolve(arr);
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
						reject(arr);
					});

					arr.$loaded = true;
				});
			},

			$loadLazy(elem, propName) {
				const routing = require('std:routing'); // defer loading
				let self = this,
					root = window.$$rootUrl,
					url = `${root}/${routing.dataUrl()}/loadlazy`,
					selfMi = elem[propName].$ModelInfo,
					parentMi = elem.$parent.$ModelInfo;

				// HACK. inherit filter from parent modelInfo
				/*
				?????
				if (parentMi && parentMi.Filter) {
					if (selfMi)
						modelInfo.mergeFilter(selfMi.Filter, parentMi.Filter);
					else
						selfMi = parentMi;
				}
				*/

				let mi = modelInfo.get(selfMi);
				let xQuery = urltools.parseUrlAndQuery(self.$baseUrl, mi);
				let newUrl = xQuery.url + urltools.makeQueryString(mi);
				//console.dir(newUrl);
				//let jsonData = utils.toJson({ baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi), id: elem.$id, prop: propName });
				let jsonData = utils.toJson({ baseUrl: newUrl, id: elem.$id, prop: propName });

				return new Promise(function (resolve, reject) {
					let arr = elem[propName];
					if (arr.$loaded) {
						resolve(arr);
						return;
					}
					dataservice.post(url, jsonData).then(function (data) {
						if (self.__destroyed__) return;
						if (propName in data) {
							arr.$empty();
							for (let el of data[propName])
								arr.push(arr.$new(el));
							let rcName = propName + '.$RowCount';
							if (rcName in data) {
								arr.$RowCount = data[rcName];
							}
							if (data.$ModelInfo)
								modelInfo.reconcile(data.$ModelInfo[propName]);
							arr._root_._setModelInfo_(arr, data);
							let eventName = treeNormalPath(arr._path_) + '.load';
							self.$data.$emit(eventName, arr);
						}
						resolve(arr);
					}).catch(function (msg) {
						if (msg === __blank__)
							return;
						self.$alertUi(msg);
					});
					arr.$loaded = true;
				});
			},

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
			},

			$defer: platform.defer,
			$print: platform.print,

			$hasError(path) {
				let ps = utils.text.splitPath(path);
				let err = this[ps.obj]._errors_;
				if (!err) return false;
				let arr = err[path];
				return arr && arr.length;
			},

			$errorMessage(path) {
				let ps = utils.text.splitPath(path);
				let err = this[ps.obj]._errors_;
				if (!err) return '';
				let arr = err[path];
				if (arr && arr.length)
					return arr[0].msg;
				return '';
			},

			$getErrors(severity) {
				let errs = this.$data.$forceValidate();
				if (!errs || !errs.length)
					return null;

				if (severity && !utils.isArray(severity))
					severity = [severity];

				function isInclude(sev) {
					if (!severity)
						return true; // include
					if (severity.indexOf(sev) !== -1)
						return true;
					return false;
				}

				let result = [];
				for (let x of errs) {
					for (let ix = 0; ix < x.e.length; ix++) {
						let y = x.e[ix];
						if (isInclude(y.severity))
							result.push({ path: x, msg: y.msg, severity: y.severity, index: ix });
					}
				}
				return result.length ? result : null;
			},

			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__cwChange(source) {
				this.$reload(source);
			},
			__queryChange(search, source) {
				// preserve $baseQuery (without data from search)
				if (!utils.isObjectExact(search)) {
					console.error('base.__queryChange. invalid argument type');
				}
				let searchBase = search.__baseUrl__;
				if (searchBase) {
					let searchurl = urltools.parseUrlAndQuery(searchBase);
					let thisurl = urltools.parseUrlAndQuery(this.$data.__baseUrl__);
					if (searchurl.url !== thisurl.url)
						return;
				}
				let nq = Object.assign({}, this.$baseQuery);
				for (let p in search) {
					if (p.startsWith('__'))
						continue;
					if (search[p]) {
						// replace from search
						nq[p] = search[p];
					}
					else {
						// undefined element, delete from query
						delete nq[p];
					}
				}
				//this.$data.__baseUrl__ = this.$store.replaceUrlSearch(this.$baseUrl, urltools.makeQueryString(nq));
				let mi = source ? source.$ModelInfo : this.$data._findRootModelInfo();
				modelInfo.copyfromQuery(mi, nq);
				this.$reload(source);
			},
			__doInit__(baseUrl) {
				const root = this.$data;
				if (!root._modelLoad_) return;
				let caller = null;
				if (baseUrl)
					root.__baseUrl__ = baseUrl;
				if (this.$caller)
					caller = this.$caller.$data;
				this.__createController__();
				root._modelLoad_(caller);
				root._seal_(root);
			},
			__createController__() {
				let ctrl = {
					$save: this.$save,
					$invoke: this.$invoke,
					$close: this.$close,
					$modalClose: this.$modalClose,
					$msg: this.$msg,
					$alert: this.$alert,
					$confirm: this.$confirm,
					$showDialog: this.$showDialog,
					$inlineOpen: this.$inlineOpen,
					$inlineClose: this.$inlineClose,
					$inlineDepth: this.$inlineDepth,
					$saveModified: this.$saveModified,
					$asyncValid: this.$asyncValid,
					$toast: this.$toast,
					$requery: this.$requery,
					$reload: this.$reload,
					$notifyOwner: this.$notifyOwner,
					$navigate: this.$navigate,
					$defer: platform.defer,
					$setFilter: this.$setFilter,
					$clearFilter: this.$clearFilter,
					$expand: this.$expand,
					$focus: this.$focus,
					$report: this.$report,
					$upload: this.$upload,
					$emitCaller: this.$emitCaller,
					$emitSaveEvent: this.$emitSaveEvent,
					$nodirty: this.$nodirty,
					$showSidePane: this.$showSidePane
				};
				Object.defineProperty(ctrl, "$isDirty", {
					enumerable: true,
					configurable: true, /* needed */
					get: () => this.$isDirty
				});
				Object.defineProperty(ctrl, "$isPristine", {
					enumerable: true,
					configurable: true, /* needed */
					get: () => this.$isPristine
				});
				Object.seal(ctrl);
				return ctrl;
			},
			__notified(token) {
				if (!token) return;
				if (this.__currentToken__ !== token.token) return;
				if (token.toast)
					this.$toast(token.toast);
				this.$reload(token.update || null).then(function (array) {
					if (!token.id) return;
					if (!utils.isArray(array)) return;
					let el = array.find(itm => itm.$id === token.id);
					if (el && el.$select) el.$select();
				});
			},
			__parseControllerAttributes(attr) {
				if (!attr) return null;
				let json = JSON.parse(attr.replace(/\'/g, '"'));
				let result = {};
				if (json.canClose) {
					let ccd = this.$delegate(json.canClose);
					if (ccd)
						result.canClose = ccd.bind(this.$data);
				}
				if (json.alwaysOk)
					result.alwaysOk = true;
				if (json.saveEvent) {
					this.__saveEvent__ = json.saveEvent;
				}
				if (json.placement)
					result.placement = json.placement;
				return result;
			},
			__isModalRequery() {
				let arg = { url: this.$baseUrl, result: false };
				eventBus.$emit('isModalRequery', arg);
				return arg.result;
			},
			__invoke__test__(args) {
				args = args || {};
				if (args.target !== 'controller')
					return;
				if (this.inDialog) {
					// testId for dialogs only
					if (args.testId !== this.__testId__)
						return;
				}
				const root = this.$data;
				switch (args.action) {
					case 'eval':
						args.result = utils.eval(root, args.path);
						break;
				}
			},
			__global_period_changed__(period) {
				this.$data._fireGlobalPeriodChanged_(period);
			}
		},
		created() {
			let out = { caller: null };
			if (!this.isSkipDataStack)
				eventBus.$emit('registerData', this, out);
			this.$caller = out.caller;
			this.__destroyed__ = false;

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);
			eventBus.$on('queryChange', this.__queryChange);
			eventBus.$on('childrenSaved', this.__notified);
			eventBus.$on('invokeTest', this.__invoke__test__);
			eventBus.$on('globalPeriodChanged', this.__global_period_changed__);

			this.$on('cwChange', this.__cwChange);
			this.__asyncCache__ = {};
			this.__currentToken__ = window.app.nextToken();
			if (log)
				log.time('create time:', __createStartTime, false);
		},
		beforeDestroy() {
			this.$data._fireUnload_();
		},
		destroyed() {
			//console.dir('base.js has been destroyed');
			this.$caller = null;
			if (!this.isSkipDataStack)
				eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			eventBus.$off('childrenSaved', this.__notified);
			eventBus.$off('invokeTest', this.__invoke__test__);
			eventBus.$off('globalPeriodChanged', this.__global_period_changed__);

			this.$off('cwChange', this.__cwChange);
			htmlTools.removePrintFrame();
			if (this.$data.$destroy)
				this.$data.$destroy();
			this._data = null;
			this.__destroyed__ = true;
		},
		beforeUpdate() {
			__updateStartTime = performance.now();
		},
		beforeCreate() {
			__createStartTime = performance.now();
		},
		mounted() {
			let testId = this.$el.getAttribute('test-id');
			if (testId)
				this.__testId__ = testId;
		},
		updated() {
			if (log)
				log.time('update time:', __updateStartTime, false);
		}
	});

	app.components['baseController'] = base;
})();