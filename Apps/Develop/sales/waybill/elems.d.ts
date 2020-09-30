

export interface TAgent extends IElement {
	Id: number
	Name: string
	Code: string;
}

export interface TEntity extends IElement {
	Id: number;
	Name: string;
	Article: string;
	Image: number;
	Unit: TUnit;
}

export interface TUnit extends IElement {
	Id: number
	Short: string;
}

