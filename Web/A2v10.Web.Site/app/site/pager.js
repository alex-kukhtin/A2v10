// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180426-7166
/*site/pager.js*/

/*TODO: make bootstrap!*/

Vue.component('a2-pager', {
	props: {
		source: Object,
		noElements: String,
		elements: String
	},
	computed: {
		pages() {
			return Math.ceil(this.count / this.source.pageSize);
		},
		currentPage() {
			return Math.ceil(this.offset / this.source.pageSize) + 1;
		},
		title() {
			let lastNo = Math.min(this.count, this.offset + this.source.pageSize);
			if (!this.count)
				return this.noElements;
			return `${this.elements}: <b>${this.offset + 1}</b>-<b>${lastNo}</b> з <b>${this.count}</b>`;
		},
		offset() {
			return +this.source.offset;
		},
		count() {
			return +this.source.sourceCount;
		}
	},
	methods: {
		setOffset(offset) {
			offset = +offset;
			if (this.offset === offset)
				return;
			this.source.$setOffset(offset);
		},
		isActive(page) {
			return page === this.currentPage;
		},
		click(arg, $ev) {
			$ev.preventDefault();
			switch (arg) {
				case 'prev':
					if (this.offset === 0) return;
					this.setOffset(this.offset - this.source.pageSize);
					break;
				case 'next':
					if (this.currentPage >= this.pages) return;
					this.setOffset(this.offset + this.source.pageSize);
					break;
			}
		},
		goto(page, $ev) {
			$ev.preventDefault();
			let offset = (page - 1) * this.source.pageSize;
			this.setOffset(offset);
		}
	},
	render(h, ctx) {
		if (this.source.pageSize === -1) return; // invisible
		let contProps = {
			class: 'pagination pagination-sm'
		};
		let children = [];
		const dotsClass = { 'class': 'pagination-dots' };
		const renderBtn = (page) => {
			return h('li', { class: { active: this.isActive(page) }},
				[h('a', {
					domProps: { innerText: page },
					on: { click: ($ev) => this.goto(page, $ev) },
					attrs: { href:"#" }
				})]
			);
		};
		// prev
		children.push(h('li', { class: { disabled: this.offset === 0 } },
			[h('a', {
				on: { click: ($ev) => this.click('prev', $ev) },
				attrs: { 'aria-label': 'Previous', href: '#' },
				domProps: { innerHTML: '&laquo;' }
			})]
		));
		// first
		if (this.pages > 0)
			children.push(renderBtn(1));
		if (this.pages > 1)
			children.push(renderBtn(2));
		// middle
		let ms = Math.max(this.currentPage - 2, 3);
		let me = Math.min(ms + 5, this.pages - 1);
		if (me - ms < 5)
			ms = Math.max(me - 5, 3);
		if (ms > 3)
			children.push(h('li', dotsClass, [h('span', null, '...')]));
		for (let mi = ms; mi < me; ++mi) {
			children.push(renderBtn(mi));
		}
		if (me < this.pages - 1)
			children.push(h('li', dotsClass, [h('span', null, '...')]));
		// last
		if (this.pages > 3)
			children.push(renderBtn(this.pages - 1));
		if (this.pages > 2)
			children.push(renderBtn(this.pages));
		// next
		children.push(h('li', {
			class: { disabled: this.currentPage >= this.pages }
		}, [h('a', {
			on: { click: ($ev) => this.click('next', $ev) },
			attrs: { 'aria-label': 'Previous', href: '#' },
			domProps: { innerHTML: '&raquo;' }
		})]
		));

		/*
		children.push(h('span', { class: 'a2-pager-divider' }));
		children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
		*/
		return h('ul', contProps, children);
	}
});

