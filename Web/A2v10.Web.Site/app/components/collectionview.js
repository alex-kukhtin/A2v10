/*20170902-7023*/
/*components/collectionview.js*/

/*
TODO:
7. доделать фильтры
*/


Vue.component('collection-view', {
	store: component('std:store'),
	template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" 
		:filter="filter">
	</slot>
	<code>
		collection-view: source-count={{sourceCount}}, page-size={{pageSize}}
		offset:{{Offset}}, pages={{pages}}, dir={{dir}}, order={{order}}, filter={{filter}}
	</code>
</div>
`,
	props: {
		ItemsSource: Array,
		pageSize: Number,
		initialFilter: Object,
		runAt: String
	},
	data() {
		// TODO: Initial sorting, filters
		return {
			filter: this.initialFilter,
			filteredCount: 0,
			localQuery: {
				offset: 0,
				dir: 'asc',
				order: ''
			}
		};
	},
	watch: {
		dir() {
			// можно отслеживать вычисляемые свойства
			//alert('dir changed');
		}
	},
	computed: {
		isServer() {
			return this.runAt !== 'client';
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
		Offset() {
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
			console.warn('get paged source');
			let arr = [].concat(this.ItemsSource);
			// filter (TODO: // правильная фильтрация)
			if (this.filter && this.filter.Text)
				arr = arr.filter((v) => v.Id.toString().indexOf(this.filter.Text) !== -1);
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
			return arr.slice(this.Offset, this.Offset + this.pageSize);
		},
		sourceCount() {
			if (this.isServer)
				return this.ItemsSource.$RowCount;
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
				this.$root.$emit('localQueryChange', this.$store.makeQueryString(this.localQuery));
			} else if (this.runAt === 'serverurl')
				this.$store.commit('setquery', { offset: offset});
			else
				this.localQuery.offset = offset;

		},
		first() {
			this.$setOffset(0);
		},
		prev() {
			let no = this.Offset;
			if (no > 0)
				no -= this.pageSize;
			this.$setOffset(no);
		},
		next() {
			let no = this.Offset + this.pageSize;
			this.$setOffset(no);
		},
		sortDir(order) {
			return order === this.order ? this.dir : undefined;
		},
		doSort(order) {
			let nq = { dir: this.dir, order: this.order};
			if (nq.order === order)
				nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
			else {
				nq.order = order;
				nq.dir = 'asc';
			}
			if (this.runAt === 'server') {
				this.localQuery.dir = nq.dir;
				this.localQuery.order = nq.order;
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
		}
	},
	created() {
		this.$on('sort', this.doSort);
	}
});
