
/* type script code here */

const template: ITemplate = {
	properties: {
		'TDocument.$checked': Boolean,
		"TDocument.Name"(this: TDocument) { return this.Memo + '2'; },
		"TDocument.$XXX": String,
		"TDocument.$ZZZsds": Number,
		'TRow.Sum'(this: TRow) { return 222;},
		'TDocument.Sum'() { return 2222; },
		'TDocument.$DatePlusOne'(this: TDocument) { return this.Date; },
		'TDocument.$canShipment'(this: TDocument) { return false },
		'TDocLink.$Mark'(this: TDocument) { return this.Done ? 'success' : null; },
		'TRow.$RoundSum'(this:TRow) { return this.Price * this.Qty; },
		'TRow.$RowBold'(this:TRow) { return this.Qty === 3; },
		'TRow.$RowMark'(this:TRow) { return this.Qty === 3 ? 'green' : undefined; }
	},
	validators: {
		'Document.Agent': 'Выберите покупателя',
		'Document.Rows[].Entity': 'Выберите товар2',
		'Document.Rows[].Price': 'Укажите цену'
	},
	events: {
		'Document.Rows[].add': (arr, row) => row.Qty = 1,
		'Document.Rows[].Entity.Article.change'() { },
		'Document.Agent.change': (doc: TDocument) => { console.dir('Agent.change'); },
		'Document.Date.change': (doc: TDocument, newVal, oldVal) => { console.dir(`Date.change nv:${newVal}, ov:${oldVal}`); }
	},
	commands: {
		apply: function (this:TRoot, doc: TDocument) {
			alert('apply');
			debugger;
		},
		unApply() {},
		createShipment() {},
		createPayment() {},
		createNewCustomer() {},
		"aaaa": async function () {
			return await this.$vm.$invoke('myCommand345'); }
	},
	delegates: {
		"myDelegate": (a, b) => a + b - 7,
		fetchCustomers
	}
};

module.exports = template;


function docNoChanged(this: TRoot, doc: TDocument) {
	return this.$isNew;
}

function fetchCustomers(this: TRoot, agent: TAgent, text: string) {
	let vm = this.$vm;
	return vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
}
