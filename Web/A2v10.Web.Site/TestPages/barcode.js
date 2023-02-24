/*
 1. checkIntersections
 2. dragImage
 3. cellSize
 */

let kanbanTemplate = `
<div class="kanban-container">
	<div class=kanban v-for="(itm, ix) in items" :key=ix>
		I AM THE ITEM
	</div>
</div>
`;

Vue.component('a2-kanban', {
	template: kanbanTemplate,
	props: {
		items: Array
	},
	data() {
		return {
		};
	},
	computed: {
	},
	methods: {
	}
});
