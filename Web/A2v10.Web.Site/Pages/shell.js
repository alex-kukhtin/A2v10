/*20170818-7015*/
/*shell.js*/

/*
TODO:
3. SideBar - разные режимы
4. Collapse/expand
5. 
*/

(function () {

    const route = require('route');
    const store = require('store');

    let menu = [
        { title: "Home", url: "home" },
        {
            title: 'Справочники', url: 'catalog', menu: [
                { title: "Suppliers", url: 'suppliers', icon:'file-symlink', query:'order=Name&dir=desc'},
                { title: "Customers", url: 'customers', icon:'copy'},
                { title: "Edit 3 segment", url: 'edit/5', icon:'menu' },
                {
                    title: "Menu Folder", icon: 'folder', menu: [
                        { title: "Suppliers 2 (with long text <b>bold</b> escaped <script></script>)", url: 'suppliers1', icon: 'save' },
                        { title: "Customers 2", url: 'customers2', icon:'dot'}
                    ]
                }
            ]
        },
        {
            title: 'Документы', url: 'document', menu: [
                { title: "Incoming", url: 'incoming', icon: 'file', query:'order=Date&dir=asc' },
                { title: "Outgoing", url: 'outgoing', icon: 'edit'},
                { title: "edit 4 segment", url: 'outgoing/edit/2', icon: 'comment' }
            ]
        }
    ];

    function findMenu(menu, func) {
        if (!menu)
            return null;
        for (let i = 0; i < menu.length; i++) {
            let itm = menu[i];
            if (func(itm))
                return itm;
            if (itm.menu) {
                let found = findMenu(itm.menu, func);
                if (found)
                    return found;
            }
        }
        return null;
    }

    const navBar = {
        props: {
            menu: Array
        },
        template: '<ul class="nav-bar"><li v-for="item in menu" :key="item.url" :class="{active : isActive(item)}"><a href="\" v-text="item.title" @click.stop.prevent="navigate(item)"></a></li></ul>',

        data: function () {
            return {
                activeItem: null
            };
        },

        created: function () {
            var me = this;

            function findCurrent() {
                let loc = route.location();
                let seg1 = loc.segment(1);
                me.activeItem = me.menu.find(itm => itm.url === seg1);
                return loc;
            }

            window.addEventListener('popstate', function (event, a, b) {
                findCurrent();
                route.navigateCurrent();
            });

            findCurrent();

            if (!me.activeItem) {
                me.activeItem = me.menu[0];
                // TODO: to route
                window.history.replaceState(null, null, me.activeItem.url);
            }
        },

        methods: {
            isActive: function (item) {
                return item === this.activeItem;
            },
            navigate: function (item) {
                // nav bar
                this.activeItem = item;
                let url = '/' + item.url;
                let query = null;
                let savedUrl = route.savedMenu(item.url);
                let activeItem = null;
                if (savedUrl) {
                    // find active side menu item
                    activeItem = findMenu(item.menu, (itm) => itm.url === savedUrl);
                } else {
                    activeItem = findMenu(item.menu, (itm) => itm.url && !!item.menu);
                }
                if (activeItem) {
                    url = url + '/' + activeItem.url;
                    query = activeItem.query;
                }
                route.navigateMenu(url, query);
            }
        }
    };

    const sideBar = {
        // TODO: разные варианты меню
        template: `
<div class="side-bar">
    <a href role="button" class="fa fa-fw collapse-handle" @click.stop.prevent="toggle"></a>
    <ul class="tree-view">
        <tree-item v-for="(itm, index) in sideMenu" 
            :item="itm" :key="index" label="title" icon="icon" title="title"
            :subitems="'menu'" :click="navigate" :is-active="isActive" :has-icon="true" :wrap-label="true">
        </tree-item>
    </ul>
</div>
`,
        props: {
            menu: Array
        },
        data: function () {
            return {
                sideMenu: null,
                topUrl: null,
                activeItem: null
            };
        },
        methods: {
            isActive: function (itm) {
                return itm === this.activeItem;
            },
            navigate: function (itm) {
                if (!itm.url)
                    return; // no url. is folder?
                let newUrl = `/${this.topUrl}/${itm.url}`;
                route.navigateMenu(newUrl, itm.query);
            },
            toggle() {
                // TODO: collapse/expand
                alert('yet not implemented');
            }
        },
        created: function () {
            var me = this;
            route.$on('route', function (loc) {
                let s1 = loc.segment(1);
                let s2 = loc.segment(2);
                let m1 = me.menu.find(itm => itm.url === s1);
                if (!m1) {
                    me.topUrl = null;
                    me.sideMenu = null;
                } else {
                    me.topUrl = m1.url;
                    me.sideMenu = m1.menu || null;
                    if (me.sideMenu)
                        me.activeItem = findMenu(me.sideMenu, (itm) => itm.url === s2);
                }
            });
        }
    };

    const contentView = {
        render(h) {
            return h('div', {
                attrs: {
                    class: 'content-view ' + this.cssClass
                }
            }, [h('include', {
                props: {
                src: this.currentView
            }})]);
        },
        data() {
            return {
                currentView: null,
                cssClass: ''
            };
        },
        created() {
            var me = this;
            route.$on('route', function (loc) {
                let len = loc.routeLength();
                //TODO: // find menu and get location from it ???
                let tail = '';
                switch (len) {
                    case 2: tail = '/index/0'; break;
                    case 3: tail = '/index/0'; break;
                }
                let url = "/_page" + window.location.pathname + tail;
                url += window.location.search;
                me.currentView = url;
                me.cssClass =
                    len === 2 ? 'full-page' :
                    len === 3 ? 'partial-page' :
                    'full-view';
            });
        }
    };

    const modalComponent = component('modal');

    // important: use v-show instead v-if to ensure components created only once
    const a2MainView = {
        template: `
<div class="main-view">
    <a2-nav-bar :menu="menu" v-show="navBarVisible"></a2-nav-bar>
    <a2-side-bar :menu="menu" v-show="sideBarVisible"></a2-side-bar>
    <a2-content-view></a2-content-view>
    <div class="load-indicator" v-show="pendingRequest"></div>
    <div class="modal-stack" v-if="hasModals" @keyup.esc='closeModal'>
        <div class="modal-wrapper" v-for="dlg in modals">
            <a2-modal :dialog="dlg"></a2-modal>
        </div>
    </div>
</div>`,
        components: {
            'a2-nav-bar': navBar,
            'a2-side-bar': sideBar,
            'a2-content-view': contentView,
            'a2-modal': modalComponent
        },
        props: {
            menu: Array
        },
        data() {
            return {
                navBarVisible: false,
                sideBarVisible: true,
                requestsCount: 0,
                modals: []
            };
        },
        computed: {
            hasModals: function () {
                return this.modals.length > 0;
            },
            pendingRequest: function () {
                return this.requestsCount > 0;
            }
        },        
        mounted() {
            // first time created
            route.navigateCurrent();
        },
        methods: {
            closeModal() {
                route.$emit('modalClose');
            }
        },
        created() {
            let me = this;
            route.$on('route', function (loc) {
                let len = loc.routeLength();
                let seg1 = loc.segment(1);
                me.navBarVisible = len === 2 || len === 3;
                me.sideBarVisible = len === 3;
                // close all modals
                me.modals.splice(0, me.modals.length);
            });
            store.$on('beginRequest', function () {
                me.requestsCount += 1;
            });
            store.$on('endRequest', function () {
                me.requestsCount -= 1;
            });
            store.$on('modal', function (modal, prms) {
                // TODO: Path.combine
                let id = '0';
                if (prms && prms.data && prms.data.Id) {
                    id = prms.data.Id;
                    // TODO: get correct ID
                }
                let url = '/_dialog/' + modal + '/' + id;
                let dlg = { title: "dialog", url: url, prms: prms.data };
                dlg.promise = new Promise(function (resolve, reject) {
                    dlg.resolve = resolve;
                });
                me.modals.push(dlg);
            });
            store.$on('modalClose', function (result) {
                let dlg = me.modals.pop();
                if (result)
                    dlg.resolve(result);
            });
        }
    };



    // main VIEW SHELL

    new Vue({
        el: '#shell',
        components: {
            'a2-main-view': a2MainView
        },
        data: {
            title: 'application title',
            menu: menu
        },
        methods: {
            about() {
                route.navigateMenu('/system/app/about');
            }
        }
    });
})();