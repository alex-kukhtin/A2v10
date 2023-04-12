// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

/*20230412-7926*/
/* controllers/sidebar.js */

(function () {

	const menu = component('std:navmenu');
	const store = component('std:store');
	const urlTools = require('std:url');
	const htmlTools = require('std:html');

	const UNKNOWN_TITLE = 'unknown title';

	const sideBarBase = {
		props: {
			menu: Array,
			mode: String
		},
		computed: {
			seg0: () => store.getters.seg0,
			seg1: () => store.getters.seg1,
			sideMenu() {
				let top = this.topMenu;
				return top ? top.Menu : null;
			},
			topMenu() {
				let seg0 = this.seg0;
				return menu.findMenu(this.menu, (mi) => mi.Url === seg0);
			}
		},
		methods: {
			isActive(item) {
				let isActive = this.seg1 === item.Url;
				if (isActive)
					htmlTools.updateDocTitle(item.Name);
				return isActive;
			},
			isGroup(item) {
				if (!item.Params) return false;
				try {
					return JSON.parse(item.Params).group || false;
				} catch (err) {
					return false;
				}
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
			},
			itemHref(item) {
				if (!item.Url)
					return undefined
				let top = this.topMenu;
				return top ? urlTools.combine(top.Url, item.Url) : undefined;
			},
			toggle() {
				this.$parent.sideBarCollapsed = !this.$parent.sideBarCollapsed;
				try {
					// avoid EDGE error QuotaExceeded
					localStorage.setItem('sideBarCollapsed', this.$parent.sideBarCollapsed);
				}
				catch (e) {
					// do nothing
				}
			}
		}
	};

	const a2SideBar = {
		//TODO: 
		// 1. various menu variants
		// 2. folderSelect as function 
		template: `
<div :class="cssClass">
	<a href role="button" class="ico collapse-handle" @click.prevent="toggle"></a>
	<div class="side-bar-body advance" v-if="bodyIsVisible">
		<tree-view :items="sideMenu" :is-active="isActive" :is-group="isGroup" :click="navigate" :get-href="itemHref"
			:options="{folderSelect: folderSelect, label: 'Name', title: 'Description',
			subitems: 'Menu', expandAll:true, xtraClass:'ClassName',
			icon:'Icon', wrapLabel: true, hasIcon: true}">
		</tree-view>
	</div>
	<div v-else class="side-bar-title" @click.prevent="toggle">
		<span class="side-bar-label" v-text="title"></span>
	</div>
</div>
`,
		mixins: [sideBarBase],
		computed: {
			bodyIsVisible() {
				return !this.$parent.sideBarCollapsed || this.compact;
			},
			compact() {
				return this.mode === 'Compact';
			},
			title() {
				let sm = this.sideMenu;
				if (!sm)
					return UNKNOWN_TITLE;
				let seg1 = this.seg1;
				let am = menu.findMenu(sm, (mi) => mi.Url === seg1);
				if (am)
					return am.Name || UNKNOWN_TITLE;
				return UNKNOWN_TITLE;
			},
			cssClass() {
				let cls = 'side-bar';
				if (this.compact)
					cls += '-compact';
				return cls + (this.$parent.sideBarCollapsed ? ' collapsed' : ' expanded');
			}
		},
		methods: {
			folderSelect(item) {
				return !!item.Url;
			}
		}
	};

	const a2TabSideBar = {
		template: `
<div class="side-bar-top">
	<div class="a2-tab-bar">
		<div v-for="mi in topMenu.Menu" class="a2-tab-bar-item">
			<a :href="itemHref(mi)" @click.stop.prevent="navigate(mi)" v-text=mi.Name class="a2-tab-button" :class="{active: isActive(mi)}"></a>
		</div>
	</div>
</div>
`,
		mixins: [sideBarBase],
		computed: {
		},
		methods: {
		}
	};


	app.components['std:sidebar'] = {
		standardSideBar: a2SideBar,
		compactSideBar: a2SideBar,
		tabSideBar: a2TabSideBar
	};
})();	