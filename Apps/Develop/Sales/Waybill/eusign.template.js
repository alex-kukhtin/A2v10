/* electronic signature */

const eusign = require('std:eusign');
const html = require('std:html');
const platform = require('std:platform');

const template = {
	properties: {
		'TAttachment.$Password': String,
		'TAttachment.$File': File,
		'TAttachment.$Info': Object,
		'TAttachment.$HasKeys'() { return this.Keys.length > 0; },
		'TAttachment.$Alias': String,
		'TAttachment.$FrameUrl'() {
			return `/attachment/show/${this.Id}?base=/sales/waybill/attachment&token=${this.Token}`;
		}
	},
	events: {
		"Model.load": modelLoad,
		"Attachment.$File.change": fileChange
	},
	commands: {
		readKey: {
			exec: readKey,
			canExec: canReadKey
		},
		signFile,
		createContainer,
		verifySignature
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
		let result = await eusign.readKey(att.$Password, att.$File, att.$Alias);
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
	const base = '/sales/waybill/attachment';
	try {
		debugger;
		let blobs = await eusign.loadAttachment(base, att.Id, att.Token);
		console.dir('blob:'); console.dir(blobs);
		let signed = eusign.signData(blobs);
		console.dir('signed:'); console.dir(signed.data);
		eusign.saveSignature({
			id: att.Id,
			kind: 'customer',
			signature: signed.data,
			info: signed.ownerInfo,
			base: base
		});
	} catch (err) {
		vm.$alert(eusign.getMessage(err));
	} finally {
		eusign.endRequest();
	}
}

async function createContainer() {
	const att = this.Attachment;
	const base = '/sales/waybill/attachment';
	let result = await eusign.loadSignedData(base, att.Id);
	html.downloadBlob(new Blob([result]), 'test21', 'pdf');
}

async function verifySignature() {
	const vm = this.$vm;
	const att = this.Attachment;
	const base = '/sales/waybill/attachment';
	let result = await eusign.loadSignedData(base, att.Id);
	try {
		let verify = eusign.verifyData(result);
		console.dir(verify);
	} catch (err) {
		vm.$alert(eusign.getMessage(err));
	}
}

function fileChange(att) {
	let file = att.$File;
	if (!file) {
		att.Keys.$empty();
		att.$Alias = '';
		att.$Password = '';
		return;
	}
	let name = file.name.toLowerCase();
	if (name.indexOf('.jks') === name.length - 4) {
		eusign.findKeys(file).then(function (result) {
			for (let i = 0; i < result.length; i++) {
				att.Keys.$append({ Alias: result[i] });
			}
			if (att.Keys.length)
				att.$Alias = att.Keys[0].Alias;
		});
	}
}
