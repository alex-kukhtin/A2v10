/**
 * edit customer
 */


const template = {
	events: {
		"Model.load": modelLoad
	},
	validators: {
		"Agent.Name": 'Введите наименование'
	},
	commands: {
		wait
	}
};

function modelLoad(root, caller) {
	const ag = root.Agent;
	let parentId = caller.Agents.$selected.Id;
	if (ag.$isNew)
		customerCreate(ag, parentId);
}

function customerCreate(ag, parentId) {
	ag.Kind = 'Customer';
	ag.ParentFolder = parentId;
	ag.Folder = true;
}

async function wait()
{
	let r = await this.$ctrl.$invoke('wait', null, '\dashboard');
}

module.exports = template;