/*20171012-7045*/
/*controllers/base.js*/
(function () {

    const eventBus = require('std:eventBus');
    const utils = require('std:utils');
    const dataservice = require('std:dataservice');
	const store = component('std:store');
	const urltools = require('std:url');
	const log = require('std:log');

	const documentTitle = {
		render() {
			return null;
		},
		props: ['page-title'],
		watch: {
			pageTitle(newValue) {
				if (this.pageTitle)
					document.title = this.pageTitle;
			}
		},
		created() {
			if (this.pageTitle)
				document.title = this.pageTitle;
		}
	};

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
				__requestsCount__: 0
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
			},
			$isLoading() {
				return this.$data.__requestsCount__ > 0;
			},
			$modelInfo() {
				return this.$data.__modelInfo;
			}
		},
		methods: {
			$exec(cmd, arg, confirm) {
				let root = this.$data;
				if (!confirm)
					root._exec_(cmd, arg);
				else
					this.$confirm(confirm).then(() => root._exec_(cmd, arg));
			},

			$execSelected(cmd, arg, confirm) {
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

			$save() {
				let self = this;
                let root = window.$$rootUrl;
				let url = root + '/_data/save';
				return new Promise(function (resolve, reject) {
                    let jsonData = utils.toJson({ baseUrl: self.$baseUrl, data: self.$data });
                    let wasNew = self.$baseUrl.endsWith('/new');
					dataservice.post(url, jsonData).then(function (data) {
						self.$data.$merge(data);
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
                            self.$store.commit('setnewid', { id: newId });
                            // and in the __baseUrl__
                            self.$data.__baseUrl__ = self.$data.__baseUrl__.replace('/new', '/' + newId);
                        }
						resolve(dataToResolve); // single element (raw data)
					}).catch(function (msg) {
						self.$alertUi(msg);
					});
				});
			},

			$invoke(cmd, data, base) {
				let self = this;
                let root = window.$$rootUrl;
				let url = root + '/_data/invoke';
				let baseUrl = self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							resolve(data);
						} else {
							throw new Error('Invalid response type for $invoke');
						}
					}).catch(function (msg) {
						self.$alertUi(msg);
					});
				});
			},

			$reload() {
                let self = this;
                let root = window.$$rootUrl;
				let url = root + '/_data/reload';
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
				if (this.inDialog)
					alert('$requery command is not supported in dialogs');
				else
					eventBus.$emit('requery');
			},

			$remove(item, confirm) {
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},

			$removeSelected(arr, confirm) {
				if (!utils.isArray(arr)) {
					console.error('$removeSelected. The argument is not an array');
				}
				let item = arr.$selected;
				if (!item)
					return;
				this.$remove(item, confirm);
			},

			$navigate(url, data) {
				let dataToNavigate = data || 'new';
                if (utils.isObjectExact(dataToNavigate))
					dataToNavigate = dataToNavigate.$id;
				let urlToNavigate = urltools.combine(url, dataToNavigate);
				this.$store.commit('navigate', { url: urlToNavigate });
			},

            $dbRemoveSelected(arr, confirm) {
                let sel = arr.$selected;
                if (!sel)
                    return;
                let id = sel.$id;
                let self = this;
                let root = window.$$rootUrl;

                function dbRemove() {
                    let postUrl = root + '/_data/dbRemove';
                    let jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: id });

                    dataservice.post(postUrl, jsonData).then(function (data) {
                        sel.$remove(); // without confirm
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
			$openSelected(url, arr) {
				// TODO: переделать
				url = url || '';
				let sel = arr.$selected;
				if (!sel)
					return;
				if (url.startsWith('{')) {
					url = url.substring(1, url.length - 1);
					let nUrl = sel[url];
					if (!nUrl)
						throw new Error(`Property '${url}' not found in ${sel.constructor.name} object`);
					url = nUrl;
				}
				this.$navigate(url, sel.$id);
			},

			$hasSelected(arr) {
				return !!arr.$selected;
			},

			$confirm(prms) {
				if (utils.isString(prms))
                    prms = { message: prms };
                prms.style = 'confirm';
				let dlgData = { promise: null, data: prms };
				eventBus.$emit('confirm', dlgData);
				return dlgData.promise;
			},

			$alert(msg, title) {
				let dlgData = {
					promise: null, data: {
						message: msg, title: title, style: 'alert'
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
					this.$alert(msg.substring(3));

				else
					alert(msg);
			},

			$dialog(command, url, data, query) {
				return new Promise(function (resolve, reject) {
					// sent a single object
                    if (command === 'edit-selected') {
                        if (!utils.isArray(data)) {
                            console.error('$dialog.editSelected. The argument is not an array');
                        }
                        data = data.$selected;
                    }
                    let dataToSent = data;
					if (command === 'append') {
						if (!utils.isArray(data)) {
							console.error('$dialog.add. The argument is not an array');
						}
						dataToSent = null;
					}
					let dlgData = { promise: null, data: dataToSent, query: query };
					eventBus.$emit('modal', url, dlgData);
                    if (command === 'edit' || command === 'edit-selected' || command === 'browse') {
                        dlgData.promise.then(function (result) {
                            if (!utils.isObject(data)) {
                                console.error(`$dialog.${command}. The argument is not an object`);
                                return;
                            }
                            // result is raw data
                            data.$merge(result);
                            resolve(result);
                        });
					} else if (command === 'append') {
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
					this.$save().then((result) => eventBus.$emit('modalClose', result));
				else
					eventBus.$emit('modalClose', result);
			},

			$modalClose(result) {
				eventBus.$emit('modalClose', result);
			},

            $modalSelect(array) {
                if (!('$selected' in array)) {
                    console.error('invalid array for $modalSelect');
                    return;
                }
                this.$modalClose(array.$selected);
            },

			$saveAndClose() {
				if (this.$isDirty)
					this.$save().then(() => this.$close());
				else
					this.$close();
			},

			$close() {
				if (this.$saveModified())
					this.$store.commit("close");
			},

			$searchChange() {
				let newUrl = this.$store.replaceUrlSearch(this.$baseUrl);
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
			},

			$format(value, dataType, format) {
				if (!format && !dataType)
					return value;
				if (dataType)
					value = utils.format(value, dataType);
				if (format && format.indexOf('{0}') !== -1)
					return format.replace('{0}', value);
				return value;
            },

            $expand(elem, propName) {
                let arr = elem[propName];
                if (arr.$loaded)
                    return;

                let self = this,
                    root = window.$$rootUrl,
                    url = root + '/_data/expand',
                    jsonData = utils.toJson({ baseUrl: self.$baseUrl, id: elem.$id });

                dataservice.post(url, jsonData).then(function (data) {
                    for (let el of data[propName])
                        arr.push(arr.$new(el));
                }).catch(function (msg) {
                    self.$alertUi(msg);
                 });

                arr.$loaded = true;
			},

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
				// TODO: get delegate from template
				return function (item, filter) {
					console.warn('filter:' + item.Id + " filter:" + filter.Filter);
					return true;
				}
			},

			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__queryChange(search) {
				this.$data.__baseUrl__ = this.$store.replaceUrlSearch(this.$baseUrl, search);
				this.$reload();
			}
		},
		created() {
			eventBus.$emit('registerData', this);

			/*
			TODO: а зачем это было ???
			if (!this.inDialog) {
				//alert(this.$data._query_);
				//this.$data._query_ = route.query;
			}
			*/

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);
			eventBus.$on('queryChange', this.__queryChange);

			this.$on('localQueryChange', this.__queryChange);
		},
		destroyed() {
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
			eventBus.$off('queryChange', this.__queryChange);
			this.$off('localQueryChange', this.__queryChange);
		},
		beforeUpdate() {
			this.__updateStartTime = performance.now();
		},
		updated() {
			log.time('update time:', this.__updateStartTime);
		}
    });
    
	app.components['baseController'] = base;
})();