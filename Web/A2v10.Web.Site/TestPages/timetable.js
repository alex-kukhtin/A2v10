

let timeTableTemplate = `
<div class="time-table">
   <table class="table-timetable">
		<thead>
			<tr>
				<th colspan=15>Days</th>
			</tr>
		</thead>
		<tbody>
			<template v-for="(row, rx) in rows">
				<tr :key="rx + '_1'">
					<td v-for="(d, dx) in topRow(row)" :key=dx :data-row="rx * 2" :data-day="dx"
						:class="cellClass(rx * 2, dx)" @click.stop.prevent="click($event, d)" v-text="d.day" ></td>
				</tr>
				<tr :key="rx + '_2'">
					<td v-for="(d, dx) in bottomRow(row)" :key=dx :data-row="rx * 2 + 1" :data-day="dx"
						class="bottom" :class="cellClass(rx * 2 + 1, dx)" @click.stop.prevent="click($event, d)" v-text=d.day></td>
				</tr>
			</template>
		</tbody>
   </table>
   <div class="cell-marker" ref="marker">
		<input class="mark-input">
		<button class="mark-button">v</button>
		<ul class="mark-dropdown">
			<li>
				Р: <input class="mark-input-dropdown"/>
				ВЧ: <input class="mark-input-dropdown"/>
				HЧ: <input class="mark-input-dropdown"/>
				HУ: <input class="mark-input-dropdown"/>
			</li>
			<li>ТН-Тимчасова непрацездатність</li>
			<li>ВП-Відпустка без збереження заробітньої плати</li>
			<li>Menu 3 3</li>
			<li>Menu 4 5</li>
		</ul>
   </div>
</div>
`;



Vue.component('a2-timetable', {
	template: timeTableTemplate,
	props: {
		rows: Array,
		daysProp: String
	},
	data() {
		return {
			drag: false,
			select: {
				topLeft: {r:-1, d: -1}, bottomRight: {r:-1, d:-1 }
			}
		};
	},
	computed: {
	},
	methods: {
		topRow(row) {
			return row.days.slice(0, 15);
		},
		bottomRow(row) {
			return row.days.slice(15);
		},
		cellClass(rx, dx) {
			let tl = this.select.topLeft;
			let br = this.select.bottomRight;
			if (rx >= tl.r && rx <= br.r && dx >= tl.d && dx <= br.d)
				return 'blue';
			return undefined;
		},
		click(ev, day) {
			let td = ev.srcElement;
			let marker = this.$refs.marker;
			marker.style.top = td.offsetTop + 'px';
			marker.style.left = td.offsetLeft + 'px';
			//marker.style.width = td.offsetWidth + 'px';
			marker.style.height = td.offsetHeight + 'px';
		},
		mouseDown(ev) {
			this.drag = true;
			let td = ev.srcElement;
			let r = td.getAttribute("data-row");
			let d = td.getAttribute("data-day");
			this.select.topLeft.r = r;
			this.select.topLeft.d = d;
			this.select.bottomRight.r = r;
			this.select.bottomRight.d = d;
			console.dir(`${r}:${d}`);
			let marker = this.$refs.marker;
			marker.style.top = td.offsetTop + 'px';
			marker.style.left = td.offsetLeft + 'px';
			marker.style.width = td.offsetWidth + 'px';
			marker.style.height = td.offsetHeight + 'px';
			console.dir(this.select);
		},
		mouseMove(ev) {
		},
		mouseUp(ev) {
		}
	}
});
