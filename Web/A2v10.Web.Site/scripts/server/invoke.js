// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

(function (param) {

	const utils = require('std:utils');

	const serverData = $$server();

	// model from DB
	let dmDb = serverData.dataModelDb();

	function err(msg) {
		return JSON.stringify({ status: 'error', message: msg });
	}

	try {
		if (!dmDb || !dmDb.$template || !dmDb.$template.commands)
			return err('There are no commands in template');
		let methodToExec = dmDb.$template.commands[param];
		if (!methodToExec)
			return err(`Command '${param}' not found`);
		if (typeof methodToExec === 'object')
			methodToExec = methodToExec.exec;
		let result = methodToExec.call(dmDb);
		switch (result) {
			case 'save':
				return utils.toJson({ status: 'save', data: dmDb });
			default:
				return err(`Unknown return value: '${result}'`);
		}
	}
	catch (err) {
		return err(`Command '${param}' not found`);
	}
});
