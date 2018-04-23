/*waybillin template*/

// common module
const cmn = require('document/common');

const template = {
    properties: {
        'TRow.Sum': cmn.rowSum,
        'TDocument.Sum': cmn.docTotalSum
    },
    validators: {
        'Document.Agent': 'Выберите поставщика',
        'Document.DepTo': 'Выберите склад',
        'Document.Rows[].Entity': 'Выберите товар',
        'Document.Rows[].Price': 'Укажите цену'
    },
    events: {
        'Model.load': modelLoad,
        'Document.Rows[].add': (arr, row) => row.Qty = 1,
        'Document.Rows[].Entity.Article.change': cmn.findArticle
    }
};

module.exports = template;

function modelLoad(root) {
    if (root.Document.$isNew)
        cmn.documentCreate(root.Document, 'WaybillIn');
    console.dir(root.Document);
}
