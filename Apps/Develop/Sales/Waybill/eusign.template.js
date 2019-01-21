/* electronic signature */

const utils = require('std:utils');
const eusign = require('std:eusign');
const http = require('std:http');

const template = {
	properties: {
		'TAttachment.$Password': String,
		'TAttachment.$File': File,
		'TAttachment.$Info': Object,
		'TAttachment.$FrameUrl'() { return '/attachment/show/' + this.Id + '?base=/sales/waybill/attachment';}
	},
	events: {
		"Model.load": modelLoad
	},
	commands: {
		readKey: {
			exec: readKey,
			canExec: canReadKey
		},
		signFile,
		createContainer
	},
	delegates: {
	}
};

module.exports = template;


function modelLoad() {
	console.dir(eusign);
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

async function signFile() {
	const vm = this.$vm;
	const att = this.Attachment;
	eusign.beginRequest();
	try {
		let blob = await eusign.loadAttachment('/sales/waybill/attachment', att.Id);
		console.dir('blob:'); console.dir(blob);
		let sign = eusign.signData(blob, att.$Info);
		console.dir('signed:'); console.dir(sign);
		let verify = eusign.verifyData(blob, sign);
		console.dir('verify:'); console.dir(verify);
		let saved = eusign.saveSignature({
			id: att.Id,
			kind: 'customer',
			signature: sign,
			ownerInfo: verify,
			base: '/sales/waybill/attachment'
		});
	} catch (err) {
		vm.$alert(eusign.getMessage(err));
	} finally {
		eusign.endRequest();
	}
}

async function createContainer() {
	const vm = this.$vm;
	const att = this.Attachment;
	eusign.beginRequest();
	try {
		let blob = await eusign.loadAttachment('/sales/waybill/attachment', att.Id);
		let sign = await eusign.loadSignature('/sales/waybill/attachment', att.Signatures[0].Id);
		let cont = eusign.createContainer(blob, [sign]);
		console.dir(cont);
	} catch (err) {
		vm.$alert(eusign.getMessage(err));
	} finally {
		eusign.endRequest();
	}
}