

export interface TDocument extends IArrayElement {
	Id: number;
	IdLong: number;
	IdShort: number;
	Date: Date;
	Date2: Date;
	Sum: number;
	SumFloat: number;
	AgentName: string;
	Memo: string;
	Done: boolean;
}

export interface TRoot extends IRoot {
	Documents: IElementArray<TDocument>;
}

