
import { TAgent, TEntity } from "elems.d";

export interface TUnit extends IElement {
	Id: number;
	Short: string;
}

export interface TMerge extends IElement {
	Id: number;
	Kind: string;
	Date: Date;
	No: number;
	Sum: number;
	Tag: string;
	Memo: string;
	Done: boolean;
	DateCreated: Date;
	DateModified: Date;
}

export interface TRow extends IArrayElement {
	Id: number;
	RowNo: number;
	Entity: TEntity;
	Qty: number;
	Price: number;
	// computed
	Sum: number;
	$root: TRoot;
	$BrowseParams: object;
}

export interface TDocParent extends IElement {
	Id: number;
	No: number;
	Date: Date;
	Sum: number;
	$Name: string;
}

export interface TDocument extends IElement {
	Id: number;
	Date: Date;
	Done: boolean;
	No: number;
	Kind: string;
	Tag: string;
	Memo: string;
	Agent: TAgent;
	DepFrom: TAgent;
	DepTo: TAgent;
	DateCreated: Date;
	DateModified: Date;
	UserCreated: TUser;
	UserModified: TUser;
	Shipment: IElementArray<TDocLink>;
	ParentDoc: TDocParent;
	Rows: IElementArray<TRow>;
	// computed
	$HasParent: boolean;
	Sum: number;
	$Date: Date;
	$DateEnd: Date;
	$Interval: Date;
}

export interface TUser extends IElement {
	Id: number;
	Name: string;
}

export interface TDocLink extends IElement {
	Id: number;
	No: number;
	Date: Date;
	Sum: number;
	Done: boolean;
}

export interface TRoot extends IRoot {
	Document: TDocument;
	Warehouses: IElementArray<TAgent>;
	Meged: TMerge;
	// dynamic
	$Answer: string;
	$Collapsed: boolean;
	$BarCode: string;
	$HasInbox: boolean;
}