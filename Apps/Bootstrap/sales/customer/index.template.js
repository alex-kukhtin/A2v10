/*customer index template*/


const template = {
	properties: {
		"TRoot.$SelectedItem"() {
			let x = this.Agents.Selected('Children');
			return x ? x.$selected : null;
		},
		"TAgent.$EditUrl"() { return '/Agent/EditCustomer';}
	},
	commands: {
		'AddFolder': {
			exec: addFolder
		},
		'AddTopFolder': {
			exec: addTopFolder
		},
		'EditFolder': {
			exec: editFolder
		}
	}
};


async function addFolder(agents) {
	const vm = agents.$vm;
	let data = await vm.$showDialog('/Agent/EditFolder');
	let item = agents.$selected;
	let newFolder = item.SubItems.$new(data);
	newFolder.Icon = 'folder';
	item.HasSubItems = true;
	item.SubItems.push(newFolder);
}

async function addTopFolder(agents) {
	const vm = agents.$vm;
	let data = await vm.$showDialog('/Agent/EditFolder');
	let newFolder = agents.$append(data);
	newFolder.Icon = 'folder';
}

async function editFolder(folder) {
	if (!folder) return;
	const vm = folder.$vm;
	let data = await vm.$showDialog('/Agent/EditFolder', folder);
	folder.Name = data.Name;
	folder.Memo = data.Memo;
}


module.exports = template;

