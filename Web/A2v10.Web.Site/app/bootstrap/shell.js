

(function () {

	const store = component('std:store');

	const shell = Vue.extend({
		components: {
		},
		store,
		data() {
			return {
			};
		},
		computed: {
		},
		watch: {
		},
		methods: {
		},
		created() {
		}
	});

	app.components['std:shellController'] = shell;

})();

