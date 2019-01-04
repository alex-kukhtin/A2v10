/*report template*/

const template = {
	properties: {
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

