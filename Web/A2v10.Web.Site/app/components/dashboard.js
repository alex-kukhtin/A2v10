// Copyright © 2022-2023 Oleksandr Kukhtin. All rights reserved.

// 20230807-7941
// components/dashboard.js

(function () {
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
:style="{gridRow: row, gridColumn: col}" :class="{hover}"></div>
`;

	let boardTemplate = `
<div class="dashboard-container" :class="{editing: editMode}">
	<div class="drag-host" ref=drag-host></div>
	<div class=dashboard :style="{gridTemplateColumns: templateColumns, gridTemplateRows: templateRows}" ref=dash>
		<div v-if="editable && !editMode" class="start-toolbar toolbar" 
			:style="{'grid-column':cols + 1}" :class="{'no-items': !hasItems}">
			<slot name="startbtn"></slot>
		</div>
		<template v-for="ph in placeholders" v-if=editMode>
			<a2-dashboard-placeholder v-show="placeholderVisible(ph.row, ph.col)"
				:row="ph.row" :col="ph.col" :key="ph.key" :hover="ph.hover"/>
		</template>
		<slot>
			<a2-dashboard-item v-for="(itm, ix) in items" :key=ix :item="itm" 
					:edit-mode="editMode"
					:row="itm.row" :col="itm.col" :col-span="itm.colSpan" :row-span="itm.rowSpan">
				<slot name="element" v-bind:item="itm"></slot>
			</a2-dashboard-item>
		</slot>
		<div v-if="!hasItems && !editMode">
			<slot name="empty"></slot>
		</div>
	</div>
	<div class="dashboard-list" v-if="editMode">
		<div class="widget-toolbar">
			<slot name="toolbar"></slot>
		</div>
		<ul class="widget-list-grouping" v-if="groupBy">
			<li class="widget-group" v-for="(grp, ixg) in groupingList" :key="ixg"
					:class="{collapsed: isGroupCollapsed(grp)}">
				<div class="widget-group-title" @click.stop.prevent="toggleGroup(grp)">
					<span v-text="grp.name"/>
					<span class="ico collapse-handle"></span>
				</div>
				<ul class="widget-list">
					<a2-dashboard-item v-for="(itm, ix) in grp.items" :key=ix :edit-mode="true"
							:item=itm :col-span="itm.colSpan" :row-span="itm.rowSpan" :isnew=true>
						<slot name="listitem" v-bind:item="itm"></slot>
					</a2-dashboard-item>
				</ul>
			</li>
		</ul>
		<ul class="widget-list" v-else>
			<a2-dashboard-item v-for="(itm, ix) in list" :key=ix :edit-mode="true"
					:item=itm :col-span="itm.colSpan" :row-span="itm.rowSpan" :isnew=true>
				<slot name="listitem" v-bind:item="itm"></slot>
			</a2-dashboard-item>
		</ul>
	</div>
</div>
`;

	let placeHolder = {
		name: 'a2-dashboard-placeholder',
		template: placeholderTemplate,
		props: {
			row: Number,
			col: Number,
			hover: Boolean
		},
		computed: {
			obj() {
				return { row: this.row, col: this.col };
			}
		},
		methods: {
			dragOver(ev) {
				if (this.$parent.$canDrop(this.obj))
					ev.preventDefault();
			},
			dragEnter(ev) {
				this.$parent.$enter(this.obj);
			},
			drop(ev) {
				this.$parent.$drop(this.obj);
			}
		}
	}

	Vue.component('a2-dashboard-item', {
		template: itemTemplate,
		props: {
			row: { type: Number, default: 1 },
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
				let img = this.$parent.$getDragImage(this);
				ev.dataTransfer.setDragImage(img, ev.offsetX, ev.offsetY);
				this.$parent.$start(this);
			},
			dragEnd(ev) {
				if (!this.editMode) return;
				this.$parent.$dragEnd();
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
			items: Array,
			list: Array,
			groupBy: String,
			editable: Boolean,
			editMode: false,
			cellSize: {
				type: Object, default() { return { cx: '100px', cy: '100px' } }
			},
		},
		data() {
			return {
				staticElems: [],
				currentElem: null,
				lastPhRow: 0,
				lastPhCol: 0,
				collapsedGroups: []
			};
		},
		computed: {
			hasItems() {
				return this.items && this.items.length;
			},
			groupingList() {
				if (!this.groupBy)
					return [];
				let el = [];
				this.list.forEach(p => {
					let g = p[this.groupBy];
					let found = el.find(x => x.name === g);
					if (found)
						found.items.push(p);
					else
						el.push({
							name: g,
							items: [p]
						});
				});
				return el;
			},
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
			placeholders() {
				let ph = [];
				for (let r = 0; r < this.rows; r++) {
					for (let c = 0; c < this.cols; c++) {
						ph.push({ row: r + 1, col: c + 1, key: `${c}:${r}`, hover: false });
					}
				}
				return ph;
			},
			templateColumns() {
				if (!this.hasItems && !this.editMode)
					return '';
				return `repeat(${this.cols}, ${this.cellSize.cx}) ${this.editable ? 'minmax(20px,1fr)': ''}`;
			},
			templateRows() {
				if (!this.hasItems && !this.editMode)
					return '';
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
				this.items.$remove(itm);
				this.$clearHover();
				this.lastPhRow = 0;
				this.lastPhCol = 0;
			},
			$findPlaceholder(el) {
				return this.placeholders.find(x => x.row === el.row && x.col == el.col);
			},
			$hover(arr, pos) {
				this.lastPhRow = pos.y + pos.cy;
				this.lastPhCol = pos.x + pos.cx;
				this.placeholders.forEach(ph => {
					let sign = `${ph.row}:${ph.col}`;
					let find = arr.find(ai => ai === sign);
					ph.hover = !!find;
				});
			},
			$dragEnd() {
				this.$clearHover();
				this.lastPhRow = 0;
				this.lastPhCol = 0;
			},
			$clearHover() {
				this.placeholders.forEach(ph => ph.hover = false);
			},
			$start(el) {
				this.currentElem = el;
			},
			$getDragImage(el) {
				let img = this.$refs['drag-host'];
				let rs = window.getComputedStyle(this.$refs.dash);
				let colSize = parseFloat(rs.gridTemplateColumns.split(' ')[0]);
				let rowSize = parseFloat(rs.gridTemplateRows.split(' ')[0]);
				let colGap = parseFloat(rs.columnGap);
				let rowGap = parseFloat(rs.rowGap);
				img.style.width = (colSize * el.colSpan + (el.colSpan - 1) * colGap) + 'px';
				img.style.height = (rowSize * el.rowSpan + (el.rowSpan - 1) * rowGap) + 'px';
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
			},
			isGroupCollapsed(grp) {
				return this.collapsedGroups.indexOf(grp.name) >= 0;
			},
			toggleGroup(grp) {
				if (!this.isGroupCollapsed(grp))
					this.collapsedGroups.push(grp.name);
				else {
					let ix = this.collapsedGroups.indexOf(grp.name);
					if (ix >= 0)
						this.collapsedGroups.splice(ix, 1);
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
})();