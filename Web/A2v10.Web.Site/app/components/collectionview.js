// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180504-7175
// components/collectionview.js

/*
TODO:
11. GroupBy
*/

(function () {


	const log = require('std:log');
	const utils = require('std:utils');

	const DEFAULT_PAGE_SIZE = 20;

	function getModelInfoProp(src, propName) {
		if (!src) return undefined;
		let mi = src.$ModelInfo;
		if (!mi) return undefined;
		return mi[propName];
	}

	function setModelInfoProp(src, propName, value) {
		if (!src) return;
		let mi = src.$ModelInfo;
		if (!mi) return;
		mi[propName] = value;
	}

	function makeNewQueryFunc(that) {
		let nq = { dir: that.dir, order: that.order, offset: that.offset };
		for (let x in that.filter) {
			let fVal = that.filter[x];
			if (x === 'Period') {
				nq[x] = utils.period.format(fVal, 'DateUrl');
			}
			else if (utils.isDate(fVal)) {
				nq[x] = utils.format(fVal, 'DateUrl');
			}
			else if (utils.isObjectExact(fVal)) {
				if (!('Id' in fVal)) {
					console.error('The object in the Filter does not have Id property');
				}
				nq[x] = fVal.Id;
			}
			else if (fVal) {
				nq[x] = fVal;
			}
			else {
				nq[x] = undefined;
			}
		}
		return nq;
	}

	// client collection

	Vue.component('collection-view', {
		//store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialPageSize: Number,
			initialFilter: Object,
			initialSort: Object,
			runAt: String,
			filterDelegate: Function
		},
		data() {
			let lq = Object.assign({}, {
				offset: 0,
				dir: 'asc',
				order: ''
			}, this.initialFilter);

			return {
				filter: this.initialFilter,
				filteredCount: 0,
				localQuery: lq
			};
		},
		computed: {
			pageSize() {
				if (this.initialPageSize > 0)
					return this.initialPageSize;
				return -1; // invisible pager
			},
			dir() {
				return this.localQuery.dir;
			},
			offset() {
				return this.localQuery.offset;
			},
			order() {
				return this.localQuery.order;
			},
			pagedSource() {
				let s = performance.now();
				let arr = [].concat(this.ItemsSource);

				if (this.filterDelegate) {
					arr = arr.filter((item) => this.filterDelegate(item, this.filter));
				}
				// sort
				if (this.order && this.dir) {
					let p = this.order;
					let d = this.dir === 'asc';
					arr.sort((a, b) => {
						if (a[p] === b[p])
							return 0;
						else if (a[p] < b[p])
							return d ? -1 : 1;
						return d ? 1 : -1;
					});
				}
				// HACK!
				this.filteredCount = arr.length;
				// pager
				if (this.pageSize > 0)
					arr = arr.slice(this.offset, this.offset + this.pageSize);
				arr.$origin = this.ItemsSource;
				if (arr.indexOf(arr.$origin.$selected) === -1) {
					// not found in target array
					arr.$origin.$clearSelected();
				}
				log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
				return this.ItemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages() {
				let cnt = this.filteredCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			$setOffset(offset) {
				this.localQuery.offset = offset;
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				let nq = this.makeNewQuery();
				if (nq.order === order)
					nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
				}
				if (!nq.order)
					nq.dir = null;
				// local
				this.localQuery.dir = nq.dir;
				this.localQuery.order = nq.order;
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			copyQueryToLocal(q) {
				for (let x in q) {
					let fVal = q[x];
					if (x === 'offset')
						this.localQuery[x] = q[x];
					else
						this.localQuery[x] = fVal ? fVal : undefined;
				}
			}
		},
		created() {
			if (this.initialSort) {
				this.localQuery.order = this.initialSort.order;
				this.localQuery.dir = this.initialSort.dir;
			}
			this.$on('sort', this.doSort);
		}
	});


	// server collection view
	Vue.component('collection-view-server', {
		//store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialFilter: Object
		},

		data() {
			return {
				filter: this.initialFilter,
				lockChange: true
			};
		},

		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},

		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			thisPager() {
				return this;
			},
			pageSize() {
				return getModelInfoProp(this.ItemsSource, 'PageSize');
			},
			dir() {
				return  getModelInfoProp(this.ItemsSource, 'SortDir');
			},
			order() {
				return getModelInfoProp(this.ItemsSource, 'SortOrder');
			},
			offset() {
				return getModelInfoProp(this.ItemsSource, 'Offset');
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			}
		},
		methods: {
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, 'Offset', offset);
				this.reload();
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				if (order === this.order) {
					let dir = this.dir === 'asc' ? 'desc' : 'asc';
					setModelInfoProp(this.ItemsSource, 'SortDir', dir);
				} else {
					setModelInfoProp(this.ItemsSource, 'SortOrder', order);
					setModelInfoProp(this.ItemsSource, 'SortDir', 'asc');
				}
				this.reload();
			},
			filterChanged() {
				if (this.lockChange) return;
				let mi = this.ItemsSource.$ModelInfo;
				if (!mi) {
					mi = { Filter: this.filter };
					this.ItemsSource.$ModelInfo = mi;
				}
				else {
					this.ItemsSource.$ModelInfo.Filter = this.filter;
				}
				if ('Offset' in mi)
					setModelInfoProp(this.ItemsSource, 'Offset', 0);
				this.reload();
			},
			reload() {
				this.$root.$emit('cwChange', this.ItemsSource);
			}
		},
		created() {
			// get filter values from modelInfo
			let mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
			if (mi) {
				let q = mi.Filter;
				if (q) {
					for (let x in this.filter) {
						if (x in q) this.filter[x] = q[x];
					}
				}
			}
			this.$nextTick(() => {
				this.lockChange = false;
			});
			// from datagrid, etc
			this.$on('sort', this.doSort);
		}
	});

	// server url collection view
	Vue.component('collection-view-server-url', {
		store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter" :GroupBy="groupBy">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialFilter: Object
		},
		data() {
			return {
				filter: this.initialFilter,
				groupBy: null,
				lockChange: true
			};
		},
		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},
		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			pageSize() {
				let ps = getModelInfoProp(this.ItemsSource, 'PageSize');
				return ps ? ps : DEFAULT_PAGE_SIZE;
			},
			dir() {
				let dir = this.$store.getters.query.dir;
				if (!dir) dir = getModelInfoProp(this.ItemsSource, 'SortDir');
				return dir;
			},
			offset() {
				let ofs = this.$store.getters.query.offset;
				if (!utils.isDefined(ofs))
					ofs = getModelInfoProp(this.ItemsSource, 'Offset');
				return ofs || 0;
			},
			order() {
				return getModelInfoProp(this.ItemsSource,'SortOrder');
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			},
			thisPager() {
				return this;
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			commit(query) {
				//console.dir(this.$root.$store);
				this.$store.commit('setquery', query);
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, "Offset", offset);
				this.commit({ offset: offset });
			},
			doSort(order) {
				let nq = this.makeNewQuery();
				if (nq.order === order)
					nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
				}
				if (!nq.order)
					nq.dir = null;
				this.commit(nq);
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			filterChanged() {
				if (this.lockChange) return;
				// for server only
				let nq = this.makeNewQuery();
				nq.offset = 0;
				if (!nq.order) nq.dir = undefined;
				//console.warn('filter changed');
				this.commit(nq);
			}
		},
		created() {
			// get filter values from modelInfo and then from query
			let mi = this.ItemsSource.$ModelInfo;
			if (mi) {
				let q = mi.Filter;
				if (q) {
					for (let x in this.filter) {
						if (x in q) {
							let iv = this.filter[x];
							if (utils.isDate(iv)) {
								this.filter[x] = utils.date.tryParse(q[x]);
							} else {
								this.filter[x] = q[x];
							}
						}
					}
				}
			}
			// then query from url
			let q = this.$store.getters.query;
			for (let x in this.filter) {
				if (x in q) {
					let iv = this.filter[x];
					if (utils.isDate(iv)) {
						this.filter[x] = utils.date.tryParse(q[x]);
					} else {
						this.filter[x] = q[x];
					}
				}
			}

			this.$nextTick(() => {
				this.lockChange = false;
			});

			this.$on('sort', this.doSort);
		}
	});

})();