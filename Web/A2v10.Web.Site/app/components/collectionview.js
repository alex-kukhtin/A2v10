// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

// 20171219-7080
// components/collectionview.js

/*
TODO:
11. GroupBy
*/

(function () {


    const log = require('std:log');

	Vue.component('collection-view', {
		store: component('std:store'),
		template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			pageSize: Number,
			initialFilter: Object,
			initialSort: Object,
			runAt: String,
			filterDelegate: Function
		},
		data() {
			let lq = Object.assign({}, {
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
		watch: {
			dir() {
				// можно отслеживать вычисляемые свойства
				//alert('dir changed');
			},
			filter: {
				handler() {
					if (this.isServer)
						this.filterChanged();
				},
				deep:true
			}
		},
		computed: {
			isServer() {
				return this.runAt === 'serverurl' || this.runAt === 'server';
			},
			isQueryUrl() {
				// use window hash
				return this.runAt === 'serverurl';
			},
			dir() {
				if (this.isQueryUrl)
					return this.$store.getters.query.dir;
				return this.localQuery.dir;
			},
			offset() {
				if (this.isQueryUrl)
					return this.$store.getters.query.offset || 0;
				return this.localQuery.offset;
			},
			order() {
				if (this.isQueryUrl)
					return this.$store.getters.query.order;
				return this.localQuery.order;
			},
			pagedSource() {
				if (this.isServer)
                    return this.ItemsSource;
                if (!this.ItemsSource)
                    return null;
				let s = performance.now();
				let arr = [].concat(this.ItemsSource);

				if (this.filterDelegate) {
					arr = arr.filter((item) => this.filterDelegate(item, this.filter));
				}
				// sort
				if (this.order && this.dir) {
					let p = this.order;
					let d = this.dir === 'asc';
					arr.sort((a, b) => {
						if (a[p] === b[p])
							return 0;
						else if (a[p] < b[p])
							return d ? -1 : 1;
						return d ? 1 : -1;
					});
				}
				// HACK!
				this.filteredCount = arr.length;
                // pager
                if (this.pageSize > 0)
				    arr = arr.slice(this.offset, this.offset + this.pageSize);
                arr.$origin = this.ItemsSource;
                if (arr.indexOf(arr.$origin.$selected) == -1) {
                    // not found in target array
                    arr.$origin.$clearSelected();
                }
				log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
                if (this.isServer) {
                    return this.ItemsSource.$RowCount;
                }
				return this.ItemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages() {
				let cnt = this.filteredCount;
				if (this.isServer)
					cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
            $setOffset(offset) {
                if (this.runAt === 'server') {
                    this.localQuery.offset = offset;
                    // for this BaseController only
                    if (!this.localQuery.order) this.localQuery.dir = undefined;
                    this.$root.$emit('localQueryChange', this.$store.makeQueryString(this.localQuery));
                } else if (this.runAt === 'serverurl') {
                    this.$store.commit('setquery', { offset: offset });
                } else {
                    this.localQuery.offset = offset;
                }
            },
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
            doSort(order) {
                let nq = this.makeNewQuery();
				if (nq.order === order)
					nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
                }
                if (!nq.order)
                    nq.dir = null;
                if (this.runAt === 'server') {
                    this.copyQueryToLocal(nq);
					// for this BaseController only
					this.$root.$emit('localQueryChange', this.$store.makeQueryString(nq));
				}
				else if (this.runAt === 'serverurl') {
					this.$store.commit('setquery', nq);
				} else {
					// local
					this.localQuery.dir = nq.dir;
					this.localQuery.order = nq.order;
				}
            },
            makeNewQuery() {
                let nq = { dir: this.dir, order: this.order, offset: this.offset };
                for (let x in this.filter) {
                    let fVal = this.filter[x];
                    if (fVal)
                        nq[x] = fVal;
                    else {
                        nq[x] = undefined;
                    }
                }
                return nq;
            },
            copyQueryToLocal(q) {
                for (let x in q) {
                    let fVal = q[x];
                    if (x === 'offset')
                        this.localQuery[x] = q[x];
                    else
                        this.localQuery[x] = fVal ? fVal : undefined;
                }
            },
			filterChanged() {
                // for server only
                let nq = this.makeNewQuery();
                nq.offset = 0;
                if (!nq.order) nq.dir = undefined;
				if (this.runAt === 'server') {
                    // for this BaseController only
                    this.copyQueryToLocal(nq);
                    // console.dir(this.localQuery);
					this.$root.$emit('localQueryChange', this.$store.makeQueryString(nq));
				}
				else if (this.runAt === 'serverurl') {
					this.$store.commit('setquery', nq);
				}
			}
		},
		created() {
			if (this.initialSort) {
				this.localQuery.order = this.initialSort.order;
				this.localQuery.dir = this.initialSort.dir;
			}
			if (this.isQueryUrl) {
				// get filter values from query
				let q = this.$store.getters.query;
				for (let x in this.filter) {
					if (x in q) this.filter[x] = q[x];
				}
			}
			this.$on('sort', this.doSort);
		}
	});

})();