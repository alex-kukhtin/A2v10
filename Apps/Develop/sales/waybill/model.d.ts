
export interface TAgent extends IElement {
	Id: number;
	Name: string;
	Memo: string;
}

export interface TRow extends IArrayElement {
	Qty: number;
	Price: number;
	// computed
	Sum: number;
	$root: TRoot;
}

export interface TParentDoc extends IElement {
	Id: number;
}

export interface TDocument extends IElement {
	Id: number;
	Date: Date;
	Done: boolean;
	No: number;
	Agent: TAgent;
	ParentDoc: TParentDoc;
	Rows: IElementArray<TRow>;
	// computed
	$HasParent: boolean,
	Sum: number
}

export interface TInbox extends IElement {
	Id: number;
}

export interface TRoot extends IRoot {
	Document: TDocument;
	Inbox: TInbox;
	// dynamic
	$Answer: string;
}