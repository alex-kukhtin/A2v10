
/* type script code here */

const template: ITemplate = {
	properties: {
		"TDocument.Name"() { return this.MyText; },
		"TDocument.$XXX": String,
		"TDocument.$ZZZsds": Number 
	},
	events: {
		"aaaa.SSSS.change"() { return this.$isEmpty; },
		"bbbb.tttt.change": docNoChanged
	},
	commands: {
		"aaaa": async function () {
			return await this.$vm.$invoke('myCommand345'); }
	},
	delegates: {
		"myDelegate": (a, b) => a + b - 7,
		fetchCustomers
	}
};

module.exports = template;


function docNoChanged(this: IRoot) {
	return this.$isNew;
}

function fetchCustomers(this:IRoot, agent, text) {
	let vm = this.$vm;
	return vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
}
