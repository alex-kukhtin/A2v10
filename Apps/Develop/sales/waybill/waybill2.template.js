define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils = require('std:utils');
    const cst = require('std:const');
    const du = utils.date;
    const cmn = require('document/common');
    const template = {
        properties: {
            'TRoot.$Answer': String,
            'TRow.Sum': cmn.rowSum,
            'TDocument.Sum': cmn.docTotalSum,
            'TDocument.$HasParent'() { return this.ParentDoc.Id !== 0; },
            'TDocParent.$Name': docParentName,
            'TRoot.$HasInbox'() { return !!this.Inbox; },
            'TDocument.$Date': {
                get() { return this.Date; },
                set: setDocumentDate
            },
            'TDocument.$FormattedDate': {
                get() {
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
                valid(doc) { return doc.No > 0; }, msg: 'Invalid document number', severity: cst.SEVERITY.WARNING
            }
        },
        events: {
            'Model.load': modelLoad,
            'Model.saved'(root) {
                console.dir(root);
            },
            'Document.Rows[].add': (arr, row) => row.Qty = 1,
            'Document.Rows[].Entity.Article.change': cmn.findArticle,
            "Document.Rows[].adding"(arr, row) {
                console.dir(row);
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
            insertAbove: insertRow("above"),
            insertBelow: insertRow("below")
        }
    };
    exports.default = template;
    function modelLoad(root) {
        console.dir(root);
        if (root.Document.$isNew)
            cmn.documentCreate(root.Document, 'Waybill');
    }
    function docParentName() {
        const doc = this;
        return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, "Currency")} грн.`;
    }
    async function resumeWorkflow() {
        const root = this;
        const vm = this.$vm;
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
            if (!result)
                return;
        }
        alert('apply document here: ' + doc.Id);
    }
});
