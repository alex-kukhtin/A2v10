// Copyright © 2015-2026 Oleksandr Kukhtin. All rights reserved.

// 20260823-7985
// components/graphics.js

(function () {

	let graphId = 1237;

	function nextGraphicsId() {
		graphId += 1;
		return 'el-gr-' + graphId;
	}

	Vue.component("a2-graphics", {
		template:
			`<div :id="id" class="a2-graphics" ref=canvas >
				<div v-if="d3error" class="app-exception"><div class="message">The d3 library is not loaded. Check that the d3.min.js script is included in _layout/_scripts.html.</div></div>
			</div>`,
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
			},
			d3error() {
				return typeof (window.d3) == 'undefined';
			}
		},
		methods: {
			draw() {
				if (this.d3error) return;
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
			if (!this.d3error) {
				const chart = d3.select('#' + this.id);
				chart.selectAll('*').remove();
			}
			this.$el.remove();
		}
	});
})();
