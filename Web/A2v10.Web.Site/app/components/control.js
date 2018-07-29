// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180729-7259
// components/control.js

(function () {

	const utils = require('std:utils');
	const mask = require('std:mask');

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean,
			tabIndex: Number,
			dataType: String,
			validatorOptions: Object,
			updateTrigger: String,
			mask: String,
			testId: String
		},
		computed: {
			path() {
				return this.item._path_ + '.' + this.prop;
			},
			pathToValidate() {
				return this.itemToValidate._path_ + '.' + this.propToValidate;
			},
			modelValue() {
				if (!this.item) return null;
				let val = this.item[this.prop];
				if (this.dataType)
					return utils.format(val, this.dataType);
				else if (this.mask && val)
					return mask.getMasked(this.mask, val);
				return val;
			},
			errors() {
				if (!this.item) return null;
				let root = this.item._root_;
				if (!root) return null;
				if (!root._validate_)
					return null;
				let err;
				if (this.itemToValidate)
					err = root._validate_(this.itemToValidate, this.pathToValidate, this.itemToValidate[this.propToValidate], this.deferUpdate);
				else
					err = root._validate_(this.item, this.path, this.modelValue, this.deferUpdate);
				return err;
			},
			inputClass() {
				let cls = '';
				if (this.align && this.align !== 'left')
					cls += 'text-' + this.align;
				if (this.isNegative) cls += ' negative-red';
				return cls;
			},
			isNegative() {
				if (this.dataType === 'Number' || this.dataType === 'Currency')
					if (this.item && this.modelValue < 0)
						return true;
				return false;
			},
			hasLabel() {
				return !!this.label;
			},
			hasDescr() {
				return !!this.description;
			},
			maxLength() {
				if (!this.item) return undefined;
				if (!this.item.$maxLength) return undefined;
				return this.item.$maxLength(this.prop);
			}
		},
		mounted() {
			// direct parent only
			if (this.$parent.$registerControl)
				this.$parent.$registerControl(this);
			if (!this.mask) return;
			mask.mountElement(this.$refs.input, this.mask);
		},
		beforeDestroy() {
			// direct parent only
			if (this.$parent.$unregisterControl)
				this.$parent.$unregisterControl(this);
			if (!this.mask) return;
			mask.unmountElement(this.$refs.input, this.mask);
		},
		methods: {
			valid() {
				// method! no cache!
				return !this.invalid();
			},
			invalid(out) {
				// method! no cache!
				let err = this.errors;
				if (!err) return false;
				if (out) {
					out.warn = err.every(r => r.severity === 'warning');
					out.info = err.every(r => r.info === 'info');
				}
				return err.length > 0;
			},
			pending() {
				return this.errors && this.errors.pending > 0;
			},
			cssClass() {
				// method! no cached!!!
				let cls = 'control-group' + (this.invalid() ? ' invalid' : ' valid');
				if (this.required) cls += ' required';
				if (this.disabled) cls += ' disabled';
				return cls;
			},
			deferUpdate() {
				this.$children.forEach((val) => val.$forceUpdate());
				this.$forceUpdate();
			},
			test() {
				alert('from base control');
			}
		},
		watch: {
			mask() {
				mask.setMask(this.$refs.input, this.mask);
				if (this.updateValue)
					this.updateValue(this.$refs.input.value);
			}
		}
	};

	app.components['control'] = control;

})();