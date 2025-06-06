﻿// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250522-7983
// components/control.js

(function () {

	const utils = require('std:utils');
	const mask = require('std:mask');
	const maccel = require('std:accel');

	const control = {
		props: {
			label: String,
			required: Boolean,
			align: { type: String, default: 'left' },
			description: String,
			disabled: Boolean,
			tabIndex: Number,
			dataType: String,
			format: String,
			validatorOptions: Object,
			updateTrigger: String,
			mask: String,
			hideZeros: Boolean,
			testId: String,
			accel: String,
			highlight: Boolean
		},
		computed: {
			path() {
				if (this.item._path_)
					return this.item._path_ + '.' + this.prop;
				else
					return this.prop;
			},
			pathToValidate() {
				return this.itemToValidate._path_ + '.' + this.propToValidate;
			},
			modelValue() {
				if (!this.item) return null;
				let val = this.item[this.prop];
				if (this.dataType)
					return utils.format(val, this.dataType, {hideZeros: this.hideZeros, format: this.format });
				else if (this.mask && val)
					return mask.getMasked(this.mask, val);
				return val;
			},
			hasValue() {
				if (!this.item) return false;
				let val = this.item[this.prop];
				if (!val) return false;
				if (utils.isObjectExact(val))
					return !!val.Id;
				return true;
			},
			modelValueRaw() {
				if (!this.item) return null;
				let val = this.item[this.prop];
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
					err = root._validate_(this.item, this.path, this.modelValueRaw, this.deferUpdate);
				return err;
			},
			inputClass() {
				let cls = '';
				if (this.align && this.align !== 'left')
					cls += 'text-' + this.align;
				if (this.isNegative) cls += ' negative-red';
				if (this.updateTrigger === 'input')
					cls += ' trigger-input';
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
			if (this.accel)
				this._accelKey = maccel.registerControl(this.accel, this.$refs.input, 'focus');
			if (!this.mask) return;
			mask.mountElement(this.$refs.input, this.mask);
		},
		beforeDestroy() {
			// direct parent only
			if (this.$parent.$unregisterControl)
				this.$parent.$unregisterControl(this);
			if (this.accel)
				maccel.unregisterControl(this._accelKey);
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
					out.info = err.every(r => r.severity === 'info');
					out.all = err.length;
				}
				return err.length > 0;
			},
			pending() {
				return this.errors && this.errors.pending > 0;
			},
			cssClass() {
				// method! no cached!!!
				let out = {};
				let inv = this.invalid(out);
				let cls = 'control-group' + (inv ? ' invalid' : ' valid');
				//console.dir(out);
				if (inv && out.warn)
					cls += ' val-warning';
				else if (inv && out.info)
					cls += ' val-info';
				if (this.required) cls += ' required';
				if (this.disabled) cls += ' disabled';
				if (this.highlight && this.hasValue)
					cls += ' has-value';
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