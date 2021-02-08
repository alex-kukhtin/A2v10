
import { TRoot, TFolder, TFolders, TAgent, TAgents } from 'index.d';

let savedFolderId: number;

/*TODO:
 * 1. Убрать папку поиска в дереве выбора.
 * 2. Сделать перемещение папок в дереве (editFolder)
 * 3. Сделать поиск папки в дереве
 * 4. Сделать поиск по вхождению в диалоге
*/


const template: Template = {
	properties: {
		'TRoot.$Filter': String,
		'TRoot.$IsSeachFolder'(this: TRoot) { return this.Folders.$selected.$IsSearch; },

		'TFolder.$IsSearch'(this: TFolder): boolean { return this.Id === -1; },
		'TFolder.$IsFolder'(this: TFolder): boolean { return this.Id !== -1; },

		'TFolder.$IsVisible'(this: TFolder): boolean {
			return this.$IsFolder || !!this.$root.$Filter;
		},
		// это свойство нужно, чтобы передавать его как Data в команду создания чего-нибудь
		'TRoot.$ParentFolderData'(this: TRoot): object {
			let sel: TFolder = this.Folders.$selected;
			return sel ? { Parent: sel.Id } : {};
		}
	},
	events: {
		'Model.load': modelLoad,
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
		},
		editItem: {
			exec: editItem,
			canExec(this: TRoot, arr: TAgents): boolean { return !!arr && !!arr.$selected; }
		},
		gotoFolder,
		test
	}
};

export default template;


function createModelInfo(root: TRoot, arr: TAgents): IModelInfo {

	/* Нужно создать значение ModelInfo для дочерних элементов в папке поиска (Id=-1).
	   Его не будет до первого обращения, поэтому создаем в ТОЧНОМ
	   соответствии со значениями "по умолчанию" из базы данных
	 */

	return root.$createModelInfo(arr, {
		Filter: {
			Fragment:null
		},
		PageSize: 10,
		Offset: 0,
		SortDir: SortDir.asc,
		SortOrder: 'name'
	});
}

async function modelLoad(this: TRoot) {
	const ctrl = this.$ctrl;
	let srFolder = this.Folders.$find(x => x.Id == -1);
	createModelInfo(this, srFolder.Children);
}

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

		srFolder.Children.$ModelInfo.Filter.Fragment = newVal;
		ctrl.$reload(srFolder.Children);

		/*
		this.$defer(() => {
			srFolder.Children.$ModelInfo.Filter.Fragment = newVal;
			ctrl.$reload(srFolder.Children);
			// установка фильтра нужна в следущем "тике".
			//ctrl.$setFilter(srFolder.Children, 'Fragment', newVal);
		});
		*/
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

// TODO: remove
async function test() {
	let path = [112, 113, 128, 130];
	let folders = this.Folders;
	let l1: TFolder = folders.$find(itm => itm.Id == path[0]);
	let selectedElem: TFolder = await l1.$selectPath<TFolder>(path, (itm, num) => itm.Id == num);
	console.dir(selectedElem);
	if (selectedElem)
		selectedElem.$select(folders);
}

// TODO: remove
async function selectFolder() {
	let folders = this.Folders;
	let fld = folders.$find(itm => itm.Id == 101);
	await fld.$expand();
	let f103 = folders.$find(itm => itm.Id == 103);
	f103.$select(folders);
}

//<Button Icon="Edit" Command = "{BindCmd Dialog, Action=EditSelected, Url={StaticResource EditItemUrl}, Argument={Bind Folders.Selected(Children)}}" />

async function editItem(this: TRoot, arr: TAgents): Promise<any> {
	const ctrl = this.$ctrl;
	if (!arr || !arr.$selected) return;

	let ag: TAgent = arr.$selected;
	let oldParent: number = ag.ParentFolder.Id;

	let result = await ctrl.$showDialog('/catalog/agent/editItem', ag);
	let newParent:number = result.ParentFolder.Id;
	if (newParent == oldParent) {
		// в той же папке, просто обновляем свойства
		ag.$merge(result);
	} else {
		// в другой папке, убираем из текущего, добавляем в новый
		ag.$remove();
		// находим родительскую папку
		let nf = this.Folders.$find(x => x.Id === newParent);
		if (nf != null) {
			// нашли родительскую и в ней уже загружены Children, просто добавляем в список
			if (nf.Children.$loaded)
				nf.Children.$append(result);
		}
	}
}

async function gotoFolder(this: TRoot, agent: TAgent): Promise<any> {
	const ctrl = this.$ctrl;

	function findAgent(arr: TAgents) {
		let ag = arr.$find(a => a.Id == agent.Id);
		if (ag) {
			console.dir(ag);
			ag.$select();
			return ag;
		}
		return null;
	}

	async function findAgentOffset(folder, mi): Promise<number> {
		// TODO:? блокировать на время одного обращения? или вообще блокировать?
		folder.Children.$lockOnce = true;
		let res = await ctrl.$invoke('findIndex', { Id: agent.Id, Parent: folder.Id, Order: mi.SortOrder, Dir: mi.SortDir });
		if (res && res.Result) {
			let ix: number = res.Result.RowNo;
			// это индекс в списке. Он будет на странице 
			let pageNo = Math.floor(ix / mi.PageSize);
			return pageNo * mi.PageSize;
		}
		return -1;
	}

	// переход к родительской папке в дереве
	const parentFolder = agent.ParentFolder.Id;
	const folders = this.Folders;

	let fld: any = folders.$find(itm => itm.Id == parentFolder);
	let path = [];
	if (fld != null) {
		// нашли папку, значит она уже есть. Соберем в массив родителей
		while (fld && fld != this) {
			path.push(fld.Id);
			fld = fld.$parent.$parent;
		}
		path = path.reverse();
	} else {
		// папки в дереве (которое в памяти) нету, идем на сервер и получаем путь в дереве
		let result = await ctrl.$invoke('getPath', { Id: agent.ParentFolder.Id });
		if (result && result.Result)
			path = result.Result.map(x => x.Id);
	}

	if (!path.length) return; // нету пути, просто уйдем

	// выделим найденную папку в дереве, потом найденный элемент в списке
	let l1: TFolder = folders.$find(itm => itm.Id == path[0]);
	let selFolder: TFolder = await l1.$selectPath<TFolder>(path, (itm, num) => itm.Id === num);
	if (!selFolder) return; // что-то пошло не так. Элемента нету.
	selFolder.$select(folders);
	let ch = selFolder.Children;
	if (ch.$loaded) {
		let ag = findAgent(ch);
		if (!ag) {
			/* элемент не найден, возможно он на другой странице
			   найдем смещение в базе. в соотвтествии с текущим фильтром
			   перезагружаем коллекцию с новым фильтром
			*/
			let mi = createModelInfo(this, ch);
			let offset = await findAgentOffset(selFolder, mi);
			if (offset == -1)
				return;
			mi.Offset = offset;
			await ch.$reload();
			findAgent(ch);
		}
	}
	else {
		// дочерние еще не загружались или сброшены. Ищем нужную страницу
		console.dir('новая загрузка')
		let mi = createModelInfo(this, ch);
		// TODO: мигает. при обращении к Invoke перезаполняется Lazy со значением "по умолчанию"
		//ch.$lockUpdate(true);
		let offset = await findAgentOffset(selFolder, mi);
		if (offset == -1)
			return;
		mi.Offset = offset;
		//ch.$lockUpdate(false);
		console.dir('offset: ' + offset);
		await ch.$reload();
		findAgent(ch);
	}
}