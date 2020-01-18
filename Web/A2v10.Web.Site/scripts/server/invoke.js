(function (param) {

	const utils = require('std:utils');

	const serverData = $$server();

	// model from DB
	var dmDb = serverData.dataModelDb();

	try {
		let methodToExec = dmDb.$template.commands[param];
		if (typeof methodToExec === 'object')
			methodToExec = methodToExec.exec;
		let result = methodToExec.call(dmDb);
		switch (result) {
			case 'save':
				return utils.toJson({ status: 'save', data: dmDb });
			default:
				return utils.toJson({ status: 'error', message: `Unknown return value: '${result}'` });
		}
	}
	catch (err) {
		return JSON.stringify({ status: 'error', message: err.message });
	}
});
