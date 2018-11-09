// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {


	let cm = window.$currentModule();

	const DialogController = component('standaloneController');

	const vm = new DialogController({
		el: "#$(PageGuid)",
		props: {
			inDialog: { type: Boolean, default: true }
		},
		data: cm.dataModel
	});

	DialogController.init(vm, null);

})();