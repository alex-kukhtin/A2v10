/*
 1. checkIntersections
 2. dragImage
 3. cellSize
 */

let kanbanTemplate = `
<div class="kanban">
	<div class=lane v-for="(lane, lx) in lanes" :key=lx>
		<div class=lane-header>
			<slot name=header v-bind:lane=lane></slot>
		</div>
		<ul class=card-list @dragover=dragOver>
			<li class=card v-for="(card, cx) in cards(lane)" :key=cx :draggable="true"
				@dragstart="dragStart($event, card)">
				<slot name=card v-bind:card=card></slot>
			</li>
		</ul>
		<div class=lane-footer>
			<slot name=footer v-bind:lane=lane></slot>
		</div>
	</div>
</div>
`;

Vue.component('a2-kanban', {
	template: kanbanTemplate,
	props: {
		lanes: Array,
		itemsProp: { type: String, default: 'Items' }
	},
	data() {
		return {
		};
	},
	computed: {
	},
	methods: {
		cards(lane) {
			return lane[this.itemsProp];
		},
		dragStart(ev, card) {
			ev.dataTransfer.effectAllowed = "move";
			console.log(ev, card);
		},
		dragOver(ev) {
			console.dir(ev);
			ev.preventDefault();
		}
	}
});
