// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190725-7508
// components/graphics.js

/* TODO:
*/

(function () {

	let graphId = 1237;

	function nextGraphicsId() {
		graphId += 1;
		return 'el-gr-' + graphId;
	}

	Vue.component("a2-graphics", {
		template:
			`<div :id="id" class="a2-graphics"></div>`,
		props: {
			render: Function,
			arg: [Object, String, Number, Array],
			watchmode: String
		},
		data() {
			return {
				unwatch: null,
				id: nextGraphicsId()
			};
		},
		computed: {
			controller() {
				return this.$root;
			}
		},
		methods: {
			draw() {
				const chart = d3.select('#' + this.id);
				chart.selectAll('*').remove();
				this.render.call(this.controller.$data, chart, this.arg);
			}
		},
		mounted() {
			this.$nextTick(() => this.draw());
			if (this.watchmode === 'none') return;
			let deep = this.watchmode === 'deep';
			this.unwatch = this.$watch('arg', () => this.draw(), { deep: deep });
		},
		beforeDestroy() {
			if (this.unwatch)
				this.unwatch();
		}
	});
})();
