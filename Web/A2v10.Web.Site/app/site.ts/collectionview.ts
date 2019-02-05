// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20180813-7271
// components/collectionview.ts

/*
TODO:
11. GroupBy
*/

declare function require(name: string, throwError?: boolean);

interface VueOpts {
	template: string,
	data():object,
	props?: any,
	watch?:object,
	computed?: object,
	methods?: object,
	created(): void
	updated?: () => void
}

interface VueInterace {
	component(name: string, opts: VueOpts): any;
}
declare let Vue: VueInterace;
 
(function () {


	const log = require('std:log', true); // no error
	const utils = require('std:utils');
	const period = require('std:period');

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
			if (period.isPeriod(fVal)) {
				nq[x] = fVal.format('DateUrl');
			}
			else if (utils.isDate(fVal)) {
				nq[x] = utils.format(fVal, 'DateUrl');
			}
			else if (utils.isObjectExact(fVal)) {
				if (!('Id' in fVal)) {
					console.error('The object in the Filter does not have Id property');
				}
				nq[x] = fVal.Id ? fVal.Id : undefined;
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

	function modelInfoToFilter(q, filter):void {
		if (!q) return;
		for (let x in filter) {
			if (x in q) {
				let iv = filter[x];
				if (period.isPeriod(iv)) {
					filter[x] = iv.fromUrl(q[x]);
				}
				else if (utils.isDate(iv)) {
					filter[x] = utils.date.tryParse(q[x]);
				}
				else if (utils.isObjectExact(iv)) 
					iv.Id = q[x];
				else {
					filter[x] = q[x];
				}
			}
		}
	}

	// client collection

	Vue.component('collection-view', {
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
			let lq = (<any>Object).assign({}, {
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
			pageSize():number {
				if (this.initialPageSize > 0)
					return this.initialPageSize;
				return -1; // invisible pager
			},
			dir():string {
				return this.localQuery.dir;
			},
			offset() {
				return this.localQuery.offset;
			},
			order():string {
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
				(<any>arr).$origin = this.ItemsSource;
				if (arr.indexOf((<any>arr).$origin.$selected) === -1) {
					// not found in target array
					(<any>arr).$origin.$clearSelected();
				}
				if (log) log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
				return this.ItemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages(): number {
				let cnt = this.filteredCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			$setOffset(offset):void {
				this.localQuery.offset = offset;
			},
			sortDir(order):string {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order):void {
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
		created():void {
			if (this.initialSort) {
				this.localQuery.order = this.initialSort.order;
				this.localQuery.dir = this.initialSort.dir;
			}
			this.$on('sort', this.doSort);
		}
	});


	// server collection view
	Vue.component('collection-view-server', {
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
			jsonFilter():string {
				return utils.toJson(this.filter);
			},
			thisPager():object {
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
			pages():number {
				let cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			},
			sourceCount():number {
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
			},
			updateFilter() {
				let mi = this.ItemsSource.$ModelInfo;
				if (!mi) return;
				let fi = mi.Filter;
				if (!fi) return;
				this.lockChange = true;
				for (var prop in this.filter) {
					if (prop in fi)
						this.filter[prop] = fi[prop];
				}
				this.$nextTick(() => {
					this.lockChange = false;
				});
			}
		},
		created():void {
			// get filter values from modelInfo
			let mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
			if (mi) {
				modelInfoToFilter(mi.Filter, this.filter);
			}
			this.$nextTick(() => {
				this.lockChange = false;
			});
			// from datagrid, etc
			this.$on('sort', this.doSort);
		},
		updated():void {
			this.updateFilter();
		}
	});
})();