
/* identity/user index template */

const template = {
	properties: {
		"TUser.$Icon"() {
			return this.IsAdmin ? "gear-outline" : null;
		},
		'TUser.$Popover'() { return `/identity/user/popover/${this.Id}`;}
	},
	events: {
	},
	validators: {
	},
	commands: {
		invoke1
	}
};

module.exports = template;

async function invoke1() {
	await this.$ctrl.$invoke('cmd1', { Id: 1 });
}