(function () {

    const sheetTemplate = `
<table>
    <thead>
        <slot name="header"></slot>
    </thead>
    <tbody>
        <slot name="body"></slot>
    </tbody>
    <tfoot>
        <slot name="footer"></slot>
    </tfoot>
</table>
`;

    const sheetSectionTemplate = `
<tr v-for="(item, index) in elements" :ley>
    <slot></slot>
</tr>
`;
    Vue.component("a2-sheet", {
        template: sheetTemplate
    });

    function* traverse(item, prop, lev) {
        if (prop in item) {
            let arr = item[prop];
            for (let i = 0; i < arr.length; i++) {
                let elem = arr[i];
                elem.$level = lev;
                yield elem;
                yield* traverse(elem, prop, lev + 1);
            };
        }
    }

    Vue.component('a2-sheet-section', {
        template: sheetSectionTemplate,
        functional: true,
        name: 'a2-sheet-section',
        props: {
            item: Object,
            propName: String
        },
        methods: {
            toggle() {
                alert('toggle');
            }
        },
        render: function(h, ctx) {
            const slot = ctx.data.scopedSlots.default;
            const prop = ctx.props.propName;
            let compArr = [];
            console.dir(ctx);
            for (let v of traverse(ctx.parent, prop, 1)) {
                let slotElem = slot({ item: v, toggle: () => { }})[0];
                compArr.push(h(slotElem.tag, slotElem.children));
            }
            return compArr;
        }
    })
})();