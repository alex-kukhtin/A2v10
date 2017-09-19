/* 20170919-7035 */
/*components/validator.js*/

Vue.component('validator', {
        props: ['invalid', 'errors'],
        template: '<div v-if="invalid" class="validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
});


Vue.component('validator-control', {
    template: '<div>111<validator :invalid="invalid" :errors="errors"></validator></div>',
    props: {
        item: {
            type: Object, default() {
                return {};
            }
        },
        prop: String
    },
    created() {
        alert(this.errors);
    },
    computed: {
        path() {
            return this.item._path_ + '.' + this.prop;
        },
        invalid() {
            let err = this.errors;
            return err && err.length > 0;
        },
        errors() {
            if (!this.item) return null;
            let root = this.item._root_;
            if (!root) return null;
            if (!root._validate_)
                return null;
            return root._validate_(this.item, this.path, this.item[this.prop]);
        },
    }
});