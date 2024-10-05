// Copyright © 2019-2020 Oleksandr Kukhtin. All rights reserved.

// 20200224-7635
// components/a2-span-sum.js*/

(function () {
	Vue.component('a2-span-sum', {
		props: {
			content: [String, Number],
			dir: Number
		},
		render(h, ctx) {
			let children = [];
			children.push(h('span', {
				domProps: { innerText: this.content }
			}));
			let dcls = 'span-sum ';
			if (this.dir > 0) {/* in */
				children.push(h('i', { 'class': 'ico ico-arrow-up-green' }));
				dcls += 'in';
			}
			else if (this.dir < 0) { /* out */
				children.push(h('i', { 'class': 'ico ico-arrow-down-red' }));
				dcls += 'out';
			}
			else if (this.dir === 0) { /* inout */
				children.push(h('i', { 'class': 'ico ico-arrow-sort' }));
				dcls += 'inout';
			}
			return h('span', { class: dcls}, children);
		}
	});
})();