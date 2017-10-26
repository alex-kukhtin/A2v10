/*20171026-7056*/
/*components/control.js*/

(function () {

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean,
            tabIndex: Number
		},
        computed: {
			path() {
                return this.item._path_ + '.' + this.prop;
            },
            pathToValidate() {
                return this.itemToValidate._path_ + '.' + this.propToValidate;
            },
            valid() {
                return !this.invalid;
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
                if (this.itemToValidate)
                    return root._validate_(this.itemToValidate, this.pathToValidate, this.itemToValidate[this.propToValidate]);
                return root._validate_(this.item, this.path, this.item[this.prop]);
            },
            cssClass() {
				let cls = 'control-group' + (this.invalid ? ' invalid' : ' valid');
				if (this.required) cls += ' required';
				if (this.disabled) cls += ' disabled';
                return cls;
            },
            inputClass() {
                let cls = '';
                if (this.align !== 'left')
                    cls += 'text-' + this.align;
                return cls;
			},
			hasLabel() {
				return !!this.label;
			},
			hasDescr() {
				return !!this.description;
			}
        },
        methods: {
            test() {
                alert('from base control');
            }
        }
    };

    app.components['control'] = control;

})();