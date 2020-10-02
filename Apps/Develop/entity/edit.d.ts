
export interface TUser extends IElement {
	Id: number;
	Name: string;
}

export interface TEntity extends IElement {
	Id: number;
	Name: string;
	Article: string;
	Image: number;
	Tag: string;
	Memo: string;
	Unit: TUnit;
	DateCreated: Date;
	DateModified: Date;
	UserCreated: TUser;
	UserModified: TUser;
}

export interface TUnit extends IArrayElement {
	Id: number;
	Name: string;
	Short: string;
}

declare type TUnits = IElementArray<TUnit>;

export interface $TRadioSource {
	Name: string;
	Value: string;
}

export interface TRoot extends IRoot {
	Entity: TEntity;
	Units: TUnits;
	$Date: Date;
	$RadioSource: $TRadioSource;
	$RadioValue: string;
}