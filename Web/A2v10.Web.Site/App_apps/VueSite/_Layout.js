(function () {

	let cm = window.$currentModule();

	const SiteController = component('siteController');

	const vm = new SiteController({
		el: '#$(PageId)',
		data: cm.dataModel,
		created() {
		},
		mounted() {
		}
	});

	SiteController.init(vm, null);
})();

