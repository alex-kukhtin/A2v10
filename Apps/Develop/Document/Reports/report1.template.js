
/* report1 template */

const template = {
	properties: {
		'TCustomerArray.$TotalAmount'() {
			return this.reduce((p, c) => p + c.Amount, 0);
		}
	},
	methods: {
	},
	delegates: {
	},
	events: {
    },
	validators: {
    },
    commands: {
    }
};

module.exports = template;