(function () {

 /*TODO:
2. size (compact, large ??)
3. contextual
5. grouping
6. select (выбирается правильно, но теряет фокус при выборе редактора)
7. Доделать checked
*/

/*some ideas from https://github.com/andrewcourtice/vuetiful/tree/master/src/components/datatable */

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
        '<tr @mouseup="row.$select()" :class="{active : active}" ><data-grid-cell v-for="(col, colIndex) in cols" :key="colIndex" :row="row" :col="col" :index="index"></data-grid-cell></tr>';

    const dataGridColumn = {
        name: 'data-grid-column',
        template: '<th :class="cssClass"><i :class="\'fa fa-\' + icon" v-if="icon"></i> <slot>{{header || content}}</slot></th>',
        props: {
            header: { type: String },
            content: { type: String },
            icon: {type: String},
            id: { type: String },
            align: { type: String, default: 'left' },
            editable: { type: Boolean, default: false }
        },
        created() {
            let addColumn = this.$parent.$addColumn;
            addColumn(this);
        },
        computed: {
            template() {
                return this.id ? this.$parent.$scopedSlots[this.id] : null;
            },
            cssClass() {
                let cssClass = '';
                if (this.align !== 'left')
                    cssClass += (' text-' + this.align).toLowerCase();
                cssClass = cssClass.trim();
                return cssClass === '' ? null : cssClass;
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

            if (col.editable) {
                /* editable content */
                let child = {
                    props: ['row', 'col'],
                    template: '<input type="text" v-model.lazy="row[col.content]">'
                };
                return h(tag, cellProps, [h(child, childProps)]);
            }
            /* simple content */
            if (col.content === '$index')
                return h(tag, cellProps, [ix + 1]);
            return h(tag, cellProps, [row[col.content]]);
        },
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
            }
        }
    };

    Vue.component('data-grid', {
        props: {
            'items-source': [Object, Array],
            bordered: { type: Boolean, default: false },
            striped: { type: Boolean, default: false },
            hover: { type: Boolean, default: false }
        },
        template: dataGridTemplate,
        components: {
            'data-grid-row': dataGridRow
        },
        data() {
            return {
                columns: []
            }
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