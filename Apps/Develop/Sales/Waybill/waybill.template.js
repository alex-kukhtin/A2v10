/*invoice template*/

const utils = require('std:utils');
const du = utils.date;

// common module
const cmn = require('document/common');

const template = {
	properties: {
		'TRoot.$Answer': String,
        'TRow.Sum': cmn.rowSum,
        'TDocument.Sum': cmn.docTotalSum,
        'TDocument.$HasParent'() { return this.ParentDoc.Id !== 0; },
		'TDocParent.$Name': docParentName,
		'TRoot.$HasInbox'() { return !!this.Inbox;}
    },
    validators: {
        'Document.Agent': 'Выберите покупателя',
        'Document.DepFrom': 'Выберите склад',
        'Document.Rows[].Entity': 'Выберите товар',
        'Document.Rows[].Price': 'Укажите цену'
    },
    events: {
		'Model.load': modelLoad,
		'Model.saved'(root) {
			console.dir(root);
		},
        'Document.Rows[].add': (arr, row) => row.Qty = 1,
		'Document.Rows[].Entity.Article.change': cmn.findArticle,
		"Document.Rows[].adding"(arr, a) {
			console.dir(a);
		}
    },
    commands: {
        apply: cmn.docApply,
		unApply: cmn.docUnApply,
		resumeWorkflow
	}
};

module.exports = template;

function modelLoad(root) {
	console.dir(root);
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
	let result = await vm.$invoke('resumeWorkflow', { Id: root.Inbox.Id, Answer: root.$Answer}, '/sales/waybill');
	console.dir(result);
	alert('ok');
}
