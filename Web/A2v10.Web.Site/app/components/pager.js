/*20170823-7018*/
/*components/pager.js*/

Vue.component('a2-pager', {
	template: `
<div class="pager">
	<a href @click.prevent="source.first" :disabled="disabledFirst"><i class="ico ico-chevron-left-end"/></a>
	<a href @click.prevent="source.prev" :disabled="disabledPrev"><i class="ico ico-chevron-left"/></a>

	<a href v-for="b in middleButtons " @click.prevent="page(b)"><span v-text="b"></span></a>

	<a href @click.prevent="source.next"><i class="ico ico-chevron-right"/></a>
	<a href @click.prevent="source.last"><i class="ico ico-chevron-right-end"/></a>
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}} count={{source.sourceCount}}</code>
</div>
`,
	props: {
		source: Object
	},
	computed: {
		middleButtons() {
			let ba = [];
			ba.push(1);
			ba.push(2);
			return ba;
		},
		disabledFirst() {
			return this.source.offset === 0;
		},
		disabledPrev() {
			return this.source.offset === 0;
		}
	},
	methods: {
		page(no) {

		}
	}
});

