/*invoice template*/

const utils = require('std:utils');
const cst = require('std:const');
const du = utils.date;

// common module
const cmn = require('document/common');

const template = {
	properties: {
		'TRoot.$Answer': String,
		'TRoot.$BarCode': String,
		'TRow.Sum': cmn.rowSum,
		'TDocument.Sum': cmn.docTotalSum,
		'TDocument.$HasParent'() { return this.ParentDoc.Id !== 0; },
		'TDocParent.$Name': docParentName,
		'TRoot.$HasInbox'() { return !!this.Inbox; },
		'TDocument.$Date': {
			get() { return this.Date; },
			set: setDocumentDate
		}
	},
	validators: {
		'Document.Agent': 'Выберите покупателя',
		'Document.DepFrom': 'Выберите склад',
		'Document.Rows[].Entity': 'Выберите товар',
		'Document.Rows[].Price': 'Укажите цену',
		'Document.No': {
			valid(doc) { return doc.No > 0; }, msg: 'Invalid document number', severity: cst.SEVERITY.WARNING
		}
	},
	events: {
		'Model.load': modelLoad,
		'Model.saved'(root) {
			console.dir(root);
		},
		//'$BarCode.change': barCodeChange,
		'Document.Rows[].add': (arr, row) => row.Qty = 1,
		'Document.Rows[].Entity.Article.change': cmn.findArticle,
		"Document.Rows[].adding"(arr, a) {
			console.dir(a);
		}
	},
	commands: {
		apply: {
			saveRequired: true,
			exec: applyDoc,
			confirm: 'Are you sure?'
		},
		unApply: cmn.docUnApply,
		resumeWorkflow,
		insertAbove: insertRow('above'),
		insertBelow: insertRow('below'),
		setDate(doc) {
			doc.Date = new Date();
		},
		saveTime,
		serverProcessAndSave
	}
};

module.exports = template;

function modelLoad(root) {
	console.dir(root.Document.$permissions);
	if (root.Document.$isNew)
		cmn.documentCreate(root.Document, 'Waybill');
}

function docParentName() {
	const doc = this;
	return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, 'Currency')} грн.`;
}

async function resumeWorkflow() {
	const root = this;
	const vm = this.$vm;
	//alert(root.$Comment);
	let result = await vm.$invoke('resumeWorkflow', { Id: root.Inbox.Id, Answer: root.$Answer }, '/sales/waybill');
	console.dir(result);
	alert('ok');
}

function setDocumentDate(newDate) {
	console.dir(this);
	const vm = this.$vm;
	vm.$confirm('are you sure?').then(() => {
		this.Date = newDate;
	});
}

function insertRow(to) {
	return function (row) {
		this.Document.Rows.$insert(null, to, row);
	};
}

async function applyDoc(doc) {
	const vm = this.$vm;
	let errs = vm.$getErrors(cst.SEVERITY.ERROR);
	if (errs) {
		vm.$alert({ msg: 'First correct the errors:', list: errs.map(x => x.msg) });
		return;
	}
	errs = vm.$getErrors(cst.SEVERITY.WARNING);
	if (errs) {
		let result = await vm.$confirm({ msg: 'The document has warnings. Apply anyway?', list: errs.map(x => x.msg) });
		if (!result) return;
	}
	alert('apply document here: ' + doc.Id);
}

async function saveTime() {
	const ctrl = this.$ctrl;
	const doc = this.Document;
	let r = await ctrl.$invoke('saveTime', { Id: doc.Id, DateTime: doc.Date });
	doc.Date = r.Result.DateTime;
	await ctrl.$showDialog('/sales/waybill/testTime', 0, { DateTime: doc.Date });
}

function barCodeChange(el, val) {
	console.dir(val);
}

function serverProcessAndSave() {
	let root = this;
	root.Document.Memo = 'MEMO FROM SERVER SCRIPT';
	root.Document.Rows.$append().Qty = 2;
	//throw new Error('UI:unable to save');
	return 'save';
}
