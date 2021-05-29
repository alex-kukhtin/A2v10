// Copyright © 2021 Alex Kukhtin. All rights reserved.

/*20210529-7776*/
/* bootstrap/sidebar.js */

(function () {
	const store = component('std:store');
	const urlTools = require('std:url');
	const menuTools = component('std:navmenu');
	const htmlTools = require('std:html');

	const sideBarTreeItem = {
		name: 'side-bar-tree-item',
		template: `
<li class="side-bar-tree-item" style="margin-left:16px">
	<a @click.stop.prevent=click href=""><span v-text=item.Name></span></a>
	<ul v-if=expanded>
		<side-bar-tree-item v-for="(itm, idx) in item.Menu" :item=itm :key=itm.Id :navigate=navigate></side-bar-tree-item>
	</ul>
</li>
`,
		props: {
			item: Object,
			navigate: Function
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
		template: `
<ul class="side-bar-tree">
	<side-bar-tree-item v-for="(itm, idx) in items" :item=itm :key="itm.Id" :navigate=navigate></side-bar-tree-item>
</ul>
`,
		components: {
			"side-bar-tree-item": sideBarTreeItem
		},
		props: {
			items: Array,
			navigate: Function
		}
	}


	const sideBar = {
		template: `
<div class="app-side-bar">
<span v-text=seg0></span>/
<span v-text=seg1></span>
<side-bar-tree :items="sideMenu" :navigate=navigate></side-bar-tree>
</div>
`,
		components: {
			"side-bar-tree": sideBarTree
		},
		props: {
			menu: Array,
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			topMenu() {
				let seg0 = this.seg0;
				return menuTools.findMenu(this.menu, (mi) => mi.Url === seg0);
			},
			sideMenu() {
				let top = this.topMenu;
				return top ? top.Menu : null;
			}
		},
		methods: {
			isActive(item) {
				let isActive = this.seg1 === item.Url;
				if (isActive)
					htmlTools.updateDocTitle(item.Name);
				return isActive;
			},
			navigate(item) {
				if (this.isActive(item))
					return;
				if (!item.Url) return;
				let top = this.topMenu;
				if (top) {
					let url = urlTools.combine(top.Url, item.Url);
					if (item.Url.indexOf('/') === -1) {
						// save only simple path
						try {
							// avoid EDGE error QuotaExceeded
							localStorage.setItem('menu:' + urlTools.combine(window.$$rootUrl, top.Url), item.Url);
						}
						catch (e) {
							// do nothing
						}
					}
					this.$store.commit('navigate', { url: url, title: item.Name });
				}
				else
					console.error('no top menu found');
			}
		}
	}



	app.components['std:sideBar'] = sideBar;
})();
