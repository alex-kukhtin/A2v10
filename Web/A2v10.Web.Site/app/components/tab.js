/* 20170816-7014 */
/*components/tab.js*/

/*
TODO:

2. isActive with location hash
3. css
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
            <li :class="{active: isActiveTab(item)}" v-for="(item, tabIndex) in items" :key="tabIndex" @click.stop.prevent="select(item)">
				<slot name="header" :item="item" :index="tabIndex">
					<a href>
						TODO: default tab header
						<span v-text="tabHeader(item, tabIndex)"></span> 
						<span>{{isActiveTab(item)}}</span>
					</a>
				</slot>
            </li>
        </ul>
        <div class="tab-content">
            <div class="tab-item" v-if="isActiveTab(item)" v-for="(item, tabIndex) in items" :key="tabIndex">
                <slot name="items" :item="item" :index="tabIndex" />
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
			}
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
		watch: {
			'items.length'(newVal, oldVal) {
				let tabs = this.items;
				if (newVal < oldVal) {
					// tab has been removed
					if (this._index >= tabs.length)
						this._index = tabs.length - 1;
					this.select(tabs[this._index]);
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
			this._index = 0;
        }
    });

})();