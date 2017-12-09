
/* index template */

let template = {
	properties: {
        "TInbox.$HasDetails"() {
            return this.Id >= 125;
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
