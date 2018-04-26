// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180426-7166
/*components/pager.js*/

/*
template: `
<div class="pager">
	<a href @click.prevent="source.first" :disabled="disabledFirst"><i class="ico ico-chevron-left-end"/></a>
	<a href @click.prevent="source.prev" :disabled="disabledPrev"><i class="ico ico-chevron-left"/></a>

	<a href v-for="b in middleButtons " @click.prevent="page(b)"><span v-text="b"></span></a>

	<a href @click.prevent="source.next"><i class="ico ico-chevron-right"/></a>
	<a href @click.prevent="source.last"><i class="ico ico-chevron-right-end"/></a>
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}} count={{source.sourceCount}}</code>
</div>
*/
const locale = window.$$locale;

Vue.component('a2-pager', {
	props: {
		source: Object
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
				return locale.$NoElements;
			return `${locale.$PagerElements}: <b>${this.offset + 1}</b>-<b>${lastNo}</b> ${locale.$Of} <b>${this.count}</b>`;
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
					this.setOffset(this.offset - this.source.pageSize);
					break;
				case 'next':
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
		if (this.source.pageSize == -1) return; // invisible
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
		}, [h('i', { 'class': 'ico ico-chevron-left' })]
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
			attrs: { disabled: this.currentPage >= this.pages }
		},
			[h('i', { 'class': 'ico ico-chevron-right' })]
		));

		children.push(h('span', { class: 'a2-pager-divider' }));
		children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
		return h('div', contProps, children);
	}
});

