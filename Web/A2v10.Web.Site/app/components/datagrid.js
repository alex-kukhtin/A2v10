(function () {

 /*TODO:
2. size (compact, large ??)
3. contextual
4. selectable
5. grouping
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
        <tr v-for="(item, rowIndex) in itemsSource">
            <data-grid-cell v-for="(col, colIndex) in columns" :key="colIndex" :row="item" :index="rowIndex" :col="col"></data-grid-cell>
        </tr>
    </tbody>
</table>
`;

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
            index: Number,
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

    Vue.component('data-grid', {
        props: {
            'items-source': [Object, Array],
            bordered: { type: Boolean, default: false },
            striped: { type: Boolean, default: false },
            hover: { type: Boolean, default: false }
        },
        template: dataGridTemplate,
        components: {
            'data-grid-cell': dataGridCell
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
            }
        },
        methods: {
            $addColumn(column) {
                this.columns.push(column);
            }
        }
    });

})();