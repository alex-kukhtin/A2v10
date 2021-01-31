

export interface TFolder extends IElement {
	Id: number;
	ParentFolder: number;
	Name: string;
}

export interface TParentFolder extends IElement {
	Id: number;
	Name: string;
}

export interface TRoot extends IRoot {
	readonly Folder: TFolder;
	readonly ParentFolder: TParentFolder;
}

