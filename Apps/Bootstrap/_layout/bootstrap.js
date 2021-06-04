app.components['std:appHeader'] = {

	extends: component('std:appHeaderBase'),

	template: `
<div class="navbar navbar-dark bg-dark navbar-expand-lg app-header">
<div class="container-fluid">
	<a class="navbar-brand" href="/" v-text=title></a>
	<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarNavAltMarkup">
		<ul class="navbar-nav me-auto">
			<li v-for="m in menu" class="nav-item"><a class="nav-link" :class="{active: isActive(m)}"
	v-text=m.Name href="" @click.stop.prevent=navigate(m)></a></li>
		</ul>
		<span class="navbar-text" v-text=personName></span>
	</div>
</div>
</div>`,

	props: {

	},
	methods: {

	},
	created: function() {
	}
};

app.components['std:mainView'] = {

	extends: component('std:mainViewBase'),

	props: {

	},
	methods: {

	},
	created: function() {
	}
};

(function () {

	const sideBarTreeItem = {
		name: 'side-bar-tree-item',
		template: `
<li class="sidebar-item">
	<a v-if="isFolder" @click.stop.prevent=click href="" class="sidebar-folder">
		<span v-text="item.Name"></span>
		<span>^</span>
	</a>
	<a v-else @click.stop.prevent=click href="" class="sidebar-link">
		<span v-text="item.Name"></span>
	</a>
	<ul v-if=expanded class="sidebar-nav-menu">
		<side-bar-tree-item v-for="(itm, idx) in item.Menu" :class="{active: isActive(itm)}" :isActive=isActive :lev="lev + 1"
			:item=itm :key=itm.Id :navigate=navigate></side-bar-tree-item>
	</ul>
</li>
`,
		props: {
			item: Object,
			navigate: Function,
			isActive: Function,
			lev: Number
		},
		data() {
			return {
				expanded: true
			}
		},
		computed: {
			isFolder() {
				return this.item.Menu && this.item.Menu.length;
			}
		},
		methods: {
			click() {
				if (this.isFolder)
					this.toggle();
				else
					this.navigate(this.item);
			},
			toggle() {
				this.expanded = !this.expanded;
			}
		}

	}

	const sideBarTree = {
		props: {
			items: Array,
			navigate: Function,
			isActive: Function
		},
		components: {
			"side-bar-tree-item": sideBarTreeItem
		},
		template: `
<ul class="sidebar-nav">
	<side-bar-tree-item v-for="(itm, idx) in items" :item=itm :key="itm.Id" :isActive=isActive
		:class="{active: isActive(itm)}" :lev="0"
		:navigate=navigate></side-bar-tree-item>
</ul>
`,
		computed: {
		},
		methods: {
		}
	}


	Vue.component('a2-side-bar', {

		extends: component('std:sideBarBase'),
		components: {
			"side-bar-tree": sideBarTree
		},
		template: `
<aside class="app-side-bar sidebar-nav">
	<side-bar-tree :items="sideMenu" :navigate=navigate :isActive=isActive></side-bar-tree>
</aside>
`,
		props: {

		},
		methods: {

		},
		created() {
		}
	});
})();