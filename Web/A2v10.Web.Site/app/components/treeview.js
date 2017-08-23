/* 20170816-7014 */
/*components/treeview.js*/

(function () {

    /*TODO:
        3. folder/item
    */
    Vue.component('tree-item', {
        template: `
<li @click.stop.prevent="doClick(item)" :title="item[title]"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
    <div class="overlay">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-else class="toggle"></span>
        <i v-if="hasIcon" :class="iconClass"></i>
        <a v-if="hasLink" :href="dataHref" v-text="item[label]" :class="{'no-wrap':!wrapLabel }"></a>
        <span v-else v-text="item[label]" :class="{'tv-folder':true, 'no-wrap':!wrapLabel}"></span>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[subitems]" 
            :key="index" :item="itm" :click="click" :get-href="getHref" :is-active="isActive" :has-icon="hasIcon" :folder-select="folderSelect"
            :label="label" :wrap-label="wrapLabel" :icon="icon" :subitems="subitems" :title="title"></tree-item>
    </ul>   
</li>
`,
        props: {
            item: Object,
            /* attrs */
            hasIcon: Boolean,
            wrapLabel: Boolean,
            folderSelect: Boolean,
            /* prop names */
            label: String,
            icon: String,
            title: String,
            subitems: String,
            /* callbacks */
            click: Function,
            isActive: Function,
            getHref: Function
        },
        data() {
            return {
                open: true
            };
        },
        methods: {
            doClick(item) {
                if (this.isFolder && !this.folderSelect)
                    this.toggle();
                else
                    this.click(item);
            },
            toggle() {
                if (!this.isFolder)
                    return;
                this.open = !this.open;
            }
        },
        computed: {
            isFolder: function () {
                let ch = this.item[this.subitems];
                return ch && ch.length;
            },
            hasLink() {
                return !this.isFolder || this.folderSelect;
            },
            isExpanded: function () {
                return this.isFolder && this.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.open;
            },
            isItemSelected: function () {
                return this.isActive(this.item);
            },
            iconClass: function () {
                return this.icon ? "ico ico-" + (this.item[this.icon] || 'empty') : '';
            },
            dataHref() {
                return this.getHref ? this.getHref(this.item) : '';
            }
        }
    });

})();
