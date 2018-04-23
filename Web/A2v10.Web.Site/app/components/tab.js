// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


/* 20180423-7161 */
/*components/tab.js*/

/*
TODO:

2. isActive with location hash
5. enable/disable tabs
7. много табов - добавить стрелки ?
10. default header for dynamic tab
*/

(function () {

    /*
    <ul class="tab-header">
        <li v-for="(itm, index) in tabs" :key="index">
            <span v-text="itm.header"></span>
        </li>
    </ul >
    */

	const tabPanelTemplate = `
<div class="tab-panel">
    <template v-if="static">
		<ul class="tab-header">
			<li :class="tab.tabCssClass" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click.prevent="select(tab)" v-show="tab.isVisible">
				<i v-if="tab.hasIcon" :class="tab.iconCss" ></i>
				<span v-text="tab.header"></span><span class="badge" v-if="tab.hasBadge" v-text="tab.badge"></span>
			</li>
		</ul>
		<slot name="title" />
		<div class="tab-content" :class="contentCssClass">
			<slot />
		</div>
	</template>
	<template v-else>
		<ul class="tab-header">
			<li :class="{active: isActiveTab(item)}" v-for="(item, tabIndex) in items" :key="tabIndex" @click.prevent="select(item)" v-show="item.isVisible">
				<slot name="header" :item="item" :index="tabIndex" :number="tabIndex + 1">
					<span v-text="defaultTabHeader(item, tabIndex)"></span> 
				</slot>
			</li>
		</ul>
		<slot name="title" />
		<div class="tab-content">
			<div class="tab-item" v-if="isActiveTab(item)" v-for="(item, tabIndex) in items" :key="tabIndex">
				<slot name="items" :item="item" :index="tabIndex" />
			</div>
		</div>
	</template>
</div>
`;

	const tabItemTemplate = `
<div class="tab-item" v-if="isActive">
	<slot />
</div>
`;


	Vue.component('a2-tab-item', {
		name: 'a2-tab-item',
		template: tabItemTemplate,
		props: {
			header: String,
			badge: [String, Number, Object],
			icon: String,
			tabStyle: String,
			show: undefined
		},
		computed: {
			hasIcon() {
				return !!this.icon;
			},
			hasBadge() {
				return !!this.badge;
			},
			iconCss() {
				return this.icon ? ("ico ico-" + this.icon) : '';
			},
			isActive() {
				return this === this.$parent.activeTab;
			},
			tabCssClass() {
				return (this.isActive ? 'active ' : '') + (this.tabStyle || '');
			},
			isVisible() {
				if (typeof this.show === 'boolean')
					return this.show;
				return true;
			}
		},
		created() {
			this.$parent.$addTab(this);
		},
		destroyed() {
			this.$parent.$removeTab(this);
		}
	});


	Vue.component('a2-tab-panel', {
		template: tabPanelTemplate,
		props: {
			items: Array,
			header: String
		},
		data() {
			return {
				tabs: [],
				activeTab: null
			};
		},
		computed: {
			static() {
				return !this.items;
			},
			contentCssClass() {
				return this.activeTab ? this.activeTab.tabStyle : '';
			}
		},
		watch: {
			items(newVal, oldVal) {
				let tabs = this.items;
				if (newVal.length < oldVal.length) {
					// tab has been removed
					if (this._index >= tabs.length)
						this._index = tabs.length - 1;
					this.select(tabs[this._index]);
				} else if (newVal.length === oldVal.length) {
					// may be reloaded
					if (tabs.length > 0) this.select(tabs[0]);
				} else {
					// tab has been added
					this.select(tabs[tabs.length - 1]);
				}
			}
		},
		methods: {
			select(item) {
				this.activeTab = item;
				if (this.items)
					this._index = this.items.indexOf(item);
			},
			isActiveTab(item) {
				return item === this.activeTab;
			},
			defaultTabHeader(item, index) {
				return 'Tab ' + (index + 1);
			},
			$addTab(tab) {
				this.tabs.push(tab);
			},
			$removeTab(tab) {
				let ix = this.tabs.indexOf(tab);
				if (ix !== -1)
					this.tabs.splice(ix, 1);
			}
		},
		mounted() {
			if (this.tabs.length > 0)
				this.activeTab = this.tabs[0]; // no tab, reactive item
			else if (this.items && this.items.length)
				this.activeTab = this.items[0];
			this._index = 0;
		}
	});

})();