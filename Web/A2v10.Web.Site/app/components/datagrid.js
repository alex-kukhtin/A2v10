// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250424-7975
// components/datagrid.js*/

(function () {

	/**
	 * Some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable
	 * Groupings. "v-show" on a line is much faster than "v-if" on an entire template.
	 */

	const utils = require('std:utils');
	const log = require('std:log');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const eqlower = utils.text.equalNoCase;

	const dataGridTemplate = `
<div v-lazy="itemsSource" :class="{'data-grid-container':true, 'fixed-header': fixedHeader, 'bordered': border, 'compact': compact}" :test-id="testId">
	<div class="data-grid-header-border" v-if="fixedHeader" />
	<div :class="{'data-grid-body': true, 'fixed-header': fixedHeader}">
	<div class="data-grid-empty" v-if="$isEmpty">
		<slot name="empty" />
	</div>
	<table :class="cssClass">
		<colgroup>
			<col v-if="isMarkCell" class="fit"/>
			<col v-if="isRowDetailsCell" class="fit" />
			<col v-bind:class="columnClass(col, colIndex)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
		</colgroup>
		<thead>
			<tr v-show="isHeaderVisible">
				<th v-if="isMarkCell" class="marker"><div v-if=fixedHeader class="h-fill"></div><div v-if=fixedHeader class="h-holder">&#160;</div></th>
				<th v-if="isRowDetailsCell" class="details-marker"><div v-if="fixedHeader" class="h-holder">&#160;</div></th>
				<slot></slot>
			</tr>
		</thead>
		<template v-if="isGrouping">
			<tbody>
				<template v-for="(g, gIndex) of $groups">
					<tr v-if="isGroupGroupVisible(g)" :class="'group lev-' + g.level" :key="gIndex">
						<td @click.prevent='toggleGroup(g)' :colspan="groupColumns">
						<span :class="{expmark: true, expanded: g.expanded}" />
						<span class="grtitle" v-text="groupTitle(g)" />
						<span v-if="isGroupCountVisible(g)" class="grcount" v-text="g.count" /></td>
					</tr>
					<template v-for="(row, rowIndex) in g.items">
						<data-grid-row v-show="isGroupBodyVisible(g)" :group="true" :level="g.level" :cols="columns" :row="row" :key="gIndex + ':' + rowIndex" :index="rowIndex" :mark="mark" ref="row"  :is-item-active="isItemActive" :hit-item="hitItem"/>
						<data-grid-row-details v-if="rowDetailsShow(row)" v-show="isGroupBodyVisible(g)" :cols="columns.length" :row="row" :key="'rd:' + gIndex + ':' + rowIndex" :mark="mark">
							<slot name="row-details" :row="row"></slot>
						</data-grid-row-details>
					</template>
				</template>
			</tbody>
		</template>
		<template v-else>
			<tbody>
				<template v-for="(item, rowIndex) in $items">
					<data-grid-row :cols="columns" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark" ref="row" :is-item-active="isItemActive" :hit-item="hitItem"/>
					<data-grid-row-details v-if="rowDetailsShow(item)" :cols="columns.length" :row="item" :key="'rd:' + rowIndex" :mark="mark">
						<slot name="row-details" :row="item"></slot>
					</data-grid-row-details>
				</template>
			</tbody>
		</template>
		<slot name="footer"></slot>
	</table>
	</div>
</div>
`;

	/* @click.prevent disables checkboxes & other controls in cells 
	<td class="group-marker" v-if="group"></td>

	@mousedown.prevent???? зачем то было???
	 */
	const dataGridRowTemplate = `
<tr @click="rowSelect(row)" :class="rowClass()" v-on:dblclick.prevent="doDblClick" ref="tr" @mousedown="mouseDown(row)">
	<td v-if="isMarkCell" class="marker">
		<div :class="markClass"></div>
	</td>
	<td v-if="detailsMarker" class="details-marker" @click.prevent="toggleDetails">
		<i v-if="detailsIcon" class="ico" :class="detailsExpandClass" />
	</td>
	<data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index" />
</tr>`;

	const dataGridRowDetailsTemplate = `
<tr v-if="visible()" class="row-details">
	<td v-if="isMarkCell" class="marker">
		<div :class="markClass"></div>
	</td>
	<td :colspan='totalCols' class="details-cell">
		<div class="details-wrapper"><slot></slot></div>
	</td>
</tr>
`;
    /**
        icon on header!!!
		<i :class="\'ico ico-\' + icon" v-if="icon"></i>
     */
	const dataGridColumnTemplate = `
<th :class="cssClass" @click.prevent="doSort">
	<div class="h-fill" v-if="fixedHeader" v-text="headerText">
	</div>
	<div class="h-holder">
		<slot><label v-if=checkAll class="like-checkbox" :class="checkAllClass" @click=doCheckAll><span></span></label>
			<span v-else v-text="headerText"></span>
		</slot>
	</div>
</th>
`;

	const dataGridColumn = {
		name: 'data-grid-column',
		template: dataGridColumnTemplate,
		props: {
			header: String,
			content: String,
			dataType: String,
			hideZeros: Boolean,
			format: String,
			icon: String,
			bindIcon: String,
			id: String,
			align: { type: String, default: 'left' },
			editable: { type: Boolean, default: false },
			noPadding: { type: Boolean, default: false },
			validate: String,
			sort: { type: Boolean, default: undefined },
			sortProp: String,
			small: { type: Boolean, default: undefined },
			bold: String, //{ type: Boolean, default: undefined },
			mark: String,
			done: String,
			controlType: String,
			width: String,
			minWidth:String,
			fit: Boolean,
			backColor: String,
			wrap: String,
			command: Object,
			maxChars: Number,
			lineClamp: Number,
			checkAll: String
		},
		created() {
			this.$parent.$addColumn(this);
		},
		destroyed() {
			this.$parent.$removeColumn(this);
		},
		computed: {
			sortProperty() {
				return this.sortProp || this.content;
			},
			dir() {
				return this.$parent.sortDir(this.sortProperty);
			},
			fixedHeader() {
				return this.$parent.fixedHeader;
			},
			isSortable() {
				if (!this.sortProperty)
					return false;
				return typeof this.sort === 'undefined' ? this.$parent.isGridSortable : this.sort;
			},
			isUpdateUrl() {
				return !this.$root.inDialog;
			},
			template() {
				return this.id ? this.$parent.$scopedSlots[this.id] : null;
			},
			classAlign() {
				return this.align !== 'left' ? (' text-' + this.align).toLowerCase() : '';
			},
			checkAllClass() {
				let state = this.$parent.$checkAllState(this.checkAll);
				if (state === 1)
					return 'checked'; // indeterminate';
				else if (state === 2)
					return 'indeterminate';
				return undefined;
			},
			cssClass() {
				let cssClass = this.classAlign;
				if (this.isSortable) {
					cssClass += ' sort';
					if (this.dir)
						cssClass += ' ' + this.dir;
				}
				if (this.checkAll)
					cssClass += ' check-all'
				return cssClass;
			},
			headerText() {
				return this.header || '\xa0';
			},
			evalOpts() {
				return {
					hideZeros: this.hideZeros,
					format: this.format
				};
			}
		},
		methods: {
			doSort() {
				if (!this.isSortable)
					return;
				this.$parent.doSort(this.sortProperty);
			},
			doCheckAll() {
				if (!this.checkAll) return;
				this.$parent.$checkAll(this.checkAll);
			},
			cellCssClass(row, editable) {
				let cssClass = this.classAlign;

				if (this.mark) {
					let mark = utils.simpleEval(row, this.mark);
					if (mark)
						cssClass += ' ' + mark;
				}
				if (editable && this.controlType !== 'checkbox')
					cssClass += ' cell-editable';

				function addClassBool(bind, cls) {
					if (!bind) return;
					if (bind === 'true')
						cssClass += cls;
					else if (bind.startsWith('{')) {
						var prop = bind.substring(1, bind.length - 1);
						if (utils.simpleEval(row, prop))
							cssClass += cls;
					}
				}

				if (this.wrap)
					cssClass += ' ' + this.wrap;
				if (this.small)
					cssClass += ' small';
				addClassBool(this.bold, ' bold');
				return cssClass.trim();
			}
		}
	};

	Vue.component('data-grid-column', dataGridColumn);

	const dataGridCell = {
		functional: true,
		name: 'data-grid-cell',
		props: {
			row: Object,
			col: Object,
			index: Number
		},
		render(h, ctx) {
			//console.warn('render cell');
			let tag = 'td';
			let row = ctx.props.row;
			let col = ctx.props.col;
			let ix = ctx.props.index;
			let cellProps = {
				'class': col.cellCssClass(row, col.editable || col.noPadding)
			};

			let childProps = {
				props: {
					row: row,
					col: col
				}
			};
			if (col.template) {
				let vNode = col.template(childProps.props);
				return h(tag, cellProps, [vNode]);
			}

			if (col.controlType === 'validator') {
				let cellValid = {
					props: ['item', 'col'],
					template: '<span><i v-if="item.$invalid" class="ico ico-error"></i></span>'
				};
				cellProps.class = { 'cell-validator': true };
				return h(tag, cellProps, [h(cellValid, { props: { item: row, col: col } })]);
			}

			if (!col.content && !col.icon && !col.bindIcon && !col.done) {
				return h(tag, cellProps);
			}

			let validator = {
				props: ['path', 'item'],
				template: '<validator :path="path" :item="item"></validator>'
			};

			let validatorProps = {
				props: {
					path: col.validate,
					item: row
				}
			};

			function normalizeArg(arg, doEval) {
				if (utils.isBoolean(arg) || utils.isNumber(arg) || utils.isObjectExact(arg))
					return arg;
				arg = arg || '';
				if (arg === 'this')
					arg = row;
				else if (arg.startsWith('{')) {
					arg = arg.substring(1, arg.length - 1);
					if (arg.indexOf('.') !== -1)
						arg = utils.eval(row, arg);
					else {
						if (!(arg in row))
							throw new Error(`Property '${arg}' not found in ${row.constructor.name} object`);
						arg = row[arg];
					}
				} else if (arg && doEval) {
					arg = utils.eval(row, arg, col.dataType, col.evalOpts);
				}
				return arg;
			}

			if (col.command) {
				// column command -> hyperlink
				// arg1. command
				let arg1 = normalizeArg(col.command.arg1, false);
				let arg2 = normalizeArg(col.command.arg2, col.command.eval);
				let arg3 = normalizeArg(col.command.arg3, false);
				let arg4 = col.command.arg4; // without normalize
				let child = {
					props: ['row', 'col'],
					/*@click.prevent, no stop*/
					template: '<a @click.prevent="doCommand($event)" :href="getHref()"><i v-if="hasIcon" :class="iconClass" class="ico"></i><span v-text="eval(row, col.content, col.dataType, col.evalOpts)"></span></a>',
					computed: {
						hasIcon() { return col.icon || col.bindIcon || col.done; },
						iconClass() {
							let icoSingle = !col.content ? ' ico-single' : '';
							if (col.bindIcon)
								return 'ico-' + utils.eval(row, col.bindIcon) + icoSingle;
							else if (col.done)
								return (utils.eval(row, col.done) ? 'ico-success-outline-green' : 'ico-warning-outline-yellow') + icoSingle;
							else if (col.icon)
								return 'ico-' + col.icon + icoSingle;
							return null;
						}
					},
					methods: {
						doCommand(ev) {
							//console.dir(`cell click: x:${ev.x}, y:${ev.y}`);
							col.command.cmd(arg1, arg2, arg3, arg4);
						},
						eval: utils.eval,
						getHref() {
							if (!col.command) return null;
							if (col.command.isDialog)
								return '';
							if (col.command.cmd.name.indexOf('$exec') !== -1)
								return '';
							let id = arg2;
							if (utils.isObjectExact(arg2))
								id = arg2.$id;
							return arg1 + '/' + id;
						}
					}
				};
				return h(tag, cellProps, [h(child, childProps)]);
			}
			/* simple content */
			if (col.content === '$index')
				return h(tag, cellProps, [ix + 1]);

			function isNegativeRed(col) {
				if (col.dataType === 'Number' || col.dataType === 'Currency') {
					let val = utils.eval(row, col.content, col.dataType, col.evalOpts, true /*skip format*/);
					if (val < 0)
						return true;
				}
				return false;
			}

			let content = utils.eval(row, col.content, col.dataType, col.evalOpts);
			let spanProps = { 'class': { 'dg-cell': true, 'negative-red': isNegativeRed(col), 'line-clamp': col.lineClamp > 0 } };
			if (col.maxChars) {
				spanProps.attrs = { title: content };
				content = utils.text.maxChars(content, col.maxChars);
			}
			else if (col.lineClamp > 0) {
				spanProps.attrs = { title: content }
				spanProps.style = { '-webkit-line-clamp': col.lineClamp };
			}

			let chElems = [h('span', spanProps, content)];
			let icoSingle = !col.content ? ' ico-single' : '';
			if (col.icon)
				chElems.unshift(h('i', { 'class': 'ico ico-' + col.icon + icoSingle }));
			else if (col.bindIcon)
				chElems.unshift(h('i', { 'class': 'ico ico-' + utils.eval(row, col.bindIcon) + icoSingle }));
			else if (col.done)
				chElems.unshift(h('i', { 'class': 'ico ico-' + (utils.eval(row, col.done) ? 'success-outline-green' : 'warning-outline-yellow') + icoSingle }));
			/*TODO: validate ???? */
			if (col.validate) {
				chElems.push(h(validator, validatorProps));
			}
			return h(tag, cellProps, chElems);
		}
	};

	const dataGridRow = {
		name: 'data-grid-row',
		template: dataGridRowTemplate,
		components: {
			'data-grid-cell': dataGridCell
		},
		props: {
			row: Object,
			cols: Array,
			index: Number,
			mark: String,
			group: Boolean,
			level: Number,
			isItemActive: Function,
			hitItem: Function
		},
		computed: {
			isMarkCell() {
				return this.$parent.isMarkCell;
			},
			detailsMarker() {
				return this.$parent.isRowDetailsCell;
			},
			detailsIcon() {
				if (!this.detailsMarker)
					return false;
				let prdv = this.$parent.rowDetailsVisible;
				if (prdv === false) return true; // property not specified
				return prdv && this.row[prdv];
			},
			detailsExpandClass() {
				return this.row._uiprops_.$details ? "ico-minus-circle" : "ico-plus-circle";
			},
			totalColumns() {
				console.error('implement me');
			},
			markClass() {
				return this.mark ? utils.simpleEval(this.row, this.mark) : '';
			},
			_itemActive() {
				return this.isItemActive ? this.isItemActive(this.index) : !!this.row.$selected;
			}
		},
		watch: {
			_itemActive(newValue, oldValue) {
				if (newValue) {
					let tr = this.$refs.tr;
					if (tr && tr.scrollIntoViewCheck)
						tr.scrollIntoViewCheck();
				}
			}
		},
		methods: {
			rowClass() {
				let cssClass = 'dg-row';
				const isActive = this.isItemActive ? this.isItemActive(this.index) : !!this.row.$selected;
				//console.warn(`i = ${this.index} l = ${this.row.$parent.length}`);
				if (isActive) cssClass += ' active';
				if (this.$parent.isMarkRow && this.mark) {
					cssClass += ' ' + utils.simpleEval(this.row, this.mark);
				}
				if ((this.index + 1) % 2)
					cssClass += ' even';
				if (this.$parent.rowBold && this.row[this.$parent.rowBold])
					cssClass += ' bold';
				if (this.level)
					cssClass += ' lev-' + this.level;
				return cssClass.trim();
			},
			rowSelect(row) {
				//console.dir('row select');
				if (row.$select)
					row.$select();
			},
			mouseDown(row) {
				//console.dir('row select mouse down');
				if (this.hitItem)
					this.hitItem(row);
			},
			doDblClick($event) {
				// deselect text
				$event.stopImmediatePropagation();
				if (!this.$parent.doubleclick)
					return;
				window.getSelection().removeAllRanges();
				this.$parent.doubleclick();
			},
			toggleDetails($event) {
				//$event.stopImmediatePropagation();
				if (!this.detailsIcon) return;
				Vue.set(this.row._uiprops_, "$details", !this.row._uiprops_.$details);
			}
		}
	};

	const dataGridRowDetails = {
		name: 'data-grid-row-details',
		template: dataGridRowDetailsTemplate,
		props: {
			cols: Number,
			row: Object,
			mark: String
		},
		computed: {
			isMarkCell() {
				return this.$parent.isMarkCell;
			},
			markClass() {
				return this.mark ? utils.simpleEval(this.row, this.mark) : '';
			},
			detailsMarker() {
				return this.$parent.isRowDetailsCell;
			},
			totalCols() {
				return this.cols +
					(this.isMarkCell ? 1 : 0) +
					(this.detailsMarker ? 1 : 0);
			}
		},
		methods: {
			visible() {
				if (this.$parent.isRowDetailsAlways)
					return true;
				else if (this.$parent.isRowDetailsCell)
					return this.row._uiprops_.$details ? true : false;
				return this.row === this.$parent.selected();
			}
		}
	};

	Vue.component('data-grid', {
		props: {
			'items-source': [Object, Array],
			border: Boolean,
			grid: String,
			fixedHeader: Boolean,
			hideHeader: Boolean,
			hover: {
				type: Boolean, default: undefined
			},
			striped: {
				type: Boolean,
				default: undefined
			},
			compact: Boolean,
			sort: Boolean,
			routeQuery: Object,
			mark: String,
			filterFields: String,
			markStyle: String,
			rowBold: String,
			doubleclick: Function,
			groupBy: [Array, Object, String],
			rowDetails: Boolean,
			rowDetailsActivate: String,
			rowDetailsVisible: [String /*path*/, Boolean],
			isItemActive: Function,
			hitItem: Function,
			emptyPanelCallback: Function,
			testId: String,
			autoSelect: String
		},
		template: dataGridTemplate,
		components: {
			'data-grid-row': dataGridRow,
			'data-grid-row-details': dataGridRowDetails
		},
		data() {
			return {
				columns: [],
				clientItems: null,
				clientGroups: null,
				localSort: {
					dir: 'asc',
					order: ''
				}
			};
		},
		computed: {
			$items() {
				return this.clientItems ? this.clientItems : this.itemsSource;
			},
			isMarkCell() {
				return this.markStyle === 'marker' || this.markStyle === 'both';
			},
			isRowDetailsCell() {
				return this.rowDetails && this.rowDetailsActivate === 'cell';
			},
			isRowDetailsAlways() {
				return this.rowDetails && this.rowDetailsActivate === 'always';
			},
			isMarkRow() {
				return this.markStyle === 'row' || this.markStyle === 'both';
			},
			isHeaderVisible() {
				return !this.hideHeader;
			},
			cssClass() {
				let cssClass = 'data-grid';
				if (this.grid) cssClass += ' grid-' + this.grid.toLowerCase();
				if (this.striped != undefined)
					cssClass += this.striped ? ' striped' : ' no-striped';
				if (this.hover != undefined)
					cssClass += this.hover ? ' hover' : ' no-hover';
				if (this.compact) cssClass += ' compact';
				return cssClass;
			},
			isGridSortable() {
				return !!this.sort;
			},
			isLocal() {
				return !this.$parent.sortDir;
			},
			isGrouping() {
				return this.groupBy;
			},
			groupColumns() {
				return this.columns.length + //1 +
					(this.isMarkCell ? 1 : 0) +
					(this.isRowDetailsCell ? 1 : 0);
			},
			$groupCount() {
				if (utils.isString(this.groupBy))
					return this.groupBy.split('-').length;
				else if (utils.isObjectExact(this.groupBy))
					return 1;
				else
					return this.groupBy.length;
			},
			$groups() {
				function* enumGroups(src, p0, lev, cnt) {
					for (let grKey in src) {
						if (grKey === 'items') continue;
						let srcElem = src[grKey];
						let count = srcElem.items ? srcElem.items.length : 0;
						if (cnt)
							cnt.c += count;
						let pElem = {
							group: grKey,
							p0: p0,
							expanded: true,
							level: lev,
							items: srcElem.items || null,
							count: count
						};
						yield pElem;
						if (!src.items) {
							let cnt = { c: 0 };
							yield* enumGroups(srcElem, pElem, lev + 1, cnt);
							pElem.count += cnt.c;
						}
					}
				}
				//console.dir(this.clientGroups);
				this.doSortLocally();
				// classic tree
				let startTime = performance.now();
				let grmap = {};
				let grBy = this.groupBy;
				if (utils.isString(grBy)) {
					let rarr = [];
					for (let vs of grBy.split('-'))
						rarr.push({ prop: vs.trim(), count: true });
					grBy = rarr;
				}
				else if (utils.isObjectExact(grBy))
					grBy = [grBy];
				if (!this.$items) return null;
				for (let itm of this.$items) {
					let root = grmap;
					for (let gr of grBy) {
						let key = utils.eval(itm, gr.prop);
						if (utils.isDate(key))
							key = utils.format(key, "Date");
						if (!utils.isDefined(key)) key = '';
						if (key === '') key = locale.$Unknown || "Unknown";
						if (!(key in root)) root[key] = {};
						root = root[key];
					}
					if (!root.items)
						root.items = [];
					root.items.push(itm);
				}
				// tree to plain array
				let grArray = [];
				for (let el of enumGroups(grmap, null, 1)) {
					el.source = grBy[el.level - 1];
					if (el.source.expanded === false)
						el.expanded = false;
					grArray.push(el);
				}
				this.clientGroups = grArray;
				log.time('datagrid grouping time:', startTime);
				return this.clientGroups;
			},
			$isEmpty() {
				if (!this.itemsSource) return false;
				let mi = this.itemsSource.$ModelInfo;
				if (!mi)
					return this.itemsSource.length === 0;
				if ('HasRows' in mi) {
					if (this.itemsSource.length)
						return false;
					return mi.HasRows === false;
				} else {
					return this.itemsSource.length === 0;
				}
				return false;
			}
		},
		watch: {
			localSort: {
				handler() {
					this.handleSort();
				},
				deep: true
			},
			'itemsSource.length'() {
				this.handleSort();
			},
			'$isEmpty'(newval, oldval) {
				if (this.emptyPanelCallback)
					this.emptyPanelCallback.call(this.$root.$data, newval);
			}
		},
		methods: {
			selected() {
				let src = this.itemsSource;
				if (src.$origin)
					src = src.$origin;
				return src.$selected;
			},
			$addColumn(column) {
				this.columns.push(column);
			},
			$removeColumn(column) {
				let ix = this.columns.indexOf(column);
				if (ix !== -1)
					this.columns.splice(ix, 1);
			},
			rowDetailsShow(item) {
				if (!this.rowDetails)
					return false;
				if (utils.isBoolean(this.rowDetailsVisible))
					return this.rowDetailsVisible; // unset
				let vis = item[this.rowDetailsVisible];
				return !!vis;
			},
			columnClass(column, ix) {
				let cls = '';
				if (column.fit || column.controlType === 'validator')
					cls += 'fit';
				if (this.sort && column.isSortable && utils.isDefined(column.dir))
					cls += ' sorted';
				if (column.backColor) {
					cls += ` ${column.backColor}`;
				}
				return cls;
			},
			columnStyle(column) {
				return {
					width: utils.isDefined(column.width) ? column.width : undefined,
					minWidth: utils.isDefined(column.minWidth) ? column.minWidth : undefined
				};
			},
			doSort(order) {
				// TODO: // collectionView || locally
				if (this.isLocal) {
					if (eqlower(this.localSort.order, order))
						this.localSort.dir = eqlower(this.localSort.dir, 'asc') ? 'desc' : 'asc';
					else {
						this.localSort = { order: order, dir: 'asc' };
					}
				} else {
					this.$parent.$emit('sort', order);
				}
			},
			sortDir(order) {
				// TODO: 
				if (this.isLocal)
					return eqlower(this.localSort.order, order) ? this.localSort.dir : undefined;
				else
					return this.$parent.sortDir(order);
			},
			doSortLocally() {
				if (!this.isLocal) return;
				if (!this.localSort.order) return;
				let startTime = performance.now();
				let rev = this.localSort.dir === 'desc';
				let sortProp = this.localSort.order;
				let arr = [].concat(this.itemsSource);
				arr.sort((a, b) => {
					let av = a[sortProp];
					let bv = b[sortProp];
					if (av === bv)
						return 0;
					else if (av < bv)
						return rev ? 1 : -1;
					else
						return rev ? -1 : 1;
				});
				log.time('datagrid sorting time:', startTime);
				this.clientItems = arr;
			},
			handleSort() {
				if (this.isGrouping)
					this.clientGroups = null;
				else
					this.doSortLocally();
			},
			toggleGroup(g) {
				g.expanded = !g.expanded;
			},
			isGroupCountVisible(g) {
				if (g && g.source && utils.isDefined(g.source.count))
					return g.source.count;
				return true;
			},
			isGroupGroupVisible(g) {
				if (!g.group)
					return false;
				if (!g.p0)
					return true;
				let cg = g.p0;
				while (cg) {
					if (!cg.expanded) return false;
					cg = cg.p0;
				}
				return true;
			},
			isGroupBodyVisible(g) {
				if (!g.expanded) return false;
				let cg = g.p0;
				while (cg) {
					if (!cg.expanded) return false;
					cg = cg.p0;
				}
				return true;
			},
			groupTitle(g) {
				if (g.source && g.source.title)
					return g.source.title
						.replace('{Value}', g.group)
						.replace('{Count}', g.count);
				return g.group;
			},
			expandGroups(lev) {
				// lev 1-based
				for (var gr of this.$groups)
					gr.expanded = gr.level < lev;
			},
			$checkAll(path) {
				if (!this.$items) return;
				let s = this.$checkAllState(path);
				let val = s != 1;
				this.$items.forEach(itm => itm[path] = val);
			},
			$checkAllState(path) {
				// 0 - unchecked; 1 - checked, 2-indeterminate
				if (!this.$items) return 0;
				let checked = 0;
				let unchecked = 0;
				this.$items.forEach(itm => {
					if (itm[path])
						checked += 1;
					else
						unchecked += 1;
				});
				if (checked === 0)
					return 0;
				else if (unchecked === 0)
					return 1;
				return 2;
			},
			__autoSelect() {
				if (!this.autoSelect || !this.$items || !this.$items.length) return;
				if (this.$items.$selected) return;
				switch (this.autoSelect) {
					case 'first-item':
						this.$items[0].$select();
						break;
					case 'last-item':
						this.$items[this.$items.length - 1].$select();
				}
			},
			__invoke__test__(args) {
				args = args || {};
				if (args.target !== 'datagrid')
					return;
				if (args.testId !== this.testId)
					return;
				switch (args.action) {
					case 'selectRow':
						this.$items.forEach(e => {
							if (e.$id.toString() === args.id) {
								e.$select();
								args.result = 'success';
							}
						});
						break;
				}
			}
		},
		updated() {
			let src = this.itemsSource;
			if (!src) return;
			let ix = src.$selectedIndex;
			let rows = this.$refs.row;
			if (ix !== -1 && rows && ix < rows.length) {
				let tr = rows[ix].$refs.tr;
				tr.scrollIntoViewCheck();
			}
			this.__autoSelect();
		},
		mounted() {
			if (this.testId)
				eventBus.$on('invokeTest', this.__invoke__test__);
		},
		beforeDestroy() {
			if (this.testId)
				eventBus.$off('invokeTest', this.__invoke__test__);
		}
	});
})();