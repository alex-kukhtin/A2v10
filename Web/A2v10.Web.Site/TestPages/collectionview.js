(function() {
	/**
	 * TODO: кол-во страниц должно быть ПОСЛЕ фильтрации
	 */


	const collectionViewTemplate = `
<div>
	<slot :itemsSource="pagedSource" :pager="thisPager" :filter="filter"></slot>
	<code>
		collection-view: source-count={{sourceCount}}, page-size={{pageSize}}
		offset:{{offset}}, pages={{pages}}, dir={{dir}}, order={{order}}, filter={{filter}}
	</code>
</div>
`;


	// {{ itemsSource }}

	const dataGridTemplate = `
<table border="1">
	<thead>
		<tr>
			<th :class="isSort('id')" @click="sort('id')">Id {{isSort('id')}}</th>
			<th :class="isSort('name')" @click="sort('name')">Name {{isSort('name')}}</th>
			<th>Name (edit)</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td colspan="4">Grouping row</td>
		</tr>
		<tr v-for="(item, index) in itemsSource">
			<td v-text="item.id"></td>
			<td v-text="item.name"></td>
			<td><input v-model.lazy="item.name"></td>
		</tr>
	</tbody>
</table>
`;

	// Pager: для удобной манипуляции 
	// его можно заменить на простые кнопки, связанные прямо с CollectionView
	const pagerTemplate = `
<div class="pager">
	<code>pager source: offset={{source.offset}}, pageSize={{source.pageSize}},
		pages={{source.pages}}</code>
	<a href @click.stop.prevent="source.first">first</a>
	<a href @click.stop.prevent="source.prev">prev</a>
	<a href @click.stop.prevent="source.next">next</a>
</div>
`;

	Vue.component('collection-view', {
		template: collectionViewTemplate,
		props: {
			itemsSource: Array,
			pageSize: Number,
			initialFilter: Object
		},
		data() {
			return {
				offset: 0,
				dir: 'asc',
				order: '',
				filter: this.initialFilter,
				filteredCount: 0
			};
		},
		computed: {
			pagedSource() {
				console.warn('get paged source');
				let arr = [].concat(this.itemsSource);
				// filter
				if (this.filter.Text)
					arr = arr.filter((v) => v.id.toString().indexOf(this.filter.Text) !== -1);
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
				return arr.slice(this.offset, this.offset + this.pageSize);
			},
			sourceCount() {
				return this.itemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages() {
				return Math.ceil(this.filteredCount / this.pageSize);
			}
		},
		methods: {
			first() {
				this.offset = 0;
			},
			prev() {
				if (this.offset > 0)
					this.offset -= this.pageSize;
			},
			next() {
				this.offset += this.pageSize;
			},
			isSort(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				if (this.order === order)
					this.dir = this.dir === 'asc' ? 'desc' : 'asc';
				else {
					this.order = order;
					this.dir = 'asc';
				}
			}
		},
		created() {
			this.$on('sort', this.doSort);
		}
	});


	Vue.component('data-grid', {
		template: dataGridTemplate,
		props: {
			itemsSource: Array
		},
		methods: {
			sort(order) {
				this.$parent.$emit('sort', order);
			},
			isSort(order) {
				return this.$parent.isSort(order);
			}
		}
	});

	Vue.component('pager', {
		template: pagerTemplate,
		props: {
			source: Object
		}
	});

	const modelData = {
		Elements: [
			{ id: 1, name: 'Element 1' },
			{ id: 2, name: 'Element 2' },
			{ id: 3, name: 'Element 3' },
			{ id: 4, name: 'Element 4' },
			{ id: 5, name: 'Element 5' }
		]
	};

	new Vue({
		el: "#app",
		data: modelData,
		methods: {
			add(len) {
				len = len || 1;
				let index = this.Elements.length + 1;
				for (let i = 0; i < len; i++) {
					this.Elements.push({ id: index + i, name: 'Element ' + (index + i)});
				}
			}
		}
	});


})();