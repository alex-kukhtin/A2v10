/*20170824-7019*/
/* controllers/shell.js */

(function () {

    /* TODO: 
    1. find first active item
    */
    const route = require('route');
    const store = require('store');
    const modal = component('modal');


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

    function activateMenu(activeItem, loc) {
        let seg2 = loc.segment(2);
        if (!seg2) {
            let url = activeItem.url;
            let fa = findMenu(activeItem.menu, (mi) => mi.url && !mi.menu);
            if (fa) {
                url = '/' + url + '/' + fa.url;
                route.setState(url, fa.title);
            }
        }
    }

    const navBar = {

        props: {
            menu: Array
        },

        template: `
<ul class="nav-bar">
    <li v-for="item in menu" :key="item.url" :class="{active : isActive(item)}">
        <a :href="itemHref(item)" v-text="item.title" @click.stop.prevent="navigate(item)"></a>
    </li>
</ul>
`,

        data: function () {
            return {
                activeItem: null,
                isAppMode: false
            };
        },

        created: function () {
            var me = this;
            me.__dataStack__ = [];

            function findCurrent() {
                let loc = route.location();
                let seg1 = loc.segment(1);
                let seg2 = loc.segment(2);
                let len = loc.routeLength();
                if (seg1 === 'app') {
                    me.isAppMode = true;
                    return null;
                }
                let ai = me.menu.find(itm => itm.url === seg1);
                me.activeItem = ai;
                return loc;
            }

            window.addEventListener('popstate', function (event, a, b) {
                if (me.__dataStack__.length > 0) {
                    let comp = me.__dataStack__[0];
                    let oldUrl = event.state;
                    //console.warn('pop state: ' + oldUrl);
                    if (!comp.$saveModified()) {
                        // disable navigate
                        oldUrl = comp.__baseUrl__.replace('/_page', '');
                        //console.warn('return url: ' + oldUrl);
                        window.history.pushState(oldUrl, null, oldUrl);
                        return;
                    }
                }
                route.updateSearch();
                findCurrent();
                route.navigateCurrent();
            });

            let loc = findCurrent();

            if (me.activeItem && me.activeItem.menu)
            {
                activateMenu(me.activeItem, loc);
            }

            if (!me.activeItem && !this.isAppMode) {
                me.activeItem = me.menu[0];
                activateMenu(me.activeItem, loc);
            }


            store.$on('registerData', function (component) {
                if (component)
                    me.__dataStack__.push(component);
                else
                    me.__dataStack__.pop(component);
            });

            this.$root.$on('navigateTop', function (top) {
                me.navigate(top);
            });
        },

        methods: {
            isActive: function (item) {
                return item === this.activeItem;
            },
            itemHref(item) {
                // for 'open in new window' command
                let url = '/' + item.url;
                let activeItem = findMenu(item.menu, (itm) => itm.url && !!item.menu);
                if (activeItem)
                    url = url + '/' + activeItem.url;
                return url;
            },
            navigate: function (item) {
                // nav bar
                this.activeItem = item;
                let url = '/' + item.url;
                let query = null;
                let title = null;
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
                    title = activeItem.title;
                }
                route.navigateMenu(url, query, title);
            }
        }
    };

    const sideBar = {
        // TODO: разные варианты меню
        template: `
<div :class="cssClass">
    <a href role="button" class="ico collapse-handle" @click.stop.prevent="toggle"></a>
    <div class="side-bar-body" v-if="bodyIsVisible">
        <ul class="tree-view">
            <tree-item v-for="(itm, index) in sideMenu" :folder-select="!!itm.url"
                :item="itm" :key="index" label="title" icon="icon" title="title"
                :subitems="'menu'" :click="navigate" :get-href="itemHref" :is-active="isActive" :has-icon="true" :wrap-label="true">
            </tree-item>
        </ul>
    </div>
    <div v-else class="side-bar-title" @click.stop.prevent="toggle">
        <span class="side-bar-label" v-text="title"></span>
    </div>
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
        computed: {
            cssClass: function () {
                return 'side-bar ' + (this.$parent.sideBarCollapsed ? 'collapsed' : 'expanded');
            },
            bodyIsVisible() {
                return !this.$parent.sideBarCollapsed;
            },
            title() {
                return this.activeItem ? this.activeItem.title : 'Меню';
            }
        },
        methods: {
            isActive: function (itm) {
                return itm === this.activeItem;
            },
            itemUrl(itm)
            {
                return `/${this.topUrl}/${itm.url}`;
            },
            itemHref(itm) {
                // for 'open in new window' command
                let url = this.itemUrl(itm);
                if (itm.query)
                    url += '?' + itm.query;
                return url;
            },
            navigate: function (itm) {
                if (!itm.url)
                    return; // no url. is folder?
                let newUrl = this.itemUrl(itm);
                route.navigateMenu(newUrl, itm.query, itm.title);
            },
            toggle() {
                this.$parent.sideBarCollapsed = !this.$parent.sideBarCollapsed;
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
                if (me.activeItem)
                    route.setTitle(me.activeItem.title);
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
                    src: this.currentView,
                    needReload: this.needReload
                }
            })]);
        },
        data() {
            return {
                currentView: null,
                needReload: false,
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
                let search = window.location.search;
                url += search;
                me.currentView = url;
                me.cssClass =
                    len === 2 ? 'full-page' :
                    len === 3 ? 'partial-page' :
                                'full-view';
            });

            store.$on('requery', function () {
                // just trigger
                me.needReload = true;
                Vue.nextTick(() => me.needReload = false);
            });
        }
    };

    // important: use v-show instead v-if to ensure components created only once
    const a2MainView = {
        template: `
<div :class="cssClass">
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
            'a2-modal': modal
        },
        props: {
            menu: Array
        },
        data() {
            return {
                navBarVisible: false,
                sideBarVisible: true,
                sideBarCollapsed: false,
                requestsCount: 0,
                modals: []
            };
        },
        computed: {
            cssClass: function () {
                return 'main-view ' + (this.sideBarCollapsed ? 'side-bar-collapsed' : 'side-bar-expanded');
            },
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
                if (seg1 === 'app') {
                    me.navBarVisible = false;
                    me.sideBarVisible = false;
                }
                else {
                    me.navBarVisible = len === 2 || len === 3;
                    me.sideBarVisible = len === 3;
                }
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
                url = route.replaceUrlQuery(url, prms.query);
                let dlg = { title: "dialog", url: url, prms: prms.data };
                dlg.promise = new Promise(function (resolve, reject) {
                    dlg.resolve = resolve;
                });
                prms.promise = dlg.promise;
                me.modals.push(dlg);
            });
            store.$on('modalClose', function (result) {
                let dlg = me.modals.pop();
                if (result)
                    dlg.resolve(result);
            });
            store.$on('confirm', function (prms) {
                let dlg = prms.data;
                dlg.promise = new Promise(function (resolve) {
                    dlg.resolve = resolve;
                });
                prms.promise = dlg.promise;
                me.modals.push(dlg);
            });
        }
    };




    const shell = Vue.extend({
        components: {
            'a2-main-view': a2MainView
        },
        methods: {
            about() {
                // TODO: localization
                route.navigateMenu('/app/about', null, "О программе");
            },
            root() {
                // first menu element
                this.$emit('navigateTop', this.menu[0]);
            }
        }
    });

    app.components['std:shellController'] = shell;

})();