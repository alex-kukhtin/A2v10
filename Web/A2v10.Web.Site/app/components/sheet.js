/* Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.*/

// 20240312-7963
// components/sheet.js

(function () {

	const sheetTemplate = `
<table class="sheet">
	<slot name="columns"></slot>
	<thead>
		<slot name="header"></slot>
	</thead>
	<slot name="col-shadow"></slot>
	<slot name="body"></slot>
	<tfoot>
		<slot name="footer"></slot>
	</tfoot>
</table>
`;

	const sheetSectionTemplate = `
<tbody>
	<slot></slot>
</tbody>
`;

	function* traverse(item, prop, lev) {
		if (prop in item) {
			let arr = item[prop];
			for (let i = 0; i < arr.length; i++) {
				let elem = arr[i];
				elem.$level = lev;
				yield elem;
				if (!elem.$collapsed) {
					let newprop = elem._meta_.$items || prop;
					yield* traverse(elem, newprop, lev + 1);
				}
			}
		}
	}

	Vue.component('a2-sheet', {
		template: sheetTemplate
	});

	Vue.component("a2-sheet-section", {
		template: sheetSectionTemplate
	});

	Vue.component('a2-sheet-section-tree', {
		functional: true,
		name: 'a2-sheet-section',
		props: {
			itemsSource: Object,
			propName: String
		},
		render(h, ctx) {
			const prop = ctx.props.propName;
			const source = ctx.props.itemsSource;
			if (!source) return;
			if (!prop) return;

			function toggle() {
				let clpsed = this.item.$collapsed || false;
				Vue.set(this.item, "$collapsed", !clpsed);
			}

			function cssClass() {
				let cls = '';
				if (this.hasChildren())
					cls += 'has-children';
				if (this.item.$collapsed)
					cls += ' collapsed';
				cls += ' lev-' + this.item.$level;
				return cls;
			}

			function rowCssClass(mark) {
				let cls = mark || '';
				if (this.hasChildren())
					cls += ` group gl-${this.item.$level}`;
				if (this.item.$collapsed)
					cls += ' collapsed';
				return cls;
			}

			function indentCssClass() {
				return 'indent lev-' + this.item.$level;
			}

			function hasChildren() {
				let np = this.item._meta_.$items || prop;
				let chElems = this.item[np];
				return chElems && chElems.length > 0;
			}

			const slot = ctx.data.scopedSlots.default;

			let compArr = [];

			for (let v of traverse(source, prop, 1)) {
				let slotElem = slot({ item: v, toggle, cssClass, hasChildren, rowCssClass, indentCssClass })[0];
				compArr.push(h(slotElem.tag, slotElem.data, slotElem.children));
			}
			return h('tbody', {}, compArr);
		}
	});
})();