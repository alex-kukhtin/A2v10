// Copyright © 2015-2021 Oleksandr Kukhtin. All rights reserved.

// 20210208-7745
// components/graphics.js

(function () {

	let graphId = 1237;

	function nextGraphicsId() {
		graphId += 1;
		return 'el-gr-' + graphId;
	}

	Vue.component("a2-graphics", {
		template:
			`<div :id="id" class="a2-graphics" ref=canvas></div>`,
		props: {
			render: Function,
			arg: [Object, String, Number, Array, Boolean, Date],
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
				const domElem = this.$refs.canvas;
				const chart = d3.select(domElem);
				chart.selectAll('*').remove();
				this.render.call(this.controller.$data, chart, this.arg, domElem);
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
			const chart = d3.select('#' + this.id);
			chart.selectAll('*').remove();
			this.$el.remove();
		}
	});
})();
