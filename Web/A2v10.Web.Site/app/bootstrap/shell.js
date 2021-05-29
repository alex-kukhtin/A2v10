

(function () {

	const store = component('std:store');
	const sideBar = component('std:sideBar');
	const eventBus = require('std:eventBus');

	const shell = Vue.extend({
		components: {
			'a2-side-bar': sideBar
		},
		store,
		data() {
			return {
				globalPeriod:null
			};
		},
		computed: {
		},
		watch: {
		},
		methods: {
		},
		created() {
			const me = this;
			me.__dataStack__ = [];
			window.addEventListener('popstate', function (event, a, b) {
				eventBus.$emit('modalCloseAll');
				if (me.__dataStack__.length > 0) {
					let comp = me.__dataStack__[0];
					let oldUrl = event.state;
					if (!comp.$saveModified()) {
						// disable navigate
						oldUrl = comp.$data.__baseUrl__.replace('/_page', '');
						window.history.pushState(oldUrl, null, oldUrl);
						return;
					}
				}

				me.$store.commit('popstate');
			});
		}
	});

	app.components['std:shellController'] = shell;

})();

