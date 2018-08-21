(function () {

    Vue.component('a2-pager', {
        props: {
            offset: Number,
            count: Number,
            pageSize: Number,
            setOffset: Function
        },
        render(h, ctx) {
            let contProps = {
                class: 'a2-pager'
            };
            let children = [];
			const dotsClass = { 'class': 'a2-pager-dots' };
            const renderBtn = (page) => {
                return h('button', {
                    domProps: { innerText: page },
                    on: { click: ($ev) => this.goto(page, $ev) },
                    class: { active: this.isActive(page) }
                });
            };
            // prev
            children.push(h('button', {
                    on: { click: ($ev) => this.click('prev', $ev) },
                    attrs: { disabled: this.offset === 0 }
                }, [h('i',{ 'class': 'ico ico-chevron-left' })]
            ));            
            // first
			children.push(renderBtn(1));
			if (this.pages > 1)
				children.push(renderBtn(2));
            // middle
            let ms = Math.max(this.currentPage - 2, 3);
            let me = Math.min(ms + 5, this.pages - 1);
            if (me - ms < 5)
               ms = Math.max(me - 5, 3);
            if (ms > 3)
                children.push(h('span', dotsClass, '...'));
            for (let mi = ms; mi < me; ++mi) {
                children.push(renderBtn(mi));
            }
            if (me < this.pages - 1)
                children.push(h('span', dotsClass, '...'));
            // last
            if (this.pages > 3) 
                children.push(renderBtn(this.pages - 1));
            if (this.pages > 2) 
                children.push(renderBtn(this.pages));
            // next
            children.push(h('button', {
                    on: { click: ($ev) => this.click('next', $ev) },
                    attrs: { disabled: this.currentPage === this.pages }
                }, 
                [h('i',{ 'class': 'ico ico-chevron-right' })]
            ));

            children.push(h('span', { class: 'a2-pager-divider'}));
            children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
            return h('div', contProps, children);
        },
        computed: {
            pages() {
                return Math.ceil(this.count / this.pageSize);
            },
            currentPage() {
                return Math.ceil(this.offset / this.pageSize) + 1;
            },
            title() {
                let lastNo = Math.min(this.count, this.offset + this.pageSize);
                if (!this.count)
                    return '';
                return `элементы: <b>${this.offset + 1}</b>-<b>${lastNo}</b> из <b>${this.count}</b>`;
            }
        },
        methods: {
            isActive(page) {
                return page === this.currentPage;
            },
            click(arg, $ev) {
                $ev.preventDefault();
                switch(arg) {
                case 'prev':
                    this.setOffset(this.offset - this.pageSize);
                    break;
                case 'next':
                    this.setOffset(this.offset + this.pageSize);
                    break;
                }
            },
            goto(page, $ev) {
                $ev.preventDefault();
                this.setOffset((page - 1) * this.pageSize);
            }
        }
    });
})();