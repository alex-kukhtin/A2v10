(function () {

	const control = {
		props: {
			label: String,
			required: Boolean,
            align: { type: String, default: 'left' }
		},
        computed: {
            path() {
                return this.item._path_ + '.' + this.prop;
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
                return root._validate_(this.item, this.path, this.item[this.prop]);
            },
            cssClass() {
				let cls = 'control-group' + (this.invalid ? ' invalid' : ' valid');
				if (this.required)
					cls += ' required';
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