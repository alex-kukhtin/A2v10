// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180106-7085*/
/*components/validator.js*/

Vue.component('validator', {
    props: {
        invalid: Function,
        errors: Array,
        options: Object
    },
    template: '<div v-if="invalid()" class="validator" :class="cssClass" :style="cssStyle"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
    computed: {
        cssStyle() {
            let r = {};
            if (this.options && this.options.width)
                r.width = this.options.width;
            return r;
        },
        cssClass() {
            let r = {};
            if (this.options && this.options.placement)
                r[this.options.placement] = true;
            return r;
        }
    }
});


/*
TODO: нужно, чтобы добавлялся invalid для родительского элемента.
Vue.component('validator-control', {
    template: '<validator :invalid="invalid" :errors="errors"></validator></div>',
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
*/