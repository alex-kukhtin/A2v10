(function () {


    /**
     * Базовый контроллер DataModelController
     */
    const store = require('store');

    const base = Vue.extend({
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
                alert(JSON.stringify(this.$data, function (key, value) {
                    return (key[0] === '$' || key[0] === '_') ? undefined : value;
                }, 2));
                this.$data.$setDirty(false);
                //TODO: promise
            },
            $reload() {
                let dat = this.$data;
                dat.$merge(modelData);
                dat.$setDirty(false);
                //TODO: promise
            },
            $showDialog(url) {
                var dat = { x: 5, y: 10, promise: null };
                var x = store.$emit('modal', url, dat);
                return dat.promise;
                /*
                dat.promise.then(function (result) {
                    alert('then:' + result);
                })
                alert('resturs:' + dat.promise);
                */
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
            // TODO: register data
            //alert(this.$data.Customers.length);
        },
        destroyed() {
            // TODO: unregister data
            alert('base controller destroyed ');
        }
    });
    
    app.components['baseController'] = base;

})();