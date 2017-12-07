// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171207-7076
// components/datagrid.js*/

(function () {

 /*TODO:
7. Доделать checked
10.
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

	/**
	 * группировки. v-show на строке гораздо быстрее, чем v-if на всем шаблоне
	 */

	/*
		{{g.group}} level:{{g.level}} expanded:{{g.expanded}} source:{{g.source}} count:
	 */


	const utils = require('std:utils');
	const log = require('std:log');

    const dataGridTemplate = `
<div v-lazy="itemsSource" :class="{'data-grid-container':true, 'fixed-header': fixedHeader, 'bordered': border}">
    <div :class="{'data-grid-body': true, 'fixed-header': fixedHeader}">
    <table :class="cssClass">
        <colgroup>
            <col v-if="isMarkCell"/>
			<col v-if="isGrouping" class="fit"/>
            <col v-bind:class="columnClass(col)" v-bind:style="columnStyle(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
        </colgroup>
        <thead>
            <tr v-show="isHeaderVisible">
                <th v-if="isMarkCell" class="marker"><div v-if="fixedHeader" class="h-holder"></div></th>
				<th v-if="isGrouping" class="group-cell">
					<a @click.prevent="expandGroups(gi)" v-for="gi in $groupCount" v-text='gi' /><a 
						@click.prevent="expandGroups($groupCount + 1)" v-text='$groupCount + 1' />
				</th>
                <slot></slot>
            </tr>
        </thead>
		<template v-if="isGrouping">
			<tbody>
				<template v-for="(g, gIndex) of $groups">
					<tr v-if="isGroupGroupVisible(g)" :class="'group lev-' + g.level" :key="gIndex">
						<td @click.prevent='toggleGroup(g)' :colspan="columns.length + 1">
						<span :class="{expmark: true, expanded: g.expanded}" />
						<span class="grtitle" v-text="groupTitle(g)" />
						<span v-if="g.source.count" class="grcount" v-text="g.count" /></td>
					</tr>
					<template>
						<data-grid-row v-show="isGroupBodyVisible(g)" :group="true" :level="g.level" :cols="columns" v-for="(row, rowIndex) in g.items" :row="row" :key="gIndex + ':' + rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
                        <data-grid-row-details v-if="rowDetails" :cols="columns.length" :row="item" :key="rowIndex">
                            <slot name="row-details" :row="item"></slot>
                        </data-grid-row-details>
					</template>
				</template>
			</tbody>
		</template>
		<template v-else>
			<tbody>
                <template v-for="(item, rowIndex) in $items">
				    <data-grid-row :cols="columns" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark" />
                    <data-grid-row-details v-if="rowDetails" :cols="columns.length" :row="item" :key="rowIndex">
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

	/* @click.prevent disables checkboxes & other controls in cells */
    const dataGridRowTemplate = `
<tr @click="row.$select()" :class="rowClass" v-on:dblclick.prevent="doDblClick">
    <td v-if="isMarkCell" class="marker">
        <div :class="markClass"></div>
    </td>
	<td class="group-marker" v-if="group"></td>
    <data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index" />
</tr>`;

    const dataGridRowDetailsTemplate = `
<tr v-if="visible" class="row-details">
    <td :colspan='cols'>
        <slot></slot>
    </td>
</tr>
`;
    /**
        icon on header!!!
		<i :class="\'ico ico-\' + icon" v-if="icon"></i>
     */
    const dataGridColumnTemplate = `
<th :class="cssClass" @click.prevent="doSort">
    <div class="h-fill" v-if="fixedHeader">
        {{header}}
    </div><div class="h-holder">
		<slot>{{header}}</slot>
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
            icon: String,
            bindIcon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            noPadding: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined },
			mark: String,
			controlType: String,
			width: String,
            fit: Boolean,
            wrap: String,
            command: Object,
        },
        created() {
			this.$parent.$addColumn(this);
        },
		computed: {
            dir() {
				return this.$parent.sortDir(this.content);
            },
            fixedHeader() {
                return this.$parent.fixedHeader;
            },
            isSortable() {
                if (!this.content)
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
            cssClass() {
                let cssClass = this.classAlign;
                if (this.isSortable) {
                    cssClass += ' sort';
                    if (this.dir)
                        cssClass += ' ' + this.dir;
                }
                return cssClass;
            }
        },
		methods: {
            doSort() {
                if (!this.isSortable)
					return;
				this.$parent.doSort(this.content);
            },
            cellCssClass(row, editable) {
                let cssClass = this.classAlign;
                if (this.mark) {
                    let mark = row[this.mark];
                    if (mark)
                        cssClass += ' ' + mark;
                }
                if (editable && this.controlType !== 'checkbox')
                    cssClass += ' cell-editable';
                if (this.wrap)
                    cssClass += ' ' + this.wrap;
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

            if (!col.content && !col.icon && !col.bindIcon) {
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

			function normalizeArg(arg, eval) {
				arg = arg || '';
				if (arg === 'this')
					arg = row;
				else if (arg.startsWith('{')) {
					arg = arg.substring(1, arg.length - 1);
					if  (!(arg in row))
						throw new Error(`Property '${arg1}' not found in ${row.constructor.name} object`);
					arg = row[arg];
				} else if (arg && eval)
					arg = utils.eval(row, arg, col.dataType);
				return arg;
			}

			if (col.command) {
				// column command -> hyperlink
				// arg1. command
				let arg1 = normalizeArg(col.command.arg1, false);
				let arg2 = normalizeArg(col.command.arg2, col.command.eval);
                let arg3 = normalizeArg(col.command.arg3, false);
                let ev = col.command.$ev;
				let child = {
					props: ['row', 'col'],
					/*prevent*/
					template: '<a @click.prevent="doCommand($event)" :href="getHref()" v-text="eval(row, col.content, col.dataType)"></a>',
					methods: {
                        doCommand(ev) {
                            if (ev) {
                                // ??? lock double click ???
                                //ev.stopImmediatePropagation();
                                //ev.preventDefault();
                            }
							col.command.cmd(arg1, arg2, arg3);
						},
						eval: utils.eval,
						getHref() {
							if (arg1 == '$dialog')
								return null;
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
                if (col.dataType === 'Number' || col.dataType === 'Currency')
                    if (utils.eval(row, col.content) < 0)
                        return true;
                return false;
            }

			let content = utils.eval(row, col.content, col.dataType);
            let chElems = [h('span', { 'class': { 'negative-red': isNegativeRed(col) } }, content)];
            let icoSingle = !col.content ? ' ico-single' : '';
            if (col.icon)
                chElems.unshift(h('i', { 'class': 'ico ico-' + col.icon + icoSingle }));
            else if (col.bindIcon)
                chElems.unshift(h('i', { 'class': 'ico ico-' + utils.eval(row, col.bindIcon) + icoSingle }));
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
			level : Number
        },
        computed: {
			active() {
				return this.row == this.$parent.selected;
            },
            rowClass() {
                let cssClass = '';
				if (this.active) cssClass += 'active';
				if (this.$parent.isMarkRow && this.mark) {
					cssClass += ' ' + this.row[this.mark];
                }
                if ((this.index + 1) % 2)
                    cssClass += ' even'
                if (this.$parent.rowBold && this.row[this.$parent.rowBold])
                    cssClass += ' bold';
				if (this.level)
					cssClass += ' lev-' + this.level;
                return cssClass.trim();
            },
            isMarkCell() {
                return this.$parent.isMarkCell;
            },
            markClass() {
               return this.mark ? this.row[this.mark] : '';
            }
        },
        methods: {
            rowSelect() {
                throw new Error("do not call");
                //this.$parent.rowSelected = this;
            },
            doDblClick($event) {
				// deselect text
				$event.stopImmediatePropagation();
				if (!this.$parent.doubleclick)
					return;
                window.getSelection().removeAllRanges();
				this.$parent.doubleclick();
            }
        }
    };

    const dataGridRowDetails = {
        name: 'data-grid-row-details',
        template: dataGridRowDetailsTemplate,
        props: {
            cols: Number,
            row: Object
        },
        computed: {
            visible() {
                return this.row == this.$parent.selected;
            }
        }
    };

	Vue.component('data-grid', {
		props: {
			'items-source': [Object, Array],
			border: Boolean,
			grid: String,
			striped: Boolean,
            fixedHeader: Boolean,
            hideHeader: Boolean,
            hover: { type: Boolean, default: false },
            compact: Boolean,
			sort: Boolean,
			routeQuery: Object,
			mark: String,
			filterFields: String,
            markStyle: String,
            rowBold: String,
			doubleclick: Function,
            groupBy: [Array, Object],
            rowDetails: Boolean
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
			isMarkRow() {
				return this.markStyle === 'row' || this.markStyle === 'both';
            },
            isHeaderVisible() {
                return !this.hideHeader;
            },
			cssClass() {
				let cssClass = 'data-grid';
				if (this.grid) cssClass += ' grid-' + this.grid.toLowerCase();
				if (this.striped) cssClass += ' striped';
                if (this.hover) cssClass += ' hover';
                if (this.compact) cssClass += ' compact';
				return cssClass;
			},
			selected() {
				// reactive!!!
				let src = this.itemsSource;
				if (src.$origin) {
					src = src.$origin;
				}
				return src.$selected;
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
			$groupCount() {
				if (utils.isObjectExact(this.groupBy))
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
				this.doSortLocally();
				// classic tree
				let startTime = performance.now(); 
				let grmap = {};
				let grBy = this.groupBy;
				if (utils.isObjectExact(grBy))
					grBy = [grBy];
				for (let itm of this.$items) {
					let root = grmap;
					for (let gr of grBy) {
						let key = itm[gr.prop];
						if (!utils.isDefined(key)) key = '';
						if (key === '') key = "Unknown";
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
			}
		},
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            },
			columnClass(column) {
				let cls = '';
				if (column.fit || (column.controlType === 'validator'))
					cls += 'fit';
				if (utils.isDefined(column.dir))
					cls += ' sorted';
                return cls;
            },
            columnStyle(column) {
                return {
                    width: utils.isDefined(column.width) ? column.width : undefined
                };
			},
			doSort(order) {
				// TODO: // collectionView || locally
				if (this.isLocal) {
					if (this.localSort.order === order)
						this.localSort.dir = this.localSort.dir === 'asc' ? 'desc' : 'asc';
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
					return this.localSort.order === order ? this.localSort.dir : undefined;
				else
					return this.$parent.sortDir(order);
			},
            doSortLocally()
			{
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
			}
        }
    });
})();