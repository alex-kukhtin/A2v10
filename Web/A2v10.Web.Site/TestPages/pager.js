
(function () {


	let modelData = {
		Elements: [
			{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
		],
		PageSize: 10
	};

	/*!можно сделать свойства, которые возвращают функции! - НАЗОВЕМ ИХ DELEGATES*/
	Object.defineProperty(modelData, "Filter", {
		enumerable: true,
		configurable: true, /* needed */
		get() {
			return function (v, filter) {
				//console.warn('call filter:' + v.id);
				return v.id.toString().indexOf(filter) !== -1;
				//return true;
			};
		}
	});


	Vue.component('testpager', {
		template: '<div>{{$parent.pagedSource}}</div>'
	});

	const pagerTemplate =
		`<div>
    <slot :itemsSource="pagedSource" :offset="offset" :pager="thisPager"/>
    <a href @click.stop.prevent="first">first</a>
    <a href @click.stop.prevent="prev">prev</a>
    <a href @click.stop.prevent="next">next</a>
    <a href @click.stop.prevent="last">last</a>
    <span> show: {{offset +1}}..{{offset + +pageSize}} from {{sourceCount}}</span>
    <br>
    <span>filter</span><input v-model="filter">
</div>
`;

	function makeQuery(props) {
		//alert(props);
		let obj = {};
		obj.filter1 = '',
			obj.filter2 = '',
			obj.filter3 = false;
		return obj;
	}

	Vue.component('xpager', {
		template: pagerTemplate,

		props: {
			pageSize: [String, Number],
			itemsSource: Array,
			filterFunc: Function,
			queryProps: Object
		},

		data() {
			return {
				offset: 0,
				filter: '',
				// todo: сделаем query как объект со свойствами
				query: makeQuery(this.queryProps)
			};
		},

		computed: {
			pagedSource() {
				console.warn('slice array');
				// TODO: check offset after filtering
				// filter -> sort -> paging
				if (this.filterFunc) {
					console.dir(this.filterFunc);
					return this.itemsSource
						//.filter((v)=> v.id.toString().indexOf(this.filter) != -1)
						.filter((v) => this.filterFunc(v, this.filter))
						.slice(this.offset, this.offset + +this.pageSize);
				} else {
					return this.itemsSource
						.filter((v) => v.id.toString().indexOf(this.filter) !== -1)
						.slice(this.offset, this.offset + +this.pageSize);
				}
			},
			sourceCount() {
				return this.itemsSource.length;
			},
			thisPager() {
				return this;
			}
		},

		methods: {
			next() {
				this.offset += +this.pageSize;
			},
			prev() {
				if (!this.offset) return;
				this.offset -= +this.pageSize;
				if (this.offset < 0) this.offset = 0;
			},
			first() {
				this.offset = 0;
			},
			last() {
				this.offset = this.sourceCount - +this.pageSize;
			}
		},
		created() {
			//alert(this.filterFunc);
		}
	});

	var vm = new Vue({
		el: '#app',
		data: modelData,
		methods: {
			add100() {
				let fi = this.Elements.length + 1;
				for (let i = 0; i < 100; i++)
					this.Elements.push({ id: fi + i });
			},
			check() {
				console.dir(this);
			},
			filter2(v, filter) {
				//TODO: сюда нужно передавать ВЕСЬ объект фильтрации
				return v.id.toString().indexOf(filter) !== -1;
			}
		},
		created() {
			//alert(this.Filter);
		}
	});

})();

