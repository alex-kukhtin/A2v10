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
		},
		DeleteFolder: {
			exec: deleteFolder
		}
	},
	events: {
		'Agents[].Children.load'(x) {
			console.log('Agents[].Children.load', this, x);
		},
		'Agents[].SubItems[].Children.load'(x) {
			console.log('Agents[].SubItems[].Children.load', this, x);
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
	try {
		console.dir('start');
		const vm = folder.$vm;
		let data = await vm.$showDialog('/Agent/EditFolder', folder, null, {});

		console.dir('dialog result:' + data);
		folder.Name = data.Name;
		console.dir('set memo');
		//folder.Memo = data.Memo;
	}
	catch (x) {
		console.dir('catch in template:' + x);
	}
	finally {
		console.dir('finally in template');
	}
}


function deleteFolder(folder) {
	folder.$remove();
}

module.exports = template;

