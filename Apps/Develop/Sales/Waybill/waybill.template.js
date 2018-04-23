/*invoice template*/

const utils = require('std:utils');
const du = utils.date;

// common module
const cmn = require('document/common');

const template = {
    properties: {
        'TRow.Sum': cmn.rowSum,
        'TDocument.Sum': cmn.docTotalSum,
        'TDocument.$HasParent'() { return this.ParentDoc.Id !== 0; },
        'TDocParent.$Name': docParentName
    },
    validators: {
        'Document.Agent': 'Выберите покупателя',
        'Document.DepFrom': 'Выберите склад',
        'Document.Rows[].Entity': 'Выберите товар',
        'Document.Rows[].Price': 'Укажите цену'
    },
    events: {
        'Model.load': modelLoad,
        'Document.Rows[].add': (arr, row) => row.Qty = 1,
        'Document.Rows[].Entity.Article.change': cmn.findArticle
    },
    commands: {
        apply: cmn.docApply,
		unApply: cmn.docUnApply
	}
};

module.exports = template;

function modelLoad(root) {
    if (root.Document.$isNew)
        cmn.documentCreate(root.Document, 'Waybill');
}

function docParentName() {
    const doc = this;
    return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, 'Currency')} грн.`;
}
