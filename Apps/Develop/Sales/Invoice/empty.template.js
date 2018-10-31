/*invoice template*/

const cmn = require('document/common');
const utils = require('std:utils');

const template = {
	properties: {
		"TRoot.Test": String
	},
	validators: {
	},
	events: {
		'Model.load': modelLoad,
	},
	commands: {
	},
	delegates: {
	}
};

module.exports = template;

async function modelLoad(root, caller) {
	console.dir(root);
}

