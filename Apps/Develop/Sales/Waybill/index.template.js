/*invoice index template*/

const utils = require('std:utils');
const du = utils.date;

const template = {
	properties: {
		'TRoot.$$ColumnVisible': Boolean,
		'TDocument.$Mark': mark,
		'TDocument.$Icon'() { return this.Done ? 'flag-green' : ''; },
		"TDocument.$AgentPopoverUrl": agentPopoverUrl,
		"TDocument.$HasParent"() { return this.ParentDoc.Id !== 0; },
		"TDocParent.$Name": parentName
	},
	commands: {
		clearFilter(f) {
			f.Id = 0;
			f.Name = '';
		}
	}
};


function mark() {
	return this.Done ? "success" : '';
}

function parentName() {
	const doc = this;
	return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, 'Currency')} грн.`;
}

function agentPopoverUrl() {
	const doc = this;
	if (doc.Agent.Id)
		return "/Agent/State/" + doc.Agent.Id;
	return '';
}

module.exports = template;

