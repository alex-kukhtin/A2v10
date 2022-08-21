/*
 row, col, 
  
 */

let itemTemplate = `
<div class=dashboard-item :draggable="editMode" 
	:style="{gridArea: gridArea}" @dragstart=dragStart @dragend=dragEnd>
	<slot></slot>
	<div class=drag-area v-if=editMode>
		<button v-if="!isnew" class="clear-button" @click=remove>✕</button>
	</div>
</div>
`;

let placeholderTemplate = `
<div class='dashboard-placeholder' @drop=drop @dragover=dragOver @dragenter=dragEnter
:style="{gridRow: row, gridColumn: col}" :class="{hover}">{{row}} {{col}}</div>
`;

let boardTemplate = `
<div>
	<div class=dashboard :style="{gridTemplateColumns: templateColumns, gridTemplateRows: templateRows}">
		<template v-for="row in rows" v-if = editMode >
			<a2-dashboard-placeholder v-show="placeholderVisible(row, col)" ref=ph
				v-for="col in cols" :row="row" :col="col" :key="row * rows + col"/>
		</template>
		<slot>
			<a2-dashboard-item v-for="(itm, ix) in items" :key=ix :item="itm" :edit-mode="editMode"
					:row="itm.row" :col="itm.col" :col-span="itm.colSpan" :row-span="itm.rowSpan">
				<slot name="element" v-bind:item="itm"></slot>
			</a2-dashboard-item>
		</slot>
	</div>
	<ul class="dashboard-list" v-if="editMode">
		<a2-dashboard-item v-for="(itm, ix) in list" :key=ix :edit-mode="true"
				:item=itm :col-span="itm.colSpan" :row-span="itm.rowSpan" :isnew=true>
			<slot name="listitem" v-bind:item="itm"></slot>
		</a2-dashboard-item>
	</ul>
</div>
`;

let placeHolder = {
	name: 'a2-dashboard-placeholder',
	template: placeholderTemplate,
	props: {
		row: Number,
		col: Number
	},
	data() {
		return {
			hover: false
		};
	},
	methods: {
		dragOver(ev) {
			if (this.$parent.$canDrop({row: this.row, col: this.col }))
				ev.preventDefault();
		},
		dragEnter(ev) {
			this.$parent.$enter(ev.target);
		},
		drop(ev) {
			this.$parent.$drop({row: this.row, col: this.col});
		}
	}
}

Vue.component('a2-dashboard-item', {
	template: itemTemplate,
	props: {
		row: { type: Number, default: 1},
		rowSpan: { type: Number, default: 1 },
		col: { type: Number, default: 1 },
		colSpan: { type: Number, default: 1 },
		isnew: Boolean,
		item: Object,
		editMode: Boolean
	},
	data() {
		return {
			posX: 0,
			posY: 0
		};
	},
	computed: {
		gridArea() {
			return `${this.row} / ${this.col} / span ${this.rowSpan} / span ${this.colSpan}`;
		}
	},
	methods: {
		dragStart(ev) {
			if (!this.editMode) return;
			ev.dataTransfer.effectAllowed = "move";
			if (this.isnew) {
				this.posX = 0;
				this.posY = 0;
			}
			else {
				this.posY = Math.floor(ev.offsetY / (ev.target.offsetHeight / this.rowSpan));
				this.posX = Math.floor(ev.offsetX / (ev.target.offsetWidth / this.colSpan))
			}
			this.$parent.$start(this);
		},
		dragEnd(ev) {
			if (!this.editMode) return;
			this.$parent.$clearHover();
		},
		remove() {
			this.$parent.$removeItem(this.item);
		}
	},
	mounted() {
		this.$parent.$register(this);
	}
});

Vue.component('a2-dashboard', {
	template: boardTemplate,
	components: {
		'a2-dashboard-placeholder': placeHolder
	},
	props: {
		cols: Number,
		rows: Number,
		items: Array,
		list: Array,
		editMode: Boolean,
		setRows: Function
	},
	data() {
		return {
			staticElems: [],
			currentElem: null
		};
	},
	computed: {
		templateColumns() {
			return `repeat(${this.cols}, 1fr)`;
		},
		templateRows() {
			return `repeat(${this.rows}, minMax(50px, auto))`;
		},
		elements() {
			if (this.items)
				return this.items.map(item => {
					return {
						startRow: item.row,
						startCol: item.col,
						endRow: item.row + (item.rowSpan || 1) - 1,
						endCol: item.col + (item.colSpan || 1) - 1
					};
				})
			return this.staticElems;
		}
	},
	methods: {
		placeholderVisible(row, col) {
			if (!this.editMode) return false;
			let intercect = (elem) =>
				row >= elem.startRow && row <= elem.endRow &&
				col >= elem.startCol && col <= elem.endCol;
			return !this.elements.find(intercect);
		},
		$register(item) {
			this.staticElems.push({ startRow: item.row, startCol: item.col, endRow: item.row + item.rowSpan - 1, endCol: item.col + item.colSpan - 1 });
		},
		$removeItem(itm) {
			let ix = this.items.indexOf(itm);
			if (ix >= 0)
				this.items.splice(ix, 1);

		},
		$findPlaceholder(el) {
			return this.$refs.ph.find(x => x.$el === el);
		},
		$findPlaceholderPos(row, col) {
			return this.$refs.ph.find(x => x.row === row && x.col === col);
		},
		$hover(arr) {
			this.$refs.ph.forEach(ph => {
				let sign = `${ph.row}:${ph.col}`;
				let find = arr.find(ai => ai === sign);
				ph.hover = !!find;
			});
		},
		$clearHover() {
			this.$refs.ph.forEach(ph => ph.hover = false);
		},
		$start(el) {
			this.currentElem = el;
		},
		$setHover(el, val) {
			let ce = this.currentElem;
			if (!ce) return;
			let ph = this.$findPlaceholder(el);
			if (!ph) return;
			let x = ph.col - ce.posX;
			let y = ph.row - ce.posY;
			let arr = [];
			for (let r = 0; r < ce.rowSpan; r++) 
				for (let c = 0; c < ce.colSpan; c++) 
					arr.push(`${r + y}:${c + x}`);
			this.$hover(arr);
		},
		$enter(el) {
			this.$setHover(el, true);
		},
		$canDrop(el) {
			let ce = this.currentElem;
			if (!ce) return false;
			let y1 = el.row - ce.posY;
			let y2 = y1 + ce.rowSpan - 1;
			let x1 = el.col - ce.posX;
			let x2 = x1 + ce.colSpan - 1;
			//console.dir(`x1: ${x1}, x2: ${x2}, y1: ${y1}, y2: ${y2}`);
			if (y1 < 1 || y2 > this.rows) return false;
			if (x1 < 1 || x2 > this.cols) return false;
			//TODO: check intersections 
			return true;
		},
		$drop(el) {
			this.$clearHover();
			let ce = this.currentElem;
			if (ce) {
				if (ce.item) {
					ce.item.row = el.row - ce.posY;
					ce.item.col = el.col - ce.posX;
					if (ce.isnew)
						this.items.push(Object.assign({}, ce.item));
				}
				this.currentElem = null;
				if (this.setRows)
					this.setRows(1);
			}
		}
	}
});
