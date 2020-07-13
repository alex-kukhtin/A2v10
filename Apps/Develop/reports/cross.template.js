/*report template*/

const template = {
	properties: {
		'TCross.$BkColor'() { return this.Wd == 6 ? '#ffcccc2f' : this.Wd == 7 ? "#ffbbbb3f" : undefined; }
	},
	validators: {
	},
	events: {
	},
	commands: {
	},
	delegates: {
	}
};

module.exports = template;


