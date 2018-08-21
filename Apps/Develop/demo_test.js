

const template = {
	commands: {
		"Agent.Country.change": countryChange
	}
};

async function countryChange(agent) {
	const vm = agent.$vm;
	const root = agent.$root;
	let result = await vm.$invoke('loadCities', { Country: agent.Country.Code }, '/common/agent');
	console.dir(result);
	// находим нужную страну в общем списке стран и присваиваем ей полученный список городов
	root.Coutries.find(c => c.Code === agent.Country.Code).Cities = result.Cities;
}

// Остальные вложенные так-же
