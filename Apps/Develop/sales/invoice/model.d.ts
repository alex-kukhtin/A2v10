

interface TAgent extends IElement {
	Id: number,
	Name: string,
	Memo: string
}

interface TRow extends IElement {
	Qty: number;
	Price: number;
	Sum: number;
}

interface TDocument extends IElement {
	Id: number;
	Date: Date;
	Done: boolean;
	Memo: string;
	Sum: number;
	Agent: TAgent;
	Rows: TRow[];
}

interface TRoot extends IRoot {
	Document: TDocument;
}