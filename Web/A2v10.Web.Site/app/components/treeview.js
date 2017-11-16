// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171116-7069
// components/treeview.js

(function () {

    const utils = require('std:utils');

    /*TODO:
        4. select first item
    */
    const treeItemComponent = {
        name: 'tree-item',
        template: `
<li @click.stop.prevent="doClick(item)" :title="title"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
    <div :class="{overlay:true, 'no-icons': !options.hasIcon}">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-else class="toggle"/>
        <i v-if="options.hasIcon" :class="iconClass"/>
        <a v-if="hasLink(item)" :href="dataHref" v-text="item[options.label]" :class="{'no-wrap':!options.wrapLabel }"/>
        <span v-else v-text="item[options.label]" :class="{'tv-folder':true, 'no-wrap':!options.wrapLabel}"/>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[options.subitems]" :options="options"
            :key="index" :item="itm" :click="click" :get-href="getHref" :is-active="isActive" :expand="expand" :root-items="rootItems"/>
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
            getHref: Function
        },
        data() {
            return {
                open: !this.options.isDynamic
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
                if (this.isFolder && !this.isFolderSelect(item))
                    this.toggle();
                else {
                    if (this.options.isDynamic) {
                        item.$select(this.rootItems);
                    } else {
                        this.click(item);
                    }
                }
            },
            hasLink(item) {
                return !this.isFolder || this.isFolderSelect(item);
            },
            toggle() {
                if (!this.isFolder)
                    return;
                if (this.options.isDynamic) {
                    this.open = !this.open;
                    this.expand(this.item, this.options.subitems);
                } else {
                    this.open = !this.open;
                }
            }
        },
        computed: {
            isFolder: function () {
                if (this.options.isDynamic && this.item.$hasChildren)
                    return true;
                let ch = this.item[this.options.subitems];
                return ch && ch.length;
            },
            isExpanded: function () {
                return this.isFolder && this.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.open;
			},
			title() {
				var t = this.item[this.options.title];
				if (!t)
					t = this.item[this.options.label];
				return t;
			},
            isItemSelected: function () {
                if (this.options.isDynamic)
                    return this.item.$isSelected(this.rootItems);
                if (!this.isActive)
                    return false;
                return this.isActive && this.isActive(this.item);
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
            }
        },
        updated(x) {
            // close expanded when reloaded
            if (this.options.isDynamic && this.open) {
                if (this.item.$hasChildren) {
                    let arr = this.item[this.options.subitems];
                    if (!arr.$loaded)
                        this.open = false;
                }
            }
        }
    };

    /*
    options: {
        // property names
        title: String,
        icon: String,
        label: String,
        subitems: String,
        // options
        staticIcons: [String, String], //[Folder, Item]
        folderSelect: Boolean || Function,
        wrapLabel: Boolean,
        hasIcon: Boolean,
        isDynamic: Boolean        
    }
    */

    Vue.component('tree-view', {
        components: {
            'tree-item': treeItemComponent
        },
        template: `
<ul class="tree-view">
    <tree-item v-for="(itm, index) in items" :options="options" :get-href="getHref"
        :item="itm" :key="index"
        :click="click" :is-active="isActive" :expand="expand" :root-items="items">
    </tree-item>
</ul>
        `,
        props: {
            options: Object,
            items: Array,
            isActive: Function,
            click: Function,
            expand: Function,
			autoSelect: String,
			getHref: Function
        },
        computed: {
            isSelectFirstItem() {
                return this.autoSelect === 'first-item';
            }
        },
        methods: {
            selectFirstItem() {
                if (!this.isSelectFirstItem)
                    return;
                let itms = this.items;
                if (!itms.length)
                    return;
                let fe = itms[0];
                if (fe.$select)
                    fe.$select(this.items);
            }
        },
        created() {
            this.selectFirstItem();
        },
        updated() {
            if (this.options.isDynamic && this.isSelectFirstItem && !this.items.$selected) {
                // after reload
                this.selectFirstItem();
            }
        }
    });
})();
