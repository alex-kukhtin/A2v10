// Copyright © 2023-2025 Oleksandr Kukhtin. All rights reserved.

// 20251024-7974
// components/kanban.js

(function () {

	let kanbanTemplate = `
<div class="kanban">
	<div class="kanban-header kanban-part">
		<div class=lane-header v-for="(lane, lx) in lanes" :key=lx :class="laneClass(lane)">
			<div class=lane-header-body>
				<slot name=header v-bind:lane=lane></slot>
			</div>
			<button v-if="false">›</button>
		</div>
		<div class="kanban-trash drop-shadow shadow1" v-if="showTrash" @dragover="dragTrash($event)"
				@drop="dropTrash($event)" :class="trashClass()" @dragleave="clearDrag($event)">
			<i class="ico ico-trash"></i>
		</div>
	</div>
	<div class="kanban-body kanban-part">
		<div class=lane v-for="(lane, lx) in lanes" :key=lx @dragover="dragOver($event, lane)"
				@drop="drop($event, lane)" :class="laneClass(lane)" @dragleave="clearDrag($event)">
			<ul class=card-list>
				<li class=card v-for="(card, cx) in cards(lane)" :key=cx :draggable="true"
						@dragstart="dragStart($event, card)" @dragend=dragEnd>
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
			trashDelegate: Function,
			stateProp: String,
			showTrash: Boolean
		},
		data() {
			return {
				currentElem: null,
				laneOver: null,
				insideTrash: false
			};
		},
		methods: {
			cards(lane) {
				let id = lane.$id;
				return this.items.filter(itm => itm[this.stateProp].$id === id);
			},
			clearDrag(ev) {
				if (ev && ev.currentTarget.contains(ev.relatedTarget))
					return;
				this.laneOver = null;
				this.insideTrash = false;
			},
			dragEnd() {
				this.clearDrag();
			},
			dragStart(ev, card) {
				this.clearDrag();
				if (!this.dropDelegate) {
					ev.preventDefault();
					return;
				}
				ev.dataTransfer.effectAllowed = "move";
				this.currentElem = card;
			},
			dragOver(ev, lane) {
				this.laneOver = lane;
				this.insideTrash = false;
				ev.preventDefault();
			},
			dragTrash(ev) {
				this.insideTrash = true;
				ev.preventDefault();
			},
			drop(ev, lane) {
				this.clearDrag();
				if (!this.currentElem) return;
				if (this.dropDelegate)
					this.dropDelegate(this.currentElem, lane);
				this.currentElem = null;
			},
			dropTrash(ev) {
				this.clearDrag();
				if (!this.currentElem) return;
				if (this.trashDelegate)
					this.trashDelegate(this.currentElem);
				this.currentElem = null;
			},
			laneClass(lane) {
				return lane == this.laneOver ? 'over' : undefined;
			},
			trashClass() {
				return this.insideTrash ? 'over' : undefined;
			}
		}
	});
})();
