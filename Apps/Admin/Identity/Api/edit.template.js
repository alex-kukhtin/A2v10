
/* identity/api template */

const template = {
	properties: {
		/* TEMPORARY */
		'TUser.ClientId'() { return this.Logins.ApiKey.ClientId; },
		'TUser.ApiKey'() { return this.Logins.ApiKey.ApiKey; },
		'TUser.AllowIP'() { return this.Logins.ApiKey.AllowIP; }
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

function copy() {
	navigator.clipboard.writeText(this.User.Logins.ApiKey.ApiKey);
	this.$ctrl.$msg('Ключ скопійовано до Clipboard');
}
