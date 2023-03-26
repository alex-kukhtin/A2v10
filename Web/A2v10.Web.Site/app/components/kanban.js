// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

// 20230325-7923
// components/kanban.js

(function () {

	let kanbanTemplate = `
<div class="kanban">
	<div class="kanban-header kanban-part">
		<div class=lane-header v-for="(lane, lx) in lanes" :key=lx>
			<div class=lane-header-body>
				<slot name=header v-bind:lane=lane></slot>
			</div>
			<button v-if="false">›</button>
		</div>
	</div>
	<div class="kanban-body kanban-part">
		<div class=lane v-for="(lane, lx) in lanes" :key=lx @dragover=dragOver @drop="drop($event, lane)">
			<ul class=card-list>
				<li class=card v-for="(card, cx) in cards(lane)" :key=cx :draggable="true"
						@dragstart="dragStart($event, card)">
					<slot name=card v-bind:card=card></slot>
				</li>
			</ul>
		</div>
	</div>
	<div class="kanban-footer kanban-part">
		<div class=lane-footer  v-for="(lane, lx) in lanes" :key=lx>
			<slot name=footer v-bind:lane=lane></slot>
		</div>
	</div>
</div>
`;

	Vue.component('a2-kanban', {
		template: kanbanTemplate,
		props: {
			lanes: Array,
			items: Array,
			dropDelegate: Function,
			stateProp: String
		},
		data() {
			return {
				currentElem: null
			};
		},
		computed: {
		},
		methods: {
			cards(lane) {
				let id = lane.$id;
				return this.items.filter(itm => itm[this.stateProp].$id === id);
			},
			dragStart(ev, card) {
				ev.dataTransfer.effectAllowed = "move";
				this.currentElem = card;
			},
			dragOver(ev) {
				ev.preventDefault();
			},
			drop(ev, lane) {
				if (!this.currentElem) return;
				if (this.dropDelegate)
					this.dropDelegate(this.currentElem, lane);
				this.currentElem = null;
			}
		}
	});
})();
