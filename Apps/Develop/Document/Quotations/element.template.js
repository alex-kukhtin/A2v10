
/* index template */

let template = {
    properties: {
	},
	methods: {
	},
	delegates: {
	},
	events: {
		'TList.construct'(list) {
			console.dir(list);
		} 
    },
    validators: {
    },
    commands: {
    }
};

module.exports = template;