// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190109-7408
// components/taskpad.js

Vue.component("a2-taskpad", {
	template:
		`<div :class="cssClass">
	<a class="ico taskpad-collapse-handle" @click.stop="toggle"></a>
	<div v-if="expanded" class="taskpad-body">
		<slot>
		</slot>
	</div>
	<div v-else class="taskpad-title" @click.prevent="toggle">
		<span class="taskpad-label" v-text="tasksText"></span>
	</div>
</div>
`,
	props: {
		title: String
	},
	data() {
		return {
			expanded: true,
			__savedCols: ''
		};
	},
	computed: {
		cssClass() {
			let cls = "taskpad";
			if (this.expanded) cls += ' expanded'; else cls += ' collapsed';
			return cls;
		},
		tasksText() {
			return this.title || window.$$locale.$Tasks;
		}
	},
	methods: {
		toggle() {
			// HACK
			let topStyle = this.$el.parentElement.style;
			this.expanded = !this.expanded;
			if (this.expanded)
				topStyle.gridTemplateColumns = this.__savedCols;
			else
				topStyle.gridTemplateColumns = "1fr 36px"; // TODO: ???
		}
	},
	mounted() {
		let topStyle = this.$el.parentElement.style;
		this.__savedCols = topStyle.gridTemplateColumns;
	}
});

