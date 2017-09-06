
/* index template */

const template = {
	properties: {
		'TList.Sum'() {
			return this.Vehicles.reduce((p, c) => p + c.Sum, 0);
		}
	},
	methods: {
	},
	delegates: {
	},
	events: {
		'TList.construct'(list) {
			console.dir(this);
			console.dir(list);
		} 
    },
	validators: {
		'Contract.Lists[].Vehicles[].Sum': "Введіть суму"
    },
    commands: {
    }
};

module.exports = template;