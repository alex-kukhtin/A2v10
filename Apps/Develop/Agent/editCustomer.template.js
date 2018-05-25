/**
 * edit customer
 */


const template = {
	properties: {
		"TRoot.$Cities": getCities,
		"TRoot.$Streets": getStreets
	},
	events: {
		"Model.load": modelLoad,
		/**
		 * clear dependent values
		 */
		"Agent.Address.Country.change": (addr) => { addr.City = ''; },
		"Agent.Address.City.change": (addr) => { addr.Street = ''; }
	},
	validators: {
		"Agent.Name": 'Введите наименование',
		"Agent.Code":
			{ valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" },
		'Agent.Memo': { valid: 'notBlank', msg: 'Введите примечание', severity:'warning'}
	}
};

function modelLoad(root, caller) {
	const ag = root.Agent;
	if (!ag.$isNew) return;
	ag.Type = 'C';
	ag.Kind = 'Customer';
	if (caller.Agents && caller.Agents.$selected) {
		let parentId = caller.Agents.$selected.Id;
		ag.ParentFolder = parentId;
	}
	if (root.Params && root.Params.Name) {
		ag.Name = root.Params.Name;
	}
}


function duplicateCode(agent, code) {
	var vm = agent.$vm;
	if (!agent.Code)
		return true;
	return vm.$asyncValid('duplicateCode', { Code: agent.Code, Id: agent.Id });
}

function getCities() {
	const root = this;
	let addr = root.Agent.Address;
	let cntry = root.Countries.find(c => c.Code === addr.Country);
	if (!cntry) return null;
	cntry.Cities.$load(); // ensure lazy
	return cntry.Cities;
}

function getStreets() {
	const root = this;
	let addr = root.Agent.Address;
	let cntry = root.Countries.find(c => c.Code === addr.Country);
	if (!cntry) return null;
	let city = cntry.Cities.find(c => c.Name == addr.City);
	if (!city) return null;
	city.Streets.$load(); // ensure lazy
	return city.Streets;
}

module.exports = template;