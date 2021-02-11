// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210211-7747*/
/* services/impl/array.js */

app.modules['std:impl:array'] = function () {

	const utils = require('std:utils');

	return {
		defineArray,
		defineArrayItemProto
	};

	function emitSelect(arr, item) {
		let selectEvent = arr._path_ + '[].select';
		arr._root_.$emit(selectEvent, arr/*array*/, item);
	}

	function defineArray(arr) {

		arr.$lock = false;

		arr.$lockUpdate = function (lock) {
			this.$lock = lock;
		};

		arr.$new = function (src) {
			let newElem = new this._elem_(src || null, this._path_ + '[]', this);
			newElem.__checked = false;
			return newElem;
		};

		arr.$sum = function (fn) {
			return this.reduce((a, c) => a + fn(c), 0);
		};

		arr.$find = function (fc, thisArg) {
			for (let i = 0; i < this.length; i++) {
				let el = this[i];
				if (fc.call(thisArg, el, i, this))
					return el;
				if ('$items' in el) {
					let x = el.$items.$find(fc, thisArg);
					if (x)
						return x;
				}
			}
			return null;
		}

		arr.$sort = function (compare) {
			this.sort(compare);
			this.$renumberRows();
			return this;
		};

		arr.$copy = function (src) {
			if (this.$root.isReadOnly)
				return this;
			this.$empty();
			if (utils.isArray(src)) {
				for (let i = 0; i < src.length; i++) {
					this.push(this.$new(src[i]));
				}
			}
			this.$renumberRows();
			return this;
		};

		arr.$select = function(elem) {
			elem.$select();
		};

		arr.$clearSelected = function () {
			let sel = this.$selected;
			if (!sel) return this; // already null
			sel.$selected = false;
			emitSelect(this, null);
			return this;
		};


		addResize(arr);
	}

	function addResize(arr) {

		arr.$empty = function () {
			if (this.$root.isReadOnly)
				return this;
			this.splice(0, this.length);
			if ('$RowCount' in this)
				this.$RowCount = 0;
			return this;
		};

		arr.$append = function (src) {
			return this.$insert(src, 'end');
		};

		arr.$prepend = function (src) {
			return this.$insert(src, 'start');
		};

		arr.$insert = function (src, to, current) {
			const that = this;

			function append(src, select) {
				let addingEvent = that._path_ + '[].adding';
				let newElem = that.$new(src);
				// emit adding and check result
				let er = that._root_.$emit(addingEvent, that/*array*/, newElem/*elem*/);
				if (er === false)
					return null; // disabled
				let len = that.length;
				let ne = null;
				let ix;
				switch (to) {
					case 'end':
						len = that.push(newElem);
						ne = that[len - 1]; // maybe newly created reactive element
						break;
					case 'start':
						that.unshift(newElem);
						ne = that[0];
						len = 1;
						break;
					case 'above':
						ix = that.indexOf(current);
						that.splice(ix, 0, newElem);
						ne = that[ix];
						len = ix + 1;
						break;
					case 'below':
						ix = that.indexOf(current) + 1;
						that.splice(ix, 0, newElem);
						ne = that[ix];
						len = ix + 1;
						break;
				}
				if ('$RowCount' in that) that.$RowCount += 1;
				let eventName = that._path_ + '[].add';
				that._root_.$setDirty(true);
				that._root_.$emit(eventName, that /*array*/, ne /*elem*/, len - 1 /*index*/);
				if (select) {
					ne.$select();
					emitSelect(that, ne);
				}
				// set RowNumber
				if ('$rowNo' in newElem._meta_) {
					let rowNoProp = newElem._meta_.$rowNo;
					for (let i = 0; i < that.length; i++)
						that[i][rowNoProp] = i + 1; // 1-based
				}
				if (that.$parent) {
					let m = that.$parent._meta_;
					if (m.$hasChildren && that._path_.endsWith('.' + m.$items)) {
						that.$parent[m.$hasChildren] = true;
					}
				}
				return ne;
			}

			if (utils.isArray(src)) {
				let ra = [];
				let lastElem = null;
				src.forEach(function (elem) {
					lastElem = append(elem, false);
					ra.push(lastElem);
				});
				if (lastElem) {
					// last added element
					lastElem.$select();
				}
				return ra;
			} else
				return append(src, true);
		};

		arr.$renumberRows = function () {
			if (!this.length) return this;
			let item = this[0];
			// renumber rows
			if ('$rowNo' in item._meta_) {
				let rowNoProp = item._meta_.$rowNo;
				for (let i = 0; i < this.length; i++) {
					this[i][rowNoProp] = i + 1; // 1-based
				}
			}
			return this;
		};

		arr.$remove = function (item) {
			if (this.$root.isReadOnly)
				return this;
			if (!item)
				return this;
			let index = this.indexOf(item);
			if (index === -1)
				return this;
			this.splice(index, 1);
			if ('$RowCount' in this) this.$RowCount -= 1;
			// EVENT
			let eventName = this._path_ + '[].remove';
			this._root_.$setDirty(true);
			this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);

			if (!this.length) {
				if (this.$parent) {
					let m = this.$parent._meta_;
					if (m.$hasChildren && this._path_.endsWith('.' + m.$items)) {
						this.$parent[m.$hasChildren] = false;
					}
					// try to select parent element
					if (m.$items)
						this.$parent.$select();
				}
				return this;
			}
			if (index >= this.length)
				index -= 1;
			this.$renumberRows();
			if (this.length > index) {
				this[index].$select();
			}
			return this;
		};

	}

	function defineArrayItemProto(elem) {
		let proto = elem.prototype;

		proto.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};

		proto.$select = function (root) {
			let arr = root || this._parent_;
			let sel = arr.$selected;
			if (sel === this) return;
			if (sel) sel.$selected = false;
			this.$selected = true;
			emitSelect(arr, this);
			if (this._meta_.$items) {
				// expand all parent items
				let p = this._parent_._parent_;
				while (p) {
					if (!p || p === this.$root)
						break;
					p.$expanded = true;
					p = p._parent_._parent_;
				}
			}
		};

	}
};
