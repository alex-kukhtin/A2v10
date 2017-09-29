

Vue.component("a2-taskpad", {
	template:
`<div :class="cssClass">
	<a class="ico collapse-handle" @click.stop="toggle"></a>
	<div v-if="expanded" class="taskpad-body">
		<slot>
		</slot>
	</div>
	<div v-else class="taskpad-title" @click.prevent="toggle">
		<span class="taskpad-label">Задачи</span>
	</div>
</div>
`,
	data() {
		return {
			expanded: true,
			__savedCols: '',
		}
	},
	computed: {
		cssClass() {
			let cls = "taskpad";
			if (this.expanded) cls += ' expanded'; else cls += ' collapsed';
			return cls;
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
				topStyle.gridTemplateColumns = "1fr 20px";
		}
	},
	mounted() {
		let topStyle = this.$el.parentElement.style;
		this.__savedCols = topStyle.gridTemplateColumns;
	}
});

