(function () {


    // сделать простую СЕКЦИЮ для <tr></td>!!!!
    const sheetTemplate = `
<table>
    <thead>
        <slot name="header"></slot>
    </thead>
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

    Vue.component("a2-sheet", {
        template: sheetTemplate
    });

    Vue.component("a2-sheet-section", {
        template: sheetSectionTemplate
    });

    function* traverse(item, prop, lev) {
        if (prop in item) {
            let arr = item[prop];
            for (let i = 0; i < arr.length; i++) {
                let elem = arr[i];
                elem.$level = lev;
                yield elem;
                if (!elem.$collapsed)
                    yield* traverse(elem, prop, lev + 1);
            }
        }
    }

    Vue.component('a2-sheet-section-tree', {
        //template: sheetSectionTemplate,
        functional: true,
        name: 'a2-sheet-section',
        props: {
            itemsSource: Object,
            propName: String
        },
        render: function (h, ctx) {
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
                return cls;
            }

            function hasChildren() {
                let chElems = this.item[prop];
                return chElems && chElems.length > 0;
            }

            const slot = ctx.data.scopedSlots.default;

            let compArr = [];

            for (let v of traverse(source, prop, 1)) {
                let slotElem = slot({ item: v, toggle: toggle, cssClass: cssClass, hasChildren: hasChildren })[0];
                compArr.push(h(slotElem.tag, slotElem.data, slotElem.children));
            }
            return h('tbody', {}, compArr);
            //return compArr;
        }
    });

})();