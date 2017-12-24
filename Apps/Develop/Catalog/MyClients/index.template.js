
/* myClient template */

const tu = require('std:utils').text;
const du = require('std:utils').date;

let template = {
    properties: {
        'TClient.$Mark': getMark,
        'TClient.$Icon': getIcon,
        'TReport.$Argument': getReportArgument
    },
    events: {
    },
    validators: {
    },
    delegates: {
        Filter
    },
    commands: {
        TestDocuments
    }
};

function getMark() {
    return this.Id < 102 ? 'info' : '';
}

function getIcon() {
    return this.Id < 102 ? "user" : 'file';
}

function getReportArgument() {
    return { Id: this.Id, AgentId: this.$parent.$parent.Id, StartDate: du.today() };
}

function TestDocuments() {
	// THIS = root
    let arr = this.Clients.Selected('Documents');
    if (!arr)
        return;
    console.warn('init:' + arr.length);
    arr.$loadLazy().then(() => console.warn('then:' + arr.length));
}

function Filter(val, filter) {
    return tu.containsText(val, 'Name,Id', filter.Fragment);
}

module.exports = template;