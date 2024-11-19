// Copyright © 2015-2019 Oleksandr Kukhtin. All rights reserved.

/*20190226-7444*/
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
			if (!this.options)
				return r;
			if (this.options.placement)
				r[this.options.placement] = true;
			if (this.options.width)
				r['with-width'] = true;
			return r;
		}
	}
});


Vue.component('a2-static-validator', {
	props: {
		item: {
			type: Object, default() {
				return {};
			}
		},
		prop: String
	},
	template: '<div v-if="invalid()" class="static-validator"><span v-for="err in errors" v-text="err.msg" :class="err.severity"></span></div>',
	computed: {
		path() {
			return this.item._path_ + '.' + this.prop;
		},
		modelValue() {
			if (!this.item) return null;
			return this.item[this.prop];
		},
		errors() {
			if (!this.item) return null;
			let root = this.item._root_;
			if (!root) return null;
			if (!root._validate_)
				return null;
			let err;
			err = root._validate_(this.item, this.path, this.modelValue, this.deferUpdate);
			return err;
		}
	},
	methods: {
		invalid(out) {
			// method! no cache!
			let err = this.errors;
			if (!err) return false;
			return err.length > 0;
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