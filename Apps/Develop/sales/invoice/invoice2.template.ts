
import { TDocument, TRoot, TAgent, TRow, TRows } from 'model';


const template: Template = {
	properties: {
		'TDocument.$checked': Boolean,
		"TDocument.Name"(this: TDocument) { return this.Done + '3'; },
		"TDocument.$XXX": String,
		"TDocument.$ZZZsds": Number,
		'TRow.Sum'(this: TRow) { return 222; },
		'TDocument.Sum'() { return 2222; },
		'TDocument.$DatePlusOne'(this: TDocument): Date { return this.Date; },
		'TDocument.$canShipment'(this: TDocument) { return false },
		'TDocLink.$Mark'(this: TDocument) { return this.Done ? 'success' : undefined; },
		'TRow.$RoundSum'(this: TRow) { return this.Price * this.Qty; },
		'TRow.$RowBold'(this: TRow) { return this.Qty === 3; },
		'TRow.$RowMark'(this: TRow) { return this.Qty === 3 ? 'green' : undefined; }
	},
	validators: {
		'Document.Agent': 'Выберите покупателя 234',
		'Document.Rows[].Entity': 'Выберите товар2',
		'Document.Rows[].Price': 'Укажите цену'
	},
	events: {
		'Model.load': modelLoad,
		'Document.Rows[].add': (arr: TRows, row: TRow) => row.Qty = 1,
		'Document.Rows[].Entity.Article.change'() { },
		'Document.Agent.change': (doc: TDocument, newVal: TAgent) => { console.dir('Agent.change'); },
		'Document.Date.change': (doc: TDocument, newVal:Date, oldVal:Date) => { console.dir(`Date.change nv:${newVal}, ov:${oldVal}`); },
		'Document.No.change': docNoChanged
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
			return await this.$vm.$invoke('myCommand345', null); }
	},
	delegates: {
		"myDelegate": (a, b) => a + b - 7,
		fetchCustomers
	}
};

export default template;


function modelLoad(root) {
	console.dir(root.Document.$permissions);
}

function docNoChanged(this: TRoot, doc: TDocument, newVal:number, oldVal:number): void {
	console.log(this.Document.$isNew);
	console.log(this.Document.Agent.Name);
}

async function fetchCustomers(this: TRoot, agent: TAgent, text: string): Promise<any> {
	let vm = this.$vm;
	return await vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
}
