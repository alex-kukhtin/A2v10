/*invoice template*/

import { TRoot, TDocument, TRow } from "model";
import { TRows } from "../invoice/model";
import { IDocumentModule } from '../../document/commondoc';


const utils = require('std:utils') as Utils;
const cst = require('std:const');
const du = utils.date;

// common module
const cmn = require('document/common2') as IDocumentModule;
console.dir(cmn);

const template: Template = {
	properties: {
		'TRoot.$Answer': String,
		'TRoot.$BarCode' : String,
		'TRoot.$Collapsed'() { return !window.matchMedia('(min-width:1025px)').matches;},
		'TRow.Sum': cmn.rowSum,
		'TDocument.Sum': cmn.docTotalSum,
		'TDocument.$HasParent'(this: TDocument) { return this.ParentDoc.Id !== 0; },
		'TDocParent.$Name': docParentName,
		'TRoot.$HasInbox'(this: TRoot) { return !!this.Inbox; },
		'TDocument.$Date': {
			get(this: TDocument):Date { return this.Date; },
			set: setDocumentDate
		},
		'TDocument.$FormattedDate': {
			get(this: TDocument): string {
				return du.formatDate(this.Date);
			}
		}
	},
	validators: {
		'Document.Agent': 'Выберите покупателя',
		'Document.DepFrom': 'Выберите склад',
		'Document.Rows[].Entity': 'Выберите товар',
		'Document.Rows[].Price': 'Укажите цену',
		'Document.No': {
			valid(doc: TDocument) { return doc.No > 0; }, msg: 'Invalid document number', severity: cst.SEVERITY.WARNING
		}
	},
	events: {
		'Model.load': modelLoad,
		'Model.saved'(root: TRoot) {
			console.dir(root);
		},
		'Document.Rows[].add': (arr: TRows, row: TRow) => row.Qty = 1,
		'Document.Rows[].Entity.Article.change': cmn.findArticle,
		"Document.Rows[].adding"(arr: TRows, row: TRow) {
			console.dir(row);
		},
		'Root.$BarCode.change': barcodeChange
	},
	commands: {
		apply: {
			saveRequired: true,
			exec: applyDoc,
			confirm: 'Are you sure?'
		},
		unApply: cmn.docUnApply,
		resumeWorkflow,
		insertAbove: insertRow(InsertTo.above),
		insertBelow: insertRow(InsertTo.below),
		runServerScript,
		callApi,
		getWeather,
		testPost
	}
};

export default template;

function modelLoad(root: TRoot): void {
	console.dir(root);
	console.dir(cmn);
	if (root.Document.$isNew)
		cmn.documentCreate(root.Document, 'Waybill');
}

function docParentName(this: TDocument) {
	const doc = this;
	return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, DataType.Currency)} грн.`;
}

async function resumeWorkflow(this: TRoot): Promise<any> {
	const root = this;
	const vm = this.$vm;
	//alert(root.$Comment);
	let result = await vm.$invoke('resumeWorkflow', { Id: root.Inbox.Id, Answer: root.$Answer }, '/sales/waybill');
	console.dir(result);
	alert('ok');
}

function setDocumentDate(this: TDocument, newDate: Date):void {
	console.dir(this);
	const vm = this.$vm;
	vm.$confirm('are you sure?').then(() => {
		this.Date = newDate;
	});
}

function insertRow(to: InsertTo) {
	return function (this: TRoot, row: TRow) {
		this.Document.Rows.$insert(null, to, row);
	};
}

async function applyDoc(this: TRoot, doc: TDocument): Promise<any> {
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

function barcodeChange(root, val) {
	console.dir(val);
}

async function runServerScript() {
	const ctrl = this.$ctrl;
	try {
		let result = await ctrl.$invoke('serverScript', { Id: this.Document.Id });
		console.dir(result);
		ctrl.$reload();
	}
	catch (err) {
		alert(err);
	}
}

async function callApi() {
	const ctrl = this.$ctrl;
	try {
		let result = await ctrl.$invoke('callApi', { Code: '11223344' }, null, {catchError:true});
		console.dir(result);
	}
	catch (err) {
		alert('1');
		alert(err);
	}
}

async function getWeather() {
	const ctrl = this.$ctrl;
	try {
		let result = await ctrl.$invoke('getWeather', { City: 'London' }, null, {catchError:true});
		console.dir(result);
	}
	catch (err) {
		alert('1');
		alert(err);
	}
}

async function testPost() {
	const ctrl = this.$ctrl;
	try {
		let result = await ctrl.$invoke('testPost', { Body: {visitId:108, donorId:401} }, null, { catchError: true });
		console.dir(result);
		alert(result.instanceId);
	}
	catch (err) {
		alert('1');
		alert(err);
	}
}