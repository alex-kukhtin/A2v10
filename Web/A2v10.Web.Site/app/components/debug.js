// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250204-7979
// components/debug.js*/

(function () {

	const http = require('std:http');
	const urlTools = require('std:url');
	const eventBus = require('std:eventBus');
	const locale = window.$$locale;

	const traceItem = {
		name: 'a2-trace-item',
		template: `
<div v-if="hasElem" class="trace-item-body">
	<span class="title" v-text="name"/><span class="badge" v-text="elem.length"/>
	<ul class="a2-debug-trace-item">
		<li v-for="itm in elem">
			<div class="rq-title"><span class="elapsed" v-text="itm.elapsed + ' ms'"/> <span v-text="itm.text"/></div>
		</li>
	</ul>
</div>`,
		props: {
			name: String,
			elem: Array
		},
		computed: {
			hasElem() {
				return this.elem && this.elem.length;
			}
		}
	};

	Vue.component('a2-debug', {
		template: `
<div class="debug-panel" v-if="paneVisible" :class="panelClass">
	<div class="debug-pane-header">
		<span class="debug-pane-title" v-text="title"></span>
		<a class="btn btn-close" @click.prevent="close">&#x2715</a>
	</div>
	<div class="toolbar">
		<button class="btn btn-tb" @click.prevent="refresh"><i class="ico ico-reload"></i> {{text('$Refresh')}}</button>
		<template v-if="modelVisible">
			<div class="divider"/>
			<label class="btn btn-tb btn-checkbox" :class="{checked: useSpec}"
				:title="text('$ShowSpecProps')">
				<input type="checkbox" v-model="useSpec"/>
				<i class="ico ico-list"/>
			</label>
			<button class="btn btn-tb" @click.prevent="expandAll"><i class="ico ico-arrow-sort"></i></button>
		</template>
		<div class="aligner"></div>
		<button class="btn btn-tb" @click.prevent="toggle"><i class="ico" :class="toggleIcon"></i></button>
	</div>
	<div class="debug-model debug-body" v-if="modelVisible">
		<a2-json-browser :root="modelRoot()" :use-spec="useSpec" ref="modelJson"/>
	</div>
	<div class="debug-trace debug-body" v-if="traceVisible">
		<ul class="a2-debug-trace">
			<li v-for="r in trace">
				<div class="rq-title"><span class="elapsed" v-text="r.elapsed + ' ms'"/> <span v-text="r.url" /></div>
				<a2-trace-item name="Sql" :elem="r.items.Sql"></a2-trace-item>
				<a2-trace-item name="Render" :elem="r.items.Render"></a2-trace-item>
				<a2-trace-item name="Report" :elem="r.items.Report"></a2-trace-item>
				<a2-trace-item name="Workflow" :elem="r.items.Workflow"></a2-trace-item>
				<a2-trace-item class="exception" name="Exceptions" :elem="r.items.Exception"></a2-trace-item>
			</li>
		</ul>
	</div>
</div>
`,
		components: {
			'a2-trace-item': traceItem
		},
		props: {
			modelVisible: Boolean,
			traceVisible: Boolean,
			modelStack: Array,
			counter: Number,
			close: Function
		},
		data() {
			return {
				trace: [],
				left: false,
				useSpec: false
			};
		},
		computed: {
			refreshCount() {
				return this.counter;
			},
			paneVisible() {
				return this.modelVisible || this.traceVisible;
			},
			title() {
				return this.modelVisible ? locale.$DataModel
					: this.traceVisible ? locale.$Profiling
						: '';
			},
			traceView() {
				return this.traceVisible;
			},
			toggleIcon() {
				return this.left ? 'ico-pane-right' : 'ico-pane-left';
			},
			panelClass() {
				return this.left ? 'left' : 'right';
			},
		},
		methods: {
			modelRoot() {
				// method. not cached
				if (!this.modelVisible)
					return {};
				if (this.modelStack.length)
					return this.modelStack[0].$data;
				return {};
			},
			refresh() {
				if (this.modelVisible)
					this.$forceUpdate();
				else if (this.traceVisible)
					this.loadTrace();
			},
			expandAll() {
				if (!this.modelVisible) return;
				let brw = this.$refs.modelJson;
				if (!brw) return;
				brw.expandAll();
			},
			toggle() {
				this.left = !this.left;
			},
			loadTrace() {
				const root = window.$$rootUrl;
				const url = urlTools.combine(root, '_shell/trace');
				const that = this;
				// with skip events
				http.post(url, null, false, true).then(function (result) {
					that.trace.splice(0, that.trace.length);
					if (!result) return;
					result.forEach((val) => {
						that.trace.push(val);
					});
				});
			},
			text(key) {
				return locale[key];
			}
		},
		watch: {
			refreshCount() {
				// dataModel stack changed
				let brw = this.$refs.modelJson;
				if (brw)
					brw.clearExpanded();
				this.$forceUpdate();
			},
			traceView(newVal) {
				if (newVal)
					this.loadTrace();
			}
		},
		created() {
			eventBus.$on('endRequest', (url) => {
				if (!url) return;
				if (url.indexOf('/_shell/trace') !== -1) return;
				if (!this.traceVisible) return;
				this.loadTrace();
			});
		}
	});
})();
