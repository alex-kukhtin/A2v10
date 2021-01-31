
import { TFolder, TParentFolder, TRoot } from 'folder.d';

const template: Template = {
	validators: {
		'Folder.Name': StdValidator.notBlank
	},
	events: {
		'Model.load': modelLoad
	}

};

function modelLoad(this: TRoot, root: TRoot) {
	let folder = root.Folder;
	if (folder.$isNew)
		folder.ParentFolder = root.ParentFolder.Id;
}

export default template;
