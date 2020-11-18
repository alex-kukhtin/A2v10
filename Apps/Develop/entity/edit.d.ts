
export interface TUser extends IElement {
	Id: number;
	Name: string;
}

export interface TImage extends IElement {
	Id: number;
	Token: string;
}

export interface TEntity extends IElement {
	Id: number;
	Name: string;
	Article: string;
	Image: number;
	Token: string;
	Tag: string;
	Memo: string;
	Unit: TUnit;
	DateCreated: Date;
	DateModified: Date;
	UserCreated: TUser;
	UserModified: TUser;
	FImage: TImage;
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