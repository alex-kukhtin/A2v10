
/* myClient template */

const tu = require('std:utils').text;

let template = {
    properties: {
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