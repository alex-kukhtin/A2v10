/**
 2. drag image - full element
 3. drop target - use span
 6. drop target - span > 1 => тянем за низ, право.
 * */

let itemTemplate = `
<div class=dashboard-item draggable 
	:style="{gridArea: gridArea}"
	@dragstart=dragStart @drag=dragMove>
	<slot></slot>
</div>
`;

let placeholderTemplate = `
<div class='dashboard-placeholder' @drop=drop @dragover=dragOver @dragleave=dragLeave
:style="{gridRow: row, gridColumn: col}">{{row}} {{col}}</div>
`;

let boardTemplate = `
<div class=dashboard :style="{gridTemplateColumns: templateColumns, gridTemplateRows: templateRows}">
	<template v-for="row in rows">
		<div v-for="col in cols" :row="row" :col="col" :key="row * rows + col" 
			v-show="placeholderVisible(row, col)" class="dashboard-placeholder"
			:style="{gridRow: row, gridColumn: col}"			
			@dragenter=placeholderDragEnter @dragover=placeholderDragOver
			@dragleave=placeholderDragLeave @drop=placeholderDrop >
			{{row}} {{col}}
		</div>
	</template>
	<slot>
		<a2-dashboard-item v-for="(itm, ix) in items" :key=ix :item="itm"
			:row="itm.row" :col="itm.col" :col-span="itm.colSpan" :row-span="itm.rowSpan">
			<slot name="element" v-bind:item="itm"></slot>
		</a2-dashboard-item>
	</slot>
</div>
`;

let placeHolder = {
	name: 'a2-dashboard-placeholder',
	template: placeholderTemplate,
	props: {
		row: Number,
		col: Number
	},
	methods: {
		dragOver(ev) {
			//console.dir(ev);
			ev.preventDefault();
		},
		dragEnter(ev) {
			console.dir(ev.target);
			ev.target.classList.add('dropzone');
			console.dir('enter');
		},
		dragLeave(ev) {
			ev.target.classList.remove('dropzone');
			console.dir('leave');
		},
		drop(ev) {
			ev.target.classList.remove('dropzone');
			console.dir('drop');
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
		item: Object
	},
	computed: {
		gridArea() {
			return `${this.row} / ${this.col} / span ${this.rowSpan} / span ${this.colSpan}`;
		}
	},
	methods: {
		dragStart(ev) {
			console.dir('start');
			console.dir(`offsetX: ${ev.offsetX}, offsetY: ${ev.offsetY}`);
			this.$parent.$start(this.item);
		},
		dragMove(ev) {
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
		items: Array
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
			let intercect = (elem) =>
				row >= elem.startRow && row <= elem.endRow &&
				col >= elem.startCol && col <= elem.endCol;

			let found = this.elements.find(intercect);
			return !found;
		},
		placeholderDragOver(ev) {
			ev.preventDefault();
		},
		placeholderDragEnter(ev) {
			console.dir(ev.target);
			ev.target.classList.add('dropzone');
			console.dir('enter');
		},
		placeholderDragLeave(ev) {
			ev.target.classList.remove('dropzone');
			console.dir('leave');
		},
		placeholderDrop(ev) {
			ev.target.classList.remove('dropzone');
			console.dir('drop');
			this.$parent.$drop({ row: this.row, col: this.col });
		},
		$register(item) {
			this.staticElems.push({ startRow: item.row, startCol: item.col, endRow: item.row + item.rowSpan - 1, endCol: item.col + item.colSpan - 1 });
		},
		$start(el) {
			console.dir('start drag element here');
			console.dir(el);
			this.currentElem = el;
		},
		$drop(el) {
			console.dir('drop element here');
			console.dir(el);
			if (this.currentElem) {
				this.currentElem.row = el.row;
				this.currentElem.col = el.col;
				this.currentElem = null;
			}
		}
	}
});
