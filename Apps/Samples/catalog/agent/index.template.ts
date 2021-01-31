
import { TRoot, TFolder, TFolders } from 'index.d';

let savedFolderId: number;

const template: Template = {
	properties: {
		'TRoot.$Filter': String,

		'TFolder.$IsSearch'(this: TFolder): boolean { return this.Id === -1; },
		'TFolder.$IsFolder'(this: TFolder): boolean { return this.Id !== -1; },

		'TFolder.$IsVisible'(this: TFolder): boolean {
			return this.$IsFolder || !!this.$root.$Filter;
		}
	},
	events: {
		'Root.$Filter.change': filterChange,
		'Folders[].select': selectionChange
	},
	commands: {
		clearFilter,
		createFolder: {
			exec: createFolder,
			canExec: canExecForFolder
		},
		createSubFolder: {
			exec: createSubFolder,
			canExec: canExecForFolder
		},
		deleteFolder: {
			exec: deleteFolder,
			canExec: canDeleteFolder,
			confirm: 'Ви дійсно бажаєте видалити папку?'
		}
	}
};

export default template;

function filterChange(this: TRoot, elem: TRoot, newVal: string, oldVal: string, propName: string):void {

	const folders = elem.Folders;
	const ctrl = this.$ctrl;
	let srFolder = folders.$find(x => x.Id == -1);

	if (newVal) {
		// пошук є
		if (!savedFolderId) {
			let sel = folders.$selected;
			savedFolderId = sel ? sel.Id : 0;
		}
		srFolder.$select(folders);
		this.$defer(() => {
			ctrl.$setFilter(srFolder.Children, 'Fragment', newVal);
		});
	} else {
		// пошук скинуто, повернемо збережену папку
		srFolder.Children.$resetLazy();
		if (savedFolderId) {
			// повернути збережену папку
			let frItem = folders.$find(x => x.Id === savedFolderId);
			if (frItem)
				frItem.$select(folders);
		}
		savedFolderId = 0;
	}
}


function selectionChange(this: TRoot, folders: TFolders):void {
	let sel = folders.$selected
	if (sel && sel.$IsFolder) {
		savedFolderId = 0;
		this.$Filter = '';
	}
}

function clearFilter(this: TRoot):void {
	this.$Filter = '';
}

function canExecForFolder(this: TRoot, sel: TFolder): boolean {
	return sel && sel.$IsFolder;
}

function createFolder(sel: TFolder):void {
	if (sel.$IsSearch) return;
	alert('top level folder');
}

async function createSubFolder(this: TRoot, parent: TFolder): Promise<any> {
	let ctrl = this.$ctrl;

	if (!parent || parent.$IsSearch) return;

	await ctrl.$expand(parent, 'SubItems', true);

	let elem = await ctrl.$showDialog('/catalog/agent/editFolder', { Id: 0 }, { Parent: parent.Id });
	let fld = parent.SubItems.$append(elem);

	fld.$select(this.Folders);
}

async function deleteFolder(this: TRoot, folder: TFolder): Promise<any> {

	const ctrl = this.$ctrl;

	if (!folder || folder.$IsSearch || !canDeleteFolder(folder)) return;

	//await ctrl.$invoke('deleteFolder', { Id: folder.Id });
	folder.$remove();
}

function canDeleteFolder(folder: TFolder): boolean {
	return folder && folder.$IsFolder && !folder.HasSubItems && folder.Children.$isEmpty;
}