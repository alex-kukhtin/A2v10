﻿// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

/*20230924-7948*/
// components/treeview.js

(function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const platform = require('std:platform');

	//stop for toggle is required!

	const treeItemComponent = {
		name: 'tree-item',
		template: `
<li @click.stop.prevent="doClick(item)" :title=title v-on:dblclick.stop.prevent="doDblClick(item)"
	v-show=isItemVisible
	:class="[cssClass, {expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected, folder:isFolder, group: isItemGroup}]" >
	<div :class="{overlay:true, 'no-icons': !options.hasIcon}">
		<a class="toggle" v-if="isFolder" href @click.stop.prevent=toggle></a>
		<span v-else class="toggle"/>
		<i v-if="options.hasIcon" :class="iconClass"/>
		<a v-if="hasLink(item)" :href=dataHref tabindex="-1" v-text="item[options.label]" :class="{'no-wrap':!options.wrapLabel }"/>
		<span v-else v-text="item[options.label]" :class="{'tv-folder':true, 'no-wrap':!options.wrapLabel}"/>
	</div>
	<ul v-if=isFolder v-show=isExpanded>
		<tree-item v-for="(itm, index) in item[options.subitems]" :options="options"
			:key="index" :item="itm" :click="click" :doubleclick="doubleclick" :get-href="getHref" :is-active="isActive" :expand="expand" :root-items="rootItems">
		</tree-item>
	</ul>
</li>
`,
		props: {
			item: Object,
			options: Object,
			rootItems: Array,
			/* callbacks */
			click: Function,
			expand: Function,
			isActive: Function,
			isGroup: Function,
			getHref: Function,
			doubleclick: Function
		},
		data() {
			return {
				_toggling: false
			};
		},
		methods: {
			isFolderSelect(item) {
				let fs = this.options.folderSelect;
				if (utils.isFunction(fs))
					return fs(item);
				return !!this.options.folderSelect;
			},
			doClick(item) {
				eventBus.$emit('closeAllPopups');
				if (this.isFolder && !this.isFolderSelect(item))
					this.toggle();
				else if ("$select" in item)
					item.$select(this.rootItems);
				else if (this.click)
					this.click(item);
			},
			doDblClick(item) {
				eventBus.$emit('closeAllPopups');
				if (this.isFolder && !this.isFolderSelect(item))
					return;
				if (this.doubleclick)
					this.doubleclick();
			},
			hasLink(item) {
				return !this.isFolder || this.isFolderSelect(item);
			},
			toggle() {
				// toggle with stop!
				eventBus.$emit('closeAllPopups');
				if (!this.isFolder)
					return;
				this._toggling = true;
				this.expandItem(!this.item.$expanded);
				if (this.expand) {
					this.expand(this.item, this.options.subitems);
				}
				this.$nextTick(() => {
					this._toggling = false;
				})
			},
			expandItem(val) {
				platform.set(this.item, '$expanded', val);
			},
			openElem: function () {
				if (!this.isFolder)
					return;
				this.expandItem(true);
			}
		},
		computed: {
			isFolder: function () {
				if (utils.isDefined(this.item.$hasChildren) && this.item.$hasChildren)
					return true;
				if (utils.isDefined(this.options.isFolder))
					return this.item[this.options.isFolder];
				let ch = this.item[this.options.subitems];
				return ch && ch.length;
			},
			isItemVisible: function () {
				let iv = this.options.isVisible;
				if (!iv) return true;
				return this.item[iv];
			},
			isExpanded: function () {
				return this.isFolder && this.item.$expanded;
			},
			isCollapsed: function () {
				return this.isFolder && !this.item.$expanded;
			},
			title() {
				var t = this.item[this.options.title];
				if (!t)
					t = this.item[this.options.label];
				return t;
			},
			isItemSelected: function () {
				if (this.item && "$selected" in this.item)
					return this.item.$selected;
				return this.isActive && this.isActive(this.item);
			},
			isItemGroup() {
				let gp = this.options ? this.options.isGroup : undefined;
				if (gp)
					return utils.eval(this.item, gp);
				else
					return this.isGroup && this.isGroup(this.item);
			},
			iconClass: function () {
				let icons = this.options.staticIcons;
				if (icons)
					return "ico ico-" + (this.isFolder ? icons[0] : icons[1]);
				if (this.options.icon) {
					let icon = this.item[this.options.icon];
					return icon ? "ico ico-" + (icon || 'empty') : '';
				}
				return undefined;
			},
			dataHref() {
				return this.getHref ? this.getHref(this.item) : '';
			},
			cssClass() {
				if (!this.options) return undefined;
				let xname = this.options.xtraClass;
				if (!xname) return undefined;
				return this.item[xname] || undefined;
			}
		},
		watch: {
			isItemSelected(newVal) {
				if (newVal && this.$el.scrollIntoViewCheck)
					this.$el.scrollIntoViewCheck();
			}
		},
		updated(x) {
			// open expanded when reloaded
			if (!this._toggling && this.options.initialExpand)
				this.item.$expanded = true;
			if (this.item.$expanded) {
				if (this.item.$hasChildren) {
					let arr = this.item[this.options.subitems];
					if (!arr.$loaded) {
						this.expandItem(false);
					}
				}
			}
		},
		created() {
			if (this.options.initialExpand)
				platform.set(this.item, '$expanded', true);
		}
	};

	Vue.component('tree-view', {
		components: {
			'tree-item': treeItemComponent
		},
		template: `
<ul class="tree-view">
	<tree-item v-for="(itm, index) in items" :options="options" :get-href="getHref"
		:item="itm" :key="index"
		:click="click" :doubleclick="doubleclick" :is-active="isActive" :is-group="isGroup" :expand="expand" :root-items="items">
	</tree-item>
	<slot name=contextmenu></slot>
</ul>`,
		props: {
			options: Object,
			items: Array,
			isActive: Function,
			isGroup: Function,
			click: Function,
			expand: Function,
			autoSelect: String,
			getHref: Function,
			expandFirstItem: Boolean,
			doubleclick: Function
		},
		computed: {
			isSelectFirstItem() {
				return this.autoSelect === 'first-item';
			}
		},
		watch: {
			items: function () {
				this.doExpandFirst();
			}
		},
		methods: {
			selectFirstItem() {
				if (!this.isSelectFirstItem) return;
				let itms = this.items;
				if (!itms.length) return;
				let fe = null;
				if (this.options && this.options.isVisible) {
					let vi = this.options.isVisible;
					fe = itms.$find(x => x[vi]);
				} else
					fe = itms[0];
				if (!fe) return;
				if (fe.$select)
					fe.$select(this.items);
			},
			doExpandFirst() {
				if (!this.expandFirstItem)
					return;
				this.$nextTick(() => {
					if (!this.$children)
						return;
					this.$children.forEach((val) => {
						if (val && val.openElem) {
							val.openElem();
						}
					});
				});
			}
		},
		created() {
			this.selectFirstItem();
			this.doExpandFirst();
		},
		updated() {
			if (this.isSelectFirstItem && !this.items.$selected) {
				this.selectFirstItem();
			}
		}
	});
})();
