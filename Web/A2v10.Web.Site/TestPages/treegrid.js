/*
  
 */

let gridTemplate = `
<table>
	<thead>
		<tr>
			<th style="width:1px">+</th>
			<th>1</th>
			<th>2</th>
			<th>3</th>
		</tr>
	</thead>
	<tbody>
		<tr v-for="(itm, ix) in rows" :class="itmClass(itm)">
			<td><button v-if='itm.hasChildren' @click.stop.prevent="toggle(itm)">+</button></td>
			<slot name="row" v-bind:itm="itm.item" v-bind:that="that"></slot>
		</tr>
	</tbody>
</table>
`;

/*
*/

Vue.component('a2-treegrid', {
	template: gridTemplate,
	props: {
		root: Object,
		item: String
	},
	data() {
		return {
		};
	},
	computed: {
		rows() {
			let arr = [];
			let collect = (pa, lev) => {
				for (let i = 0; i < pa.length; i++) {
					let el = pa[i];
					let ch = el[this.item];
					arr.push({ item: el, level: lev, hasChildren: ch && ch.length > 0 });
					if (ch && el.$expanded)
						collect(ch, lev + 1);
				}
			};
			collect(this.root[this.item], 0);
			console.dir(arr);
			return arr;
		},
		that() {
			return this;
		}
	},
	methods: {
		toggle(itm) {
			console.dir(itm);
			itm.item.$expanded = !itm.item.$expanded;
		},
		toggle2(itm) {
			itm.$expanded = !itm.$expanded;
		},
		itmClass(itm) {
			return `lev lev-${itm.level}`;
		}
	}
});
