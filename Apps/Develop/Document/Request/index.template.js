
/* index template */

const template = {
	properties: {
		'Document.Url': () => '/document/request/edit'
	},
    events: {
    },
    validators: {
    },
    commands: {
    },
	methods: {
	},
	delegates: {
		Filter: doFilter
	}
};

function doFilter(item, filter) {
	return item.SNo.indexOf(filter.Filter) != -1;
}

module.exports = template;
