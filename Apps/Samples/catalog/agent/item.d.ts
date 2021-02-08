

export interface TAgent extends IElement {
	Id: number;
	ParentFolder: TParentFolder;
	Name: string;
	Code: string;
	Memo: string
}

export interface TParentFolder extends IElement {
	Id: number;
	Name: string;
}

export interface TRoot extends IRoot {
	readonly Agent: TAgent;
	readonly ParentFolder: TParentFolder;
}

