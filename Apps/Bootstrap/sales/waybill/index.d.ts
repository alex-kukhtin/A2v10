

export interface TAgent extends IElement {
	Id: number
	Name: string
}

export interface TDocParent extends IElement {
	Id: number;
	No: number;
	Date: Date;
	Sum: number;
	Kind: string;
}

export interface TDocument extends IArrayElement {
	Id: number;
	Date: Date;
	No: number;
	Sum: number;
	Memo: string;
	Agent: TAgent;
	DepFrom: TAgent;
	DepTo: TAgent;
	Done: boolean;
	ParentDoc: TDocParent;
	Links: IElementArray<TDocLink>;
	Attachments: IElementArray<TAttachment>;
	DateCreated: Date;
	DateModified: Date;
}

export interface TAttachment extends IElement {
	Id: number;
	Token: string;
}

export interface TDocLink extends IElement {
	Id: number;
	No: number;
	Date: Date;
	Sum: number;
	Kind: string;
}

export interface TRoot extends IRoot {
	Documents: IElementArray<TDocument>;
	$BrowseData: any;
	$SelectedDoc: TDocument;
}