// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180206-7105
// components/graphics.js

/* TODO:
*/

(function () {

    Vue.component("a2-graphics", {
        template:
        `<div :id="id" class="a2-graphics"></div>`,
        props: {
            id: String,
            render: Function
        },
        computed: {
            controller() {
                return this.$root;
            }
        },
        methods: {
        },
        mounted() {
            const chart = d3.select('#' + this.id);
            this.render.call(this.controller.$data, chart);
        }
    });
})();
