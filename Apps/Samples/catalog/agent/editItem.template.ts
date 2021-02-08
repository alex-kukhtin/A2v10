
import { TAgent, TParentFolder, TRoot } from 'item.d';

const template: Template = {
	validators: {
		'Agent.Name': StdValidator.notBlank
	},
	events: {
		'Model.load': modelLoad
	}

};

function modelLoad(this: TRoot, root: TRoot) {
	let agent = root.Agent;
	if (agent.$isNew)
		agent.ParentFolder.$set(root.ParentFolder);
}

export default template;
