
import { TRoot, TFolder, TFolders, TAgent, TAgents } from 'index.d';

let savedFolderId: number;

const template: Template = {
	properties: {
		'TRoot.$Filter': String,

		'TFolder.$IsSearch'(this: TFolder): boolean { return this.Id === -1; },
		'TFolder.$IsFolder'(this: TFolder): boolean { return this.Id !== -1; },

		'TFolder.$IsVisible'(this: TFolder): boolean {
			return this.$IsFolder || !!this.$root.$Filter;
		},
		// это свойство нужно, чтобы передавать его как Data в команду создания чего-нибудь
		'TRoot.$ParentFolderData'(this: TRoot) {
			let sel = this.Folders.$selected;
			return sel ? { Parent: sel.Id } : {};
		}
	},
	events: {
		'Root.$Filter.change': filterChange,
		'Folders[].select': selectionChange
	},
	commands: {
		clearFilter,
		createFolder: {
			exec: createFolder
		},
		createSubFolder: {
			exec: createSubFolder,
			canExec: canExecForFolder
		},
		deleteFolder: {
			exec: deleteFolder,
			canExec: canDeleteFolder,
			confirm: 'Ви дійсно бажаєте видалити папку?'
		},
		deleteItem: {
			exec: deleteItem,
			canExec(this:TRoot, arr: TAgents): boolean { return !!arr && !!arr.$selected; },
			confirm: 'Ви дійсно бажаєте видалити контрагента?'
		}
	}
};

export default template;

function filterChange(this: TRoot, elem: TRoot, newVal: string, oldVal: string, propName: string):void {

	const folders = elem.Folders;
	const ctrl = this.$ctrl;

	// папка результатов поиска
	let srFolder = folders.$find(x => x.Id == -1);

	if (newVal) {
		// ввели значение текста для поиска
		if (!savedFolderId) {
			let sel = folders.$selected;
			savedFolderId = sel ? sel.Id : 0;
		}
		srFolder.$select(folders);
		this.$defer(() => {
			// установка фильтра нужна в следущем "тике".
			ctrl.$setFilter(srFolder.Children, 'Fragment', newVal);
		});
	} else {
		// поиск сбросили, вернем все в первоначальное состояние
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
		// если выделили не результат поиска
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

async function createFolder(this: TRoot, parent: TFolder): Promise<any> {
	const ctrl = this.$ctrl;
	if (parent && parent.$IsSearch) return;
	// создаем новую папку в диалоге (родителя нет)
	let elem = await ctrl.$showDialog('/catalog/agent/editFolder');
	// и добавляем ее в дочерние элементы основной модели ПЕРЕД папкой поиска
	let searchFolder = this.Folders.$find(x => x.Id === -1);
	let fld = this.Folders.$insert(elem, InsertTo.above, searchFolder);
	// делаем ее выделенной
	fld.$select(this.Folders);
}

async function createSubFolder(this: TRoot, parent: TFolder): Promise<any> {
	const ctrl = this.$ctrl;

	// нельзя создавать в папке результатов
	if (!parent || parent.$IsSearch) return;

	// сначала развернем родительский узел
	await ctrl.$expand(parent, 'SubItems', true);

	// создаем новую папку в диалоге
	let elem = await ctrl.$showDialog('/catalog/agent/editFolder', { Id: 0 }, { Parent: parent.Id });

	// и добавляем ее в дочерние элементы родителя
	let fld = parent.SubItems.$append(elem);

	// делаем ее выделенной
	fld.$select(this.Folders);
}

async function deleteFolder(this: TRoot, folder: TFolder): Promise<any> {
	const ctrl = this.$ctrl;
	if (!folder || folder.$IsSearch || !canDeleteFolder(folder)) return;

	await ctrl.$invoke('deleteFolder', { Id: folder.Id });

	folder.$remove();
}

function canDeleteFolder(folder: TFolder): boolean {
	return folder && folder.$IsFolder && !folder.HasSubItems && folder.Children.$isEmpty;
}

async function deleteItem(this: TRoot, arr: TAgents) {
	const ctrl = this.$ctrl;
	if (!arr || !arr.$selected) return;

	await ctrl.$invoke('deleteItem', { Id: arr.$selected.Id });

	arr.$selected.$remove();
}