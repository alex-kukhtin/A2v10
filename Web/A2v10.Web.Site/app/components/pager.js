// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

// 20200511-7656
/*components/pager.js*/


(function () {

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
	const eventBus = require('std:eventBus');

	Vue.component('a2-pager', {
		props: {
			source: Object,
			emptyText: String,
			templateText: String
		},
		computed: {
			pages() {
				return Math.ceil(this.count / this.source.pageSize);
			},
			currentPage() {
				return Math.ceil(this.offset / this.source.pageSize) + 1;
			},
			title() {
				if (!this.count)
					return this.emptyString;
				return this.textString;
			},
			emptyString() {
				return this.emptyText ? this.emptyText : locale.$NoElements;
			},
			textString() {
				let lastNo = Math.min(this.count, this.offset + this.source.pageSize);
				if (this.templateText)
					return this.templateText
						.replace(/\#\[Start\]/g, this.offset + 1)
						.replace(/\#\[End\]/g, lastNo)
						.replace(/\#\[Count\]/g, this.count);
				else
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
				eventBus.$emit('closeAllPopups');
				this.$nextTick(() => this.source.$setOffset(offset));
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
			if (this.source.pageSize === -1) return; // invisible
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
				attrs: { disabled: this.offset === 0, 'aria-label': 'Previous page' }
			}, [h('i', { 'class': 'ico ico-chevron-left' })]
			));
			// first
			if (this.pages > 0)
				children.push(renderBtn(1));
			// middle
			let ms = 2;
			let me = this.pages - 1;
			let sd = false, ed = false, cp = this.currentPage;
			let len = me - ms;
			if (len > 4) {
				if (cp > 4)
					sd = true;
				if (cp < this.pages - 3)
					ed = true;
				if (sd && !ed)
					ms = me - 3;
				else if (!sd && ed)
					me = ms + 3;
				 else if (sd && ed) {
					ms = cp - 1;
					me = cp + 1;
				}
			}
			if (sd)
				children.push(h('span', dotsClass, '...'));
			for (let mi = ms; mi <= me; ++mi)
				children.push(renderBtn(mi));
			if (ed)
				children.push(h('span', dotsClass, '...'));
			// last
			if (this.pages > 2)
				children.push(renderBtn(this.pages));
			// next
			children.push(h('button', {
				on: { click: ($ev) => this.click('next', $ev) },
				attrs: { disabled: this.currentPage >= this.pages, 'aria-label': 'Next Page' }
			},
				[h('i', { 'class': 'ico ico-chevron-right' })]
			));

			children.push(h('span', { class: 'a2-pager-divider' }));
			children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
			return h('div', contProps, children);
		}
	});
})();

