
(function () {

	const SiteController = component('baseController');

	const currentModule = $(DataModel);

	const vm = new SiteController({
		el: '#$(PageId)',
		data: currentModule().dataModel,
		methods: {
		},
		created() {
		},
		mounted() {
		}
	});

	vm.$data._host_ = {
		$viewModel: vm,
		$ctrl: vm.__createController__(vm)
	};

	vm.__doInit__('$(BaseUrl)');
})();

