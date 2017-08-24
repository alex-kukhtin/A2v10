/*20170824-7019*/
/*components/datagrid.js*/
(function () {

 /*TODO:
2. size (compact, large ??)
5. grouping (multiply)
6. select (выбирается правильно, но теряет фокус при выборе редактора)
7. Доделать checked
8. pager - (client/server)
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

    const utils = require('utils');

    const dataGridTemplate = `
<div class="data-grid-container">
    <slot name="toolbar" :query="dgQuery" />
    <table :class="cssClass">
        <colgroup>
            <col v-if="isMarkCell"/>
            <col :class="columnClass(col)" v-for="(col, colIndex) in columns" :key="colIndex"></col>
        </colgroup>
        <thead>
            <tr>
                <th v-if="isMarkCell" class="marker"></th>
                <slot></slot>
            </tr>
        </thead>
        <tbody>
            <data-grid-row :cols="columns" v-for="(item, rowIndex) in $items" :row="item" :key="rowIndex" :index="rowIndex" :mark="mark"></data-grid-row>
        </tbody>
    </table>
    <slot name="pager" :query="dgQuery" :sort="sort"/>
</div>
`;

    const dataGridRowTemplate = `
<tr @mouseup.stop.prevent="row.$select()" :class="rowClass" v-on:dblclick.capture.stop.prevent="dblClick">
    <td v-if="isMarkCell" class="marker">
        <div :class="markClass"></div>
    </td>
    <data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index">
    </data-grid-cell>
</tr>`;

    const dataGridColumnTemplate = `
<th :class="cssClass" @click.stop.prevent="doSort">
    <i :class="\'fa fa-\' + icon" v-if="icon"></i>
    <slot>{{header || content}}</slot>
</th>
`;

    const dataGridColumn = {
        name: 'data-grid-column',
        template: dataGridColumnTemplate,
        props: {
            header: String,
            content: String,
            icon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined },
            mark: String
        },
        created() {
            this.$parent.$addColumn(this);
        },
        computed: {
            dir() {
                var q = this.$parent.dgQuery;
                if (!q)
                    return '';
                if (q.order === this.content) {
                    return (q.dir || '').toLowerCase();
                }
                return null;
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
            cssClass() {
                let cssClass = this.classAlign;
                if (this.isSortable) {
                    cssClass += ' sort';
                    if (this.dir)
                        cssClass += ' ' + this.dir;
                }
                return cssClass;
            },
            classAlign() {
                return this.align !== 'left' ? (' text-' + this.align).toLowerCase() : '';
            }
        },
        methods: {
            doSort() {
                if (!this.isSortable)
                    return;
                let q = this.$parent.dgQuery;
                let qdir = (q.dir || 'asc').toLowerCase();
                if (q.order === this.content) {
                    qdir = qdir === 'asc' ? 'desc' : 'asc';
                }
                let nq = Object.assign({}, q, { order: this.content, dir: qdir });
                Vue.set(this.$parent, 'dgQuery', nq);
            },
            cellCssClass(row) {
                let cssClass = this.classAlign;
                if (this.mark) {
                    let mark = row[this.mark];
                    if (mark)
                        cssClass += ' ' + mark;
                }
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
                'class': col.cellCssClass(row)
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

            if (!col.content) {
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

            if (col.editable) {
                /* editable content */
                let child = {
                    props: ['row', 'col', 'align'],
                    /*TODO: control type */
                    template: '<textbox :item="row" :prop="col.content" :align="col.align" ></textbox>'
                };
                return h(tag, cellProps, [h(child, childProps)]);
            }
            /* simple content */
            if (col.content === '$index')
                return h(tag, cellProps, [ix + 1]);

            // Warning: toString() is required.
            let content = utils.toString(row[col.content]);
            let chElems = [content];
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
            mark: String
        },
        computed: {
            active() {
                return this.row === this.$parent.selected;
                //return this === this.$parent.rowSelected;
            },
            rowClass() {
                let cssClass = '';
                if (this.active)
                    cssClass += 'active';
                if (this.isMarkRow && this.mark)
                    cssClass += ' ' + this.row[this.mark];
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
            dblClick($event) {
                if ($event.target.tagName !== 'TD') {
                    alert('double click return:' + $event.target.tagName);
                    return;
                }
                alert('double click:' + $event.target.tagName);
            }
        }
    };

    Vue.component('data-grid', {
        props: {
            'items-source': [Object, Array],
            border: Boolean,
            grid: String,
            striped: Boolean,
            hover: { type: Boolean, default: false },
            sort: String,
            routeQuery: Object,
            mark: String,
            filterFields: String,
            markStyle: String
        },
        template: dataGridTemplate,
        components: {
            'data-grid-row': dataGridRow
        },
        data() {
            return {
                columns: [],
                clientItems: null,
                dgQuery: {
                    // predefined for sorting and pagination
                    dir: undefined,
                    order: undefined,
                    offset: undefined
                }
            };
        },
        watch: {
            dgQuery: {
                handler(nq, oq) {
                    this.queryChange();
                },
                deep:true
            }
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
            cssClass() {
                let cssClass = 'data-grid';
                if (this.border) cssClass += ' border';
                if (this.grid) cssClass += ' grid-' + this.grid;
                if (this.striped) cssClass += ' striped';
                if (this.hover) cssClass += ' hover';
                return cssClass;
            },
            selected() {
                return this.itemsSource.$selected;
            },
            isGridSortable() {
                return !!this.sort;
            }
        },
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            },
            columnClass(column) {
                return {
                    sorted: !!column.dir
                };
            },
            queryChange()
            {
                let nq = this.dgQuery;
                if (this.sort === 'server') {
                    this.$root.$emit('queryChange', nq);
                    return;
                }
                let rev = nq.dir === 'desc';
                let sortProp = nq.order;
                let arr = [].concat(this.itemsSource);
                if (nq.filter) {
                    let sv = nq.filter.toUpperCase();
                    // TODO: add $contains to element
                    arr = arr.filter((itm) => itm.Name.toUpperCase().indexOf(sv) !== -1);
                }
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
                if (nq.offset !== undefined) {
                    //TODO: pageSize
                    arr = arr.slice(+nq.offset, +nq.offset + 3);
                }
                this.clientItems = arr;
            }
        },
        created() {
            let q = this.dgQuery;
            let nq = {};

            if (this.filterFields) {
            // make all filter fields (for reactivity)
                this.filterFields.split(',').forEach(v => {
                    let f = v.trim();
                    nq[v.trim()] = undefined;
                });
            }
            let xq = {};
            if (this.sort === 'server') {
                // from route
                xq = this.routeQuery;
            }
            nq = Object.assign({}, q, nq, xq);
            Vue.set(this, 'dgQuery', nq);
        }
    });

})();