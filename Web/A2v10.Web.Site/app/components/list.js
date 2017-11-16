
// yet not implemented !!!

Vue.component("a2-list", {
	template:
`<ul class="a2-list">
	<li v-for="(item, itemIndex) in itemsSource" :key="itemIndex" @click.prevent="select(item)">
		<slot>
		</slot>
	</li>
</ul>
`,
    props() {
        itemsSource: Array
	},
	methods: {
        select(item) {
            item.$select();
		}
	}
});

