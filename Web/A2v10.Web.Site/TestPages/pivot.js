/**
 * */

const nullstr = 'null';

const numFmt = (val) => val;

const rx = /(\d+)|(\D+)/g;
const rd = /\d/;
const rz = /^0/;

const getSort = function (sorters, attr) {
	if (sorters) {
		if (typeof sorters === 'function') {
			const sort = sorters(attr);
			if (typeof sort === 'function')
				return sort;
		} else if (attr in sorters)
			return sorters[attr];
	}
	return naturalSort;
};

const naturalSort = (a, b) => {
	// nulls first
	if (b !== null && a === null)
		return -1;
	if (a !== null && b === null)
		return 1;

	// then raw NaNs
	if (typeof a === 'number' && isNaN(a)) 
		return -1;
	if (typeof b === 'number' && isNaN(b))
		return 1;

	// numbers and numbery strings group together
	const nas = Number(a);
	const nbs = Number(b);
	if (nas < nbs)
		return -1;
	if (nas > nbs)
		return 1;

	// within that, true numbers before numbery strings
	if (typeof a === 'number' && typeof b !== 'number')
		return -1;
	if (typeof b === 'number' && typeof a !== 'number')
		return 1;
	if (typeof a === 'number' && typeof b === 'number')
		return 0;

	// 'Infinity' is a textual number, so less than 'A'
	if (isNaN(nbs) && !isNaN(nas))
		return -1;
	if (isNaN(nas) && !isNaN(nbs))
		return 1;

	// finally, "smart" string sorting per http://stackoverflow.com/a/4373421/112871
	let ax = String(a);
	let bx = String(b);
	if (ax === bx) {
		return 0
	}
	if (!rd.test(ax) || !rd.test(bx))
		return ax > bx ? 1 : -1;

	// special treatment for strings containing digits
	ax = ax.match(rx);
	bx = bx.match(rx);
	while (ax.length && bx.length) {
		const a1 = ax.shift();
		const b1 = bx.shift();
		if (a1 !== b1) {
			if (rd.test(a1) && rd.test(b1)) {
				return a1.replace(rz, '.0') - b1.replace(rz, '.0');
			}
			return a1 > b1 ? 1 : -1;
		}
	}
	return ax.length - bx.length;
}


const aggregatorTemplates = {
	sum(formatter) {
		return function ([attr]) {
			return function () {
				return {
					sum: 0,
					push(record) {
						if (!isNaN(parseFloat(record[attr]))) {
							this.sum += parseFloat(record[attr])
						}
					},
					value() {
						return this.sum
					},
					format: formatter,
					numInputs: typeof attr !== 'undefined' ? 0 : 1
				};
			};
		};
	},
	count(formatter) {
		return () =>
			function () {
				return {
					count: 0,
					push() {
						this.count++;
					},
					value() {
						return this.count;
					},
					format: formatter
				};
			};
	}
};

const aggregators = (tpl => ({
	Count: tpl.count(numFmt),
	Sum:   tpl.sum(numFmt)
}))(aggregatorTemplates);

class PivotData {
	constructor(props, data) {
		this.props = Object.assign({}, PivotData.defaultProps, props);
		this.tree = {};
		this.rowKeys = [];
		this.colKeys = [];
		this.rowTotals = {};
		this.colTotals = {};
		this.aggregator = this.props.aggregators[this.props.aggregatorName](this.props.vals);
		this.allTotal = this.aggregator(this, [], []);
		this.sorted = false;
		for (let itm of data) {
			this.processRecord(itm);
		}
	};
	processRecord(record) {
		const colKey = [];
		const rowKey = [];
		for (const x of Array.from(this.props.cols))
			colKey.push(x in record ? record[x] : 'null')
		for (const x of Array.from(this.props.rows))
			rowKey.push(x in record ? record[x] : 'null')
		const flatRowKey = rowKey.join(String.fromCharCode(0));
		const flatColKey = colKey.join(String.fromCharCode(0));

		this.allTotal.push(record)

		if (rowKey.length !== 0) {
			if (!this.rowTotals[flatRowKey]) {
				this.rowKeys.push(rowKey);
				this.rowTotals[flatRowKey] = this.aggregator(this, rowKey, []);
			}
			this.rowTotals[flatRowKey].push(record);
		}

		if (colKey.length !== 0) {
			if (!this.colTotals[flatColKey]) {
				this.colKeys.push(colKey);
				this.colTotals[flatColKey] = this.aggregator(this, [], colKey);
			}
			this.colTotals[flatColKey].push(record);
		}

		if (colKey.length !== 0 && rowKey.length !== 0) {
			if (!this.tree[flatRowKey]) {
				this.tree[flatRowKey] = {};
			}
			if (!this.tree[flatRowKey][flatColKey]) {
				this.tree[flatRowKey][flatColKey] = this.aggregator(this, rowKey, colKey);
			}
			this.tree[flatRowKey][flatColKey].push(record);
		}
	}

	sortKeys() {
		if (this.sorted)
			return;
		this.sorted = true;
		const v = (r, c) => this.getAggregator(r, c).value();
		switch (this.props.rowOrder) {
			case 'value_asc':
				this.rowKeys.sort((a, b) => naturalSort(v(a, []), v(b, [])));
				break;
			case 'value_desc':
				this.rowKeys.sort((a, b) => -naturalSort(v(a, []), v(b, [])));
				break;
			default:
				this.rowKeys.sort(this.arrSort(this.props.rows));
				break;
		}
		switch (this.props.colOrder) {
			case 'value_asc':
				this.colKeys.sort((a, b) => naturalSort(v([], a), v([], b)));
				break;
			case 'value_desc':
				this.colKeys.sort((a, b) => -naturalSort(v([], a), v([], b)));
				break;
			default:
				this.colKeys.sort(this.arrSort(this.props.cols));
				break;
		}
	}

	arrSort(attrs) {
		let a
		const sortersArr = (() => {
			const result = [];
			for (a of Array.from(attrs)) {
				result.push(getSort(this.props.sorters, a));
			}
			return result;
		})();
		return function (a, b) {
			for (const i of Object.keys(sortersArr || {})) {
				const sorter = sortersArr[i];
				const comparison = sorter(a[i], b[i]);
				if (comparison !== 0) {
					return comparison;
				}
			}
			return 0;
		};
	}

	getRowKeys() {
		this.sortKeys();
		return this.rowKeys;
	}

	getColKeys() {
		this.sortKeys();
		return this.colKeys;
	}

	getAggregator(rowKey, colKey) {
		let agg;
		const flatRowKey = rowKey.join(String.fromCharCode(0));
		const flatColKey = colKey.join(String.fromCharCode(0));
		if (rowKey.length === 0 && colKey.length === 0)
			agg = this.allTotal;
		else if (rowKey.length === 0)
			agg = this.colTotals[flatColKey];
		else if (colKey.length === 0)
			agg = this.rowTotals[flatRowKey];
		else
			agg = this.tree[flatRowKey][flatColKey];
		return (
			agg || {
				value() {
					return null
				},
				format() {
					return ''
				}
			}
		);
	}
};

PivotData.defaultProps = {
	cols: [],
	rows: [],
	vals: [],
	aggregators: aggregators,
	aggregatorName: 'Sum',
	rowOrder: 'asc',
	colOrder: 'asc'
};

function makeTableRenderer(data) {
	return {
		props: {
			pivot: { type: Object, reqired: true },
			rowTotal: Boolean,
			colTotal: Boolean,
			titles: Object
		},
		methods: {
			spanSize(arr, i, j) {
				// helper function for setting row/col-span in pivotTableRenderer
				let x;
				if (i !== 0) {
					let asc, end;
					let noDraw = true;
					for (
						x = 0, end = j, asc = end >= 0;
						asc ? x <= end : x >= end;
						asc ? x++ : x--
					) {
						if (arr[i - 1][x] !== arr[i][x]) {
							noDraw = false;
						}
					}
					if (noDraw)
						return -1;
				}
				let len = 0;
				while (i + len < arr.length) {
					let asc1, end1;
					let stop = false;
					for (
						x = 0, end1 = j, asc1 = end1 >= 0;
						asc1 ? x <= end1 : x >= end1;
						asc1 ? x++ : x--
					) {
						if (arr[i][x] !== arr[i + len][x])
							stop = true;
					}
					if (stop)
						break;
					len++;
				}
				return len;
			}
		},
		render(h) {
			const pivot = this.pivot;
			const colKeys = pivot.getColKeys();
			const rowKeys = pivot.getRowKeys();
			const colAttrs = pivot.props.cols;
			const rowAttrs = pivot.props.rows;
			const grandTotalAggregator = pivot.getAggregator([], []);
			return h('table', {
				class: 'pivot-table'
			},
			[
				h('thead', {}, [
					colAttrs.map((c, j) => {
						return h('tr', {
							attrs: {
								key: `col-${j}`
							}
						},
						[
							j === 0 && rowAttrs.length !== 0 ? h('th', {
								attrs: {
									colSpan: rowAttrs.length,
									rowSpan: colAttrs.length
								}
							}) : undefined,

							h('th', {
								class: 'pvt-axis-label'
							}, this.titles[c] || c),

							colKeys.map((colKey, i) => {
								const x = this.spanSize(colKeys, i, j)
								if (x === -1)
									return null
								return h('th', {
									class: 'pvt-col-label',
									attrs: {
										key: `col-${i}`,
										colSpan: x,
										rowSpan: j === colAttrs.length - 1 && rowAttrs.length !== 0 ? 2 : 1
									}
								}, colKey[j])
							}),
							j === 0 && this.rowTotal ? h('th', {
								class: 'pvt-total-label',
								attrs: {
									rowSpan: colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
								}
							}, this.titles.Total || 'Total') : undefined
						])
					}),
					rowAttrs.length !== 0 ? h('tr',
						[
							rowAttrs.map((r, i) => {
								return h('th', {
									class: 'pvt-axis-label',
									attrs: {
										key: `row-${i}`
									}
								}, this.titles[r] || r)
							}),

							this.rowTotal
								? h('th', {
									class: 'pvt-total-label'
								}, colAttrs.length === 0 ? this.titles.Total || 'Total' : null)
								: (colAttrs.length === 0 ? undefined : h('th', { class: 'pvt-total-label' }, null))
						]
					) : undefined
				]),
				h('tbody', {}, [
					rowKeys.map((rowKey, i) => {
						const totalAggregator = pivot.getAggregator(rowKey, [])
						return h('tr', {
							attrs: {
								key: `row-${i}`
							}
						},
						[
							rowKey.map((text, j) => {
								const x = this.spanSize(rowKeys, i, j)
								if (x === -1) {
									return null
								}
								return h('td', {
									class: 'pvt-row-label',
									attrs: {
										key: `row-key-${i}-${j}`,
										rowSpan: x,
										colSpan: j === rowAttrs.length - 1 && colAttrs.length !== 0 ? 2 : 1
									}
								}, text)
							}),

							colKeys.map((colKey, j) => {
								const aggregator = pivot.getAggregator(rowKey, colKey)
								return h('td', {
									class: 'pvt-val',
									//style: valueCellColors(rowKey, colKey, aggregator.value()),
									attrs: {
										key: `val-${i}-${j}`
									},
									on: undefined
								}, aggregator.format(aggregator.value()))
							}),

							this.rowTotal ? h('td', {
								class: 'pvt-total',
								//style: colTotalColors(totalAggregator.value()),
								on: undefined
							}, totalAggregator.format(totalAggregator.value())) : undefined
						])
					}),
					h('tr', {},
					[
						this.colTotal ? h('td', {
							class: 'pvt-total-label',
							attrs: {
								colSpan: rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)
							}
						}, this.titles.Total || 'Total') : undefined,
						this.colTotal ? colKeys.map((colKey, i) => {
							const totalAggregator = pivot.getAggregator([], colKey)
							return h('td', {
								class: 'pvt-total',
								//style: rowTotalColors(totalAggregator.value()),
								attrs: {
									key: `total-${i}`
								},
								on: undefined
							}, totalAggregator.format(totalAggregator.value()))
						}) : undefined,
						this.colTotal && this.rowTotal ? h('td', {
							class: 'pvt-grand-total',
							on: undefined
						}, grandTotalAggregator.format(grandTotalAggregator.value())) : undefined
					]
					)
				])
			]
			);
		}
	};
}

Vue.component('pivot-table', {
	props: {
		items: Array,
		cols: Array,
		rows: Array,
		vals: Array,
		titles: Object,
		aggregatorName: String,
		rowTotal: {
			type: Boolean,
			default: true
		},
		colTotal: {
			type: Boolean,
			default: true
		}
	},
	render(h) {
		return h('div', { 'class': 'pivot-wrapper' }, [
			h(makeTableRenderer(), {
				props: {
					pivot: this.groupedItems,
					rowTotal: this.rowTotal,
					colTotal: this.colTotal,
					titles: this.titles,
				}
			})]
		);
	},
	computed: {
		groupedItems() {
			return new PivotData({
				cols: this.cols,
				rows: this.rows,
				vals: this.vals,
				titles: this.titles,
				aggregatorName: this.aggregatorName
			}, this.items);
		}
	},
});
