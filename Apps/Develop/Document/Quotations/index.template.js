
/* index template */

let template = {
	properties: {
		"Contract.$Sum"() {
			return this.Sum > 100000 ? 'Больше 100 000' : 'Меньше 100 000';
		}
	},
	methods: {
	},
	delegates: {
	},
	events: {
		'TRoot.construct'(me) {
			me.Options = {
				GroupBy: null
			};
		}
    },
    validators: {
    },
    commands: {
    }
};

module.exports = template;