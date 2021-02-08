
export interface TParentFolder extends IElement {
	Id: number;
	Name: string;
}

export interface TAgent extends IArrayElement {
	Id: number;
	Name: string;
	ParentFolder: TParentFolder
}

declare type TAgents = IElementArray<TAgent>;

export interface TFolder extends ITreeElement {
	Id: number;
	Name: string;
	Icon: string;
	readonly SubItems: TFolders;
	readonly Children: TAgents;
	HasSubItems: boolean;

	readonly $root: TRoot;
	readonly $IsFolder: boolean;
	readonly $IsSearch: boolean;

	readonly $parent: TFolders;
}

declare type TFolders = IElementArray<TFolder>;

export interface TRoot extends IRoot {
	readonly Folders: TFolders;
	$Filter: string;
}

