/*20170823-7018*/
/*components/pager.js*/

/*
TODO: pageSize
*/

(function () {

    const pagerTemplate = `
    <div class="data-grid-pager">
        <button @click.stop.prevent="prev" :disabled="isFirstPage">prev</button>
        <button @click.stop.prevent="next" :disabled="isLastPage">next</button>
        <label v-text="query"></label>
        <span>length: {{length}} sort:{{sort}}</span>
    </div>
`;


    Vue.component('a2-pager', {
        template: pagerTemplate,
        props: {
            itemsSource: Array,
            query: Object,
            sort: String,
            pageSize: {
                type: Number,
                default: 3 //TODO: default page size
            }
        },
        computed: {
            offset() {
                return +this.query.offset || 0;
            },
            length() {
                if (this.sort === 'server')
                    return this.itemsSource.$RowCount;
                else
                    return this.itemsSource.length;
            },
            isLastPage() {
                return this.offset + this.pageSize >= this.length;
            },
            isFirstPage() {
                return +this.offset === 0;
            }
        },
        methods: {
            next() {
                if (this.isLastPage)
                    return;
                var cv = this.offset + this.pageSize;
                this.query.offset = cv;
            },
            prev() {
                if (this.isFirstPage)
                    return;
                let cv = this.offset - this.pageSize;
                this.query.offset = cv;
            }
        }
    });
})();

