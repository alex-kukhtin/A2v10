"use strict";
/* type script code here */
const template = {
    properties: {
        'TDocument.$checked': Boolean,
        "TDocument.Name"() { return this.Memo + '2'; },
        "TDocument.$XXX": String,
        "TDocument.$ZZZsds": Number,
        'TRow.Sum'() { return 222; },
        'TDocument.Sum'() { return 2222; },
        'TDocument.$DatePlusOne'() { return this.Date; },
        'TDocument.$canShipment'() { return false; },
        'TDocLink.$Mark'() { return this.Done ? 'success' : null; },
        'TRow.$RoundSum'() { return this.Price * this.Qty; },
        'TRow.$RowBold'() { return this.Qty === 3; },
        'TRow.$RowMark'() { return this.Qty === 3 ? 'green' : undefined; }
    },
    validators: {
        'Document.Agent': 'Выберите покупателя',
        'Document.Rows[].Entity': 'Выберите товар2',
        'Document.Rows[].Price': 'Укажите цену'
    },
    events: {
        'Document.Rows[].add': (arr, row) => row.Qty = 1,
        'Document.Rows[].Entity.Article.change'() { },
        'Document.Agent.change': (doc) => { console.dir('Agent.change'); },
        'Document.Date.change': (doc, newVal, oldVal) => { console.dir(`Date.change nv:${newVal}, ov:${oldVal}`); }
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
            return await this.$vm.$invoke('myCommand345');
        }
    },
    delegates: {
        "myDelegate": (a, b) => a + b - 7,
        fetchCustomers
    }
};
module.exports = template;
function docNoChanged(doc) {
    return this.$isNew;
}
function fetchCustomers(agent, text) {
    let vm = this.$vm;
    return vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
}
