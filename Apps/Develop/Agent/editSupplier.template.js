/**
 * edit customer
 */

const eventBus = require('std:eventBus');

function __myEvent(arg) {
	console.dir(this);
	console.dir(arg);
}

const template = {
	properties: {
		'TRoot.$$tabVisible': Boolean,
		'TAgent.$SelectedMime': String
	},
	events: {
		"Model.load": modelLoad,
		"Model.unload": modelUnload
	},
	validators: {
		"Agent.Name": {
			valid: function (ag) {
				return ag.Name === 'W';
			},
			msg: 'warning validator: must be "W"',
			severity: 'info'
		},
		"Agent.Code":
			{ valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" }
	},
	delegates: {
		uploadAttachment
	}
};

function modelLoad(root) {
	const ag = root.Agent;
	if (ag.$isNew)
		customerCreate(ag);
	eventBus.$on('myEvent', __myEvent);
}

function modelUnload(root) {
	console.dir({event: 'unload', root, this_: this });
	eventBus.$off('myEvent', __myEvent);
}

function customerCreate(ag) {
	ag.Kind = 'Supplier';
}

function duplicateCode(agent, code) {
	var vm = agent.$vm;
	if (!agent.Code)
		return true;
	return vm.$asyncValid('duplicateCode', { Code: agent.Code, Id: agent.Id });
}


function uploadAttachment(result) {
	console.dir(this);
	console.dir(result);
	let coll = this.Agent.Attachments;
	for (let i = 0; i < result.length; i++)
		coll.$append(result[i]);
}
module.exports = template;
