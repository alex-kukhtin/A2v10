/*20170823-7018*/
/*components/pager.js*/

Vue.component('a2-pager', {
	template: `
<div class="pager">
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}}</code>
	<a href @click.stop.prevent="source.first">first</a>
	<a href @click.stop.prevent="source.prev">prev</a>
	<a href @click.stop.prevent="source.next">next</a>
</div>
`,
	props: {
		source: Object
	}
});

