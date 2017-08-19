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