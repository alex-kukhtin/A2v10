/* electronic signature */

const utils = require('std:utils');
const eusign = require('std:eusign');
const http = require('std:http');

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

async function signFile() {
	const vm = this.$vm;
	const att = this.Attachment;
	let blob = await eusign.loadAttachment('/sales/waybill/attachment', att.Id); // raw
	console.dir('blob:'); console.dir(blob);
	let sign = eusign.signData(blob);
	console.dir('signed:'); console.dir(sign);
	let verify = eusign.verifyData(blob , sign);
	console.dir('verify:'); console.dir(verify);
}