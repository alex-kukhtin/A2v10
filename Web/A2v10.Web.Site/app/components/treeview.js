/*20170814-7012*/
/*components/treeview.js*/
(function () {

    Vue.component('tree-item', {
        template: `
<li @click.stop.prevent="click(item)" :class="{expanded: isExpanded, collapsed:isCollapsed}" >
    <div class="overlay">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-if="!isFolder" class="toggle"></span>
        <i class="fa fa-fw fa-folder-o"></i>
        <a href v-text="item[name]"></a>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item[subitems]" 
            :key="index" :item="itm" :click="click"
            :name="name" :subitems="subitems"></tree-item>
    </ul>   
</li>
`,
        props: {
            item: Object,
            /* prop names */
            name: String,
            icon: String,
            title: String,
            subitems: String,
            /* functions */
            click: Function
        },
        data() {
            return {
                open: true
            };
        },
        methods: {
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
            isExpanded: function () {
                return this.isFolder && this.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.open;
            }
        }
    });

})();
