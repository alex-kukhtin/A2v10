
/* index template */

const template = {
	properties: {
		'TRoot.$comment': String
	},
	delegates: {
		onKeyPress
	},
	commands: {
		enterComment: {
			canExec() { return this.$comment; },
			exec: onKeyPress
		},
		testCommand: {
			exec() { alert('command'); },
			canExec() { return this.Agents.$selected; }
		}
	}
};

module.exports = template;


function onKeyPress() {
	console.dir(this);
	let cmnt = this.$comment;
	console.dir(cmnt);
	let ag = this.Agents.$append();
	ag.Name = cmnt;
	ag.Memo = 'Ви';
	ag.Id = 2233;
	this.$comment = '';
}