
import { TAgent, TEntity } from "elems.d";


export interface TUnit extends IElement {
	Id: number;
	Short: string;
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


export interface TDocument extends IElement {
	Id: number;
	Date: Date;
	No: number;
	Kind: string;
	Tag: string;
	Memo: string;
	Sum: number;
	Logo: Blob;
	Agent: TAgent;
	DepFrom: TAgent;
	DepTo: TAgent;
	DateCreated: Date;
	DateModified: Date;
	UserCreated: TUser;
	UserModified: TUser;
	Rows: IElementArray<TRow>;
}

export interface TUser extends IElement {
	Id: number;
	Name: string;
}


export interface TRoot extends IRoot {
	Document: TDocument;
}