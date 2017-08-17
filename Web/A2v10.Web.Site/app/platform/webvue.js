/*20170813-7001*/
/* platform/webvue.js */
(function () {

    function set(target, prop, value) {
        Vue.set(target, prop, value);
    }

    function Location() {
        this.wl = window.location.pathname.split('/');
        this.search = window.location.search.substring(1);
    }

    Location.current = function () {
        return new Location();
    };

    Location.prototype.routeLength = function () {
        return this.wl.length;
    };

    Location.prototype.segment = function (no) {
        let wl = this.wl;
        return wl.length > no ? wl[no].toLowerCase() : '';
    };

    Location.prototype.saveMenuUrl = function () {
        let storage = window.localStorage;
        if (!storage)
            return;
        let s1 = this.segment(1);
        let s2 = this.segment(2);
        let search = this.search;
        if (s1) {
            let keym = 'menu:' + s1;
            let keys = 'menusearch:' + s1;
            s2 ? storage.setItem(keym, s2) : storage.removeItem(keym);
            search ? storage.setItem(keys, search) : storage.removeItem(keys);
        }
        return this;
    };

    function parseQueryString(str) {
        var obj = {};
        str.replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    }

    var store = new Vue({
        data: {
            sort: 'Name',
            dir: 'asc'
        },
        computed: {
            query: {
                get() {
                    // todo: get from window.query
                    let query = window.location.search.substring(1); // skip '?'
                    let qs = parseQueryString(query);
                    this.sort = qs.sort;
                    this.dir = qs.dir;
                    //return qs;
                    //console.dir(qs);
                    return {
                        sort: this.sort,
                        dir: this.dir
                    };
                },
                set(value) {
                    // set window.query
                    this.sort = value.sort;
                    this.dir = value.dir;
                    let newUrl = window.location.pathname;
                    newUrl += `?sort=${this.sort}&dir=${this.dir}`;
                    window.history.pushState(null, null, newUrl);
                    Location.current().saveMenuUrl();
                }
            }
        },
        methods: {
            location() {
                return Location.current();
            },
            navigate(url) {
                window.history.pushState(null, null, url);
                let loc = Location.current();
                this.$emit('route', loc);
            },
            navigateMenu(url) {
                window.history.pushState(null, null, url);
                let loc = Location.current();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },
            navigateCurrent() {
                let loc = Location.current();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            }
        }
    });

    app.modules['platform'] = {
        set: set
    };

    app.modules['store'] = store;
})();
