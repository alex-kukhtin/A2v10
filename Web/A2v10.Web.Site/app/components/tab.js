/* 20170816-7014 */
/*components/tab.js*/

/*
TODO:

1. dynamic tabs
2. isActive with location hash
3. css
4. icons

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
    <ul>
        <li :class="{active: tab.isActive}" v-for="(tab, tabIndex) in tabs" :key="tabIndex">
            <a @click.stop.prevent="select(tab)">
                <i v-if="tab.hasIcon"></i><span v-text="tab.header"></span>
                <span>{{tab.isActive}}</span>
            </a>
        </li>
    </ul>
    <div class="tab-content">
        <slot />
    </div>
</div>
`;

    const tabItemTemplate = `
<div class="tab-item" v-if="isActive">
    i am the tab-item + {{isActive}}
    <slot />
</div>
`;


    Vue.component('a2-tab-item', {
        name:'a2-tab-item',
        template: tabItemTemplate,
        props: {
            header: String,
            icon: String
        },
        computed: {
            hasIcon() {
                return !!this.icon;
            },
            isActive() {
                return this === this.$parent.activeTab;
            }
        },
        created() {
            this.$parent.$addTab(this);
        }
    });


    Vue.component('a2-tab-panel', {
        template: tabPanelTemplate,
        data() {
            return {
                tabs: [],
                activeTab: null
            };
        },
        methods: {
            select(item) {
                this.activeTab = item;
            },
            $addTab(tab) {
                this.tabs.push(tab);
            }
        },
        mounted() {
            //alert('tabs count =' + this.tabs.length);
            if (this.tabs.length > 0)
                this.activeTab = this.tabs[0]; // no tab, reactive item
        }
    });

})();