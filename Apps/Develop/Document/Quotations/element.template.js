
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
			// console.dir(this); !!undefined
			console.dir(list);
		} 
    },
	validators: {
		'Contract.Lists[].Vehicles[].Sum': "Введіть суму",
		'Contract.Lists[].Vehicles[].Volume': "Введіть об'єм двигуна",
		'Contract.DateFrom': "Введите дату начала"
    },
    commands: {
    }
};

module.exports = template;