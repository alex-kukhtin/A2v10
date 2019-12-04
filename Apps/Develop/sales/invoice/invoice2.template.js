define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cmn = require('/document/common');
    alert(cmn);
    const template = {
        properties: {
            'TDocument.$checked': Boolean,
            "TDocument.Name"() { return this.Done + '3'; },
            "TDocument.$XXX": String,
            "TDocument.$ZZZsds": Number,
            'TRow.Sum'() { return 222; },
            'TDocument.Sum'() { return 2222; },
            'TDocument.$DatePlusOne'() { return this.Date; },
            'TDocument.$canShipment'() { return false; },
            'TDocLink.$Mark'() { return this.Done ? 'success' : undefined; },
            'TRow.$RoundSum'() { return this.Price * this.Qty; },
            'TRow.$RowBold'() { return this.Qty === 3; },
            'TRow.$RowMark'() { return this.Qty === 3 ? 'green' : undefined; }
        },
        validators: {
            'Document.Agent': 'Выберите покупателя 234',
            'Document.Rows[].Entity': 'Выберите товар2',
            'Document.Rows[].Price': 'Укажите цену'
        },
        events: {
            'Model.load': modelLoad,
            'Document.Rows[].add': (arr, row) => row.Qty = 1,
            'Document.Rows[].Entity.Article.change'() { },
            'Document.Agent.change': (doc, newVal) => { console.dir('Agent.change'); },
            'Document.Date.change': (doc, newVal, oldVal) => { console.dir(`Date.change nv:${newVal}, ov:${oldVal}`); },
            'Document.No.change': docNoChanged
        },
        commands: {
            apply: function (doc) {
                alert('apply');
                debugger;
            },
            unApply() { },
            createShipment() { },
            createPayment() { },
            createNewCustomer() { },
            "aaaa": async function () {
                return await this.$vm.$invoke('myCommand345', null);
            }
        },
        delegates: {
            "myDelegate": (a, b) => a + b - 7,
            fetchCustomers
        }
    };
    exports.default = template;
    function modelLoad(root) {
        console.dir(root.Document.$permissions);
    }
    function docNoChanged(doc, newVal, oldVal) {
        console.log(this.Document.$isNew);
        console.log(this.Document.Agent.Name);
    }
    async function fetchCustomers(agent, text) {
        let vm = this.$vm;
        return await vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
    }
});
