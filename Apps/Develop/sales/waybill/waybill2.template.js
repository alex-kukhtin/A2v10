define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils = require('std:utils');
    const cst = require('std:const');
    const du = utils.date;
    const cmn = require('document/common2');
    console.dir(cmn);
    const template = {
        options: {
            bindOnce: ['Warehouses']
        },
        properties: {
            'TRoot.$Answer': String,
            'TRoot.$BarCode': String,
            'TRoot.$Collapsed'() { return !window.matchMedia('(min-width:1025px)').matches; },
            'TRow.Sum': cmn.rowSum,
            'TRow.$BrowseParams'() {
                let doc = this.$root.Document;
                return { Date: doc.Date };
            },
            'TDocument.Sum': cmn.docTotalSum,
            'TDocument.$HasParent'() { return this.ParentDoc.Id !== 0; },
            'TDocParent.$Name': docParentName,
            'TRoot.$HasInbox'() { return !!this.Inbox; },
            'TDocument.$DateEnd': Date,
            'TDocument.$Interval'() { return du.diff("minute", this.$DateEnd, this.Date); },
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
        defaults: {
            'Document.Date': du.now(),
            'Document.Agent'(elem) {
                console.dir(elem);
                return { Id: 555, Name: 'I am the name' };
            },
            'Document.No': 150,
            'Document.Rows[]'(e) { console.dir('call defaults for row'); return 1; },
            "xxx": (row, prop) => 1
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
            'Model.saved'(root) {
                console.dir(root);
            },
            'Document.Rows[].Entity.Article.change': cmn.findArticle,
            "Document.Rows2[].adding"(arr, row) {
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
            insertAbove: insertRow("above"),
            insertBelow: insertRow("below"),
            runServerScript,
            callApi,
            getWeather,
            testPost,
            sendMessage
        }
    };
    exports.default = template;
    function modelLoad(root) {
        console.dir(root);
        console.dir(cmn);
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
            let result = await ctrl.$invoke('callApi', { Code: '11223344' }, null, { catchError: true });
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
            let result = await ctrl.$invoke('getWeather', { City: 'London' }, null, { catchError: true });
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
            let result = await ctrl.$invoke('testPost', { Body: { visitId: 108, donorId: 401 } }, null, { catchError: true });
            console.dir(result);
            alert(result.instanceId);
        }
        catch (err) {
            alert('1');
            alert(err);
        }
    }
    async function sendMessage() {
        const ctrl = this.$ctrl;
        const doc = this.Document;
        let r = await ctrl.$invoke('sendMessage', { Id: doc.Id });
        alert(JSON.stringify(r));
    }
});
