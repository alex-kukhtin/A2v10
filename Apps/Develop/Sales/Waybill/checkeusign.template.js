/* electronic signature */

const utils = require('std:utils');
const eusign = require('std:eusign');
const http = require('std:http');
const eventBus = require('std:eventBus');

const template = {
	properties: {
		'TRoot.$libraryLoaded': Boolean
	},
	events: {
		"Model.load": modelLoad
	},
	commands: {
		verifySignature
	},
	delegates: {
	}
};

module.exports = template;


function modelLoad(root) {
	eusign.beginRequest();
	console.dir(root);
	eventBus.$on('eusign.loaded', function () {
		root.$libraryLoaded = true;
		eusign.endRequest();
	});
}

async function readKey() {
	let vm = this.$vm;
	try {
		const att = this.Attachment;
		console.dir(att.$File);
		let result = await eusign.readKey(att.$Password, att.$File);
		console.dir(result);
		att.$Info = result;
	} catch (err) {
		vm.$alert(eusign.getMessage(err));
	}
}

function canReadKey() {
	const att = this.Attachment;
	return att.$Password && att.$File;
}

async function verifySignature() {
	const vm = this.$vm;
	const att = this.Attachment;
	const sign = this.Attachment.Signatures[0];
	eusign.beginRequest();
	eusign.beginRequest();
	try {
		let blob = await eusign.loadAttachment('/sales/waybill/attachment', att.Id);
		console.dir('blob:'); console.dir(blob);
		let signature = await eusign.loadSignature('/sales/waybill/attachment', sign.Id);
		console.dir('signature:'); console.dir(signature);
		let verify = eusign.verifyData(blob, signature);
		console.dir('verify:'); console.dir(verify);
		alert('ok');
	} catch (err) {
		vm.$alert(eusign.getMessage(err));
	} finally {
		eusign.endRequest();
	}
}