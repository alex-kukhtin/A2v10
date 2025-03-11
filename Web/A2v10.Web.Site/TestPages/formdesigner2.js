/*
 1. checkIntersections
 2. dragImage
 3. cellSize
 */

let itemTemplate = `
<div class="fd-item" @click.stop.prevent=clickItem
	:style="{gridArea: gridArea}" @dragstart=dragStart @dragend=dragEnd
	:class="itemClass">
	<slot></slot>
	<div class=drag-area>
		<button v-if="!isnew" class="clear-button" @click=remove>✕</button>
	</div>
</div>
`;

let placeholderTemplate = `
<div class='fd-placeholder' @drop=drop @dragover=dragOver @dragenter=dragEnter
:style="{gridRow: row, gridColumn: col}" :class="{hover}">{{row}} {{col}}</div>
`;

let formTemplate = `
<div class="fd-container">
	<div class="fd-drag-host" ref=drag-host></div>
	<div class=fd-body :style="{gridTemplateColumns: templateColumns, gridTemplateRows: templateRows}" ref=dash>
		<template v-for="row in rows">
			<a2-dform-placeholder v-show="placeholderVisible(row, col)" ref=ph
				v-for="col in cols" :row="row" :col="col" :key="row + ':' + col"/>
		</template>
		<slot>
			<a2-dform-item v-for="(itm, ix) in items" :key=ix :item="itm"
					:row="itm.row" :col="itm.col" :col-span="itm.colSpan" :row-span="itm.rowSpan">
				<slot name="element" v-bind:item="itm"></slot>
			</a2-dform-item>
		</slot>
	</div>
	<div>
		<ul class="dform-list">
			<a2-dform-item v-for="(itm, ix) in list" :key=ix :edit-mode="true"				
				:item=itm :col-span="itm.colSpan" :row-span="itm.rowSpan" :isnew=true>
				<slot name="listitem" v-bind:item="itm"></slot>
			</a2-dform-item>
		</ul>
		<div v-if=selectedItem>
			<span v-text=selectedItem></span>
			<div>
				<span>ColSpan</span>
				<input v-model.number="selectedItem.colSpan"/>
			</div>
			<div>
				<span>RowSpan</span>
				<input v-model.number="selectedItem.rowSpan"/>
			</div>
			<div>
				<span>Row</span>
				<input v-model.number="selectedItem.row"/>
			</div>
		</div>
	</div>
</div>
`;

let placeHolder = {
	name: 'a2-dform-placeholder',
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

Vue.component('a2-dform-item', {
	template: itemTemplate,
	props: {
		row: { type: Number, default: 1},
		rowSpan: { type: Number, default: 1 },
		col: { type: Number, default: 1 },
		colSpan: { type: Number, default: 1 },
		isnew: Boolean,
		item: Object,
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
		},
		itemClass() {
			return this.item === this.$parent.selectedItem ? 'selected' : '';
		}
	},
	methods: {
		dragStart(ev) {
			ev.dataTransfer.effectAllowed = "move";
			if (this.isnew) {
				this.posX = 0;
				this.posY = 0;
			}
			else {
				this.posY = Math.floor(ev.offsetY / (ev.target.offsetHeight / this.rowSpan));
				this.posX = Math.floor(ev.offsetX / (ev.target.offsetWidth / this.colSpan))
			}
			let img = this.$parent.$getDragImage(this);
			ev.dataTransfer.setDragImage(img, ev.offsetX, ev.offsetY);
			this.$parent.$start(this);
		},
		dragEnd(ev) {
			this.$parent.$clearHover();
		},
		remove() {
			this.$parent.$removeItem(this.item);
		},
		clickItem() {
			this.$parent.$clickItem(this.item);
		}
	},
	mounted() {
		this.$parent.$register(this);
	}
});

Vue.component('a2-formdesigner', {
	template: formTemplate,
	components: {
		'a2-dform-placeholder': placeHolder
	},
	props: {
		items: Array,
		list: Array,
		tools: Array,
		columns: Number,
		editable: Boolean,
		editMode: false,
		cellSize: { type: Object, default: { cx: '100px', cy: '30px' } },
	},
	data() {
		return {
			staticElems: [],
			currentElem: null,
			selectedItem: null,
			lastPhRow: 0,
			lastPhCol: 0
		};
	},
	computed: {
		rows() {
			let rows = 0;
			if (this.items && this.items.length)
				rows = this.items.reduce((p, c) => Math.max(p, c.row + (c.rowSpan || 1) - 1), -Infinity);
			if (this.editMode) {
				rows += 1;
				rows = Math.max(rows, this.lastPhRow);
			}
			return rows;
		},
		cols() {
			let cols = 0;
			if (this.items && this.items.length)
				cols = this.items.reduce((p, c) => Math.max(p, c.col + (c.colSpan || 1) - 1), -Infinity);
			if (this.editMode) {
				cols += 1;
				cols = Math.max(cols, this.lastPhCol);
			}
			return cols;
		},
		templateColumns() {
			return `repeat(${this.cols}, ${this.cellSize.cx})`;
		},
		templateRows() {
			return `repeat(${this.rows}, ${this.cellSize.cy})`;
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
			let intercect = (elem) =>
				row >= elem.startRow && row <= elem.endRow &&
				col >= elem.startCol && col <= elem.endCol;
			return !this.elements.find(intercect);
		},
		$register(item) {
			this.staticElems.push({ startRow: item.row, startCol: item.col, endRow: item.row + item.rowSpan - 1, endCol: item.col + item.colSpan - 1 });
		},
		$clickItem(itm) {
			this.selectedItem = itm;
		},
		$removeItem(itm) {
			if (this.selectedItem === itm)
				this.selectedItem = null;
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
		$hover(arr, pos) {
			this.$refs.ph.forEach(ph => {
				let sign = `${ph.row}:${ph.col}`;
				let find = arr.find(ai => ai === sign);
				ph.hover = !!find;
			});
			this.lastPhRow = pos.y + pos.cy;
			this.lastPhCol = pos.x + pos.cx;
		},
		$clearHover() {
			this.$refs.ph.forEach(ph => ph.hover = false);
		},
		$start(el) {
			this.currentElem = el;
		},
		$getDragImage(el) {
			let img = this.$refs['drag-host'];
			let rs = window.getComputedStyle(this.$refs.dash);
			//console.log(rs.gridColumnGap, rs.gridRowGap, rs.gridTemplateColumns, rs.gridTemplateRows);
			let colSize = parseFloat(rs.gridTemplateColumns.split(' ')[0]);
			let rowSize = parseFloat(rs.gridTemplateRows.split(' ')[0]);
			let colGap = parseFloat(rs.gridColumnGap);
			let rowGap = parseFloat(rs.gridRowGap);
			//console.log(colGap, rowGap);
			img.style.width = (colSize * el.colSpan + (el.colSpan - 1) * colGap) + 'px';
			img.style.height = (rowSize * el.rowSpan + (el.rowSpan - 1) * rowGap) + 'px';
			//console.log(img.style.width, img.style.height);
			return img;
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
			this.$hover(arr, { x, y, cx: ce.colSpan, cy: ce.rowSpan });
		},
		$enter(el) {
			this.$setHover(el, true);
		},
		$canDrop(el) {
			let ce = this.currentElem;
			if (!ce) return false;
			let pos = {
				t: el.row - ce.posY,
				l: el.col - ce.posX
			};
			pos.b = pos.t + ce.rowSpan - 1;
			pos.r = pos.l + ce.colSpan - 1;

			let intersect = (el) => {
				let r = {
					t: el.row,
					l: el.col,
					b: el.row + (el.rowSpan || 1) - 1,
					r: el.col + (el.colSpan || 1) - 1
				};
				let ints =
					r.l > pos.r ||
					r.r < pos.l ||
					r.t > pos.b ||
					r.b < pos.t;
				return !ints;
			}
			// check intersections here
			return !this.items.some(el => el !== ce.item && intersect(el));
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
			}
		}
	},
	watch: {
		editMode(val) {
			if (!val) {
				this.lastPhRow = 0;
				this.lastPhCol = 0;
			}
		}
	}
});
