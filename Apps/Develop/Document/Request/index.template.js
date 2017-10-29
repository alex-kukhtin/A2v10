
/* index template */

const url = require('std:url');

const template = {
	properties: {
        'Document.Url': () => '/document/request/edit',
        "Document.$AgentPopoverUrl": getAgentPopoverUrl
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

function getAgentPopoverUrl() {
    const doc = this;
    if (doc.Agent.Id) {
        let qs = url.makeQueryString({ DocumentId: doc.Id });
        return `/catalog/customers/demo/${doc.Agent.Id}${qs}`;
    }
    return '';
}

module.exports = template;
