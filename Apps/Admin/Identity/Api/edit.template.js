
/* identity/api template */

const template = {
	properties: {
	},
	events: {
	},
	validators: {
		'User.Name': 'Введіть назву користувача API'
	},
	commands: {
		refresh,
		copy
	}
};

module.exports = template;


async function refresh() {
	const ctrl = this.$ctrl;
	const result = await ctrl.$invoke('generatekey');
	this.User.Logins.ApiKey.ApiKey = result.Result;
}

function copy(arg) {
	navigator.clipboard.writeText(arg);
	this.$ctrl.$toast('Значення скопійовано до Clipboard', 'success');
}
