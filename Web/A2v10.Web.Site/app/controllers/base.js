// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190305-7456
// controllers/base.js

(function () {


	// TODO: delete this.__queryChange

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

	const store = component('std:store');
	const documentTitle = component("std:doctitle", true /*no error*/);

	let __updateStartTime = 0;
	let __createStartTime = 0;

	function __runDialog(url, arg, query, cb) {
		return new Promise(function (resolve, reject) {
			const dlgData = { promise: null, data: arg, query: query };
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
				__lockQuery__: true
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
				const root = this.$data;
				return root._exec_(cmd, arg, confirm, opts);
                /*
                const doExec = () => {
                    let root = this.$data;
                    if (!confirm)
                        root._exec_(cmd, arg, confirm, opts);
                    else
                        this.$confirm(confirm).then(() => root._exec_(cmd, arg));
                }

                if (opts && opts.saveRequired && this.$isDirty) {
                    this.$save().then(() => doExec());
                } else {
                    doExec();
                }
                */
			},

			$toJson(data) {
				return utils.toJson(data);
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
			$save(opts) {
				if (this.$data.$readOnly)
					return;
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
				return new Promise(function (resolve, reject) {
					let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
					let wasNew = self.$baseUrl.indexOf('/new') !== -1;
					dataservice.post(url, jsonData).then(function (data) {
						self.$data.$merge(data, true, true /*only exists*/);
						self.$data.$emit('Model.saved', self.$data);
						self.$data.$setDirty(false);
						// data is a full model. Resolve requires only single element.
						let dataToResolve;
						let newId;
						for (let p in data) {
							// always first element in the result
							dataToResolve = data[p];
							newId = self.$data[p].$id; // new element
							if (dataToResolve)
								break;
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
						resolve(dataToResolve); // single element (raw data)
						let toast = opts && opts.toast ? opts.toast : null;
						if (toast)
							self.$toast(toast);
						self.$notifyOwner(newId, toast);
					}).catch(function (msg) {
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


			$invoke(cmd, data, base, opts) {
				let self = this;
				let root = window.$$rootUrl;
				const routing = require('std:routing');
				let url = `${root}/${routing.dataUrl()}/invoke`;
				let baseUrl = self.$indirectUrl || self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data))
							resolve(data);
						else if (utils.isString(data))
							resolve(data);
						else
							throw new Error('Invalid response type for $invoke');
					}).catch(function (msg) {
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
					Vue.nextTick(() => {
						vm.$invoke(cmd, data).then((result) => {
							val.result = result.Result.Value;
							resolve(val.result);
						});
					});
				});
			},

			$reload(args) {
				//console.dir('$reload was called for' + this.$baseUrl);
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
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat._setModelInfo_(undefined, data);
							dat._fireLoad_();
							resolve(dat);
						} else {
							throw new Error('Invalid response type for $reload');
						}
					}).catch(function (msg) {
						self.$alertUi(msg);
					});
				});
			},

			$requery() {
				if (this.inDialog)
					eventBus.$emit('modalRequery');
				else
					eventBus.$emit('requery');
			},

			$remove(item, confirm) {
				if (this.$data.$readOnly) return;
				if (this.$isLoading) return;
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
			$href(url, data) {
				return urltools.createUrlForNavigate(url, data);
			},
			$navigate(url, data, newWindow, update, opts) {
				if (this.$isReadOnly(opts)) return;
				eventBus.$emit('closeAllPopups');
				let urlToNavigate = urltools.createUrlForNavigate(url, data);
				if (newWindow === true) {
					let nwin = window.open(urlToNavigate, "_blank");
					nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: urlToNavigate });
			},

			$navigateSimple(url, newWindow, update) {
				if (newWindow === true) {
					let nwin = window.open(url, "_blank");
					nwin.$$token = { token: this.__currentToken__, update: update };
				}
				else
					this.$store.commit('navigate', { url: url });
			},

			$navigateExternal(url, newWindow) {
				if (newWindow === true) {
					let nwin = window.open(url, "_blank");
				}
				else
					window.location.assign(url);
			},

			$download(url) {
				const root = window.$$rootUrl;
				url = urltools.combine('/file', url.replace('.', '-'));
				window.location = root + url;
			},

			$attachment(url, arg, opts) {
				const root = window.$$rootUrl;
				let cmd = opts && opts.export ? 'export' : 'show';
				let id = arg;
				if (arg && utils.isObject(arg))
					id = utils.getStringId(arg);
				let attUrl = urltools.combine(root, 'attachment', cmd, id);
				let qry = { base: url};
				attUrl = attUrl + urltools.makeQueryString(qry);
				if (opts && opts.newWindow)
					window.open(attUrl, '_blank');
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

			$dbRemove(elem, confirm) {
				if (!elem)
					return;
				if (this.$isLoading) return;
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
						elem.$remove(); // without confirm
					}).catch(function (msg) {
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

			$dbRemoveSelected(arr, confirm) {
				if (this.$isLoading) return;
				let sel = arr.$selected;
				if (!sel)
					return;
				this.$dbRemove(sel, confirm);
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
				if (utils.isString(prms))
					prms = { message: prms };
				prms.style = prms.style || 'confirm';
				prms.message = prms.message || prms.msg; // message or msg
				let dlgData = { promise: null, data: prms };
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$msg(msg, title, style) {
				let prms = { message: msg, title: title || locale.$Message, style: style || 'info' };
				return this.$confirm(prms);
			},

			$alert(msg, title, list) {
				// TODO: tools
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
					switch (command) {
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
								} else {
									simpleMerge(arg, result);
								}
							});
						case 'edit-selected':
							if (argIsNotAnArray()) return;
							return __runDialog(url, arg.$selected, query, (result) => {
								arg.$selected.$merge(result);
								arg.__fireChange__('selected');
								if (opts && opts.reloadAfter) {
									that.$reload();
								}
							});
						case 'edit':
							if (argIsNotAnObject()) return;
							return __runDialog(url, arg, query, (result) => {
								if (arg.$merge)
									arg.$merge(result);
								if (opts && opts.reloadAfter) {
									that.$reload();
								}
							});
						case 'copy':
							if (argIsNotAnObject()) return;
							let arr = arg.$parent;
							return __runDialog(url, arg, query, (result) => { arr.$append(result); });
						default: // simple show dialog
							return __runDialog(url, arg, query, (result) => {
								if (opts && opts.reloadAfter) {
									that.$reload();
								}
							});
					}
				}

				if (opts && opts.validRequired && root.$invalid) {
					this.$alert(locale.$MakeValidFirst);
					return;
				}

				if (opts && opts.saveRequired && this.$isDirty) {
					let dlgResult = null;
					this.$save().then(() => { dlgResult = doDialog(); });
					return dlgResult;
				}
				return doDialog();
			},

			$export() {
				if (this.$isLoading) return;
				const self = this;
				const root = window.$$rootUrl;
				let url = self.$baseUrl;
				url = url.replace('/_page/', '/_export/');
				window.location = root + url;
			},

			$exportTo(format, fileName) {
				const root = window.$$rootUrl;
				let elem = this.$el.getElementsByClassName('sheet-page');
				if (!elem.length) {
					console.dir('element not found (.sheet-page)');
					return;
				}
				let table = elem[0];
				if (htmlTools) {
					htmlTools.getColumnsWidth(table);
					htmlTools.getRowHeight(table);
				}
				let html = table.innerHTML;
				let data = { format, html, fileName };
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

				let cmd = 'show';
				let fmt = '';
				if (opts) {
					if (opts.export) {
						cmd = 'export';
						fmt = opts.format || '';
					} else if (opts.attach)
						cmd = 'attach';
					else if (opts.print)
						cmd = 'print';
				}

				const doReport = () => {
					let id = arg;
					if (arg && utils.isObject(arg))
						id = utils.getStringId(arg);
					const root = window.$$rootUrl;
					let url = `${root}/report/${cmd}/${id}`;
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
				return value;
			},

			$getNegativeRedClass(value) {
				if (utils.isNumber(value))
					return value < 0 ? 'negative-red' : '';
				return '';
			},

			$expand(elem, propName) {
				let arr = elem[propName];
				if (arr.$loaded)
					return;
				if (!utils.isDefined(elem.$hasChildren))
					return; // no $hasChildren property - static expand
				let self = this,
					root = window.$$rootUrl,
					url = root + '/_data/expand',
					jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id });

				dataservice.post(url, jsonData).then(function (data) {
					let srcArray = data[propName];
					arr.$empty();
					for (let el of srcArray)
						arr.push(arr.$new(el));
				}).catch(function (msg) {
					self.$alertUi(msg);
				});

				arr.$loaded = true;
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
						}
						resolve(arr);
					}).catch(function (msg) {
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
				let nq = Object.assign({}, this.$baseQuery);
				for (let p in search) {
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
					$saveModified: this.$saveModified,
					$asyncValid: this.$asyncValid,
					$toast: this.$toast,
					$requery: this.$requery,
					$reload: this.$reload,
					$notifyOwner: this.$notifyOwner,
					$navigate: this.$navigate,
					$defer: platform.defer
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
				if (json.getResult) {
					let grd = this.$delegate(json.getResult);
					if (grd)
						result.getResult = grd.bind(this.$data);
				}
				if (json.alwaysOk)
					result.alwaysOk = true;
				return result;
			}
		},
		created() {
			let out = { caller: null };
			eventBus.$emit('registerData', this, out);
			this.$caller = out.caller;

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);
			eventBus.$on('queryChange', this.__queryChange);
			eventBus.$on('childrenSaved', this.__notified);

			// TODO: delete this.__queryChange
			this.$on('localQueryChange', this.__queryChange);
			this.$on('cwChange', this.__cwChange);
			this.__asyncCache__ = {};
			this.__currentToken__ = window.app.nextToken();
			if (log)
				log.time('create time:', __createStartTime, false);
		},
		beforeDestroy() {
		},
		destroyed() {
			//console.dir('base.js has been destroyed');
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			eventBus.$off('childrenSaved', this.__notified);

			this.$off('localQueryChange', this.__queryChange);
			this.$off('cwChange', this.__cwChange);
			htmlTools.removePrintFrame();
		},
		beforeUpdate() {
			__updateStartTime = performance.now();
		},
		beforeCreate() {
			__createStartTime = performance.now();
		},
		updated() {
			if (log)
				log.time('update time:', __updateStartTime, false);
		}
	});

	app.components['baseController'] = base;
})();
