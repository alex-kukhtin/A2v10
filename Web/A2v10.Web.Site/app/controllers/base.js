/*20170819-7016*/
/*controllers/base.js*/
(function () {

    const store = require('store');
    const utils = require('utils');
    const dataservice = require('std:dataservice');

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
                // TODO: make URL ???? Id ??
                var url = '/_data/save';
                return new Promise(function (resolve, reject) {
                    var jsonData = utils.toJson({ baseUrl: self.__baseUrl__, data: self.$data });
                    dataservice.post(url, jsonData).then(function () {
                        self.$data.$setDirty(false);
                        resolve(true);
                    }).catch(function (result) {
                        alert('save error:' + result);
                    });
                });
            },
            $reload() {
                var url = '/_data/reload';
                let dat = this.$data;
                return new Promise(function (resolve, reject) {
                    var jsonData = utils.toJson({ baseUrl: self.__baseUrl__ });
                    dataservice.post(url, jsonData).then(function (data) {
                        alert('reload success')
                        dat.$merge(data);
                        dat.$setDirty(false);
                    }).catch(function (error) {
                        alert('reload error:' + error);
                    });
                });
            },
            $requery() {
                alert('requery here');
            },
            $dialog(command, url, data) {
                var dlgData = { promise: null, data: data };
                store.$emit('modal', url, dlgData);
                // TODO: use command!!!
                return dlgData.promise;
                /*
                dlgData.promise.then(function (result) {
                    alert('then:' + result);
                })
                alert('resturs:' + dat.promise);
                */
            },
            $saveAndClose(result) {
                this.$save().then(function () {
                    store.$emit('modalClose', true);
                });
            },
            $closeModal(result) {
                store.$emit('modalClose', result);
            },
            $onSort(column, dir) {
                //alert('sort on ' + column + ':' + dir);
                //location.hash = { sort }
                let q = store.query;
                let qdir = q.dir;
                if (q.sort === column)
                    qdir = qdir === 'asc' ? 'desc' : 'asc';
                store.query = { sort: column, dir: qdir };
            }
        },
        created() {
            console.warn('TODO: register debug data');
        },
        destroyed() {
            console.warn('TODO: unregister debug data');
        }
    });
    
    app.components['baseController'] = base;

})();