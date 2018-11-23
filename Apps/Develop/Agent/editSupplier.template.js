/**
 * edit customer
 */


const template = {
	properties: {
		'TRoot.$$tabVisible': Boolean
	},
	events: {
		"Model.load": modelLoad
	},
	validators: {
		"Agent22.Name": 'Введите наименование',
		"Agent.Name": {
			valid: function (ag) {
				return ag.Name === 'W';
			},
			msg: 'warning validator: must be "W"',
			severity: 'info'
		},
		"Agent.Code":
			{ valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" }
	}
};

function modelLoad(root) {
	const ag = root.Agent;
	if (ag.$isNew)
		customerCreate(ag);
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

module.exports = template;