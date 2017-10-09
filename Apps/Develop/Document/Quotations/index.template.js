
/* index template */

let template = {
	properties: {
		"Contract.$Sum"() {
			return this.Sum > 100000 ? 'Больше 100 000' : 'Меньше 100 000';
		}
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
    },
	methods: {
	},
	delegates: {
		filter: doFilter
	}
};

function doFilter(item, filter) {
	return true;
}

module.exports = template;
