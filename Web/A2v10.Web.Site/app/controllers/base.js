/*20170823-7018*/
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
                alert('requery. Yet not implemented');
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