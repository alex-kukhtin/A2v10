/*report template*/

const template = {
	properties: {
		'TData.$Mark'() { return this.Id === 129 ? 'error bold': undefined; }
	},
	validators: {
	},
	events: {
	},
	commands: {
	},
	delegates: {
		fetchCustomers
	}
};

module.exports = template;


function fetchCustomers(agent, text) {
	var vm = this.$vm;
	return vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
}

