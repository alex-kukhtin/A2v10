
export interface TUnit extends IElement {
	Id: number;
	Short: string;
}
export interface TEntity extends IArrayElement {
	Id: number;
	Name: string;
	Article: string;
	Image: number;
	Memo: string;
	Unit: TUnit;
}

export interface TRoot extends IRoot {
	Entities: IElementArray<TEntity>;
	$Donor: any;
}