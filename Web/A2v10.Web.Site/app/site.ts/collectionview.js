"use strict";
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.
(function () {
    var log = require('std:log', true); // no error
    var utils = require('std:utils');
    var period = require('std:period');
    var DEFAULT_PAGE_SIZE = 20;
    function getModelInfoProp(src, propName) {
        if (!src)
            return undefined;
        var mi = src.$ModelInfo;
        if (!mi)
            return undefined;
        return mi[propName];
    }
    function setModelInfoProp(src, propName, value) {
        if (!src)
            return;
        var mi = src.$ModelInfo;
        if (!mi)
            return;
        mi[propName] = value;
    }
    function makeNewQueryFunc(that) {
        var nq = { dir: that.dir, order: that.order, offset: that.offset };
        for (var x in that.filter) {
            var fVal = that.filter[x];
            if (period.isPeriod(fVal)) {
                nq[x] = fVal.format('DateUrl');
            }
            else if (utils.isDate(fVal)) {
                nq[x] = utils.format(fVal, 'DateUrl');
            }
            else if (utils.isObjectExact(fVal)) {
                if (!('Id' in fVal)) {
                    console.error('The object in the Filter does not have Id property');
                }
                nq[x] = fVal.Id ? fVal.Id : undefined;
            }
            else if (fVal) {
                nq[x] = fVal;
            }
            else {
                nq[x] = undefined;
            }
        }
        return nq;
    }
    function modelInfoToFilter(q, filter) {
        if (!q)
            return;
        for (var x in filter) {
            if (x in q) {
                var iv = filter[x];
                if (period.isPeriod(iv)) {
                    filter[x] = iv.fromUrl(q[x]);
                }
                else if (utils.isDate(iv)) {
                    filter[x] = utils.date.tryParse(q[x]);
                }
                else if (utils.isObjectExact(iv))
                    iv.Id = q[x];
                else {
                    filter[x] = q[x];
                }
            }
        }
    }
    // client collection
    Vue.component('collection-view', {
        template: "\n<div>\n\t<slot :ItemsSource=\"pagedSource\" :Pager=\"thisPager\" :Filter=\"filter\">\n\t</slot>\n</div>\n",
        props: {
            ItemsSource: Array,
            initialPageSize: Number,
            initialFilter: Object,
            initialSort: Object,
            runAt: String,
            filterDelegate: Function
        },
        data: function () {
            var lq = Object.assign({}, {
                offset: 0,
                dir: 'asc',
                order: ''
            }, this.initialFilter);
            return {
                filter: this.initialFilter,
                filteredCount: 0,
                localQuery: lq
            };
        },
        computed: {
            pageSize: function () {
                if (this.initialPageSize > 0)
                    return this.initialPageSize;
                return -1; // invisible pager
            },
            dir: function () {
                return this.localQuery.dir;
            },
            offset: function () {
                return this.localQuery.offset;
            },
            order: function () {
                return this.localQuery.order;
            },
            pagedSource: function () {
                var _this = this;
                var s = performance.now();
                var arr = [].concat(this.ItemsSource);
                if (this.filterDelegate) {
                    arr = arr.filter(function (item) { return _this.filterDelegate(item, _this.filter); });
                }
                // sort
                if (this.order && this.dir) {
                    var p_1 = this.order;
                    var d_1 = this.dir === 'asc';
                    arr.sort(function (a, b) {
                        if (a[p_1] === b[p_1])
                            return 0;
                        else if (a[p_1] < b[p_1])
                            return d_1 ? -1 : 1;
                        return d_1 ? 1 : -1;
                    });
                }
                // HACK!
                this.filteredCount = arr.length;
                // pager
                if (this.pageSize > 0)
                    arr = arr.slice(this.offset, this.offset + this.pageSize);
                arr.$origin = this.ItemsSource;
                if (arr.indexOf(arr.$origin.$selected) === -1) {
                    // not found in target array
                    arr.$origin.$clearSelected();
                }
                if (log)
                    log.time('get paged source:', s);
                return arr;
            },
            sourceCount: function () {
                return this.ItemsSource.length;
            },
            thisPager: function () {
                return this;
            },
            pages: function () {
                var cnt = this.filteredCount;
                return Math.ceil(cnt / this.pageSize);
            }
        },
        methods: {
            $setOffset: function (offset) {
                this.localQuery.offset = offset;
            },
            sortDir: function (order) {
                return order === this.order ? this.dir : undefined;
            },
            doSort: function (order) {
                var nq = this.makeNewQuery();
                if (nq.order === order)
                    nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
                else {
                    nq.order = order;
                    nq.dir = 'asc';
                }
                if (!nq.order)
                    nq.dir = null;
                // local
                this.localQuery.dir = nq.dir;
                this.localQuery.order = nq.order;
            },
            makeNewQuery: function () {
                return makeNewQueryFunc(this);
            },
            copyQueryToLocal: function (q) {
                for (var x in q) {
                    var fVal = q[x];
                    if (x === 'offset')
                        this.localQuery[x] = q[x];
                    else
                        this.localQuery[x] = fVal ? fVal : undefined;
                }
            }
        },
        created: function () {
            if (this.initialSort) {
                this.localQuery.order = this.initialSort.order;
                this.localQuery.dir = this.initialSort.dir;
            }
            this.$on('sort', this.doSort);
        }
    });
    // server collection view
    Vue.component('collection-view-server', {
        template: "\n<div>\n\t<slot :ItemsSource=\"ItemsSource\" :Pager=\"thisPager\" :Filter=\"filter\">\n\t</slot>\n</div>\n",
        props: {
            ItemsSource: Array,
            initialFilter: Object
        },
        data: function () {
            return {
                filter: this.initialFilter,
                lockChange: true
            };
        },
        watch: {
            jsonFilter: {
                handler: function (newData, oldData) {
                    this.filterChanged();
                }
            }
        },
        computed: {
            jsonFilter: function () {
                return utils.toJson(this.filter);
            },
            thisPager: function () {
                return this;
            },
            pageSize: function () {
                return getModelInfoProp(this.ItemsSource, 'PageSize');
            },
            dir: function () {
                return getModelInfoProp(this.ItemsSource, 'SortDir');
            },
            order: function () {
                return getModelInfoProp(this.ItemsSource, 'SortOrder');
            },
            offset: function () {
                return getModelInfoProp(this.ItemsSource, 'Offset');
            },
            pages: function () {
                var cnt = this.sourceCount;
                return Math.ceil(cnt / this.pageSize);
            },
            sourceCount: function () {
                if (!this.ItemsSource)
                    return 0;
                return this.ItemsSource.$RowCount || 0;
            }
        },
        methods: {
            $setOffset: function (offset) {
                if (this.offset === offset)
                    return;
                setModelInfoProp(this.ItemsSource, 'Offset', offset);
                this.reload();
            },
            sortDir: function (order) {
                return order === this.order ? this.dir : undefined;
            },
            doSort: function (order) {
                if (order === this.order) {
                    var dir = this.dir === 'asc' ? 'desc' : 'asc';
                    setModelInfoProp(this.ItemsSource, 'SortDir', dir);
                }
                else {
                    setModelInfoProp(this.ItemsSource, 'SortOrder', order);
                    setModelInfoProp(this.ItemsSource, 'SortDir', 'asc');
                }
                this.reload();
            },
            filterChanged: function () {
                if (this.lockChange)
                    return;
                var mi = this.ItemsSource.$ModelInfo;
                if (!mi) {
                    mi = { Filter: this.filter };
                    this.ItemsSource.$ModelInfo = mi;
                }
                else {
                    this.ItemsSource.$ModelInfo.Filter = this.filter;
                }
                if ('Offset' in mi)
                    setModelInfoProp(this.ItemsSource, 'Offset', 0);
                this.reload();
            },
            reload: function () {
                this.$root.$emit('cwChange', this.ItemsSource);
            },
            updateFilter: function () {
                var _this = this;
                var mi = this.ItemsSource.$ModelInfo;
                if (!mi)
                    return;
                var fi = mi.Filter;
                if (!fi)
                    return;
                this.lockChange = true;
                for (var prop in this.filter) {
                    if (prop in fi)
                        this.filter[prop] = fi[prop];
                }
                this.$nextTick(function () {
                    _this.lockChange = false;
                });
            }
        },
        created: function () {
            var _this = this;
            // get filter values from modelInfo
            var mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
            if (mi) {
                modelInfoToFilter(mi.Filter, this.filter);
            }
            this.$nextTick(function () {
                _this.lockChange = false;
            });
            // from datagrid, etc
            this.$on('sort', this.doSort);
        },
        updated: function () {
            this.updateFilter();
        }
    });
})();
//# sourceMappingURL=collectionview.js.map