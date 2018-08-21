/**
 * edit customer
 */


const template = {
	properties: {
		"TRoot.$Cities": getCities,
		"TRoot.$Streets": getStreets,
		'TAgent.$Page0Valid': isPage0Valid,
		'TAgent.$Page3Valid': isPage3Valid,
		'TAgent.$Bit1': Boolean,
		'TAgent.$Mask'() {
			return this.$Bit1 ? '### ### ###' : '+38 (0##) ###-##-##';
		},
		'TAgent.$Placeholder'() {
			return this.$Bit1 ? '000 000 000' : '+38 (000) 000-00-00';
		}
	},
	events: {
		"Model.load": modelLoad,
		/*
		 * clear dependent values
		 */
		"Agent.Address.Country.change": (addr) => { addr.City = ''; addr.Street = ''; },
		"Agent.Address.City.change": (addr) => { addr.Street = ''; }
	},
	validators: {
		"Agent.Name": 'Введите наименование',
		"Agent.Code": [
			'Введите код',
			{ valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" }
		],
		'Agent.Memo': { valid: 'notBlank', msg: 'Введите примечание', severity:'warning'},
		'Agent.Address.Build': 'Введите номер дома'
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

function isPage0Valid() {
	return !!this.Name;
}

function isPage3Valid() {
	return this.Name === 'VALID';
}

module.exports = template;