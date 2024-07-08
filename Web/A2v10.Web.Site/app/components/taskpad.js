// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

// 20200111-7969
// components/taskpad.js

Vue.component("a2-taskpad", {
	template:
`<div :class="cssClass" :style="{width:width}">
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
		title: String,
		initialCollapsed: Boolean,
		position: String,
		initialWidth: { type: String, default: '20rem' }
	},
	data() {
		return {
			expanded: true
		};
	},
	computed: {
		width() {
			return this.expanded ? this.initialWidth : undefined;
		},
		cssClass() {
			let cls = "taskpad";
			cls += ' position-' + this.position;
			if (this.expanded) cls += ' expanded'; else cls += ' collapsed';
			return cls;
		},
		tasksText() {
			return this.title || window.$$locale.$Tasks;
		}
	},
	methods: {
		setExpanded(exp) {
			this.expanded = exp;
		},
		toggle() {
			this.setExpanded(!this.expanded);
		}
	},
	mounted() {
		if (this.initialCollapsed)
			this.setExpanded(false);
	}
});

