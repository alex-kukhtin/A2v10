/*20170824-7019*/
/* platform/route.js */
(function () {

    const SEARCH_PREFIX = "search:";
    const MENU_PREFIX = "menu:";
    const ENABLE_SAVE_SEARCH = true;

    function parseQueryString(str) {
        var obj = {};
        str.replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return obj;
    }

    function makeQueryString(obj) {
        if (!obj)
            return '';
        let esc = encodeURIComponent;
        let query = Object.keys(obj)
            .filter(k => obj[k])
            .map(k => esc(k) + '=' + esc(obj[k]))
            .join('&');
        return query ? '?' + query : '';
    }

    function saveSearchToStorage() {
        if (!ENABLE_SAVE_SEARCH)
            return;
        let stg = window.localStorage;
        if (!stg)
            return;
        let loc = window.location;
        let key = SEARCH_PREFIX + loc.pathname;
        loc.search ? stg.setItem(key, loc.search) : stg.removeItem(key);
        //console.info(`store key='${key}', value='${loc.search}'`);
    }

    function getSearchFromStorage(url) {
        if (!ENABLE_SAVE_SEARCH)
            return '';
        let stg = window.localStorage;
        if (!stg)
            return '';
        let key = SEARCH_PREFIX + url;
        let res = stg.getItem(key) || '';
        //console.info(`get key='${key}', value='${res}'`);
        return res;
    }

    function Location() {
        this.path = window.location.pathname;
        this.wl = this.path.split('/');
        this.search = window.location.search.substring(1);
    }

    // static
    Location.current = function () {
        return new Location();
    };

    Location.getSavedMenu = function (segment) {
        let stg = window.localStorage;
        if (!stg)
            return '';
        let key = MENU_PREFIX + segment;
        let res = stg.getItem(key) || '';
        return res;
    };

    Location.prototype.routeLength = function () {
        return this.wl.length;
    };

    Location.prototype.segment = function (no) {
        let wl = this.wl;
        return wl.length > no ? wl[no].toLowerCase() : '';
    };
    Location.prototype.fullPath = function () {
        return this.path + (this.search ? '?' + this.search : '');
    };

    Location.prototype.saveMenuUrl = function () {
        let stg = window.localStorage;
        if (!stg)
            return;
        let s1 = this.segment(1);
        let s2 = this.segment(2);
        let search = this.search;
        if (s1) {
            let keym = MENU_PREFIX + s1;
            s2 ? stg.setItem(keym, s2) : stg.removeItem(keym);
        }
        return this;
    };

    const route = new Vue({
        data: {
            search: {}
        },
        computed: {
            query: {
                get() {
                    let wls = window.location.search.substring(1); // skip '?'
                    let qs = parseQueryString(wls);
                    Vue.set(this, 'search', qs);
                    //console.warn('get route.query:' + wls);
                    return this.search;
                },
                set(value) {
                    Vue.set(this, 'search', value);
                    let newUrl = window.location.pathname;
                    newUrl += makeQueryString(this.search);
                    // replace, do not push!
                    window.history.replaceState(null, null, newUrl);
                    saveSearchToStorage();
                    //console.warn('set route.query:' + makeQueryString(this.search));
                }
            }
        },
        methods: {
            location() {
                return Location.current();
            },

            replaceUrlSearch(url) {
                // replace search part url to current
                let search = window.location.search;
                let parts = url.split('?');
                if (parts.length !== 2)
                    return url;
                return parts[0] + search;
            },

            queryFromUrl(url) {
                if (!url)
                    return {};
                let parts = url.split('?');
                if (parts.length === 2)
                    return parseQueryString(parts[1]);
                return {};
            },

            replaceUrlQuery(url, qry) {
                if (!url)
                    return;
                let parts = url.split('?');
                if (parts.length > 0)
                    return parts[0] + makeQueryString(qry);
                return url;
            },

            savedMenu: Location.getSavedMenu,

            navigateMenu(url, query, title) {
                //console.warn('navigate menu:' + url);
                let srch = getSearchFromStorage(url);
                if (!srch)
                    url += query ? '?' + query : '';
                else
                    url += srch;
                if (query)
                    Vue.set(this, 'search', parseQueryString(query));
                console.info('navigate to:' + url);
                this.setTitle(title);
                window.history.pushState(null, null, url);
                let loc = this.location();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },

            navigateCurrent() {
                let loc = this.location();
                loc.saveMenuUrl();
                this.$emit('route', loc);
            },

            navigate(url, title) {
                let loc = this.location();
                console.info('navigate to:' + url);
                let oldUrl = loc.fullPath();
                // push/pop state feature. Replace the current state and push new one.
                this.setTitle(title);
                window.history.replaceState(oldUrl, null, oldUrl);
                window.history.pushState(oldUrl, null, url);
                loc = this.location(); // get new instance
                this.$emit('route', loc);
            },
            setTitle(title) {
                if (title)
                    document.title = title;
            },
            setState(url, title) {
                this.setTitle(title);
                window.history.replaceState(null, null, url);
            },
            updateSearch() {
                //return;
                let wls = window.location.search.substring(1); // skip '?'
                let qs = parseQueryString(wls);
                //console.warn('update search:' + wls);
                Vue.set(this, 'search', qs);
                saveSearchToStorage();
            },
            close() {
                window.history.back();
            }
        }
    });


    app.modules['route'] = route;
})();
