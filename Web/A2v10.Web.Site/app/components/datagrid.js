/*20170814-7012*/
/*components/datagrid.js*/
(function () {

 /*TODO:
2. size (compact, large ??)
3. contextual
5. grouping
6. select (выбирается правильно, но теряет фокус при выборе редактора)
7. Доделать checked
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

    const route = require('route');

    const dataGridTemplate = `
<table :class="cssClass">
    <thead>
        <tr>
            <slot></slot>
        </tr>
    </thead>
    <tbody>
        <data-grid-row :cols="columns" v-for="(item, rowIndex) in itemsSource" :row="item" :key="rowIndex" :index="rowIndex"></data-grid-row>
    </tbody>
</table>
`;

    const dataGridRowTemplate =
        '<tr @mouseup.stop.prevent="row.$select()" :class="{active : active}" ><data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index"></data-grid-cell></tr>';

    const dataGridColumn = {
        name: 'data-grid-column',
        template: '<th :class="cssClass" @click.stop.prevent="doSort"><i :class="\'fa fa-\' + icon" v-if="icon"></i> <slot>{{header || content}}</slot></th>',
        props: {
            header: String,
            content: String,
            icon: String,
            id: String,
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false },
            validate: String,
            sort: { type: Boolean, default: undefined }
        },
        data() {
            return {
                dirClient: null
            };
        },
        created() {
            this.$parent.$addColumn(this);
        },
        computed: {
            dir() {
                // TODO: client/server
                let q = route.query;
                //console.dir(q);
                if (q.order === this.content) {
                    return (q.dir || '').toLowerCase();
                }
                return null;
            },
            isSortable() {
                if (!this.content)
                    return false;
                return typeof this.sort === 'undefined' ? this.$parent.sort : this.sort;
            },
            template() {
                return this.id ? this.$parent.$scopedSlots[this.id] : null;
            },
            cssClass() {
                let cssClass = '';
                if (this.align !== 'left')
                    cssClass += (' text-' + this.align).toLowerCase();
                if (this.isSortable) {
                    cssClass += ' sort';
                    if (this.dir)
                        cssClass += ' ' + this.dir;
                }
                cssClass = cssClass.trim();
                return cssClass === '' ? null : cssClass;
            }
        },
        methods: {
            doSort() {
                if (!this.isSortable)
                    return;
                // TODO: client/server
                let q = route.query;
                let qdir = (q.dir || 'asc').toLowerCase();
                if (q.order === this.content) {
                    qdir = qdir === 'asc' ? 'desc' : 'asc';
                }
                route.query = { order: this.content, dir: qdir };
                if (this.$parent.searchChange)
                    this.$parent.searchChange();
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
                'class': col.cssClass
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
            let chElems = [row[col.content].toString()];
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
            index: Number
        },
        computed: {
            active() {
                return this.row === this.$parent.selected;
                //return this === this.$parent.rowSelected;
            }
        },
        methods: {
            rowSelect() {
                throw new Error("do not call");
                //this.$parent.rowSelected = this;
            }
        }
    };

    Vue.component('data-grid', {
        props: {
            'items-source': [Object, Array],
            bordered: Boolean,
            striped: Boolean,
            hover: { type: Boolean, default: false },
            sort: { type: Boolean, default: false },
            // callbacks
            searchChange: Function
        },
        template: dataGridTemplate,
        components: {
            'data-grid-row': dataGridRow
        },
        data() {
            return {
                columns: []
                //rowSelected: null
            };
        },
        computed: {
            cssClass() {
                let cssClass = 'data-grid';
                if (this.bordered) cssClass += ' bordered';
                if (this.striped) cssClass += ' striped';
                if (this.hover) cssClass += ' hover';
                return cssClass;
            },
            selected() {
                return this.itemsSource.$selected;
            }
        },
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            }
        }
    });

})();