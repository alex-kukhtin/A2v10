/* 20170816-7014 */
/*components/tab.js*/

/*
TODO:

2. isActive with location hash
3. css
4. icons
5. enable/disable tabs
7. много табов - добавить стрелки ?
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
            <li :class="{active: tab.isActive}" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click.stop.prevent="select(tab)">
                <a href>
                    <i v-if="tab.hasIcon" :class="tab.iconCss" ></i>
                    <span v-text="tab.header"></span>
                </a>
            </li>
        </ul>
        <div class="tab-content">
            <slot />
        </div>
    </template>
    <template v-else>
        <ul class="tab-header">
            <li :class="{active: isActiveTab(item)}" v-for="(item, itemIndex) in items" :key="itemIndex" @click.stop.prevent="select(item)">
                <a href>
                    <span v-text="tabHeader(item, itemIndex)"></span> 
                    <span>{{isActiveTab(item)}}</span>
                </a>
            </li>
        </ul>
        <div class="tab-content">
            <div class="tab-item" v-if="isActiveTab(item)" v-for="(item, itemIndex) in items" :key="itemIndex">
                <slot name="items" :item="item" :index="itemIndex"/>
                <span>{{item}}</span>
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
            iconCss() {
                return this.icon ? ("ico ico-" + this.icon) : '';
            },
            isActive() {
                return this === this.$parent.activeTab;
            },
        },
        created() {
            this.$parent.$addTab(this);
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
            }
        },
        methods: {
            select(item) {
                this.activeTab = item;
            },
            isActiveTab(item) {
                return item == this.activeTab;
            },
            tabHeader(item, index) {
                return item[this.header] + ':' + index;
            },
            $addTab(tab) {
                this.tabs.push(tab);
            }
        },
        mounted() {
            if (this.tabs.length > 0)
                this.activeTab = this.tabs[0]; // no tab, reactive item
            else if (this.items && this.items.length)
                this.activeTab = this.items[0];
        }
    });

})();