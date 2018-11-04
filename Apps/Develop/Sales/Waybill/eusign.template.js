/* electronic signature */

const utils = require('std:utils');
const eusign = require('std:eusign');

const template = {
	properties: {
		'TAttachment.$Password': String,
		'TAttachment.$File': File,
		'TAttachment.$Info': Object
	},
	events: {
		"Model.load": modelLoad
	},
	commands: {
		readKey: {
			exec: readKey,
			canExec: canReadKey
		},
		signFile
	},
	delegates: {
	}
};

module.exports = template;


function modelLoad() {
	console.dir(eusign);
}

async function readKey() {
	const att = this.Attachment;
	console.dir(att.$File);
	let result = await eusign.readKey(att.$Password, att.$File);
	console.dir(result);
	att.$Info = result;
}

function canReadKey() {
	const att = this.Attachment;
	return att.$Password && att.$File;
}

function signFile() {

}